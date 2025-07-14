import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PitchDeckGenerator } from "@/components/pitch-deck-generator";
import { PitchDeckDisplay } from "@/components/pitch-deck-display";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { checkOllamaStatus } from "@/lib/ollama";
import { PitchDeckData, OllamaSettings } from "@shared/schema";
import { Settings, Rocket } from "lucide-react";

export default function Home() {
  const [generatedDeck, setGeneratedDeck] = useState<PitchDeckData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<OllamaSettings>(() => {
    const saved = localStorage.getItem('ollama-settings');
    return saved ? JSON.parse(saved) : {
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
      autoSave: true
    };
  });

  const { toast } = useToast();

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

  const isConnected = ollamaStatus?.status === 'connected';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <Rocket className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StartupDeck AI</h1>
                <p className="text-xs text-gray-500">Self-Hosted • Privacy-First</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Your Next{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Startup Idea
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by self-hosted open-source LLMs. No API keys, no data sharing, completely free and private.
          </p>
        </div>

        {/* Pitch Deck Generator */}
        <PitchDeckGenerator
          settings={settings}
          onDeckGenerated={handleDeckGenerated}
          isConnected={isConnected}
        />

        {/* Generated Deck Display */}
        {generatedDeck && (
          <PitchDeckDisplay deck={generatedDeck} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsSaved}
        availableModels={ollamaStatus?.models || []}
      />
    </div>
  );
}
