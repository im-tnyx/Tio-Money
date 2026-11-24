import type { CurrencyCode, CurrencyPreferences } from '@/shared/currency/currency-preference';
import type { TranslationKey } from '@/shared/i18n/strings';

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
export const walletKinds = ['funded', 'bank-linked'] as const;
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

type WalletKind = (typeof walletKinds)[number];
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

interface WalletFields extends OpeningAmountFields {
  readonly provider: string;
}

interface LoanFields extends CommonFields {
  readonly originalPrincipal: string;
  readonly outstandingPrincipal: string;
  readonly startDate: string;
  readonly nextDueDate: string;
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
  | (Draft<'wallet', WalletFields> & { readonly walletKind: WalletKind })
  | (Draft<'loan', LoanFields> & { readonly direction: LoanDirection })
  | (Draft<'investment', InvestmentFields> & { readonly investmentKind: InvestmentKind });

type GroupFields<Group extends PreviewGroup> = Extract<AccountDraft, { group: Group }>['fields'];
export type DraftField = {
  [Group in PreviewGroup]: keyof GroupFields<Group>;
}[PreviewGroup];

export function isPreviewGroup(value: unknown): value is PreviewGroup {
  return previewGroups.some((group) => group === value);
}

export function draftCurrencies(preferences: Pick<CurrencyPreferences, 'mainCode' | 'subCodes'>) {
  return [preferences.mainCode, ...preferences.subCodes];
}

function hasIndependentCurrency(draft: AccountDraft): boolean {
  return draft.group !== 'wallet' || draft.walletKind === 'funded';
}

/** A missing choice list means the entire selector is hidden. */
export function accountCurrencyChoices(
  draft: AccountDraft,
  configuredCurrencies: readonly CurrencyCode[],
): readonly CurrencyCode[] | null {
  return configuredCurrencies.length > 1 && hasIndependentCurrency(draft)
    ? configuredCurrencies
    : null;
}

export function newAccountDraft(group: PreviewGroup, currency: CurrencyCode): AccountDraft {
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
        fields: { ...common, outstanding: '', creditLimit: '', statementDate: '', dueDate: '' },
      };
    case 'wallet':
      return {
        group,
        currency,
        fields: { ...common, openingAmount: '', provider: '' },
        walletKind: 'funded',
      };
    case 'loan':
      return {
        group,
        currency,
        fields: {
          ...common,
          originalPrincipal: '',
          outstandingPrincipal: '',
          startDate: '',
          nextDueDate: '',
        },
        direction: 'borrowed',
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

export type AccountFormAction =
  | { readonly type: 'text'; readonly field: DraftField; readonly value: string }
  | { readonly type: 'currency'; readonly value: CurrencyCode }
  | { readonly type: 'wallet.kind'; readonly value: WalletKind }
  | { readonly type: 'loan.direction'; readonly value: LoanDirection }
  | { readonly type: 'investment.kind'; readonly value: InvestmentKind }
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
        fields: { ...draft.fields, originalPrincipal: '', outstandingPrincipal: '' },
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
      return Object.hasOwn(draft.fields, action.field)
        ? withDraftFields(draft, { [action.field]: action.value })
        : draft;
    case 'currency':
      return draft.currency !== action.value &&
        accountCurrencyChoices(draft, allowedCurrencies)?.includes(action.value)
        ? changeCurrency(draft, action.value)
        : draft;
    case 'wallet.kind':
      return draft.group === 'wallet' ? { ...draft, walletKind: action.value } : draft;
    case 'loan.direction':
      return draft.group === 'loan' ? { ...draft, direction: action.value } : draft;
    case 'investment.kind':
      return draft.group === 'investment' ? { ...draft, investmentKind: action.value } : draft;
    default:
      return draft.group === 'bank' ? updateModes(draft, action) : draft;
  }
}

export interface AddAccountViewModel {
  readonly draft: AccountDraft;
  readonly currencySymbol: string;
  readonly currencyChoices:
    | readonly { readonly value: CurrencyCode; readonly label: string; readonly symbol: string }[]
    | null;
  readonly showWalletFunding: boolean;
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
  readonly onSelect?: () => void;
}

export interface AddAccountSheetViewModel {
  readonly animate: boolean;
  readonly content:
    | { readonly kind: 'group'; readonly choices: readonly AccountGroupChoice[] }
    | { readonly kind: 'form'; readonly form: AddAccountViewModel }
    | null;
  readonly onDismiss: () => void;
}
