import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlansSection from "@/components/PlansSection";
import ProfitCalculator from "@/components/ProfitCalculator";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <BenefitsSection />
        <StatsSection />
        <FeaturesSection />
        <PlansSection />
        <ProfitCalculator />
      </main>
      <ChatWidget />
    </div>
  );
};

export default Index;
