import { Card, Checkbox, Empty, Spin } from "antd";
import type { NotificationSubjectGroup } from "@/features/classrooms/types/notificationForm";

interface NotificationCourseGroupSelectionProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  subjectGroups: NotificationSubjectGroup[];
  disabled: boolean;
  loading: boolean;
  loadingLabel: string;
  selectAllLabel: string;
  emptyLabel: string;
}

export function NotificationCourseGroupSelection({
  value = [],
  onChange,
  subjectGroups,
  disabled,
  loading,
  loadingLabel,
  selectAllLabel,
  emptyLabel,
}: NotificationCourseGroupSelectionProps) {
  const allGroupIds = subjectGroups.flatMap((subject) =>
    subject.groups.map((group) => group.id)
  );
  const selectedGroupIds = new Set(value);
  const allGroupsSelected =
    allGroupIds.length > 0 &&
    allGroupIds.every((id) => selectedGroupIds.has(id));
  const someGroupsSelected = allGroupIds.some((id) => selectedGroupIds.has(id));

  const toggleAllGroups = (checked: boolean) => {
    const nextValue = checked
      ? Array.from(new Set([...value, ...allGroupIds]))
      : value.filter((id) => !allGroupIds.includes(id));
    onChange?.(nextValue);
  };

  const updateSubjectGroups = (
    subject: NotificationSubjectGroup,
    selected: number[]
  ) => {
    const subjectGroupIds = subject.groups.map((group) => group.id);
    const groupsFromOtherSubjects = value.filter(
      (id) => !subjectGroupIds.includes(id)
    );
    onChange?.([...groupsFromOtherSubjects, ...selected]);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {loading ? (
        <div className="flex min-h-20 items-center justify-center rounded-lg bg-background-paper">
          <Spin tip={loadingLabel} />
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-background-paper px-3 py-2 [&_.ant-checkbox-wrapper]:text-sm">
            <Checkbox
              checked={allGroupsSelected}
              indeterminate={someGroupsSelected && !allGroupsSelected}
              disabled={disabled || allGroupIds.length === 0}
              onChange={(event) => toggleAllGroups(event.target.checked)}
            >
              {selectAllLabel}
            </Checkbox>
          </div>

          {subjectGroups.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyLabel}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {subjectGroups.map((subject) => (
                <Card
                  key={subject.subjectId}
                  size="small"
                  title={subject.subjectName}
                  className="min-w-0 !rounded-xl !border-other-outlined-border !shadow-none [&_.ant-card-body]:!px-3 [&_.ant-card-body]:!py-3 [&_.ant-card-head-title]:!py-2 [&_.ant-card-head-title]:!text-sm [&_.ant-card-head]:!min-h-10 [&_.ant-card-head]:!border-other-divider [&_.ant-card-head]:!px-3"
                >
                  <Checkbox.Group
                    className="flex flex-col gap-2 [&_.ant-checkbox-wrapper]:text-sm"
                    options={subject.groups.map((group) => ({
                      label: group.label,
                      value: group.id,
                    }))}
                    value={value}
                    disabled={disabled}
                    onChange={(selected) =>
                      updateSubjectGroups(subject, selected.map(Number))
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
