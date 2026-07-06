import { Hero } from "@/components/home/hero";
import { WhyWashMate } from "@/components/home/why-washmate";
import { AudienceSection } from "@/components/home/audience-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { ProcessSteps } from "@/components/home/process-steps";
import { PricingSummary } from "@/components/home/pricing-summary";
import { TierSummary } from "@/components/home/tier-summary";
import { SmartInsight } from "@/components/home/smart-insight";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyWashMate />
      <AudienceSection />
      <FeaturedServices />
      <ProcessSteps />
      <PricingSummary />
      <TierSummary />
      <SmartInsight />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
