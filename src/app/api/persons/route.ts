// src/app/api/persons/route.ts
import { NextResponse } from 'next/server';

const mockPersons = [
  { data: { id: 'a', label: '田中 太郎', role: '研究者' } },
  { data: { id: 'b', label: '佐藤 花子', role: '助手' } },
];

export async function GET() {
  return NextResponse.json(mockPersons);
}

export async function POST(req: Request) {
  const body = await req.json();
  // 本来はDBに保存する処理を書く
  console.log('新しい人物:', body);
  return NextResponse.json({ message: '人物追加完了', person: body });
}
