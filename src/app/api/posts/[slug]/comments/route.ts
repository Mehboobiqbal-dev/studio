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
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'best';

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const commentsCollection = await getCollection<Comment>('comments');
    let comments = await commentsCollection
      .find({ postId: post._id, isDeleted: false, parentId: null })
      .toArray();

    // Sort comments based on sort parameter
    switch (sort) {
      case 'best':
        comments.sort((a, b) => {
          const scoreA = a.upvotes - a.downvotes;
          const scoreB = b.upvotes - b.downvotes;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case 'top':
        comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'new':
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'old':
        comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'controversial':
        comments.sort((a, b) => {
          const totalA = a.upvotes + a.downvotes;
          const totalB = b.upvotes + b.downvotes;
          const diffA = Math.abs(a.upvotes - a.downvotes);
          const diffB = Math.abs(b.upvotes - b.downvotes);
          return (totalB - diffB) - (totalA - diffA);
        });
        break;
    }

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

