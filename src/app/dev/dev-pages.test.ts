import { afterEach, describe, expect, test } from 'bun:test';
import DevHubPage from './page';
import DevToolPage from './[tool]/page';

/**
 * The /dev pages drive real DeepSeek calls through the backend's dev routes.
 * They must 404 in a production build; notFound() from a server component is
 * what makes that true (a client-side check would still serve a 200 shell).
 */
const env = process.env as Record<string, string | undefined>;
const REAL_NODE_ENV = env.NODE_ENV;

afterEach(() => {
  env.NODE_ENV = REAL_NODE_ENV;
});

async function notFoundDigest(render: () => unknown): Promise<string | undefined> {
  try {
    await render();
  } catch (error) {
    return (error as { digest?: string }).digest;
  }
  return undefined;
}

describe('/dev pages', () => {
  test('the hub calls notFound() in production', async () => {
    env.NODE_ENV = 'production';
    expect(await notFoundDigest(() => DevHubPage())).toBe('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  test('a tool page calls notFound() in production, before reading params', async () => {
    env.NODE_ENV = 'production';
    const params = Promise.resolve({ tool: 'compatibility' });
    expect(await notFoundDigest(() => DevToolPage({ params }))).toBe('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  test('an unknown tool is a 404 outside production too', async () => {
    env.NODE_ENV = 'development';
    const params = Promise.resolve({ tool: 'no-such-generator' });
    expect(await notFoundDigest(() => DevToolPage({ params }))).toBe('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  test('the hub renders outside production', async () => {
    env.NODE_ENV = 'development';
    expect(await notFoundDigest(() => DevHubPage())).toBeUndefined();
  });
});
