import { memo, useMemo } from 'react';
import { renderCat } from '../cat/render.ts';
import type { RenderOptions } from '../cat/render.ts';
import type { Traits } from '../cat/types.ts';

export interface CatSvgProps extends RenderOptions {
  traits: Traits;
  className?: string;
}

/**
 * The engine emits SVG source, so we inject it rather than mirroring every
 * shape in JSX. The markup is generated in-process from a fixed set of
 * templates — no user HTML ever reaches this.
 */
export const CatSvg = memo(function CatSvg({ traits, className, ...opts }: CatSvgProps) {
  const svg = useMemo(() => renderCat(traits, opts), [traits, opts.width, opts.height, opts.text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
});
