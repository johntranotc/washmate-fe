import { Hero } from "@/components/home/hero";
import { WhyWashMate } from "@/components/home/why-washmate";
import { FeaturedServices } from "@/components/home/featured-services";
import { ProcessSteps } from "@/components/home/process-steps";
import { PricingSummary } from "@/components/home/pricing-summary";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyWashMate />
      <FeaturedServices />
      <ProcessSteps />
      <PricingSummary />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
