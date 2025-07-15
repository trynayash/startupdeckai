import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedAuthModal } from "@/components/enhanced-auth-modal";
import { 
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
  Star,
  Play,
  Globe,
  Brain,
  Lightbulb,
  Database,
  Lock
} from "lucide-react";
import { Github } from "lucide-react";

// Modern SaaS-style loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#145da0] via-[#2e8bc0] to-[#b1d4e0] animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 mb-8 flex items-center justify-center bg-white/20 rounded-full shadow-lg animate-spin-slow">
          <Rocket className="w-12 h-12 text-[#145da0] animate-bounce" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">StartupDeckAI</h1>
        <p className="text-lg text-white/80 mb-4">Validating your next big idea...</p>
        <div className="w-32 h-2 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800); // 1.8s loading
    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = () => {
    // Redirect to home page after successful authentication
    window.location.href = '/';
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section with Freepik-inspired Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-bounce"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">StartupDeck AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Self-Hosted • Privacy-First</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white transition-all duration-200"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] text-white"
              >
                Get Started Free
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-[#145da0]/10 to-[#2e8bc0]/10 text-[#145da0] border-[#145da0]/20">
              <Sparkles className="w-4 h-4 mr-2" />
              100% Open Source • Privacy-First AI
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Validate Your Startup Ideas with{" "}
              <span className="bg-gradient-to-r from-[#145da0] to-[#2e8bc0] bg-clip-text text-transparent">
                AI-Powered Insights
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get comprehensive business validation, market analysis, and professional pitch decks 
              using cutting-edge open-source LLMs. All processing happens locally - your data never leaves your server.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] text-white text-lg px-8 py-4 h-auto"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Validating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/analyze">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#145da0] text-[#145da0] hover:bg-[#145da0] hover:text-white text-lg px-8 py-4 h-auto"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Try Demo (1 Free)
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Privacy-First</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Self-Hosted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-purple-500" />
                <span>No Data Sharing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-orange-500" />
                <span>100% Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Validate & Pitch
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From idea validation to investor-ready pitch decks, our AI-powered platform handles it all
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Business Validation */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Business Validation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Comprehensive analysis with scoring, market sizing, competition research, and SWOT analysis.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Market Size Analysis (TAM/SAM/SOM)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Competition Research</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risk Assessment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pitch Deck Generation */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Pitch Deck Creation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Professional, investor-ready pitch decks generated from your business validation results.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Problem-Solution Fit</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Business Model Canvas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Financial Projections</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy-First AI
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  All AI processing happens locally using open-source LLMs. Your sensitive business data never leaves your server.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Local LLM Processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No External API Calls</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Complete Data Control</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Anonymous */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Try It Out</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Free</div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Perfect for testing our platform</p>
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1 business validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1 pitch deck generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No sign-up required</span>
                  </li>
                </ul>
                <Link href="/analyze">
                  <Button className="w-full" variant="outline">
                    Try Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Free Account */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-[#145da0] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#145da0] text-white">Most Popular</Badge>
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free Account</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">$0<span className="text-sm font-normal">/month</span></div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Great for entrepreneurs and small teams</p>
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5 business validations/month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">3 pitch deck generations/month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Save and organize your projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">All privacy features included</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-[#145da0] to-[#2e8bc0] hover:from-[#0c2d48] hover:to-[#145da0] text-white"
                  onClick={() => setShowAuthModal(true)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Self-Hosted */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Self-Hosted</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Unlimited</div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Deploy on your own infrastructure</p>
                <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited everything</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">100% data ownership</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom model integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Enterprise security</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Validate Your Next Big Idea?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join entrepreneurs worldwide who trust StartupDeck AI for privacy-first business validation
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-[#145da0] hover:bg-gray-100 text-lg px-8 py-4 h-auto"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Link href="/analyze">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#145da0] text-lg px-8 py-4 h-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                Try Demo First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      <EnhancedAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Join StartupDeck AI"
        description="Start validating your business ideas with AI-powered insights"
      />
    </div>
  );
}