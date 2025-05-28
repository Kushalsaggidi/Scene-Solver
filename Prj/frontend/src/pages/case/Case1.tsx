import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Settings,
  MessageSquare,
  Microscope,
  Image,
  Search,
  FileText,
} from "lucide-react";
import DocsInterface from "./components/DocsInterface";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatInterface } from "@/components/ChatInterface";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ImageUpload } from "./components/ImageUpload";
import { ImageGallery } from "./components/ImageGallery";
import { ResultsDisplay } from "./components/ResultsDisplay";
import AnalysisTools from "./components/AnalysisTools";
import { useCaseManagement } from "./hooks/useCaseManagement";
import { useToast } from "@/components/ui/use-toast";
import { jwtDecode } from "jwt-decode";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu";



export default function Case1() {
  const { caseId } = useParams();

  const [caseName, setCaseName] = useState(`Case #${caseId?.replace("case-", "")}`);
const [activeTab, setActiveTab] = useState<"sources" | "chat" | "studio" | "docs">("studio");
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast(); // Move this inside the component function
  // Add a new state for object detection loading
  const [isDetectingObjects, setIsDetectingObjects] = useState(false);

  // Add a new state to track whether to show the annotated image
  const [showAnnotatedImage, setShowAnnotatedImage] = useState(true);

  // Add a state to store annotated images for each uploaded image
  const [annotatedImages, setAnnotatedImages] = useState<Record<string, string>>({});
  const [BgColor,setBgColor]=useState("bg-white");
// Dropdown menu is already imported above — just need to define the JSX logic to render later in the return
  
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Inside your parent component (e.g., StudioPanel.tsx or MainDashboard.tsx)
  const [reportText, setReportText] = useState("");

  // Get the user ID from sessionStorage when component mounts
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userid") || localStorage.getItem("user");
    setUserId(storedUserId);
  }, []);

  const {
    uploadedImages,
    selectedImage,
    isAnalyzing,
    isProcessing,
    analysisResults,
    caseReport,
    enhancedImage,
    analyzedImages,
    objectDetectionResults,
    setSelectedImage,
    handleFileUpload,
    handleDeleteImage,
    analyzeEvidence,
    fetchCaseReport,
    handleImageEnhancement,
    detectObjects,
  } = useCaseManagement(caseId); // Pass caseId to the hook

  // Function to handle back button click
  const handleBackClick = () => {
    if (userId) {
      navigate(`/dashboard/${userId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleDownloadReport = () => {
    if (!caseReport) return;
    
    const blob = new Blob([caseReport], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-report-${caseId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  function handlePatternRecognition(): void {
    throw new Error("Function not implemented.");
  }
  

  // Inside the component, add a console log to debug
  useEffect(() => {
    console.log("Selected image:", selectedImage);
    console.log("Uploaded images:", uploadedImages);
  }, [selectedImage, uploadedImages]);
  sessionStorage.setItem("caseId", caseId);
  // Update the detectObjects function to store the annotated image
  useEffect(() => {
    if (objectDetectionResults && 
        objectDetectionResults.results && 
        objectDetectionResults.results.length > 0 &&
        objectDetectionResults.results[0].detected_objects &&
        objectDetectionResults.results[0].detected_objects.annotated_image &&
        selectedImage) {
      // Store the annotated image for this selected image
      setAnnotatedImages(prev => ({
        ...prev,
        [selectedImage]: objectDetectionResults.results[0].detected_objects.annotated_image
      }));
    }
  }, [objectDetectionResults, selectedImage]);
const getInitials = (fullName) => {
  return  fullName.trim()[0].toUpperCase();
};
;

  const navigate = useNavigate();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/");
      return;
    }

    const userId = decoded.user_id;
    if (!userId) {
      console.error("Token missing user_id");
      navigate("/");
      return;
    }

    async function fetchUserProfile() {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/dashboard/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        const email = data.email || "";
        const username = email.split("@")[0].replace(".", " ");
        const initials = getInitials(username);
        setInitials(initials);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setInitials("U"); // fallback initial
      }
    }

    fetchUserProfile();
  }, [navigate])

  const sendInvitation = async () => {

    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    console.log("Sending invitation email to:", email);

    try {
      const res = await fetch("http://localhost:5000/api/invitation/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${sessionStorage.getItem("authToken")}` // Uncomment if needed
        },
        body: JSON.stringify({
          email
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${email}`,
        });
        setEmail("");
        setCustomMessage("");
      } else {
        toast({
          title: "Failed to Send",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the invitation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex flex-col h-screen ${BgColor}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBackClick}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">{caseName}</h1>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => {
              const newName = prompt("Enter new case name:", caseName);
              if (newName) setCaseName(newName);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Share className="w-4 h-4 mr-2" />
      Share
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Share this case</DialogTitle>
      <DialogDescription>
        Invite others to collaborate on this forensic investigation.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Input
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Optional message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
        />
        <Button size="sm" className="w-full" onClick={sendInvitation}>
          Send invitation
        </Button>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium mb-2">Share link</p>
        <div className="flex items-center gap-2">
          <Input value={window.location.href} readOnly />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Background</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setBgColor("bg-white")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-gray-900 text-white")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-blue-50")}>
                                Soft Blue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-yellow-50")}>
                                Cream
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>


          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            title="User Profile"
            aria-label="Open User Profile"
          >
            {initials}
          </Link>

        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sources Panel - Left Side */}
        <div className={`w-full md:w-80 border-r overflow-y-auto flex flex-col ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Evidence Images</h2>
          </div>
          
          <ImageUpload onUpload={handleFileUpload} />
          <ImageGallery
            images={uploadedImages}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onDeleteImage={handleDeleteImage}
          />
          
          {/* Add Analyze Evidence button below the images */}
          {uploadedImages.length > 0 && (
            <div className="p-4 border-t mt-auto">
              <Button 
                className="w-full" 
                onClick={analyzeEvidence}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Microscope className="h-4 w-4 mr-2" />
                    Analyze Evidence
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Generated Content - Middle */}
        <div className={`flex-1 flex flex-col ${["studio", "chat", "docs"].includes(activeTab) ? "block" : "hidden"}`}>
          {/* Tab Navigation */}
           <div className="flex justify-between items-center p-4 border-b">
    <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as "studio" | "chat" | "docs")}>
      <TabsList className="grid w-full max-w-sm grid-cols-3">
        <TabsTrigger value="studio" className="flex items-center gap-2">
          <Microscope className="w-4 h-4" />
          Studio
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="docs" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Docs
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>

          {/* Studio Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-card/40 w-full h-full overflow-y-auto relative">
            <div className="w-full max-w-4xl">
              {activeTab === "studio" ? (
                <div className="space-y-6">
                  {/* Display selected image at the top of the studio tab */}
                  {selectedImage && (
                    <div className="border rounded-lg overflow-hidden">
                      <div style={{ 
                        height: "250px",
                        width: "110%", 
                        backgroundImage: `url(${
                          // Show annotated image if available for this specific image AND showAnnotatedImage is true
                          showAnnotatedImage && annotatedImages[selectedImage]
                            ? annotatedImages[selectedImage]
                            : selectedImage
                        })`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "contain",
                        backgroundColor: "rgba(0, 0, 0, 0.03)"
                      }}>
                      </div>
                      <div className="p-3 bg-muted/20 border-t flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {showAnnotatedImage && annotatedImages[selectedImage]
                            ? "Annotated Evidence Image" 
                            : "Selected Evidence Image"}
                        </p>
                        <div className="flex gap-2">
                          {/* Only show toggle buttons if we have an annotated version of this image */}
                          {annotatedImages[selectedImage] && (
                            <>
                              <Button 
                                size="sm"
                                variant={showAnnotatedImage ? "default" : "outline"}
                                onClick={() => setShowAnnotatedImage(true)}
                              >
                                <Search className="h-3 w-3 mr-2" />
                                Annotated
                              </Button>
                              <Button 
                                size="sm"
                                variant={!showAnnotatedImage ? "default" : "outline"}
                                onClick={() => setShowAnnotatedImage(false)}
                              >
                                <Image className="h-3 w-3 mr-2" />
                                Original
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => {
                              setIsDetectingObjects(true);
                              detectObjects().finally(() => setIsDetectingObjects(false));
                            }}
                            disabled={isDetectingObjects}
                          >
                            {isDetectingObjects ? (
                              <>
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Detecting...
                              </>
                            ) : (
                              <>
                                <Search className="h-3 w-3 mr-2" />
                                Detect Objects
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={analyzeEvidence}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Microscope className="h-3 w-3 mr-2" />
                                Analyze
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Show reportText generated from AnalysisTools */}
                    {reportText && (
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-medium mb-2">Generated Report</h3>
                        
                        <textarea
                          className="w-full p-4 border rounded bg-white text-sm max-h-96 overflow-auto resize-none whitespace-pre-wrap"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          rows={15}
                        />

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => {
                              const blob = new Blob([reportText], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `case-report-${caseId || "unknown"}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90"
                          >
                            Download Report
                          </button>
                        </div>
                      </div>
                    )}


                  {/* Display all uploaded images in a grid */}
                  {uploadedImages.length > 0 && !selectedImage && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-4">All Evidence Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div 
                            key={index} 
                            className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedImage(image.preview)}
                          >
                            <div className="aspect-square relative">
                              <img 
                                src={image.preview} 
                                alt={`Evidence ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2 bg-muted/20 border-t">
                              <p className="text-xs font-medium truncate">Evidence image {index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button 
                          className="w-full" 
                          onClick={analyzeEvidence}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Analyze All Images
                            </>
                          ) : (
                            <>
                              <Microscope className="h-4 w-4 mr-2" />
                              Analyze All Images
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show analysis results for the selected image */}
                  {selectedImage && analysisResults && analysisResults.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-4">Analysis Results for Selected Image</h3>
                      {analysisResults
                        .filter(result => {
                          // Find the index of the selected image
                          const selectedIndex = uploadedImages.findIndex(img => img.preview === selectedImage);
                          // Only show results for the selected image index
                          return selectedIndex >= 0 && result.imageIndex === selectedIndex;
                        })
                        .map((result, index) => {
                          // Apply confidence threshold check
                          const confidencePercent = result.confidence_score * 100;
                          const isBelowThreshold = confidencePercent < 20;
                          const displayCrimeType = isBelowThreshold ? "No Crime Detected" : result.predicted_crime_type;
                          const displayCrime = isBelowThreshold ? "Confidence below threshold" : result.predicted_crime;
                          
                          return (
                            <div key={index} className="mb-4 p-3 bg-muted/20 rounded-md last:mb-0">
                              <p className="text-sm font-medium">{displayCrimeType}</p>
                              <p className="text-sm text-muted-foreground">{displayCrime}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {confidencePercent.toFixed(1)}%
                                {isBelowThreshold && (
                                  <span className="ml-2 text-amber-600">(Below 20% threshold)</span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  
                
                  {/* Show all results if no image is selected */}
                  {!selectedImage && analysisResults && (
                    <ResultsDisplay
                      analysisResults={analysisResults}
                      caseReport={caseReport}
                      enhancedImage={enhancedImage}
                      objectDetectionResults={objectDetectionResults}
                      onDownloadReport={handleDownloadReport}
                    />
                  )}
                  
                  {/* Default state when no analysis has been performed */}
                  {!analysisResults  && !caseReport &&   !enhancedImage  && (
                    <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg">
                      <div className="p-3 bg-muted rounded-lg mb-3">
                        <Image className="w-8 h-8" />
                      </div>
                      <h3 className="font-medium">Select an image or analyze evidence</h3>
                      <p className="text-xs mt-2 text-muted-foreground">
                        Click on an image from the left panel or use the analysis tools on the right
                      </p>
                    </div>
                  )}
                </div>
              ) : activeTab === "docs" ? (
                <div className="flex-1 overflow-hidden">
                  <DocsInterface />
                </div>
              ) :
              (
                <div className="flex-1 overflow-hidden">
                  <ChatInterface 
                    selectedImage={selectedImage} 
                    analyzedImages={analyzedImages}
                    caseId={caseId}
                  />
                </div>
              )}
            </div>
            {isProcessing && activeTab === "studio" && <LoadingOverlay />}
          </div>
        </div>

        {/* Tools Panel - Right Side */}
        <div className={`w-96 border-l overflow-y-auto flex flex-col ${activeTab === "studio" || activeTab === "chat" ? "block" : "hidden"}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Forensic Tools</h2>
          </div>
          
          <AnalysisTools
          caseId={caseId}
          setReportText={setReportText}
        />

        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-3 divide-x">
          <button
            className={`flex flex-col items-center py-3 ${activeTab === "sources" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("sources")}
          >
            <Image className="h-5 w-5 mb-1" />
            <span className="text-xs">Images</span>
          </button>
          <button
            className={`flex flex-col items-center py-3 ${activeTab === "chat" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            className={`flex flex-col items-center py-3 ${activeTab === "studio" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("studio")}
          >
            <Microscope className="h-5 w-5 mb-1" />
            <span className="text-xs">Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
} 


















































