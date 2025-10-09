import { NextResponse } from 'next/server';
import { performClustering } from '@/utils/LouvainClustering';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const persons = await performClustering(baseUrl);

  return NextResponse.json(persons);
}
