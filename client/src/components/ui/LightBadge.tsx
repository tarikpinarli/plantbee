type LightLevel = "Low" | "Medium" | "High"

const getLightStyle = (level: LightLevel) => {
  switch (level) {
    case "Low":
      return {
        color: "text-black",
        icon: "🌙",
      }
    case "Medium":
      return {
        color: "text-black",
        icon: "⛅",
      }
    case "High":
      return {
        color: "text-black",
        icon: "☀️",
      }
    default:
      return {
        color: "text-black",
        icon: "🌱",
      }
  }
}

export function LightBadge({ level }: { level?: string }) {
  if (!level) return null

  const style = getLightStyle(level as LightLevel)

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 ${style.color}`}
    >
      <span className="text-[12px]">{style.icon}</span>
      {level} Light
    </div>
  )
}