import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateSlug, getNextId } from '../../helpers';

type BrandSource = 'products' | 'dolls';

function getFileName(source: BrandSource): string {
  return source === 'dolls' ? 'doll-brands.json' : 'brands.json';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') as BrandSource) || 'products';
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Return all brands from both sources
      const productBrands = readJsonFile('brands.json').map((b: Record<string, unknown>) => ({
        ...b,
        source: 'products',
      }));
      const dollBrands = readJsonFile('doll-brands.json').map((b: Record<string, unknown>) => ({
        ...b,
        source: 'dolls',
      }));
      return NextResponse.json({
        products: productBrands,
        dolls: dollBrands,
        total: productBrands.length + dollBrands.length,
      });
    }

    const brands = readJsonFile(getFileName(source));
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json({ error: 'Failed to read brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') as BrandSource) || 'products';
    const fileName = getFileName(source);

    const body = await request.json();
    const brands = readJsonFile(fileName);

    const newBrand = {
      ...body,
      id: getNextId(brands),
      slug: generateSlug(body.name || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brands.push(newBrand);
    writeJsonFile(fileName, brands);

    return NextResponse.json(newBrand, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') as BrandSource) || 'products';
    const fileName = getFileName(source);

    const body = await request.json();
    const brands = readJsonFile(fileName);

    const idx = brands.findIndex((b: Record<string, unknown>) => b.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    brands[idx] = {
      ...brands[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(fileName, brands);

    return NextResponse.json(brands[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') as BrandSource) || 'products';
    const id = parseInt(searchParams.get('id') || '0');
    const fileName = getFileName(source);

    if (!id) {
      return NextResponse.json({ error: 'Brand ID required' }, { status: 400 });
    }

    const brands = readJsonFile(fileName);
    const filtered = brands.filter((b: Record<string, unknown>) => b.id !== id);

    if (filtered.length === brands.length) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    writeJsonFile(fileName, filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
