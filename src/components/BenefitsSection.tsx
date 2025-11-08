import { Card } from "@/components/ui/card";
import { Headphones, TrendingUp, Zap } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Headphones,
      title: "Expert Support",
      description: "24/7 dedicated support from crypto trading experts to help you maximize your investment potential.",
    },
    {
      icon: TrendingUp,
      title: "Proven Track Record",
      description: "Over 3 years of consistent profits with a 98.7% success rate trusted by thousands of investors.",
    },
    {
      icon: Zap,
      title: "Automated Trading",
      description: "Set it and forget it. Our bots work around the clock to capitalize on market opportunities.",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-feature flex items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
