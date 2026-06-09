import Link from "next/link";
import { Plus } from "lucide-react";
import { createInstructorCourseAndRedirect } from "@/lib/actions/instructor-courses";
import { Button } from "@/components/ui/button";

export function NewCourseButton({ className = "" }: { className?: string }) {
  return (
    <form action={createInstructorCourseAndRedirect}>
      <Button
        type="submit"
        className={`bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90 ${className}`}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Course
      </Button>
    </form>
  );
}

export function InstructorSubNav() {
  const links = [
    { href: "/instructor/dashboard", label: "Dashboard" },
    { href: "/instructor/courses", label: "Kurslarım" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium text-[#0B1E3F] hover:border-[#D4AF37]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
