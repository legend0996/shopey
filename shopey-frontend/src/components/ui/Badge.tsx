import clsx from "clsx";
import { STATUS_MAP } from "@/types";

interface BadgeProps {
  status?: string;
  label?: string;
  className?: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

const variantMap: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-700",
};

export function Badge({ status, label, className, variant }: BadgeProps) {
  const mapped = status ? STATUS_MAP[status] : null;
  const colorClass = mapped?.color ?? (variant ? variantMap[variant] : variantMap.neutral);
  const text = label ?? mapped?.label ?? status;

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorClass,
        className
      )}
    >
      {text}
    </span>
  );
}
