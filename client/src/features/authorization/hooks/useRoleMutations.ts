import { roleService } from "@/features/authorization/api/role.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

export const useCreateRole = () => {
  const mutation = useInvalidatingMutation(roleService.create, () => [
    authorizationQueryKeys.roles.root,
  ]);

  return {
    createRole: mutation.mutate,
    createRoleAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useUpdateRole = () => {
  const mutation = useInvalidatingMutation(roleService.update, () => [
    authorizationQueryKeys.roles.root,
  ]);

  return {
    updateRole: mutation.mutate,
    updateRoleAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

export const useDeleteRole = () => {
  const mutation = useInvalidatingMutation(roleService.delete, () => [
    authorizationQueryKeys.roles.root,
  ]);

  return {
    deleteRole: mutation.mutate,
    deleteRoleAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
