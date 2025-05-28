import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Navbar3 } from "@/components/Navbar3";

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  case_type: string;
  date_of_incident?: string;
  last_updated: string;
  user_email: string;
  images?: string[];
}

export default function AdminDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
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

  const toggleImages = (caseId: string) => {
    setExpandedCaseId(prevId => (prevId === caseId ? null : caseId));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar3 />

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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleImages(c.id)}
                    className="mt-2"
                  >
                    {expandedCaseId === c.id ? "Hide Images" : "View Images"}
                  </Button>

                  {expandedCaseId === c.id && (
                    <div className="mt-4">
                      {c.images && c.images.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {c.images.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Case ${c.id} Image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded border"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No images so far.</p>
                      )}
                    </div>
                  )}
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
