import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import ModernBackground from "@/components/modern-background";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAuth } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      setLocation("/dashboard");
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    },
    onError: () => {
      toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      setLocation("/dashboard");
      toast({ title: "Welcome to the kingdom!", description: "Account created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create account", variant: "destructive" });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background">
      <ModernBackground />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary-teal bg-clip-text text-transparent tracking-tight">
            your hïghñëss
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Connect, Chat, and Create</p>
        </div>
        
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex rounded-lg p-1 bg-muted">
                <Button
                  type="button"
                  variant={!isRegister ? "default" : "ghost"}
                  className={`flex-1 text-sm font-medium ${
                    !isRegister 
                      ? "bg-primary text-primary-foreground hover:bg-primary-blue-dark" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsRegister(false)}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  variant={isRegister ? "default" : "ghost"}
                  className={`flex-1 text-sm font-medium ${
                    isRegister 
                      ? "bg-primary text-primary-foreground hover:bg-primary-blue-dark" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsRegister(true)}
                >
                  Register
                </Button>
              </div>
            </div>
            
            {!isRegister ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">Email</Label>
                  <Input
                    type="email"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    {...loginForm.register("email")}
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">Password</Label>
                  <Input
                    type="password"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-blue-dark text-primary-foreground"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">Email</Label>
                  <Input
                    type="email"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    {...registerForm.register("email")}
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">Password</Label>
                  <Input
                    type="password"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your password"
                    {...registerForm.register("password")}
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">Display Name</Label>
                  <Input
                    type="text"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Choose your display name"
                    {...registerForm.register("displayName")}
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2 text-foreground">WhatsApp Number (Optional)</Label>
                  <Input
                    type="tel"
                    className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1234567890"
                    {...registerForm.register("whatsappNumber")}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-blue-dark text-primary-foreground"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Powered by <span className="font-mono text-primary">horlapookie</span>
        </div>
      </div>
    </div>
  );
}
