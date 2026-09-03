import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        // Disabled state must stay legible on white: opacity stacking on top of an
        // already-translucent fill washes out to near-nothing, so `default` sets its
        // own disabled recipe instead of relying on a shared disabled:opacity.
        default: 'bg-accent text-accentInk hover:bg-accentBright shadow-md shadow-accent/20 dark:shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/20 dark:hover:shadow-accentBright/30 disabled:bg-accent/40 disabled:text-accentInk/70 disabled:shadow-none disabled:hover:bg-accent/40',
        outline: 'border-2 border-accentBright/60 text-accentBright hover:bg-accentBright/10 dark:hover:bg-accentBright/15 hover:text-ink hover:border-accentBright disabled:opacity-50',
        ghost: 'hover:bg-surface text-inkMuted hover:text-ink disabled:opacity-50',
        soft: 'bg-surface2 text-ink border border-edge hover:bg-edge disabled:opacity-50',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 px-4',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
