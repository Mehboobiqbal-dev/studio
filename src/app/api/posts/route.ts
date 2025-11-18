import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const topicSlug = searchParams.get('topic');
    const type = searchParams.get('type') as 'conspiracy' | 'opinion' | null;
    const sort = searchParams.get('sort') || 'newest'; // newest, popular, trending, hot, controversial

    const postsCollection = await getCollection<Post>('posts');
    
    const query: any = {
      status: 'published',
    };

    if (topicSlug) {
      query.topicSlug = topicSlug;
    }

    if (type) {
      query.type = type;
    }

    let sortQuery: any = {};
    const now = new Date();
    
    switch (sort) {
      case 'popular':
        // Most upvotes overall
        sortQuery = { upvotes: -1, createdAt: -1 };
        break;
      case 'trending':
        // Recent posts with high engagement
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: oneDayAgo };
        sortQuery = { 
          upvotes: -1,
          commentCount: -1,
          views: -1,
        };
        break;
      case 'hot':
        // Reddit-style hot algorithm: balance between score and time
        // Posts from last 7 days, weighted by engagement
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: sevenDaysAgo };
        sortQuery = { 
          $expr: {
            $add: [
              { $multiply: ['$upvotes', 2] },
              { $multiply: ['$commentCount', 3] },
              { $multiply: [{ $subtract: [now, '$createdAt'] }, -0.0001] }
            ]
          }
        };
        break;
      case 'controversial':
        // High engagement but close upvote/downvote ratio
        sortQuery = { 
          $expr: {
            $subtract: [
              { $add: ['$upvotes', '$downvotes'] },
              { $abs: { $subtract: ['$upvotes', '$downvotes'] } }
            ]
          }
        };
        break;
      case 'top':
        // Top posts of all time
        sortQuery = { 
          $expr: {
            $subtract: ['$upvotes', '$downvotes']
          }
        };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const posts = await postsCollection
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await postsCollection.countDocuments(query);

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
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
