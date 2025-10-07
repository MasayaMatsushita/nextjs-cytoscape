import { NextResponse } from 'next/server';
import { calculateGraphDensity, calculateClusteringCoefficient } from '@/utils/NetworkAnalysis';

export async function GET() {
  const baseUrl = 'http://localhost:3000';
  const [graphDensity, clusteringCoefficient] = await Promise.all([
    calculateGraphDensity(baseUrl),
    calculateClusteringCoefficient(baseUrl),
  ]);

  return NextResponse.json({
    graphDensity,
    clusteringCoefficient,
  });
}