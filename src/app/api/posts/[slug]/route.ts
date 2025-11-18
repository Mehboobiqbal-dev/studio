import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import { User } from '@/lib/models/user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const postsCollection = await getCollection<Post>('posts');
    const post = await postsCollection.findOne({ slug, status: 'published' });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await postsCollection.updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    // Fetch related data
    let topic = null;
    if (post.topicId) {
      const topicsCollection = await getCollection<Topic>('topics');
      topic = await topicsCollection.findOne({ _id: post.topicId });
    }

    let author = null;
    if (post.authorId) {
      const usersCollection = await getCollection<User>('users');
      author = await usersCollection.findOne({ _id: post.authorId });
    }

    return NextResponse.json({
      post: {
        ...post,
        _id: post._id?.toString(),
        topicId: post.topicId?.toString(),
        authorId: post.authorId?.toString(),
      },
      topic: topic ? {
        _id: topic._id?.toString(),
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
      } : null,
      author: author ? {
        _id: author._id?.toString(),
        name: author.name,
        avatar: author.avatar,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

