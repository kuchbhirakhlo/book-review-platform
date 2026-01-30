import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, FieldValue, doc, getDoc } from 'firebase/firestore';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, bookTitle, authorName, rating, content, excerpt, bookCover, userId, userName, genre, slug, status, publicationYear } = body;

    // Validate required fields
    if (!title || !bookTitle || !content || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get user's role from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    // Only admin or editor can create posts
    if (userRole !== 'admin' && userRole !== 'editor') {
      return NextResponse.json(
        { error: 'Only admins and editors can create posts' },
        { status: 403 }
      );
    }

    // Editors can only create drafts or submit for review
    const postStatus = userRole === 'editor' 
      ? (status === 'published' ? 'review' : status || 'draft')
      : (status || 'published');

    // Generate slug from title if not provided
    const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create post document matching Firestore rules schema
    const postData = {
      title,
      slug: postSlug,
      excerpt: excerpt || content.substring(0, 297) + '...',
      content,
      bookTitle,
      authorName: authorName || userName,
      genre: Array.isArray(genre) ? genre : [genre || 'General'],
      rating: parseFloat(rating),
      coverImage: bookCover || null,
      publicationYear: publicationYear || null,
      status: postStatus,
      authorId: userId,
      authorRole: userRole,
      createdAt: serverTimestamp() as FieldValue,
      updatedAt: serverTimestamp() as FieldValue,
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);

    return NextResponse.json({
      id: docRef.id,
      ...postData,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create post: ' + errorMessage },
      { status: 500 }
    );
  }
}
