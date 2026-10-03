import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeSetting } from '@/components/ui/theme-toggle';

const source = (path: string) => Bun.file(new URL(path, import.meta.url)).text();

describe('theme control lives on settings, not in the header', () => {
  test('the header and its menu carry no theme toggle', async () => {
    const header = await source('./app-header.tsx');
    expect(header).not.toContain('สลับโหมดสี');
    expect(header).not.toContain('ThemeToggle');
    expect(header).not.toContain('setTheme');
  });

  test('the menu puts the wallet row just above ตั้งค่า', async () => {
    const header = await source('./app-header.tsx');
    expect(header).toMatch(/key === SETTINGS_TAB\.key && \(\s*<WalletMenuRow/);
  });

  test('ดวงคู่ keeps its romance emphasis in both navigation layouts', async () => {
    const header = await source('./app-header.tsx');
    expect(header).toContain("border-romance text-romanceText font-bold");
    expect(header).toContain("const ROMANCE_REST = 'text-romanceText font-bold");
    expect(header).toContain("const ROMANCE_ACTIVE = 'bg-romance/10 text-romanceText font-bold'");
  });

  test('settings renders the labelled โหมดสี control', async () => {
    const html = renderToStaticMarkup(<ThemeSetting />);
    expect(html).toContain('โหมดสี');
    expect(html).toContain('aria-label="สลับโหมดสี"');
    const page = await source('../../app/dashboard/settings/page.tsx');
    expect(page).toContain('<ThemeSetting />');
  });
});
