import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder auth — replace with real auth later
    if (username.trim() && password.trim()) {
      sessionStorage.setItem("admin-auth", "true");
      onLogin();
    } else {
      setError("Please enter credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <Card className="w-full max-w-sm border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/20">
            <Lock className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle className="text-xl">SEDO Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-amber-600 text-white hover:bg-amber-700">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
