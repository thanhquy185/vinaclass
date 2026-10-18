import { useEffect, useMemo, useState } from "react";
import { Button, Icon, Input } from "@/components/atomic/atoms";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import TestItem from "@/components/atomic/organisms/TestItem/TestItem";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import { useExams } from "@/hooks/useDeThi";
import { useSubjectsByTeacher } from "@/hooks/useSubject";
import { useAuthStore } from "@/stores/auth.store";
import type { RoleDetailItem } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";

export const TestPage = () => {
  const { t } = useTranslation();
  const { exams } = useExams();

  // const { subjects } = useSubject();
  const pageName = "de_thi";

  const { role, user } = useAuthStore();
  const { subjects } = useSubjectsByTeacher(user?.id);

  const roleDetails = !role ? [] : role.roleDetails;
  const actions = roleDetails
    .filter((item: RoleDetailItem) => item.functionName === pageName)
    .flatMap((item) => {
      const result: string[] = [];

      if (item.canView) result.push("view");
      if (item.canCreate) result.push("create");
      if (item.canUpdate) result.push("update");
      if (item.canDelete) result.push("delete");

      return result;
    });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | string>(-1);
  const [statusFilter, setStatusFilter] = useState<number>(1); // 1: Tất cả
  const [isDesc, setIsDesc] = useState(true);

  console.log(user?.id);
  console.log(exams);
  const myExams = (exams || []).filter(
    (i) => i.creatorId === (user?.id || 3)
  );
  console.log(myExams);
  // LOGIC LỌC VÀ SẮP XẾP CHÍNH XÁC THEO INTERFACE
  const filteredTests = useMemo(() => {
    let result = myExams;

    // 1. Lọc theo từ khóa tìm kiếm (Tên đề, Tên môn, Mã môn)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((item) => {
        const testName = item.examName?.toLowerCase() ?? "";
        // Truy cập qua relation mon_thi: Subject
        const subjectName = item.subject?.subjectName?.toLowerCase() ?? "";
        const subjectCode = item.subject?.subjectCode?.toLowerCase() ?? "";

        return (
          testName.includes(term) ||
          subjectName.includes(term) ||
          subjectCode.includes(term)
        );
      });
    }

    // 2. Lọc theo ID môn học (Sử dụng monThiId từ DeThi interface)
    if (selectedSubject !== -1) {
      result = result.filter(
        (item) => item.subjectId === Number(selectedSubject)
      );
    }

    // 3. Lọc theo trạng thái thi (Upcoming, Opening, Closed)
    if (statusFilter !== 1) {
      const now = new Date().getTime();
      result = result.filter((item) => {
        const start = new Date(item.startTime).getTime();
        const end = new Date(item.endTime).getTime();

        if (statusFilter === 2) return now >= start && now <= end; // OPENING
        if (statusFilter === 3) return now > end; // CLOSED
        if (statusFilter === 4) return now < start; // UPCOMING
        return true;
      });
    }

    // 4. Sắp xếp theo created_at (Mới nhất lên đầu nếu isDesc = true)
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return isDesc ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [myExams, searchTerm, selectedSubject, statusFilter, isDesc]);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Logic phân trang (Cắt mảng từ filteredTests đã được sort)
  const { currentData, totalPages } = useMemo(() => {
    const total = filteredTests.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
      currentData: filteredTests.slice(startIndex, startIndex + itemsPerPage),
      totalPages: pages,
    };
  }, [filteredTests, currentPage]);

  // 3. Tự động cuộn lên khi đổi trang
  useEffect(() => {
    const listTop = document.getElementById("test-list-container");
    if (listTop) {
      listTop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <MainContentLayout>
      <div
        id="test-list-container"
        className="flex justify-between rounded-md bg-background-body-background px-2 py-2"
      >
        {/* Left */}
        <div className="flex gap-2">
          <SelectField
            placeholder={t("testPage.filter.all")}
            options={[
              { label: t("testPage.filter.all"), value: 1 },
              { label: t("testPage.filter.opening"), value: 2 },
              { label: t("testPage.filter.closed"), value: 3 },
              {
                label: t("testPage.filter.notOpened"),
                value: 4,
              },
            ]}
            onSelect={(opt) => setStatusFilter(Number(opt))}
          />
          <Input
            hasBoder={true}
            placeholder={t("testPage.searchPlaceholder")}
            icon={<Icon name="search" className="text-text-disabled" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Thêm dòng này
            }}
          />
          <SelectField
            label={t("testPage.subject")}
            placeholder={t("testPage.selectSubjectPlaceholder")}
            options={[
              { label: "Tất cả", value: -1 },
              ...subjects.map((item) => ({
                label: item.subjectName,
                value: item.id,
              })),
            ]}
            onSelect={(opt) => setSelectedSubject(opt)}
          />
        </div>

        {/* Right */}
        <div className="flex justify-center gap-2">
          <Button
            variant={!isDesc ? "outline" : "contained"}
            color={!isDesc ? "standard" : "primary"}
            onClick={() => setIsDesc(!isDesc)}
            tooltip="Mới nhất"
          >
            <Icon name="arrowUpDown" />
          </Button>

          {actions.includes("create") && (
            <Link to="/tests/add">
              <Button variant={"contained"} color={"primary"}>
                <Icon name="plus" size={20} />
                {t("testPage.addNew")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Container danh sách đề thi */}
        <div id="test-list-container" className="flex flex-col gap-2">
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <TestItem key={item.id} data={item} actions={actions} />
            ))
          ) : (
            <div className="rounded-md bg-background-body-background p-10 text-center text-text-disabled">
              Không có dữ liệu
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="rounded-md bg-background-body-background py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </MainContentLayout>
  );
};
