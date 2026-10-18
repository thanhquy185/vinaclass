// src/components/molecules/Tabs/Tabs.tsx

interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: TabItem[];
  className?: string;
  tabClassName?: string;
  childClassName?: string;
  small?: boolean;
}

/**
 * Component Tabs reusable (molecules level)
 * - Controlled component: nhận value và onChange từ bên ngoài
 * - Dùng Tailwind classes, dễ override
 * - Hỗ trợ disabled tab
 *
 * @example
 * <Tabs
 *   value={selected}
 *   onChange={setSelected}
 *   tabs={[
 *     { value: 'public', label: 'Công khai' },
 *     { value: 'private', label: 'Cá nhân' },
 *     { value: 'archive', label: 'Lưu trữ', disabled: true },
 *   ]}
 * />
 */
export default function Tabs({
  value,
  onChange,
  tabs,
  className = "",
  childClassName = "",
  small = false,
}: TabsProps) {
  return (
    <div
      className={`${small ? "text-body-2" : "text-button-medium"} flex ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              onChange(tab.value);
            }}
            className={`${small ? "text-body-2 p-3 font-medium" : "text-body-1 p-5"} cursor-pointer border-b-2 ${
              isActive
                ? "border-primary-main text-primary-main"
                : "border-background-body-background text-text-primary"
            } ${childClassName}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
