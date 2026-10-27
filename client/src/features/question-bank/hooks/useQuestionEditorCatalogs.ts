import { useMemo } from "react";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import { useRoleScopedSubjectQueries } from "@/features/catalogs/hooks/useRoleScopedSubjectQueries";

interface UseQuestionEditorCatalogsOptions {
  subjectId: number;
}

export function useQuestionEditorCatalogs({
  subjectId,
}: UseQuestionEditorCatalogsOptions) {
  const {
    subjectsWithChapters,
    subjects: availableSubjects,
    isLoading: isLoadingSubjectsForRole,
    isFetching: isFetchingSubjects,
    isError: isRoleSubjectsError,
    refetch: refetchRoleSubjects,
    isLoadingChapters,
    isFetchingChapters,
    isErrorChapters,
    refetchChapters,
  } = useRoleScopedSubjectQueries({
    includeChapters: true,
  });
  const {
    difficulties,
    isLoading: isLoadingDifficulties,
    isFetching: isFetchingDifficulties,
    isError: isDifficultiesError,
    refetch: refetchDifficulties,
  } = useDifficultyQueries();

  const availableSubjectIds = useMemo(
    () => new Set(availableSubjects.map((subject) => subject.id)),
    [availableSubjects],
  );
  const subjectOptions = useMemo(
    () =>
      subjectsWithChapters
        .filter((subject) => availableSubjectIds.has(subject.id))
        .map((subject) => ({ label: subject.subjectName, value: subject.id })),
    [availableSubjectIds, subjectsWithChapters],
  );
  const chapterOptions = useMemo(
    () =>
      (
        subjectsWithChapters.find((subject) => subject.id === subjectId)
          ?.chapters ?? []
      ).map((chapter) => ({
        label: chapter.chapterName,
        value: chapter.id,
      })),
    [subjectId, subjectsWithChapters],
  );
  const difficultyOptions = useMemo(
    () =>
      difficulties.map((difficulty) => ({
        label: difficulty.difficultyName,
        value: difficulty.id,
      })),
    [difficulties],
  );
  const retryCatalogs = async () => {
    const retries: Promise<unknown>[] = [];

    if (isRoleSubjectsError) retries.push(refetchRoleSubjects());
    if (isErrorChapters) retries.push(refetchChapters());
    if (isDifficultiesError) retries.push(refetchDifficulties());

    await Promise.all(retries);
  };

  return {
    subjectOptions,
    chapterOptions,
    difficultyOptions,
    isLoadingSubjectsForRole,
    isLoadingChapters,
    isLoadingDifficulties,
    hasCatalogError:
      isRoleSubjectsError || isErrorChapters || isDifficultiesError,
    isRetryingCatalogs:
      isFetchingSubjects || isFetchingChapters || isFetchingDifficulties,
    retryCatalogs,
  };
}
