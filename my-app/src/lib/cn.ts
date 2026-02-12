import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn - Class name utility
 * 
 * Combines clsx and tailwind-merge to handle class name conflicts
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
