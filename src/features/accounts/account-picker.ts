import type { PreviewGroup } from './account-form-contract';

/** Holds a synchronous guard across React batches and native dismissal callbacks. */
export type AccountPicker =
  | { readonly phase: 'idle' | 'open' | 'routing' }
  | { readonly phase: 'closing'; readonly group: PreviewGroup | null };

export function beginPickerClose(picker: AccountPicker, group: PreviewGroup | null): AccountPicker {
  return picker.phase === 'open' ? { phase: 'closing', group } : picker;
}

export function finishPickerClose(picker: AccountPicker): AccountPicker {
  if (picker.phase !== 'closing') return picker;
  return { phase: picker.group === null ? 'idle' : 'routing' };
}
