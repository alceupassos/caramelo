import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameId = url.searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
  }

  // Mock data for demonstration - in production, fetch from database
  return NextResponse.json({
    gameId,
    serverSeed: 'demo_server_seed_revealed_after_game',
    clientSeed: 'demo_client_seed',
    nonce: 1,
    hashedServerSeed: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    result: 0.42,
    gameType: 'crash',
    message: 'This is a demo endpoint. In production, seeds are stored in the database.',
  });
}
