import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nodeContainsText = (node: any, searchTerm: string) => {

  if (searchTerm === "@") return true
  if (!searchTerm) return true

  if (node.type === 'text' && node.text?.toLowerCase().includes(searchTerm.toLowerCase())) {
    return true;
  }
  if (node.type === 'mention' && node.attrs?.label?.toLowerCase().includes(searchTerm.toLowerCase())) {
    return true;
  }

  if (Array.isArray(node.content)) {
    return node.content.some((childNode: any) => nodeContainsText(childNode, searchTerm));
  }

  return false;
};

export const generateAcronym = (text: string) => {
  const ignore = ['de', 'da', 'do', 'dos', 'das', 'e', 'a', 'o', 'as', 'os', 'em', 'no', 'na', 'nos', 'nas'];
  const words = text
    .split(' ')
    .filter(word => word.length > 0 && !ignore.includes(word.toLowerCase()));

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return words
    .map(word => word.toLowerCase() === "ii" ? "II" : word[0].toUpperCase())
    .join('');
}
