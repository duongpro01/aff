import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../helpers';

export async function GET() {
  try {
    const seoSettings = readJsonFile('seo-settings.json');
    return NextResponse.json(seoSettings);
  } catch {
    return NextResponse.json({ error: 'Failed to read SEO settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    writeJsonFile('seo-settings.json', body);
    return NextResponse.json({ success: true, data: body });
  } catch {
    return NextResponse.json({ error: 'Failed to update SEO settings' }, { status: 500 });
  }
}
