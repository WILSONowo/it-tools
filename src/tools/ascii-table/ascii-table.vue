<template>
  <n-card :title="onlyExtended ? 'ASCII + ISO-8859-1 (Latin-1) 码表 (0-255)' : 'ASCII 码表 (0-127)'">
    <n-space align="center" style="margin-bottom: 14px">
      <n-input v-model:value="search" placeholder="按名称、字符或代码搜索..." clearable style="max-width: 300px" />
      <n-checkbox v-model:checked="onlyPrintable">仅可打印字符</n-checkbox>
      <n-checkbox v-model:checked="onlyExtended">包含扩展字符 (128-255,ISO-8859-1)</n-checkbox>
    </n-space>
    <n-text v-if="onlyExtended" depth="3" style="display: block; margin-bottom: 10px; font-size: 12px">
      128-255 按 ISO-8859-1(Latin-1)显示,与 Unicode 码位 U+0080–U+00FF 一一对应;其中 128-159 为 C1 控制字符。注意这不是
      DOS 代码页 437(CP437)的制表符/图形字符。
    </n-text>

    <n-table size="small">
      <thead>
        <tr>
          <th>十进制</th>
          <th>十六进制</th>
          <th>二进制</th>
          <th>字符</th>
          <th>HTML 实体</th>
          <th>名称</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filtered" :key="item.dec">
          <td style="font-family: monospace">{{ item.dec }}</td>
          <td style="font-family: monospace">{{ item.hex }}</td>
          <td style="font-family: monospace; font-size: 12px">{{ item.bin }}</td>
          <td style="font-family: monospace; text-align: center">
            <span v-if="item.printable" style="font-size: 15px">{{ item.char }}</span>
            <n-tag v-else size="small" :bordered="false" type="warning">{{ item.control }}</n-tag>
          </td>
          <td style="font-family: monospace">{{ item.entity }}</td>
          <td>{{ item.name }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const search = ref('');
const onlyPrintable = ref(false);
const onlyExtended = ref(false);

const controlNames: Record<number, [string, string]> = {
  0: ['NUL', 'Null'],
  1: ['SOH', '标题开始'],
  2: ['STX', '正文开始'],
  3: ['ETX', '正文结束'],
  4: ['EOT', '传输结束'],
  5: ['ENQ', '询问'],
  6: ['ACK', '确认'],
  7: ['BEL', '响铃'],
  8: ['BS', '退格'],
  9: ['TAB', '水平制表符'],
  10: ['LF', '换行'],
  11: ['VT', '垂直制表符'],
  12: ['FF', '换页'],
  13: ['CR', '回车'],
  14: ['SO', '移出'],
  15: ['SI', '移入'],
  16: ['DLE', '数据链路转义'],
  17: ['DC1', '设备控制 1'],
  18: ['DC2', '设备控制 2'],
  19: ['DC3', '设备控制 3'],
  20: ['DC4', '设备控制 4'],
  21: ['NAK', '否定应答'],
  22: ['SYN', '同步空闲'],
  23: ['ETB', '传输块结束'],
  24: ['CAN', '取消'],
  25: ['EM', '介质用尽'],
  26: ['SUB', '替换'],
  27: ['ESC', '转义'],
  28: ['FS', '文件分隔符'],
  29: ['GS', '组分隔符'],
  30: ['RS', '记录分隔符'],
  31: ['US', '单元分隔符'],
  127: ['DEL', '删除'],
};

// 128-255 follow ISO-8859-1 (Latin-1), i.e. Unicode code points U+0080-U+00FF.
// 128-159 are the C1 control characters; DOS code page 437 glyphs are not used.
const c1ControlNames = [
  'PAD',
  'HOP',
  'BPH',
  'NBH',
  'IND',
  'NEL',
  'SSA',
  'ESA',
  'HTS',
  'HTJ',
  'VTS',
  'PLD',
  'PLU',
  'RI',
  'SS2',
  'SS3',
  'DCS',
  'PU1',
  'PU2',
  'STS',
  'CCH',
  'MW',
  'SPA',
  'EPA',
  'SOS',
  'SGC',
  'SCI',
  'CSI',
  'ST',
  'OSC',
  'PM',
  'APC',
];

const latin1SpecialNames: Record<number, [string, string]> = {
  160: ['NBSP', '不换行空格'],
  173: ['SHY', '软连字符'],
};

function htmlEntity(dec: number, printable: boolean, char: string) {
  if (dec === 160) return '&nbsp;';
  if (dec === 173) return '&shy;';
  if (!printable) return '';
  const named: Record<number, string> = {
    34: '&quot;',
    38: '&amp;',
    39: '&#39;',
    60: '&lt;',
    62: '&gt;',
    160: '&nbsp;',
  };
  if (named[dec]) return named[dec];
  if (dec > 127) return `&#${dec};`;
  return char === ' ' ? '&nbsp;' : '';
}

const data = computed(() => {
  const items: {
    dec: number;
    hex: string;
    bin: string;
    char: string;
    printable: boolean;
    control: string;
    entity: string;
    name: string;
  }[] = [];
  const max = onlyExtended.value ? 255 : 127;
  for (let dec = 0; dec <= max; dec++) {
    const char = String.fromCharCode(dec);
    const isC1 = dec >= 128 && dec <= 159;
    const special = latin1SpecialNames[dec];
    const printable = (dec >= 32 && dec <= 126) || (dec >= 161 && dec <= 255 && dec !== 173);
    const control = controlNames[dec]?.[0] ?? (isC1 ? c1ControlNames[dec - 128] : special?.[0] ?? '');
    let name: string;
    if (dec <= 127) name = controlNames[dec]?.[1] ?? char;
    else if (isC1) name = `C1 控制字符 (U+${dec.toString(16).toUpperCase().padStart(4, '0')})`;
    else name = special?.[1] ?? char;
    items.push({
      dec,
      hex: dec.toString(16).toUpperCase().padStart(2, '0'),
      bin: dec.toString(2).padStart(8, '0'),
      char: dec === 32 ? '␣' : char,
      printable,
      control,
      entity: htmlEntity(dec, printable, char),
      name,
    });
  }

  return items;
});

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  return data.value.filter((item) => {
    if (onlyPrintable.value && !item.printable) return false;
    if (query === '') return true;
    return (
      String(item.dec).includes(query) ||
      item.hex.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.char.toLowerCase().includes(query)
    );
  });
});
</script>
