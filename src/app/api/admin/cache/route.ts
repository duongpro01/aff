import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch {
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
