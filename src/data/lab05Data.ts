
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'troubleshooting'
  | 'scenario-analysis'
  | 'matching'
  | 'binary-conversion'
  | 'cli-input'

export interface MCOption { key: string; text: string }

export interface MCQuestion {
  id: number
  type: Exclude<QType, 'cli-input' | 'binary-conversion'>
  prompt: string
  options: MCOption[]
  correctAnswer: string
  hints: string[]
  explanation: string
}

export interface BinaryQuestion {
  id: number
  type: 'binary-conversion'
  prompt: string
  binaryValue: string       // e.g. "11000000"
  options: MCOption[]
  correctAnswer: string
  hints: string[]
  explanation: string
}

export interface CLIQuestion {
  id: number
  type: 'cli-input'
  prompt: string
  terminalPrompt: string
  expectedAnswer: string
  acceptedAnswers: string[]
  hints: string[]
  explanation: string
}

export type Question = MCQuestion | BinaryQuestion | CLIQuestion

export interface SubnetEntry { cidr: string; mask: string; hosts: number }

export const SUBNET_TABLE: SubnetEntry[] = [
  { cidr: '/8',  mask: '255.0.0.0',       hosts: 16777214 },
  { cidr: '/16', mask: '255.255.0.0',     hosts: 65534 },
  { cidr: '/24', mask: '255.255.255.0',   hosts: 254 },
  { cidr: '/25', mask: '255.255.255.128', hosts: 126 },
  { cidr: '/26', mask: '255.255.255.192', hosts: 62 },
  { cidr: '/30', mask: '255.255.255.252', hosts: 2 },
]

export interface PrivateRange { range: string; cidr: string; label: string }

export const PRIVATE_RANGES: PrivateRange[] = [
  { range: '10.0.0.0 – 10.255.255.255',     cidr: '10.0.0.0/8',    label: 'Class A Private' },
  { range: '172.16.0.0 – 172.31.255.255',    cidr: '172.16.0.0/12', label: 'Class B Private' },
  { range: '192.168.0.0 – 192.168.255.255',  cidr: '192.168.0.0/16', label: 'Class C Private' },
]

export interface SpecialAddr { address: string; name: string; purpose: string; color: string }

