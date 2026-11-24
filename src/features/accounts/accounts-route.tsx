import { useRouter } from 'expo-router';

import { AccountsScreen, ManageAccountsScreen } from './accounts-screen';
import { AddAccountScreen } from './add-account-screen';
import { useAddAccountViewModel } from './use-add-account-view-model';

export function AccountsRoute() {
  const router = useRouter();
  return <AccountsScreen onAdd={() => router.navigate('/add-account')} />;
}

export function AddAccountRoute() {
  return <AddAccountScreen {...useAddAccountViewModel()} />;
}

export function ManageAccountsRoute() {
  const router = useRouter();
  return (
    <ManageAccountsScreen
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/more');
      }}
    />
  );
}
