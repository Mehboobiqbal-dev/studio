import { ObjectId } from 'mongodb';

export interface UserActivity {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'post_created' | 'comment_created' | 'vote' | 'topic_followed' | 'post_saved';
  postId?: ObjectId;
  commentId?: ObjectId;
  topicId?: ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface UserStats {
  userId: ObjectId;
  postCount: number;
  commentCount: number;
  totalUpvotes: number;
  totalDownvotes: number;
  karma: number; // Calculated: upvotes - downvotes
  savedPosts: ObjectId[];
  followedTopics: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

