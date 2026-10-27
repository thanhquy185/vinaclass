import { useSubjectMutations } from "@/features/catalogs/hooks/useSubjectMutations";
import { useSubjectQueries } from "@/features/catalogs/hooks/useSubjectQueries";
import type { UseSubjectOptions } from "@/features/catalogs/hooks/useSubjectQueries";

export { useSubjectsByTeacher } from "@/features/catalogs/hooks/useSubjectQueries";

export const useSubject = (options: UseSubjectOptions = {}) => {
  const queries = useSubjectQueries(options);
  const mutations = useSubjectMutations();
  return {
    ...queries,
    ...mutations,
  };
};
