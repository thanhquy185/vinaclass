export const getProgressColor = (percent: number) => {
  if (percent >= 80) return "bg-alert-success-content"; // High score.
  if (percent >= 65) return "bg-alert-info-content"; // Good score.
  if (percent >= 50) return "bg-alert-warning-content"; // Average score.
  if (percent > 0) return "bg-alert-error-content"; // Low score.
  return "bg-text-disabled"; // No score.
};

export const getTextProgressColor = (percent: number) => {
  if (percent >= 80) return "text-alert-success-content"; // High score.
  if (percent >= 65) return "text-alert-info-content"; // Good score.
  if (percent >= 50) return "text-alert-warning-content"; // Average score.
  if (percent > 0) return "text-alert-error-content"; // Low score.
  return "text-text-disabled"; // No score.
};

export const getTextProgress = (percent: number) => {
  if (percent >= 80) return "Tốt"; // High score.
  if (percent >= 65) return "Khá"; // Good score.
  if (percent >= 50) return "Trung bình"; // Average score.
  if (percent > 0) return "Yếu"; // Low score.
  return "Chưa làm"; // No score.
};
