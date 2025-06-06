import { useState, useEffect, ReactNode, SetStateAction } from "react";
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
  Clock,
  MessageCircle,
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
import axios from "axios";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
interface ImageFile {
  file: File;
  preview: string;
}
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";



export default function Case1() {
  const { caseId } = useParams();

  const [caseName, setCaseName] = useState(`Case #${caseId?.replace("case-", "")}`);
  const [activeTab, setActiveTab] = useState<"sources" | "chat" | "studio" | "docs">("studio");
  const { toast } = useToast(); 
  const [isDetectingObjects, setIsDetectingObjects] = useState(false);  
  const [canMessage,setcanMessage]=useState(false);
  const [officer,setofficer]=useState("");
  const [showReferenceDialog, setShowReferenceDialog] = useState(false);
  const [ShowMessageDialog,setShowMessageDialog]=useState(false);
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [fileeuser,setfileeuser]=useState(false)
  const [Imagesuploaded,setImagesuploaded]= useState<string[]>([]);
  const [allImages, setAllImages] = useState<ImageFile[]>([]);
  const [onlyImages,setonlyImages]=useState(null);
  const [caseEnded,setcaseEnded]=useState(false);
  const [all_img_analysis,setAll_img_analysis]=useState([]);
  const [previousReport, setPreviousReport] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [referenceReport, setreferenceReport] = useState<string | null>(null);
  const [referrorMsg, setrefErrorMsg] = useState<string | null>(null);
  const [showrefReport, setShowrefReport] = useState(false);
  const [ShowReference,setShowReference]=useState(false);
  const [referenceid,setreferenceid]=useState(null);
  const [ref_img_analysis,setref_img_analysis]=useState([]);

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

  const [imageAnalysis, setImageAnalysis] = useState<any[]>([]);
  const navigate = useNavigate();





  const token = sessionStorage.getItem("authToken");
  const user_mail = sessionStorage.getItem("email");

  const decoded = jwtDecode<{}>(token);
  if(decoded['role']!="investigator"){
    navigate("*")
  }

  useEffect(()=>{
    const get_status=async()=>{
      const status=await axios.get(`http://localhost:7070/api/cases/getstatus/${caseId}`)
      console.log(status);
      if(status.data.status==="closed"){
        setcaseEnded(true);
      }
    }
    get_status();

  },[])

  useEffect(()=>{
    const fetch_img_analysis=async()=>{
      try{

        const img_analysis=await axios.get(`http://localhost:7070/api/cases/fetch_img_analysis/${caseId}`)
        if(img_analysis){
          console.log(img_analysis);
          setAll_img_analysis(img_analysis.data.analysis_results);
        }
      }catch(err){
        console.log(err);
      }
      
    }
    fetch_img_analysis();
  },[])

  useEffect(()=>{
    const filee=async()=>{
      const filee_user=await axios.get(`http://localhost:7070/api/cases/getfilee/${caseId}`)
      if(filee_user.data.message==="common"){
        setfileeuser(true);
      }
    }
    filee()
  },[])

  useEffect(()=>{
    const fetchPreviousReport = () => {

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
    fetchPreviousReport();
},[])

  
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
    handlecommonuploads,
  } = useCaseManagement(caseId); // Pass caseId to the hook
  
  // Function to handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
    
  };
  
  async function urlToImageFile(url: string): Promise<ImageFile> {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
    const file = new File([blob], filename, { type: blob.type });
  
    const preview = URL.createObjectURL(blob); // create a local blob URL
  
    return {
      file,
      preview
    };
  }
  
  
  async function convertAllImages(urls: string[]) {
    const imageFiles: ImageFile[] = await Promise.all(urls.map(url => urlToImageFile(url)));
    handlecommonuploads(imageFiles);
    const img_arr=[]
    imageFiles.map((f,p)=>{img_arr.push(f)});
    setonlyImages(img_arr);
    setAllImages(imageFiles);
  }
  useEffect(()=>{
    const fetchImages = async () =>{
      if(fileeuser){

        try{
            const getImages=await axios.get(`http://localhost:7070/api/cases/images/${caseId}`)
            
            const allFilePaths = getImages.data.map(image => image.file_path);
            setImagesuploaded(allFilePaths);
            convertAllImages(allFilePaths);
        }catch(err){
            console.log(err);
        }
      }
    }
    fetchImages();
},[fileeuser])

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

  function ReportBox({ reportText: initialReportText, caseId, imageAnalysis = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reportText, setReportText] = useState(initialReportText);
  
    return (
      <>
        {/* Toggle Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-3 bg-primary text-white rounded-xl shadow hover:bg-primary/90 transition"
          >
            Show Generated Report
          </button>
        </div>
  
        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative mx-4 max-h-[80vh] overflow-y-auto">
  
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
              >
                &times;
              </button>
  
              {/* Heading */}
              <h3 className="text-xl font-semibold mb-4 text-primary text-center">
                Case Report Summary
              </h3>
  
              {/* Editable Report Content */}
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full text-sm leading-relaxed whitespace-pre-wrap bg-muted/10 p-4 rounded-xl border resize-y max-h-[30vh]"
                rows={8}
              />
  
              {/* Image Analysis Section */}
              {imageAnalysis.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Detected Evidences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[35vh] overflow-y-auto">
                    {imageAnalysis.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-gray-50 shadow-sm flex flex-col items-center"
                      >
                        <img
                          src={item.imageUrl}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-36 object-cover rounded mb-2"
                        />
                        <p><strong>Crime Type:</strong> {item.crimeType}</p>
                        <p><strong>Description:</strong> {item.description}</p>
                        <p><strong>Confidence:</strong> {item.confidence}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Download Report Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={async () => {
                    // Create hidden container for PDF generation
                    const input = document.createElement("div");
                    input.style.position = "fixed";
                    input.style.top = "-9999px";
                    input.style.left = "-9999px";
                    input.style.width = "210mm";
                    input.style.minHeight = "297mm";
                    input.style.background = "white";
                    input.style.padding = "20px";
                    input.style.fontFamily = "Arial, sans-serif";
                    input.style.color = "#333";
                    input.style.boxSizing = "border-box";
  
                    // Use updated reportText from state
                    const textSection = document.createElement("div");
                    textSection.innerHTML = `
                      <h2 style="font-size: 20px; margin-bottom: 10px;">Case Report Summary</h2>
                      <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${reportText}</p>
                      <br/>
                      <h3 style="font-size: 18px; margin-bottom: 10px;">Detected Evidences:</h3>
                    `;
                    input.appendChild(textSection);
  
                    // Append evidences
                    for (let i = 0; i < imageAnalysis.length; i++) {
                      const { imageUrl, crimeType, description, confidence } = imageAnalysis[i];
                      const container = document.createElement("div");
                      container.style.marginBottom = "25px";
                      container.style.border = "1px solid #ccc";
                      container.style.padding = "10px";
                      container.style.borderRadius = "8px";
                      container.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
                      container.style.pageBreakInside = "avoid";
  
                      const img = document.createElement("img");
                      img.src = imageUrl;
                      img.style.width = "100%";
                      img.style.maxHeight = "180px";
                      img.style.objectFit = "contain";
                      img.style.display = "block";
                      img.style.marginBottom = "10px";
  
                      const info = document.createElement("div");
                      info.innerHTML = `
                        <p style="margin: 4px 0;"><strong>Crime Type:</strong> ${crimeType}</p>
                        <p style="margin: 4px 0;"><strong>Description:</strong> ${description}</p>
                        <p style="margin: 4px 0;"><strong>Confidence:</strong> ${confidence}%</p>
                      `;
  
                      container.appendChild(img);
                      container.appendChild(info);
                      input.appendChild(container);
                    }
  
                    document.body.appendChild(input);
  
                    try {
                      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF("p", "mm", "a4");
  
                      const pageWidth = pdf.internal.pageSize.getWidth();
                      const pageHeight = pdf.internal.pageSize.getHeight();
  
                      const imgProps = pdf.getImageProperties(imgData);
                      const pdfImgHeight = (imgProps.height * pageWidth) / imgProps.width;
  
                      if (pdfImgHeight > pageHeight) {
                        let heightLeft = pdfImgHeight;
                        let position = 0;
  
                        pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfImgHeight);
                        heightLeft -= pageHeight;
  
                        while (heightLeft > 0) {
                          pdf.addPage();
                          position = heightLeft - pdfImgHeight;
                          pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfImgHeight);
                          heightLeft -= pageHeight;
                        }
                      } else {
                        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfImgHeight);
                      }
  
                      pdf.save(`case-report-${caseId || "unknown"}.pdf`);
                    } catch (err) {
                      console.error("Error generating PDF:", err);
                    } finally {
                      document.body.removeChild(input);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90"
                >
                  Download Report
                </button>
              </div>
  
            </div>
          </div>
        )}
      </>
    );
  }  
  function RefReportBox({ reportText: initialReportText, caseId, imageAnalysis = [] }) {
    const [isOpen, setIsOpen] = useState(true);
    const [reportText, setReportText] = useState(initialReportText);
  
    return (
      <>
        
        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative mx-4 max-h-[80vh] overflow-y-auto">
  
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
              >
                &times;
              </button>
  
              {/* Heading */}
              <h3 className="text-xl font-semibold mb-4 text-primary text-center">
                Case Report Summary
              </h3>
  
              {/* Editable Report Content */}
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full text-sm leading-relaxed whitespace-pre-wrap bg-muted/10 p-4 rounded-xl border resize-y max-h-[30vh]"
                rows={8}
              />
  
              {/* Image Analysis Section */}
              {imageAnalysis.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Detected Evidences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[35vh] overflow-y-auto">
                    {imageAnalysis.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-gray-50 shadow-sm flex flex-col items-center"
                      >
                        <img
                          src={item.imageUrl}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-36 object-cover rounded mb-2"
                        />
                        <p><strong>Crime Type:</strong> {item.crimeType}</p>
                        <p><strong>Description:</strong> {item.description}</p>
                        <p><strong>Confidence:</strong> {item.confidence}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Download Report Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={async () => {
                    // Create hidden container for PDF generation
                    const input = document.createElement("div");
                    input.style.position = "fixed";
                    input.style.top = "-9999px";
                    input.style.left = "-9999px";
                    input.style.width = "210mm";
                    input.style.minHeight = "297mm";
                    input.style.background = "white";
                    input.style.padding = "20px";
                    input.style.fontFamily = "Arial, sans-serif";
                    input.style.color = "#333";
                    input.style.boxSizing = "border-box";
  
                    // Use updated reportText from state
                    const textSection = document.createElement("div");
                    textSection.innerHTML = `
                      <h2 style="font-size: 20px; margin-bottom: 10px;">Case Report Summary</h2>
                      <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${reportText}</p>
                      <br/>
                      <h3 style="font-size: 18px; margin-bottom: 10px;">Detected Evidences:</h3>
                    `;
                    input.appendChild(textSection);
  
                    // Append evidences
                    for (let i = 0; i < imageAnalysis.length; i++) {
                      const { imageUrl, crimeType, description, confidence } = imageAnalysis[i];
                      const container = document.createElement("div");
                      container.style.marginBottom = "25px";
                      container.style.border = "1px solid #ccc";
                      container.style.padding = "10px";
                      container.style.borderRadius = "8px";
                      container.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
                      container.style.pageBreakInside = "avoid";
  
                      const img = document.createElement("img");
                      img.src = imageUrl;
                      img.style.width = "100%";
                      img.style.maxHeight = "180px";
                      img.style.objectFit = "contain";
                      img.style.display = "block";
                      img.style.marginBottom = "10px";
  
                      const info = document.createElement("div");
                      info.innerHTML = `
                        <p style="margin: 4px 0;"><strong>Crime Type:</strong> ${crimeType}</p>
                        <p style="margin: 4px 0;"><strong>Description:</strong> ${description}</p>
                        <p style="margin: 4px 0;"><strong>Confidence:</strong> ${confidence}%</p>
                      `;
  
                      container.appendChild(img);
                      container.appendChild(info);
                      input.appendChild(container);
                    }
  
                    document.body.appendChild(input);
  
                    try {
                      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF("p", "mm", "a4");
  
                      const pageWidth = pdf.internal.pageSize.getWidth();
                      const pageHeight = pdf.internal.pageSize.getHeight();
  
                      const imgProps = pdf.getImageProperties(imgData);
                      const pdfImgHeight = (imgProps.height * pageWidth) / imgProps.width;
  
                      if (pdfImgHeight > pageHeight) {
                        let heightLeft = pdfImgHeight;
                        let position = 0;
  
                        pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfImgHeight);
                        heightLeft -= pageHeight;
  
                        while (heightLeft > 0) {
                          pdf.addPage();
                          position = heightLeft - pdfImgHeight;
                          pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfImgHeight);
                          heightLeft -= pageHeight;
                        }
                      } else {
                        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfImgHeight);
                      }
  
                      pdf.save(`case-report-${caseId || "unknown"}.pdf`);
                    } catch (err) {
                      console.error("Error generating PDF:", err);
                    } finally {
                      document.body.removeChild(input);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90"
                >
                  Download Report
                </button>
              </div>
  
            </div>
          </div>
        )}
      </>
    );
  }  


  
  useEffect(()=>{
    const get_usermail=async()=>{
      const res=await axios.get(`http://localhost:7070/api/cases/getUsermail/${caseId}`)
      const username = res.data.email.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        setofficer(formattedName);
    }
    get_usermail();
  },[])


  sessionStorage.setItem("caseId", caseId);
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

 
  const [initials, setInitials] = useState("");

  useEffect(() => {

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
        const res = await fetch(`http://localhost:7070/api/auth/dashboard/${userId}`, {
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
        setInitials("U");
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

    try {
      const res = await fetch("http://localhost:7070/api/invitation/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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



  useEffect(() => {
    const fetchImages = async () => {
      try {
        const getmsg=await axios.get(`http://localhost:7070/api/messages/conversations/${caseId}`,
          {
              headers: {
                  Authorization: `Bearer ${token}`
                }
          }
        );
        const updatedMessages = getmsg.data.messages.map(msg => ({
          ...msg,
          isBot: msg.senderId !== user_mail
        }));
        
        
        setChatMessages(updatedMessages);

      }catch(err){
        console.log(err);
      }


    };
  
    if (caseId) {
      fetchImages(); // Trigger fetch if caseId exists
    } 
  }, [caseId, toast]);


  const [messages, setMessages] = useState([
    { from: "other", text: "Hello! How can I help you today?" },
  ]);
  
const [chatMessages, setChatMessages] = useState<{
  timestamp: ReactNode;
  id: number; text: string, isBot: boolean 
}[]>([]);
const [messageInput, setMessageInput] = useState('');



const sendMessage = async () => {
  if (!messageInput.trim()) return;

  const currentMessage = messageInput;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  setMessageInput('');


  const tempId = Date.now();


  try {
    const response = await axios.post(`http://localhost:7070/api/messages/message/${caseId}`, {
      text: currentMessage,
      senderId: ""
    },{
        headers: {
            Authorization: `Bearer ${token}`,
          },
    });


    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempId ? { ...msg, sending: false, failed: false, timestamp } : msg
      )
    );

    setChatMessages((prev) => [
      ...prev,
      { id: response.data.messageId, text: currentMessage, isBot: false, sending: false, timestamp }
    ]);
  } catch (error) {
    console.error('Failed to send message:', error);
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempId ? { ...msg, sending: false, failed: true, timestamp } : msg
      )
    );
  }
};

useEffect(()=>{
  const getRole=async()=>{
    try{
      const response=await axios.get(`http://localhost:7070/api/cases/getRoles/${caseId}`);
      if(response.data.role=="common"){
        setcanMessage(true);
      }
    }
    catch(err){
      console.log(err)
    }
  }
  getRole();
},[])

async function Reference() {
  try {
    const getreference = await axios.get(`http://localhost:7070/api/cases/reference/${caseId}`);

    if (getreference.status === 200) {
      const casesArray = getreference.data;  // This is the array you got

      if (casesArray && casesArray.length > 0) {
        setCases(
          casesArray.map(c => ({
            _id: c._id,
            title: c.title,
            type: c.case_type,
            status: c.status || "New",
            date: c.date || new Date().toISOString(),
            lastUpdated: c.last_updated || new Date().toISOString(),
          }))
        );
      } else {
        // No cases found, clear or handle as needed
        setCases([]);
      }

      toast({
        variant: "default",
        title: "Cases",
        description: "Cases fetched successfully",
      });
    }
  } catch (err) {
    console.log(err);
  }
}

  const filteredCases = cases.filter(
    (c) => {
      if (c.title && typeof c.title === 'string') {
        return (
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
  );

const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  const End_case=async()=>{
    try{
      const end_case=await axios.get(`http://localhost:7070/api/cases/endcase/${caseId}`)
      setcaseEnded(true);
    }catch(err){
      console.log(err)
    }
    
  }
  const Reopen_case=async()=>{
    try{
      const reopen_case=await axios.get(`http://localhost:7070/api/cases/reopencase/${caseId}`)
      setcaseEnded(false);
    }catch(err){
      console.log(err)
    }

  }

  const ReferenceReport = async(case_id) => {

    fetch(`http://localhost:7070/api/report/fetch?case_id=${case_id}`)
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        if (!res.ok) {
          // Show error message from backend if any
          setrefErrorMsg(data.error || data.message || "Failed to fetch report");
          setShowrefReport(false);
          setreferenceReport(null);
          return;
        }
        setreferenceReport(data.report);
        setShowReport(true);
        setrefErrorMsg(null);
      })
      .catch((err) => {
        console.error(err);
        setrefErrorMsg("Error fetching previous report");
        setShowrefReport(false);
        setreferenceReport(null);
      });
        try{

          const img_analysis=await axios.get(`http://localhost:7070/api/cases/fetch_img_analysis/${caseId}`)
          if(img_analysis){
            setref_img_analysis(img_analysis.data.analysis_results);
          }
        }catch(err){
          console.log(err);
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
            {/* <Button variant="ghost" size="sm" className="ml-2" onClick={() => {
              const newName = prompt("Enter new case name:", caseName);
              if (newName) setCaseName(newName);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </Button> */}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-start justify-center px-2 py-2">
                    {/* Large screen buttons */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                        {/* Message Dialog */}
                        {canMessage && (
                        
                        <Dialog open={ShowMessageDialog} onOpenChange={setShowMessageDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={caseEnded}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-[60vh]">
                            <div className="flex items-center justify-between p-4 border-b bg-slate-500 text-white">
                                <DialogTitle className="text-xl font-semibold">{officer}</DialogTitle>
                            </div>

                            <div className="flex-1 flex flex-col p-4 bg-gray-100 overflow-auto min-h-0">
                                <div className="space-y-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                                    <div className={`max-w-xs p-3 rounded-lg ${msg.isBot ? "bg-muted" : "bg-primary text-white"}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 p-4 border-t bg-white">
                                <input
                                type="text"
                                className="flex-1 p-2 border rounded-md"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                />
                                <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                onClick={sendMessage}
                                disabled={messageInput.trim() === ""}
                                >
                                Send
                                </button>
                            </div>
                            </div>
                        </DialogContent>
                        </Dialog>

                        )}

                        {/* Take Reference Dialog */}
                        <Dialog open={showReferenceDialog} onOpenChange={setShowReferenceDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={Reference}>
                            Take Reference
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl w-full max-h-[120vh] overflow-auto">
                            <DialogTitle>Take Reference</DialogTitle>
                            <DialogDescription>
                            If you want to do similar to the other cases of the same type
                            </DialogDescription>
                            {sortedCases.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium text-lg mb-1">No cases found</h3>
                                <p className="text-muted-foreground mb-4">
                                {searchQuery ? "No cases match your search query" : "Create your first case to get started"}
                                </p>
                            </div>
                            ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedCases.map((c) => (
                                <div onClick={()=> {{ReferenceReport(c._id);
                                  setShowReference(true);
                                  setreferenceid(c._id);
                                  setShowReferenceDialog(false);
                                }}} key={c._id}>
                                    
                                    <Card className="h-full transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                        <span className="line-clamp-2">{c.title}</span>
                                        <span className="text-xs font-normal px-2 py-1 rounded-full bg-forensic bg-opacity-10 text-forensic">
                                            {c.status}
                                        </span>
                                        </CardTitle>
                                        <CardDescription>{c.type}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Created on {formatDate(c.date)}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground flex justify-end">
                                        <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Updated {formatDate(c.lastUpdated)}
                                        </div>
                                    </CardFooter>
                                    </Card>
                                </div>
                                ))}
                            </div>
                            )}
                        </DialogContent>
                        </Dialog>
                            {ShowReference && (
                               <RefReportBox 
                               reportText={referenceReport} 
                               caseId={referenceid} 
                               imageAnalysis={ref_img_analysis} 
                             />
                            )}
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
      {/* <Separator /> */}
      {/* <div>
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
      </div> */}
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
                            <DropdownMenuItem onClick={() => setBgColor("bg-green-100 text-green-900")}>
                                Light Green 
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

                        
                    </div>
                    </div>
        
        
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sources Panel - Left Side */}
        <div className={`w-full md:w-80 border-r overflow-y-auto flex flex-col ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Evidence Images</h2>
          </div>
          
          {!caseEnded && (
            <>
            <ImageUpload onUpload={handleFileUpload} />
            
            </>
          )}
          <ImageGallery
            images={uploadedImages}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onDeleteImage={handleDeleteImage}
          />
          
          
          {/* Add Analyze Evidence button below the images */}
          {!caseEnded && uploadedImages.length > 0 && (
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
                          {!caseEnded && (
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
                          )}
                          {!caseEnded && (
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
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Show reportText generated from AnalysisTools */}
                  {reportText && (
                    <ReportBox 
                      reportText={reportText} 
                      caseId={caseId} 
                      imageAnalysis={imageAnalysis} 
                    />
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
                      {!caseEnded && (                    
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
                      )}
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
                              Confidence:{" "}
                              {(!isBelowThreshold
                                ? (confidencePercent + 50)
                                : confidencePercent
                              ).toFixed(1)}%
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
          
          {caseEnded ?(
            <>
            
            <Button onClick={Reopen_case}>Reopen Case</Button>
            
              <ReportBox 
                reportText={previousReport} 
                caseId={caseId} 
                imageAnalysis={all_img_analysis} 
              />
            </>
          

        ):(
          <>
          
          <AnalysisTools
          caseId={caseId}
          setReportText={setReportText}
          setImageAnalysis={setImageAnalysis}
        />
          <Button onClick={End_case}>End Case</Button>
          </>
        )}
        

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


function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}














































