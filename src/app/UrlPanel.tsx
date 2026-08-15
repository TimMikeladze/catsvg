import { useMemo, useState } from 'react';
import { buildCatPath, parseCatUrl } from '../cat/url';
import { catName } from '../cat/traits';
import { copyText } from './download';
import type { CatMachine } from './useCatMachine';

const SIZE_PRESETS: Array<[number, number]> = [
  [400, 400],
  [160, 160],
  [800, 450],
  [1200, 300],
  [600, 800],
];

/** Card-shaped sizes — a postcard is landscape 3:2 unless you want it portrait. */
const POSTCARD_PRESETS: Array<[number, number]> = [
  [600, 400],
  [900, 600],
  [1200, 800],
  [400, 600],
];

const origin = (): string => (typeof window === 'undefined' ? '' : window.location.origin);

/**
 * Resolve anything a user might paste — a full URL, a bare path, or a path
 * with no leading slash — against this origin.
 */
export function resolveCatUrl(input: string): URL | null {
  const value = input.trim();
  if (!value) return null;
  const looksAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(value);
  try {
    return new URL(value);
  } catch {
    // A broken absolute URL is a mistake, not a path — don't silently rescue it
    // by treating "http://" as the relative path "/http:".
    if (looksAbsolute) return null;
  }
  try {
    return new URL(value.startsWith('/') ? value : `/${value}`, origin() || 'http://localhost');
  } catch {
    return null;
  }
}

export interface UrlPanelProps {
  machine: CatMachine;
}

/** The placeholder-service surface: copyable image URLs, and a URL you can paste back in. */
export function UrlPanel({ machine }: UrlPanelProps) {
  const { seed, locks, preset, width, height, mode, side, text } = machine;
  const [copied, setCopied] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');

  const path = useMemo(
    () => buildCatPath({ seed, locks, preset, width, height, mode, side, text }),
    [seed, locks, preset, width, height, mode, side, text],
  );
  const sizes = mode === 'postcard' ? POSTCARD_PRESETS : SIZE_PRESETS;
  const url = origin() + path;

  const imgTag = `<img src="${url}" width="${width}" height="${height}" alt="${catName(seed)}" />`;
  const markdown = `![${catName(seed)}](${url})`;

  const copy = async (label: string, text: string) => {
    const ok = await copyText(text);
    setCopied(ok ? label : 'failed');
    setTimeout(() => setCopied(null), 1200);
  };

  const pastedUrl = useMemo(() => resolveCatUrl(pasted), [pasted]);
  const pastedRequest = useMemo(() => {
    if (!pastedUrl) return null;
    try {
      return parseCatUrl(pastedUrl);
    } catch {
      return null;
    }
  }, [pastedUrl]);

  return (
    <div className="card urlcard">
      <h2>{mode === 'postcard' ? 'Postcard URL' : 'Cat URL'} — drop it in any &lt;img&gt;</h2>

      <div className="sizes">
        {sizes.map(([w, h]) => (
          <button
            key={`${w}x${h}`}
            type="button"
            aria-pressed={w === width && h === height}
            onClick={() => machine.setSize(w, h)}
          >
            {w}×{h}
          </button>
        ))}
      </div>

      <div className="dims">
        <label htmlFor="cat-w">width</label>
        <input
          id="cat-w"
          type="number"
          min={16}
          max={2000}
          value={width}
          onChange={(e) => machine.setSize(Number(e.target.value) || 16, height)}
        />
        <label htmlFor="cat-h">height</label>
        <input
          id="cat-h"
          type="number"
          min={16}
          max={2000}
          value={height}
          onChange={(e) => machine.setSize(width, Number(e.target.value) || 16)}
        />
      </div>

      <div className="urlbar">
        <input type="text" readOnly aria-label="Cat image URL" value={url} onFocus={(e) => e.target.select()} />
        <button type="button" onClick={() => void copy('url', url)}>
          {copied === 'url' ? 'Copied' : 'Copy URL'}
        </button>
      </div>

      <div className="preview">
        <img src={path} width={width} height={height} alt={`${catName(seed)}, served from ${path}`} />
      </div>
      <p className="hint">
        That preview is a real request to the image endpoint — same bytes any other site would get.
      </p>

      <div className="snippets">
        <div className="snippet">
          <code className="mono">{imgTag}</code>
          <button type="button" className="ghost sm" style={{ width: 'auto', margin: 0 }} onClick={() => void copy('img', imgTag)}>
            {copied === 'img' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="snippet">
          <code className="mono">{markdown}</code>
          <button type="button" className="ghost sm" style={{ width: 'auto', margin: 0 }} onClick={() => void copy('md', markdown)}>
            {copied === 'md' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <h2>Paste a cat URL</h2>
      <div className="urlbar">
        <input
          type="text"
          value={pasted}
          aria-label="Paste a cat URL"
          placeholder="/cat/postcard/900x600/mackerel.svg"
          onChange={(e) => setPasted(e.target.value)}
        />
        <button
          type="button"
          className="ghost"
          disabled={!pastedRequest}
          onClick={() => {
            if (!pastedRequest) return;
            machine.loadRecipe({ seed: pastedRequest.seed, locks: pastedRequest.locks, preset: pastedRequest.preset });
            machine.setMode(pastedRequest.mode);
            machine.setSide(pastedRequest.side);
            machine.setText(pastedRequest.text ?? '');
            // Last, so the size in the URL wins over the mode's default size.
            machine.setSize(pastedRequest.width, pastedRequest.height);
          }}
        >
          Load
        </button>
      </div>

      {pasted.trim() !== '' && !pastedRequest && <p className="err">Not a URL this service understands.</p>}

      {pastedRequest && (
        <>
          <div className="preview">
            <img
              src={pastedUrl!.pathname + pastedUrl!.search}
              width={pastedRequest.width}
              height={pastedRequest.height}
              alt={`Cat from pasted URL, seed ${pastedRequest.seed}`}
            />
          </div>
          <p className="hint">
            seed <strong>{pastedRequest.seed}</strong> · {pastedRequest.width}×{pastedRequest.height} ·{' '}
            {pastedRequest.preset}
            {pastedRequest.mode === 'postcard' ? ` · postcard ${pastedRequest.side}` : ''}
            {Object.keys(pastedRequest.locks).length > 0
              ? ` · pinned ${Object.entries(pastedRequest.locks)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(', ')}`
              : ''}
          </p>
        </>
      )}
    </div>
  );
}
