export const codesByCategories: {
  category: string;
  codes: {
    code: number;
    name: string;
    description: string;
    type: 'HTTP' | 'WebDav';
  }[];
}[] = [
  {
    category: '1xx 信息性响应',
    codes: [
      {
        code: 100,
        name: '继续',
        description: '等待客户端发送请求正文。',
        type: 'HTTP',
      },
      {
        code: 101,
        name: '切换协议',
        description: '服务器已同意更换协议。',
        type: 'HTTP',
      },
      {
        code: 102,
        name: '处理中',
        description: '服务器正在处理请求，但尚无响应可用。',
        type: 'WebDav',
      },
      {
        code: 103,
        name: '早期提示',
        description: '服务器在最终 HTTP 消息前返回部分响应头。',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '2xx 成功',
    codes: [
      {
        code: 200,
        name: '成功',
        description: 'HTTP 请求成功的标准响应。',
        type: 'HTTP',
      },
      {
        code: 201,
        name: '已创建',
        description: '请求已完成，并创建了新资源。',
        type: 'HTTP',
      },
      {
        code: 202,
        name: '已接受',
        description: '请求已被接受处理，但处理尚未完成。',
        type: 'HTTP',
      },
      {
        code: 203,
        name: '非权威信息',
        description: '请求成功，但原始请求的内容已被转换代理修改。',
        type: 'HTTP',
      },
      {
        code: 204,
        name: '无内容',
        description: '服务器成功处理了请求，且不返回任何内容。',
        type: 'HTTP',
      },
      {
        code: 205,
        name: '重置内容',
        description: '服务器要求重置发送此请求的文档视图。',
        type: 'HTTP',
      },
      {
        code: 206,
        name: '部分内容',
        description: '服务器仅根据客户端发送的 Range 头交付部分资源。',
        type: 'HTTP',
      },
      {
        code: 207,
        name: '多状态',
        description: '消息体为 XML，可包含多个独立的响应状态码。',
        type: 'WebDav',
      },
      {
        code: 208,
        name: '已报告',
        description: 'DAV 绑定的成员已在（多状态）响应的先前部分中枚举过。',
        type: 'WebDav',
      },
      {
        code: 226,
        name: '已使用 IM',
        description: '服务器已完成对资源的请求，响应是处理结果的一种表示。',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '3xx 重定向',
    codes: [
      {
        code: 300,
        name: '多种选择',
        description: '指示客户端可跟随的多个资源选项。',
        type: 'HTTP',
      },
      {
        code: 301,
        name: '永久移动',
        description: '本次及所有后续请求都应定向到给定的 URI。',
        type: 'HTTP',
      },
      {
        code: 302,
        name: '已找到（临时重定向）',
        description: '重定向到另一个 URL。这是行业实践与标准相矛盾的示例。',
        type: 'HTTP',
      },
      {
        code: 303,
        name: '查看其他位置',
        description: '请求的响应可在另一 URI 下通过 GET 方法找到。',
        type: 'HTTP',
      },
      {
        code: 304,
        name: '未修改',
        description: '指示自请求头所指定版本以来，资源未被修改过。',
        type: 'HTTP',
      },
      {
        code: 305,
        name: '使用代理',
        description: '请求的资源只能通过代理访问，其地址在响应中提供。',
        type: 'HTTP',
      },
      {
        code: 306,
        name: '切换代理',
        description: '不再使用。原本意为“后续请求应使用指定代理”。',
        type: 'HTTP',
      },
      {
        code: 307,
        name: '临时重定向',
        description: '此时请求应改用另一 URI 重复；但后续请求仍应使用原始 URI。',
        type: 'HTTP',
      },
      {
        code: 308,
        name: '永久重定向',
        description: '本次及所有后续请求都应使用另一 URI 重复。',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '4xx 客户端错误',
    codes: [
      {
        code: 400,
        name: '错误请求',
        description: '由于明显的客户端错误，服务器无法或不会处理该请求。',
        type: 'HTTP',
      },
      {
        code: 401,
        name: '未授权',
        description: '与 403 禁止类似，但专门用于需要身份验证且验证失败或尚未提供时。',
        type: 'HTTP',
      },
      {
        code: 402,
        name: '需要付款',
        description: '预留供将来使用。最初的意图是此状态码可用于某种数字现金或微支付方案。',
        type: 'HTTP',
      },
      {
        code: 403,
        name: '禁止访问',
        description: '请求有效，但服务器拒绝执行操作。用户可能没有访问某资源所需的权限。',
        type: 'HTTP',
      },
      {
        code: 404,
        name: '未找到',
        description: '找不到所请求的资源，但将来可能可用。',
        type: 'HTTP',
      },
      {
        code: 405,
        name: '方法不允许',
        description: '请求方法不受所请求资源的支持。',
        type: 'HTTP',
      },
      {
        code: 406,
        name: '不可接受',
        description: '请求的资源只能生成与请求中 Accept 头所不符的内容。',
        type: 'HTTP',
      },
      {
        code: 407,
        name: '需要代理身份验证',
        description: '客户端必须先向代理进行身份验证。',
        type: 'HTTP',
      },
      {
        code: 408,
        name: '请求超时',
        description: '服务器等待请求时超时。',
        type: 'HTTP',
      },
      {
        code: 409,
        name: '冲突',
        description: '由于请求中存在冲突（如编辑冲突），请求无法被处理。',
        type: 'HTTP',
      },
      {
        code: 410,
        name: '已删除',
        description: '指示所请求的资源已不可用，并且将来也不会再可用。',
        type: 'HTTP',
      },
      {
        code: 411,
        name: '需要内容长度',
        description: '请求未指定内容长度，而所请求的资源需要该长度。',
        type: 'HTTP',
      },
      {
        code: 412,
        name: '前置条件失败',
        description: '服务器不满足请求方对请求所设置的前置条件之一。',
        type: 'HTTP',
      },
      {
        code: 413,
        name: '载荷过大',
        description: '请求体大于服务器愿意或能够处理的规模。',
        type: 'HTTP',
      },
      {
        code: 414,
        name: 'URI 过长',
        description: '提供的 URI 过长，服务器无法处理。',
        type: 'HTTP',
      },
      {
        code: 415,
        name: '不支持的媒体类型',
        description: '请求实体的媒体类型不受服务器或资源支持。',
        type: 'HTTP',
      },
      {
        code: 416,
        name: '范围无法满足',
        description: '客户端请求文件的某一部分，但服务器无法提供该部分。',
        type: 'HTTP',
      },
      {
        code: 417,
        name: '预期失败',
        description: '服务器无法满足 Expect 请求头字段的要求。',
        type: 'HTTP',
      },
      {
        code: 418,
        name: '我是茶壶',
        description: '服务器拒绝用茶壶煮咖啡的尝试。',
        type: 'HTTP',
      },
      {
        code: 421,
        name: '请求被错误定向',
        description: '请求被定向到无法产生响应的服务器。',
        type: 'HTTP',
      },
      {
        code: 422,
        name: '不可处理实体',
        description: '请求格式良好，但由于语义错误而无法被处理。',
        type: 'HTTP',
      },
      {
        code: 423,
        name: '已锁定',
        description: '正在访问的资源已被锁定。',
        type: 'HTTP',
      },
      {
        code: 424,
        name: '依赖失败',
        description: '由于先前请求失败，导致当前请求失败。',
        type: 'HTTP',
      },
      {
        code: 425,
        name: '太早',
        description: '服务器不愿冒险处理可能被重放的请求。',
        type: 'HTTP',
      },
      {
        code: 426,
        name: '需要升级协议',
        description: '客户端应切换到不同协议，如 TLS/1.0。',
        type: 'HTTP',
      },
      {
        code: 428,
        name: '需要前置条件',
        description: '源服务器要求请求必须是带条件的。',
        type: 'HTTP',
      },
      {
        code: 429,
        name: '请求过多',
        description: '用户在给定时间内发送了过多请求。',
        type: 'HTTP',
      },
      {
        code: 431,
        name: '请求头字段过大',
        description: '由于单个头字段或所有头字段整体过大，服务器不愿处理该请求。',
        type: 'HTTP',
      },
      {
        code: 451,
        name: '因法律原因不可用',
        description: '服务器运营商收到法律要求，拒绝访问包含所请求资源的资源或资源集。',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '5xx 服务器错误',
    codes: [
      {
        code: 500,
        name: '服务器内部错误',
        description: '遇到意外情况且无更合适的具体消息时给出的通用错误消息。',
        type: 'HTTP',
      },
      {
        code: 501,
        name: '未实现',
        description: '服务器不识别请求方法，或缺乏完成请求的能力。',
        type: 'HTTP',
      },
      {
        code: 502,
        name: '错误网关',
        description: '服务器充当网关或代理时，收到了来自上游服务器的无效响应。',
        type: 'HTTP',
      },
      {
        code: 503,
        name: '服务不可用',
        description: '服务器当前不可用（因过载或停机维护）。',
        type: 'HTTP',
      },
      {
        code: 504,
        name: '网关超时',
        description: '服务器充当网关或代理时，未及时收到来自上游服务器的响应。',
        type: 'HTTP',
      },
      {
        code: 505,
        name: 'HTTP 版本不受支持',
        description: '服务器不支持请求中使用的 HTTP 协议版本。',
        type: 'HTTP',
      },
      {
        code: 506,
        name: '变体也进行协商',
        description: '对请求的透明内容协商导致了循环引用。',
        type: 'HTTP',
      },
      {
        code: 507,
        name: '存储空间不足',
        description: '服务器无法存储完成请求所需的表示。',
        type: 'HTTP',
      },
      {
        code: 508,
        name: '检测到循环',
        description: '服务器在处理请求时检测到无限循环。',
        type: 'HTTP',
      },
      {
        code: 510,
        name: '未扩展',
        description: '服务器需要更多请求扩展才能完成请求。',
        type: 'HTTP',
      },
      {
        code: 511,
        name: '需要网络身份验证',
        description: '客户端需要进行身份验证才能获得网络访问权限。',
        type: 'HTTP',
      },
    ],
  },
];
