import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { UserStats } from '@/lib/models/user-activity';

async function handler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const statsCollection = await getCollection<UserStats>('user_stats');
    const userStats = await statsCollection.findOne({ userId: userId as any });

    if (!userStats || userStats.savedPosts.length === 0) {
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const postsCollection = await getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    const posts = await postsCollection
      .find({
        _id: { $in: userStats.savedPosts },
        status: 'published',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        _id: post._id?.toString(),
        topicId: post.topicId?.toString(),
        authorId: post.authorId?.toString(),
      })),
      pagination: {
        page,
        limit,
        total: userStats.savedPosts.length,
        totalPages: Math.ceil(userStats.savedPosts.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);

