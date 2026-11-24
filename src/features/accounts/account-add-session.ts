import type { CurrencyCode } from '@/shared/currency/currency-preference';

import {
  newAccountDraft,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type PreviewGroup,
} from './account-form-contract';

export type AccountAddSession =
  { readonly phase: 'group' } | { readonly phase: 'form'; readonly draft: AccountDraft };

export type AccountAddAction =
  | { readonly type: 'group.select'; readonly group: PreviewGroup }
  | { readonly type: 'form'; readonly group: PreviewGroup; readonly action: AccountFormAction };

export function newAccountAddSession(): AccountAddSession {
  return { phase: 'group' };
}

export function reconcileAccountAddCurrencies(
  session: AccountAddSession,
  mainCode: CurrencyCode,
  currencies: readonly CurrencyCode[],
): AccountAddSession {
  if (session.phase !== 'form') return session;
  const draft = reconcileAccountDraftCurrency(session.draft, mainCode, currencies);
  return draft === session.draft ? session : { ...session, draft };
}

export function updateAccountAddSession(
  session: AccountAddSession,
  action: AccountAddAction,
  mainCode: CurrencyCode,
  currencies: readonly CurrencyCode[],
): AccountAddSession {
  switch (action.type) {
    case 'group.select':
      return session.phase === 'group'
        ? { phase: 'form', draft: newAccountDraft(action.group, mainCode) }
        : session;
    case 'form': {
      if (session.phase !== 'form' || session.draft.group !== action.group) return session;
      const draft = updateAccountDraft(session.draft, action.action, currencies);
      return draft === session.draft ? session : { ...session, draft };
    }
  }
}
