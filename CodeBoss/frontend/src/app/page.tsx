import Navbar from "@/components/NavBar";
import ImageSection from "@/components/ImageSection";
import Features from "@/components/Features";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="scroll-snap-container">
      <section className="scroll-snap-section">
        <Navbar />
      </section>
      <section className="scroll-snap-section">
        <ImageSection />
      </section>
      <section className="scroll-snap-section">
        <Features />
      </section>
      <section className="scroll-snap-section">
        <About />
      </section>
      <section className="scroll-snap-section">
        <FAQ />
        <Footer />
      </section>
    </div>
  );
}
