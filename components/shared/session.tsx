"use client";

import React, { ReactNode, useState, useEffect } from "react";

import { SessionData } from "@/server/session/session.config";
import { getSession2 } from "@/server/session/session.action";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionData = await getSession2();
        setSession(sessionData);
      } catch (error) {
        console.error("Error getting session:", error);
      }
    }

    fetchSession();
  }, []);

  return session;
}