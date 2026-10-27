import type {
  ApiResponse,
  Chapter,
  ChapterListRequest,
  SubjectWithChapters,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";

export const chapterService = {
  getChaptersBySubject: (subjectId?: number): Promise<ApiResponse<Chapter[]>> =>
    axiosClient.get(`/chapters/by-subject/${subjectId}`),

  updateSubjectChapters: ({
    subjectId,
    data,
  }: {
    subjectId: number;
    data: ChapterListRequest;
  }): Promise<ApiResponse<SubjectWithChapters>> => {
    const payload = {
      chapters: data.chapters.map(({ chapterName, id }) => ({
        chapter_name: chapterName,
        ...(id !== undefined && { id }),
      })),
    };

    return axiosClient.put(`/chapters/bySubject/${subjectId}`, payload);
  },
};
