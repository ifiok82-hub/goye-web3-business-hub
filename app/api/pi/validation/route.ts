import { NextResponse } from 'next/server'

export async function GET() {
  const validationKey = "piappstudio-r355EFVwC0FjNDTVL5bWiqchPNFIqMA5"
  return new NextResponse(validationKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
