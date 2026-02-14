// src/app/api/ai/test/route.ts

import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/ai'

export async function GET() {
  const result = await testConnection()
  
  return NextResponse.json(result)
}