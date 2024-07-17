"use client";

import { ReactNode, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/server/actions/auth/login.action";
import { usePathname } from "next/navigation";
import { useSession } from "./session";
import AudioPlayer from "../forms/chat/AudioPlayer";

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
  } else if (!session?.firstName && !session?.lastName && session?.image) {
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
    <div className="flex justify-between items-center w-full xl:flex xl:justify-center xl:items-center xl:gap-4 xl:w-full">
      <div className="bg-[#090A15] p-4 rounded-full border border-[#2E3142]">
        <ul className="flex items-center gap-10">
          <li
            className={`gradient-border rounded-full ${pathname === "/" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/"
              className={"flex items-center gap-2 bg-[#090A15] rounded-full p-2"}
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
            className={`gradient-border rounded-full ${pathname === "/to-do" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/to-do"
              className={"flex items-center gap-2 bg-[#090A15] p-2 rounded-full"}
            >
              <Image
                src="/assets/icons/book.svg"
                alt="todo_icon"
                height={25}
                width={25}
              />
              To-Do
            </Link>
          </li>
          <li
            className={`gradient-border rounded-full ${pathname === "/bio-data" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/bio-data"
              className={"flex items-center gap-2 bg-[#090A15] rounded-full p-2"}
            >
              <Image
                src="/assets/icons/admin_panel_settings.svg"
                alt="settings_icon"
                height={25}
                width={25}
              />
              Bio-Data
            </Link>
          </li>
        </ul>
      </div>
      <div className="relative bg-[#090A15] p-4 rounded-full border border-[#2E3142]">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-[#090A15] p-2 rounded-full"
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
          <div className="absolute right-0 mt-2 w-48 bg-[#090A15] rounded-full shadow-lg">
            <button
              onClick={() => handleSignOut()}
              className="block w-full text-left px-4 py-2 text-sm text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <button
          className="flex items-center gap-2 gradient-to-bottom py-5 px-7 rounded-full"
        >
          <Image
            src={"/assets/icons/award_star.svg"}
            alt="premium_icon"
            height={25}
            width={25}
            className="rounded-full"
          />
          Premium
        </button>
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


export function Loaders() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}

interface IntroCardProps {
  headingText: string;
  paragraph: string;
}

export function IntroCards({ headingText, paragraph }: IntroCardProps) {
  return (
    <div className="p-5 bg-[#090A15] rounded-xl">
      <h1 className="text-[24px] text-[#4B37BF] font-semibold">{headingText}</h1>
      <p className="text-[16px] text-[#A1A3B0]">{paragraph}</p>
    </div>
  );
}


interface MessageComponentProps {
  message: string;
  userType: 'ai' | 'user';
  messageType: 'text' | 'audio';
  audioUrl?: string;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({ message, userType, messageType, audioUrl }) => {
  const aiImagePath = '/assets/icons/sumffy.svg';
  const defaultImagePath = '/assets/images/profilepic.png';
  const session = useSession();
  const userImage = session?.image;

  const getUserImage = () => {
    if (userType === 'ai') {
      return aiImagePath;
    } else if (userImage) {
      return userImage;
    } else {
      return defaultImagePath;
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <img
        src={getUserImage()}
        alt="User"
        className="w-12 h-12 rounded-full"
      />
      <div className="text-white">
        {messageType === 'text' ? (
          message
        ) : (
          messageType === 'audio' && audioUrl && (
            <AudioPlayer audioUrl={audioUrl} />
          )
        )}
      </div>
    </div>
  );
};

export const MessageComponentLoading: React.FC = () => {

  return (
    <div className="flex items-start space-x-4">
      <img
        src={"/assets/icons/sumffy.svg"}
        alt="User"
        className="w-12 h-12 rounded-full"
      />
      <div className="w-full">
        <Loaders />
      </div>
    </div>
  );
};


