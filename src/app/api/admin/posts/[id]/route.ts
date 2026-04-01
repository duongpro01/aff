import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readJsonFile, writeJsonFile } from '../../../helpers';

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const posts = readJsonFile('posts.json');
    const index = posts.findIndex((p: any) => p.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[index] = {
      ...posts[index],
      ...body,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('posts.json', posts);
    return NextResponse.json(posts[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const posts = readJsonFile('posts.json');
    const post = posts.find((p: any) => p.id === Number(id));

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete image directory
    if (post.slug) {
      const imgDir = path.join(process.cwd(), 'public/images/posts', post.slug);
      if (fs.existsSync(imgDir)) {
        fs.rmSync(imgDir, { recursive: true, force: true });
      }
    }

    const remaining = posts.filter((p: any) => p.id !== Number(id));
    writeJsonFile('posts.json', remaining);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
