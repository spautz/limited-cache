import React from 'react';
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { App } from '../App';

describe('App', () => {
  test('Renders without error', () => {
    render(<App />);

    expect(screen.getByText('TodoProvider: Hello World!')).toBeVisible();
  });
});
