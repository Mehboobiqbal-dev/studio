import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post, generateSlug } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';
import { z } from 'zod';

const generatePostSchema = z.object({
  topic: z.string().min(1),
  context: z.string().optional(),
  historical: z.boolean().optional(),
  topicSlug: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generatePostSchema.parse(body);

    // Generate theory using AI
    const aiResult = await generateConspiracyTheory({
      topic: validated.topic,
      context: validated.context,
      historical: validated.historical || false,
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

    const newPost: Omit<Post, '_id'> = {
      title: aiResult.title,
      content: aiResult.content,
      type: 'conspiracy',
      topicId: topicId as any,
      topicSlug: topicSlug || undefined,
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
      message: 'AI post generated successfully',
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

    console.error('Error generating AI post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

