import { ReactNode } from "react";

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