import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import { isPreviewGroup, type PreviewGroup } from './account-form-contract';
import { AccountsScreen, ManageAccountsScreen, type AccountGroupChoice } from './accounts-screen';

export function AccountsRoute() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pickerVisible, setPickerVisible] = useState(false);
  const pendingGroup = useRef<PreviewGroup | null>(null);

  const openPendingForm = useCallback(() => {
    const group = pendingGroup.current;
    pendingGroup.current = null;
    if (group !== null) router.push({ pathname: '/add-account/[group]', params: { group } });
  }, [router]);

  // Android Modal has no dismissal callback. Commit the hidden modal before pushing.
  useEffect(() => {
    if (pickerVisible || Platform.OS === 'ios' || pendingGroup.current === null) return;
    const frame = requestAnimationFrame(openPendingForm);
    return () => cancelAnimationFrame(frame);
  }, [openPendingForm, pickerVisible]);

  function closePicker() {
    setPickerVisible(false);
  }

  const choices: readonly AccountGroupChoice[] = BUILT_IN_ACCOUNT_GROUPS.map(
    ({ id, label, detail }) => {
      if (!isPreviewGroup(id)) {
        return { id, label, detail: id === 'insurance' ? detail : 'accountGroupUnavailable' };
      }
      return {
        id,
        label,
        onSelect: () => {
          if (pendingGroup.current !== null) return;
          pendingGroup.current = id;
          closePicker();
        },
      };
    },
  );

  return (
    <AccountsScreen
      choices={choices}
      pickerVisible={pickerVisible}
      animatePicker={Platform.OS === 'ios' && !reduceMotion}
      onAdd={() => {
        if (pendingGroup.current === null) setPickerVisible(true);
      }}
      onClosePicker={closePicker}
      onPickerDismissed={openPendingForm}
    />
  );
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
