import { ObjectId } from 'mongodb';

export interface Vote {
  _id?: ObjectId;
  postId?: ObjectId;
  commentId?: ObjectId;
  userId: ObjectId;
  type: 'upvote' | 'downvote';
  createdAt: Date;
}

// Compound index: userId + postId or userId + commentId should be unique

