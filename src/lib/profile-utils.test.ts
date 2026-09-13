import { describe, expect, test } from 'bun:test';
import {
  claimPendingProfile,
  getIncompleteProfileStep,
  type PendingProfileRecord,
} from './profile-utils';

const draft: PendingProfileRecord = {
  version: 1,
  profile: { name: 'Purin', birthDate: '2000-01-01', gender: 'female' },
  provider: 'twitter',
  userId: null,
};

describe('provider-bound onboarding drafts', () => {
  test('the provider selected for OAuth can claim its draft', () => {
    expect(claimPendingProfile(draft, 'x-user', 'twitter')).toEqual({
      ...draft,
      userId: 'x-user',
    });
  });

  test('Google cannot consume a draft created for X', () => {
    expect(claimPendingProfile(draft, 'google-user', 'google')).toBeNull();
  });

  test('a claimed draft cannot move to another user of the same provider', () => {
    const claimed = { ...draft, userId: 'first-x-user' };
    expect(claimPendingProfile(claimed, 'second-x-user', 'twitter')).toBeNull();
  });

  test('the owner can resume a claimed partial draft', () => {
    const claimed = { ...draft, userId: 'first-x-user' };
    expect(claimPendingProfile(claimed, 'first-x-user', 'twitter')).toEqual(claimed);
  });

  test('legacy unscoped browser data is rejected', () => {
    expect(claimPendingProfile(draft.profile, 'x-user', 'twitter')).toBeNull();
  });

  test('a pre-auth draft cannot be claimed without the returned provider', () => {
    expect(claimPendingProfile(draft, 'x-user', null)).toBeNull();
  });

  test('malformed envelopes are rejected', () => {
    expect(claimPendingProfile({ version: 1, provider: 'twitter' }, 'x-user', 'twitter')).toBeNull();
    expect(claimPendingProfile({ ...draft, version: 2 }, 'x-user', 'twitter')).toBeNull();
    expect(claimPendingProfile('not-an-envelope', 'x-user', 'twitter')).toBeNull();
  });
});

describe('partial profile resume step', () => {
  test('starts at name for an empty or nameless draft', () => {
    expect(getIncompleteProfileStep({})).toBe('name');
    expect(getIncompleteProfileStep({ birthDate: '2000-01-01T00:00:00.000Z' })).toBe('name');
  });

  test('resumes at birth date after name', () => {
    expect(getIncompleteProfileStep({ name: 'Purin' })).toBe('birthDate');
  });

  test('resumes at gender after name and birth date', () => {
    expect(getIncompleteProfileStep({
      name: 'Purin',
      birthDate: '2000-01-01T00:00:00.000Z',
    })).toBe('gender');
  });

  test('returns no missing step for a complete required profile', () => {
    expect(getIncompleteProfileStep(draft.profile)).toBeNull();
  });
});
