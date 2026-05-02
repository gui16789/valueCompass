"use client";

import { useFormStatus } from "react-dom";

export function PendingButton({
  children,
  pendingChildren,
  className,
  disabled
}: {
  children: React.ReactNode;
  pendingChildren: React.ReactNode;
  className: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={disabled || pending}>
      {pending ? pendingChildren : children}
    </button>
  );
}
