import React, { useEffect, useState } from "react";

const DocsInterface = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [previousReport, setPreviousReport] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const caseId = sessionStorage.getItem("caseId"); // Replace with actual case ID
    fetch(`http://localhost:7070/api/report/display?case_id=${caseId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch analysis data");
        }
        return res.json();
      })
      .then((data) => setAnalysisData(data))
      .catch((err) => console.error("Error fetching analysis data:", err));
  }, []);

  const fetchPreviousReport = () => {
    const caseId = sessionStorage.getItem("caseId");
    if (!caseId) {
      alert("No case selected!");
      return;
    }

    fetch(`http://localhost:7070/api/report/fetch?case_id=${caseId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // Show error message from backend if any
          setErrorMsg(data.error || data.message || "Failed to fetch report");
          setShowReport(false);
          setPreviousReport(null);
          return;
        }
        setPreviousReport(data.report);
        setShowReport(true);
        setErrorMsg(null);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Error fetching previous report");
        setShowReport(false);
        setPreviousReport(null);
      });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Case Analysis</h2>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={fetchPreviousReport}
      >
        Previous Reports
      </button>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      {showReport && previousReport && (
        <div className="mb-6 p-4 border rounded bg-gray-50 whitespace-pre-wrap max-h-96 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Saved Report:</h3>
          <p>{previousReport}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysisData.map((item, index) => (
          <div
            key={index}
            className="relative border p-3 rounded-lg shadow hover:shadow-md transition"
            onMouseEnter={() => setHoveredCardIndex(index)}
            onMouseLeave={() => setHoveredCardIndex(null)}
          >
            <img
              src={item.imageUrl}
              alt={`Crime evidence ${index}`}
              className="w-full h-48 object-cover rounded-md"
            />

            <div className="mt-3 text-sm">
              <p>
                <strong>Crime Type:</strong> {item.crimeType}
              </p>
              <p>
                <strong>Description:</strong> {item.description}
              </p>
              <p>
                <strong>Confidence:</strong> {item.confidence}%
              </p>
            </div>

            {hoveredCardIndex === index && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <img
                    src={item.imageUrl}
                    alt="Zoomed preview"
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <div className="text-sm">
                    <p>
                      <strong>Crime Type:</strong> {item.crimeType}
                    </p>
                    <p>
                      <strong>Description:</strong> {item.description}
                    </p>
                    <p>
                      <strong>Confidence:</strong> {item.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocsInterface;