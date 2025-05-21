import { ShieldCheck } from "lucide-react";

export function Privacy() {
    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-forensic mb-4" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your privacy is our top priority. We ensure all forensic data and personal information are encrypted and protected with the highest standards.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            We never share your data without consent and comply with all data protection regulations.
          </p>
        </div>
      </div>
    );
  }