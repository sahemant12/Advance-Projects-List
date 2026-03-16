import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';
    const styles = glass
      ? 'glass hover:shadow-xl hover:shadow-primary/10'
      : 'bg-card border border-border hover:border-primary/50 hover:shadow-lg';

    return (
      <div ref={ref} className={`${baseStyles} ${styles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
