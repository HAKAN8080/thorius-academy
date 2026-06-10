import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  HelpCircle,
  Heart,
  Home,
  LayoutDashboard,
  Map,
  Megaphone,
  MessageSquare,
  Settings,
  ShoppingBag,
  Star,
  User,
  Wallet,
} from "lucide-react";

export type PanelNavItem = {
  id: string;
  label: string;
  href?: string;
  externalHref?: string;
  icon: LucideIcon;
  requiresInstructor?: boolean;
  hideForInstructor?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export const studentPanelNav: PanelNavItem[] = [
  { id: "home", label: "Ana Site", href: "/", icon: Home },
  { id: "dashboard", label: "Kontrol Paneli", href: "/panel", icon: LayoutDashboard },
  {
    id: "profile",
    label: "Profilim",
    href: "/panel/profil",
    icon: User,
  },
  {
    id: "enrolled",
    label: "Kurslarım",
    href: "/panel/kurslarim",
    icon: BookOpen,
  },
  {
    id: "career",
    label: "Kariyer Yolum",
    href: "/panel/kariyer-yolu",
    icon: Map,
  },
  {
    id: "orders",
    label: "Sipariş Geçmişi",
    href: "/panel/siparisler",
    icon: ShoppingBag,
  },
  {
    id: "instructor-apply",
    label: "Eğitmen Ol",
    href: "/panel/egitmen-basvuru",
    icon: GraduationCap,
    hideForInstructor: true,
  },
  {
    id: "reviews-student",
    label: "Yorumlar",
    disabled: true,
    icon: MessageSquare,
    disabledReason: "Yakında",
  },
  {
    id: "wishlist",
    label: "İstek Listesi",
    disabled: true,
    icon: Heart,
    disabledReason: "Yakında",
  },
  {
    id: "qa",
    label: "Soru ve Cevap",
    disabled: true,
    icon: HelpCircle,
    disabledReason: "Yakında",
  },
  {
    id: "calendar",
    label: "Takvim",
    disabled: true,
    icon: Calendar,
    disabledReason: "Yakında",
  },
];

export const instructorPanelNav: PanelNavItem[] = [
  {
    id: "instructor-dashboard",
    label: "Eğitmen Özeti",
    href: "/instructor/dashboard",
    icon: BarChart3,
    requiresInstructor: true,
  },
  {
    id: "instructor-courses",
    label: "Kurs Yönetimi",
    href: "/instructor/courses",
    icon: BookOpen,
    requiresInstructor: true,
  },
  {
    id: "announcements",
    label: "Duyurular",
    disabled: true,
    icon: Megaphone,
    requiresInstructor: true,
    disabledReason: "Yakında",
  },
  {
    id: "withdraw",
    label: "Para Çekme",
    disabled: true,
    icon: Wallet,
    requiresInstructor: true,
    disabledReason: "Yakında",
  },
  {
    id: "instructor-reviews",
    label: "Kurs Yorumları",
    href: "/panel/egitmen",
    icon: Star,
    requiresInstructor: true,
  },
  {
    id: "instructor-settings",
    label: "Ayarlar",
    href: "/panel/profil",
    icon: Settings,
    requiresInstructor: true,
  },
];

export function isPanelNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/panel") {
    return pathname === "/panel";
  }
  if (href === "/instructor/courses") {
    return (
      pathname === "/instructor/courses" ||
      pathname.startsWith("/instructor/courses/")
    );
  }
  if (href === "/panel/profil") {
    return pathname === "/panel/profil";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
