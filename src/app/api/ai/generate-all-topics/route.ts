import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// This endpoint generates conspiracy theories for ALL topics (current and historical)
// Should be called by a cron job daily or multiple times per day
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.AI_GENERATION_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const topicsCollection = await getCollection<Topic>('topics');
    const postsCollection = await getCollection<Post>('posts');

    // Get all topics
    const allTopics = await topicsCollection.find({}).toArray();
    
    // Get current and historical topics from the predefined list
    let currentTopicsData = { topics: [] };
    let historicalTopicsData = { topics: [] };
    
    try {
      const currentTopicsResponse = await fetch(`${request.nextUrl.origin}/api/ai/current-topics?type=current`);
      const historicalTopicsResponse = await fetch(`${request.nextUrl.origin}/api/ai/current-topics?type=historical`);
      
      currentTopicsData = await currentTopicsResponse.json();
      historicalTopicsData = await historicalTopicsResponse.json();
    } catch (error) {
      console.error('Error fetching topic lists:', error);
    }
    
    const allTopicNames = new Set<string>();
    
    // Add existing topics
    allTopics.forEach(topic => allTopicNames.add(topic.name));
    
    // Add current topics
    currentTopicsData.topics?.forEach((t: any) => allTopicNames.add(t.name));
    
    // Add historical topics
    historicalTopicsData.topics?.forEach((t: any) => allTopicNames.add(t.name));

    const generatedPosts = [];
    const errors = [];

    // Generate for each topic
    for (const topicName of Array.from(allTopicNames)) {
      try {
        // Find or create topic
        const topicSlug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let topic = await topicsCollection.findOne({ slug: topicSlug });

        if (!topic) {
          // Create new topic
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

        // Check if we already generated a post for this topic today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const recentPost = await postsCollection.findOne({
          topicId: topic._id,
          isAIGenerated: true,
          createdAt: { $gte: today },
        });

        if (recentPost) {
          console.log(`Skipping ${topicName} - already generated today`);
          continue;
        }

        // Determine if it's historical
        const isHistorical = historicalTopicsData.topics?.some((t: any) => t.name === topicName);

        // Generate conspiracy theory
        console.log(`Generating theory for: ${topicName}`);
        const aiResult = await generateConspiracyTheory({
          topic: topicName,
          context: topic.description,
          historical: isHistorical || false,
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
          authorId: undefined, // AI-generated
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

        generatedPosts.push({
          ...newPost,
          _id: result.insertedId.toString(),
          topicName,
        });

        console.log(`✓ Generated: ${aiResult.title}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error generating for ${topicName}:`, error);
        errors.push({
          topic: topicName,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedPosts.length} posts`,
      generated: generatedPosts.length,
      errors: errors.length,
      posts: generatedPosts,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error('Error in batch generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for manual trigger (same as POST)
export async function GET(request: NextRequest) {
  return POST(request);
}

