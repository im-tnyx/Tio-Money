/** Native SMS access is not part of the Expo Go/iPhone build. */
export interface SmsImportPort {
  readonly availability: 'unavailable' | 'eligible-native-build';
  isAvailable(): Promise<boolean>;
}

export const disabledSmsAdapter: SmsImportPort = {
  availability: 'unavailable',
  async isAvailable() {
    return false;
  },
};

/** A future native adapter requires written owner/policy approval and a separate build. */
