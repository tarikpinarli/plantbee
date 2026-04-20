type IntroCardProps = {
  title: string;
  description: string;
  icon: string;
  alt: string;
};

export const IntroCard = ({
  title,
  description,
  icon,
  alt,
}: IntroCardProps) => (
  <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 shadow-lg shadow-primary/5 hover:shadow-primary/20 hover:border-primary/50 transition-colors group">
    <img
      src={icon}
      alt={alt}
      className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
    />

    <div className="flex flex-col gap-2 mt-4">
      <h4 className="text-xl font-bold leading-tight">{title}</h4>
      <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
        {description}
      </p>
    </div>
  </section>
);
