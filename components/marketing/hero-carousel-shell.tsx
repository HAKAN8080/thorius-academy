import type { ReactNode } from "react";

export function HeroCarouselHeading() {
  return (
    <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-accent-400 lg:text-left">
      Öne Çıkan Kurslar
    </p>
  );
}

export function HeroCarouselShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full">
      <div className="rounded-[1.35rem] border border-white/[0.12] bg-gradient-to-b from-[#3d3d40] via-[#2e2e31] to-[#252528] p-2 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.65)] sm:rounded-[1.5rem] sm:p-2.5">
        <div className="flex items-center gap-3 rounded-t-[0.85rem] border-b border-white/[0.06] bg-[#1a1a1c]/95 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] sm:h-3 sm:w-3" />
          </div>
          <p className="flex-1 truncate text-center text-[10px] font-medium tracking-wide text-white/35 sm:text-[11px]">
            Thorius Academy — academy.thorius.com.tr
          </p>
          <div className="hidden w-[52px] shrink-0 sm:block" aria-hidden="true" />
        </div>

        <div className="overflow-hidden rounded-b-[0.85rem] bg-[#0a0a0b] ring-1 ring-inset ring-black/40">
          {children}
        </div>
      </div>

      <div
        className="mx-auto -mt-px h-[7px] w-[18%] rounded-b-md bg-gradient-to-b from-[#4a4a4d] to-[#353538] sm:h-2"
        aria-hidden="true"
      />
      <div
        className="mx-auto mt-1 h-[3px] w-[62%] rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

/** Kontrol şeridi yüksekliği — statik önizleme ile carousel hizası */
export function HeroCarouselControlsPlaceholder({ slideCount }: { slideCount: number }) {
  if (slideCount <= 1) {
    return null;
  }

  return <div className="mt-4 h-9 sm:h-9" aria-hidden="true" />;
}
