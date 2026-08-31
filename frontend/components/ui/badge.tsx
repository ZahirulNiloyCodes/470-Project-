import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }) {
  const variants = {
    default: "bg-blue-600 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-300 text-slate-800",
  };
  return <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)} {...props} />;
}
