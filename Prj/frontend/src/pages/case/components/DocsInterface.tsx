import React, { useEffect, useState } from "react";

const DocsInterface = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useEffect(() => {
    const caseId = sessionStorage.getItem("caseId"); // Replace with actual case ID
    fetch(`http://localhost:5000/api/report/display?case_id=${caseId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch analysis data");
        }
        return res.json();
      })
      .then((data) => setAnalysisData(data))
      .catch((err) => console.error("Error fetching analysis data:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Case Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysisData.map((item, index) => (
          <div
            key={index}
            className="relative border p-3 rounded-lg shadow hover:shadow-md transition"
            onMouseEnter={() => setHoveredCardIndex(index)}
            onMouseLeave={() => setHoveredCardIndex(null)}
          >
            {/* Regular card view */}
            <img
              src={item.imageUrl}
              alt={`Crime evidence ${index}`}
              className="w-full h-48 object-cover rounded-md"
            />

            <div className="mt-3 text-sm">
              <p><strong>Crime Type:</strong> {item.crimeType}</p>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Confidence:</strong> {item.confidence}%</p>
            </div>

            {/* Full-screen preview of card */}
            {hoveredCardIndex === index && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <img
                    src={item.imageUrl}
                    alt="Zoomed preview"
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                  <div className="text-sm">
                    <p><strong>Crime Type:</strong> {item.crimeType}</p>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Confidence:</strong> {item.confidence}%</p>
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
