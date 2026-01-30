import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sortBy') || 'latest';
    const pageLimit = parseInt(searchParams.get('limit') || '10', 10);

    let q;

    if (userId) {
      // Get posts by specific user
      q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
      );
    } else if (genre) {
      // Get posts by genre
      q = query(
        collection(db, 'posts'),
        where('genre', '==', genre),
        where('published', '==', true),
        orderBy(sortBy === 'popular' ? 'likes' : 'createdAt', 'desc'),
        limit(pageLimit)
      );
    } else {
      // Get all published posts
      q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy(sortBy === 'popular' ? 'likes' : 'createdAt', 'desc'),
        limit(pageLimit)
      );
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
