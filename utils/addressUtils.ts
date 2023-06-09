export function formatAddress(address: string, startLength: number = 4, endLength: number = 5): string {
  if (!address) return '';

  const addressStart = address.slice(0, startLength);
  const addressEnd = address.slice(-endLength);

  return `${addressStart}..${addressEnd}`;
}
