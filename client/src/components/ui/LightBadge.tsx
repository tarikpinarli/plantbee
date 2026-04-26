import { useTranslation } from "react-i18next"

type LightLevel = "Low" | "Medium" | "High"

const getLightStyle = (level: LightLevel) => {
  switch (level) {
    case "Low":
      return {
        color: "bg-white text-black",
        icon: "🌙",
      }
    case "Medium":
      return {
        color: "bg-white text-black",
        icon: "⛅",
      }
    case "High":
      return {
        color: "bg-white text-black",
        icon: "☀️",
      }
    default:
      return {
        color: "bg-white text-black",
        icon: "🌱",
      }
  }
}

const lightLabelKey = (level: LightLevel) => {
  switch (level) {
    case "Low":
      return "lightBadge.lowLight"
    case "Medium":
      return "lightBadge.mediumLight"
    case "High":
      return "lightBadge.highLight"
  }
}

export function LightBadge({ level }: { level?: string }) {
  const { t } = useTranslation();
  if (!level) return null

  const lightLevel = level as LightLevel
  const style = getLightStyle(lightLevel)
  const labelKey = lightLabelKey(lightLevel)

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 ${style.color}`}
    >
      <span className="text-[12px]">{style.icon}</span>
      {labelKey ? t(labelKey) : level}
    </div>
  )
}
