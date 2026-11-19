import { Redirect } from 'expo-router';

/** Preserve old deep links; transaction history lives under the Trans. destination. */
export default function LegacyHistoryRoute() {
  return <Redirect href="/transactions" />;
}
