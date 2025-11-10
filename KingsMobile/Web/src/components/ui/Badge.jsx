import React from 'react';
import { cn } from '../../utils/cn.jsx';

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "md",
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium transition-colors";
  
  const variants = {
    default: "bg-secondary-100 text-secondary-800",
    primary: "bg-primary-100 text-primary-800",
    secondary: "bg-secondary-100 text-secondary-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    danger: "bg-danger-100 text-danger-800",
    outline: "border border-secondary-200 text-secondary-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };
