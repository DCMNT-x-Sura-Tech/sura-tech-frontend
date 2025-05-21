/**
 * Detects if text contains Thai characters
 * @param text The text to check
 * @returns true if the text contains Thai characters, false otherwise
 */
export function detectThai(text: string): boolean {
  // Thai Unicode range: \u0E00-\u0E7F
  const thaiPattern = /[\u0E00-\u0E7F]/
  return thaiPattern.test(text)
}

/**
 * Gets the language code based on text content
 * @param text The text to analyze
 * @returns 'th' for Thai, 'en' for English/other languages
 */
export function getLanguageFromText(text: string): "th" | "en" {
  return detectThai(text) ? "th" : "en"
}
