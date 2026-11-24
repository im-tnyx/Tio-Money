import type { CurrencyCode } from '@/shared/currency/currency-preference';
import {
  encodeCalendarDate,
  initialDayWheelIndex,
  initialMonthWheelIndex,
  localCalendarToday,
  nextDayWheelIndex,
  nextMonthWheelIndex,
  parseCalendarDate,
  selectCalendarWheel,
  type CalendarPart,
} from '@/shared/ui/calendar-date';

import { encodeMonthDay, parseMonthDay } from '@/shared/ui/month-day';

import {
  isCardMonthDayField,
  newAccountDraft,
  previewGroups,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountChoiceAction,
  type AccountDateField,
  type AccountDraft,
  type AccountFormAction,
  type PreviewGroup,
} from './account-form-contract';

function withoutLoanFieldInfo(drafts: AccountAddSession['drafts']): AccountAddSession['drafts'] {
  const loan = drafts.loan;
  return loan?.group === 'loan' && loan.fieldInfo !== null
    ? { ...drafts, loan: { ...loan, fieldInfo: null } }
    : drafts;
}

type GroupPickerState = 'pending' | 'open' | 'closed';

export interface AccountAddSession {
  readonly groupPicker: GroupPickerState;
  readonly choicePickerOpen: boolean;
  readonly datePicker: {
    readonly field: AccountDateField;
    readonly id: number;
    readonly dayIndex: number;
    readonly monthIndex: number;
  } | null;
  readonly datePickerEpoch: number;
  readonly group: PreviewGroup | null;
  readonly drafts: Readonly<Partial<Record<PreviewGroup, AccountDraft>>>;
}

export type AccountAddAction =
  | { readonly type: 'group.open' | 'group.close' }
  | { readonly type: 'group.select'; readonly group: PreviewGroup }
  | { readonly type: 'options.open' | 'options.close' }
  | { readonly type: 'options.select'; readonly choice: AccountChoiceAction }
  | { readonly type: 'date.open'; readonly field: AccountDateField }
  | { readonly type: 'date.close'; readonly id: number }
  | {
      readonly type: 'date.change';
      readonly id: number;
      readonly part: CalendarPart;
      readonly value: number;
    }
  | { readonly type: 'form'; readonly group: PreviewGroup; readonly action: AccountFormAction };

export function newAccountAddSession(showPickerImmediately = false): AccountAddSession {
  return {
    groupPicker: showPickerImmediately ? 'open' : 'pending',
    choicePickerOpen: false,
    datePicker: null,
    datePickerEpoch: 0,
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
  today = localCalendarToday(),
): AccountAddSession {
  const active = session.group === null ? undefined : session.drafts[session.group];
  switch (action.type) {
    case 'group.open':
      if (
        session.groupPicker === 'open' ||
        session.choicePickerOpen ||
        session.datePicker ||
        (active?.group === 'bank' && active.modeEditor)
      ) {
        return session;
      }
      return {
        ...session,
        groupPicker: 'open',
        drafts: withoutLoanFieldInfo(session.drafts),
      };
    case 'group.close':
      return session.groupPicker === 'open' ? { ...session, groupPicker: 'closed' } : session;
    case 'group.select': {
      if (session.groupPicker !== 'open') return session;
      const { group } = action;
      const drafts = session.drafts[group]
        ? session.drafts
        : { ...session.drafts, [group]: newAccountDraft(group, mainCode, today) };
      return { ...session, group, groupPicker: 'closed', drafts };
    }
    case 'options.open':
      if (
        session.groupPicker !== 'closed' ||
        session.choicePickerOpen ||
        session.datePicker ||
        active?.group !== 'loan'
      ) {
        return session;
      }
      return {
        ...session,
        choicePickerOpen: true,
        drafts: withoutLoanFieldInfo(session.drafts),
      };
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
    case 'date.open': {
      if (session.groupPicker !== 'closed' || session.choicePickerOpen || session.datePicker) {
        return session;
      }
      if (
        (active?.group === 'loan' || active?.group === 'investment') &&
        action.field === 'startDate'
      ) {
        const date = parseCalendarDate(active.fields.startDate);
        if (!date) return session;
        const id = session.datePickerEpoch + 1;
        return {
          ...session,
          datePicker: {
            field: action.field,
            id,
            dayIndex: initialDayWheelIndex(date),
            monthIndex: initialMonthWheelIndex(date),
          },
          datePickerEpoch: id,
          drafts: withoutLoanFieldInfo(session.drafts),
        };
      }
      if (active?.group === 'credit-card' && isCardMonthDayField(action.field)) {
        const day = parseMonthDay(active.fields[action.field]);
        if (day === null) return session;
        const id = session.datePickerEpoch + 1;
        return {
          ...session,
          datePicker: {
            field: action.field,
            id,
            dayIndex: day - 1,
            monthIndex: 0,
          },
          datePickerEpoch: id,
          drafts: withoutLoanFieldInfo(session.drafts),
        };
      }
      return session;
    }
    case 'date.close':
      return session.datePicker?.id === action.id ? { ...session, datePicker: null } : session;
    case 'date.change': {
      const picker = session.datePicker;
      if (!active || picker?.id !== action.id) return session;
      if (
        active.group === 'credit-card' &&
        isCardMonthDayField(picker.field) &&
        action.part === 'day'
      ) {
        if (!Number.isInteger(action.value) || action.value < 1 || action.value > 31) {
          return session;
        }
        const value = encodeMonthDay(action.value);
        if (value === active.fields[picker.field]) return session;
        const draft = updateAccountDraft(
          active,
          { type: 'text', field: picker.field, value },
          currencies,
        );
        return {
          ...session,
          datePicker: { ...picker, dayIndex: action.value - 1 },
          drafts: { ...session.drafts, [draft.group]: draft },
        };
      }
      if (
        (active.group !== 'loan' && active.group !== 'investment') ||
        picker.field !== 'startDate'
      ) {
        return session;
      }
      const date = parseCalendarDate(active.fields.startDate);
      if (!date) return session;
      const next = selectCalendarWheel(date, action.part, action.value);
      const value = encodeCalendarDate(next);
      if (value === active.fields.startDate) return session;
      const draft = updateAccountDraft(
        active,
        { type: 'text', field: 'startDate', value },
        currencies,
      );
      return {
        ...session,
        datePicker: {
          ...picker,
          dayIndex: nextDayWheelIndex(picker.dayIndex, date, next, action.part),
          monthIndex: nextMonthWheelIndex(picker.monthIndex, date, next, action.part),
        },
        drafts: { ...session.drafts, [draft.group]: draft },
      };
    }
    case 'form': {
      if (
        !active ||
        session.groupPicker !== 'closed' ||
        session.datePicker ||
        active.group !== action.group
      ) {
        return session;
      }
      if (
        session.choicePickerOpen &&
        (action.action.type === 'fieldInfo.open' || action.action.type === 'fieldInfo.close')
      ) {
        return session;
      }
      const draft = updateAccountDraft(active, action.action, currencies);
      return draft === active
        ? session
        : { ...session, drafts: { ...session.drafts, [draft.group]: draft } };
    }
  }
}
