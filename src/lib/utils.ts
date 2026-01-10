import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Compose multiple class-name inputs into a single, conflict-resolved string.
 *
 * @param inputs - One or more class-name values (strings, arrays, or objects describing conditional classes) to be combined
 * @returns The resulting class string with duplicate and conflicting Tailwind classes merged and normalized
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}