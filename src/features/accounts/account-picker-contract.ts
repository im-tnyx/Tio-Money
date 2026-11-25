/** Already-eligible, controller-projected account choices. No finance reads or writes. */
export interface AccountPickerOption {
  readonly id: string;
  readonly name: string;
  readonly group: 'cash' | 'bank';
}

export interface AccountPickerModel {
  readonly accounts: readonly AccountPickerOption[];
  readonly selectedId: string | null;
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  /** The controller validates the current ID and closes the sheet on selection. */
  readonly onSelect: (id: string) => void;
}

export function accountPickerGroups(accounts: readonly AccountPickerOption[]) {
  return (['cash', 'bank'] as const)
    .map((group) => ({ group, accounts: accounts.filter((account) => account.group === group) }))
    .filter((section) => section.accounts.length > 0);
}

export function selectedAccountName(picker: AccountPickerModel | null): string | null {
  return picker?.accounts.find((account) => account.id === picker.selectedId)?.name ?? null;
}

export function accountPickerVisible(picker: AccountPickerModel | null): boolean {
  return picker !== null && picker.open && picker.accounts.length > 0;
}
