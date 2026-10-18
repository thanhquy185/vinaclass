import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionService } from "@/services/api/question.service";

// 1. Hook dùng cho trang Danh sách
export const useQuestions = () => {
  const query = useQuery({
    queryKey: ["questions"],
    queryFn: questionService.getAllQuestions,
    select: (res) => res.data,
  });

  return {
    questions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useQuestionsPrivate = (id?: number) => {
  const query = useQuery({
    queryKey: ["questions", "private", id],
    queryFn: () => questionService.getQuestionsWithPrivate(id!),
    enabled: !!id,
    select: (res) => res.data,
  });

  return {
    privateQuestions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Lấy tất cả câu hỏi public trong db
export const useQuestionsPublic = () => {
  const query = useQuery({
    queryKey: ["questions", "public"],
    queryFn: () => questionService.getPublicQuestions(),
    select: (res) => res.data,
  });

  return {
    publicQuestions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Lấy tất cả câu hỏi của user (public, private, archive)
export const useQuestionsOfUser = (userId?: number) => {
  const query = useQuery({
    queryKey: ["questions", "teacher", userId],
    queryFn: () => questionService.getQuestionsByTeacher(userId!),
    enabled: !!userId,
    select: (res) => res.data,
  });

  return {
    personalQuestions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Thêm mới
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: questionService.createQuestion,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    createQuestion: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

// Copy xuống private
export const useCopyQuestionToPrivate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: questionService.copyQuestionFromPublic,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    copyQuestion: mutation.mutateAsync,
    isCopying: mutation.isPending,
    isCopyError: mutation.isError,
    isCopySuccess: mutation.isSuccess,
  };
};

//Update status
export const useUpdateQuestionStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: questionService.updateQuestionStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const publicQuestionAsync = (id: number) => {
    return mutation.mutateAsync({
      id,
      data: { status: "public" },
    });
  };

  const archiveQuestionAsync = (id: number) => {
    return mutation.mutateAsync({
      id,
      data: { status: "archive" },
    });
  };

  const restoreQuestionAsync = (id: number) => {
    return mutation.mutateAsync({
      id,
      data: { status: "private" },
    });
  };

  return {
    publicQuestionAsync,
    archiveQuestionAsync,
    restoreQuestionAsync,

    isUpdatingStatus: mutation.isPending,
    isUpdateStatusError: mutation.isError,
    isUpdateStatusSuccess: mutation.isSuccess,
  };
};

// Sửa
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: questionService.updateQuestion,

    onSuccess: () => {
      // Sau khi Sửa thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    updateQuestion: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

// Xóa
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: questionService.deleteQuestion,

    onSuccess: () => {
      // Sau khi xóa thành công → reload danh sách roles
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    deleteQuestion: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};

// 2. Hook dùng cho trang Chi tiết hoặc Modal
export const useQuestionDetail = (id: number | undefined) => {
  const query = useQuery({
    queryKey: ["questions", id],
    queryFn: () => questionService.getQuestionById(id!),
    // Chỉ chạy query này nếu có id truyền vào
    enabled: !!id,
    select: (res) => res.data,
    // Giữ dữ liệu cũ trong khi đang fetch dữ liệu mới (tránh màn hình trắng)
    placeholderData: (previousData) => previousData,
  });

  return {
    question: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // Đang lấy lại dữ liệu ngầm
    isError: query.isError,
  };
};
