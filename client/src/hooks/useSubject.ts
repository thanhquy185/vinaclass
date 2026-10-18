import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectService } from "@/services/api/subject.service";
import type { Subject } from "@/types";

export const useSubject = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getAllSubjects,
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: subjectService.createSubject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Subject) => subjectService.updateSubject(data.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: subjectService.deleteSubject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const queryWithGroup = useQuery({
    queryKey: ["subjects", "group"],
    queryFn: subjectService.getSubjectsWithCourseGroups,
    select: (res) => res.data,
  });

  const queryWithChapters = useQuery({
    queryKey: ["subjects", "chapters"],
    queryFn: subjectService.getSubjectsWithChapters,
    select: (res) => res.data,
  });

  return {
    subjects: query.data || [],
    subjectsWithGroup: queryWithGroup.data || [],
    subjectsWithChapters: queryWithChapters.data || [],
    isLoading: query.isLoading,
    createSubject: createMutation.mutateAsync,
    updateSubject: updateMutation.mutateAsync,
    deleteSubject: deleteMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};

export const useSubjectsByTeacher = (teacherId?: number) => {
  const query = useQuery({
    queryKey: ["subjects", "teacher", teacherId],
    queryFn: () => subjectService.getSubjectsByTeacher(teacherId!),
    enabled: !!teacherId,
    select: (res) => res.data,
  });

  return {
    subjects: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
