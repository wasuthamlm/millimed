"use client";

import { Select } from "@/components/admin/Select";
import { cn } from "@/lib/utils";

export function StatusSelectPill<T extends string>({
  value,
  options,
  colorClass,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  colorClass: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <Select
      value={value}
      options={options}
      disabled={disabled}
      onChange={onChange}
      ariaLabel={ariaLabel}
      triggerClassName={cn("rounded-full py-0.5 pl-2.5 pr-2 text-xs font-medium hover:brightness-95", colorClass)}
    />
  );
}
