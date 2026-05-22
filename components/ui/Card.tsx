"use client";
import { CSSProperties } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  style?: CSSProperties;
}

const padMap: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  style,
}: CardProps) {
  return (
    <div
      className={`card ${hover ? "card-hover" : ""} ${padMap[padding]} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
