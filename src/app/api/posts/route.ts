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
    const sort = searchParams.get('sort') || 'newest'; // newest, popular, trending

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
    switch (sort) {
      case 'popular':
        sortQuery = { upvotes: -1, createdAt: -1 };
        break;
      case 'trending':
        // Trending = recent posts with high engagement
        sortQuery = { 
          $expr: { 
            $add: [
              { $multiply: [{ $subtract: [new Date(), '$createdAt'] }, -1] },
              { $multiply: ['$upvotes', 10] },
              { $multiply: ['$commentCount', 5] }
            ]
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

