import { ipAddress } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const ip = ipAddress(req);
    Response.json({ ip });
}
