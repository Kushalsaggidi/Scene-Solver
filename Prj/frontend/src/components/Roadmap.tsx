import { Map, Target, Rocket, TrendingUp, Mail, ShieldCheck, Scale } from "lucide-react";

const roadmap = [
  {
    name: 'Short-Term Goals',
    description:
      'Implement real-time evidence matching, enhance user dashboard, and refine AI case suggestions.',
    icon: Target,
  },
  {
    name: 'Mid-Term Goals',
    description:
      'Integrate cross-jurisdictional data sources and improve report export tools.',
    icon: Map,
  },
  {
    name: 'Long-Term Vision',
    description:
      'Establish CrimeSleuth as a leading forensic platform through scalable cloud AI and real-time collaboration tools.',
    icon: Rocket,
  },
  {
    name: 'Continuous Innovation',
    description:
      'Dedicated to R&D in forensic AI to ensure our tools remain state-of-the-art.',
    icon: TrendingUp,
  },
];

export function Roadmap() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-forensic">Our Journey</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            The path to revolutionizing forensics
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our roadmap outlines strategic milestones as we evolve to become a premier tool for forensic investigations.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2">
            {roadmap.map((item) => (
              <div key={item.name} className="rounded-xl border bg-card p-6 shadow-sm">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <item.icon className="h-5 w-5 flex-none text-forensic" aria-hidden="true" />
                  {item.name}
                </dt>
                <dd className="mt-4 text-base leading-7 text-muted-foreground">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
