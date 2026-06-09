"use client";

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
