'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function TopRatedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/get?limit=100&sortBy=popular');
        const data = await response.json();
        // Sort by rating
        const sorted = (data.posts || []).sort((a: Post, b: Post) => b.rating - a.rating);
        setPosts(sorted);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Top-Rated Reviews</h1>
          <p className="text-lg text-muted-foreground">
            Discover the highest-rated book reviews from our community of passionate readers.
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div key={post.id} className="relative">
                {index < 3 && (
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-accent rounded-full flex items-center justify-center z-10">
                    <span className="text-accent-foreground font-bold">#{index + 1}</span>
                  </div>
                )}
                <ReviewCard
                  id={post.id}
                  title={post.title}
                  author={post.author}
                  bookCover={post.bookCover}
                  rating={post.rating}
                  review={post.review}
                  genre={post.genre}
                  userName={post.userName || 'Anonymous'}
                  comments={post.comments}
                  likes={post.likes}
                  createdAt={post.createdAt}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No reviews yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
