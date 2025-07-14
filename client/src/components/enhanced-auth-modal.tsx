import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Rocket, 
  Shield, 
  Zap, 
  CheckCircle, 
  Loader2,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Github,
  Chrome,
  Twitter,
  Star,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";

interface EnhancedAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export function EnhancedAuthModal({ open, onClose, onSuccess, title, description }: EnhancedAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: AuthFormData & { isSignUp: boolean }) => {
      const endpoint = data.isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const response = await apiRequest('POST', endpoint, {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.sessionId) {
        localStorage.setItem('auth-session', data.sessionId);
      }
      toast({
        title: isSignUp ? "🎉 Welcome to StartupDeck AI!" : "👋 Welcome Back!",
        description: isSignUp 
          ? "Your account has been created successfully. Let's validate some amazing ideas!"
          : "You've been signed in successfully. Ready to build something great?",
      });
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthFormData) => {
    authMutation.mutate({ ...data, isSignUp });
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    form.reset();
  };

  const handleOAuthProvider = (provider: string) => {
    toast({
      title: "Coming Soon!",
      description: `${provider} authentication will be available soon.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-0 bg-transparent">
        <div className="flex min-h-[600px]">
          {/* Left Side - Beautiful Background */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            {/* Animated gradient background inspired by Freepik styles */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4facfe] via-transparent to-[#00f2fe] opacity-60"></div>
            
            {/* Animated shapes */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/15 rounded-lg rotate-45 animate-spin-slow"></div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 tracking-tight">
                Join the Future of
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Startup Validation
                </span>
              </h2>
              
              <p className="text-lg text-white/90 mb-8 max-w-sm leading-relaxed">
                AI-powered insights, comprehensive market analysis, and pitch deck generation - all in one platform.
              </p>
              
              <div className="space-y-3 w-full max-w-xs">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Unlimited business validations</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Professional pitch deck generation</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Privacy-first with local LLMs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-8 lg:p-12 h-full flex flex-col justify-center">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isSignUp 
                    ? "Join thousands of entrepreneurs validating their ideas" 
                    : "Sign in to continue your startup journey"
                  }
                </p>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthProvider("Google")}
                  className="w-full h-12 text-sm font-medium border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Chrome className="w-5 h-5 mr-3 text-red-500" />
                  Continue with Google
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthProvider("GitHub")}
                    className="h-12 text-sm font-medium border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthProvider("Twitter")}
                    className="h-12 text-sm font-medium border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Twitter className="w-5 h-5 mr-2 text-blue-500" />
                    Twitter
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Enter your username"
                      className="h-12 pl-10 text-sm border-2 focus:border-[#145da0] focus:ring-[#145da0]"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email (Optional)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter your email"
                        className="h-12 pl-10 text-sm border-2 focus:border-[#145da0] focus:ring-[#145da0]"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      placeholder="Enter your password"
                      className="h-12 pl-10 pr-10 text-sm border-2 focus:border-[#145da0] focus:ring-[#145da0]"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={authMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] text-white font-medium text-sm transition-all duration-200 hover:shadow-lg"
                >
                  {authMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (
                    <>
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Switch Mode */}
              <div className="text-center mt-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                </span>
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm font-medium text-[#145da0] hover:text-[#0c2d48] transition-colors"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-[#145da0] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                      🔒 Privacy First
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Your data stays secure on your server. We use open-source LLMs locally - 
                      no external API calls, no data sharing with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}