'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Comment {
  _id: string;
  authorName?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  postSlug: string;
}

export function CommentSection({ postId, postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to comment',
        variant: 'destructive',
      });
      router.push(`/login?redirect=/p/${postSlug}`);
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }

      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment posted!',
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, type: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to vote',
        variant: 'destructive',
      });
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
          commentId,
          type,
        }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                disabled={submitting}
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onVote={handleVote}
              user={user}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onVote,
  user,
}: {
  comment: Comment;
  onVote: (id: string, type: 'upvote' | 'downvote') => void;
  user: any;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(comment._id, 'upvote')}
              disabled={!user}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{comment.upvotes - comment.downvotes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(comment._id, 'downvote')}
              disabled={!user}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{comment.authorName || 'Anonymous'}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-4 space-y-2 border-l-2 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{reply.authorName || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

