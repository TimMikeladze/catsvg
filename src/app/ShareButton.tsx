import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText, downloadPng } from './download';
import { copyImage, mailtoHref, nativeShare, pictures, smsHref } from './share';
import type { ShareTarget } from './share';

export interface ShareButtonProps {
  /**
   * Built on demand — rendering and rasterising 1200px of cat on every parent
   * render would be wasted work for a button most renders never touch.
   */
  target: () => ShareTarget;
  label?: string;
  /** What is being shared, for the button's label: "Share this postcard". */
  subject?: string;
}

const FLASH_MS = 1400;

/**
 * One button that does the right thing per device: the native share sheet
 * where there is one (iOS, Android — Messages, Mail, WhatsApp all get the PNG
 * itself), and an explicit menu of targets where there isn't. The menu is also
 * reachable on purpose, because "email this to me" is a real desktop want.
 */
export function ShareButton({ target, label = 'Share', subject = 'cat' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [menuTarget, setMenuTarget] = useState<ShareTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const say = useCallback((message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), FLASH_MS);
  }, []);

  const openMenu = useCallback(() => {
    setMenuTarget(target());
    setOpen(true);
  }, [target]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = await nativeShare(target());
      if (outcome === 'unsupported' || outcome === 'failed') openMenu();
      else if (outcome !== 'cancelled') setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const item = menuTarget;
  const sentenceSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="sharewrap" ref={root}>
      <div className="sharebar">
        <button
          type="button"
          className="ghost sm share-go"
          aria-label={`${label} this ${subject}`}
          onClick={() => void onShare()}
        >
          <ShareMark />
          {label}
        </button>
        <button
          type="button"
          className="ghost sm share-more"
          aria-label="More ways to share"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openMenu())}
        >
          <span aria-hidden="true">⋯</span>
        </button>
      </div>

      {open && item && (
        <div className="sharemenu" role="menu">
          {/* A mailto: body is plain text, so the picture cannot ride along in
              the draft. Copying the PNG as the draft opens makes it one paste
              away — the clipboard write finishes because a mailto: does not
              unload the page. */}
          <a
            role="menuitem"
            href={mailtoHref(item)}
            onClick={() => {
              void copyImage(item).then((ok) =>
                say(ok ? `${sentenceSubject} copied — paste it into the draft` : 'Draft opened — link only'),
              );
              setOpen(false);
            }}
          >
            Email a draft
          </a>
          <a role="menuitem" href={smsHref(item)} onClick={() => setOpen(false)}>
            Messages
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              say((await copyText(item.url)) ? 'Link copied' : 'Copy blocked');
              setOpen(false);
            }}
          >
            Copy link
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              say((await copyImage(item)) ? 'Image copied — paste it in' : 'Image copy blocked');
              setOpen(false);
            }}
          >
            Copy image
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              // A postcard downloads whole: the side on screen and its other one.
              for (const p of pictures(item)) void downloadPng(p.filename, p.svg, p.width, p.height);
              setOpen(false);
            }}
          >
            {item.companions?.length ? 'Download both sides' : 'Download PNG'}
          </button>
          <p className="hint">
            A mail draft carries the link and copies the picture — paste it into the body to send it.
          </p>
        </div>
      )}

      <span className="share-flash" role="status" aria-live="polite">
        {flash}
      </span>
    </div>
  );
}

function ShareMark() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path
        d="M8 1.5v8M8 1.5 5.2 4.3M8 1.5l2.8 2.8M3 7.5v6h10v-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
