import { NextRequest, NextResponse } from 'next/server';
import { calculateDegreeCentrality } from '@/utils/DegreeCentrality';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  try {
    const data = await calculateDegreeCentrality(baseUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error('中心性計算エラー:', error);
    return NextResponse.json({
      error: '中心性の計算に失敗しました',
      data: [],
    }, { status: 500 });
  }
}