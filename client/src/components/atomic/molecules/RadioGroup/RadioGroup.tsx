import { RadioButton } from "@/components/atomic/atoms/RadioButton/RadioButton";

interface Option {
  label: string;
  value: boolean;
}

export const RadioGroup = ({
  options,
  name,
  onChange,
  value,
  disabled,
}: {
  options: Option[];
  name: string;
  onChange: (value: boolean) => void;
  value: boolean;
  disabled: boolean;
}) => {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <RadioButton
          key={String(opt.value)}
          label={opt.label}
          name={name}
          value={String(opt.value)}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          id={`${name}-${opt.value}`}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
