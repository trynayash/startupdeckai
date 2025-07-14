// OAuth Provider configurations and utilities
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  authUrl: string;
  scopes: string[];
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    icon: 'Chrome',
    color: '#EA4335',
    authUrl: '/api/auth/google',
    scopes: ['openid', 'email', 'profile']
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'Github',
    color: '#333333',
    authUrl: '/api/auth/github',
    scopes: ['user:email']
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    authUrl: '/api/auth/twitter',
    scopes: ['users.read', 'tweet.read']
  }
};

// OAuth state management for security
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function storeOAuthState(state: string): void {
  sessionStorage.setItem('oauth_state', state);
}

export function verifyOAuthState(state: string): boolean {
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return storedState === state;
}

// OAuth redirect URL builder
export function buildOAuthUrl(provider: OAuthProvider, redirectUri: string): string {
  const state = generateOAuthState();
  storeOAuthState(state);
  
  const params = new URLSearchParams({
    state,
    redirect_uri: redirectUri,
    scopes: provider.scopes.join(' ')
  });
  
  return `${provider.authUrl}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleOAuthCallback(
  provider: string, 
  code: string, 
  state: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    if (!verifyOAuthState(state)) {
      throw new Error('Invalid OAuth state');
    }

    const response = await fetch(`/api/auth/${provider}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'OAuth authentication failed');
    }

    return { success: true, sessionId: data.sessionId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// OAuth provider utilities
export function getProviderIcon(providerId: string): string {
  return oauthProviders[providerId]?.icon || 'User';
}

export function getProviderColor(providerId: string): string {
  return oauthProviders[providerId]?.color || '#6B7280';
}

export function isOAuthProvider(providerId: string): boolean {
  return providerId in oauthProviders;
}