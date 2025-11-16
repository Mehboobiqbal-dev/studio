import { NextRequest, NextResponse } from 'next/server';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// List of current trending topics that AI should generate theories about
const CURRENT_TOPICS = [
  'Artificial Intelligence',
  'Climate Change',
  'Cryptocurrency',
  'Space Exploration',
  'Social Media',
  'Healthcare',
  'Politics',
  'Technology',
  'Economics',
  'Science',
];

// Historical topics
const HISTORICAL_TOPICS = [
  'World War II',
  'Moon Landing',
  'JFK Assassination',
  '9/11 Attacks',
  'Ancient Civilizations',
  'Cold War',
  'Renaissance',
  'Industrial Revolution',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current'; // 'current' or 'historical'

    const topics = type === 'historical' ? HISTORICAL_TOPICS : CURRENT_TOPICS;

    return NextResponse.json({
      topics: topics.map((topic, index) => ({
        id: index + 1,
        name: topic,
        type,
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

