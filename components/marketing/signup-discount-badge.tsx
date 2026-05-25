import Link from "next/link";
import { SIGNUP_DISCOUNT_PERCENT } from "@/lib/constants/promo";

export function SignupDiscountBadge() {
  return (
    <Link
      href="/kayit"
      className="group block rounded-2xl border-4 border-accent-400 bg-accent-400 p-5 shadow-[0_12px_40px_-8px_rgba(212,175,55,0.55)] transition-transform hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
      aria-label={`Üye olun, %${SIGNUP_DISCOUNT_PERCENT} indirim kazanın`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-900/70">
        İlk Üyelere Özel
      </p>
      <p className="mt-1 text-3xl font-extrabold leading-none text-primary-950 sm:text-4xl">
        %{SIGNUP_DISCOUNT_PERCENT}
      </p>
      <p className="mt-1 text-lg font-bold text-primary-900">İndirim</p>
      <p className="mt-3 text-sm font-medium text-primary-900/80">
        Ücretsiz kayıt olun, kupon kodunuz e-postanıza gelsin.
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-950 underline-offset-4 group-hover:underline">
        Üye Ol →
      </span>
    </Link>
  );
}
