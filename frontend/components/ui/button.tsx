import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-slate-300 bg-transparent hover:bg-slate-100",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      ghost: "hover:bg-slate-100",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
    };
    return <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
