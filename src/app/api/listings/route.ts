import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateSlug, generateManageCode, getNextId } from '../helpers';

export async function GET() {
  try {
    const listings = readJsonFile('listings.json');
    const approved = listings
      .filter((l: any) => l.status === 'approved')
      .map((l: any) => {
        const { manageCode, ...rest } = l;
        // Partially hide phone number
        if (rest.phone) {
          rest.phone = rest.phone.slice(0, 4) + '****' + rest.phone.slice(-2);
        }
        return rest;
      });

    return NextResponse.json(approved);
  } catch {
    return NextResponse.json({ error: 'Failed to read listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listings = readJsonFile('listings.json');

    const newListing = {
      ...body,
      id: getNextId(listings),
      slug: generateSlug(body.title || ''),
      status: 'pending',
      manageCode: generateManageCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    listings.push(newListing);
    writeJsonFile('listings.json', listings);

    return NextResponse.json(
      {
        success: true,
        manageCode: newListing.manageCode,
        id: newListing.id,
        slug: newListing.slug,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
