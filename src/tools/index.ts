import { tool as tokenGenerator } from './token-generator';
import { tool as passwordGenerator } from './password-generator';
import { tool as passwordStrengthChecker } from './password-strength-checker';
import { tool as hashText } from './hash-text';
import { tool as fileHash } from './file-hash';
import { tool as bcrypt } from './bcrypt';
import { tool as argon2HashGenerator } from './argon2-hash-generator';
import { tool as uuidGenerator } from './uuid-generator';
import { tool as encryption } from './encryption';
import { tool as rsaKeyPairGenerator } from './rsa-key-pair-generator';
import { tool as rsaEncryptDecrypt } from './rsa-encrypt-decrypt';
import { tool as rsaSignVerify } from './rsa-sign-verify';
import { tool as classicCiphers } from './classic-ciphers';
import { tool as morseCodeTranslator } from './morse-code-translator';
import { tool as dataMasking } from './data-masking';
import { tool as bip39Generator } from './bip39-generator';
import { tool as hmacGenerator } from './hmac-generator';
import { tool as checksumBccLrc } from './checksum-bcc-lrc';
import { tool as chmodCalculator } from './chmod-calculator';
import { tool as basicAuthGenerator } from './basic-auth-generator';
import { tool as otpCodeGeneratorAndValidator } from './otp-code-generator-and-validator';
import { tool as jwtParser } from './jwt-parser';
import { tool as dateTimeConverter } from './date-time-converter';
import { tool as unixTimeConverter } from './unix-time-converter';
import { tool as integerBaseConverter } from './integer-base-converter';
import { tool as romanNumeralConverter } from './roman-numeral-converter';
import { tool as base64StringConverter } from './base64-string-converter';
import { tool as base64FileConverter } from './base64-file-converter';
import { tool as colorConverter } from './color-converter';
import { tool as caseConverter } from './case-converter';
import { tool as stringUnicodeConverter } from './string-unicode-converter';
import { tool as htmlJsConverter } from './html-js-converter';
import { tool as rmbCaseConverter } from './rmb-case-converter';
import { tool as chinesePinyin } from './chinese-pinyin';
import { tool as textToNatoAlphabet } from './text-to-nato-alphabet';
import { tool as yamlToJsonConverter } from './yaml-to-json-converter';
import { tool as jsonToYamlConverter } from './json-to-yaml-converter';
import { tool as json5Formatter } from './json5-formatter';
import { tool as jsonToMarkdownTable } from './json-to-markdown-table';
import { tool as jsonToEntityClasses } from './json-to-entity-classes';
import { tool as temperatureConverter } from './temperature-converter';
import { tool as slugifyString } from './slugify-string';
import { tool as urlEncoder } from './url-encoder';
import { tool as punycodeConverter } from './punycode-converter';
import { tool as ipNumberConverter } from './ip-number-converter';
import { tool as htmlEntities } from './html-entities';
import { tool as htmlWysiwygEditor } from './html-wysiwyg-editor';
import { tool as urlParser } from './url-parser';
import { tool as deviceInformation } from './device-information';
import { tool as metaTagGenerator } from './meta-tag-generator';
import { tool as mimeTypes } from './mime-types';
import { tool as keycodeInfo } from './keycode-info';
import { tool as httpStatusCodes } from './http-status-codes';
import { tool as userAgentParser } from './user-agent-parser';
import { tool as qrCodeGenerator } from './qr-code-generator';
import { tool as svgPlaceholderGenerator } from './svg-placeholder-generator';
import { tool as asciiArtGenerator } from './ascii-art-generator';
import { tool as imageCompressor } from './image-compressor';
import { tool as imageCrop } from './image-crop';
import { tool as barcodeGenerator } from './barcode-generator';
import { tool as qrcodeReader } from './qrcode-reader';
import { tool as textToHtmlTable } from './text-to-html-table';
import { tool as urlParamFormatter } from './url-param-formatter';
import { tool as urlBatchGenerator } from './url-batch-generator';
import { tool as ieee754Converter } from './ieee754-converter';
import { tool as endianConverter } from './endian-converter';
import { tool as cutAudio } from './cut-audio';
import { tool as baseEncoding } from './base-encoding';
import { tool as audioConverter } from './audio-converter';
import { tool as videoToAudio } from './video-to-audio';
import { tool as videoConverter } from './video-converter';
import { tool as videoToGif } from './video-to-gif';
import { tool as imageToIco } from './image-to-ico';
import { tool as imageConverter } from './image-converter';
import { tool as gitMemo } from './git-memo';
import { tool as randomPortGenerator } from './random-port-generator';
import { tool as crontabGenerator } from './crontab-generator';
import { tool as jsonViewer } from './json-viewer';
import { tool as jsonMinify } from './json-minify';
import { tool as jsonKeyRenamer } from './json-key-renamer';
import { tool as randomJsonDataGenerator } from './random-json-data-generator';
import { tool as randomDataGenerator } from './random-data-generator';
import { tool as randomHexGenerator } from './random-hex-generator';
import { tool as randomNumberGenerator } from './random-number-generator';
import { tool as sqlPrettify } from './sql-prettify';
import { tool as dockerRunToDockerComposeConverter } from './docker-run-to-docker-compose-converter';
import { tool as regexTester } from './regex-tester';
import { tool as benchmarkBuilder } from './benchmark-builder';
import { tool as ipv4SubnetCalculator } from './ipv4-subnet-calculator';
import { tool as ipv4AddressConverter } from './ipv4-address-converter';
import { tool as cidrAggregator } from './cidr-aggregator';
import { tool as macAddressLookup } from './mac-address-lookup';
import { tool as randomIpGenerator } from './random-ip-generator';
import { tool as ipv6UlaGenerator } from './ipv6-ula-generator';
import { tool as ipv6ExpandCompress } from './ipv6-expand-compress';
import { tool as commonPorts } from './common-ports';
import { tool as mathEvaluator } from './math-evaluator';
import { tool as mathCalculators } from './math-calculators';
import { tool as etaCalculator } from './eta-calculator';
import { tool as chronometer } from './chronometer';
import { tool as dateCalculator } from './date-calculator';
import { tool as worldClock } from './world-clock';
import { tool as loremIpsumGenerator } from './lorem-ipsum-generator';
import { tool as textStatistics } from './text-statistics';
import { tool as textEntropy } from './text-entropy';
import { tool as textLines } from './text-lines';
import { tool as textCompare } from './text-compare';
import { tool as asciiTable } from './ascii-table';
import type { ToolCategory } from './tools.types';

