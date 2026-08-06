import { LogOut, Sprout } from "lucide-react";
import Link from "next/link";
import { MeviPortalFooter } from "@/components/mevi-portal-footer";
import { MeviPortalHeader } from "@/components/mevi-portal-header";
import { DecorativeLeaves } from "./_components/decorative-leaves";
import { RegistrationForm } from "./_components/registration-form";

export default function RegistrationPage() {
  return (
    <div className="mevi-portal relative flex h-dvh flex-col overflow-hidden">
      <DecorativeLeaves />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(13rem+env(safe-area-inset-bottom))] sm:pb-32">
        <MeviPortalHeader
          badgeLabel="Đăng ký"
          className="px-4 py-4 sm:px-6 md:px-10"
          rightSlot={
            <>
              <div className="sm:hidden">
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium opacity-80 transition hover:opacity-100"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Quay lại
                </Link>
              </div>

              <div className="hidden items-center gap-5 sm:flex">
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium opacity-80 transition hover:opacity-100"
                  style={{ color: "var(--mevi-text-muted)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Quay lại
                </Link>
              </div>
            </>
          }
        />

        <main className="flex w-full flex-1 items-center px-3 py-2 sm:px-6 md:px-10">
          <div className="mx-auto grid w-full max-w-5xl gap-3 lg:grid-cols-[0.88fr_1.12fr]">
            <section className="hidden flex-col justify-center lg:flex">
              <div className="mevi-ecosystem-badge mb-3 w-fit px-3 py-1 text-[11px]">
                <Sprout className="h-3 w-3" />
                <span>Mevi Registration</span>
              </div>

              <h2
                className="max-w-xl text-balance text-[clamp(1.75rem,3.2vw,2.85rem)] font-bold leading-[1.07] tracking-[-0.02em]"
                style={{ color: "var(--mevi-text-primary)" }}
              >
                Đăng ký để tham gia
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--mevi-green-600), var(--mevi-earth-600))",
                  }}
                >
                  hệ sinh thái nông nghiệp MEVI
                </span>
              </h2>

              <p
                className="mt-3 max-w-lg text-[15px] leading-7"
                style={{ color: "var(--mevi-text-secondary)" }}
              >
                Điền nhanh các thông tin cơ bản để đội ngũ MEVI hiểu hơn về khu
                vực bạn đang hoạt động, tỉnh/thành phố, phường/xã và nhóm đối
                tượng bạn đang hướng tới.
              </p>

              <div className="mt-4 grid gap-2.5">
                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 1
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Cung cấp thông tin cá nhân
                  </p>
                </div>

                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 2
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Chọn tỉnh và phường/xã
                  </p>
                </div>

                <div className="mevi-login-card rounded-2xl p-3 shadow-[0_8px_18px_-14px_rgba(6,78,59,0.25)]">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--mevi-text-muted)" }}
                  >
                    Bước 3
                  </p>
                  <p
                    className="mt-1.5 text-sm font-semibold"
                    style={{ color: "var(--mevi-text-primary)" }}
                  >
                    Chọn nhóm đối tượng phù hợp
                  </p>
                </div>
              </div>
            </section>

            <section className="mevi-login-card mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col rounded-[24px] p-4 sm:p-[18px] md:p-5">
              <div className="mb-3">
                <h3
                  className="text-base font-bold md:text-lg"
                  style={{ color: "var(--mevi-text-primary)" }}
                >
                  Phiếu đăng ký
                </h3>
              </div>

              <RegistrationForm />
            </section>
          </div>
        </main>
      </div>

      <MeviPortalFooter />
    </div>
  );
}
