<template>
  <n-card title="ASCII 码表 (0-127)">
    <n-space align="center" style="margin-bottom: 14px">
      <n-input v-model:value="search" placeholder="按名称、字符或代码搜索..." clearable style="max-width: 300px" />
      <n-checkbox v-model:value="onlyPrintable">仅可打印字符</n-checkbox>
      <n-checkbox v-model:value="onlyExtended">包含扩展字符 (128-255)</n-checkbox>
    </n-space>

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

const extendedNames: Record<number, string> = {
  128: 'Ç',
  129: 'ü',
  130: 'é',
  131: 'â',
  132: 'ä',
  133: 'à',
  134: 'å',
  135: 'ç',
  136: 'ê',
  137: 'ë',
  138: 'è',
  139: 'ï',
  140: 'î',
  141: 'ì',
  142: 'Ä',
  143: 'Å',
  144: 'É',
  145: 'æ',
  146: 'Æ',
  147: 'ô',
  148: 'ö',
  149: 'ò',
  150: 'û',
  151: 'ù',
  152: 'ÿ',
  153: 'Ö',
  154: 'Ü',
  155: '¢',
  156: '£',
  157: '¥',
  158: '₧',
  159: 'ƒ',
  160: 'á',
  161: 'í',
  162: 'ó',
  163: 'ú',
  164: 'ñ',
  165: 'Ñ',
  166: 'ª',
  167: 'º',
  168: '¿',
  169: '⌐',
  170: '¬',
  171: '½',
  172: '¼',
  173: '¡',
  174: '«',
  175: '»',
  176: '░',
  177: '▒',
  178: '▓',
  179: '│',
  180: '┤',
  181: '╡',
  182: '╢',
  183: '╖',
  184: '╕',
  185: '╣',
  186: '║',
  187: '╗',
  188: '╝',
  189: '╜',
  190: '╛',
  191: '┐',
  192: '└',
  193: '┴',
  194: '┬',
  195: '├',
  196: '─',
  197: '┼',
  198: '╞',
  199: '╟',
  200: '╚',
  201: '╔',
  202: '╩',
  203: '╦',
  204: '╠',
  205: '═',
  206: '╬',
  207: '╧',
  208: '╨',
  209: '╤',
  210: '╥',
  211: '╙',
  212: '╘',
  213: '╒',
  214: '╓',
  215: '╫',
  216: '╪',
  217: '┘',
  218: '┌',
  219: '█',
  220: '▄',
  221: '▌',
  222: '▐',
  223: '▀',
  224: 'α',
  225: 'ß',
  226: 'Γ',
  227: 'π',
  228: 'Σ',
  229: 'σ',
  230: 'µ',
  231: 'τ',
  232: 'Φ',
  233: 'Θ',
  234: 'Ω',
  235: 'δ',
  236: '∞',
  237: 'φ',
  238: 'ε',
  239: '∩',
  240: '≡',
  241: '±',
  242: '≥',
  243: '≤',
  244: '⌠',
  245: '⌡',
  246: '÷',
  247: '≈',
  248: '°',
  249: '∙',
  250: '·',
  251: '√',
  252: 'ⁿ',
  253: '²',
  254: '■',
  255: 'nbsp',
};

function htmlEntity(dec: number, printable: boolean, char: string) {
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
    const printable = (dec >= 32 && dec <= 126) || (onlyExtended.value && dec >= 160 && dec <= 255);
    const control = controlNames[dec]?.[0] ?? (onlyExtended.value ? 'ext' : '');
    const name = dec <= 127 ? controlNames[dec]?.[1] ?? char : extendedNames[dec] ?? `Char ${dec}`;
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
