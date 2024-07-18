import { ipAddress } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    console.log("I got to API")
    const ip = ipAddress(req);
    console.log("user Ip:", ip);
    Response.json({ ip });
}
