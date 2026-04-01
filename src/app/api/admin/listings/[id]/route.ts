import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../../helpers';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const listings = readJsonFile('listings.json');
    const listing = listings.find((l: any) => l.id === Number(id));

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch {
    return NextResponse.json({ error: 'Failed to read listing' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const listings = readJsonFile('listings.json');
    const index = listings.findIndex((l: any) => l.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    listings[index] = {
      ...listings[index],
      ...body,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('listings.json', listings);
    return NextResponse.json(listings[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const listings = readJsonFile('listings.json');
    const remaining = listings.filter((l: any) => l.id !== Number(id));

    if (remaining.length === listings.length) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    writeJsonFile('listings.json', remaining);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
