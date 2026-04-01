import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateSlug, getNextId } from '../../helpers';

export async function GET() {
  try {
    const posts = readJsonFile('posts.json');
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: 'Failed to read posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posts = readJsonFile('posts.json');

    const newPost = {
      ...body,
      id: getNextId(posts),
      slug: generateSlug(body.title || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(newPost);
    writeJsonFile('posts.json', posts);

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const posts = readJsonFile('posts.json');
    const remaining = posts.filter((p: any) => !ids.includes(p.id));
    writeJsonFile('posts.json', remaining);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
  }
}
