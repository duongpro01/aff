import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '../../../helpers';

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const brands = readJsonFile('brands.json');
    const index = brands.findIndex((b: any) => b.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    brands[index] = {
      ...brands[index],
      ...body,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile('brands.json', brands);
    return NextResponse.json(brands[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const brands = readJsonFile('brands.json');
    const remaining = brands.filter((b: any) => b.id !== Number(id));

    if (remaining.length === brands.length) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    writeJsonFile('brands.json', remaining);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
