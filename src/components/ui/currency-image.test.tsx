import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CurrencyImage, currencyFileSize } from './currency-image';

describe('CurrencyImage', () => {
  test('picks a file at least 2× the display size, capped at 256', () => {
    expect([16, 24, 32, 48, 64, 96, 128].map(currencyFileSize)).toEqual([48, 48, 64, 96, 128, 256, 256]);
  });

  test('the มู gem file, decorative, contained, never the generation-credit card', () => {
    const html = renderToStaticMarkup(<CurrencyImage size={24} />);
    expect(html).toContain('/assets/currency/mu-gem-clay-48.webp');
    expect(html).toContain('alt=""');
    expect(html).toContain('object-contain');
    expect(html).not.toContain('generation-credit');
  });
});
