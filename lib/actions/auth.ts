"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
  success?: string;
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Geçerli e-posta ve parola girin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Giriş başarısız. Bilgilerinizi kontrol edin." };
  }

  revalidatePath("/", "layout");
  redirect("/panel");
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");
  const kvkk = formData.get("kvkk");

  if (typeof fullName !== "string" || !fullName.trim()) {
    return { error: "Ad soyad zorunludur." };
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Geçerli e-posta ve parola girin." };
  }
  if (kvkk !== "on") {
    return { error: "KVKK metnini onaylamanız gerekmektedir." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.trim() },
    },
  });

  if (error) {
    return { error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." };
  }

  return {
    success:
      "Hesabınız oluşturuldu. E-posta doğrulama linkini kontrol edin.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/giris");
}
