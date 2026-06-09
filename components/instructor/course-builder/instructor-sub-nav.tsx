import Link from "next/link";

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
