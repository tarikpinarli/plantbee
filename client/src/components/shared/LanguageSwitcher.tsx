import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type LangCode } from "@/i18n";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = (SUPPORTED_LANGS.find((l) => l.code === i18n.language)?.code ?? "en") as LangCode;

  return (
    <label
      className={`flex items-center gap-1.5 text-[#09431c] dark:text-slate-100 ${className ?? ""}`}
      aria-label={t("language.label")}
    >
      <Globe size={18} aria-hidden="true" />
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-transparent border border-[#09431c]/30 rounded-md px-1.5 py-0.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {SUPPORTED_LANGS.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
