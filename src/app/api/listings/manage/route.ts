import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../helpers';

export async function POST(request: NextRequest) {
  try {
    const { manageCode, markAsSold } = await request.json();

    if (!manageCode) {
      return NextResponse.json({ error: 'Manage code is required' }, { status: 400 });
    }

    const listings = readJsonFile('listings.json');
    const index = listings.findIndex((l: any) => l.manageCode === manageCode);

    if (index === -1) {
      return NextResponse.json({ error: 'Listing not found with this manage code' }, { status: 404 });
    }

    if (markAsSold) {
      listings[index] = {
        ...listings[index],
        status: 'sold',
        updatedAt: new Date().toISOString(),
      };
      writeJsonFile('listings.json', listings);
    }

    return NextResponse.json(listings[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to manage listing' }, { status: 500 });
  }
}
