import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Comment } from '@/lib/models/comment';
import { Post } from '@/lib/models/post';
import { ObjectId } from 'mongodb';

async function handler(request: NextRequest) {
  try {
    const commentId = (request as any).params?.id;
    const userId = (request as any).user.userId;

    const commentsCollection = await getCollection<Comment>('comments');
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: userId as any });
    const isAuthor = comment.authorId?.toString() === userId;
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Soft delete
    await commentsCollection.updateOne(
      { _id: comment._id },
      {
        $set: {
          isDeleted: true,
          content: '[deleted]',
          updatedAt: new Date(),
        },
      }
    );

    // Update post comment count if not a reply
    if (!comment.parentId) {
      const postsCollection = await getCollection<Post>('posts');
      await postsCollection.updateOne(
        { _id: comment.postId },
        { $inc: { commentCount: -1 } }
      );
    }

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = requireAuth(handler);

