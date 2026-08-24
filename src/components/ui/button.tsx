import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-[background-color,box-shadow,transform,opacity] duration-150 ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white shadow-[0_1px_0_rgb(0_0_0/0.08)] hover:bg-brand-hover active:bg-brand-pressed active:scale-[0.98]",
        navy: "bg-navy text-navy-fg hover:bg-navy-mid active:scale-[0.98]",
        outline:
          "bg-surface text-ink shadow-[0_0_0_1px_var(--color-line)] hover:bg-canvas",
        ghost: "text-ink-soft hover:bg-canvas hover:text-ink",
        danger: "bg-danger text-white hover:opacity-90 active:scale-[0.98]",
        teal: "bg-teal text-white hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  type = "button",
  asChild,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));
  if (asChild) {
    return <Slot className={classes}>{props.children}</Slot>;
  }
  return (
    <button type={type} className={classes} {...props} />
  );
}
