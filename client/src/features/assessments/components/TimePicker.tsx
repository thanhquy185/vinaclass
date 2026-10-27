import { TimePicker as AntTimePicker } from "antd";
import dayjs from "dayjs";

export interface TimePickerProps {
  selected?: Date;
  onChange: (hours: number, minutes: number) => void;
}

const TimePicker = ({ selected, onChange }: TimePickerProps) => {
  const selectedTime =
    selected instanceof Date && Number.isFinite(selected.getTime())
      ? dayjs(selected)
      : dayjs().startOf("day").hour(12);

  return (
    <AntTimePicker
      value={selectedTime}
      format="HH:mm"
      showNow={false}
      className="w-full"
      onChange={(value) => {
        if (value) onChange(value.hour(), value.minute());
      }}
    />
  );
};

export default TimePicker;
