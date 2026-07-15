import { Hero } from "@/components/home/hero";
import { WhyWashMate } from "@/components/home/why-washmate";
import { FeaturedServices } from "@/components/home/featured-services";
import { ProcessSteps } from "@/components/home/process-steps";
import { PricingSummary } from "@/components/home/pricing-summary";
import { MembershipTiers } from "@/components/home/membership-tiers";
import { SmartInsight } from "@/components/home/smart-insight";
import { CtaBanner } from "@/components/home/cta-banner";
import { Reveal } from "@/components/home/reveal";

export default function HomePage() {
  return (
    <>
      {/* Hero giữ hiệu ứng vào trang riêng (wm-hero-rise) + Ken Burns cho ảnh nền */}
      <Hero />

      {/* Các section dưới hero: mờ dần + trồi lên khi cuộn tới */}
      <Reveal><WhyWashMate /></Reveal>
      <Reveal><FeaturedServices /></Reveal>
      <Reveal><ProcessSteps /></Reveal>
      <Reveal><PricingSummary /></Reveal>
      <Reveal><MembershipTiers /></Reveal>
      <Reveal><SmartInsight /></Reveal>
      <Reveal><CtaBanner /></Reveal>
    </>
  );
}
