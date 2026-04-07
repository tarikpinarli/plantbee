// / welcome page
import { createFileRoute } from "@tanstack/react-router";
import mainImg from "../assets/hive_clusture.webp";

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
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/50 rounded-[30px]" />
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
          <button className="bg-transparent rounded-full text-white border-2 border-white px-6 py-3 mt-8 text-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors">
            Login with 42
          </button>
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
        <h1 className="text-3xl md:text-4xl font-black leading-tight max-w-260">Grow somethihng great together! 🌱🐝</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-180">
          Welcome to PlantBee, a community-driven smart plant monitoring system
          that ensures our campus plants thrive through collective care. We turn
          sensor data into real-world action.
        </p>
        
           <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 shadow-lg shadow-primary/5 hover:border-primary/50 transition-colors group">
          
          <div className="flex flex-col gap-2 mt-4">
           <h2 className="text-xl font-bold leading-tight">
            The human heartbeat
          </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
               Volunteering is the heartbeat of our system. While sensors tell us
            when a plant is thirsty, it's the community members who provide the
            care that makes the difference. When a plant needs attention,
            volunteers receive notifications and step in to water, prune, or
            simply check on the plant's health. This human touch ensures that
            our plants not only survive but thrive, fostering a strong sense of
            community and shared responsibility for our green spaces.
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

          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-[720px]">
            Combining smart IoT technology with community effort to ensure
            optimal plant health across our campus. 🐝
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 shadow-lg shadow-primary/5 hover:border-primary/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[32px]">
                sensors
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <h4 className="text-xl font-bold leading-tight">
                Smart Monitoring
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
                Utilizing advanced ESP32 IoT sensors for real-time plant health
                data, tracking moisture, light, and temperature.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 shadow-lg shadow-primary/5 hover:border-primary/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[32px]">
                group
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <h4 className="text-xl font-bold leading-tight">
                Volunteer Care
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
                A collaborative effort where notified volunteers step in when
                plants need care, fostering a strong community bond.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-background-light dark:bg-background-dark/50 p-8 shadow-lg shadow-primary/5 hover:border-primary/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined text-[32px]">
                water_drop
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <h4 className="text-xl font-bold leading-tight">
                Automated Tasks
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
                Exact water calculations and automated tracking for every leaf,
                ensuring precise hydration without the guesswork.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
