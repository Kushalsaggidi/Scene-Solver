import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AnalysisToolsProps {
  caseId: string;
  setReportText: React.Dispatch<React.SetStateAction<string>>;
  setImageAnalysis: React.Dispatch<React.SetStateAction<any[]>>;
}

const AnalysisTools: React.FC<AnalysisToolsProps> = ({ caseId, setReportText, setImageAnalysis }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const onGenerateReport = async () => {
    if (!caseId) return;
    setReportText("");
    setImageAnalysis([]);
    setIsGenerating(true);

    try {
      const response = await fetch(`http://localhost:5000/api/report/generate?case_id=${caseId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data = await response.json();

      if (data.error) {
        setReportText("Error: " + data.error);
      } else {
        setReportText(data.report);
        setImageAnalysis(data.images); // Set image analysis data here
      }
    } catch (error) {
      setReportText("Error generating report.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Tools</h3>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            size="sm"
            onClick={onGenerateReport}
            disabled={isGenerating}
          >
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {isGenerating ? "Generating..." : "Evidence Report"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTools;
