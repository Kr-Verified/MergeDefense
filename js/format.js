function formatNumber(value, maximumFractionDigits = 0, minimumFractionDigits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return `${value}`;

  return number.toLocaleString('en-US', { maximumFractionDigits, minimumFractionDigits });
}
