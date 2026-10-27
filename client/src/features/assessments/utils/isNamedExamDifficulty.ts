import type { Difficulty } from "@/shared/types";

/** Hide malformed blank or number-only difficulty names from exam controls. */
export function isNamedExamDifficulty(difficulty: Difficulty) {
  const name = difficulty.difficultyName?.trim() ?? "";

  return name.length > 0 && !/^\d+(?:[.,]\d+)?$/.test(name);
}
