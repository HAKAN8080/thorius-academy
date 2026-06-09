import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  HelpCircle,
  Heart,
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
import { getTutorDashboardUrl } from "@/lib/config/portal-urls";

export type PanelNavItem = {
  id: string;
  label: string;
  href?: string;
  externalHref?: string;
  icon: LucideIcon;
  requiresInstructor?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export const studentPanelNav: PanelNavItem[] = [
  { id: "dashboard", label: "Kontrol Paneli", href: "/panel", icon: LayoutDashboard },
  {
    id: "profile",
    label: "Profilim",
    externalHref: getTutorDashboardUrl(),
    icon: User,
    disabledReason: "Tutor hesap panelinde",
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
    disabledReason: "Tutor panelinde",
  },
  {
    id: "orders",
    label: "Order History",
    externalHref: getTutorDashboardUrl(),
    icon: ShoppingBag,
    disabledReason: "Tutor sipariş geçmişi",
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
    externalHref: getTutorDashboardUrl(),
    icon: Wallet,
    requiresInstructor: true,
    disabledReason: "Tutor kazanç paneli",
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
    externalHref: getTutorDashboardUrl(),
    icon: Settings,
    requiresInstructor: true,
    disabledReason: "Tutor ayarları",
  },
];

export function isPanelNavActive(pathname: string, href: string): boolean {
  if (href === "/panel") {
    return pathname === "/panel";
  }
  if (href === "/instructor/courses") {
    return (
      pathname === "/instructor/courses" ||
      pathname.startsWith("/instructor/courses/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
