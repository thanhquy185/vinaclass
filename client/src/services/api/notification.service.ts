import type {
  ApiResponse,
  Notification,
  NotificationCreate,
  NotificationResponse,
  NotificationUpdate,
} from "@/types";
import axiosClient from "./axios";

export const notificationService = {
  getAllNotifications: (): Promise<ApiResponse<NotificationResponse[]>> =>
    axiosClient.get("/notifications"),

  createNotification: (data: NotificationCreate): Promise<ApiResponse<Notification>> =>
    axiosClient.post("/notifications", {
      title: data.title,
      content: data.content,
      sender_id: data.senderId,
      course_group_ids: data.courseGroupIds,
    }),

  updateNotification: ({
    notificationId,
    data,
  }: {
    notificationId: number;
    data: NotificationUpdate;
  }): Promise<ApiResponse<Notification>> =>
    axiosClient.put(`/notifications/${notificationId}`, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.senderId !== undefined && { sender_id: data.senderId }),
      ...(data.courseGroupIds !== undefined && {
        course_group_ids: data.courseGroupIds,
      }),
    }),

  deleteNotification: (notificationId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/notifications/${notificationId}`),

  deleteNotificationInGroup: (
    notificationId: number
  ): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/notifications/${notificationId}`),
};
