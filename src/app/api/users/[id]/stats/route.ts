import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { UserStats } from '@/lib/models/user-activity';
import { Post } from '@/lib/models/post';
import { Comment } from '@/lib/models/comment';
import { Vote } from '@/lib/models/vote';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const statsCollection = await getCollection<UserStats>('user_stats');
    let userStats = await statsCollection.findOne({ userId: new ObjectId(userId) });

    // Calculate karma from posts and comments
    const postsCollection = await getCollection<Post>('posts');
    const commentsCollection = await getCollection<Comment>('comments');
    const votesCollection = await getCollection<Vote>('votes');

    const userPosts = await postsCollection
      .find({ authorId: new ObjectId(userId) })
      .toArray();

    const userComments = await commentsCollection
      .find({ authorId: new ObjectId(userId) })
      .toArray();

    // Calculate total karma
    const postKarma = userPosts.reduce((sum, post) => sum + post.upvotes - post.downvotes, 0);
    const commentKarma = userComments.reduce((sum, comment) => sum + comment.upvotes - comment.downvotes, 0);
    const totalKarma = postKarma + commentKarma;

    // Update or create user stats
    if (!userStats) {
      userStats = {
        userId: new ObjectId(userId),
        postCount: userPosts.length,
        commentCount: userComments.length,
        totalUpvotes: userPosts.reduce((sum, p) => sum + p.upvotes, 0) + userComments.reduce((sum, c) => sum + c.upvotes, 0),
        totalDownvotes: userPosts.reduce((sum, p) => sum + p.downvotes, 0) + userComments.reduce((sum, c) => sum + c.downvotes, 0),
        karma: totalKarma,
        savedPosts: [],
        followedTopics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await statsCollection.insertOne(userStats);
    } else {
      // Update stats
      await statsCollection.updateOne(
        { userId: new ObjectId(userId) },
        {
          $set: {
            postCount: userPosts.length,
            commentCount: userComments.length,
            totalUpvotes: userPosts.reduce((sum, p) => sum + p.upvotes, 0) + userComments.reduce((sum, c) => sum + c.upvotes, 0),
            totalDownvotes: userPosts.reduce((sum, p) => sum + p.downvotes, 0) + userComments.reduce((sum, c) => sum + c.downvotes, 0),
            karma: totalKarma,
            updatedAt: new Date(),
          },
        }
      );
      userStats.karma = totalKarma;
      userStats.postCount = userPosts.length;
      userStats.commentCount = userComments.length;
    }

    return NextResponse.json({
      stats: {
        ...userStats,
        userId: userStats.userId.toString(),
        savedPosts: userStats.savedPosts.map(id => id.toString()),
        followedTopics: userStats.followedTopics.map(id => id.toString()),
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

