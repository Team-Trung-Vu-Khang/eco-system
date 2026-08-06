export function DecorativeLeaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute -top-4 -right-12 h-64 w-64 opacity-[0.04] animate-leaf-sway"
        viewBox="0 0 200 200"
      >
        <path
          d="M120 20 C160 40, 180 80, 170 130 C160 160, 130 180, 90 170 C60 160, 40 130, 50 90 C55 60, 80 30, 120 20Z"
          fill="currentColor"
          className="text-green-700"
        />
      </svg>
      <svg
        className="absolute -bottom-8 -left-16 h-48 w-48 opacity-[0.03]"
        viewBox="0 0 200 200"
        style={{ animation: "leaf-sway 4s ease-in-out infinite 1.5s" }}
      >
        <path
          d="M40 160 C20 120, 30 70, 70 40 C100 20, 140 30, 160 60 C170 80, 165 110, 140 130 C110 155, 70 170, 40 160Z"
          fill="currentColor"
          className="text-green-600"
        />
      </svg>
    </div>
  );
}
