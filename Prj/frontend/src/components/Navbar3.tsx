import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Sparkles, 
  Info 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar3() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear session storage, local storage, cookies, or auth tokens here
    localStorage.clear(); // or sessionStorage.clear(), or your logout function
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-forensic" />
            <span className="font-bold text-xl hidden sm:inline-block">CrimeSleuth AI</span>
          </Link>
        </div>

        {!isMobile ? (
          <nav className="flex items-center gap-6">
            <Link to="/admin-features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link to="/admin-about" className="text-sm font-medium transition-colors hover:text-primary">
              About Us
            </Link>
            <Link
              to="/admin-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md flex items-center"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin-profile">
              <Button variant="outline" size="sm" className="gap-1">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            
          </nav>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="container pb-4 pt-2">
          <nav className="flex flex-col gap-3">
            <Link to="/admin-features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md">
              Features
            </Link>
            <Link to="/admin-about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md">
              About Us
            </Link>
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                <span>Dashboard</span>
              </Link>
            <Link to="/admin-profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md">
              <User className="h-4 w-4 mr-1" />
              Profile
            </Link>
            <Button variant="destructive" size="sm" onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
