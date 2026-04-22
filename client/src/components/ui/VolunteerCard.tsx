import type { UserRole } from "@/types/user.types";
import { twMerge } from "tailwind-merge";

type VolunteerCardProps = {
  id: string;
  onClick: () => void;
  img: string;
  alt: string;
  status: UserRole;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export const VolunteerCard = ({
  id,
  onClick,
  img,
  alt,
  status,
  title,
  description,
  children,
}: VolunteerCardProps) => (
  <div
    id={id}
    onClick={onClick}
    className={twMerge(
      `relative flex items-center gap-3 flex-col p-8 rounded-2xl hover:bg-slate-50 dark:bg-slate-900 border-3 hover:shadow-2xl ring-3 ring-primary/10 hover:ring-green-300 group cursor-pointer hover:-translate-y-1 transition-all ${
        status === id
          ? "border-green-300 ring-green-400 ring-2 bg-white dark:bg-slate-900"
          : "border-slate-200 hover:border-green-300"
      }`,
    )}
  >
    {children}
    <img src={img} alt={alt} className="w-14 h-14" />
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-md text-slate-700 dark:text-slate-400 mb-8">
      {description}
    </p>
  </div>
);
