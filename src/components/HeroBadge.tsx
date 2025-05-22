"use client";

import React from "react";
import { motion, useAnimation, type Variants } from "framer-motion";
import { cn } from "../lib/utils";

const ease = [0.16, 1, 0.3, 1];

interface HeroBadgeProps {
  href?: string;
  text: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const badgeVariants: Record<string, string> = {
  default: "bg-black/40 hover:bg-black/50 backdrop-blur-md",
  outline: "border-2 bg-black/30 hover:bg-black/40 backdrop-blur-md",
  ghost: "bg-black/20 hover:bg-black/30 backdrop-blur-md",
};

const sizeVariants: Record<string, string> = {
  sm: "px-3 py-1 text-xs gap-1.5",
  md: "px-4 py-1.5 text-sm gap-2",
  lg: "px-5 py-2 text-base gap-2.5",
};

const iconAnimationVariants: Variants = {
  initial: { rotate: 0 },
  hover: { rotate: -10 },
};

export function HeroBadge({
  href,
  text,
  icon,
  endIcon,
  variant = "default",
  size = "md",
  className,
  onClick,
}: HeroBadgeProps) {
  const controls = useAnimation();

  const BadgeWrapper = href ? "a" : motion.button;
  const wrapperProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick };

  const baseClassName = cn(
    "inline-flex items-center rounded-full border border-white/10 text-white transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
    badgeVariants[variant],
    sizeVariants[size],
    className
  );

  return (
    <BadgeWrapper
      {...wrapperProps}
      className={cn("group", href && "cursor-pointer")}
    >
      <motion.div
        className={baseClassName}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        onHoverStart={() => controls.start("hover")}
        onHoverEnd={() => controls.start("initial")}
        whileHover={{ 
          boxShadow: "0 5px 14px rgba(0,0,0,0.2)",
          transition: { duration: 0.2 }
        }}
      >
        {icon && (
          <motion.div
            className="text-white/60 pl-2 transition-colors group-hover:text-white"
            variants={iconAnimationVariants}
            initial="initial"
            animate={controls}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {icon}
          </motion.div>
        )}
        <span className="pl-2 py-[1px]">{text}</span>
        {endIcon && (
          <motion.div className="text-white/60 pr-2 group-hover:text-white">
            {endIcon}
          </motion.div>
        )}
      </motion.div>
    </BadgeWrapper>
  );
}

// Export the component as AnimatedShinyText for backward compatibility
export const AnimatedShinyText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};