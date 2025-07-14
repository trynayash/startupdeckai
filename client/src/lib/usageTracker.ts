// Usage tracking for anonymous and authenticated users
export interface UsageLimit {
  validations: number;
  pitchDecks: number;
  maxValidations: number;
  maxPitchDecks: number;
}

export interface UserTier {
  name: 'free' | 'anonymous' | 'pro' | 'enterprise';
  maxValidations: number;
  maxPitchDecks: number;
}

const USER_TIERS: Record<UserTier['name'], UserTier> = {
  anonymous: { name: 'anonymous', maxValidations: 1, maxPitchDecks: 1 },
  free: { name: 'free', maxValidations: 5, maxPitchDecks: 3 },
  pro: { name: 'pro', maxValidations: 50, maxPitchDecks: 25 },
  enterprise: { name: 'enterprise', maxValidations: -1, maxPitchDecks: -1 }, // unlimited
};

const USAGE_STORAGE_KEY = 'startupdeck-usage';

export class UsageTracker {
  private isAuthenticated: boolean;
  private userTier: UserTier['name'];

  constructor(isAuthenticated: boolean = false, userTier: UserTier['name'] = 'anonymous') {
    this.isAuthenticated = isAuthenticated;
    this.userTier = userTier;
  }

  // Get current usage from localStorage for anonymous users
  private getAnonymousUsage(): UsageLimit {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!stored) {
      return {
        validations: 0,
        pitchDecks: 0,
        maxValidations: USER_TIERS.anonymous.maxValidations,
        maxPitchDecks: USER_TIERS.anonymous.maxPitchDecks,
      };
    }

    try {
      const parsed = JSON.parse(stored);
      return {
        validations: parsed.validations || 0,
        pitchDecks: parsed.pitchDecks || 0,
        maxValidations: USER_TIERS.anonymous.maxValidations,
        maxPitchDecks: USER_TIERS.anonymous.maxPitchDecks,
      };
    } catch {
      return {
        validations: 0,
        pitchDecks: 0,
        maxValidations: USER_TIERS.anonymous.maxValidations,
        maxPitchDecks: USER_TIERS.anonymous.maxPitchDecks,
      };
    }
  }

  // Save usage to localStorage for anonymous users
  private saveAnonymousUsage(usage: Partial<UsageLimit>): void {
    const current = this.getAnonymousUsage();
    const updated = {
      validations: usage.validations ?? current.validations,
      pitchDecks: usage.pitchDecks ?? current.pitchDecks,
    };
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  }

  // Check if user can perform an action
  canPerformAction(action: 'validation' | 'pitchDeck'): boolean {
    if (!this.isAuthenticated) {
      const usage = this.getAnonymousUsage();
      if (action === 'validation') {
        return usage.validations < usage.maxValidations;
      } else {
        return usage.pitchDecks < usage.maxPitchDecks;
      }
    }

    // For authenticated users, check against their tier
    const tier = USER_TIERS[this.userTier];
    if (tier.maxValidations === -1 || tier.maxPitchDecks === -1) {
      return true; // unlimited
    }

    // TODO: Implement database-based usage tracking for authenticated users
    return true; // For now, allow authenticated users
  }

  // Record usage of an action
  recordUsage(action: 'validation' | 'pitchDeck'): void {
    if (!this.isAuthenticated) {
      const usage = this.getAnonymousUsage();
      if (action === 'validation') {
        usage.validations += 1;
      } else {
        usage.pitchDecks += 1;
      }
      this.saveAnonymousUsage(usage);
    } else {
      // TODO: Implement database-based usage tracking for authenticated users
    }
  }

  // Get current usage status
  getUsageStatus(): UsageLimit {
    if (!this.isAuthenticated) {
      return this.getAnonymousUsage();
    }

    // For authenticated users, return their tier limits
    const tier = USER_TIERS[this.userTier];
    return {
      validations: 0, // TODO: Get from database
      pitchDecks: 0, // TODO: Get from database
      maxValidations: tier.maxValidations,
      maxPitchDecks: tier.maxPitchDecks,
    };
  }

  // Check if user has exceeded limits and needs to authenticate
  requiresAuthentication(action: 'validation' | 'pitchDeck'): boolean {
    return !this.isAuthenticated && !this.canPerformAction(action);
  }

  // Get user tier information
  getUserTier(): UserTier {
    return USER_TIERS[this.userTier];
  }

  // Clear anonymous usage (useful for testing or reset)
  clearAnonymousUsage(): void {
    localStorage.removeItem(USAGE_STORAGE_KEY);
  }
}

// Hook for React components
export function useUsageTracker(isAuthenticated: boolean = false, userTier: UserTier['name'] = 'anonymous') {
  return new UsageTracker(isAuthenticated, userTier);
}