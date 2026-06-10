import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useSeoHead } from "@/hooks/use-seo-head";
import { PricingSection } from "@/components/landing/pricing-section";
import {
  Nav,
  HeroSection,
  TrustBar,
  ResourcesTeaser,
  FeaturesSection,
  TestimonialsSection,
  FinalCtaSection,
  LandingFooter,
} from "./landing-sections";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  useSeoHead({
    title:
      "Tokō — App TDAH enfant pour parents épuisés | Routines, suivi, plan de crise",
    description:
      "Tokō aide les parents TDAH à gérer le quotidien de leurs enfants TDAH. Routines simplifiées, suivi des symptômes, plan de crise, récompenses. Sans charge mentale.",
    canonical: "https://toko.battistella.ovh/",
  });

  return (
    <div className="min-h-dvh bg-background">
      <Nav />
      <HeroSection />
      <TrustBar />
      <ResourcesTeaser />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
