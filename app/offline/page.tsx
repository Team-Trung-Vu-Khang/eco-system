import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f8f5ec_38%,_#fff7ed_100%)] px-6 py-16 text-[#1a3c2a]">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-[#d4e5d8] bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(6,78,59,0.08)] backdrop-blur">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#047857]">
          Offline mode
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Bạn đang ngoại tuyến
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#4a6e5a] sm:text-lg">
          MEVI vẫn giữ lại một phần nội dung đã truy cập gần đây. Khi mạng quay
          lại, hãy tải lại trang để đồng bộ dữ liệu mới nhất.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#047857] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#065f46]"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
