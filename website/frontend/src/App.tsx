import { useEffect, useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { InferencePage } from "./pages/InferencePage";
import { ResultsPage } from "./pages/ResultsPage";

type Route = "inference" | "results";

const routeFromPath = (): Route => (window.location.pathname.startsWith("/results") ? "results" : "inference");

export function App() {
  const [route, setRoute] = useState<Route>(routeFromPath);

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (next: Route) => {
    window.history.pushState({}, "", next === "results" ? "/results" : "/inference");
    setRoute(next);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Activity size={22} /></div>
          <div>
            <strong>MRI-DWI Stroke AI</strong>
            <span>Research prototype</span>
          </div>
        </div>
        <nav className="nav-tabs" aria-label="Ana navigasyon">
          <button className={clsx(route === "inference" && "active")} onClick={() => navigate("inference")}>
            <Activity size={18} /> Inference
          </button>
          <button className={clsx(route === "results" && "active")} onClick={() => navigate("results")}>
            <BarChart3 size={18} /> Deneyler & Sonuclar
          </button>
        </nav>
      </header>
      <main>
        <section className="prototype-banner">
          Bu sistem bitirme projesi icin hazirlanmis bir arastirma prototipidir. Sonuclar model confidence degeridir; klinik tani yerine gecmez.
        </section>
        {route === "inference" ? <InferencePage /> : <ResultsPage />}
      </main>
    </div>
  );
}
