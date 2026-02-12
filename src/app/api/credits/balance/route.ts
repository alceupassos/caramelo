import { NextResponse } from 'next/server';

/**
 * GET /api/credits/balance
 *
 * Returns the current credit balance.
 * For the MVP, the actual balance is managed client-side via localStorage.
 * This route exists to maintain the API pattern for future backend integration.
 */
export async function GET() {
  // In the MVP, balance is managed client-side.
  // This endpoint returns a placeholder response.
  // The client-side useCreditWallet hook is the source of truth.
  return NextResponse.json({
    success: true,
    message: 'Balance is managed client-side in MVP mode. Use the useCredits() hook.',
    balance: null,
    currency: process.env.NEXT_PUBLIC_CURRENCY_MODE || 'CREDITS',
  });
}
