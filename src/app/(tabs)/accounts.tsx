import { PlannedScreen } from '@/features/common/planned-screen';

export default function AccountsRoute() {
  return (
    <PlannedScreen
      title="Accounts"
      subtitle="Cash, bank, funded wallet and card — carefully distinguished."
      next="Account setup and balance views arrive after the UI and journal phases. Credit cards will be displayed as outstanding liabilities."
    />
  );
}
