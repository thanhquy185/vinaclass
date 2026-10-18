import { useMemo, useState } from "react";
import { Overlay } from "../../molecules/Overlay/Overlay";
import Tabs from "../../molecules/Tabs/Tabs";
import SelectField from "../../atoms/Select/SelectField";
import { RichTextEditor } from "../../molecules/RichTextEditor/RichTextEditor";
import { RadioButton } from "../../atoms/RadioButton/RadioButton";
import { Button } from "../../atoms";
import { Checkbox } from "../../atoms/Checkbox/Checkbox";
import type {
  AnswerOption,
  QuestionCreate,
  QuestionUpdate,
  Question,
} from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { useSubjectsByTeacher, useSubject } from "@/hooks/useSubject";
import { useTranslation } from "react-i18next";
import { stripParagraphTags } from "@/utils";

// interface Answer {
//   id: string;
//   text: string;
//   isCorrect: boolean;
// }

interface AddQuestionFormProps {
  // isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (data: QuestionCreate) => void;
  onSaveUpdate: (id: number, data: QuestionUpdate) => void;
  selectedItem: Question | null;
  mode: "create" | "view" | "update" | "none";
}

export default function AddQuestionForm({
  // isOpen,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
}: AddQuestionFormProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("handmade");

  // --- State cho Câu hỏi ---
  // const [questionContent, setQuestionContent] = useState("");
  // const [subjectId, setSubjectId] = useState<number | null>(null);
  // const [chapterId, setChapterId] = useState<number | null>(null);
  // const [difficultyId, setDifficultyId] = useState<number | null>(null);
  // const [isPublic, setIsPublic] = useState(true);

  // --- State cho Danh sách đáp án ---
  // const [answers, setAnswers] = useState<Answer[]>([]);

  // --- State cho Ô nhập đáp án mới (Tách biệt với questionContent) ---
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);

  const { user } = useAuthStore();

  const defaultFormData: Question = {
    id: 0,
    questionContent: "",
    imageUrl: "",
    answerExplanation: "",
    defaultScore: "",
    usageCount: 0,
    status: "public",
    isDeleted: false,

    difficultyId: 0,
    subjectId: 0,
    chapterId: 0,
    creatorId: user?.id || 0,

    examsCount: 0,

    subject: null,
    chapter: null,
    difficulty: null,
    creator: user,
    answerOptions: [],

    createdAt: null,
    updatedAt: null,
  };
  const selectedQuestion: Question = selectedItem ?? defaultFormData;

  const { subjectsWithChapters } = useSubject();
  const { subjects: teacherSubjects } = useSubjectsByTeacher(user?.id);
  const { role } = useAuthStore();
  const { subjects: allSubject } = useSubject();

  const subjects = useMemo(() => {
    if (role) {
      if (role.roleName === "teacher") {
        return teacherSubjects;
      }
      if (role.roleName === "admin") {
        return allSubject;
      }
    }
    return [];
  }, [teacherSubjects, allSubject, role]);

  // 1. Lấy ra danh sách ID duy nhất của giáo viên
  const gvienMonHocIds = new Set(subjects.map((item) => item.id));

  // 2. Lọc danh sách môn học dựa trên Set đó
  const mySubjects = subjectsWithChapters.filter((subject) =>
    gvienMonHocIds.has(subject.id)
  );
  const subjectOptions = mySubjects.map((item) => ({
    label: item.subjectName,
    value: item.id,
  }));

  const [formData, setFormData] = useState<Question>(selectedQuestion);

  const setFormDataProp = <K extends keyof Question>(
    field: K,
    value: Question[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isCreate = mode === "create";
  const isUpdate = mode === "update";

  const selectedChuongs = mySubjects.find(
    (item) => item.id === selectedQuestion.subjectId
  )?.chapters;

  const defaultOptionChuong = selectedChuongs
    ? selectedChuongs?.map((item) => ({
        label: item.chapterName,
        value: item.id,
      }))
    : [];

  const [chuongOptions, setChuongOptions] =
    useState<{ label: string; value: number }[]>(defaultOptionChuong);

  // if (!isOpen) return null;

  // Xử lý thêm hoặc cập nhật đáp án vào danh sách
  const handleSaveAnswer = () => {
    if (!currentAnswerText.trim() || currentAnswerText === "<p></p>") return;

    if (editingAnswerId) {
      // Chế độ chỉnh sửa
      const newList: AnswerOption[] = formData.answerOptions.map((ans) => {
        if (ans.id === Number(editingAnswerId)) {
          console.log(`2id  ${editingAnswerId} ${ans.id}`);
          return {
            ...ans,
            optionContent: currentAnswerText,
            isCorrectAnswer: currentIsCorrect,
          };
        } else if (currentIsCorrect) {
          return { ...ans, isCorrectAnswer: false };
        } else {
          return ans;
        }
      });

      setFormDataProp("answerOptions", newList);
      setEditingAnswerId(null);
    } else {
      // Chế độ thêm mới
      const newAnswer: AnswerOption = {
        id: Number(Date.now().toString()),
        optionContent: currentAnswerText,
        isCorrectAnswer: currentIsCorrect,
        questionId: null,
      };

      // Xử lý trước khi set state
      const updatedList = currentIsCorrect
        ? formData.answerOptions.map((a) => ({ ...a, isCorrectAnswer: false }))
        : formData.answerOptions;

      const finalList = [...updatedList, newAnswer];

      // Set state 1 lần duy nhất
      setFormDataProp("answerOptions", finalList);
    }

    // Reset ô nhập
    setCurrentAnswerText("");
    setCurrentIsCorrect(false);
  };

  const handleDeleteAnswer = (id: number) => {
    const newList = formData.answerOptions.filter((ans) => ans.id !== id);
    setFormDataProp("answerOptions", newList);
  };

  const handleEditAnswer = (ans: AnswerOption) => {
    setEditingAnswerId(ans.id.toString());

    setCurrentAnswerText(ans.optionContent);

    setCurrentIsCorrect(ans.isCorrectAnswer);
  };

  const handleFinalSubmit = () => {
    if (isUpdate) {
      const data: QuestionUpdate = {
        subjectId: formData.subjectId,
        chapterId: formData.chapterId ?? null,
        difficultyId: formData.difficultyId,
        creatorId: formData.creatorId,
        questionContent: stripParagraphTags(formData.questionContent),
        answerExplanation: formData.answerExplanation || "",
        defaultScore: Number(formData.defaultScore) || 0,
        status: formData.status as "public" | "private" | "archive",

        answerOptions: formData.answerOptions.map((ans) => ({
          optionContent: stripParagraphTags(ans.optionContent),
          isCorrectAnswer: ans.isCorrectAnswer,
          questionId: ans.questionId,
        })),
      };
      onSaveUpdate(formData.id, data);
    } else if (isCreate) {
      const data: QuestionCreate = {
        subjectId: formData.subjectId,
        chapterId: formData.chapterId ?? null,
        difficultyId: formData.difficultyId,
        creatorId: formData.creatorId,
        questionContent: stripParagraphTags(formData.questionContent),
        answerExplanation: formData.answerExplanation || "",
        defaultScore: Number(formData.defaultScore) || 0,
        status: formData.status as "public" | "private" | "archive",

        answerOptions: formData.answerOptions.map((ans) => ({
          optionContent: stripParagraphTags(ans.optionContent),
          isCorrectAnswer: ans.isCorrectAnswer,
          questionId: ans.questionId,
        })),
      };
      onSaveCreate(data);
    }
  };

  const handleSelectSubject = (val: number) => {
    const subject = mySubjects.find((s) => s.id === val);
    const chuongs = subject ? subject.chapters : [];
    const options = chuongs.map((item) => ({
      label: item.chapterName,
      value: item.id,
    }));
    setChuongOptions(options);

    setFormDataProp("subjectId", val);
    setFormDataProp("chapterId", null);
  };
  //
  return (
    <Overlay onClose={onClose}>
      <div className="flex w-[1000px] flex-col gap-3 rounded-lg bg-background-paper pb-2 shadow-xl">
        {/* Tabs điều hướng */}
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          tabs={
            isCreate
              ? [
                  {
                    value: "handmade",
                    label: t("addQuestionForm.tabs.handmade"),
                  },
                  {
                    value: "fromFile",
                    label: t("addQuestionForm.tabs.fromFile"),
                  },
                ]
              : [{ value: "handmade", label: t("addQuestionForm.tabs.edit") }]
          }
        />

        <div className="flex max-h-[80vh] flex-col overflow-auto px-5">
          {/* Bộ chọn thông tin (Chỉ chấp nhận Number) */}
          <div className="flex gap-5 py-3">
            <SelectField
              label={t("addQuestionForm.fields.subject.label")}
              value={formData.subjectId}
              placeholder={t("addQuestionForm.fields.subject.placeholder")}
              options={subjectOptions}
              onSelect={(val) => handleSelectSubject(Number(val))}
            />
            <SelectField
              label={t("addQuestionForm.fields.chapter.label")}
              placeholder={t("addQuestionForm.fields.chapter.placeholder")}
              options={chuongOptions}
              onSelect={(val) => setFormDataProp("chapterId", Number(val))}
              value={formData.chapterId || undefined}
            />
            <SelectField
              label={t("addQuestionForm.fields.difficulty.label")}
              placeholder={t("addQuestionForm.fields.difficulty.placeholder")}
              options={[
                { label: "Nhận biết", value: 1 },
                { label: "Thông hiểu", value: 2 },
                { label: "Vận dụng", value: 3 },
                { label: "Vận dụng cao", value: 4 },
              ]}
              onSelect={(val) => setFormDataProp("difficultyId", Number(val))}
              value={formData.difficulty?.id}
            />
          </div>

          {/* Editor nội dung câu hỏi */}
          <div className="flex flex-col gap-2 py-2">
            <span className="text-body-1-semibold text-text-secondary">
              {t("addQuestionForm.content.label")}
            </span>
            <RichTextEditor
              content={formData.questionContent}
              onChange={(val) => setFormDataProp("questionContent", val)}
            />
          </div>

          {/* Danh sách đáp án đã thêm */}
          <div className="flex flex-col gap-2 py-2">
            <span className="text-body-1-semibold text-text-secondary">
              {t("addQuestionForm.answers.title")}
            </span>
            <div className="flex flex-col rounded-md border border-other-outlined-border bg-white">
              {formData.answerOptions.length === 0 ? (
                <div className="p-8 text-center text-text-disabled">
                  {t("addQuestionForm.answers.empty")}
                </div>
              ) : (
                formData.answerOptions.map((ans, index) => (
                  <div
                    key={ans.id}
                    className="flex items-center gap-4 border-b border-other-outlined-border p-3 last:border-none hover:bg-gray-50"
                  >
                    <strong className="text-primary-main">
                      {String.fromCharCode(65 + index)}
                    </strong>
                    <div
                      className="text-body-2 prose-sm max-w-none flex-1"
                      dangerouslySetInnerHTML={{ __html: ans.optionContent }}
                    />
                    <div className="flex items-center gap-4">
                      {ans.isCorrectAnswer ? (
                        <span className="bg-success-main/10 rounded px-2 py-1 text-xs font-bold text-success-main">
                          {t("addQuestionForm.answers.correct")}
                        </span>
                      ) : (
                        <RadioButton
                          label={t("addQuestionForm.answers.chooseCorrect")}
                          checked={false}
                          onChange={() =>
                            handleEditAnswer({ ...ans, isCorrectAnswer: true })
                          }
                        />
                      )}
                      <div className="flex">
                        <Button
                          variant="text"
                          color="primary"
                          size="small"
                          onClick={() => handleEditAnswer(ans)}
                        >
                          {t("addQuestionForm.answers.edit")}
                        </Button>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteAnswer(ans.id)}
                        >
                          {t("addQuestionForm.answers.delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Khung nhập đáp án mới */}
          <div className="flex flex-col gap-2 py-4">
            <span className="text-body-1-semibold text-text-secondary">
              {editingAnswerId
                ? t("addQuestionForm.answers.editing")
                : t("addQuestionForm.answers.addNew")}
            </span>
            <div className="border-primary-main/20 bg-primary-main/5 flex flex-col gap-3 rounded-md border p-4">
              <Checkbox
                label={t("addQuestionForm.answers.markCorrect")}
                checked={currentIsCorrect}
                onChange={(e) => setCurrentIsCorrect(e.target.checked)}
              />
              <RichTextEditor
                content={currentAnswerText}
                onChange={(val) => setCurrentAnswerText(val)}
              />
              <div className="flex justify-end gap-2">
                {editingAnswerId && (
                  <Button
                    variant="text"
                    color="standard"
                    onClick={() => {
                      setEditingAnswerId(null);
                      setCurrentAnswerText("");
                    }}
                  >
                    {t("addQuestionForm.answers.cancelEdit")}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveAnswer}
                >
                  {editingAnswerId
                    ? t("addQuestionForm.answers.update")
                    : t("addQuestionForm.answers.saveNew")}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-other-outlined-border py-4">
            <Checkbox
              label={t("addQuestionForm.footer.public")}
              checked={formData.status === "public"}
              onChange={(e) =>
                setFormDataProp(
                  "status",
                  e.target.checked ? "public" : "private"
                )
              }
            />
            <div className="flex gap-2">
              <Button variant="outline" color="standard" onClick={onClose}>
                {t("addQuestionForm.footer.back")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinalSubmit}
                disabled={
                  !formData.questionContent ||
                  formData.answerOptions.length < 2 ||
                  !formData.subjectId
                }
              >
                {t("addQuestionForm.footer.saveAll")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
