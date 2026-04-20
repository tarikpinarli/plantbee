// / welcome page
import { createFileRoute, Link } from "@tanstack/react-router";
import mainImg from "../assets/hive_clusture.webp";
import { SharedButton } from "@/components/ui/CustomedButton";
import sensor from "@/assets/sensor.svg";
import team from "@/assets/team.svg";
import waterDrop from "@/assets/water_drop.svg";
import { IntroCard } from "@/components/ui/IntroCard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <section
        className="relative p-2 mt-15"
        style={{
          backgroundImage: `url(${mainImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          aspectRatio: "16/9",
          borderRadius: "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/60 rounded-[30px]" />
        <div className="relative z-10 flex flex-col items-center text-center text-white pt-30 px-8">
          <h1 className="text-white text-9xl md:text-9xl lg:text-9xl font-black leading-tight drop-shadow-lg tracking-widest">
            PlantBee
          </h1>
          <h2 className="text-4xl mt-4 tracking-wide font-semibold">
            Cultivating a greener Hive Helsinki, one leaf at a time
          </h2>
          <p className="mt-2 max-w-xl text-xl opacity-90">
            Empowering volunteers with ESP32 sensors to keep our plants thriving
            though precise, collaborative care. Join the smart plant revolution!
          </p>
          <SharedButton className="max-w-full mt-6 font-extrabold border-white border-2 bg-transparent hover:border-transparent hover:bg-[#FFDD03] hover:text-slate-900 transition-colors:duration-300">
            <Link to="/garden" >
              Meet our green friends! 🌿
            </Link>
          </SharedButton>
        </div>
      </section>
      <section
        style={{
          backgroundColor: "#ffdd03",
          borderRadius: "0 0 50% 50%", // bottom half ellipse
          // or for the arch shape in the screenshot:
          // borderRadius: '50% 50% 0% 0%',
          width: "100%",
          padding: "80px 40px 120px",
        }}
        className="flex flex-col gap-10 px-4 py-16 @container mt-30"
        id="intro"
      >
        <div className="flex flex-col items-center gap-4 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black leading-tight max-w-260">
            Grow somethihng great together! 🌱🐝
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-180">
            Welcome to PlantBee, a community-driven smart plant monitoring
            system that ensures our campus plants thrive through collective
            care. We turn sensor data into real-world action.
          </p>

          <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 pt-4 shadow-lg shadow-primary/5 hover:border-primary/50 transition-colors group">
            <div className="flex flex-col gap-2 mt-4">
              <h2 className="text-xl font-bold leading-tight">
                The human heartbeat
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed max-w-180">
                Volunteering is the heartbeat of our system. While sensors tell
                us when a plant is thirsty, it's the community members who
                provide the care that makes the difference. When a plant needs
                attention, volunteers receive notifications and step in to
                water, prune, or simply check on the plant's health. This human
                touch ensures that our plants not only survive but thrive,
                fostering a strong sense of community and shared responsibility
                for our green spaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          backgroundColor: "#9FE19E",
          // borderRadius: '0 0 50% 50% / 0 0 100% 100%',  // bottom half ellipse
          // or for the arch shape in the screenshot:
          borderRadius: "50% 50% 0% 0%",
          width: "100%",
          padding: "80px 40px 120px",
        }}
        className="flex flex-col gap-10 px-4 py-16 @container mt-30"
        id="mission"
      >
        <div className="flex flex-col items-center gap-4 text-center md:text-left">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase">
            Our mission
          </h2>
          <h3 className="text-3xl md:text-4xl font-black leading-tight max-w-180">
            How PlantBee works
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-180">
            Combining smart IoT technology with community effort to ensure
            optimal plant health across our campus. 🐝
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IntroCard
            icon={sensor}
            alt="sensor icon"
            title="Smart Monitoring"
            description="Utilizing advanced ESP32 IoT sensors for real-time plant health
                data, tracking moisture, light, and temperature."
          />
          <IntroCard
            icon={team}
            alt="team icon"
            title="Volunteer Care"
            description="A collaborative effort where notified volunteers step in when
                plants need care, fostering a strong community bond."
          />
          <IntroCard
            icon={waterDrop}
            alt="water drop icon"
            title="Automated Tasks"
            description="Exact water calculations and automated tracking for every leaf,
                ensuring precise hydration without the guesswork."
          />
        </div>
      </div>
    </>
  );
}
