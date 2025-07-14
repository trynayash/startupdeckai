// Usage tracking and tier management system
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

const userTiers: Record<UserTier['name'], UserTier> = {
  anonymous: {
    name: 'anonymous',
    maxValidations: 1,
    maxPitchDecks: 1,
  },
  free: {
    name: 'free',
    maxValidations: 5,
    maxPitchDecks: 3,
  },
  pro: {
    name: 'pro',
    maxValidations: 50,
    maxPitchDecks: 25,
  },
  enterprise: {
    name: 'enterprise',
    maxValidations: -1, // unlimited
    maxPitchDecks: -1, // unlimited
  },
};

export class UsageTracker {
  private isAuthenticated: boolean;
  private userTier: UserTier['name'];

  constructor(isAuthenticated: boolean = false, userTier: UserTier['name'] = 'anonymous') {
    this.isAuthenticated = isAuthenticated;
    this.userTier = userTier;
  }

  private getAnonymousUsage(): UsageLimit {
    const saved = localStorage.getItem('anonymous-usage');
    const defaultUsage = {
      validations: 0,
      pitchDecks: 0,
      maxValidations: userTiers.anonymous.maxValidations,
      maxPitchDecks: userTiers.anonymous.maxPitchDecks,
    };
    
    if (!saved) {
      return defaultUsage;
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultUsage,
        ...parsed,
      };
    } catch {
      return defaultUsage;
    }
  }

  private saveAnonymousUsage(usage: Partial<UsageLimit>): void {
    const current = this.getAnonymousUsage();
    const updated = { ...current, ...usage };
    localStorage.setItem('anonymous-usage', JSON.stringify(updated));
  }

  canPerformAction(action: 'validation' | 'pitchDeck'): boolean {
    if (this.isAuthenticated) {
      // For authenticated users, usage is managed server-side
      // This would typically be checked via an API call
      return true; // Simplified for now
    }

    const usage = this.getAnonymousUsage();
    if (action === 'validation') {
      return usage.validations < usage.maxValidations;
    } else {
      return usage.pitchDecks < usage.maxPitchDecks;
    }
  }

  recordUsage(action: 'validation' | 'pitchDeck'): void {
    if (this.isAuthenticated) {
      // For authenticated users, usage is recorded server-side
      return;
    }

    const usage = this.getAnonymousUsage();
    if (action === 'validation') {
      this.saveAnonymousUsage({ validations: usage.validations + 1 });
    } else {
      this.saveAnonymousUsage({ pitchDecks: usage.pitchDecks + 1 });
    }
  }

  getUsageStatus(): UsageLimit {
    if (this.isAuthenticated) {
      const tier = userTiers[this.userTier];
      return {
        validations: 0, // Would be fetched from server
        pitchDecks: 0, // Would be fetched from server
        maxValidations: tier.maxValidations,
        maxPitchDecks: tier.maxPitchDecks,
      };
    }

    return this.getAnonymousUsage();
  }

  requiresAuthentication(action: 'validation' | 'pitchDeck'): boolean {
    return !this.canPerformAction(action);
  }

  getUserTier(): UserTier {
    return userTiers[this.userTier];
  }

  clearAnonymousUsage(): void {
    localStorage.removeItem('anonymous-usage');
  }
}

// React hook for usage tracking
export function useUsageTracker(isAuthenticated: boolean = false, userTier: UserTier['name'] = 'anonymous') {
  return new UsageTracker(isAuthenticated, userTier);
}