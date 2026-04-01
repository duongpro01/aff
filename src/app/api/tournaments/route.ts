import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateSlug, getNextId } from '../helpers';

export async function GET() {
  try {
    const tournaments = readJsonFile('tournaments.json');
    return NextResponse.json(tournaments);
  } catch {
    return NextResponse.json({ error: 'Failed to read tournaments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tournaments = readJsonFile('tournaments.json');

    const newTournament = {
      ...body,
      id: getNextId(tournaments),
      slug: generateSlug(body.name || body.title || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tournaments.push(newTournament);
    writeJsonFile('tournaments.json', tournaments);

    return NextResponse.json(newTournament, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
