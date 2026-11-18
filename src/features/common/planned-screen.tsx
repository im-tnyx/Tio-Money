import { ScreenContainer } from '@/shared/ui/screen-container';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StatePanel } from '@/shared/ui/state-panel';

export function PlannedScreen({
  title,
  subtitle,
  next,
}: {
  title: string;
  subtitle: string;
  next: string;
}) {
  return (
    <ScreenContainer>
      <ScreenHeader title={title} subtitle={subtitle} />
      <StatePanel title="Your data stays yours" description={next} state="planned" />
    </ScreenContainer>
  );
}
