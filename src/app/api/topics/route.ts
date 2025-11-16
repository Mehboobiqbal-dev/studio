import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Topic } from '@/lib/models/topic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'popular'; // popular, newest, name

    const topicsCollection = await getCollection<Topic>('topics');
    
    let sortQuery: any = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'name':
        sortQuery = { name: 1 };
        break;
      default: // popular
        sortQuery = { postCount: -1, followerCount: -1 };
    }

    const topics = await topicsCollection
      .find({})
      .sort(sortQuery)
      .toArray();

    return NextResponse.json({
      topics: topics.map(topic => ({
        ...topic,
        _id: topic._id?.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

