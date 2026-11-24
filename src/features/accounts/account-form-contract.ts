import type { CurrencyCode, CurrencyPreferences } from '@/shared/currency/currency-preference';
import type { TranslationKey } from '@/shared/i18n/strings';
import type { AppDateFieldModel } from '@/shared/ui/app-date-field';
import { localCalendarToday, parseCalendarDate } from '@/shared/ui/calendar-date';

import type { AccountPickerModel } from './account-picker-contract';

export const previewGroups = [
  'cash',
  'bank',
  'credit-card',
  'wallet',
  'loan',
  'investment',
] as const;
export type PreviewGroup = (typeof previewGroups)[number];

export const paymentModeTypes = ['debitCard', 'upi', 'cheque', 'internetBanking'] as const;
export const loanDirections = ['borrowed', 'given'] as const;
export const investmentKinds = [
  'stocks',
  'mutualFunds',
  'fixedDeposit',
  'gold',
  'ppf',
  'other',
] as const;

type PaymentModeType = (typeof paymentModeTypes)[number];
const paymentModeLimits = {
  debitCard: 3,
  upi: 3,
  cheque: 1,
  internetBanking: 1,
} satisfies Record<PaymentModeType, number>;

type LoanDirection = (typeof loanDirections)[number];
type InvestmentKind = (typeof investmentKinds)[number];

export interface PaymentModeDraft {
  readonly id: number;
  readonly name: string;
  readonly kind: PaymentModeType;
}

interface ModeEditor {
  readonly id: number | null;
  readonly name: string;
  readonly kind: PaymentModeType;
}

interface CommonFields {
  readonly name: string;
  readonly description: string;
}

interface OpeningAmountFields extends CommonFields {
  readonly openingAmount: string;
}

interface CardFields extends CommonFields {
  readonly outstanding: string;
  readonly creditLimit: string;
  readonly statementDate: string;
  readonly dueDate: string;
}

interface LoanFields extends CommonFields {
  readonly originalPrincipal: string;
  readonly fees: string;
  readonly interestRate: string;
  readonly emiAmount: string;
  readonly startDate: string;
}

export const loanFieldInfoFields = ['originalPrincipal', 'fees', 'interestRate'] as const;
export type LoanFieldInfo = (typeof loanFieldInfoFields)[number];

export function isLoanFieldInfo(value: unknown): value is LoanFieldInfo {
  return loanFieldInfoFields.some((field) => field === value);
}

interface InvestmentFields extends CommonFields {
  readonly investedCost: string;
  readonly valuation: string;
  readonly valuationDate: string;
}

interface Draft<Group extends PreviewGroup, Fields extends CommonFields> {
  readonly group: Group;
  readonly currency: CurrencyCode;
  readonly fields: Fields;
}

export type AccountDraft =
  | Draft<'cash', OpeningAmountFields>
  | (Draft<'bank', OpeningAmountFields> & {
      readonly modes: readonly PaymentModeDraft[];
      readonly nextModeId: number;
      readonly modeEditor: ModeEditor | null;
    })
  | Draft<'credit-card', CardFields>
  | Draft<'wallet', OpeningAmountFields>
  | (Draft<'loan', LoanFields> & {
      readonly direction: LoanDirection;
      readonly moreDetailsOpen: boolean;
      readonly fieldInfo: LoanFieldInfo | null;
    })
  | (Draft<'investment', InvestmentFields> & { readonly investmentKind: InvestmentKind });

type GroupFields<Group extends PreviewGroup> = Extract<AccountDraft, { group: Group }>['fields'];
export type DraftField = {
  [Group in PreviewGroup]: keyof GroupFields<Group>;
}[PreviewGroup];

export type LoanDateField = 'startDate';
export type CalendarDateField = LoanDateField | 'valuationDate';
type CalendarDateParts = Readonly<Record<'day' | 'month' | 'year', string>>;
export type CalendarDatePart = keyof CalendarDateParts;

