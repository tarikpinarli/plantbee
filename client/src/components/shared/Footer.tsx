import { useTranslation } from "react-i18next";
import { NavLink } from "../ui/NavLink";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-primary/20 px-5 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">PlantBee</span>
      </div>
      <p className="text-slate-500 text-sm font-medium text-center md:text-left">
        {t("footer.copyright")}
      </p>
      <div className="flex gap-6">
        <NavLink href="/privacy">{t("privacy.title")}</NavLink>
        <NavLink href="/terms">{t("terms.title")}</NavLink>
      </div>
    </footer>
  );
};
