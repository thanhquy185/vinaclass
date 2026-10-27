import type {
  ArgsProps,
  NotificationInstance,
} from "antd/es/notification/interface";

export function openNotification(
  notification: NotificationInstance,
  options: ArgsProps
) {
  notification.open(options);
}

export function closeNotification(
  notification: NotificationInstance,
  key?: string
) {
  notification.destroy(key);
}
