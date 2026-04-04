import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getBrandsFile() {
  return path.join(process.cwd(), 'src', 'data', 'doll-brands.json');
}

function readBrands() {
  const file = getBrandsFile();
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeBrands(brands: any[]) {
  fs.writeFileSync(getBrandsFile(), JSON.stringify(brands, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const brands = readBrands();
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json({ error: 'Failed to read brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brands = readBrands();

    const maxId = brands.reduce((max: number, b: any) => Math.max(max, b.id || 0), 0);

    const newBrand = {
      id: maxId + 1,
      name: body.name || '',
      slug: body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
      image: body.image || '',
      description: body.description || '',
    };

    brands.push(newBrand);
    writeBrands(brands);

    return NextResponse.json(newBrand, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const brands = readBrands();

    const index = brands.findIndex((b: any) => b.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    brands[index] = { ...brands[index], ...body };
    writeBrands(brands);

    return NextResponse.json(brands[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const brands = readBrands();

    const remaining = brands.filter((b: any) => b.id !== id);
    writeBrands(remaining);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
