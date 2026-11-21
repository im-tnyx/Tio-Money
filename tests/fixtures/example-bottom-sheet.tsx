import { AppBottomSheet } from '../../src/shared/ui/app-bottom-sheet';
import { AppText } from '../../src/shared/ui/app-text';

/** Test-only second consumer. No new route or product feature is introduced. */
export function ExampleBottomSheetFixture({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <AppBottomSheet
      visible={visible}
      title="Example"
      dismissAccessibilityLabel="Close example"
      onDismiss={onDismiss}
    >
      <AppText>Independent test-only content</AppText>
    </AppBottomSheet>
  );
}
