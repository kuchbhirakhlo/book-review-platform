'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [envReady, setEnvReady] = useState(true);

  useEffect(() => {
    // Check if Firebase env vars are available
    const firebaseReady = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
    
    if (!firebaseReady) {
      setEnvReady(false);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/get?limit=6&sortBy=latest');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (!envReady) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">Setup Required</h2>
            <p className="text-amber-800 mb-4">
              Please add your Firebase environment variables to get started. Click "Vars" in the left sidebar to configure them.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Discover Thoughtful Book Reviews
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Explore curated literary critiques, connect with fellow readers, and discover your next great read.
          </p>
          <Link href="/browse">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Reviews
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 py-16 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">500+</h3>
            <p className="text-muted-foreground">Book Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">2K+</h3>
            <p className="text-muted-foreground">Active Readers</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">4.8</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">50+</h3>
            <p className="text-muted-foreground">Genres</p>
          </div>
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">Latest Reviews</h2>
            <Link href="/browse">
              <Button variant="ghost" className="text-primary hover:bg-secondary">
                View All
              </Button>
            </Link>
          </div>

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
              {posts.map((post) => (
                <ReviewCard
                  key={post.id}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No reviews yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-foreground mb-4">Literary Reviews</h3>
              <p className="text-sm text-muted-foreground">Discover thoughtful book reviews from readers worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="text-muted-foreground hover:text-primary transition">Browse</Link></li>
                <li><Link href="/genres" className="text-muted-foreground hover:text-primary transition">Genres</Link></li>
                <li><Link href="/top-rated" className="text-muted-foreground hover:text-primary transition">Top Rated</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Guidelines</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 Literary Reviews. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
