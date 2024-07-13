"use client";

import { ReactNode, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/server/actions/auth/login.action";
import { usePathname } from "next/navigation";
import { useSession } from "./session";

export function Nav() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const session = useSession();

  // Replace these with actual user data fetching logic
  let user;
  if (session?.firstName && session?.lastName && !session?.image) {
    user = {
      name: `${session?.firstName} ${session?.lastName}`,
      profileImage: "/assets/images/profilepic.png",
    };
  } else if(!session?.firstName && !session?.lastName && session?.image) {
    user = {
      name: "New User",
      profileImage: `${session?.image}`,
    };
  } else if (session?.firstName && session?.lastName && session?.image) {
    user = {
      name: `${session?.firstName} ${session?.lastName}`,
      profileImage: `${session?.image}`,
    };    
  }
  else {
    user = {
      name: "New User",
      profileImage: "/assets/images/profilepic.png",
    }
  };

  const handleSignOut = async () => {
    console.log("I am signing out")
    await signOut();
  };


  return (
    <div className="flex justify-center items-center gap-4">
      <div className="bg-[#0E1018] p-4 rounded-full border border-[#131621]">
        <ul className="flex items-center gap-10">
          <li
            className={`gradient-border rounded-full ${pathname === "/" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/"
              className={"flex items-center gap-2 bg-[#0E1018] rounded-full p-2"}
            >
              <Image
                src="/assets/icons/add_home.svg"
                alt="home_icon"
                height={25}
                width={25}
              />
              Home
            </Link>
          </li>
          <li
            className={`gradient-border rounded-full ${pathname === "/payments" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/payments"
              className={"flex items-center gap-2 bg-[#0E1018] p-2 rounded-full"}
            >
              <Image
                src="/assets/icons/monetization_on.svg"
                alt="payments_icon"
                height={25}
                width={25}
              />
              Payments
            </Link>
          </li>
          <li
            className={`gradient-border rounded-full ${pathname === "/settings" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/settings"
              className={"flex items-center gap-2 bg-[#0E1018] rounded-full p-2"}
            >
              <Image
                src="/assets/icons/admin_panel_settings.svg"
                alt="settings_icon"
                height={25}
                width={25}
              />
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div className="relative bg-[#0E1018] p-4 rounded-full border border-[#131621]">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-[#0E1018] p-2 rounded-full"
        >
          <Image
            src={user.profileImage}
            alt="profile_image"
            height={25}
            width={25}
            className="rounded-full"
          />
          {user.name}
          <Image
            src="/assets/icons/chevron_down.svg"
            alt="chevron_down_icon"
            height={20}
            width={20}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0E1018] rounded-full shadow-lg">
            <button
              onClick={() => handleSignOut()}
              className="block w-full text-left px-4 py-2 text-sm text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


interface CardProps {
    children: ReactNode;
  }
  
  export function Card({ children }: CardProps): JSX.Element {
    return (
      <div className="cards-bg border-2 border-[#444759] p-10 min-w-[300px] max-w-[500px] min-h-[200px] flex items-center justify-center rounded-lg">
        {children}
      </div>
    );
  }


  interface StatusMessageProps {
    message: string;
    type: "error" | "success";
  }
  
  export const StatusMessage: React.FC<StatusMessageProps> = ({
    message,
    type,
  }) => {
    const [isVisible, setIsVisible] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Message disappears after 10 seconds
  
      return () => clearTimeout(timer);
    }, []);
  
    const iconSrc =
      type === "error" ? "/assets/icons/problem.svg" : "/assets/icons/book.svg";
  
    return (
      <div
        className={`fixed top-5 right-5 p-3 rounded-md text-white flex items-center ${type === "error" ? "bg-[#7A7D93]" : "bg-[#B862B0]"
          } ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      >
        <div className="flex-shrink-0 mr-3">
          <Image src={iconSrc} alt="Icon" width={24} height={24} />
        </div>
        <div>{message}</div>
      </div>
    );
  };
  