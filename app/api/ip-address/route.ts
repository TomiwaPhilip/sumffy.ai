import { ipAddress, geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  console.log("I got to API");
  const {latitude, longitude, ...data} = geolocation(req);
  console.log("user geolaocation:", data);
  return Response.json({ latitude, longitude });
}
