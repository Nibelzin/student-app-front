import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_PAGE = 0

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

export const safeParseNoteContent = (content?: string) => {
  if (!content || !content.trim()) {
    return { type: 'doc', content: [] };
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao parsear o conteúdo da nota:', error);
    return { type: 'doc', content: [] };
  }
}

export const getContrastColor = (hex: string): 'white' | 'black' => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'black' : 'white'
}

export const buildQueryString = (params: Record<string, string | number | boolean | Date | undefined>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    })
    return searchParams.toString();
}
