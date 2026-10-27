import { userService } from "@/features/identity/api/user.service";
import { userQueryKeys } from "@/features/identity/queryKeys";
import { sessionQueryKeys } from "@/shared/queryKeys/session";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export const useCreateUser = () => {
  const mutation = useInvalidatingMutation(userService.createUser, () => [
    userQueryKeys.root,
  ]);

  return {
    createUser: mutation.mutate,
    createUserAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useChangePassword = () => {
  const mutation = useInvalidatingMutation(userService.changePassword, () => [
    sessionQueryKeys.currentUser,
  ]);

  return {
    changePassword: mutation.mutateAsync,
    isChanging: mutation.isPending,
    isChangeError: mutation.isError,
    isChangeSuccess: mutation.isSuccess,
  };
};

export const useUpdateUser = () => {
  const mutation = useInvalidatingMutation(userService.updateUser, () => [
    userQueryKeys.root,
  ]);

  return {
    updateUser: mutation.mutate,
    updateUserAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

export const useUpdateUserLock = () => {
  const mutation = useInvalidatingMutation(userService.updateUserLock, () => [
    userQueryKeys.root,
  ]);

  return {
    updateUserLock: mutation.mutate,
    updateUserLockAsync: mutation.mutateAsync,
    isUpdatingUserLock: mutation.isPending,
  };
};

export const useUpdateOwnProfile = () => {
  const mutation = useInvalidatingMutation(
    userService.updateOwnProfile,
    () => [sessionQueryKeys.currentUser, userQueryKeys.root],
    {
      onSuccessBeforeInvalidation: ({ data }) => {
        useAuthStore.getState().updateUser(data);
      },
    }
  );

  return {
    updateOwnProfile: mutation.mutateAsync,
    isUpdatingOwnProfile: mutation.isPending,
  };
};

export const useDeleteUser = () => {
  const mutation = useInvalidatingMutation(userService.deleteUser, () => [
    userQueryKeys.root,
  ]);

  return {
    deleteUser: mutation.mutate,
    deleteUserAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};

export const useResetUserPassword = () => {
  const mutation = useInvalidatingMutation(
    userService.resetUserPassword,
    () => [userQueryKeys.root]
  );

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    isResetting: mutation.isPending,
    isResetError: mutation.isError,
    isResetSuccess: mutation.isSuccess,
  };
};