export const SPECIAL_ADDRESSES: SpecialAddr[] = [
  { address: '127.0.0.1',       name: 'Loopback',   purpose: 'Test local network stack',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { address: '169.254.x.x',     name: 'APIPA',      purpose: 'Auto-assigned when DHCP fails',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { address: '0.0.0.0',         name: 'Unspecified', purpose: 'Default route / any address',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { address: '255.255.255.255', name: 'Broadcast',  purpose: 'Send to all hosts on network',    color: 'bg-red-100 text-red-700 border-red-200' },
]

export interface TopoNode {
  name: string
  emoji: string
  ip?: string
  label?: string
}

export const TOPO_NODES: TopoNode[] = [
  { name: 'PC-A', emoji: '💻', ip: '192.168.1.10', label: '/24' },
  { name: 'PC-B', emoji: '🖥️', ip: '192.168.1.20', label: '/24' },
  { name: 'Switch', emoji: '🔀' },
  { name: 'Router', emoji: '🌐', ip: '192.168.1.1', label: 'Default GW' },
  { name: 'Internet', emoji: '☁️' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  10: ['PC-A', 'PC-B', 'Switch'],
  11: ['Router'],
}

export const LAB05_META = {
  id: 'lab05',
  title: 'IPv4 Addressing and Network Fundamentals',
  difficulty: 'Intermediate' as const,
  estimatedTime: '30–35 min',
  skillsTested: [
    'Understand IPv4 address structure and octets',
    'Identify network vs host portions',
    'Interpret CIDR notation and subnet masks',
    'Perform basic binary conversions',
    'Identify public vs private IP addresses',
    'Recognize special IPv4 addresses',
    'Determine local vs remote communication',
  ],
  lessonsReinforced: [
    { id: '23', title: 'IPv4 Address Structure' },
    { id: '24', title: 'Network vs Host Portion' },
    { id: '25', title: 'CIDR Notation' },
    { id: '26', title: 'Binary Basics' },
    { id: '27', title: 'Subnet Masks' },
    { id: '28', title: 'Public vs Private IPs' },
    { id: '29', title: 'Special IPv4 Addresses' },
  ],
}

export const LAB05_SCENARIO = {
  context: 'You are assisting with configuring IP addressing for a small office network.',
  reports: [
    'Some devices cannot reach others',
    'Some devices cannot reach the internet',
    'One device has a strange IP address starting with 169.254',
  ],
  challenge: 'Analyze IP addressing, subnet masks, and special address behavior to identify what is happening.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'How many bits are in an IPv4 address?',
    options: [
      { key: 'A', text: '16' },
      { key: 'B', text: '32' },
      { key: 'C', text: '64' },
      { key: 'D', text: '128' },
    ],
    correctAnswer: 'B',
    hints: ['Standard IPv4 protocol', 'Divided into four octets', 'Foundational CCNA concept'],
    explanation: 'IPv4 addresses are 32 bits long, written as four 8-bit octets.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'How many octets are in an IPv4 address?',
    options: [
      { key: 'A', text: '2' },
      { key: 'B', text: '4' },
      { key: 'C', text: '6' },
      { key: 'D', text: '8' },
    ],
    correctAnswer: 'B',
    hints: ['Each octet is 8 bits', 'Total is 32 bits', 'Example: 192.168.1.10'],
    explanation: 'IPv4 addresses are divided into four octets, each 8 bits wide.',
  },

  {
    id: 3, type: 'multiple-choice',
    prompt: 'What is the maximum value of a single octet?',
    options: [
      { key: 'A', text: '128' },
      { key: 'B', text: '192' },
      { key: 'C', text: '255' },
      { key: 'D', text: '512' },
    ],
    correctAnswer: 'C',
    hints: ['8 bits total', 'All bits set to 1', '2⁸ − 1 = 255'],
    explanation: 'The maximum value of an 8-bit octet is 255 (all bits set to 1).',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'Which part of an IP address identifies the network?',
    options: [
      { key: 'A', text: 'Host portion' },
      { key: 'B', text: 'Network portion' },
      { key: 'C', text: 'MAC address' },
      { key: 'D', text: 'Port number' },
    ],
    correctAnswer: 'B',
    hints: ['Used by routers for path decisions', 'Defines the larger group', 'Set by subnet mask'],
    explanation: 'The network portion of the IP address identifies which network the device belongs to.',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'What determines where the network portion ends?',
    options: [
      { key: 'A', text: 'Router' },
      { key: 'B', text: 'DNS server' },
      { key: 'C', text: 'Subnet mask' },
      { key: 'D', text: 'MAC address' },
    ],
    correctAnswer: 'C',
    hints: ['Works alongside the IP address', 'A binary mask of 1s and 0s', 'Defines the network boundary'],
    explanation: 'The subnet mask determines where the network portion ends and the host portion begins.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'What does /24 represent in CIDR notation?',
    options: [
      { key: 'A', text: '24 devices on the network' },
      { key: 'B', text: '24 bits used for the network portion' },
      { key: 'C', text: '24 routers in the path' },
      { key: 'D', text: '24 usable host addresses' },
    ],
    correctAnswer: 'B',
    hints: ['CIDR prefix length', 'Counts the network bits', '/24 = 255.255.255.0'],
    explanation: '/24 (CIDR) means 24 bits are reserved for the network portion of the address.',
  },

  {
    id: 7, type: 'matching',
    prompt: 'Which subnet mask corresponds to /24?',
    options: [
      { key: 'A', text: '255.0.0.0' },
      { key: 'B', text: '255.255.0.0' },
      { key: 'C', text: '255.255.255.0' },
      { key: 'D', text: '255.255.255.128' },
    ],
    correctAnswer: 'C',
    hints: ['24 ones followed by 8 zeros', 'Three full octets of 255', 'Last octet is 0'],
    explanation: '/24 = 255.255.255.0 — the first 24 bits (three octets) are the network portion.',
  },

  {
    id: 8, type: 'binary-conversion',
    prompt: 'Convert this 8-bit binary value to decimal:',
    binaryValue: '11000000',
    options: [
      { key: 'A', text: '128' },
      { key: 'B', text: '160' },
      { key: 'C', text: '192' },
      { key: 'D', text: '224' },
    ],
    correctAnswer: 'C',
    hints: ['Read the leftmost two bits (both are 1)', '128 + 64 = ?', 'The rest of the bits are 0'],
    explanation: '11000000 = 128 + 64 = 192 in decimal.',
  },

  {
    id: 9, type: 'multiple-choice',
    prompt: 'Which subnet mask represents /16?',
    options: [
      { key: 'A', text: '255.0.0.0' },
      { key: 'B', text: '255.255.0.0' },
      { key: 'C', text: '255.255.255.0' },
      { key: 'D', text: '255.255.255.255' },
    ],
    correctAnswer: 'B',
    hints: ['16 bits = first two octets', 'Two octets of 255, two of 0', '/16 is a class B boundary'],
    explanation: '/16 equals 255.255.0.0 — 16 ones in the first two octets.',
  },

  {
    id: 10, type: 'topology-reasoning',
    prompt: 'PC-A (192.168.1.10/24) wants to send data to PC-B (192.168.1.20/24). Is this local or remote communication?',
    options: [
      { key: 'A', text: 'Remote — PC-A must send to the router first' },
      { key: 'B', text: 'Local — both are on the same /24 network' },
      { key: 'C', text: 'Cannot communicate without NAT' },
      { key: 'D', text: 'Requires DNS to resolve first' },
    ],
    correctAnswer: 'B',
    hints: [
      'Compare the first three octets of both IPs',
      'Both start with 192.168.1',
      'Same network = no router needed',
    ],
    explanation: 'Both PCs share the 192.168.1.0/24 network, so communication is local — no router required.',
  },

  {
    id: 11, type: 'topology-reasoning',
    prompt: 'PC-A (192.168.1.10/24) wants to reach 8.8.8.8 on the internet. Where is the packet sent first?',
    options: [
      { key: 'A', text: 'Directly to 8.8.8.8' },
      { key: 'B', text: 'To PC-B first' },
      { key: 'C', text: 'To the default gateway (Router at 192.168.1.1)' },
      { key: 'D', text: 'Dropped — different network' },
    ],
    correctAnswer: 'C',
    hints: [
      '8.8.8.8 is NOT in the 192.168.1.0/24 network',
      'Traffic to remote networks goes to the gateway',
      'Look at the Router\'s IP in the topology',
    ],
    explanation: 'Traffic to remote networks is sent to the default gateway first — here the Router at 192.168.1.1.',
  },

  {
    id: 12, type: 'cli-input',
    prompt: 'Enter the command to view IP configuration on a Windows PC.',
    terminalPrompt: 'PC>',
    expectedAnswer: 'ipconfig',
    acceptedAnswers: ['ipconfig', 'ipconfig /all'],
    hints: [
      'Windows command — not ifconfig',
      'Shows IP, subnet mask, and gateway',
      'Starts with "ip"',
    ],
    explanation: 'ipconfig displays the IP configuration of a Windows device.',
  },

  {
    id: 13, type: 'multiple-choice',
    prompt: 'Which of the following is a private IP address?',
    options: [
      { key: 'A', text: '8.8.8.8' },
      { key: 'B', text: '192.168.1.5' },
      { key: 'C', text: '1.1.1.1' },
      { key: 'D', text: '54.23.1.10' },
    ],
    correctAnswer: 'B',
    hints: [
      'Private ranges: 10.x, 172.16–31.x, 192.168.x',
      'Not routable on the public internet',
      'Common home and office range',
    ],
    explanation: '192.168.x.x is one of the three private IP ranges — not routable on the public internet.',
  },

  {
    id: 14, type: 'multiple-choice',
    prompt: 'Which technology allows private IP addresses to access the internet?',
    options: [
      { key: 'A', text: 'DNS' },
      { key: 'B', text: 'DHCP' },
      { key: 'C', text: 'NAT' },
      { key: 'D', text: 'ARP' },
    ],
    correctAnswer: 'C',
    hints: [
      'Translates between private and public addresses',
      'A router function',
      'Network Address Translation',
    ],
    explanation: 'NAT (Network Address Translation) translates private IPs to public IPs at the router.',
  },

  {
    id: 15, type: 'troubleshooting',
    prompt: 'A device shows an IP address of 169.254.10.5. What is the MOST likely issue?',
    options: [
      { key: 'A', text: 'DNS server failure' },
      { key: 'B', text: 'DHCP failure — device used APIPA' },
      { key: 'C', text: 'Cable unplugged' },
      { key: 'D', text: 'Router failure' },
    ],
    correctAnswer: 'B',
    hints: [
      '169.254.x.x is the APIPA range',
      'APIPA is automatically assigned when DHCP is unreachable',
      'The device is on the local link only',
    ],
    explanation: 'APIPA (169.254.x.x) addresses are auto-assigned when a device cannot reach a DHCP server.',
  },

  {
    id: 16, type: 'multiple-choice',
    prompt: 'What is the loopback address used for local testing?',
    options: [
      { key: 'A', text: '0.0.0.0' },
      { key: 'B', text: '255.255.255.255' },
      { key: 'C', text: '127.0.0.1' },
      { key: 'D', text: '192.168.1.1' },
    ],
    correctAnswer: 'C',
    hints: [
      'Points back to your own machine',
      'Used to test the local TCP/IP stack',
      'Never leaves the device',
    ],
    explanation: '127.0.0.1 is the loopback address — traffic sent to it stays on the local machine.',
  },

  {
    id: 17, type: 'multiple-choice',
    prompt: 'Which address is the broadcast address for the 192.168.1.0/24 network?',
    options: [
      { key: 'A', text: '192.168.1.0' },
      { key: 'B', text: '192.168.1.1' },
      { key: 'C', text: '192.168.1.255' },
      { key: 'D', text: '192.168.1.10' },
    ],
    correctAnswer: 'C',
    hints: [
      'Always the last address in the range',
      'All host bits set to 1',
      'In /24 the last octet is 255',
    ],
    explanation: '192.168.1.255 is the broadcast address — all host bits set to 1 in the /24 range.',
  },

  {
    id: 18, type: 'scenario-analysis',
    prompt: 'Why can devices with APIPA addresses (169.254.x.x) communicate locally but NOT reach the internet?',
    options: [
      { key: 'A', text: 'APIPA addresses do not have a subnet mask' },
      { key: 'B', text: 'APIPA is blocked by all firewalls' },
      { key: 'C', text: 'APIPA addresses are link-local and cannot be routed beyond the local network' },
      { key: 'D', text: 'APIPA is only supported on IPv6' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think about what "link-local" means',
      'Routers will not forward these addresses',
      'They work only between directly connected devices',
    ],
    explanation: 'APIPA addresses are link-local — routers drop them and will not forward them beyond the local segment.',
  },
]

export const LAB05_COMPLETION = {
  conceptMastered: 'IPv4 Addressing Fundamentals',
  summary:
    'You successfully analyzed IPv4 structure, subnet masks, CIDR notation, and special addressing behavior.',
  masteredPoints: [
    'How IPv4 addresses are structured',
    'How network vs host portions work',
    'How CIDR and subnet masks define boundaries',
    'How binary relates to IP addressing',
    'How private vs public addressing works',
    'How special addresses impact troubleshooting',
  ],
  reviewIfNeeded: [
    { id: '23', title: 'IPv4 Address Structure' },
    { id: '24', title: 'Network vs Host Portion' },
    { id: '25–27', title: 'CIDR and Subnet Masks' },
    { id: '28–29', title: 'Public/Private and Special Addresses' },
  ],
  nextLab: {
    id: 'lab06',
    title: 'Lab 06 – Subnetting Fundamentals (This is where things get real)',
  },
}
