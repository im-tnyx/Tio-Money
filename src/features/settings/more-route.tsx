import { MoreScreen } from './more-screen';
import { useMoreViewModel } from './use-more-view-model';

/** Route composes ViewModel and presentation without screen-owned state. */
export function MoreRoute() {
  const { state, onAction } = useMoreViewModel();
  return <MoreScreen state={state} onAction={onAction} />;
}
