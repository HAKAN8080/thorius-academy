"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { createInstructorCourseAndRedirect } from "@/lib/actions/instructor-courses";
import { Button } from "@/components/ui/button";

function SubmitButton({ className = "" }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90 ${className}`}
    >
      <Plus className="mr-2 h-4 w-4" />
      {pending ? "Oluşturuluyor..." : "Yeni Kurs"}
    </Button>
  );
}

export function NewCourseButton({ className = "" }: { className?: string }) {
  return (
    <form action={createInstructorCourseAndRedirect}>
      <SubmitButton className={className} />
    </form>
  );
}
