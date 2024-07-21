import { ipAddress, geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  console.log("I got to API");
  const ip = ipAddress(req);
  const details = geolocation(req);
  console.log("user geolaocation:", details);
  console.log("user Ip:", ip);
  return Response.json({ ip });
}
