import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, getNextId } from '../../helpers';

export async function GET() {
  try {
    const redirects = readJsonFile('redirects.json');
    return NextResponse.json(redirects);
  } catch {
    return NextResponse.json({ error: 'Failed to read redirects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const redirects = readJsonFile('redirects.json');

    const newRedirect = {
      ...body,
      id: getNextId(redirects),
      createdAt: new Date().toISOString(),
    };

    redirects.push(newRedirect);
    writeJsonFile('redirects.json', redirects);

    return NextResponse.json(newRedirect, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create redirect' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const redirects = readJsonFile('redirects.json');
    const index = redirects.findIndex((r: any) => r.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });
    }

    redirects[index] = {
      ...redirects[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('redirects.json', redirects);
    return NextResponse.json(redirects[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update redirect' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const redirects = readJsonFile('redirects.json');
    const remaining = redirects.filter((r: any) => r.id !== id);

    if (remaining.length === redirects.length) {
      return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });
    }

    writeJsonFile('redirects.json', remaining);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete redirect' }, { status: 500 });
  }
}
