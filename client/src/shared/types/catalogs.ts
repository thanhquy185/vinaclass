import type { CourseGroup } from "./classrooms";

export interface Difficulty {
  id: number;
  difficultyName: string;
  questionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DifficultyRequest {
  difficultyName: string;
}

export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number;
  courseGroupsCount?: number;
  chaptersCount?: number;

  courseGroups: CourseGroup[];
  chapters: Chapter[];
}

export interface SubjectRequest {
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  chapters?: ChapterItemRequest[];
}

export type SubjectUpdateRequest = Partial<
  Pick<SubjectRequest, "subjectName" | "creditCount">
> &
  Pick<SubjectRequest, "theoryHours" | "practiceHours">;

export interface SubjectWithGroup {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number;
  courseGroups: CourseGroup[];
}

export interface Chapter {
  id: number;
  chapterName: string;
  subjectId: number;
  isDeleted: number;
}

export interface SubjectWithChapters {
  id: number;
  subjectCode: string;
  subjectName: string;
  creditCount: number;
  theoryHours: number;
  practiceHours: number;
  isDeleted: number; // The backend may return a boolean value.
  chapters: Chapter[];
}

export interface ChapterItemRequest {
  chapterName: string;
  id?: number;
}

export interface ChapterListRequest {
  chapters: ChapterItemRequest[];
}
