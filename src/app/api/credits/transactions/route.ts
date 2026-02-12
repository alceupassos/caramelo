import { NextResponse } from 'next/server';

/**
 * GET /api/credits/transactions
 *
 * Returns transaction history.
 * For the MVP, transactions are managed client-side via localStorage.
 * This route exists to maintain the API pattern for future backend integration.
 */
export async function GET() {
  // In the MVP, transactions are managed client-side.
  // This endpoint returns a placeholder response.
  // The client-side useCreditWallet hook is the source of truth.
  return NextResponse.json({
    success: true,
    message: 'Transactions are managed client-side in MVP mode. Use the useCredits() hook.',
    transactions: [],
  });
}
