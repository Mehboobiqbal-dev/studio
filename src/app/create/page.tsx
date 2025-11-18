'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'conspiracy' | 'opinion'>('conspiracy');
  const [topicSlug, setTopicSlug] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const OPTIONAL_TOPIC_VALUE = useMemo(() => '__no_topic__', []);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch topics
    fetch('/api/topics')
      .then(res => res.json())
      .then(data => setTopics(data.topics || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/create');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a post',
        variant: 'destructive',
      });
      router.push('/login?redirect=/create');
      return;
    }

    if (title.length < 5) {
      toast({
        title: 'Title too short',
        description: 'Title must be at least 5 characters',
        variant: 'destructive',
      });
      return;
    }

    if (content.length < 100) {
      toast({
        title: 'Content too short',
        description: 'Content must be at least 100 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          content,
          type,
          topicSlug: topicSlug || undefined,
          tags: tagArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      toast({
        title: 'Success',
        description: 'Post created successfully!',
      });

      router.push(`/p/${data.post.slug}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>
              Share your conspiracy theory or opinion with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Post Type</Label>
                <Select value={type} onValueChange={(value: 'conspiracy' | 'opinion') => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conspiracy">Conspiracy Theory</SelectItem>
                    <SelectItem value="opinion">Opinion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title..."
                  required
                  minLength={5}
                  maxLength={200}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your theory or opinion here..."
                  required
                  minLength={100}
                  maxLength={10000}
                  rows={15}
                  disabled={loading}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length}/10000 characters (minimum 100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Select
                  value={topicSlug || OPTIONAL_TOPIC_VALUE}
                  onValueChange={(value) =>
                    setTopicSlug(value === OPTIONAL_TOPIC_VALUE ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OPTIONAL_TOPIC_VALUE}>No topic</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic._id} value={topic.slug}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

