"use client";

import { forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-indigo-600 hover:bg-indigo-500 text-white",
  secondary: "bg-slate-800 hover:bg-slate-700 text-white",
  destructive: "bg-red-600/10 hover:bg-red-600/20 text-red-400",
  ghost: "hover:bg-slate-800 text-slate-400 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-5",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", loading = false, disabled, type = "button", onClick, children }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
