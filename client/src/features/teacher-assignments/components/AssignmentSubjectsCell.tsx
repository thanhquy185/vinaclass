import { Button, Popover, Tag } from "antd";
import type {
  AssignmentSubjectSummary,
  TeacherAssignmentRemoval,
} from "@/features/teacher-assignments/types/teacherAssignment";

const PREVIEW_SUBJECT_COUNT = 3;

interface AssignmentSubjectsCellProps {
  teacherId: number;
  teacherName: string;
  subjects: AssignmentSubjectSummary[];
  canRemove: boolean;
  moreLabel: (count: number) => string;
  onRemove: (assignment: TeacherAssignmentRemoval) => void;
}

function SubjectTag({
  subject,
  teacherId,
  teacherName,
  canRemove,
  onRemove,
}: Omit<AssignmentSubjectsCellProps, "subjects" | "moreLabel"> & {
  subject: AssignmentSubjectSummary;
}) {
  return (
    <Tag
      closable={canRemove}
      onClose={(event) => {
        event.preventDefault();
        onRemove({
          teacherId,
          subjectId: subject.id,
          teacherName,
          subjectName: subject.subjectName,
        });
      }}
      className="!m-0 !inline-flex !max-w-full !items-center !rounded-full !border-other-outlined-border !bg-background-body-background !px-3 !py-1 !text-sm !text-text-primary"
    >
      <span className="mr-1.5 shrink-0 font-mono text-xs font-semibold text-text-secondary">
        {subject.subjectCode}
      </span>
      <span className="max-w-64 truncate">{subject.subjectName}</span>
    </Tag>
  );
}

export function AssignmentSubjectsCell({
  teacherId,
  teacherName,
  subjects,
  canRemove,
  moreLabel,
  onRemove,
}: AssignmentSubjectsCellProps) {
  const visibleSubjects = subjects.slice(0, PREVIEW_SUBJECT_COUNT);
  const remainingSubjects = subjects.slice(PREVIEW_SUBJECT_COUNT);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 py-1">
      {visibleSubjects.map((subject) => (
        <SubjectTag
          key={subject.id}
          subject={subject}
          teacherId={teacherId}
          teacherName={teacherName}
          canRemove={canRemove}
          onRemove={onRemove}
        />
      ))}
      {remainingSubjects.length > 0 && (
        <Popover
          trigger="click"
          placement="bottomLeft"
          content={
            <div className="flex max-h-72 max-w-md flex-wrap gap-2 overflow-y-auto p-1">
              {subjects.map((subject) => (
                <SubjectTag
                  key={subject.id}
                  subject={subject}
                  teacherId={teacherId}
                  teacherName={teacherName}
                  canRemove={canRemove}
                  onRemove={onRemove}
                />
              ))}
            </div>
          }
        >
          <Button type="link" size="small" className="!px-1 !font-semibold">
            {moreLabel(remainingSubjects.length)}
          </Button>
        </Popover>
      )}
    </div>
  );
}
