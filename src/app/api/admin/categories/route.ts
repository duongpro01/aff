import { NextResponse } from 'next/server';
import { readJsonFile } from '../../helpers';

export async function GET() {
  try {
    const categories = readJsonFile('categories.json');
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}
