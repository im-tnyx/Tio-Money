export type AppErrorCode = 'DATABASE_INIT' | 'DATABASE_MIGRATION' | 'UNEXPECTED';

/** Public messages contain no SQL statements, account details or raw exception payload. */
export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}

export function publicErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return 'Something went wrong. Please retry or restart the app.';
}
