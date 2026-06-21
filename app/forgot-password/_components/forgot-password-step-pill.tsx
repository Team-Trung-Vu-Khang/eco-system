"use client";

type ForgotPasswordStepPillProps = {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
};

export function ForgotPasswordStepPill({
  index,
  label,
  active,
  completed,
}: ForgotPasswordStepPillProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold"
      style={{
        borderColor:
          completed || active ? "var(--mevi-green-200)" : "rgba(212,229,216,0.7)",
        background: completed || active ? "rgba(236,253,245,0.9)" : "rgba(255,255,255,0.7)",
        color: active || completed ? "var(--mevi-green-800)" : "var(--mevi-text-muted)",
      }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
        style={{
          background:
            active || completed ? "var(--mevi-green-600)" : "rgba(122,154,138,0.14)",
          color: active || completed ? "#fff" : "var(--mevi-text-muted)",
        }}
      >
        {index}
      </span>
      <span>{label}</span>
    </div>
  );
}

