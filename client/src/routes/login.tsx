// /login     Login page
import { createFileRoute, Link } from "@tanstack/react-router";
import kitchenImg from "@/assets/kitchen_backside.webp";
import { SharedButton } from "@/components/ui/CustomedButton";
import { loginTo42 } from "@/api/auth.api";
import logo from "@/assets/logo_upscaled.webp";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <nav className="absolute top-0 left-0 p-4 z-10 text-3xl text-white">
        <Link to="/" className="flex items-center gap-2 hover:text-[#FFDD03] transition-colors">
          <span>←</span>
          <img src={logo} alt="PlantBee Logo" className="w-8 h-8 object-contain" />
          <span>PlantBee</span>
        </Link>
      </nav>

      <div className="relative w-full md:w-1/2 md:h-screen md:sticky md:top-0">
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/50" />
        <img
          src={kitchenImg}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center max-h-screen px-8 py-16 md:py-0 bg-[#09431c] dark:bg-[#102216] text-slate-100">
        <h1 className="text-xl md:text-2xl font-bold mb-8 text-center">
          Log in to your <span className="text-[#A0D3DE]">42 account</span> to
          use <span className="text-[#FFDD03]">PlantBee</span> 🌻
        </h1>
        <SharedButton
          onClick={loginTo42}
          className="w-full max-w-sm border-white border bg-transparent hover:border-transparent hover:bg-[#FFDD03] hover:text-slate-900 transition-colors duration-300"
        >
          Log in with 42
        </SharedButton>
      </div>
    </div>
  );
}
