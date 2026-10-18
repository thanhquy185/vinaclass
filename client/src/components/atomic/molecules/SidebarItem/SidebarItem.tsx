import { Link, useLocation } from "react-router-dom";

interface SidebarItemProps {
  icon: string;
  label: string;
  to: string;
  hasSubmenu?: boolean;
  hideLabel?: boolean;
}

export const SidebarItem = ({
  icon,
  label,
  to,
  hasSubmenu,
  hideLabel,
}: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to);
  const isUserItem = label === "Người dùng";

  return (
    <Link
      to={to}
      title={hideLabel ? label : ""}
      className={`group relative mb-1 flex items-center rounded-xl transition-all duration-300 ${hideLabel ? "mx-2 justify-center px-0 py-2.5" : "mx-3 gap-3.5 px-4 py-2.5"} ${
        isActive
          ? "bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-100/50"
          : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
      } `}
    >
      {isActive && (
        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-indigo-600" />
      )}

      <img
        src={icon}
        alt={label}
        className={`h-6 w-6 object-contain transition-all duration-300 ${label === "Người dùng" ? "scale-[0.8]" : ""} ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"} ${
          isUserItem
            ? isActive
              ? "scale-[0.9]"
              : "scale-[0.85] group-hover:scale-[0.9]"
            : isActive
              ? "scale-110"
              : "group-hover:scale-110"
        } `}
      />

      {!hideLabel && (
        <>
          <span
            className={`animate-fade-in flex-1 truncate text-[14px] transition-colors duration-300 ${isActive ? "font-semibold" : "font-medium"} `}
          >
            {label}
          </span>

          {hasSubmenu && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`ml-auto h-3.5 w-3.5 transition-transform duration-300 ${
                isActive
                  ? "rotate-90 text-indigo-600"
                  : "text-slate-300 group-hover:text-indigo-600"
              }`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
        </>
      )}
    </Link>
  );
};
