"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEmailRedirectUrl, safeNextPath } from "@/lib/auth/app-url";
import { provisionLinkedAccounts } from "@/lib/auth/provision-linked-accounts";
import {
  registerUser,
  resendSignupWelcomeEmail,
} from "@/lib/auth/register-user";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
  success?: boolean;
  successMessage?: string;
  registeredEmail?: string;
  couponCode?: string;
}

function getSafeRedirect(value: unknown): string {
  if (typeof value !== "string") {
    return "/panel";
  }
  return safeNextPath(value);
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const redirectTo = getSafeRedirect(formData.get("redirect"));

    if (typeof email !== "string" || typeof password !== "string") {
      return { error: "Geçerli e-posta ve parola girin." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "Giriş başarısız. Bilgilerinizi kontrol edin." };
    }

    revalidatePath("/", "layout");
    redirect(redirectTo);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: "Giriş sırasında beklenmeyen bir hata oluştu." };
  }
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
    const kvkk = formData.get("kvkk");
    const redirectTo = getSafeRedirect(formData.get("redirect"));

    if (typeof fullName !== "string" || !fullName.trim()) {
      return { error: "Ad soyad zorunludur." };
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return { error: "Geçerli e-posta ve parola girin." };
    }
    if (kvkk !== "on") {
      return { error: "KVKK metnini onaylamanız gerekmektedir." };
    }

    let registration: Awaited<ReturnType<typeof registerUser>>;
    try {
      registration = await registerUser({
        email,
        password,
        fullName: fullName.trim(),
        redirectTo,
      });
    } catch {
      return { error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." };
    }

    try {
      await provisionLinkedAccounts({
        email,
        fullName: fullName.trim(),
        password,
      });
    } catch (provisionError) {
      console.error("Linked account provision failed:", provisionError);
    }

    return {
      success: true,
      registeredEmail: email,
      couponCode: registration.couponCode,
      successMessage: registration.verificationEmailSent
        ? "Hesabınız oluşturuldu. Doğrulama linki ve %20 indirim kuponunuz tek e-postada gönderildi."
        : "Hesabınız oluşturuldu. Kupon kodunuz aşağıda; doğrulama e-postası için tekrar gönderi deneyin.",
    };
  } catch {
    return { error: "Kayıt sırasında beklenmeyen bir hata oluştu." };
  }
}

export async function resendVerificationEmail(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const email = formData.get("email");
    const redirectTo = getSafeRedirect(formData.get("redirect"));

    if (typeof email !== "string" || !email.trim()) {
      return { error: "E-posta adresi gerekli." };
    }

    try {
      const { couponCode } = await resendSignupWelcomeEmail(
        email.trim(),
        redirectTo,
      );

      return {
        success: true,
        registeredEmail: email.trim(),
        couponCode,
        successMessage:
          "Doğrulama linki ve %20 indirim kuponunuz tekrar gönderildi.",
      };
    } catch {
      return {
        error: "Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.",
      };
    }
  } catch {
    return { error: "E-posta gönderilirken beklenmeyen bir hata oluştu." };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/giris");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const email = formData.get("email");

    if (typeof email !== "string" || !email.trim()) {
      return { error: "E-posta adresi gerekli." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getEmailRedirectUrl(),
    });

    if (error) {
      return {
        error: "Parola sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.",
      };
    }

    return {
      success: true,
      registeredEmail: email.trim(),
      successMessage:
        "Parola sıfırlama bağlantısı e-posta adresinize gönderildi. Satın alma sonrası hesabınıza bu yolla giriş yapabilirsiniz.",
    };
  } catch {
    return { error: "Parola sıfırlama sırasında beklenmeyen bir hata oluştu." };
  }
}
