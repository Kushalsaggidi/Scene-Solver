import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [boolmail,setboolmail]=useState(null);
  const [passcheck,setpasscheck]=useState("");
  const { toast } = useToast();
  const [formData,setformData]=useState({
    email:"",
    resetcode:"",
    newpassword:"",
    confirmpassword:"",
  })

  const handelchange=(e)=>{
    const {name,value}=e.target;
    const formupdate=({
        ...formData,
        [name]:value
    })
    setformData(formupdate);
    if(formupdate.newpassword && formupdate.confirmpassword){
        if(formupdate.newpassword===formupdate.confirmpassword){
            setboolmail(true);
            setpasscheck("Password and Confirm Password matched.");
        }else{
            setboolmail(false);
            setpasscheck("Password and Confirm Password must be same.");
        }
    }

  }

  // Step 1: Send reset code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email=formData.email
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {email});
      if (res.status === 200) {
        toast({
          title: "EMail",
          description: "Reset code sent to your email.",
        });
        setStep(2);
        setboolmail(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.data.message,
        });
        setboolmail(false);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error sending reset code.",
      });
      
      setboolmail(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (formData.newpassword !== formData.confirmpassword) {
      setboolmail(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/reset-password",formData);

      if (res.status === 200) {
        toast({
          variant: "default",
          title: "Success",
          description: "Password reset successful. Redirecting to login...",
        });
        
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid code or failed to reset password.",
        });
        
      }
    } catch (err) {
      console.log(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to reset password.",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>

        <form
          onSubmit={step === 1 ? handleSendCode : handlePasswordReset}
          className="w-full max-w-md mt-4"
        >
          <div className="grid gap-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handelchange}
                required
              />
            </div>

            {/* Step 2 only: code + new password */}
            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="resetCode">Reset Code</Label>
                  <Input
                    id="resetCode"
                    type="text"
                    name="resetcode"
                    value={formData.resetcode}
                    onChange={handelchange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="newpassword"
                    value={formData.newpassword}
                    onChange={handelchange}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                  />
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    name="confirmpassword"
                    value={formData.confirmpassword}
                    onChange={handelchange}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                    style={{borderColor : boolmail===null ? "":  boolmail ? 'green': 'red'}}
                  />
                  <p style={{color :  boolmail ? 'green': 'red'}} className="text-center text-[12px]">{passcheck}</p>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Please wait..."
                : step === 1
                ? "Send Reset Code"
                : "Reset Password"}
            </Button>
          </div>
        </form>

        {message && <p className="text-center mt-4 text-sm" style={{color: boolmail ? 'green' :'red'}}>{message}</p>}

        <div className="text-center mt-4">
          <a href="/signin" className="text-sm text-blue-600 hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
