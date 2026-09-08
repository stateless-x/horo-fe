import { describe, expect, mock, test } from 'bun:test';
import { trackMountedResultOnce } from './compatibility-result-tracking';

describe('trackMountedResultOnce', () => {
  test('reports one visible display despite effect replay or background result updates', () => {
    const guard = { current: false };
    const onOpen = mock(() => {});

    trackMountedResultOnce(guard, onOpen);
    trackMountedResultOnce(guard, onOpen);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test('reports again after unmount and a genuine remount', () => {
    const onOpen = mock(() => {});

    trackMountedResultOnce({ current: false }, onOpen);
    trackMountedResultOnce({ current: false }, onOpen);

    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
