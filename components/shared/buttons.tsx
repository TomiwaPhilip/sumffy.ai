"use client";

import React from "react";
import { RiLoader4Line } from "react-icons/ri";
import { handleGoogleLogin } from "@/server/actions/auth/login.action";
import Image from "next/image";

const GoogleButton: React.FC = () => {
  return (
    <button
      onClick={() => handleGoogleLogin()}
      className="flex items-center justify-center w-full py-2 px-4 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <img
        src="/assets/icons/Google.svg"
        alt="google_icon"
        width={30}
        height={30}
        className="mr-4"
      />
      Continue with Google
    </button>
  );
};

export default GoogleButton;

export function NoOutlineButtonBig({
  name,
  type,
  disabled,
  loading,
  onclick,
}: {
  name: string;
  type: "submit" | "button";
  disabled?: boolean;
  loading?: boolean;
  onclick?: () => void;
}) {
  return (
    <button
      type={type}
      className="mt-5 gradient-to-right rounded-lg p-4 flex items-center justify-center text-center"
      disabled={disabled}
      onClick={onclick}
    >
      {loading ? <RiLoader4Line className="animate-spin text-2xl" /> : name}
    </button>
  );
}

function BtnName({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Image
        src={"/assets/icons/book.svg"}
        alt="save_icon"
        height={25}
        width={25}
      />
      {name}
    </div>
  );
}

export function OutlineButtonSm({
  name,
  type,
  disabled,
  loading,
  onclick,
}: {
  name: string;
  type: "submit" | "button";
  disabled?: boolean;
  loading?: boolean;
  onclick?: () => void;
}) {
  return (
    <button
      type={type}
      className="mt-8 bg-[#4B37BF] rounded-full flex items-center justify-center text-center py-2 px-4"
      disabled={disabled}
      onClick={onclick}
    >
      {loading ? (
        <RiLoader4Line className="animate-spin text-2xl" />
      ) : (
        <BtnName name={name} />
      )}
    </button>
  );
}

interface NoOutlineButtonIconProps {
  name: string;
  type: "submit" | "button";
  disabled?: boolean;
  loading?: boolean;
  iconSrc: string;
  onClick?: () => void;
  buttonClassName?: string;
  iconClassName?: string;
}

export function NoOutlineButtonIcon({
  name,
  type,
  disabled,
  loading,
  iconSrc,
  onClick,
  buttonClassName,
  iconClassName,
}: NoOutlineButtonIconProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <button
      type={type}
      className={`bg-[#4B37BF] rounded-lg flex items-center justify-center text-center py-2 px-4 ${buttonClassName}`}
      disabled={disabled}
      onClick={handleClick}
    >
      <div className={`mr-2 ${iconClassName}`}>
        <Image
          src={iconSrc}
          alt="Button Icon"
          height={20}
          width={20}
          className="rounded-full" // Adding rounded-full class to the image
        />
      </div>
      {loading ? (
        <RiLoader4Line className="animate-spin text-2xl" />
      ) : (
        <p className="transaction-text">{name}</p>
      )}
    </button>
  );
}
