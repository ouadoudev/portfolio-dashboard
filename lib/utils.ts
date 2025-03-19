import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rtlClass(ltrClass: string, rtlClass: string, isRtl: boolean) {
  return isRtl ? rtlClass : ltrClass
}