export function isCalendarDateField(field: DraftField): field is CalendarDateField {
  return field === 'startDate' || field === 'valuationDate';
}

export function calendarDateParts(value: string): CalendarDateParts {
  const [year = '', month = '', day = ''] = value.split('-');
  return { year, month, day };
}

export function isPreviewGroup(value: unknown): value is PreviewGroup {
  return previewGroups.some((group) => group === value);
}

export function draftCurrencies(preferences: Pick<CurrencyPreferences, 'mainCode' | 'subCodes'>) {
  return [preferences.mainCode, ...preferences.subCodes];
}

/** All six account forms have an independent currency. Hide the selector without Subs. */
export function accountCurrencyChoices(
  configuredCurrencies: readonly CurrencyCode[],
): readonly CurrencyCode[] | null {
  return configuredCurrencies.length > 1 ? configuredCurrencies : null;
}

export function newAccountDraft(
  group: PreviewGroup,
  currency: CurrencyCode,
  today = localCalendarToday(),
): AccountDraft {
  const common = { name: '', description: '' };
  switch (group) {
    case 'cash':
      return { group, currency, fields: { ...common, openingAmount: '' } };
    case 'bank':
      return {
        group,
        currency,
        fields: { ...common, openingAmount: '' },
        modes: [],
        modeEditor: null,
        nextModeId: 1,
      };
    case 'credit-card':
      return {
        group,
        currency,
        fields: { ...common, outstanding: '', creditLimit: '', statementDate: '01', dueDate: '15' },
      };
    case 'wallet':
      return { group, currency, fields: { ...common, openingAmount: '' } };
    case 'loan':
      return {
        group,
        currency,
        fields: {
          ...common,
          originalPrincipal: '',
          fees: '',
          interestRate: '',
          emiAmount: '',
          startDate: today,
        },
        direction: 'borrowed',
        moreDetailsOpen: false,
        fieldInfo: null,
      };
    case 'investment':
      return {
        group,
        currency,
        fields: { ...common, investedCost: '', valuation: '', valuationDate: '' },
        investmentKind: 'stocks',
      };
  }
}

type PaymentModeAction =
  | { readonly type: 'mode.open'; readonly id?: number }
  | { readonly type: 'mode.name'; readonly value: string }
  | { readonly type: 'mode.kind'; readonly value: PaymentModeType }
  | { readonly type: 'mode.apply' | 'mode.cancel' }
  | { readonly type: 'mode.remove'; readonly id: number };

export type AccountChoiceAction =
  | { readonly type: 'loan.direction'; readonly value: LoanDirection }
  | { readonly type: 'investment.kind'; readonly value: InvestmentKind };

export type AccountFormAction =
  | { readonly type: 'text'; readonly field: DraftField; readonly value: string }
  | {
      readonly type: 'date.part';
      readonly field: CalendarDateField;
      readonly part: CalendarDatePart;
      readonly value: string;
    }
  | { readonly type: 'currency'; readonly value: CurrencyCode }
  | { readonly type: 'moreDetails.toggle' }
  | { readonly type: 'fieldInfo.open'; readonly field: LoanFieldInfo }
  | { readonly type: 'fieldInfo.close' }
  | AccountChoiceAction
  | PaymentModeAction;

/** Merge only string-valued fields while preserving the draft's discriminant. */
function withDraftFields<Current extends AccountDraft>(
  draft: Current,
  fields: Partial<Record<DraftField, string>>,
) {
  return { ...draft, fields: { ...draft.fields, ...fields } };
}

