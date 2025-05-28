import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navbar3 } from "@/components/Navbar3";
import { Footer } from "@/components/Footer";

export default function AdminProfile() {
  const [name, setName] = useState("saggkushal");
  const [email, setEmail] = useState("saggkushal@gmail.com");
  const [phone, setPhone] = useState("9063006409");
  const [location, setLocation] = useState("India");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    console.log("Saved:", { name, email, phone, location });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col relative">
      <Navbar3 />

      <div className="flex justify-end pt-4 pr-4">
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Fill and manage your profile details</p>

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
