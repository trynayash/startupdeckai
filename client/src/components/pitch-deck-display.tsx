import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PitchDeckData } from "@shared/schema";
import { 
  Copy, 
  Share2, 
  Download, 
  Save, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Code, 
  Users, 
  Presentation,
  RefreshCw
} from "lucide-react";

interface PitchDeckDisplayProps {
  deck: PitchDeckData;
}

export function PitchDeckDisplay({ deck }: PitchDeckDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copied!",
        description: `${sectionName} section copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const saveDeck = () => {
    const savedDecks = JSON.parse(localStorage.getItem('saved-pitch-decks') || '[]');
    const existingIndex = savedDecks.findIndex((d: PitchDeckData) => d.id === deck.id);
    
    if (existingIndex >= 0) {
      savedDecks[existingIndex] = deck;
    } else {
      savedDecks.unshift(deck);
    }
    
    localStorage.setItem('saved-pitch-decks', JSON.stringify(savedDecks.slice(0, 10)));
    toast({
      title: "Saved!",
      description: "Pitch deck saved to your local storage.",
    });
  };

  const shareDeck = async () => {
    const shareData = {
      title: deck.startupName,
      text: `Check out this startup idea: ${deck.startupName} - ${deck.problem}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        await copyToClipboard(JSON.stringify(deck, null, 2), "deck data");
      }
    } else {
      await copyToClipboard(JSON.stringify(deck, null, 2), "deck data");
    }
  };

  const exportToPDF = async () => {
    try {
      // Import jspdf dynamically to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Title page
      doc.setFontSize(24);
      doc.text(deck.startupName, 20, 30);
      doc.setFontSize(14);
      doc.text(deck.summary, 20, 50, { maxWidth: 170 });
      
      // Add sections
      let yPosition = 80;
      const sections = [
        { title: 'Problem', content: deck.problem },
        { title: 'Solution', content: deck.solution },
        { title: 'Market Size', content: `TAM: ${deck.marketSize.tam}, SAM: ${deck.marketSize.sam}, SOM: ${deck.marketSize.som}` },
        { title: 'Business Model', content: deck.businessModel.map(bm => `${bm.name}: ${bm.description}`).join('\n') },
        { title: 'Tech Stack', content: deck.techStack.map(tech => tech.name).join(', ') },
        { title: 'Team', content: deck.team.map(member => `${member.role}: ${member.description}`).join('\n') }
      ];

      sections.forEach((section) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text(section.title, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(section.content, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 10;
      });
      
      doc.save(`${deck.startupName}-pitch-deck.pdf`);
      toast({
        title: "PDF Exported!",
        description: "Your pitch deck has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const regenerateSection = (sectionName: string) => {
    toast({
      title: "Coming Soon",
      description: `Regenerating individual sections will be available in a future update.`,
    });
  };

  return (
    <div id="generated-deck" className="animate-fade-in">
      {/* Deck Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {deck.startupName}
                </h3>
                <p className="text-gray-600">
                  Generated on {new Date(deck.generatedAt).toLocaleString()}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                <Button onClick={saveDeck} className="bg-primary hover:bg-blue-600 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button onClick={shareDeck} className="bg-green-500 hover:bg-green-600 text-white">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button onClick={exportToPDF} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pitch Deck Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Problem Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="text-red-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Problem</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(deck.problem, "Problem")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {deck.problem}
            </p>
          </CardContent>
        </Card>

        {/* Solution Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="text-green-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Solution</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(deck.solution, "Solution")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {deck.solution}
            </p>
          </CardContent>
        </Card>

        {/* Market Size Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-blue-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Market Size</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  `TAM: ${deck.marketSize.tam}\nSAM: ${deck.marketSize.sam}\nSOM: ${deck.marketSize.som}\n\n${deck.marketSize.description}`, 
                  "Market Size"
                )}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">TAM:</span>
                <span className="font-semibold text-gray-900">{deck.marketSize.tam}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SAM:</span>
                <span className="font-semibold text-gray-900">{deck.marketSize.sam}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SOM:</span>
                <span className="font-semibold text-primary">{deck.marketSize.som}</span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {deck.marketSize.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Model Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-purple-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Business Model</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  deck.businessModel.map(bm => `${bm.name}: ${bm.description}${bm.revenue ? ` (${bm.revenue})` : ''}`).join('\n\n'),
                  "Business Model"
                )}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {deck.businessModel.map((model, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-1">{model.name}</h5>
                  <p className="text-sm text-gray-600">{model.description}</p>
                  {model.revenue && (
                    <p className="text-sm text-purple-600 font-medium mt-1">{model.revenue}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Code className="text-indigo-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Tech Stack</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  deck.techStack.map(tech => `${tech.name} (${tech.category})`).join('\n'),
                  "Tech Stack"
                )}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {deck.techStack.map((tech, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">
                    {/* Simple icon mapping */}
                    {tech.name.toLowerCase().includes('react') && '⚛️'}
                    {tech.name.toLowerCase().includes('python') && '🐍'}
                    {tech.name.toLowerCase().includes('node') && '🟢'}
                    {tech.name.toLowerCase().includes('database') && '🗄️'}
                    {tech.name.toLowerCase().includes('aws') && '☁️'}
                    {!['react', 'python', 'node', 'database', 'aws'].some(t => tech.name.toLowerCase().includes(t)) && '⚙️'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                  <p className="text-xs text-gray-500">{tech.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Users className="text-amber-600 h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Team</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  deck.team.map(member => `${member.role}: ${member.description}`).join('\n\n'),
                  "Team"
                )}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {deck.team.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {member.initials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card (spans full width) */}
        <Card className="md:col-span-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow animate-slide-up">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Presentation className="text-white text-lg" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Executive Summary</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(deck.summary, "Executive Summary")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {deck.summary}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Actions */}
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <RefreshCw className="text-primary text-lg" />
                <div>
                  <h4 className="font-medium text-gray-900">Regenerate sections</h4>
                  <p className="text-sm text-gray-600">Refine individual components</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateSection("problem")}
                  className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                >
                  Problem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateSection("solution")}
                  className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                >
                  Solution
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateSection("market")}
                  className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                >
                  Market
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateSection("business")}
                  className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                >
                  Business Model
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
