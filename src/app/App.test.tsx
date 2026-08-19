import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { FAQ } from '../seo/site';
import { COMBOS } from '../cat/spec';

const seedLine = () => screen.getByText(/^seed · /, { selector: '.seedline' }).textContent ?? '';

beforeEach(() => {
  // Node 26 leaves window.localStorage undefined under jsdom; the hook falls
  // back to memory, which is all these tests need.
  window.localStorage?.clear();
  window.history.replaceState(null, '', '/');
});

describe('App', () => {
  it('renders a cat, its chips and the litter', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'CatSVG' })).toBeInTheDocument();
    expect(document.querySelector('.stage svg')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Keep /)).toHaveLength(9);
  });

  it('shows the same questions the crawler-facing HTML answers', () => {
    render(<App />);
    expect(screen.getByText(FAQ[0].q)).toBeInTheDocument();
    expect(screen.getAllByRole('definition')).toHaveLength(FAQ.length);
  });

  it('opens the combos tooltip on hover and focus, and closes it on Escape', async () => {
    const user = userEvent.setup();
    render(<App />);
    const pill = document.querySelector('.combos') as HTMLElement;
    const tip = screen.getByRole('tooltip');

    // The exact count is always readable to assistive tech, tooltip open or not.
    expect(pill).toHaveAttribute('aria-describedby', tip.id);
    expect(tip.textContent).toContain(COMBOS.toLocaleString('en-US'));
    expect(tip).toHaveAttribute('data-open', 'false');

    await user.hover(pill);
    expect(tip).toHaveAttribute('data-open', 'true');
    await user.unhover(pill);
    expect(tip).toHaveAttribute('data-open', 'false');

    act(() => pill.focus());
    expect(tip).toHaveAttribute('data-open', 'true');
    await user.keyboard('{Escape}');
    expect(tip).toHaveAttribute('data-open', 'false');
  });

  it('rolls a new cat', async () => {
    const user = userEvent.setup();
    render(<App />);
    const before = seedLine();
    await user.click(screen.getByRole('button', { name: /New cat/ }));
    expect(seedLine()).not.toBe(before);
  });

  it('renders the exact cat a typed seed asks for', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Seed word'), { target: { value: 'mackerel' } });
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(seedLine()).toBe('seed · mackerel');
  });

  it('locks a trait so it survives a roll', async () => {
    const user = userEvent.setup();
    render(<App />);
    const chips = within(document.querySelector('.chips') as HTMLElement);
    const eyeChip = chips.getByText(/eyes$/);
    const label = eyeChip.textContent;
    await user.click(eyeChip);
    expect(eyeChip).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /New cat/ }));
    expect(chips.getByText(/eyes$/).textContent).toBe(label);
    expect(chips.getByText(/eyes$/)).toHaveAttribute('aria-pressed', 'true');
  });

  it('puts the current cat in a copyable image URL', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Seed word'), { target: { value: 'biscuit' } });
    await user.click(screen.getByRole('button', { name: 'Go' }));
    const url = screen.getByLabelText('Cat image URL') as HTMLInputElement;
    expect(url.value).toContain('/cat/400/biscuit.svg');
  });

  it('resizes the URL from a size preset', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '1200×300' }));
    expect((screen.getByLabelText('Cat image URL') as HTMLInputElement).value).toContain('/cat/1200x300/');
  });

  // These drive a lot of buttons, and every click re-renders a whole postcard,
  // so they use fireEvent rather than paying for simulated pointer events.
  const press = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
  const url = () => (screen.getByLabelText('Cat image URL') as HTMLInputElement).value;
  const stage = () => document.querySelector('.stage svg');

  it('turns the cat into a postcard and back', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Seed word'), { target: { value: 'mackerel' } });
    press('Go');

    press('Postcard');
    // A postcard defaults to a card shape rather than the cat's square.
    expect(url()).toContain('/cat/postcard/600x400/mackerel.svg');
    expect(stage()?.getAttribute('viewBox')).toBe('0 0 400 267');

    press('Back');
    expect(url()).toContain('/cat/postcard/back/600x400/mackerel.svg');

    press('Plain cat');
    expect(url()).toContain('/cat/400/mackerel.svg');
  });

  it('writes the greeting on the postcard and into the URL', () => {
    render(<App />);
    press('Postcard');
    fireEvent.change(screen.getByLabelText('Greeting'), { target: { value: 'Greetings from Hull' } });
    expect(stage()?.innerHTML).toContain('Greetings from Hull');
    expect(url()).toContain('text=Greetings+from+Hull');
  });

  it('writes the addressee and the signature into the card and the URL', () => {
    render(<App />);
    press('Postcard');
    press('Back');

    fireEvent.change(screen.getByLabelText('Addressed to'), { target: { value: 'Sheehan' } });
    fireEvent.change(screen.getByLabelText('Signed by'), { target: { value: 'The Cat' } });
    expect(stage()?.innerHTML).toContain('Sheehan');
    expect(stage()?.innerHTML).toContain('The Cat');
    expect(url()).toContain('to=Sheehan');
    expect(url()).toContain('from=The+Cat');
  });

  it('takes the CatSVG marks off the card', () => {
    render(<App />);
    press('Postcard');
    press('Back');
    press('CatSVG mark');
    expect(url()).toContain('brand=off');
    expect(stage()?.innerHTML.toLowerCase()).not.toContain('catsvg');
  });

  it('franks the card with as many stamps as asked for', () => {
    render(<App />);
    press('Postcard');
    press('Back');

    press('No stamps');
    expect(url()).toContain('stamp=0');
    expect(stage()?.innerHTML).not.toContain('1 CAT');

    // A row of three, because a cat can be extravagant about postage.
    press('3 stamps');
    expect(url()).toContain('stamp=3');
    expect(stage()?.innerHTML.match(/1 CAT/g)).toHaveLength(3);
  });

  it('offers hand-rolled share targets when the device has no share sheet', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Seed word'), { target: { value: 'mackerel' } });
    press('Go');

    // jsdom has no navigator.share, which is exactly the desktop case.
    await user.click(screen.getByRole('button', { name: 'Share this cat' }));

    const mail = await screen.findByRole('menuitem', { name: 'Email a draft' });
    expect(mail).toHaveAttribute('href', expect.stringContaining('mailto:?subject='));
    expect(decodeURIComponent(mail.getAttribute('href') ?? '')).toContain('seed=mackerel');
    expect(screen.getByRole('menuitem', { name: 'Messages' })).toHaveAttribute(
      'href',
      expect.stringContaining('sms:?&body='),
    );
    expect(screen.getByRole('menuitem', { name: 'Download PNG' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem', { name: 'Copy link' })).not.toBeInTheDocument();
  });

  it('shares a postcard as a postcard, both sides of it', async () => {
    const user = userEvent.setup();
    const nav = navigator as unknown as Record<string, unknown>;
    const share = vi.fn().mockResolvedValue(undefined);
    nav.share = share;
    // jsdom cannot rasterise, so this exercises the link share and the copy.
    nav.canShare = () => false;
    try {
      render(<App />);
      press('Postcard');
      press('Back');
      fireEvent.change(screen.getByLabelText('Signed by'), { target: { value: 'The Cat' } });

      await user.click(screen.getByRole('button', { name: 'Share this postcard' }));
      expect(share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('A postcard from'),
          text: expect.stringContaining('The Cat'),
          url: expect.stringContaining('mode=postcard'),
        }),
      );

      await user.click(screen.getByRole('button', { name: 'More ways to share' }));
      expect(await screen.findByRole('menuitem', { name: 'Download both sides' })).toBeInTheDocument();
    } finally {
      delete nav.share;
      delete nav.canShare;
    }
  });

  it('loads a pasted cat URL', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Paste a cat URL'), { target: { value: '/cat/800x450/pickle.svg?eyes=star' } });
    expect(screen.getByText('pickle', { selector: 'strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Load' }));
    expect(seedLine()).toBe('seed · pickle');
    const url = (screen.getByLabelText('Cat image URL') as HTMLInputElement).value;
    expect(url).toContain('/cat/800x450/pickle.svg');
    expect(url).toContain('eyes=star');
  });

  it('rejects a URL it cannot read', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Paste a cat URL'), { target: { value: 'http://' } });
    expect(screen.getByText('Not a URL this service understands.')).toBeInTheDocument();
  });

  it('keeps the trait and tinker panels open on a wide screen and folded on a narrow one', () => {
    const real = window.matchMedia;
    const folds = () => [...document.querySelectorAll('.fold')] as HTMLDetailsElement[];
    const openState = () => folds().map((f) => f.open);

    render(<App />);
    expect(openState()).toEqual([true, true]);

    window.matchMedia = ((query: string) => ({
      matches: query.includes('900px'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia;
    try {
      document.body.innerHTML = '';
      render(<App />);
      expect(openState()).toEqual([false, false]);
      expect(screen.getByText('Traits')).toBeInTheDocument();
      expect(screen.getByText('Tinker')).toBeInTheDocument();
    } finally {
      window.matchMedia = real;
    }
  });

  it('saves and reloads a favourite', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Seed word'), { target: { value: 'domino' } });
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await user.click(screen.getByRole('button', { name: 'Save to favourites' }));
    await user.click(screen.getByRole('button', { name: /New cat/ }));
    expect(seedLine()).not.toBe('seed · domino');
    await user.click(screen.getByLabelText(/^Load .*remove\)$/));
    expect(seedLine()).toBe('seed · domino');
  });
});
