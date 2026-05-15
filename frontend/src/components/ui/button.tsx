import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 ease-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-px shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]",
        outline:
          "border border-foreground/25 text-foreground hover:border-foreground/50 hover:bg-foreground/[0.04]",
        ghost: "text-foreground hover:bg-foreground/[0.06]",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 hover:-translate-y-px shadow-[0_10px_28px_-16px_hsl(var(--accent))]",
      },
      size: {
        sm: "h-9 px-4 text-xs uppercase tracking-widest2",
        md: "h-11 px-6 text-sm uppercase tracking-widest2",
        lg: "h-14 px-9 text-sm uppercase tracking-widest2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
