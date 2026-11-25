import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import About from "./About";
import Contact from "./Contact";

export default function InfoPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <About />
      <Contact />
    </div>
  );
}
