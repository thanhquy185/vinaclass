import { Input } from "../../atoms";
import Divider from "../../atoms/Divider/Divider";

interface TimePickerProps {
  selected?: Date;
  onChange: (hours: number, minutes: number) => void;
}

const TimePicker = ({ selected, onChange }: TimePickerProps) => {
  const currentHour = selected ? selected.getHours() : 12;
  const currentMinute = selected ? selected.getMinutes() : 0;

  const updateTime = (type: "h" | "m", value: number) => {
    if (type === "h") onChange(Math.max(0, Math.min(23, value)), currentMinute);
    else onChange(currentHour, Math.max(0, Math.min(59, value)));
  };

  return (
    <div className="flex items-center justify-center gap-4 rounded-b-xl border-t border-other-outlined-border py-3">
      <Input
        type="number"
        value={currentHour.toString().padStart(2, "0")}
        onChange={(e) => updateTime("h", parseInt(e.target.value))}
      />

      <Divider orientation="vertical" />

      <Input
        type="number"
        value={currentMinute.toString().padStart(2, "0")}
        onChange={(e) => updateTime("m", parseInt(e.target.value))}
      />
    </div>
  );
};

export default TimePicker;
