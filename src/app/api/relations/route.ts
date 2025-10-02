import { NextResponse } from 'next/server';

let relations: any[] = [
  { data: { id: 'ab', source: 'a', target: 'b', label: '共同研究' } },
];

export async function GET() {
  return NextResponse.json(relations);
}

export async function POST(req: Request) {
  const body = await req.json();

  // 追加処理（メモリ上）
  relations.push(body);

  return NextResponse.json({ message: '関係性追加完了', relation: body });
}