import { Button, Icon, Input } from "@/components/atomic/atoms";
import CourseItem from "@/components/atomic/organisms/CourseItem/CourseItem";
import TestUpload from "@/components/atomic/organisms/TestUpload/TestUpload";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import {
  useJoinCourseGroup,
  useStudentCourseGroups,
} from "@/hooks/useCourseGroup";
import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";
import { Link } from "react-router-dom";
import { JoinClassForm } from "../../components/atomic/organisms/JoinGroupForm/JoinClassForm";
import type { ErrorResponse } from "@/types";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export const CoursePage = () => {
  const { user } = useAuthStore();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const handleJoin = () => {
    setIsOpenModal(true);
  };

  const onClose = () => {
    setIsOpenModal(false);
  };

  const { t } = useTranslation();
  const { mutateAsync } = useJoinCourseGroup();

  const onSubmit = async (code: string) => {
    try {
      if (!user) return;
      await mutateAsync({
        studentId: user.id,
        joinCode: code,
      });
      alert(t("message.success.create"));
      onClose();
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          alert(t(firstError[0]));
        }
      } else {
        alert(t("message.error.create"));
      }
    }
  };

  const { courseGroups } = useStudentCourseGroups(user?.id || null);
  const [isOpenHideClass, setIsOpenHideClass] = useState(false);
  return (
    <MainContentLayout hasFooter={false}>
      <div className="flex justify-between rounded-md bg-background-body-background px-2 py-2">
        {/* Left */}
        <div className="flex gap-2">
          <Input
            hasBoder={true}
            placeholder={t("coursePage.searchPlaceholder")}
            icon={<Icon name="search" className="text-text-disabled" />}
          />
        </div>

        {/* Right */}
        <div className="flex gap-2">
          <Button variant={"outline"}>
            <Icon name="arrowUpDown" />
          </Button>

          <Button variant={"contained"} color={"primary"} onClick={handleJoin}>
            <Icon name="plus" size={20} />
            {t("coursePage.joinNewClass")}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-6 rounded-md px-2 py-2">
        {courseGroups?.map((item) => (
          <Link key={item.id} to={`${item.id}`}>
            <CourseItem data={item} />
          </Link>
        ))}
      </div>

      <div>
        <Button
          color={"primary"}
          className="hover:bg-action-selected"
          onClick={() => setIsOpenHideClass(!isOpenHideClass)}
        >
          {t("coursePage.showHiddenClasses")}
        </Button>
      </div>
      {isOpenHideClass && (
        <div className="flex flex-wrap gap-x-4 gap-y-6 rounded-md px-2 py-2">
          {/* <CourseItem />
          <CourseItem />
          <CourseItem /> */}
          <TestUpload />
        </div>
      )}
      {isOpenModal && <JoinClassForm onCancel={onClose} onSubmit={onSubmit} />}
    </MainContentLayout>
  );
};
