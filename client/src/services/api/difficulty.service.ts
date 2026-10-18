import type { ApiResponse, Difficulty } from "@/types";
import axiosClient from "./axios";

export const difficultyService = {
  getAllDifficulties: (): Promise<ApiResponse<Difficulty[]>> =>
    axiosClient.get("/difficulties"),

  createDifficulty: (data: Difficulty): Promise<ApiResponse<Difficulty>> =>
    axiosClient.post("/difficulties", {
      difficulty_name: data.difficultyName,
    }),

  updateDifficulty: ({
    difficultyId,
    data,
  }: {
    difficultyId: number;
    data: Difficulty;
  }): Promise<ApiResponse<Difficulty>> =>
    axiosClient.put(`/difficulties/${difficultyId}`, {
      difficulty_name: data.difficultyName,
    }),

  deleteDifficulty: (difficultyId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/difficulties/${difficultyId}`),
};
