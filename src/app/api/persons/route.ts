import { NextResponse } from 'next/server';
import { persons } from '../persons/data';

export async function GET() {
  return NextResponse.json(persons);
}

export async function POST(req: Request) {
  const body = await req.json();

  // 追加処理（メモリ上）
  persons.push(body);

  return NextResponse.json({ message: '人物追加完了', person: body });
}
