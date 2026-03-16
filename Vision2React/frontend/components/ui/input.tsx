import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const baseStyles = 'w-full px-4 py-3 rounded-lg bg-card border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50';
    const errorStyles = error ? 'border-red-500' : 'border-border hover:border-primary/50';

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
