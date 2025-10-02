import { NextResponse } from 'next/server';

let persons: any[] = [
  { data: { id: 'a', label: '田中 太郎', role: '研究者' } },
  { data: { id: 'b', label: '佐藤 花子', role: '助手' } },
];

export async function GET() {
  return NextResponse.json(persons);
}

export async function POST(req: Request) {
  const body = await req.json();

  // 追加処理（メモリ上）
  persons.push(body);

  return NextResponse.json({ message: '人物追加完了', person: body });
}
