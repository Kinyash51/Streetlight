import Hero from "@/components/Hero";
import FeaturedBook from "@/components/FeaturedBook";
import WhyStreetlight from "@/components/whyStreetlight";
import UniversePreview from "@/components/UniversePreview";
import CommunityCTA from "@/components/CommunityCTA";
import ReaderQuotes from "@/components/ReaderQuotes";
import NewsletterCapture from "@/components/NewsletterCapture";
import ScrollProgress from "@/components/ScrollProgress";
import ContinueReading from "@/components/ContinueReading";
import { getReaderChapters } from "@/lib/book-chapters";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <main>
        <ContinueReading chapters={getReaderChapters()} />
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
