import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generatePitchDeck } from "@/lib/ollama";
import { getRandomPrompt } from "@/lib/pitch-prompts";
import { PitchDeckData, OllamaSettings } from "@shared/schema";
import { Sparkles, Lightbulb, Loader2, Dice1 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, "Please enter a problem or keyword"),
});

interface PitchDeckGeneratorProps {
  settings: OllamaSettings;
  onDeckGenerated: (deck: PitchDeckData) => void;
  isConnected: boolean;
}

export function PitchDeckGenerator({ settings, onDeckGenerated, isConnected }: PitchDeckGeneratorProps) {
  const [savedDecks, setSavedDecks] = useState<PitchDeckData[]>(() => {
    return JSON.parse(localStorage.getItem('saved-pitch-decks') || '[]');
  });

  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: ({ prompt }: { prompt: string }) => 
      generatePitchDeck(prompt, settings.model),
    onSuccess: (data) => {
      onDeckGenerated(data.pitchDeck);
      form.reset();
      
      // Scroll to the generated deck
      setTimeout(() => {
        const deckElement = document.getElementById('generated-deck');
        if (deckElement) {
          deckElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Please ensure Ollama is running and connected.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate(values);
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt();
    form.setValue("prompt", randomPrompt);
    
    // Add visual feedback
    const input = document.querySelector('input[name="prompt"]') as HTMLInputElement;
    if (input) {
      input.classList.add('ring-2', 'ring-accent');
      setTimeout(() => {
        input.classList.remove('ring-2', 'ring-accent');
      }, 1000);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('saved-pitch-decks');
    setSavedDecks([]);
    toast({
      title: "History cleared",
      description: "All saved pitch decks have been removed.",
    });
  };

  const loadDeck = (deck: PitchDeckData) => {
    onDeckGenerated(deck);
    setTimeout(() => {
      const deckElement = document.getElementById('generated-deck');
      if (deckElement) {
        deckElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = savedDecks.filter(deck => deck.id !== deckId);
    setSavedDecks(updatedDecks);
    localStorage.setItem('saved-pitch-decks', JSON.stringify(updatedDecks));
    toast({
      title: "Deck deleted",
      description: "The pitch deck has been removed from your history.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Input Section */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                What problem or market would you like to explore?
              </Label>
              <div className="relative">
                <Input
                  id="prompt"
                  {...form.register("prompt")}
                  placeholder="e.g., 'Remote work productivity' or 'Sustainable food delivery'"
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Lightbulb className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {form.formState.errors.prompt && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.prompt.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={generateMutation.isPending || !isConnected}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-200"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Pitch Deck
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSurpriseMe}
                className="sm:w-auto border-2 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Dice1 className="mr-2 h-4 w-4" />
                Surprise Me
              </Button>
            </div>
          </form>

          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-3 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-gray-600">Generating your startup idea...</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Decks Section */}
      {savedDecks.length > 0 && (
        <Card className="bg-white/50 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Recent Generations</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-3">
              {savedDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{deck.startupName}</h4>
                    <p className="text-sm text-gray-500">{deck.originalPrompt}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(deck.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadDeck(deck)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDeck(deck.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
