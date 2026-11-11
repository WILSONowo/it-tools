function maskPhone(value: string): string {
  return value.replace(/(1[3-9]\d)(\d{4})(\d{4})/g, '$1****$3');
}

function maskBankCard(value: string): string {
  return value.replace(/(\d{4})\d+(\d{4})/g, '$1 **** **** $2');
}

function maskIdCard(value: string): string {
  return value.replace(/(\d{6})\d{8}(\d{3}[\dXx])/g, '$1********$2');
}

function maskEmail(value: string): string {
  return value.replace(/([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(?=@)/g, '$1***');
}

function maskIp(value: string): string {
  return value.replace(/(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}/g, '$1.$2.*.*');
}

function maskChineseName(value: string): string {
  const chineseName = /[\u4e00-\u9fa5]{2,4}(?=[\s,，。;；:：\n]|$)/g;
  return value.replace(chineseName, (name) => {
    if (name.length <= 2) return `${name[0]}*`;
    return `${name[0]}${'*'.repeat(name.length - 1)}`;
  });
}

export function maskText(text: string, rules: string[]): string {
  let result = text;
  if (rules.includes('phone')) result = maskPhone(result);
  if (rules.includes('card')) result = maskBankCard(result);
  if (rules.includes('idcard')) result = maskIdCard(result);
  if (rules.includes('email')) result = maskEmail(result);
  if (rules.includes('ip')) result = maskIp(result);
  if (rules.includes('name')) result = maskChineseName(result);

  return result;
}