export const toolsByCategory: ToolCategory[] = [
  {
    name: '加密安全',
    components: [
      tokenGenerator,
      passwordGenerator,
      passwordStrengthChecker,
      hashText,
      fileHash,
      bcrypt,
      argon2HashGenerator,
      uuidGenerator,
      encryption,
      rsaKeyPairGenerator,
      rsaEncryptDecrypt,
      rsaSignVerify,
      classicCiphers,
      morseCodeTranslator,
      dataMasking,
      bip39Generator,
      hmacGenerator,
      checksumBccLrc,
      chmodCalculator,
      basicAuthGenerator,
      otpCodeGeneratorAndValidator,
      jwtParser,
    ],
  },
  {
    name: '格式转换',
    components: [
      dateTimeConverter,
      unixTimeConverter,
      integerBaseConverter,
      romanNumeralConverter,
      base64StringConverter,
      base64FileConverter,
      colorConverter,
      caseConverter,
      stringUnicodeConverter,
      htmlJsConverter,
      rmbCaseConverter,
      chinesePinyin,
      textToNatoAlphabet,
      yamlToJsonConverter,
      jsonToYamlConverter,
      json5Formatter,
      jsonToMarkdownTable,
      jsonToEntityClasses,
      temperatureConverter,
      slugifyString,
      urlEncoder,
      punycodeConverter,
      ipNumberConverter,
      baseEncoding,
    ],
  },
  {
    name: '网页开发',
    components: [
      htmlEntities,
      htmlWysiwygEditor,
      urlParser,
      deviceInformation,
      metaTagGenerator,
      mimeTypes,
      keycodeInfo,
      httpStatusCodes,
      userAgentParser,
      qrCodeGenerator,
      urlParamFormatter,
      urlBatchGenerator,
    ],
  },
  {
    name: '图片',
    components: [
      svgPlaceholderGenerator,
      asciiArtGenerator,
      imageCompressor,
      imageToIco,
      imageConverter,
      barcodeGenerator,
      qrcodeReader,
      imageCrop,
    ],
  },
  {
    name: '开发调试',
    components: [
      gitMemo,
      randomPortGenerator,
      crontabGenerator,
      jsonViewer,
      jsonMinify,
      jsonKeyRenamer,
      randomJsonDataGenerator,
      randomDataGenerator,
      randomHexGenerator,
      randomNumberGenerator,
      sqlPrettify,
      dockerRunToDockerComposeConverter,
      regexTester,
      benchmarkBuilder,
    ],
  },
  {
    name: '网络',
    components: [
      ipv4SubnetCalculator,
      ipv4AddressConverter,
      cidrAggregator,
      macAddressLookup,
      randomIpGenerator,
      ipv6UlaGenerator,
      ipv6ExpandCompress,
      commonPorts,
    ],
  },
  {
    name: '数学',
    components: [mathEvaluator, mathCalculators, etaCalculator, ieee754Converter, endianConverter],
  },
  {
    name: '测量工具',
    components: [chronometer, dateCalculator, worldClock],
  },
  {
    name: '文本处理',
    components: [loremIpsumGenerator, textStatistics, textEntropy, textLines, textCompare, asciiTable, textToHtmlTable],
  },
  {
    name: '音视频处理',
    components: [cutAudio, audioConverter, videoToAudio, videoConverter, videoToGif],
  },
];

export const tools = toolsByCategory.flatMap(({ components }) => components);
export const toolsWithCategory = toolsByCategory.flatMap(({ components, name }) =>
  components.map((tool) => ({ category: name, ...tool })),
);
