import { Scale } from "lucide-react";

export function Terms() {
    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Scale className="mx-auto h-10 w-10 text-forensic mb-4" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            By using CrimeSleuth AI, you agree to our terms which include responsible usage, data confidentiality, and adherence to applicable forensic laws.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Please review our complete terms before continuing to use the platform.
          </p>
        </div>
      </div>
    );
  }
  