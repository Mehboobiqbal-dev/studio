import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// This endpoint can be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Verify it's an authorized request (add API key check in production)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.AI_GENERATION_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, topicSlug, context, historical } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate theory using AI
    const aiResult = await generateConspiracyTheory({
      topic,
      context,
      historical: historical || false,
    });

    const postsCollection = await getCollection<Post>('posts');
    const topicsCollection = await getCollection<Topic>('topics');

    // Check if slug already exists
    const baseSlug = generateSlug(aiResult.title);
    let slug = baseSlug;
    let slugExists = await postsCollection.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await postsCollection.findOne({ slug });
      counter++;
    }

    // Get or create topic
    let topicId = null;
    let finalTopicSlug = topicSlug;
    
    if (topicSlug) {
      let topicDoc = await topicsCollection.findOne({ slug: topicSlug });
      if (topicDoc) {
        topicId = topicDoc._id;
      }
    }

    // If topic doesn't exist, create it
    if (!topicId) {
      const topicSlugFromName = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let existingTopic = await topicsCollection.findOne({ slug: topicSlugFromName });
      
      if (!existingTopic) {
        const newTopic: Omit<Topic, '_id'> = {
          name: topic,
          slug: topicSlugFromName,
          description: `Conspiracy theories and opinions about ${topic}`,
          postCount: 0,
          followerCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const topicResult = await topicsCollection.insertOne(newTopic as Topic);
        topicId = topicResult.insertedId;
        finalTopicSlug = topicSlugFromName;
      } else {
        topicId = existingTopic._id;
        finalTopicSlug = existingTopic.slug;
      }
    }

    const newPost: Omit<Post, '_id'> = {
      title: aiResult.title,
      content: aiResult.content,
      type: 'conspiracy',
      topicId: topicId as any,
      topicSlug: finalTopicSlug,
      authorId: undefined, // AI-generated, no author
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
    if (topicId) {
      await topicsCollection.updateOne(
        { _id: topicId },
        { $inc: { postCount: 1 } }
      );
    }

    return NextResponse.json({
      message: 'AI post generated and published successfully',
      post: {
        ...newPost,
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in auto-generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to generate posts for trending topics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.AI_GENERATION_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const topicsCollection = await getCollection<Topic>('topics');
    const postsCollection = await getCollection<Post>('posts');

    // Get top topics that need more content
    const topics = await topicsCollection
      .find({})
      .sort({ postCount: 1 }) // Topics with fewer posts first
      .limit(5)
      .toArray();

    const generatedPosts = [];

    for (const topic of topics) {
      try {
        // Check if we already generated a post for this topic today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const recentPost = await postsCollection.findOne({
          topicId: topic._id,
          isAIGenerated: true,
          createdAt: { $gte: today },
        });

        if (recentPost) {
          continue; // Skip if already generated today
        }

        // Generate theory
        const aiResult = await generateConspiracyTheory({
          topic: topic.name,
          context: topic.description,
          historical: false,
        });

        const baseSlug = generateSlug(aiResult.title);
        let slug = baseSlug;
        let slugExists = await postsCollection.findOne({ slug });
        let counter = 1;
        while (slugExists) {
          slug = `${baseSlug}-${counter}`;
          slugExists = await postsCollection.findOne({ slug });
          counter++;
        }

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
        await topicsCollection.updateOne(
          { _id: topic._id },
          { $inc: { postCount: 1 } }
        );

        generatedPosts.push({
          ...newPost,
          _id: result.insertedId.toString(),
        });
      } catch (error) {
        console.error(`Error generating post for topic ${topic.name}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedPosts.length} posts`,
      posts: generatedPosts,
    });
  } catch (error) {
    console.error('Error in batch generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

