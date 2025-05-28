import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AdminAbout() {
  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1 container py-10 px-4 md:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">About Scene Solver</h1>

        <section className="max-w-3xl mx-auto text-lg leading-7 text-gray-700 space-y-6">
          <p>
            <strong>Scene Solver</strong> is a cutting-edge forensic investigation platform designed to assist law enforcement agencies in solving criminal cases more efficiently. By integrating modern technologies such as <strong>AI-based object detection</strong>, <strong>CLIP model-based scene analysis</strong>, and <strong>smart evidence processing</strong>, Scene Solver transforms traditional investigation workflows.
          </p>

          <p>
            Our platform allows investigators to upload images or videos from crime scenes, extract crucial evidence using advanced models like <strong>YOLOv8</strong>, and generate intelligent summaries with the help of <strong>Google Gemini</strong> and <strong>CLIP-ViT</strong>. The system also supports dynamic case tracking, user authentication, and role-based dashboards for both admins and investigators.
          </p>

          <p>
            Built using <strong>React</strong>, <strong>FastAPI</strong>/<strong>Flask</strong>, <strong>MongoDB</strong>, and enhanced with technologies like <strong>Framer Motion</strong> and <strong>Three.js</strong>, Scene Solver provides a seamless, secure, and intuitive experience to solve real-world cases faster and more accurately.
          </p>

          <p className="text-sm text-muted-foreground">
            Developed by Kushal Saggidi and team | 2025
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
