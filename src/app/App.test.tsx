import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { FAQ } from '../seo/site';

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
    await user.click(screen.getByRole('button', { name: /New cat/ }));
    expect(chips.getByText(/eyes$/).textContent).toBe(`🔒 ${label}`);
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
