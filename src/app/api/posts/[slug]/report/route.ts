import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { z } from 'zod';

const reportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'other']),
  details: z.string().max(1000).optional(),
});

async function handler(request: NextRequest) {
  try {
    const slug = (request as any).params?.slug;
    const userId = (request as any).user.userId;
    const body = await request.json();
    const validated = reportSchema.parse(body);

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Store report (you can create a reports collection)
    const reportsCollection = await getCollection('reports');
    await reportsCollection.insertOne({
      postId: post._id,
      reportedBy: userId,
      reason: validated.reason,
      details: validated.details,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: 'Report submitted successfully. Our moderators will review it.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error reporting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);



