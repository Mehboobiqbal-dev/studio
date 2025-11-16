import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { Comment } from '@/lib/models/comment';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const commentsCollection = await getCollection<Comment>('comments');
    const comments = await commentsCollection
      .find({ postId: post._id, isDeleted: false, parentId: null })
      .sort({ createdAt: -1 })
      .toArray();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await commentsCollection
          .find({ parentId: comment._id, isDeleted: false })
          .sort({ createdAt: 1 })
          .toArray();

        return {
          ...comment,
          _id: comment._id?.toString(),
          postId: comment.postId?.toString(),
          authorId: comment.authorId?.toString(),
          parentId: comment.parentId?.toString(),
          replies: replies.map(reply => ({
            ...reply,
            _id: reply._id?.toString(),
            postId: reply.postId?.toString(),
            authorId: reply.authorId?.toString(),
            parentId: reply.parentId?.toString(),
          })),
        };
      })
    );

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

