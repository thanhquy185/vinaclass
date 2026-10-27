import { Switch } from "antd";

interface ExamConfigurationSwitchProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

export default function ExamConfigurationSwitch({
  label,
  checked,
  disabled,
  onChange,
}: ExamConfigurationSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text-primary">{label}</span>
      <Switch
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}
