import { AppBar } from "../../components/AppBar";
import { Hero } from "../../components/Hero";
import { HeroVideo } from "../../components/heroVideo";
import ClientRedirect from "../../utils/ClientRedirect";

export default function Home() {
  return (
    <main className="pb-48">
      <ClientRedirect />
      <AppBar />
      <Hero />

      <div className="pt-8">{<HeroVideo />}</div>
    </main>
  );
}
