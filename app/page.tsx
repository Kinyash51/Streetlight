import Hero from "@/components/Hero";
import FeaturedBook from "@/components/FeaturedBook";
import WhyStreetlight from "@/components/whyStreetlight";
import UniversePreview from "@/components/UniversePreview";
import CommunityCTA from "@/components/CommunityCTA";
import ReaderQuotes from "@/components/ReaderQuotes";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedBook />
      <WhyStreetlight />
      <ReaderQuotes />
      <UniversePreview />
      <CommunityCTA />
    </main>
  );
}
