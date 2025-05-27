import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navbar2 } from "@/components/Navbar2";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      // No token, redirect to login or homepage
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

        setEmail(data.email || "");
        setName(data.email ? data.email.split("@")[0] : "");
        setPhone(data.phone || "9063006409"); // adjust if phone is returned
        setLocation(data.location || "India"); // adjust if location is returned
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Optionally redirect or log out user
        // navigate("/");
      }
    }

    fetchUserProfile();
  }, [navigate]);

  const handleSave = () => {
    // Implement your save logic here
    setIsEditing(false);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Avatar circle fixed top-right */}
      

      <Navbar2 />
      <div className="flex justify-end pt-4">
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <main className="flex-1 container py-10 mt-34">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your profile details</p>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  disabled={!isEditing}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
