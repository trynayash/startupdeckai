import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Crown, 
  Building, 
  CheckCircle, 
  Loader2,
  User,
  Lock
} from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthModal({ open, onClose, onSuccess, title, description }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: AuthFormData & { isSignUp: boolean }) => {
      const endpoint = data.isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: isSignUp ? "Account Created!" : "Welcome Back!",
        description: isSignUp 
          ? "Your account has been created successfully. You can now access all features."
          : "You've been signed in successfully.",
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-gray-900 dark:text-white">
            {title || (isSignUp ? "Create Your Account" : "Welcome Back")}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
            {description || "Sign in to unlock unlimited validations and pitch deck generations"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tier Benefits */}
          <div className="grid gap-3">
            <Card className="border-[#b1d4e0] bg-gradient-to-r from-[#b1d4e0]/10 to-[#2e8bc0]/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-lg flex items-center justify-center">
                    <Zap className="text-white h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Free Account</h3>
                      <Badge variant="secondary" className="bg-[#145da0] text-white">Popular</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-[#2e8bc0]" />
                        <span>5 validations/month</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-[#2e8bc0]" />
                        <span>3 pitch decks/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Auth Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
              <div className="relative mt-1">
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Enter your username"
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter your password"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={authMutation.isPending}
              className="w-full bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] text-white"
            >
              {authMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {isSignUp ? "Create Account" : "Sign In"}
                </>
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-[#145da0] hover:text-[#0c2d48] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-[#2e8bc0] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">Privacy First</p>
                <p>Your data stays on your server. We don't share or sell any information.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}