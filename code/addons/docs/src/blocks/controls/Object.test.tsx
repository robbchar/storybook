// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import React, { useState } from 'react';

import { ThemeProvider, convert, themes } from 'storybook/theming';

import { ArgsTable } from '../components/ArgsTable/ArgsTable';
import type { ArgTypes, Args } from '../components/ArgsTable/types';

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={convert(themes.light)}>{ui}</ThemeProvider>);

describe('ObjectControl', () => {
  it('resets raw JSON via the reset controls button', () => {
    const rows: ArgTypes = {
      items: {
        name: 'items',
        type: { name: 'object' },
        control: { type: 'object' },
      },
    };
    const initialArgs: Args = { items: ['Item 1', 'Item 2'] };
    const updatedJson = '["Item 1asd","Item 2"]';
    const onUpdateArgs = vi.fn();
    const onResetArgs = vi.fn();

    const Wrapper = () => {
      const [args, setArgs] = useState<Args>(initialArgs);

      return (
        <ArgsTable
          rows={rows}
          args={args}
          updateArgs={(newArgs) => {
            setArgs((prev) => ({ ...prev, ...newArgs }));
            onUpdateArgs(newArgs);
          }}
          resetArgs={() => {
            setArgs(initialArgs);
            onResetArgs();
          }}
          inAddonPanel
        />
      );
    };

    renderWithTheme(<Wrapper />);

    const toggleRaw = screen.getByRole('switch', { name: /edit the items properties/i });
    fireEvent.click(toggleRaw);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.id).toBe('control-items');
    expect(textarea.value).toBe('[\n  "Item 1",\n  "Item 2"\n]');

    fireEvent.change(textarea, { target: { value: updatedJson } });
    fireEvent.blur(textarea);

    expect(onUpdateArgs).toHaveBeenCalledWith({ items: ['Item 1asd', 'Item 2'] });
    expect(textarea.value).toContain('Item 1asd');

    fireEvent.click(screen.getByLabelText(/reset controls/i));
    expect(onResetArgs).toHaveBeenCalled();

    const textareaAfterReset = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textareaAfterReset.value).toBe('[\n  "Item 1",\n  "Item 2"\n]');
  });
});
