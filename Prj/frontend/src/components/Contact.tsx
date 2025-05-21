import { Mail } from "lucide-react";

export function Contact() {
    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Mail className="mx-auto h-10 w-10 text-forensic mb-4" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have a question or need support? Reach out to our dedicated team of forensic technology experts. We are here to help.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Email us at <a href="mailto:support@crimesleuth.ai" className="text-forensic underline">support@crimesleuth.ai</a>
          </p>
        </div>
      </div>
    );
  }