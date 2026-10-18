export interface DifficultyInput {
  difficultyName: string;
}

export type DifficultyError = Partial<Record<keyof DifficultyInput, string>>;

export class DifficultyValidate {
  static create(data: DifficultyInput): DifficultyError {
    const errors: DifficultyError = {};

    if (!data.difficultyName || data.difficultyName.trim() === "") {
      errors.difficultyName = "Tên độ khó không được để trống";
    }

    return errors;
  }
}
