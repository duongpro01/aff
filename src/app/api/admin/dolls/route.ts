import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getDollsFile() {
  return path.join(process.cwd(), 'src', 'data', 'dolls.json');
}

function readDolls() {
  const file = getDollsFile();
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeDolls(dolls: any[]) {
  fs.writeFileSync(getDollsFile(), JSON.stringify(dolls, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const dolls = readDolls();
    return NextResponse.json(dolls);
  } catch {
    return NextResponse.json({ error: 'Failed to read dolls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dolls = readDolls();

    const maxId = dolls.reduce((max: number, d: any) => Math.max(max, d.id || 0), 0);

    const newDoll = {
      ...body,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dolls.push(newDoll);
    writeDolls(dolls);

    return NextResponse.json(newDoll, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create doll' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const dolls = readDolls();

    const index = dolls.findIndex((d: any) => d.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Doll not found' }, { status: 404 });
    }

    dolls[index] = {
      ...dolls[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeDolls(dolls);
    return NextResponse.json(dolls[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update doll' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const dolls = readDolls();
    const dollsToDelete = dolls.filter((d: any) => ids.includes(d.id));

    // Delete image directories
    for (const doll of dollsToDelete) {
      if (doll.slug) {
        const imgDir = path.join(process.cwd(), 'public/images/dolls', doll.slug);
        if (fs.existsSync(imgDir)) {
          fs.rmSync(imgDir, { recursive: true, force: true });
        }
      }
    }

    const remaining = dolls.filter((d: any) => !ids.includes(d.id));
    writeDolls(remaining);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json({ error: 'Failed to delete dolls' }, { status: 500 });
  }
}
