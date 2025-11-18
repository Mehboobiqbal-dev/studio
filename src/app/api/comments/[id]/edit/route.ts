import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Comment } from '@/lib/models/comment';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const editCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

async function handler(request: NextRequest) {
  try {
    const commentId = (request as any).params?.id;
    const userId = (request as any).user.userId;
    const body = await request.json();
    const validated = editCommentSchema.parse(body);

    const commentsCollection = await getCollection<Comment>('comments');
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (comment.authorId?.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own comments' },
        { status: 403 }
      );
    }

    await commentsCollection.updateOne(
      { _id: comment._id },
      {
        $set: {
          content: validated.content,
          isEdited: true,
          updatedAt: new Date(),
        },
      }
    );

    const updatedComment = await commentsCollection.findOne({ _id: comment._id });

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment: {
        ...updatedComment,
        _id: updatedComment?._id?.toString(),
        postId: updatedComment?.postId?.toString(),
        authorId: updatedComment?.authorId?.toString(),
        parentId: updatedComment?.parentId?.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error editing comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(handler);

