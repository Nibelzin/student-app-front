import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nodeContainsText = (node: any, searchTerm: string) => {

  if (searchTerm === "@") return true
  if (!searchTerm) return true

  if (node.type === 'text' && node.text?.toLowerCase().includes(searchTerm)) {
    return true;
  }
  if (node.type === 'mention' && node.attrs?.label?.toLowerCase().includes(searchTerm)) {
    return true;
  }

  if (Array.isArray(node.content)) {
    return node.content.some((childNode: any) => nodeContainsText(childNode, searchTerm));
  }

  return false;
};
