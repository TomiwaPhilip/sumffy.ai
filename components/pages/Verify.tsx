"use client";

import { useState } from "react";

import { RiLoader4Line } from "react-icons/ri";
import { useSearchParams } from "next/navigation";
import { verifyUserTokenAndLogin } from "@/server/actions/auth/login.action";
import { NoOutlineButtonBig } from "@/components/shared/buttons";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [verifyResult, setVerifyResult] = useState(
    "Click the below button to verify your email",
  );
  const [loading, setLoading] = useState(false); // Set loading to false initially

  const token = searchParams.get("token") as string;

  const handleVerify = async () => {
    try {
      setLoading(true); // Set loading to true before verification
      const result = await verifyUserTokenAndLogin(token);
      if (result.newUser) {
        setVerifyResult("You're verified");

        if (result.newUser == true) {
          // Redirect to copy secret page
          window.location.href = "/auth/secret";
        } else {
          // Redirect to home page if verified
          window.location.href = "/";
        }
      } else if(result.error) {
        setVerifyResult(result.error);
        // Redirect to sign-in page if not verified
        window.location.href = "/auth/signin";
      }
    } catch (error: any) {
      console.error("Error verifying token:", error.message);
      setVerifyResult("Error verifying token");
    } finally {
      setLoading(false); // Set loading to false after verification
    }
  };

  return (
    <main className="text-center">
      {loading ? (
        <RiLoader4Line className="animate-spin text-2xl mb-4" />
      ) : (
        <p className="text-center text-xl font-bold p-5">{verifyResult}</p>
      )}
      <span onClick={handleVerify}>
        <NoOutlineButtonBig type="button" name="Verify Me" disabled={loading} />
      </span>
    </main>
  );
}