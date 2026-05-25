import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}

const sizes = {
  narrow: "max-w-4xl",
  default: "max-w-[min(100%,96rem)]",
  wide: "max-w-[min(100%,112rem)]",
} as const;

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-10 xl:px-12",
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
