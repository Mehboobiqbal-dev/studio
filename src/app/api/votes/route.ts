import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Vote } from '@/lib/models/vote';
import { Post } from '@/lib/models/post';
import { Comment } from '@/lib/models/comment';
import { z } from 'zod';

const voteSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  type: z.enum(['upvote', 'downvote']),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = voteSchema.parse(body);
    const userId = (request as any).user.userId;

    if (!validated.postId && !validated.commentId) {
      return NextResponse.json(
        { error: 'Either postId or commentId is required' },
        { status: 400 }
      );
    }

    const votesCollection = await getCollection<Vote>('votes');

    // Check if user already voted
    const existingVote = await votesCollection.findOne({
      userId: userId as any,
      ...(validated.postId ? { postId: validated.postId as any } : { commentId: validated.commentId as any }),
    });

    if (existingVote) {
      // If same vote type, remove it (toggle off)
      if (existingVote.type === validated.type) {
        await votesCollection.deleteOne({ _id: existingVote._id });

        // Decrement vote count
        if (validated.postId) {
          const postsCollection = await getCollection<Post>('posts');
          await postsCollection.updateOne(
            { _id: validated.postId as any },
            { $inc: { [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: -1 } }
          );
        } else if (validated.commentId) {
          const commentsCollection = await getCollection<Comment>('comments');
          await commentsCollection.updateOne(
            { _id: validated.commentId as any },
            { $inc: { [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: -1 } }
          );
        }

        return NextResponse.json({ message: 'Vote removed', voted: false });
      } else {
        // Change vote type
        await votesCollection.updateOne(
          { _id: existingVote._id },
          { $set: { type: validated.type } }
        );

        // Update vote counts
        if (validated.postId) {
          const postsCollection = await getCollection<Post>('posts');
          await postsCollection.updateOne(
            { _id: validated.postId as any },
            {
              $inc: {
                [existingVote.type === 'upvote' ? 'upvotes' : 'downvotes']: -1,
                [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: 1,
              },
            }
          );
        } else if (validated.commentId) {
          const commentsCollection = await getCollection<Comment>('comments');
          await commentsCollection.updateOne(
            { _id: validated.commentId as any },
            {
              $inc: {
                [existingVote.type === 'upvote' ? 'upvotes' : 'downvotes']: -1,
                [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: 1,
              },
            }
          );
        }

        return NextResponse.json({ message: 'Vote updated', voted: true, type: validated.type });
      }
    }

    // Create new vote
    const newVote: Omit<Vote, '_id'> = {
      postId: validated.postId ? (validated.postId as any) : undefined,
      commentId: validated.commentId ? (validated.commentId as any) : undefined,
      userId: userId as any,
      type: validated.type,
      createdAt: new Date(),
    };

    await votesCollection.insertOne(newVote as Vote);

    // Increment vote count
    if (validated.postId) {
      const postsCollection = await getCollection<Post>('posts');
      await postsCollection.updateOne(
        { _id: validated.postId as any },
        { $inc: { [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: 1 } }
      );
    } else if (validated.commentId) {
      const commentsCollection = await getCollection<Comment>('comments');
      await commentsCollection.updateOne(
        { _id: validated.commentId as any },
        { $inc: { [validated.type === 'upvote' ? 'upvotes' : 'downvotes']: 1 } }
      );
    }

    return NextResponse.json({ message: 'Vote recorded', voted: true, type: validated.type });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

