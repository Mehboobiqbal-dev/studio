import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// Continuous generation endpoint - generates theories continuously
// This can be called more frequently (every few hours) to keep content fresh
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

    const body = await request.json().catch(() => ({}));
    const maxGenerations = body.maxGenerations || 5; // Default 5 posts per call

    const topicsCollection = await getCollection<Topic>('topics');
    const postsCollection = await getCollection<Post>('posts');

    // Get current and historical topics
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

    // Combine all topics
    const allTopics = [
      ...(currentTopicsData.topics || []),
      ...(historicalTopicsData.topics || []),
    ];

    // Shuffle and take random topics
    const shuffled = allTopics.sort(() => 0.5 - Math.random());
    const selectedTopics = shuffled.slice(0, maxGenerations);

    const generatedPosts = [];
    const errors = [];

    for (const topicData of selectedTopics) {
      try {
        const topicName = topicData.name;
        const isHistorical = topicData.type === 'historical';

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

        // Check recent posts (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const recentPost = await postsCollection.findOne({
          topicId: topic._id,
          isAIGenerated: true,
          createdAt: { $gte: oneDayAgo },
        });

        if (recentPost) {
          console.log(`Skipping ${topicName} - generated in last 24 hours`);
          continue;
        }

        // Generate theory
        console.log(`Generating theory for: ${topicName}`);
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

        generatedPosts.push({
          ...newPost,
          _id: result.insertedId.toString(),
          topicName: topic.name,
        });

        console.log(`✓ Generated: ${aiResult.title}`);
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error: any) {
        console.error(`Error generating for ${topicData.name}:`, error);
        errors.push({
          topic: topicData.name,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Continuous generation complete: ${generatedPosts.length} posts generated`,
      generated: generatedPosts.length,
      errors: errors.length,
      posts: generatedPosts,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error('Error in continuous generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

