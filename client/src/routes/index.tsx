// / welcome page
import { createFileRoute } from "@tanstack/react-router";
import mainImg from "../assets/hive_clusture.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <section
      className="p-2"
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
      <h1>PlantBee</h1>
      <h2>Cultivating a greener Hive Helsinki, one leaf at a time</h2>
      <p>
        Empowering volunteers with ESP32 sensors to keep our plants thriving
        though precise, collaborative care. Join the smart plant revolution!
      </p>
    </section>
  );
}
