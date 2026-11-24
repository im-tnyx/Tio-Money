import type { CurrencyCode } from '@/shared/currency/currency-preference';

import {
  newAccountDraft,
  previewGroups,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type PreviewGroup,
} from './account-form-contract';

export interface AccountAddSession {
  readonly group: PreviewGroup | null;
  readonly groupPickerOpen: boolean;
  readonly drafts: Readonly<Partial<Record<PreviewGroup, AccountDraft>>>;
}

export type AccountAddAction =
  | { readonly type: 'group.open' | 'group.close' }
  | { readonly type: 'group.select'; readonly group: PreviewGroup }
  | { readonly type: 'form'; readonly group: PreviewGroup; readonly action: AccountFormAction };

export function newAccountAddSession(): AccountAddSession {
  return { group: null, groupPickerOpen: false, drafts: {} };
}

export function reconcileAccountAddCurrencies(
  session: AccountAddSession,
  mainCode: CurrencyCode,
  currencies: readonly CurrencyCode[],
): AccountAddSession {
  let drafts = session.drafts;
  for (const group of previewGroups) {
    const draft = session.drafts[group];
    if (!draft) continue;
    const reconciled = reconcileAccountDraftCurrency(draft, mainCode, currencies);
    if (draft !== reconciled) drafts = { ...drafts, [group]: reconciled };
  }
  return drafts === session.drafts ? session : { ...session, drafts };
}

export function updateAccountAddSession(
  session: AccountAddSession,
  action: AccountAddAction,
  mainCode: CurrencyCode,
  currencies: readonly CurrencyCode[],
): AccountAddSession {
  const active = session.group === null ? undefined : session.drafts[session.group];
  switch (action.type) {
    case 'group.open':
      if (session.groupPickerOpen || (active?.group === 'bank' && active.modeEditor)) {
        return session;
      }
      return { ...session, groupPickerOpen: true };
    case 'group.close':
      return session.groupPickerOpen ? { ...session, groupPickerOpen: false } : session;
    case 'group.select': {
      if (!session.groupPickerOpen) return session;
      const group = action.group;
      const drafts = session.drafts[group]
        ? session.drafts
        : { ...session.drafts, [group]: newAccountDraft(group, mainCode) };
      return { group, groupPickerOpen: false, drafts };
    }
    case 'form': {
      if (!active || session.groupPickerOpen || active.group !== action.group) return session;
      const draft = updateAccountDraft(active, action.action, currencies);
      return draft === active
        ? session
        : { ...session, drafts: { ...session.drafts, [draft.group]: draft } };
    }
  }
}
