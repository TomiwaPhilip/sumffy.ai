"use client";

import { ReactNode, useEffect, useState } from "react";

import Image from "next/image";

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
  