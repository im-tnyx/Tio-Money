import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTopBar } from '@/shared/ui/app-top-bar';

import { BUILT_IN_ACCOUNT_GROUPS } from './account-group-templates';

/** Read-only templates. No financial account writes or group editing in this UI slice. */
export function AccountGroupsScreen({ onBack }: { readonly onBack: () => void }) {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <AppTopBar
        title={t('accountGroups')}
        onBack={onBack}
        backAccessibilityLabel={t('accountGroupsBack')}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          gap: theme.space.md,
        }}
      >
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <AppText variant="caption" muted>
            {t('accountGroupsReadOnly')}
          </AppText>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderTopWidth: theme.navigation.borderWidth,
            borderBottomWidth: theme.navigation.borderWidth,
            borderColor: theme.colors.border,
          }}
        >
          {BUILT_IN_ACCOUNT_GROUPS.map((group, index) => (
            <View
              key={group.id}
              accessible
              accessibilityLabel={t(group.label) + '. ' + t(group.detail)}
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                gap: theme.space.xxs,
                borderBottomWidth:
                  index === BUILT_IN_ACCOUNT_GROUPS.length - 1
                    ? theme.navigation.origin
                    : theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText>{t(group.label)}</AppText>
              <AppText variant="caption" muted>
                {t(group.detail)}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
