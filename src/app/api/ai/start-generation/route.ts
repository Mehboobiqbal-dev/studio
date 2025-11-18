import { NextRequest, NextResponse } from 'next/server';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';

// This endpoint starts continuous AI generation for all topics
// Can be called manually or via cron to ensure content is always being generated
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.AI_GENERATION_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all current and historical topics
    const currentTopicsResponse = await fetch(`${request.nextUrl.origin}/api/ai/current-topics?type=current`);
    const historicalTopicsResponse = await fetch(`${request.nextUrl.origin}/api/ai/current-topics?type=historical`);
    
    const currentTopicsData = await currentTopicsResponse.json();
    const historicalTopicsData = await historicalTopicsResponse.json();

    const allTopics = [
      ...(currentTopicsData.topics || []),
      ...(historicalTopicsData.topics || []),
    ];

    const topicsCollection = await getCollection<Topic>('topics');
    const postsCollection = await getCollection<Post>('posts');

    const generated = [];
    const errors = [];

    // Generate for each topic (limit to 10 per call to avoid timeout)
    const topicsToProcess = allTopics.slice(0, 10);

    for (const topicData of topicsToProcess) {
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

        // Check if we have recent posts (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const recentPost = await postsCollection.findOne({
          topicId: topic._id,
          isAIGenerated: true,
          createdAt: { $gte: oneDayAgo },
        });

        if (recentPost) {
          continue; // Skip if already generated recently
        }

        // Generate conspiracy theory
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

        generated.push({
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
      message: `Generated ${generated.length} posts`,
      generated: generated.length,
      errors: errors.length,
      posts: generated,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error('Error in AI generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}




