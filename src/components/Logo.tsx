import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#ffffff" />
      <path d="M8 13.2 L16 9.4 L24 13.2 L16 17z" fill="#E85D04" />
      <path d="M8 13.2 L8 20.6 L16 24.4 L16 17z" fill="#F4B183" />
      <path d="M24 13.2 L24 20.6 L16 24.4 L16 17z" fill="#C2410C" />
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.35rem] font-extrabold tracking-tight",
          inverted ? "text-white" : "text-navy",
        )}
      >
        RentaMax
      </span>
    </div>
  );
}
