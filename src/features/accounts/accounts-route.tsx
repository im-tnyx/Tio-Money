import { useRouter } from 'expo-router';

import { AccountsScreen, ManageAccountsScreen } from './accounts-screen';
import { useAddAccountSheet } from './use-add-account-sheet';

export function AccountsRoute() {
  const { sheet, open } = useAddAccountSheet();
  return <AccountsScreen addAccount={sheet} onAdd={open} />;
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
