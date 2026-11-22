import { useRouter } from 'expo-router';

import { AccountGroupsScreen } from './account-groups-screen';

/** Controller owns navigation; the screen is presentation only. */
export function AccountGroupsRoute() {
  const router = useRouter();
  return <AccountGroupsScreen onBack={() => router.back()} />;
}
