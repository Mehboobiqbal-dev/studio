/**
 * Background AI Content Generator
 * Automatically generates conspiracy theories continuously
 */

import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

let isGenerating = false;
let generationInterval: NodeJS.Timeout | null = null;

interface GenerationStats {
  lastGeneration: Date | null;
  totalGenerated: number;
  errors: number;
}

const stats: GenerationStats = {
  lastGeneration: null,
  totalGenerated: 0,
  errors: 0,
};

/**
 * Generate a single post for a random topic
 */
async function generateSinglePost(): Promise<boolean> {
  if (isGenerating) {
    return false;
  }

  isGenerating = true;

  try {
    // Get current and historical topics
    let allTopics: Array<{ name: string; type: string }> = [];
    
    try {
      // Try to fetch from API (if available)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
      const currentResponse = await fetch(`${baseUrl}/api/ai/current-topics?type=current`).catch(() => null);
      const historicalResponse = await fetch(`${baseUrl}/api/ai/current-topics?type=historical`).catch(() => null);
      
      if (currentResponse) {
        const currentData = await currentResponse.json();
        allTopics.push(...(currentData.topics || []));
      }
      
      if (historicalResponse) {
        const historicalData = await historicalResponse.json();
        allTopics.push(...(historicalData.topics || []));
      }
    } catch (error) {
      console.error('Error fetching topic lists:', error);
    }

    // If no topics from API, use default list
    if (allTopics.length === 0) {
      allTopics = [
        { name: 'COVID-19', type: 'current' },
        { name: 'Climate Change', type: 'current' },
        { name: 'Artificial Intelligence', type: 'current' },
        { name: 'Moon Landing', type: 'historical' },
        { name: 'JFK Assassination', type: 'historical' },
        { name: '9/11', type: 'historical' },
      ];
    }

    // Shuffle and pick random topic
    const shuffled = allTopics.sort(() => 0.5 - Math.random());
    const selectedTopic = shuffled[0];

    if (!selectedTopic) {
      return false;
    }

    const topicName = selectedTopic.name;
    const isHistorical = selectedTopic.type === 'historical';

    const topicsCollection = await getCollection<Topic>('topics');
    const postsCollection = await getCollection<Post>('posts');

    // Find or create topic
    const topicSlug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let topic = await topicsCollection.findOne({ slug: topicSlug });

    if (!topic) {
      const newTopic: Omit<Topic, '_id'> = {
        name: topicName,
        slug: topicSlug,
        description: `Conspiracy theories and opinions about ${topicName}`,
        postCount: 0,
        followerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const topicResult = await topicsCollection.insertOne(newTopic as Topic);
      topic = { ...newTopic, _id: topicResult.insertedId } as Topic;
    }

    // Check if we generated recently (last 6 hours)
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    const recentPost = await postsCollection.findOne({
      topicId: topic._id,
      isAIGenerated: true,
      createdAt: { $gte: sixHoursAgo },
    });

    if (recentPost) {
      console.log(`[Background Generator] Skipping ${topicName} - generated recently`);
      return false;
    }

    // Generate theory
    console.log(`[Background Generator] Generating theory for: ${topicName}`);
    const aiResult = await generateConspiracyTheory({
      topic: topicName,
      context: topic.description,
      historical: isHistorical,
    });

    // Generate unique slug
    const baseSlug = generateSlug(aiResult.title);
    let slug = baseSlug;
    let slugExists = await postsCollection.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await postsCollection.findOne({ slug });
      counter++;
    }

    // Create post
    const newPost: Omit<Post, '_id'> = {
      title: aiResult.title,
      content: aiResult.content,
      type: 'conspiracy',
      topicId: topic._id,
      topicSlug: topic.slug,
      authorId: undefined,
      isAIGenerated: true,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      views: 0,
      tags: aiResult.tags,
      slug,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      excerpt: aiResult.excerpt,
    };

    const result = await postsCollection.insertOne(newPost as Post);
    
    // Update topic post count
    await topicsCollection.updateOne(
      { _id: topic._id },
      { $inc: { postCount: 1 } }
    );

    stats.lastGeneration = new Date();
    stats.totalGenerated++;
    
    console.log(`[Background Generator] ✓ Generated: ${aiResult.title} (Total: ${stats.totalGenerated})`);
    return true;
  } catch (error: any) {
    console.error('[Background Generator] Error:', error);
    stats.errors++;
    return false;
  } finally {
    isGenerating = false;
  }
}

/**
 * Start automatic background generation
 * Generates a new post every 30 minutes (configurable)
 */
export function startBackgroundGeneration(intervalMinutes: number = 30) {
  if (generationInterval) {
    console.log('[Background Generator] Already running');
    return;
  }

  console.log(`[Background Generator] Starting automatic generation (every ${intervalMinutes} minutes)`);
  
  // Generate immediately on start
  generateSinglePost().catch(console.error);

  // Then generate on interval
  generationInterval = setInterval(() => {
    generateSinglePost().catch(console.error);
  }, intervalMinutes * 60 * 1000);
}

/**
 * Stop automatic background generation
 */
export function stopBackgroundGeneration() {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
    console.log('[Background Generator] Stopped');
  }
}

/**
 * Get generation statistics
 */
export function getGenerationStats(): GenerationStats {
  return { ...stats };
}

/**
 * Manually trigger a single generation
 */
export async function triggerGeneration(): Promise<boolean> {
  return generateSinglePost();
}



