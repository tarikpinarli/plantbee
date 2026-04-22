export function getRankColor(index: number) {
  switch (index) {
    case 0:
      return "bg-yellow-400 text-white";
    case 1:
      return "bg-gray-400 text-white";
    case 2:
      return "bg-orange-300 text-white";
    default:
      return "bg-emerald-400 text-white";
  }
}