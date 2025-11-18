import { NextRequest, NextResponse } from 'next/server';
import { generateConspiracyTheory } from '@/ai/flows/generate-conspiracy-theory';

// Comprehensive list of current trending topics that AI should generate theories about
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
  'COVID-19',
  'Vaccines',
  'Big Tech',
  'Government Surveillance',
  'Elections',
  'Media',
  'Education',
  'Energy',
  'Food Industry',
  'Pharmaceutical Industry',
  'Banking System',
  'Stock Market',
  'War',
  'Military',
  'Intelligence Agencies',
  'Celebrities',
  'Hollywood',
  'Music Industry',
  'Sports',
  'Religion',
  'Conspiracy Theories',
  'UFOs',
  'Aliens',
  'Extraterrestrial Life',
  'Time Travel',
  'Quantum Physics',
  'Mind Control',
  'Population Control',
  'New World Order',
  'Illuminati',
  'Freemasons',
  'Secret Societies',
  'Elite',
  'Billionaires',
  'Corporations',
  'Globalization',
  'Immigration',
  'Terrorism',
  'Crime',
  'Law Enforcement',
];

// Comprehensive list of historical topics
const HISTORICAL_TOPICS = [
  'World War II',
  'World War I',
  'Moon Landing',
  'JFK Assassination',
  '9/11 Attacks',
  'Ancient Civilizations',
  'Cold War',
  'Renaissance',
  'Industrial Revolution',
  'American Civil War',
  'French Revolution',
  'Russian Revolution',
  'Vietnam War',
  'Korean War',
  'Gulf War',
  'Pearl Harbor',
  'Cuban Missile Crisis',
  'Watergate',
  'Roswell Incident',
  'Area 51',
  'Bermuda Triangle',
  'Titanic',
  'Ancient Egypt',
  'Ancient Rome',
  'Ancient Greece',
  'Mayan Civilization',
  'Aztec Empire',
  'Inca Empire',
  'Medieval Times',
  'Crusades',
  'Black Death',
  'Spanish Inquisition',
  'Witch Trials',
  'Prohibition',
  'Great Depression',
  'Holocaust',
  'Atomic Bomb',
  'Chernobyl',
  'Fukushima',
  'Apollo Missions',
  'Space Race',
  'Berlin Wall',
  'Fall of Soviet Union',
  'Y2K',
  '2012 Mayan Calendar',
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

