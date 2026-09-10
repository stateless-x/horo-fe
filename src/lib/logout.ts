interface LogoutSteps {
  revokeSession: () => Promise<void>;
  clearClientState: () => void;
  navigateToLogin: () => void;
}

/**
 * Keep logout ordered: do not erase recoverable client data or leave the
 * protected screen until the server has invalidated the current session.
 */
export async function performLogout({
  revokeSession,
  clearClientState,
  navigateToLogin,
}: LogoutSteps): Promise<void> {
  await revokeSession();
  try {
    clearClientState();
  } finally {
    // Once the server credential is gone, never leave the user stranded on a
    // protected page because optional browser cleanup failed.
    navigateToLogin();
  }
}