function changeCurrency(draft: AccountDraft, currency: CurrencyCode): AccountDraft {
  switch (draft.group) {
    case 'cash':
    case 'bank':
    case 'wallet':
      return { ...withDraftFields(draft, { openingAmount: '' }), currency };
    case 'credit-card':
      return { ...draft, currency, fields: { ...draft.fields, outstanding: '', creditLimit: '' } };
    case 'loan':
      return {
        ...draft,
        currency,
        fields: { ...draft.fields, originalPrincipal: '', fees: '', emiAmount: '' },
      };
    case 'investment':
      return { ...draft, currency, fields: { ...draft.fields, investedCost: '', valuation: '' } };
  }
}

/** Clear amounts before falling back from a currency removed in Settings. */
export function reconcileAccountDraftCurrency(
  draft: AccountDraft,
  mainCurrency: CurrencyCode,
  configuredCurrencies: readonly CurrencyCode[],
): AccountDraft {
  return configuredCurrencies.includes(draft.currency)
    ? draft
    : changeCurrency(draft, mainCurrency);
}

function canUsePaymentMode(
  draft: Extract<AccountDraft, { group: 'bank' }>,
  kind: PaymentModeType,
  editingId: number | null,
): boolean {
  return (
    draft.modes.some((mode) => mode.id === editingId && mode.kind === kind) ||
    draft.modes.filter((mode) => mode.kind === kind).length < paymentModeLimits[kind]
  );
}

export function paymentModeAvailability(draft: Extract<AccountDraft, { group: 'bank' }>) {
  const editor = draft.modeEditor;
  const availableTypes = paymentModeTypes.filter((kind) =>
    canUsePaymentMode(draft, kind, editor?.id ?? null),
  );
  return {
    availableTypes,
    canAdd: paymentModeTypes.some((kind) => canUsePaymentMode(draft, kind, null)),
    canApply:
      editor !== null && Boolean(editor.name.trim()) && availableTypes.includes(editor.kind),
  };
}

function updateModes(
  draft: Extract<AccountDraft, { group: 'bank' }>,
  action: PaymentModeAction,
): AccountDraft {
  const editor = draft.modeEditor;
  switch (action.type) {
    case 'mode.open': {
      if (editor) return draft;
      if (action.id === undefined) {
        const kind = paymentModeTypes.find((type) => canUsePaymentMode(draft, type, null));
        return kind ? { ...draft, modeEditor: { id: null, name: '', kind } } : draft;
      }
      const existing = draft.modes.find(({ id }) => id === action.id);
      return existing ? { ...draft, modeEditor: existing } : draft;
    }
    case 'mode.name':
      return editor ? { ...draft, modeEditor: { ...editor, name: action.value } } : draft;
    case 'mode.kind':
      return editor && canUsePaymentMode(draft, action.value, editor.id)
        ? { ...draft, modeEditor: { ...editor, kind: action.value } }
        : draft;
    case 'mode.cancel':
      return { ...draft, modeEditor: null };
    case 'mode.remove':
      return editor ? draft : { ...draft, modes: draft.modes.filter(({ id }) => id !== action.id) };
    case 'mode.apply': {
      const name = editor?.name.trim();
      if (!editor || !name || !canUsePaymentMode(draft, editor.kind, editor.id)) return draft;
      if (editor.id === null) {
        return {
          ...draft,
          modeEditor: null,
          nextModeId: draft.nextModeId + 1,
          modes: [...draft.modes, { id: draft.nextModeId, name, kind: editor.kind }],
        };
      }
      return {
        ...draft,
        modeEditor: null,
        modes: draft.modes.map((mode) =>
          mode.id === editor.id ? { ...mode, name, kind: editor.kind } : mode,
        ),
      };
    }
  }
}

