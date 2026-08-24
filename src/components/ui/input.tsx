import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[10px] border border-line bg-surface px-3.5 text-sm text-ink shadow-[inset_0_1px_2px_rgb(15_23_42/0.03)] placeholder:text-muted/80",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-navy-muted/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-ring/35",
        "disabled:bg-canvas disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-[10px] border border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22><path fill=%22%2364748b%22 d=%22M1.2 1.4 6 6.2l4.8-4.8 1.2 1.2L6 8.6 0 2.6z%22/></svg>')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat px-3.5 pr-10 text-sm text-ink",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-navy-muted/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-ring/35",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/80",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-navy-muted/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-ring/35",
        className,
      )}
      {...props}
    />
  );
}
