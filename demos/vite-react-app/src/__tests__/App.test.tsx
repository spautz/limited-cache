import { afterEach, describe, expect, test, vitest } from 'vitest';
import { cleanup, fireEvent, render, screen, Screen } from '@testing-library/react';

import { App } from '../App.js';

async function addKeyAndValue(screen: Screen, keyText: string, valueText: string) {
  const keyInput = await screen.findByLabelText('Key');
  fireEvent.change(keyInput, { target: { value: keyText } });
  const valueInput = await screen.findByLabelText('Value');
  fireEvent.change(valueInput, { target: { value: valueText } });
  const addButton = await screen.findByRole('button');
  fireEvent.click(addButton);
}

describe('App', () => {
  afterEach(() => {
    cleanup();
    vitest.resetModules();
  });

  test('Renders without error', () => {
    render(<App />);

    expect(screen.getByText('LimitedCache Contents')).toBeVisible();
  });

  test('Displays limited-cache contents', () => {
    render(<App />);

    expect(screen.getByText('Key 1: Item 1')).toBeVisible();
    expect(screen.getByText('Key 2: Item 2')).toBeVisible();
    expect(screen.getByText('Key 3: Item 3')).toBeVisible();
  });

  test('Adds an item', async () => {
    const { rerender } = render(<App />);

    await addKeyAndValue(screen, 'Key 4', 'Item 4');
    rerender(<App />);

    expect(screen.getByText('Key 1: Item 1')).toBeVisible();
    expect(screen.getByText('Key 2: Item 2')).toBeVisible();
    expect(screen.getByText('Key 3: Item 3')).toBeVisible();
    expect(screen.getByText('Key 4: Item 4')).toBeVisible();
  });

  test('Replaces an item', async () => {
    const { rerender } = render(<App />);

    await addKeyAndValue(screen, 'Key 2', 'Item 2 (replaced)');
    rerender(<App />);

    expect(screen.getByText('Key 1: Item 1')).toBeVisible();
    expect(screen.getByText('Key 2: Item 2 (replaced)')).toBeVisible();
    expect(screen.getByText('Key 3: Item 3')).toBeVisible();
  });

  test('Adds 4 items, overflowing cache limit', async () => {
    const { rerender } = render(<App />);

    await addKeyAndValue(screen, 'Key 2', 'Item 2');
    await addKeyAndValue(screen, 'Key 4', 'Item 4');
    await addKeyAndValue(screen, 'Key 6', 'Item 6');
    await addKeyAndValue(screen, 'Key 8', 'Item 8');
    rerender(<App />);

    // Item 1 should have been pushed out
    expect(screen.getByText('Key 2: Item 2')).toBeVisible();
    expect(screen.getByText('Key 3: Item 3')).toBeVisible();
    expect(screen.getByText('Key 4: Item 4')).toBeVisible();
    expect(screen.getByText('Key 6: Item 6')).toBeVisible();
    expect(screen.getByText('Key 8: Item 8')).toBeVisible();
  });
});
