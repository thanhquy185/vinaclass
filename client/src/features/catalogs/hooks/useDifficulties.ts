import { useDifficultyMutations } from "@/features/catalogs/hooks/useDifficultyMutations";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import type { UseDifficultiesOptions } from "@/features/catalogs/hooks/useDifficultyQueries";

export const useDifficulties = (options: UseDifficultiesOptions = {}) => {
  const queries = useDifficultyQueries(options);
  const mutations = useDifficultyMutations();
  return {
    ...queries,
    ...mutations,
  };
};
