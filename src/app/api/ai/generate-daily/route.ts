import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// Daily generation endpoint - generates theories for topics that need content
// Should be called once per day via cron job
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

    // Get topics that need more content (fewer posts or no posts in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const topics = await topicsCollection
      .find({})
      .sort({ postCount: 1 }) // Topics with fewer posts first
      .limit(10) // Generate for 10 topics per day
      .toArray();

    const generatedPosts = [];
    const errors = [];

    for (const topic of topics) {
      try {
        // Check if topic has recent posts
        const recentPost = await postsCollection.findOne({
          topicId: topic._id,
          isAIGenerated: true,
          createdAt: { $gte: sevenDaysAgo },
        });

        if (recentPost && topic.postCount > 5) {
          // Skip if has recent post and enough content
          continue;
        }

        // Determine if historical (you can add logic here)
        const isHistorical = topic.name.toLowerCase().includes('war') || 
                           topic.name.toLowerCase().includes('ancient') ||
                           topic.name.toLowerCase().includes('history');

        // Generate theory
        console.log(`Generating daily theory for: ${topic.name}`);
        const aiResult = await generateConspiracyTheory({
          topic: topic.name,
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
        console.error(`Error generating for ${topic.name}:`, error);
        errors.push({
          topic: topic.name,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Daily generation complete: ${generatedPosts.length} posts generated`,
      generated: generatedPosts.length,
      errors: errors.length,
      posts: generatedPosts,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error('Error in daily generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

