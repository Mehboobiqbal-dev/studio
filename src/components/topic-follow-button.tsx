'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus, UserMinus } from 'lucide-react';

interface TopicFollowButtonProps {
  topicSlug: string;
  initialFollowerCount: number;
}

export function TopicFollowButton({ topicSlug, initialFollowerCount }: TopicFollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if user is following this topic
    if (user) {
      fetch(`/api/topics/${topicSlug}/follow-status`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.following !== undefined) {
            setFollowing(data.following);
          }
        })
        .catch(console.error);
    }
  }, [user, topicSlug]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to follow topics',
        variant: 'destructive',
      });
      router.push(`/login?redirect=/t/${topicSlug}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/topics/${topicSlug}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setFollowing(data.following);
        setFollowerCount(data.following ? followerCount + 1 : followerCount - 1);
        toast({
          title: data.following ? 'Following topic' : 'Unfollowed topic',
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow topic',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={following ? 'default' : 'outline'}
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
      <span className="ml-2">({followerCount})</span>
    </Button>
  );
}

