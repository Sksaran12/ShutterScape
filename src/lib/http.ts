import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export function dbUnavailable() {
  return NextResponse.json(
    {
      success: false,
      message:
        'Database is not configured. Add MONGODB_URI to .env.local to enable content management.',
    },
    { status: 503 }
  );
}

export function unauthorized() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized.' },
    { status: 401 }
  );
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      success: false,
      message: 'Too many requests. Please wait and try again.',
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    }
  );
}

export function serverError(error: unknown, context: string) {
  console.error(context, error);

  if (error instanceof mongoose.Error.ValidationError) {
    const first = Object.values(error.errors)[0];
    return NextResponse.json(
      { success: false, message: first?.message || 'Invalid data.' },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { success: false, message: 'Invalid identifier.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, message: 'The server could not complete the request.' },
    { status: 500 }
  );
}

export function notFound() {
  return NextResponse.json(
    { success: false, message: 'Not found.' },
    { status: 404 }
  );
}
