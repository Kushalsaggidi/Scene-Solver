import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  case_type: string;
  date: string;
  last_updated: string;
  user_email: string;
}

export default function AdminDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "Unknown date";
    return format(new Date(isoDate), "PPP");
  };

  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cases/all-cases", {
          headers: {
            "x-auth-token": sessionStorage.getItem("authToken") || "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch cases");

        const data = await response.json();
        setCases(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load admin cases",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllCases();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard - All Cases</h1>

        {loading ? (
          <p>Loading cases...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <Card key={c.id} className="h-full">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{c.title}</span>
                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                      {c.status}
                    </span>
                  </CardTitle>
                  <CardDescription>{c.case_type}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{c.description || "No description provided"}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Officer:</strong> {c.user_email}
                  </div>
                  <div className="mb-2">
                    <strong>Case Type:</strong> {c.case_type || "Unknown"}
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground justify-end">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {formatDate(c.last_updated)}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
