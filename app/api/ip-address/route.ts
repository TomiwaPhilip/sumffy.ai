import { ipAddress, geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  console.log("I got to API");
  const { latitude, longitude, city, country, flag, countryRegion, region } =
    geolocation(req);
  console.log("user geolaocation:", city, country, flag, countryRegion, region);
  console.log("latitude:", latitude);
  console.log("longitude:", longitude);
  return Response.json({ city, country, flag, countryRegion, region });
}
