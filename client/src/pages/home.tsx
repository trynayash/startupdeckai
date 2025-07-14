import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { PitchDeckGenerator } from "@/components/pitch-deck-generator";
import { PitchDeckDisplay } from "@/components/pitch-deck-display";
import { SettingsModal } from "@/components/settings-modal";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { checkOllamaStatus } from "@/lib/ollama";
import { PitchDeckData, OllamaSettings } from "@shared/schema";
import { 
  Settings, 
  Rocket, 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  LogOut,
  User
} from "lucide-react";

export default function Home() {
  const [generatedDeck, setGeneratedDeck] = useState<PitchDeckData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem('auth-session')
  );
  const [settings, setSettings] = useState<OllamaSettings>(() => {
    const saved = localStorage.getItem('ollama-settings');
    return saved ? JSON.parse(saved) : {
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
      autoSave: true
    };
  });

  const { toast } = useToast();

  // Check authentication status
  const { data: user, isLoading: isAuthLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!sessionId,
    retry: false,
  });

  const isAuthenticated = !!user;

  const { data: ollamaStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 10000, // Check every 10 seconds
    retry: false,
  });

  const handleDeckGenerated = (deck: PitchDeckData) => {
    setGeneratedDeck(deck);
    
    if (settings.autoSave) {
      const savedDecks = JSON.parse(localStorage.getItem('saved-pitch-decks') || '[]');
      savedDecks.unshift(deck);
      localStorage.setItem('saved-pitch-decks', JSON.stringify(savedDecks.slice(0, 10))); // Keep only last 10
    }
    
    toast({
      title: "Success!",
      description: "Your pitch deck has been generated successfully.",
    });
  };

  const handleSettingsSaved = (newSettings: OllamaSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ollama-settings', JSON.stringify(newSettings));
    refetchStatus();
    toast({
      title: "Settings saved",
      description: "Your Ollama settings have been updated.",
    });
  };

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/signout');
    },
    onSuccess: () => {
      localStorage.removeItem('auth-session');
      setSessionId(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const isConnected = ollamaStatus?.status === 'connected';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 dark:bg-slate-900/80 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-xl flex items-center justify-center shadow-lg">
                <Rocket className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">StartupDeck AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Self-Hosted • Privacy-First</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/analyze">
                <Button
                  variant="outline"
                  className="border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white transition-all duration-200"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Business Validation
                </Button>
              </Link>

              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-[#145da0]/10 to-[#2e8bc0]/10 rounded-lg px-3 py-2">
                    <User className="h-4 w-4 text-[#145da0]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</span>
                    <Badge variant="secondary" className="bg-[#145da0] text-white text-xs">
                      {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => signOutMutation.mutate()}
                    className="p-3 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors"
                    disabled={signOutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 text-gray-600 hover:text-red-600" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAuthModal(true)}
                  className="border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white transition-all duration-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}

              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-gray-600">
                  {isConnected ? 'Ollama Connected' : 'Ollama Disconnected'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sparkles className="text-white text-3xl" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Validate & Build{" "}
            <span className="bg-gradient-to-r from-[#145da0] via-[#2e8bc0] to-[#b1d4e0] bg-clip-text text-transparent">
              Winning Startups
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            AI-powered business validation, market analysis, and pitch deck generation. 
            Completely self-hosted with open-source LLMs - no API keys, no data sharing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/analyze">
              <Button size="lg" className="bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] hover:shadow-xl transition-all duration-200 text-lg px-8 py-3 text-white">
                <BarChart3 className="mr-2 h-5 w-5" />
                Validate Business Idea
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white transition-all duration-200 text-lg px-8 py-3">
              <Rocket className="mr-2 h-5 w-5" />
              Generate Pitch Deck
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-[#2e8bc0]" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-[#145da0]" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-[#b1d4e0]" />
              <span>No API Keys</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#b1d4e0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-[#145da0] h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Validation Score</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get 0-100 viability scores based on comprehensive market analysis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#2e8bc0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-[#2e8bc0] h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Market Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                TAM/SAM/SOM calculations and competitive landscape insights
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#145da0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#0c2d48] h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Audience Research</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detailed customer personas and market segmentation analysis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-gray-700/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#b1d4e0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-[#2e8bc0] h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pitch Decks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Professional investor-ready presentations with export options
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Transform your business ideas into validated opportunities in minutes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe Your Idea</h3>
              <p className="text-gray-600">
                Enter your business concept, problem statement, or market opportunity
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-1/2"></div>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI evaluates market size, competition, target audience, and business model
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-green-500 transform translate-x-1/2"></div>
            </div>

            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive validation scores, strategic insights, and optional pitch deck
              </p>
            </div>
          </div>
        </div>

        {/* Legacy Pitch Deck Generator - Keep for backward compatibility */}
        <div className="bg-white/30 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Pitch Deck Generator</h2>
            <p className="text-gray-600">
              Generate a pitch deck directly from a problem or keyword
            </p>
          </div>
          
          <PitchDeckGenerator
            settings={settings}
            onDeckGenerated={handleDeckGenerated}
            isConnected={isConnected}
          />
        </div>

        {/* Generated Deck Display */}
        {generatedDeck && (
          <PitchDeckDisplay deck={generatedDeck} />
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Validate Your Next Big Idea?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the entrepreneurs using AI to build better businesses. 
              Start with comprehensive validation and analysis.
            </p>
            <Link href="/analyze">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-200 text-lg px-8 py-3">
                <BarChart3 className="mr-2 h-5 w-5" />
                Start Validation Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsSaved}
        availableModels={ollamaStatus?.models || []}
      />

      {/* Authentication Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Join StartupDeck AI"
        description="Sign up to unlock unlimited business validations and pitch deck generations"
      />
    </div>
  );
}
