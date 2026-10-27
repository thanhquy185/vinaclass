import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { chapterService } from "@/features/catalogs/api/chapter.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";

export const useChaptersBySubject = (subjectId?: number) => {
  const query = useEntityQuery({
    queryKey: catalogQueryKeys.chapters.bySubject(subjectId),
    queryFn: () => chapterService.getChaptersBySubject(subjectId),
    select: selectApiData,
    enabled: !!subjectId,
  });

  return {
    chapters: query.data || [],
    isLoading: query.isLoading,
  };
};
