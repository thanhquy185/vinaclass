import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/shared/components/ui/Checkbox/Checkbox";
import { Input } from "@/shared/components/ui";
import SelectField from "@/shared/components/ui/Select/SelectField";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import type { Difficulty, Question } from "@/shared/types";
import { isNamedExamDifficulty } from "@/features/assessments/utils/isNamedExamDifficulty";

interface QuestionSelectionPanelProps {
  questions: Question[];
  difficulties: Difficulty[];
  isLoadingQuestions: boolean;
  isLoadingDifficulties: boolean;
  selectedQuestionIds: ReadonlySet<number>;
  isViewMode: boolean;
  onToggleQuestion: (question: Question, checked: boolean) => void;
}

export function QuestionSelectionPanel({
  questions,
  difficulties,
  isLoadingQuestions,
  isLoadingDifficulties,
  selectedQuestionIds,
  isViewMode,
  onToggleQuestion,
}: QuestionSelectionPanelProps) {
  const { t } = useTranslation();
  const searchId = useId();
  const [searchTerm, setSearchTerm] = useState("");
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  const chapterOptions = useMemo(() => {
    const chapters = new Map<number, string>();

    questions.forEach((question) => {
      if (question.chapterId && question.chapter) {
        chapters.set(question.chapterId, question.chapter.chapterName);
      }
    });

    return Array.from(chapters, ([value, label]) => ({ value, label }));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase();

    return questions.filter((question) => {
      const matchesText =
        !term || question.questionContent.toLocaleLowerCase().includes(term);
      const matchesChapter =
        chapterFilter === null || question.chapterId === chapterFilter;
      const matchesDifficulty =
        difficultyFilter === null || question.difficultyId === difficultyFilter;

      return matchesText && matchesChapter && matchesDifficulty;
    });
  }, [questions, searchTerm, chapterFilter, difficultyFilter]);

  return (
    <div className="flex h-[42vh] min-h-[260px] w-full min-w-0 flex-col gap-3 border-b border-other-outlined-border pb-4 xl:h-auto xl:min-h-0 xl:w-[450px] xl:shrink-0 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
      <AdminFilterField
        label={t("addQuestionTestPage.filters.searchLabel")}
        htmlFor={searchId}
        className="w-full min-w-0"
      >
        <Input
          id={searchId}
          className="!rounded-xl transition-colors focus-within:!border-primary-main focus-within:ring-0 [&_.ant-input:focus]:!outline-none [&_.ant-input:focus]:!shadow-none"
          placeholder={t("addQuestionTestPage.filters.search")}
          disabled={isViewMode}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </AdminFilterField>
      <div className="flex-bet-center gap-2">
        <SelectField
          label={t("addQuestionForm.fields.chapter.label")}
          placeholder={t("addQuestionTestPage.filters.chapter.placeholder")}
          className="min-w-0"
          options={[
            {
              label: t("addQuestionTestPage.filters.chapter.all"),
              value: "all",
            },
            ...chapterOptions,
          ]}
          onSelect={(value) =>
            setChapterFilter(value === "all" ? null : Number(value))
          }
          disabled={isViewMode}
        />
        <SelectField
          label={t("addQuestionTestPage.filters.difficulty.label")}
          placeholder={t("addQuestionTestPage.filters.difficulty.placeholder")}
          className="min-w-0"
          options={[
            {
              label: t("addQuestionTestPage.filters.difficulty.all"),
              value: "all",
            },
            ...difficulties.filter(isNamedExamDifficulty).map((difficulty) => ({
              label: difficulty.difficultyName,
              value: difficulty.id,
            })),
          ]}
          onSelect={(value) =>
            setDifficultyFilter(value === "all" ? null : Number(value))
          }
          disabled={isViewMode}
          loading={isLoadingDifficulties}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto border-x border-t border-other-outlined-border bg-background-body-background">
        {isLoadingQuestions ? (
          <div
            role="status"
            aria-live="polite"
            className="p-4 text-center text-text-secondary"
          >
            {t("questionPage.loading")}
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const isSelected = selectedQuestionIds.has(question.id);

            return (
              <Checkbox
                disabled={isViewMode}
                key={question.id}
                id={`question-item-${question.id}`}
                classNameParent={`p-4 border-b border-other-outlined-border gap-3 ${isViewMode ? "opacity-80 pointer-events-none " : "hover:bg-action-hover"} transition-colors`}
                label={question.questionContent}
                checked={isSelected}
                onChange={(event) =>
                  onToggleQuestion(question, event.target.checked)
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
