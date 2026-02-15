export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: string,
  ) {
    super(`API error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}
