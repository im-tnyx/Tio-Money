import { useRouter } from 'expo-router';

import { AccountGroupsScreen } from './account-groups-screen';
import { useAccountGroupsViewModel } from './use-account-groups-view-model';

/** Router concerns stay in this controller; screens receive only state and intents. */
export function AccountGroupsRoute() {
  const router = useRouter();
  const { state, onAction } = useAccountGroupsViewModel(() => router.back());
  return <AccountGroupsScreen state={state} onAction={onAction} />;
}
