import { examService } from "@/services/api/exam.service";
import { useDeThiStore } from "@/stores/useDeThi.store";
import type { CreateExamPayload } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useExams = () => {
  const query = useQuery({
    queryKey: ["exams"],
    queryFn: examService.getAllExams,
    select: (res) => res.data,
  });

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useExamsByCourseGroupAndStudent = (
  courseGroupId?: number,
  studentId?: number
) => {
  const query = useQuery({
    queryKey: ["exams", courseGroupId, studentId],
    queryFn: () =>
      examService.getExamByCourseGroupAndStudent(courseGroupId!, studentId!),
    enabled: !!courseGroupId && !!studentId,
    select: (res) => res.data || [],
  });

  return {
    exams: query.data || null,
    isLoading: query.isLoading,
  };
};

export const useStudentExams = (studentId: number | null) => {
  const query = useQuery({
    queryKey: ["exams", "student", studentId],
    queryFn: () => examService.getExamsByStudent(studentId!),
    select: (res) => res.data || [],
    enabled: !!studentId, // Chỉ chạy khi có ID
  });

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useExamDetail = (
  examId: number | null,
  options?: { enabled?: boolean }
) => {
  const updateTestData = useDeThiStore((state) => state.updateTestData);

  const query = useQuery({
    queryKey: ["exams", "detail", examId],
    queryFn: async () => {
      const res = await examService.getExamById(examId!);
      // Cập nhật Store ngay khi dữ liệu vừa về từ API
      if (res.data) {
        updateTestData(res.data);
      }
      return res.data;
    },
    enabled: !!examId && options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    exam: query.data,
    examConfiguration: query.data?.examConfiguration,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // Thêm cái này để quản lý UI tốt hơn
    isError: query.isError,
  };
};

/**
 * Hook xử lý Tạo mới đề thi
 */
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExamPayload) => examService.createExam(payload),
    onSuccess: () => {
      // Làm mới danh sách đề thi sau khi tạo thành công
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      // toast.success("Tạo đề thi thành công!");
      console.log("Tạo đề thi thành công");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      // toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo đề thi");
      console.log(
        error?.response?.data?.message || "Có lỗi xảy ra khi tạo đề thi"
      );
    },
  });
};

/**
 * Hook xử lý Cập nhật đề thi
 */
export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateExamPayload }) =>
      examService.updateExam(id, payload),
    onSuccess: (_, variables) => {
      // Làm mới danh sách và chi tiết đề thi vừa sửa
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({
        queryKey: ["exams", "detail", variables.id],
      });
      // toast.success("Cập nhật đề thi thành công!");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    onError: (_error: any) => {
      // toast.error(
      //   error?.response?.data?.message || "Không thể cập nhật đề thi"
      // );
    },
  });
};

/**
 * Hook xử lý Xóa đề thi
 */
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. Mutation function gọi tới service
    mutationFn: (id: number) => examService.deleteExam(id),

    // 2. Xử lý khi thành công
    onSuccess: (_response, id) => {
      // Làm mới danh sách đề thi (để mất dòng vừa xóa trên table/list)
      queryClient.invalidateQueries({ queryKey: ["exams"] });

      // Xóa cache chi tiết của đề thi đó (để giải phóng bộ nhớ)
      queryClient.removeQueries({ queryKey: ["exams", "detail", id] });

      console.log(`Xóa đề thi ID: ${id} thành công`);
      // toast.success("Xóa đề thi thành công!");
    },

    // 3. Xử lý khi lỗi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Không thể xóa đề thi này";
      console.error("Lỗi xóa đề thi:", errorMsg);
      // toast.error(errorMsg);
    },
  });
};
