import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BusinessValidation } from "@shared/schema";
import { 
  ArrowLeft, 
  Sparkles, 
  Lightbulb, 
  Loader2, 
  Dice1,
  BarChart3,
  Target,
  Users,
  TrendingUp
} from "lucide-react";

const formSchema = z.object({
  idea: z.string().min(1, "Please enter your business idea"),
  includesPitchDeck: z.boolean().default(true),
});

const surpriseIdeas = [
  "AI-powered fitness app for busy professionals",
  "Sustainable packaging for e-commerce deliveries", 
  "Mental health support platform for remote workers",
  "Food waste reduction marketplace for restaurants",
  "Elderly care coordination technology platform",
  "Carbon footprint tracking for small businesses",
  "Micro-learning platform for technical skills",
  "Smart home energy optimization system",
  "Local community skill-sharing marketplace",
  "Digital wellness tools for screen time management"
];

export default function Analyze() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idea: "",
      includesPitchDeck: true,
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ idea, includesPitchDeck }: { idea: string; includesPitchDeck: boolean }) => {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea, 
          model: 'llama3.2',
          includesPitchDeck 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate business idea');
      }

      return data;
    },
    onSuccess: (data) => {
      // Store the validation result in localStorage
      localStorage.setItem('latest-validation', JSON.stringify(data.validation));
      
      // Navigate to results page
      setLocation('/result');
    },
    onError: (error: Error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    validateMutation.mutate(values);
  };

  const handleSurpriseMe = () => {
    const randomIdea = surpriseIdeas[Math.floor(Math.random() * surpriseIdeas.length)];
    form.setValue("idea", randomIdea);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 dark:bg-slate-900/80 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2 text-[#145da0] hover:bg-[#b1d4e0]/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Business Idea Validation</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-powered insights and analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BarChart3 className="text-white text-2xl" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Validate Your{" "}
            <span className="bg-gradient-to-r from-[#145da0] to-[#2e8bc0] bg-clip-text text-transparent">
              Business Idea
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get comprehensive AI-powered analysis including market sizing, competition research, 
            target audience insights, and a complete validation score.
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 mb-8 dark:bg-slate-800/70 dark:border-gray-700/50">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your business idea
                </Label>
                <div className="relative">
                  <Input
                    id="idea"
                    {...form.register("idea")}
                    placeholder="e.g., 'A platform that connects local farmers with restaurants for sustainable food sourcing'"
                    className="min-h-[80px] pr-10 resize-none"
                    style={{ height: '80px' }}
                  />
                  <div className="absolute right-3 top-3">
                    <Lightbulb className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {form.formState.errors.idea && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.idea.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="includesPitchDeck" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generate pitch deck
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Also create a professional pitch deck with your validation
                  </p>
                </div>
                <Switch
                  id="includesPitchDeck"
                  checked={form.watch("includesPitchDeck")}
                  onCheckedChange={(checked) => form.setValue("includesPitchDeck", checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={validateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] hover:shadow-lg transition-all duration-200 text-white"
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Validate Business Idea
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSurpriseMe}
                  className="sm:w-auto border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white transition-all duration-200"
                >
                  <Dice1 className="mr-2 h-4 w-4" />
                  Surprise Me
                </Button>
              </div>
            </form>

            {/* Loading State */}
            {validateMutation.isPending && (
              <div className="mt-8">
                <div className="flex items-center justify-center space-x-3 py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-lg text-gray-600">Analyzing your business idea...</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-sm text-gray-600">Evaluating problem-solution fit...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-sm text-gray-600">Calculating market size and opportunity...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-sm text-gray-600">Analyzing target audience and competition...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What You'll Get Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-blue-600 h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Validation Score</h3>
              </div>
              <p className="text-gray-600">
                Get a comprehensive 0-100 score based on market viability, 
                competition analysis, and business model strength.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="text-green-600 h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Market Analysis</h3>
              </div>
              <p className="text-gray-600">
                Detailed TAM/SAM/SOM calculations, target audience insights, 
                and competitive landscape analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="text-purple-600 h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Strategic Insights</h3>
              </div>
              <p className="text-gray-600">
                Actionable recommendations on strengths to leverage, 
                risks to mitigate, and opportunities to pursue.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-amber-600 h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pitch Deck</h3>
              </div>
              <p className="text-gray-600">
                Optional professional pitch deck generation based on 
                your validation results, ready for investors.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}