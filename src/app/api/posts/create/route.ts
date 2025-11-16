import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(100).max(10000),
  type: z.enum(['conspiracy', 'opinion']),
  topicSlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPostSchema.parse(body);
    const userId = (request as any).user.userId;

    const postsCollection = await getCollection<Post>('posts');
    const topicsCollection = await getCollection<Topic>('topics');

    // Check if slug already exists
    const baseSlug = generateSlug(validated.title);
    let slug = baseSlug;
    let slugExists = await postsCollection.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await postsCollection.findOne({ slug });
      counter++;
    }

    // Get topic if provided
    let topicId = null;
    let topicSlug = null;
    if (validated.topicSlug) {
      const topic = await topicsCollection.findOne({ slug: validated.topicSlug });
      if (topic) {
        topicId = topic._id;
        topicSlug = topic.slug;
      }
    }

    // Get user info
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: userId as any });
    const authorName = user?.name || 'Anonymous';

    // Generate excerpt for SEO
    const excerpt = validated.content.substring(0, 160).replace(/\n/g, ' ').trim();

    const newPost: Omit<Post, '_id'> = {
      title: validated.title,
      content: validated.content,
      type: validated.type,
      topicId: topicId as any,
      topicSlug: topicSlug || undefined,
      authorId: userId as any,
      authorName,
      isAIGenerated: false,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      views: 0,
      tags: validated.tags || [],
      slug,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      excerpt,
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
      message: 'Post created successfully',
      post: {
        ...newPost,
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

