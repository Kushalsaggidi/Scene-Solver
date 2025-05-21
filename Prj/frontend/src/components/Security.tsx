import { ShieldCheck, Lock, Eye } from "lucide-react";

interface SecurityFeature {
  name: string;
  description: string;
  icon: React.ElementType;
}

const securityFeatures: SecurityFeature[] = [
  {
    name: "End-to-End Encryption",
    description: "All data, including uploaded evidence and case information, is encrypted at rest and in transit.",
    icon: Lock,
  },
  {
    name: "Access Control",
    description: "Only authorized personnel can access case files, ensuring data integrity and confidentiality.",
    icon: Eye,
  },
  {
    name: "Compliance Standards",
    description: "Adheres to the latest digital forensic and cybersecurity regulations including GDPR and CJIS.",
    icon: ShieldCheck,
  },
];

export function Security() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-forensic">Security</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Built to protect your sensitive data
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our platform is designed with security as a core principle, keeping your investigations safe and confidential.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {securityFeatures.map((item) => (
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
