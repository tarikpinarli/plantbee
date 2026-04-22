import { Link } from "@tanstack/react-router";

export const NavLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <Link
      to={href}
      className="ml text-md font-medium text-slate-600 hover:text-green-500 dark:text-slate-400 dark:hover:text-[#13ec5b] transition"
      // activeProps={{
      //   className: "!text-[#09431c] font-semibold",
      // }}
    >
      {children}
    </Link>
  );
};
