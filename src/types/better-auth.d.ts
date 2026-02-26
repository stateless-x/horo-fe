/**
 * Better Auth Type Extensions
 *
 * Extends Better Auth types to include custom fields we've added to the user schema
 */

import 'better-auth/react';

declare module 'better-auth/react' {
  interface Session {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null;
      onboardingCompleted?: boolean;
    };
  }
}
