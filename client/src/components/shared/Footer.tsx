export const Footer = () => {
  return (
    <footer className="border-t border-primary/20 px-5 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[24px]">
          eco
        </span>
        <span className="font-bold text-lg">PlantBee</span>
      </div>
      <p className="text-slate-500 text-sm font-medium text-center md:text-left">
        ©2026 PlantBee. A community-driven smart plant monitoring system built
        for Hive Helsinki.
      </p>
    </footer>
  );
};
