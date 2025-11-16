import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCollection } from '@/lib/db/mongodb';
import { Topic, generateTopicSlug } from '@/lib/models/topic';
import { z } from 'zod';

const createTopicSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500).optional(),
});

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTopicSchema.parse(body);

    const topicsCollection = await getCollection<Topic>('topics');

    // Check if topic already exists
    const slug = generateTopicSlug(validated.name);
    const existingTopic = await topicsCollection.findOne({ slug });

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic already exists' },
        { status: 409 }
      );
    }

    const newTopic: Omit<Topic, '_id'> = {
      name: validated.name,
      slug,
      description: validated.description || `Conspiracy theories and opinions about ${validated.name}`,
      postCount: 0,
      followerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await topicsCollection.insertOne(newTopic as Topic);

    return NextResponse.json({
      message: 'Topic created successfully',
      topic: {
        ...newTopic,
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

