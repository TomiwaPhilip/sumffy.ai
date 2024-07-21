import { ipAddress, geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  console.log("I got to API");
  const { latitude, longitude, ...data } = geolocation(req);
  console.log("user geolaocation:", data);
  console.log("latitude:", latitude);
  console.log("longitude:", longitude);
  return Response.json({ latitude, longitude });
}
