import { BadgeDollarSign, Coins, ShieldCheck } from "lucide-react";

interface PricingPlan {
  name: string;
  description: string;
  icon: React.ElementType;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic Plan",
    description:
      "Access core AI functionalities including image analysis and reporting. Ideal for small teams or individual investigators.",
    icon: BadgeDollarSign,
  },
  {
    name: "Pro Plan",
    description:
      "Includes everything in Basic, plus real-time evidence correlation and extended storage for case files.",
    icon: Coins,
  },
  {
    name: "Enterprise Plan",
    description:
      "Tailored solutions for law enforcement agencies with high-security standards, advanced analytics, and priority support.",
    icon: ShieldCheck,
  },
];

export function Pricing() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-forensic">Flexible Plans</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing built for every investigative team
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you're a solo investigator or a full-scale forensic agency, our plans scale with your needs.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-xl border bg-card p-6 shadow-sm">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <plan.icon className="h-5 w-5 flex-none text-forensic" aria-hidden="true" />
                  {plan.name}
                </dt>
                <dd className="mt-4 text-base leading-7 text-muted-foreground">
                  {plan.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
