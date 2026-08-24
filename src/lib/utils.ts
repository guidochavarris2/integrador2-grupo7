import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSoles(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export function formatDni(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}
