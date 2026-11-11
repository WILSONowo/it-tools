<template>
  <n-card title="常用端口及协议参考">
    <div
      style="
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 12px;
      "
    >
      <n-input v-model:value="search" placeholder="搜索端口 / 服务 / 协议..." clearable style="max-width: 340px" />
      <n-tag :bordered="false" size="small">{{ filtered.length }} 条记录</n-tag>
    </div>
    <n-table size="small">
      <thead>
        <tr>
          <th>端口</th>
          <th>协议</th>
          <th>服务</th>
          <th>描述</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filtered" :key="`${item.port}-${item.protocol}`">
          <td style="font-family: monospace">{{ item.port }}</td>
          <td>
            <n-tag :bordered="false" size="small" :type="item.protocol === 'TCP' ? 'primary' : 'warning'">{{
              item.protocol
            }}</n-tag>
          </td>
          <td style="font-weight: 600">{{ item.service }}</td>
          <td style="opacity: 0.8">{{ item.description }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const search = ref('');

const PORTS = [
  { port: 20, protocol: 'TCP', service: 'FTP Data', description: '文件传输协议数据通道' },
  { port: 21, protocol: 'TCP', service: 'FTP', description: '文件传输协议控制通道' },
  { port: 22, protocol: 'TCP', service: 'SSH / SFTP', description: '安全外壳,安全登录与文件传输' },
  { port: 23, protocol: 'TCP', service: 'Telnet', description: '不加密的文本通信(旧版)' },
  { port: 25, protocol: 'TCP', service: 'SMTP', description: '简单邮件传输协议' },
  { port: 53, protocol: 'UDP/TCP', service: 'DNS', description: '域名系统' },
  { port: 67, protocol: 'UDP', service: 'DHCP Server', description: '动态主机配置协议' },
  { port: 68, protocol: 'UDP', service: 'DHCP Client', description: '动态主机配置协议' },
  { port: 69, protocol: 'UDP', service: 'TFTP', description: '简单文件传输协议' },
  { port: 80, protocol: 'TCP', service: 'HTTP', description: '超文本传输协议' },
  { port: 110, protocol: 'TCP', service: 'POP3', description: '邮局协议第 3 版(接收邮件)' },
  { port: 123, protocol: 'UDP', service: 'NTP', description: '网络时间协议' },
  { port: 143, protocol: 'TCP', service: 'IMAP', description: 'Internet 消息访问协议' },
  { port: 161, protocol: 'UDP', service: 'SNMP', description: '简单网络管理协议' },
  { port: 194, protocol: 'TCP', service: 'IRC', description: '互联网中继聊天' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', description: '基于 TLS/SSL 的 HTTP' },
  { port: 445, protocol: 'TCP', service: 'SMB', description: '服务器消息块 / CIFS(Windows 共享)' },
  { port: 465, protocol: 'TCP', service: 'SMTPS', description: '基于 SSL 的 SMTP' },
  { port: 514, protocol: 'UDP', service: 'Syslog', description: '系统日志' },
  { port: 587, protocol: 'TCP', service: 'SMTP Submission', description: '邮件投递(STARTTLS)' },
  { port: 631, protocol: 'TCP/UDP', service: 'IPP', description: 'Internet 打印协议(CUPS)' },
  { port: 636, protocol: 'TCP', service: 'LDAPS', description: '基于 TLS/SSL 的 LDAP' },
  { port: 873, protocol: 'TCP', service: 'rsync', description: '文件同步/传输工具' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', description: '基于 SSL 的 IMAP' },
  { port: 995, protocol: 'TCP', service: 'POP3S', description: '基于 SSL 的 POP3' },
  { port: 1080, protocol: 'TCP', service: 'SOCKS Proxy', description: 'SOCKS 代理协议' },
  { port: 1433, protocol: 'TCP', service: 'MSSQL', description: 'Microsoft SQL Server' },
  { port: 1521, protocol: 'TCP', service: 'Oracle DB', description: 'Oracle 数据库监听器' },
  { port: 2049, protocol: 'TCP/UDP', service: 'NFS', description: '网络文件系统' },
  { port: 2181, protocol: 'TCP', service: 'ZooKeeper', description: 'Apache ZooKeeper 协调服务' },
  { port: 2375, protocol: 'TCP', service: 'Docker', description: 'Docker REST API(明文)' },
  { port: 2376, protocol: 'TCP', service: 'Docker TLS', description: '基于 TLS 的 Docker REST API' },
  { port: 2379, protocol: 'TCP', service: 'etcd', description: 'etcd 客户端' },
  { port: 3000, protocol: 'TCP', service: 'Dev servers', description: 'Node.js / Vite / Grafana 及许多开发应用' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', description: 'MySQL / MariaDB 数据库' },
  { port: 3389, protocol: 'TCP', service: 'RDP', description: 'Windows 远程桌面协议' },
  { port: 4000, protocol: 'TCP', service: 'Dev servers', description: 'Phoenix / Jupyter / 常见开发端口' },
  { port: 5000, protocol: 'TCP', service: 'Dev servers', description: 'Flask / Docker 仓库 / 许多应用' },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', description: 'PostgreSQL 数据库' },
  { port: 5672, protocol: 'TCP', service: 'AMQP', description: 'RabbitMQ 消息代理' },
  { port: 5900, protocol: 'TCP', service: 'VNC', description: '虚拟网络计算' },
  { port: 6379, protocol: 'TCP', service: 'Redis', description: 'Redis 键值存储' },
  { port: 6443, protocol: 'TCP', service: 'Kubernetes API', description: 'kube-apiserver' },
  { port: 7001, protocol: 'TCP', service: 'Consul/WebLogic', description: 'Consul agent / WebLogic' },
  { port: 8080, protocol: 'TCP', service: 'HTTP Alt', description: '常见备选 HTTP 端口(Tomcat/代理)' },
  { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', description: '常见备选 HTTPS 端口' },
  { port: 8888, protocol: 'TCP', service: 'Dev servers', description: 'Jupyter / 许多开发工具' },
  { port: 9090, protocol: 'TCP', service: 'Prometheus', description: 'Prometheus 监控 / Cockpit' },
  { port: 9200, protocol: 'TCP', service: 'Elasticsearch', description: 'Elasticsearch HTTP API' },
  { port: 9418, protocol: 'TCP', service: 'Git', description: 'Git 守护进程(git://)' },
  { port: 11211, protocol: 'TCP/UDP', service: 'Memcached', description: 'Memcached 缓存守护进程' },
  { port: 15672, protocol: 'TCP', service: 'RabbitMQ Mgmt', description: 'RabbitMQ 管理界面' },
  { port: 27017, protocol: 'TCP', service: 'MongoDB', description: 'MongoDB 数据库' },
];

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (query === '') return PORTS;
  return PORTS.filter(
    (p) =>
      String(p.port).includes(query) ||
      p.service.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.protocol.toLowerCase().includes(query),
  );
});
</script>
