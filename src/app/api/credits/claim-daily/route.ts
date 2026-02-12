import { NextResponse } from 'next/server';

/**
 * POST /api/credits/claim-daily
 *
 * Claims the daily bonus credits.
 * For the MVP, the actual claim logic is managed client-side via localStorage.
 * This route exists to maintain the API pattern for future backend integration.
 */
export async function POST() {
  // In the MVP, daily bonus is managed client-side.
  // This endpoint returns a placeholder response.
  // The client-side useCreditWallet hook is the source of truth.
  return NextResponse.json({
    success: true,
    message: 'Daily bonus is managed client-side in MVP mode. Use the useCredits() hook.',
    bonus: Number(process.env.NEXT_PUBLIC_DAILY_BONUS) || 500,
    newBalance: null,
  });
}
