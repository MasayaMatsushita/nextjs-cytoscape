import { NextResponse } from 'next/server';

// メモリ上の人物デー
import { persons } from '../persons/data';

let relations: any[] = [
  { data: { id: 'ab', source: 'a', target: 'b', label: '共同研究' } },
];

// GET: 関係性一覧取得
export async function GET() {
  return NextResponse.json(relations);
}

// POST: 関係性追加（source/targetが存在する場合のみ）
export async function POST(req: Request) {
  const body = await req.json();
  const { source, target } = body.data;

  const sourceExists = persons.some(p => p.data.id === source);
  const targetExists = persons.some(p => p.data.id === target);

  if (!sourceExists || !targetExists) {
    return NextResponse.json(
      { error: '指定された人物IDが存在しません' },
      { status: 400 }
    );
  }

  relations.push(body);
  return NextResponse.json({ message: '関係性追加完了', relation: body });
}