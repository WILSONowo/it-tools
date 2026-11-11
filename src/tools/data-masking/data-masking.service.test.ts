import { describe, expect, it } from 'vitest';
import { MASK_RULES, maskText } from './data-masking.service';

const all = [...MASK_RULES];

describe('maskText', () => {
  it('masks an ID card number fully, including the birth date', () => {
    expect(maskText('身份证 11010519491231002X', all)).toBe('身份证 110105********002X');
    expect(maskText('身份证: 110101199001011234', all)).toBe('身份证: 110101********1234');
  });

  it('masks phone numbers with and without separators or country code', () => {
    expect(maskText('电话: 13812345678', all)).toBe('电话: 138****5678');
    expect(maskText('138-1234-5678', ['phone'])).toBe('138-****-5678');
    expect(maskText('138 1234 5678', ['phone'])).toBe('138 **** 5678');
    expect(maskText('+8613812345678', ['phone'])).toBe('+86138****5678');
  });

  it('does not treat a slice of a longer number as a phone number', () => {
    expect(maskText('订单号 9913812345678999', ['phone'])).toBe('订单号 9913812345678999');
  });

  it('masks bank cards, grouped or not', () => {
    expect(maskText('卡号 6222021234567890123', ['card'])).toBe('卡号 6222 **** **** 0123');
    expect(maskText('6222 0212 3456 7890', ['card'])).toBe('6222 **** **** 7890');
  });

  it('masks emails and IPv4 addresses', () => {
    expect(maskText('zhangsan@example.com', ['email'])).toBe('z***@example.com');
    expect(maskText('来源 192.168.10.25', ['ip'])).toBe('来源 192.168.*.*');
    expect(maskText('版本 1.2.3.999', ['ip'])).toBe('版本 1.2.3.999');
  });

  it('masks labelled names and name-only lines, but not ordinary text', () => {
    expect(maskText('联系人: 张三 电话', ['name'])).toBe('联系人: 张* 电话');
    expect(maskText('姓名:欧阳娜娜,', ['name'])).toBe('姓名:欧***,');
    expect(maskText('收件人 阿卜杜·热合曼', ['name'])).toBe('收件人 阿******');
    expect(maskText('张三\n李四四\n', ['name'])).toBe('张*\n李**\n');
    expect(maskText('今天天气很好。', ['name'])).toBe('今天天气很好。');
    expect(maskText('卡号: 6222', ['name'])).toBe('卡号: 6222');
  });

  it('applies only the selected rules', () => {
    expect(maskText('13812345678 zhangsan@example.com', ['email'])).toBe('13812345678 z***@example.com');
  });

  it('masks the default sample end to end', () => {
    expect(maskText('联系人: 张三 电话: 13812345678 邮箱: zhangsan@example.com 身份证: 110101199001011234', all)).toBe(
      '联系人: 张* 电话: 138****5678 邮箱: z***@example.com 身份证: 110101********1234',
    );
  });
});