export function updateAccountDraft(
  draft: AccountDraft,
  action: AccountFormAction,
  allowedCurrencies: readonly CurrencyCode[],
): AccountDraft {
  switch (action.type) {
    case 'text':
      if (
        draft.group === 'loan' &&
        action.field === 'startDate' &&
        !parseCalendarDate(action.value)
      ) {
        return draft;
      }
      if (
        draft.group === 'credit-card' &&
        (action.field === 'statementDate' || action.field === 'dueDate') &&
        (!/^\d{0,2}$/.test(action.value) || action.value === '00' || Number(action.value) > 31)
      ) {
        return draft;
      }
      return Object.hasOwn(draft.fields, action.field)
        ? withDraftFields(draft, { [action.field]: action.value })
        : draft;
    case 'date.part': {
      const { field, part, value } = action;
      if (draft.group === 'loan') return draft;
      if (!Object.hasOwn(draft.fields, field) || !/^\d{0,4}$/.test(value)) return draft;
      const limit = part === 'month' ? 12 : 31;
      if (part !== 'year' && (value.length > 2 || value === '00' || Number(value) > limit)) {
        return draft;
      }
      const previous = (draft.fields as Partial<Record<CalendarDateField, string>>)[field] ?? '';
      const parts = { ...calendarDateParts(previous) };
      parts[part] = value;
      const { year, month, day } = parts;
      const next = year || month || day ? [year, month, day].join('-') : '';
      return next === previous ? draft : withDraftFields(draft, { [field]: next });
    }
    case 'currency':
      return draft.currency !== action.value &&
        accountCurrencyChoices(allowedCurrencies)?.includes(action.value)
        ? changeCurrency(draft, action.value)
        : draft;
    case 'loan.direction':
      return draft.group === 'loan' ? { ...draft, direction: action.value } : draft;
    case 'moreDetails.toggle':
      return draft.group === 'loan'
        ? {
            ...draft,
            moreDetailsOpen: !draft.moreDetailsOpen,
            fieldInfo: draft.moreDetailsOpen ? null : draft.fieldInfo,
          }
        : draft;
    case 'fieldInfo.open':
      return draft.group === 'loan' &&
        draft.moreDetailsOpen &&
        draft.fieldInfo !== action.field
        ? { ...draft, fieldInfo: action.field }
        : draft;
    case 'fieldInfo.close':
      return draft.group === 'loan' && draft.fieldInfo !== null
        ? { ...draft, fieldInfo: null }
        : draft;
    case 'investment.kind':
      return draft.group === 'investment' ? { ...draft, investmentKind: action.value } : draft;
    default:
      return draft.group === 'bank' ? updateModes(draft, action) : draft;
  }
}

export interface AccountOption {
  readonly value: string;
  readonly label: string;
  readonly selected: boolean;
  readonly onSelect?: () => void;
  readonly accessibilityHint?: string;
}

export interface AccountDraftChoice {
  readonly label: TranslationKey;
  readonly value: TranslationKey;
  readonly options: readonly AccountOption[];
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
}

export interface AddAccountViewModel {
  readonly draft: AccountDraft;
  readonly currencySymbol: string;
  readonly currencyChoices:
    | readonly { readonly value: CurrencyCode; readonly label: string; readonly symbol: string }[]
    | null;
  readonly choice: AccountDraftChoice | null;
  readonly paymentSource: AccountPickerModel | null;
  readonly loanDates: Readonly<Record<LoanDateField, AppDateFieldModel>> | null;
  readonly canAddMode: boolean;
  readonly canApplyMode: boolean;
  readonly availableModeTypes: readonly PaymentModeType[];
  readonly onAction: (action: AccountFormAction) => void;
}

export interface AccountGroupChoice {
  readonly id: PreviewGroup | 'insurance';
  readonly label: TranslationKey;
  readonly detail: TranslationKey;
  readonly status?: TranslationKey;
  readonly selected?: boolean;
  readonly onSelect?: () => void;
}

export interface AddAccountScreenViewModel {
  readonly animateSheet: boolean;
  readonly groupLabel: TranslationKey;
  readonly groupChoices: readonly AccountGroupChoice[] | null;
  readonly form: AddAccountViewModel | null;
  readonly onOpenGroupPicker: () => void;
  readonly onCloseGroupPicker: () => void;
  readonly onClose: () => void;
}
