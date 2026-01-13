export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

export function validateSlug(slug: string): boolean {
  // Slug should be lowercase, alphanumeric with hyphens, 3-50 chars
  const slugRegex = /^[a-z0-9-]{3,50}$/
  return slugRegex.test(slug)
}

export function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    single_choice: "Single Choice",
    multiple_choice: "Multiple Choice",
    short_text: "Short Text",
    long_text: "Long Text",
  }
  return labels[type] || type
}

export function getQuestionTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    single_choice: "🔘",
    multiple_choice: "☑️",
    short_text: "📝",
    long_text: "📄",
  }
  return emojis[type] || "❓"
}
