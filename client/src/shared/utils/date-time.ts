/** Format a date and time as HH:mm DD/MM/YYYY. */
export const formatFullDateTimeVN = (
  isoString: string | Date | null | undefined
): string => {
  if (!isoString) return "---";

  const date = new Date(isoString);

  // Return a fallback when the date is invalid.
  if (isNaN(date.getTime())) return "---";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false, // Use a 24-hour clock.
  })
    .format(date)
    .replace(",", ""); // Remove the comma between time and date.
};

/** Format an ISO timestamp as a Vietnamese date or relative time. */
export const formatDateTimeVN = (isoString: string | Date): string => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const now = new Date();

  // Calculate the elapsed time in seconds.
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Return a relative-time label.

  if (diffInSeconds < 0) return "Sắp tới";
  if (diffInSeconds < 5) return "Vừa xong";

  // Format intervals shorter than one minute.
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;

  // Format intervals shorter than one hour.
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  }

  // Format intervals shorter than one day.
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  }

  // Format older timestamps as a Vietnamese date.
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/** Split an ISO timestamp into localized date and time strings. */
export const splitDateTime = (isoString: string | Date | null | undefined) => {
  const defaultResult = { date: "---", time: "---" };

  if (!isoString) return defaultResult;

  const d = new Date(isoString);

  // Return fallback values when the date is invalid.
  if (isNaN(d.getTime())) return defaultResult;

  // Format the date as DD/MM/YYYY.
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

  // Format the time as HH:mm.
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return { date, time };
};

/** Format an ISO timestamp as HH:mm in the local timezone. */
export const formatIsoToTime = (
  isoString: string | undefined | null
): string => {
  if (!isoString) return "--:--";

  const date = new Date(isoString);

  // Return a fallback for invalid timestamps.
  if (isNaN(date.getTime())) return "--:--";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};
