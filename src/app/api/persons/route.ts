import { NextResponse } from 'next/server';
import { persons } from './data';

export async function POST(req: Request) {
  const body = await req.json();

  // 配列であることを確認
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid data format. Expected an array.' }, { status: 400 });
  }

  // 全件の妥当性チェック（idとnameが必須）
  const isValid = body.every(person => person.data.id && person.data.label);
  if (!isValid) {
    return NextResponse.json({ error: 'One or more person entries are invalid.' }, { status: 400 });
  }

  // 重複チェック（既存のidと重複していないか）
  const hasDuplicate = body.some(person => persons.some(p => p.id === person.data.id));
  if (hasDuplicate) {
    return NextResponse.json({ error: 'One or more person IDs already exist.' }, { status: 409 });
  }

  // すべて問題なければ追加
  persons.push(...body);
  console.log('Added persons:', body);

  return NextResponse.json({ message: 'All persons added successfully', count: body.length });
}

export async function GET() {
  return NextResponse.json(persons);
}