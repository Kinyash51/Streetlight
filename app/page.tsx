import Hero from "@/components/Hero";
import FeaturedBook from "@/components/FeaturedBook";
import WhyStreetlight from "@/components/whyStreetlight";
import UniversePreview from "@/components/UniversePreview";
import CommunityCTA from "@/components/CommunityCTA";
import ReaderQuotes from "@/components/ReaderQuotes";
import NewsletterCapture from "@/components/NewsletterCapture";
import ScrollProgress from "@/components/ScrollProgress";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <main>
        <Hero />
        <FeaturedBook />
        <WhyStreetlight />
        <ReaderQuotes />
        <UniversePreview />
        <CommunityCTA />
      </main>
      <NewsletterCapture />
    </>
  );
}
