export interface NormalizeSearchTextOptions {
  stripHtml?: boolean;
  trim?: boolean;
}

/** Normalize Vietnamese and accented text consistently for client-side search. */
export function normalizeSearchText(
  value: string,
  options: NormalizeSearchTextOptions = {}
): string {
  const searchableValue = options.stripHtml
    ? value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ")
    : value;
  const normalizedValue = searchableValue
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase("vi");

  return options.trim ? normalizedValue.trim() : normalizedValue;
}
