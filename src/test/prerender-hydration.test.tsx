import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import DonatePage from '@/pages/DonatePage';

it('hydrates the real prerendered donation page without replacing the server tree', async () => {
  const tree = <HelmetProvider><MemoryRouter initialEntries={['/donate']}><DonatePage /></MemoryRouter></HelmetProvider>;
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  const serverHeading = container.querySelector('h1');
  const recoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => { root = hydrateRoot(container, tree, { onRecoverableError: recoverableError }); });
    expect(recoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('h1')).toBe(serverHeading);
  } finally {
    await act(async () => { root?.unmount(); });
    container.remove();
  }
});
