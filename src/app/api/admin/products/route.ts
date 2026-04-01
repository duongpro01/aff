import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readJsonFile, writeJsonFile, generateSlug, getNextId } from '../../helpers';

export async function GET() {
  try {
    const products = readJsonFile('products.json');
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = readJsonFile('products.json');

    const newProduct = {
      ...body,
      id: getNextId(products),
      slug: generateSlug(body.name || body.title || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    writeJsonFile('products.json', products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const products = readJsonFile('products.json');
    const productsToDelete = products.filter((p: any) => ids.includes(p.id));

    // Delete image directories
    for (const product of productsToDelete) {
      if (product.slug) {
        const imgDir = path.join(process.cwd(), 'public/images/products', product.slug);
        if (fs.existsSync(imgDir)) {
          fs.rmSync(imgDir, { recursive: true, force: true });
        }
      }
    }

    const remaining = products.filter((p: any) => !ids.includes(p.id));
    writeJsonFile('products.json', remaining);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
  }
}
