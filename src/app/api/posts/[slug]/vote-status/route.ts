import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { Vote } from '@/lib/models/vote';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    
    let userVote = null;
    let userId = null;

    // Check if user is authenticated
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        userId = payload.userId;
      } catch (error) {
        // User not authenticated, continue without vote status
      }
    }

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug, status: 'published' });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get user's vote if authenticated
    if (userId) {
      const votesCollection = await getCollection<Vote>('votes');
      const vote = await votesCollection.findOne({
        postId: post._id,
        userId: userId as any,
      });
      
      if (vote) {
        userVote = vote.type;
      }
    }

    return NextResponse.json({
      postId: post._id?.toString(),
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote, // 'upvote', 'downvote', or null
    });
  } catch (error) {
    console.error('Error fetching vote status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

