import { Metadata } from 'next';
import { getCollection } from '@/lib/db/mongodb';
import { Post } from '@/lib/models/post';
import { Topic } from '@/lib/models/topic';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, MessageCircle, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  return {
    title: query ? `Search: ${query} | ConspiracyHub` : 'Search | ConspiracyHub',
    description: `Search results for "${query}"`,
  };
}

async function searchPosts(query: string) {
  try {
    const postsCollection = await getCollection<Post>('posts');
    
    const posts = await postsCollection
      .find({
        status: 'published',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return posts.map(post => ({
      ...post,
      _id: post._id?.toString(),
      topicId: post.topicId?.toString(),
      authorId: post.authorId?.toString(),
    }));
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

async function searchTopics(query: string) {
  try {
    const topicsCollection = await getCollection<Topic>('topics');
    
    const topics = await topicsCollection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(10)
      .toArray();

    return topics.map(topic => ({
      ...topic,
      _id: topic._id?.toString(),
    }));
  } catch (error) {
    console.error('Error searching topics:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const posts = query ? await searchPosts(query) : [];
  const topics = query ? await searchTopics(query) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold mb-2">
            {query ? `Search Results for "${query}"` : 'Search'}
          </h1>
          {!query && (
            <p className="text-muted-foreground">Enter a search query to find posts and topics</p>
          )}
        </div>

        {query && (
          <>
            {topics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <Link key={topic._id} href={`/t/${topic.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle>{topic.name}</CardTitle>
                          {topic.description && (
                            <CardDescription className="line-clamp-2">
                              {topic.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline">{topic.postCount} posts</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Posts ({posts.length})</h2>
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No posts found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={post.type === 'conspiracy' ? 'destructive' : 'default'}>
                                {post.type}
                              </Badge>
                              {post.isAIGenerated && (
                                <Badge variant="secondary">AI Generated</Badge>
                              )}
                              {post.topicSlug && (
                                <Link href={`/t/${post.topicSlug}`}>
                                  <Badge variant="outline">{post.topicSlug}</Badge>
                                </Link>
                              )}
                            </div>
                            <Link href={`/p/${post.slug}`}>
                              <CardTitle className="text-2xl hover:text-primary transition-colors cursor-pointer">
                                {post.title}
                              </CardTitle>
                            </Link>
                            {post.excerpt && (
                              <CardDescription className="mt-2 line-clamp-2">
                                {post.excerpt}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ArrowUp className="h-4 w-4" />
                            <span>{post.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

