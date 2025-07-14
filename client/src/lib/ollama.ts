export interface OllamaStatus {
  status: 'connected' | 'disconnected';
  models?: Array<{ name: string; size: number }>;
  error?: string;
}

export async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      return {
        status: 'disconnected',
        error: data.error || 'Unknown error'
      };
    }
  } catch (error) {
    return {
      status: 'disconnected',
      error: 'Failed to connect to Ollama service'
    };
  }
}

export async function generatePitchDeck(prompt: string, model: string = 'llama3.2') {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate pitch deck');
  }

  return data;
}
