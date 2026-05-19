export function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-PK');
}
