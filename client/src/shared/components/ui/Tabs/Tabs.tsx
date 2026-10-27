import { Tabs as AntTabs } from "antd";
import { cn } from "@/shared/utils/cn";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: TabItem[];
  className?: string;
  tabClassName?: string;
  childClassName?: string;
  small?: boolean;
}

export default function Tabs({
  value,
  onChange,
  tabs,
  className = "",
  tabClassName = "",
  childClassName = "",
  small = false,
}: TabsProps) {
  return (
    <AntTabs
      activeKey={value}
      onChange={onChange}
      size={small ? "small" : "middle"}
      items={tabs.map((tab) => ({ key: tab.value, label: tab.label }))}
      classNames={{ item: cn(tabClassName, childClassName) }}
      className={cn(
        "min-w-0 [&_.ant-tabs-content-holder]:hidden [&_.ant-tabs-nav]:mb-0",
        small
          ? "[&_.ant-tabs-tab]:px-3 [&_.ant-tabs-tab]:py-3"
          : "[&_.ant-tabs-tab]:px-5 [&_.ant-tabs-tab]:py-5",
        className
      )}
    />
  );
}
