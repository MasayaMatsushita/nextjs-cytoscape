import { NextResponse } from 'next/server';
import { relations } from '../relations/data';
import { persons } from '../persons/data';

export async function POST(req: Request) {
  const body = await req.json();
  const data = body.data;

  if (!data || !data.id || !data.source || !data.target) {
    return NextResponse.json({ error: 'Invalid relation data.' }, { status: 400 });
  }

  // sourceとtargetの人物IDが存在するか確認
  const sourceExists = persons.some(p => p.data.id === data.source);
  const targetExists = persons.some(p => p.data.id === data.target);

  if (!sourceExists || !targetExists) {
    return NextResponse.json({ error: 'Source or target person ID does not exist.' }, { status: 404 });
  }

  const exists = relations.some(r => r.data.id === data.id);
  if (exists) {
    return NextResponse.json({ error: 'Relation ID already exists.' }, { status: 409 });
  }

  relations.push(body);
  return NextResponse.json({ message: 'Relation added successfully.' });
}