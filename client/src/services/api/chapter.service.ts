import type {
  ApiResponse,
  Chapter,
  ChapterListRequest,
  SubjectWithChapters,
} from "@/types";
import axiosClient from "./axios";

export const chapterService = {
  getChaptersBySubject: (
    subjectId?: number
  ): Promise<ApiResponse<Chapter[]>> =>
    axiosClient.get(`/chapters/by-subject/${subjectId}`),

  updateSubjectChapters: ({
    subjectId,
    data,
  }: {
    subjectId?: number;
    data: ChapterListRequest;
  }): Promise<ApiResponse<SubjectWithChapters>> => {
    const payload = {
      chapters: data.chapters.map(({ chapterName }) => ({
        chapter_name: chapterName,
      })),
    };

    return axiosClient.put(`/chapters/bySubject/${subjectId}`, payload);
  },
};
