import { memo, useMemo } from 'react';
import { renderCat } from '../cat/render';
import { renderPostcard } from '../cat/postcard';
import type { PostcardOptions } from '../cat/postcard';
import type { RenderOptions } from '../cat/render';
import type { Traits } from '../cat/types';

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

export interface PostcardSvgProps extends PostcardOptions {
  traits: Traits;
  className?: string;
}

/** The same cat, mounted on a postcard. */
export const PostcardSvg = memo(function PostcardSvg({ traits, className, ...opts }: PostcardSvgProps) {
  const svg = useMemo(
    () => renderPostcard(traits, opts),
    [traits, opts.width, opts.height, opts.side, opts.text],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
});
