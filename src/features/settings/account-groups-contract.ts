import type { CustomGroupLabel } from './account-group-preferences';

export interface AccountGroupsUiState {
  readonly showDescriptions: boolean;
  readonly customGroups: readonly CustomGroupLabel[];
  readonly storageBlocked: boolean;
  readonly canAdd: boolean;
  readonly addSheetVisible: boolean;
  readonly draftName: string;
  readonly draftError: string | null;
  readonly error: string | null;
}

export type AccountGroupsAction =
  | { readonly type: 'back' }
  | { readonly type: 'descriptions.toggle' }
  | { readonly type: 'custom.open' }
  | { readonly type: 'custom.dismiss' }
  | { readonly type: 'custom.name'; readonly name: string }
  | { readonly type: 'custom.save' };
