import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Topic } from '@/lib/models/topic';
import { UserStats } from '@/lib/models/user-activity';

async function handler(request: NextRequest) {
  try {
    const { slug } = (request as any).params || {};
    const userId = (request as any).user.userId;

    if (!slug) {
      return NextResponse.json(
        { error: 'Topic slug is required' },
        { status: 400 }
      );
    }

    const topicsCollection = await getCollection<Topic>('topics');
    const topic = await topicsCollection.findOne({ slug });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const statsCollection = await getCollection<UserStats>('user_stats');
    let userStats = await statsCollection.findOne({ userId: userId as any });

    if (!userStats) {
      // Create user stats if doesn't exist
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

    const isFollowing = userStats.followedTopics.some(
      (id) => id.toString() === topic._id?.toString()
    );

    if (isFollowing) {
      // Unfollow
      await statsCollection.updateOne(
        { userId: userId as any },
        {
          $pull: { followedTopics: topic._id },
          $set: { updatedAt: new Date() },
        }
      );
      await topicsCollection.updateOne(
        { _id: topic._id },
        { $inc: { followerCount: -1 } }
      );
      return NextResponse.json({ following: false, message: 'Unfollowed topic' });
    } else {
      // Follow
      await statsCollection.updateOne(
        { userId: userId as any },
        {
          $addToSet: { followedTopics: topic._id },
          $set: { updatedAt: new Date() },
        }
      );
      await topicsCollection.updateOne(
        { _id: topic._id },
        { $inc: { followerCount: 1 } }
      );
      return NextResponse.json({ following: true, message: 'Following topic' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

