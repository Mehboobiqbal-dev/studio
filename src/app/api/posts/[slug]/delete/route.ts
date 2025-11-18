import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';

async function handler(request: NextRequest) {
  try {
    const slug = (request as any).params?.slug;
    const userId = (request as any).user.userId;

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: userId as any });
    const isAuthor = post.authorId?.toString() === userId;
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Soft delete (change status to archived)
    await postsCollection.updateOne(
      { _id: post._id },
      { $set: { status: 'archived', updatedAt: new Date() } }
    );

    // Update topic post count
    if (post.topicId) {
      const topicsCollection = await getCollection<Topic>('topics');
      await topicsCollection.updateOne(
        { _id: post.topicId },
        { $inc: { postCount: -1 } }
      );
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = requireAuth(handler);

