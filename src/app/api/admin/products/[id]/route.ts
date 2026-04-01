import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readJsonFile, writeJsonFile } from '../../../helpers';

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = readJsonFile('products.json');
    const index = products.findIndex((p: any) => p.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    products[index] = {
      ...products[index],
      ...body,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('products.json', products);
    return NextResponse.json(products[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const products = readJsonFile('products.json');
    const product = products.find((p: any) => p.id === Number(id));

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete image directory
    if (product.slug) {
      const imgDir = path.join(process.cwd(), 'public/images/products', product.slug);
      if (fs.existsSync(imgDir)) {
        fs.rmSync(imgDir, { recursive: true, force: true });
      }
    }

    const remaining = products.filter((p: any) => p.id !== Number(id));
    writeJsonFile('products.json', remaining);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
