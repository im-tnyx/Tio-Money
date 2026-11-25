import { createContext, type ComponentRef } from 'react';
import type { TextInput } from 'react-native';

interface KeyboardFormFocus {
  readonly focus: (input: ComponentRef<typeof TextInput>) => void;
  readonly blur: (input: ComponentRef<typeof TextInput>) => void;
  readonly resize: (input: ComponentRef<typeof TextInput>) => void;
}

/** Optional presentation-only focus bridge; fields outside a form remain unchanged. */
export const KeyboardFormFocusContext = createContext<KeyboardFormFocus | null>(null);
