import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', pulse = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium';

    const variants = {
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      error: 'bg-red-500/10 text-red-400 border border-red-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      default: 'bg-muted text-foreground border border-border',
    };

    return (
      <span ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
