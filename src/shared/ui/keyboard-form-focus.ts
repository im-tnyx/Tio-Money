import { createContext } from 'react';
import type { TextInput } from 'react-native';

interface KeyboardFormFocus {
  readonly focus: (input: TextInput) => void;
  readonly blur: (input: TextInput) => void;
  readonly resize: (input: TextInput) => void;
}

/** Optional presentation-only focus bridge; fields outside a form remain unchanged. */
export const KeyboardFormFocusContext = createContext<KeyboardFormFocus | null>(null);
