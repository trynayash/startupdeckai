import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BusinessValidation } from "@shared/schema";
import { PitchDeckDisplay } from "@/components/pitch-deck-display";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Code,
  Shield,
  Lightbulb,
  BarChart3
} from "lucide-react";

export default function Result() {
  const [validation, setValidation] = useState<BusinessValidation | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('latest-validation');
    if (stored) {
      try {
        setValidation(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse validation data:', error);
        setLocation('/analyze');
      }
    } else {
      setLocation('/analyze');
    }
  }, [setLocation]);

  const getRecommendationConfig = (recommendation: string) => {
    switch (recommendation) {
      case 'go':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          badge: 'bg-green-500',
          label: 'GO',
          message: 'Strong business opportunity - proceed with development'
        };
      case 'wait':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          badge: 'bg-yellow-500',
          label: 'WAIT',
          message: 'Promising but needs refinement before proceeding'
        };
      case 'pivot':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          badge: 'bg-red-500',
          label: 'PIVOT',
          message: 'Consider significant changes or alternative approaches'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          badge: 'bg-gray-500',
          label: 'UNKNOWN',
          message: 'Unable to determine recommendation'
        };
    }
  };

  const exportToJSON = () => {
    if (!validation) return;
    
    const dataStr = JSON.stringify(validation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${validation.startupName.replace(/\s+/g, '-').toLowerCase()}-validation.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Exported!",
      description: "Validation data exported as JSON file.",
    });
  };

  const shareResults = async () => {
    if (!validation) return;

    const shareText = `${validation.startupName} - Validation Score: ${validation.validationScore}%\nRecommendation: ${validation.recommendation.toUpperCase()}\n\nGenerated with StartupDeck AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: validation.startupName,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Results copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (!validation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No validation data found</h2>
          <p className="text-gray-600 mb-4">Please validate a business idea first.</p>
          <Link href="/analyze">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              Start Analysis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const recommendation = getRecommendationConfig(validation.recommendation);
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/analyze">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{validation.startupName}</h1>
                <p className="text-sm text-gray-500">Validation Results</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={shareResults} variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button onClick={exportToJSON} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Validation Score */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Validation Score</h3>
                <Badge className={`${recommendation.badge} text-white`}>
                  {validation.validationScore}%
                </Badge>
              </div>
              <Progress value={validation.validationScore} className="mb-4" />
              <p className="text-sm text-gray-600">
                Overall business viability based on market analysis, competition, and execution feasibility.
              </p>
            </CardContent>
          </Card>

          {/* Confidence Level */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Confidence</h3>
                <Badge variant="outline">
                  {validation.confidence}%
                </Badge>
              </div>
              <Progress value={validation.confidence} className="mb-4" />
              <p className="text-sm text-gray-600">
                How confident the AI analysis is based on available data and market clarity.
              </p>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className={`backdrop-blur-sm shadow-lg border-gray-200/50 ${recommendation.bg}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${recommendation.bg} rounded-xl flex items-center justify-center`}>
                  <RecommendationIcon className={`${recommendation.color} h-5 w-5`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recommendation</h3>
                  <Badge className={`${recommendation.badge} text-white text-sm`}>
                    {recommendation.label}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {recommendation.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Problem-Solution Fit */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Target className="text-red-600 h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Problem-Solution Fit</h4>
                </div>
                <Badge variant="outline">{validation.analysis.problemSolutionFit.score}%</Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Key Insights</h5>
                  <ul className="space-y-1">
                    {validation.analysis.problemSolutionFit.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {validation.analysis.problemSolutionFit.concerns.length > 0 && (
                  <div>
                    <h5 className="font-medium text-orange-700 mb-2">Concerns</h5>
                    <ul className="space-y-1">
                      {validation.analysis.problemSolutionFit.concerns.map((concern, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Size */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-blue-600 h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Market Size</h4>
                </div>
                <Badge variant="outline">{validation.analysis.marketSize.score}%</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">TAM:</span>
                  <span className="font-semibold text-gray-900">{validation.analysis.marketSize.tam}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SAM:</span>
                  <span className="font-semibold text-gray-900">{validation.analysis.marketSize.sam}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SOM:</span>
                  <span className="font-semibold text-primary">{validation.analysis.marketSize.som}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                  {validation.analysis.marketSize.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600 h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Target Audience</h4>
                </div>
                <Badge variant="outline">{validation.analysis.targetAudience.score}%</Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Primary:</span>
                  <p className="text-gray-600">{validation.analysis.targetAudience.primary}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Secondary:</span>
                  <p className="text-gray-600">{validation.analysis.targetAudience.secondary}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Demographics:</span>
                  <p className="text-gray-600">{validation.analysis.targetAudience.demographics}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Psychographics:</span>
                  <p className="text-gray-600">{validation.analysis.targetAudience.psychographics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Model */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-green-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Business Model</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Primary Revenue:</span>
                  <p className="text-gray-600">{validation.analysis.businessModel.primaryRevenue}</p>
                </div>
                
                {validation.analysis.businessModel.secondaryRevenue.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Secondary Revenue:</span>
                    <ul className="text-sm text-gray-600 mt-1">
                      {validation.analysis.businessModel.secondaryRevenue.map((revenue, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{revenue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <span className="text-xs text-gray-500">Scalability</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={validation.analysis.businessModel.scalability} className="flex-1" />
                      <span className="text-sm font-medium">{validation.analysis.businessModel.scalability}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Feasibility</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={validation.analysis.businessModel.feasibility} className="flex-1" />
                      <span className="text-sm font-medium">{validation.analysis.businessModel.feasibility}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SWOT Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="text-green-600 h-5 w-5" />
                <h4 className="font-semibold text-green-900">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {validation.analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-800">{strength}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="text-red-600 h-5 w-5" />
                <h4 className="font-semibold text-red-900">Weaknesses</h4>
              </div>
              <ul className="space-y-2">
                {validation.analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-red-800">{weakness}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="text-blue-600 h-5 w-5" />
                <h4 className="font-semibold text-blue-900">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {validation.analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="text-sm text-blue-800">{opportunity}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="text-orange-600 h-5 w-5" />
                <h4 className="font-semibold text-orange-900">Risks</h4>
              </div>
              <ul className="space-y-2">
                {validation.analysis.risks.map((risk, index) => (
                  <li key={index} className="text-sm text-orange-800">{risk}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pitch Deck */}
        {validation.pitchDeck && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Pitch Deck</h2>
            <PitchDeckDisplay deck={validation.pitchDeck} />
          </div>
        )}

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ready for the Next Step?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Based on your validation results, consider diving deeper into market research, 
              building an MVP, or refining your business model.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/analyze">
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  Analyze Another Idea
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Review Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}