import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Mock crawled data since cheerio is not installed
    const mockData = {
      url,
      title: 'Crawled Product Title',
      description: 'Product description from crawled page',
      price: 0,
      images: [],
      specs: {},
      crawledAt: new Date().toISOString(),
      note: 'This is mock data. Install cheerio and implement actual crawling logic.',
    };

    return NextResponse.json(mockData);
  } catch {
    return NextResponse.json({ error: 'Failed to crawl URL' }, { status: 500 });
  }
}
