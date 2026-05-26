import Link from "next/link";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
} from "@/lib/config/portal-urls";
import { getInstructorAccess } from "@/lib/instructor/access";
import { getUserEnrollments } from "@/lib/actions/enrollment";

export async function PanelNavLinks() {
  const access = await getInstructorAccess();
  const enrollments = access.isInstructor ? await getUserEnrollments() : [];
  const hasStudentCourses = enrollments.length > 0;

  if (access.isInstructor) {
    return (
      <>
        <Link
          href={getInstructorPortalUrl()}
          className="text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          Eğitmen Paneli
        </Link>
        {hasStudentCourses ? (
          <Link
            href={getStudentPortalUrl()}
            className="text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Kayıtlı Kurslarım
          </Link>
        ) : null}
        <Link
          href="/"
          className="text-sm text-primary-600 hover:text-primary-900"
        >
          Siteye Dön
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={getStudentPortalUrl()}
        className="text-sm font-medium text-primary-700 hover:text-primary-900"
      >
        Kurslarım
      </Link>
      <Link
        href="/"
        className="text-sm text-primary-600 hover:text-primary-900"
      >
        Siteye Dön
      </Link>
    </>
  );
}
