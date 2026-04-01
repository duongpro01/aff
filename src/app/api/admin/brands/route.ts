import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateSlug, getNextId } from '../../helpers';

export async function GET() {
  try {
    const brands = readJsonFile('brands.json');
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json({ error: 'Failed to read brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brands = readJsonFile('brands.json');

    const newBrand = {
      ...body,
      id: getNextId(brands),
      slug: generateSlug(body.name || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brands.push(newBrand);
    writeJsonFile('brands.json', brands);

    return NextResponse.json(newBrand, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
