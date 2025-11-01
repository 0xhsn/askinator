export function containsArabic(input?: string | null): boolean {
  if (!input) return false;
  return /[\u0600-\u06FF]/.test(input);
}


