export function convertBase({ value, fromBase, toBase }: { value: string; fromBase: number; toBase: number }) {
  const range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);
  let decValue = value
    .split('')
    .reverse()
    .reduce((carry: number, digit: string, index: number) => {
      if (!fromRange.includes(digit)) {
        throw new Error('数字 "' + digit + '" 对于 ' + fromBase + ' 进制无效。');
      }
      return (carry += fromRange.indexOf(digit) * Math.pow(fromBase, index));
    }, 0);
  let newValue = '';
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue;
    decValue = (decValue - (decValue % toBase)) / toBase;
  }
  return newValue || '0';
}
