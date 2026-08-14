import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthMode = "login" | "signup" | "forgot-password" | "phone-login" | "verify-otp";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, userProfile, signIn, signUp, resetPassword, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Route authenticated users based on strict role from userProfile
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, userProfile, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        // Navigation will be handled automatically by the useEffect above once userProfile is loaded.
      } else if (mode === "signup") {
        if (!displayName.trim()) {
          throw new Error("Please enter your name");
        }
        await signUp(email, password, displayName, role);
        toast({
          title: "Account created!",
          description: "Welcome to d4desi. Your account has been created.",
        });
        
        // Navigation will be handled automatically by the useEffect above once userProfile is loaded.
      } else if (mode === "forgot-password") {
        await resetPassword(email);
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for a link to reset your password.",
        });
        setMode("login");
      }
    } catch (error: any) {
      let message = "An error occurred. Please try again.";
      
      if (error.message?.includes("already registered") || error.message?.includes("already in use")) {
        message = "An account with this email already exists.";
      } else if (error.message?.includes("valid email")) {
        message = "Please enter a valid email address.";
      } else if (error.message?.includes("Password should be") || error.message?.includes("weak password")) {
        message = "Password should be at least 6 characters.";
      } else if (error.message?.includes("Invalid login credentials")) {
        message = "Invalid email or password.";
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Phone auth typically requires a third party provider like Twilio in Supabase
      toast({
        title: "Phone Authentication",
        description: "Phone authentication is currently disabled.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      toast({
        title: "OTP Verification",
        description: "Phone authentication requires additional Firebase configuration.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Welcome back";
      case "signup": return "Create your account";
      case "forgot-password": return "Reset your password";
      case "phone-login": return "Login with Phone";
      case "verify-otp": return "Verify OTP";
      default: return "Welcome";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login": return "Enter your credentials to access your account";
      case "signup": return "Join the d4desi community today";
      case "forgot-password": return "Enter your email and we'll send you a reset link";
      case "phone-login": return "Enter your phone number to receive an OTP";
      case "verify-otp": return "Enter the 6-digit code sent to your phone";
      default: return "";
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Reset Password"} - d4desi</title>
        <meta name="description" content="Access your d4desi account" />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
          <div className="text-center text-primary-foreground max-w-lg">
            <Link to="/" className="inline-block mb-8">
              <span className="text-4xl font-bold">
                <span className="text-accent">d4</span>desi
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-4">
              Connect with the Desi Community
            </h1>
            <p className="text-lg opacity-90">
              Discover trusted businesses, services, and connect with fellow Desi community members across the United States.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="lg:hidden mb-8">
              <span className="text-3xl font-bold">
                <span className="text-primary">d4</span>
                <span className="text-secondary">desi</span>
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">{getTitle()}</h2>
            <p className="text-muted-foreground mb-6">{getDescription()}</p>

            {(mode === "login" || mode === "signup") && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Email Login/Signup Form */}
            {(mode === "login" || mode === "signup") && (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {mode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="displayName"
                          name="displayName"
                          type="text"
                          placeholder="Enter your full name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Account Type</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="role" 
                            value="user" 
                            checked={role === "user"} 
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="text-sm">Member</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="role" 
                            value="business" 
                            checked={role === "business"} 
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="accent-primary h-4 w-4"
                          />
                          <span className="text-sm">Business Owner</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-sm text-primary hover:text-secondary transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setMode("phone-login")}
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === "forgot-password" && (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  Back to Sign In
                </Button>
              </form>
            )}

            {/* Phone Login Form */}
            {mode === "phone-login" && (
              <form onSubmit={handlePhoneLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  Back to Email Login
                </Button>
              </form>
            )}

            {/* OTP Verification Form */}
            {mode === "verify-otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Code sent to {phone}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-secondary transition-colors"
                    onClick={handlePhoneLogin}
                  >
                    Resend code
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setMode("phone-login")}
                  >
                    Change phone number
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
