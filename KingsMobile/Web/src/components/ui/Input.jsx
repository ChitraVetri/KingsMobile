import React from 'react';
import { cn } from '../../utils/cn.jsx';

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const inputId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-secondary-400">
              {leftIcon}
            </div>
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "block w-full rounded-lg border-0 py-2 px-3 text-secondary-900 shadow-sm ring-1 ring-inset ring-secondary-300 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-colors",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "ring-danger-300 focus:ring-danger-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="text-secondary-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
