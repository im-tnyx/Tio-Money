import type { CurrencyCode } from '@/shared/currency/currency-preference';

import {
  newAccountDraft,
  previewGroups,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountChoiceAction,
  type AccountDraft,
  type AccountFormAction,
  type PreviewGroup,
} from './account-form-contract';

type GroupPickerState = 'pending' | 'open' | 'closed';

export interface AccountAddSession {
  readonly groupPicker: GroupPickerState;
  readonly choicePickerOpen: boolean;
  readonly group: PreviewGroup | null;
  readonly drafts: Readonly<Partial<Record<PreviewGroup, AccountDraft>>>;
}

export type AccountAddAction =
  | { readonly type: 'group.open' | 'group.close' }
  | { readonly type: 'group.select'; readonly group: PreviewGroup }
  | { readonly type: 'options.open' | 'options.close' }
  | { readonly type: 'options.select'; readonly choice: AccountChoiceAction }
  | { readonly type: 'form'; readonly group: PreviewGroup; readonly action: AccountFormAction };

export function newAccountAddSession(showPickerImmediately = false): AccountAddSession {
  return {
    groupPicker: showPickerImmediately ? 'open' : 'pending',
    choicePickerOpen: false,
    group: null,
    drafts: {},
  };
}

export function presentInitialAccountGroupPicker(session: AccountAddSession): AccountAddSession {
  return session.groupPicker === 'pending' ? { ...session, groupPicker: 'open' } : session;
}

export function reconcileAccountAddCurrencies(
  session: AccountAddSession,
  mainCode: CurrencyCode,
  currencies: readonly CurrencyCode[],
): AccountAddSession {
  let drafts = session.drafts;
  for (const group of previewGroups) {
    const draft = drafts[group];
    if (!draft) continue;
    const reconciled = reconcileAccountDraftCurrency(draft, mainCode, currencies);
    if (reconciled !== draft) drafts = { ...drafts, [group]: reconciled };
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
      if (
        session.groupPicker === 'open' ||
        session.choicePickerOpen ||
        (active?.group === 'bank' && active.modeEditor)
      ) {
        return session;
      }
      return { ...session, groupPicker: 'open' };
    case 'group.close':
      return session.groupPicker === 'open' ? { ...session, groupPicker: 'closed' } : session;
    case 'group.select': {
      if (session.groupPicker !== 'open') return session;
      const { group } = action;
      const drafts = session.drafts[group]
        ? session.drafts
        : { ...session.drafts, [group]: newAccountDraft(group, mainCode) };
      return { ...session, group, groupPicker: 'closed', drafts };
    }
    case 'options.open':
      if (
        session.groupPicker !== 'closed' ||
        session.choicePickerOpen ||
        (active?.group !== 'wallet' && active?.group !== 'loan' && active?.group !== 'investment')
      ) {
        return session;
      }
      return { ...session, choicePickerOpen: true };
    case 'options.close':
      return session.choicePickerOpen ? { ...session, choicePickerOpen: false } : session;
    case 'options.select': {
      if (!session.choicePickerOpen || !active) return session;
      const draft = updateAccountDraft(active, action.choice, currencies);
      if (draft === active) return session;
      return {
        ...session,
        choicePickerOpen: false,
        drafts: { ...session.drafts, [draft.group]: draft },
      };
    }
    case 'form': {
      if (!active || session.groupPicker !== 'closed' || active.group !== action.group) {
        return session;
      }
      const draft = updateAccountDraft(active, action.action, currencies);
      return draft === active
        ? session
        : { ...session, drafts: { ...session.drafts, [draft.group]: draft } };
    }
  }
}
