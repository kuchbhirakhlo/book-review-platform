'use client';

import React from "react"

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  author: string;
  bookCover?: string;
  rating: number;
  review: string;
  genre: string;
  userId: string;
  userName?: string;
  comments: number;
  likes: number;
  createdAt: Date | string;
}

interface Comment {
  id: string;
  content: string;
  userName: string;
  userId: string;
  likes: number;
  createdAt: Date | string;
}

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/get?limit=100`);
        const data = await response.json();
        const foundPost = data.posts?.find((p: Post) => p.id === id);
        setPost(foundPost || null);

        if (foundPost) {
          const commentsRes = await fetch(`/api/posts/comments?postId=${id}`);
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || []);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0],
          content: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-96 w-full bg-muted mb-8" />
          <Skeleton className="h-12 w-3/4 bg-muted mb-4" />
          <Skeleton className="h-6 w-1/2 bg-muted" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Review Not Found</h1>
          <p className="text-muted-foreground mb-8">The review you're looking for doesn't exist.</p>
          <Link href="/browse">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse All Reviews
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const date = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Book Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {post.bookCover ? (
            <img
              src={post.bookCover || "/placeholder.svg"}
              alt={post.title}
              className="w-48 h-72 object-cover rounded-lg shadow-lg flex-shrink-0"
            />
          ) : (
            <div className="w-48 h-72 bg-muted rounded-lg shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-muted-foreground">No Cover</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {post.author}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Genre</p>
                <p className="text-foreground font-medium">{post.genre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(post.rating) ? 'fill-accent text-accent' : 'text-border'}`}
                    />
                  ))}
                  <span className="ml-2 text-foreground font-medium">{post.rating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reviewed by</p>
              <p className="text-foreground font-medium mb-1">{post.userName || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>

            {/* Engagement */}
            <div className="flex gap-4">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <ThumbsUp className="w-4 h-4 mr-2" />
                {post.likes} Likes
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" />
                {comments.length} Comments
              </Button>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <Card className="bg-card border-border mb-12">
          <CardHeader>
            <h2 className="text-2xl font-serif font-bold text-foreground">Review</h2>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{post.review}</p>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Comments</h2>

          {user ? (
            <Card className="bg-card border-border mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this review..."
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{newComment.length}/1000</p>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border mb-8">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
                <Link href="/auth/signin">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.createdAt instanceof Date
                            ? comment.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
