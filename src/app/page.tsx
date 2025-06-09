import { AppBar } from "../../components/AppBar";
import { Hero } from "../../components/Hero";
import { HeroVideo } from "../../components/heroVideo";

export default function Home() {
  return (
    <main className="pb-48">
      <AppBar />
      <Hero />

      <div className="pt-8">{<HeroVideo />}</div>
    </main>
  );
}
