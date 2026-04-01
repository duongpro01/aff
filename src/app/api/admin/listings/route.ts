import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../helpers';

export async function GET() {
  try {
    const listings = readJsonFile('listings.json');
    return NextResponse.json(listings);
  } catch {
    return NextResponse.json({ error: 'Failed to read listings' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const listings = readJsonFile('listings.json');
    const remaining = listings.filter((l: any) => !ids.includes(l.id));
    writeJsonFile('listings.json', remaining);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json({ error: 'Failed to delete listings' }, { status: 500 });
  }
}
