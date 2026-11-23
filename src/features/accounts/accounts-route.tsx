import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import { isPreviewGroup, type PreviewGroup } from './account-form-contract';
import { beginPickerClose, finishPickerClose, type AccountPicker } from './account-picker';
import { AccountsScreen, ManageAccountsScreen, type AccountGroupChoice } from './accounts-screen';

export function AccountsRoute() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pickerVisible, setPickerVisible] = useState(false);
  const picker = useRef<AccountPicker>({ phase: 'idle' });

  useFocusEffect(
    useCallback(
      () => () => {
        picker.current = { phase: 'idle' };
        setPickerVisible(false);
      },
      [],
    ),
  );

  const openPendingForm = useCallback(() => {
    const closing = picker.current;
    if (closing.phase !== 'closing') return;
    picker.current = finishPickerClose(closing);
    if (closing.group !== null) {
      router.push({ pathname: '/add-account/[group]', params: { group: closing.group } });
    }
  }, [router]);

  // Android Modal has no dismissal callback. Commit the hidden modal before pushing.
  useEffect(() => {
    if (pickerVisible || Platform.OS === 'ios' || picker.current.phase !== 'closing') return;
    const frame = requestAnimationFrame(openPendingForm);
    return () => cancelAnimationFrame(frame);
  }, [openPendingForm, pickerVisible]);

  function closePicker(group: PreviewGroup | null) {
    picker.current = beginPickerClose(picker.current, group);
    setPickerVisible(false);
  }

  const choices: readonly AccountGroupChoice[] = BUILT_IN_ACCOUNT_GROUPS.map(
    ({ id, label, detail }) => {
      if (!isPreviewGroup(id))
        return { id, label, detail, status: 'accountInsuranceInformational' };
      return { id, label, detail, onSelect: () => closePicker(id) };
    },
  );

  return (
    <AccountsScreen
      choices={choices}
      pickerVisible={pickerVisible}
      animatePicker={Platform.OS === 'ios' && !reduceMotion}
      onAdd={() => {
        if (picker.current.phase !== 'idle') return;
        picker.current = { phase: 'open' };
        setPickerVisible(true);
      }}
      onClosePicker={() => closePicker(null)}
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
