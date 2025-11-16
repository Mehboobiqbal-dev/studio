'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostVoteButtonsProps {
  postId: string;
  postSlug: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function PostVoteButtons({
  postId,
  postSlug,
  initialUpvotes,
  initialDownvotes,
}: PostVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to vote',
        variant: 'destructive',
      });
      router.push(`/login?redirect=/p/${postSlug}`);
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistically update UI
        if (type === 'upvote') {
          setUpvotes(data.voted ? upvotes + 1 : upvotes - 1);
        } else {
          setDownvotes(data.voted ? downvotes + 1 : downvotes - 1);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={() => handleVote('upvote')} disabled={!user}>
        <ArrowUp className="h-4 w-4 mr-1" />
        {upvotes}
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleVote('downvote')} disabled={!user}>
        <ArrowDown className="h-4 w-4 mr-1" />
        {downvotes}
      </Button>
    </div>
  );
}

