// src/app/api/relations/route.ts
import { NextResponse } from 'next/server';

const mockRelations = [
  { data: { id: 'ab', source: 'a', target: 'b', label: '共同研究' } },
];

export async function GET() {
  return NextResponse.json(mockRelations);
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log('新しい関係性:', body);
  return NextResponse.json({ message: '関係性追加完了', relation: body });
}
