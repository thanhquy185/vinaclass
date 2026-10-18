import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignService } from "@/services/api/assign.service";

export const useAssignments = () => {
  const query = useQuery({
    queryKey: ["assignments"],
    queryFn: assignService.getAllAssignments,
    select: (res) => res.data,
  });

  return {
    assignments: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useSyncAssignments = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: assignService.syncAssignments,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  return {
    syncAssignments: mutation.mutate,
    syncAssignmentsAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useGetSubjectsByTeacher = (teacherId: number) => {
  const query = useQuery({
    queryKey: ["assignments", "teacher", teacherId],
    queryFn: () => assignService.getSubjectsByTeacher(teacherId),
    select: (res) => res.data,
  });

  return {
    subjects: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: assignService.deleteAssignment,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  return {
    deleteAssignment: mutation.mutate,
    deleteAssignmentAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
