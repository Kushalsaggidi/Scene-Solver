
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from 'jwt-decode';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const ADMIN_EMAIL = "saggkushal@gmail.com"; // Replace with your real admin email
  const ADMIN_PASSWORD = "admin123";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

    try {
    // Local admin login
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("email", ADMIN_EMAIL);
        sessionStorage.setItem("role", "admin");

        navigate("/admin-dashboard");

        toast({
          title: "Admin Login Successful",
          description: `Welcome back, ${ADMIN_EMAIL}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid admin credentials",
        });
      }

      return; // Skip the rest of the fetch logic
    }

    // Normal user login
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseback = await response.json();
    console.log("Login response:", responseback);

    if (response.status === 201) {
      const user = responseback.user;
      const token = responseback.token;

      if (token) {
        sessionStorage.setItem("authToken", token);
      }

      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("email", user.email);

        if (user.id) {
          sessionStorage.setItem("userid", user.id);
        }

        navigate("/verification");

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.email}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User data missing in response",
        });
      }
    } else if (response.status === 400) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User Not Found",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: responseback.message || "Invalid credentials",
      });
    }
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Something went wrong with the server",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <div className="flex-1 container flex flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="absolute left-4 top-20 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Fingerprint className="h-8 w-8 text-forensic" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to CrimeSleuth AI</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to sign in to your account
            </p>
          </div>
          
          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}


