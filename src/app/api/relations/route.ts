import { NextResponse } from 'next/server';
import { relations } from './data';
import { persons } from '../persons/data';

export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected an array of relations.' }, { status: 400 });
  }

  const isValid = body.every(rel => {
    const data = rel.data;
    const sourceExists = persons.some(p => p.data.id === data.source);
    const targetExists = persons.some(p => p.data.id === data.target);
    console.log(persons);
    console.log(data, data.id, data.source, data.target, sourceExists, targetExists);
    return data && data.id && data.source && data.target && sourceExists && targetExists;
  });

  if (!isValid) {
    return NextResponse.json({ error: 'One or more relation entries are invalid or refer to unknown person IDs.' }, { status: 400 });
  }

  const hasDuplicate = body.some(rel =>
    relations.some(r => r.data.id === rel.data.id)
  );

  if (hasDuplicate) {
    return NextResponse.json({ error: 'One or more relation IDs already exist.' }, { status: 409 });
  }

  relations.push(...body);
  return NextResponse.json({ message: 'All relations added successfully.', count: body.length });
}

export async function GET() {
  return NextResponse.json(relations);
}