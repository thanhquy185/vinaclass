import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/api/user.service";

export const useUser = () => {
  // Lấy danh sách
  const query = useQuery({
    queryKey: ["users", "all"],
    queryFn: userService.getAllUsers,
    select: (res) => res.data,
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
  };
};

// Thêm mới
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.createUser,

    onSuccess: () => {
      // Sau khi thêm thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    createUser: mutation.mutate, // gọi bình thường
    createUserAsync: mutation.mutateAsync, // dùng await nếu cần
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.changePassword,

    onSuccess: () => {
      // Sau khi thêm thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return {
    changePassword: mutation.mutateAsync,
    isChanging: mutation.isPending,
    isChangeError: mutation.isError,
    isChangeSuccess: mutation.isSuccess,
  };
};

// Sửa
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.updateUser,

    onSuccess: () => {
      // Sau khi Sửa thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    updateUser: mutation.mutate, // gọi bình thường
    updateUserAsync: mutation.mutateAsync, // dùng await nếu cần
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

// // Xóa
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.deleteUser,

    onSuccess: () => {
      // Sau khi xóa thành công → reload danh sách roles
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    deleteUser: mutation.mutate, // gọi bình thường
    deleteUserAsync: mutation.mutateAsync, // dùng await nếu cần
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.resetUserPassword,

    onSuccess: () => {
      // Sau khi xóa thành công → reload danh sách roles
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    isResetting: mutation.isPending,
    isResetError: mutation.isError,
    isResetSuccess: mutation.isSuccess,
  };
};

export const useTeachers = () => {
  const query = useQuery({
    queryKey: ["users", "teachers"],
    queryFn: userService.getTeachers,
    select: (res) => res.data,
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
  };
};
