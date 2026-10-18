import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/api/role.service";

export const useRole = () => {
  // Lấy danh sách
  const query = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getAll,
    select: (res) => res.data,
  });

  return {
    roles: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useRoleDetail = (id: number | undefined) => {
  const query = useQuery({
    queryKey: ["roles", id],
    queryFn: () => roleService.getById(id!),
    // Chỉ chạy query này nếu có id truyền vào
    enabled: !!id,
    select: (res) => res.data,
    // Giữ dữ liệu cũ trong khi đang fetch dữ liệu mới (tránh màn hình trắng)
    placeholderData: (previousData) => previousData,
  });

  return {
    role: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // Đang lấy lại dữ liệu ngầm
    isError: query.isError,
  };
};

// Thêm mới
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: roleService.create, // API thêm mới

    onSuccess: () => {
      // Sau khi thêm thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    createRole: mutation.mutate, // gọi bình thường
    createRoleAsync: mutation.mutateAsync, // dùng await nếu cần
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

// Sửa
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: roleService.update, // API Sửa

    onSuccess: () => {
      // Sau khi Sửa thành công → gọi lại danh sách roles
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    updateRole: mutation.mutate, // gọi bình thường
    updateRoleAsync: mutation.mutateAsync, // dùng await nếu cần
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

// Xóa
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: roleService.delete, // API xóa

    onSuccess: () => {
      // Sau khi xóa thành công → reload danh sách roles
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    deleteRole: mutation.mutate, // gọi bình thường
    deleteRoleAsync: mutation.mutateAsync, // dùng await nếu cần
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
