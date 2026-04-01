import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile } from '../../helpers';

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const listings = readJsonFile('listings.json');
    const listing = listings.find(
      (l: any) => l.slug === slug && l.status === 'approved'
    );

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Hide manageCode from public view
    const { manageCode, ...publicListing } = listing;
    return NextResponse.json(publicListing);
  } catch {
    return NextResponse.json({ error: 'Failed to read listing' }, { status: 500 });
  }
}
