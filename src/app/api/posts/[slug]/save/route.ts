import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { UserStats } from '@/lib/models/user-activity';

async function handler(request: NextRequest) {
  try {
    const slug = (request as any).params?.slug;
    const userId = (request as any).user.userId;

    if (!slug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      );
    }

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const statsCollection = await getCollection<UserStats>('user_stats');
    let userStats = await statsCollection.findOne({ userId: userId as any });

    if (!userStats) {
      userStats = {
        userId: userId as any,
        postCount: 0,
        commentCount: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        karma: 0,
        savedPosts: [],
        followedTopics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await statsCollection.insertOne(userStats);
    }

    const isSaved = userStats.savedPosts.some(
      (id) => id.toString() === post._id?.toString()
    );

    if (isSaved) {
      // Unsave
      await statsCollection.updateOne(
        { userId: userId as any },
        {
          $pull: { savedPosts: post._id },
          $set: { updatedAt: new Date() },
        }
      );
      return NextResponse.json({ saved: false, message: 'Post unsaved' });
    } else {
      // Save
      await statsCollection.updateOne(
        { userId: userId as any },
        {
          $addToSet: { savedPosts: post._id },
          $set: { updatedAt: new Date() },
        }
      );
      return NextResponse.json({ saved: true, message: 'Post saved' });
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

