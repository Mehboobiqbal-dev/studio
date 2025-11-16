import { Metadata } from 'next';
import { getCollection } from '@/lib/db/mongodb';
import { Topic } from '@/lib/models/topic';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Browse Topics - Conspiracy & Opinion Platform',
  description: 'Explore all topics and categories for conspiracy theories and opinions',
  openGraph: {
    title: 'Browse Topics',
    description: 'Explore all topics and categories',
    type: 'website',
  },
};

async function getTopics() {
  try {
    const topicsCollection = await getCollection<Topic>('topics');
    const topics = await topicsCollection
      .find({})
      .sort({ postCount: -1, followerCount: -1 })
      .toArray();
    
    return topics.map(topic => ({
      ...topic,
      _id: topic._id?.toString(),
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold mb-2">Browse Topics</h1>
          <p className="text-muted-foreground text-lg">
            Explore conspiracy theories and opinions by topic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No topics yet.</p>
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Link key={topic._id} href={`/t/${topic.slug}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                    {topic.description && (
                      <CardDescription className="line-clamp-2">
                        {topic.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{topic.postCount} posts</Badge>
                      <Badge variant="outline">{topic.followerCount} followers</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
