
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'troubleshooting'
  | 'scenario-analysis'
  | 'output-interpretation'
  | 'subnet-identification'
  | 'calculation'
  | 'sequencing'
  | 'cli-input'

export interface MCOption { key: string; text: string }

export interface MCQuestion {
  id: number
  type: Exclude<QType, 'sequencing' | 'cli-input'>
  prompt: string
  options: MCOption[]
  correctAnswer: string
  hints: string[]
  explanation: string
}

export interface SequencingQuestion {
  id: number
  type: 'sequencing'
  prompt: string
  shuffledItems: string[]
  correctOrder: string[]
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

export type Question = MCQuestion | SequencingQuestion | CLIQuestion

export interface TopoNode { name: string; emoji: string; ip?: string; label?: string; subnet?: string }

export const TOPO_NODES: TopoNode[] = [
  { name: 'PC-A', emoji: '💻', ip: '192.168.1.10', label: '/26 • Subnet 0' },
  { name: 'PC-B', emoji: '🖥️', ip: '192.168.1.50', label: '/26 • Subnet 0' },
  { name: 'Switch', emoji: '🔀' },
  { name: 'Router', emoji: '🌐', ip: 'G0/0: .1 / G0/1: .65', label: '/26' },
  { name: 'PC-C', emoji: '🖥️', ip: '192.168.1.70', label: '/26 • Subnet 1' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  6: ['PC-A', 'PC-B'],           // same subnet
  7: ['PC-A', 'Router', 'PC-C'], // different subnet, router needed
  8: ['PC-A', 'Router'],         // packet goes to gateway
}

export interface SubnetBlock { network: string; range: string; broadcast: string; hosts: string }

export const SUBNET_BLOCKS: SubnetBlock[] = [
  { network: '192.168.1.0/26',   range: '.1 – .62',   broadcast: '.63',  hosts: '62 hosts' },
  { network: '192.168.1.64/26',  range: '.65 – .126',  broadcast: '.127', hosts: '62 hosts' },
  { network: '192.168.1.128/26', range: '.129 – .190', broadcast: '.191', hosts: '62 hosts' },
  { network: '192.168.1.192/26', range: '.193 – .254', broadcast: '.255', hosts: '62 hosts' },
]

export const LAB06_META = {
  id: 'lab06',
  title: 'Subnetting, Packet Flow, and Troubleshooting',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '35–45 min',
  skillsTested: [
    'Perform same subnet test',
    'Identify network, broadcast, and host ranges',
    'Use block size to determine subnet ranges',
    'Understand subnet boundaries quickly',
    'Apply VLSM concepts conceptually',
    'Identify when a default gateway is used',
    'Analyze packet flow (local vs remote)',
    'Use ping for troubleshooting',
    'Follow a structured troubleshooting process',
  ],
  lessonsReinforced: [
    { id: '30', title: 'Subnetting Fundamentals' },
    { id: '31', title: 'Network / Broadcast / Host Range' },
    { id: '32', title: 'Subnet Patterns' },
    { id: '33', title: 'VLSM' },
    { id: '34', title: 'Default Gateway' },
    { id: '35', title: 'Packet Flow' },
    { id: '36', title: 'ICMP / Ping' },
    { id: '37', title: 'Troubleshooting' },
  ],
}

export const LAB06_SCENARIO = {
  context: 'You are working as a junior network engineer.',
  reports: [
    'Some devices can communicate while others cannot',
    'Some can ping locally but not remotely',
  ],
  challenge: 'Analyze subnetting, packet flow, and configurations to identify what is happening.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What is the main purpose of subnetting?',
    options: [
      { key: 'A', text: 'Increase network speed' },
      { key: 'B', text: 'Divide a network into smaller segments' },
      { key: 'C', text: 'Replace routers entirely' },
      { key: 'D', text: 'Encrypt traffic between devices' },
    ],
    correctAnswer: 'B',
    hints: [
      'Used to organize larger networks',
      'Reduces broadcast domain size',
      'Allows better IP address management',
    ],
    explanation: 'Subnetting divides a large network into smaller, more manageable segments, reducing broadcasts and improving organization.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'Which device is required to forward traffic between two different subnets?',
    options: [
      { key: 'A', text: 'Switch' },
      { key: 'B', text: 'Router' },
      { key: 'C', text: 'NIC' },
      { key: 'D', text: 'Wireless access point' },
    ],
    correctAnswer: 'B',
    hints: [
      'Operates at Layer 3',
      'Makes forwarding decisions using IP addresses',
      'Connects separate networks together',
    ],
    explanation: 'Routers operate at Layer 3 and are required to forward traffic between different subnets.',
  },

  {
    id: 3, type: 'calculation',
    prompt: 'What is the block size for the subnet mask 255.255.255.192?',
    options: [
      { key: 'A', text: '32' },
      { key: 'B', text: '64' },
      { key: 'C', text: '128' },
      { key: 'D', text: '192' },
    ],
    correctAnswer: 'B',
    hints: [
      'Block size = 256 minus the last octet of the mask',
      '256 – 192 = ?',
      'This defines how many addresses are in each subnet',
    ],
    explanation: 'Block size = 256 – 192 = 64. Each /26 subnet contains 64 addresses.',
  },

  {
    id: 4, type: 'subnet-identification',
    prompt: 'Which subnet range does 192.168.1.50/26 belong to?',
    options: [
      { key: 'A', text: '192.168.1.0 – 192.168.1.63' },
      { key: 'B', text: '192.168.1.64 – 192.168.1.127' },
      { key: 'C', text: '192.168.1.128 – 192.168.1.191' },
      { key: 'D', text: '192.168.1.192 – 192.168.1.255' },
    ],
    correctAnswer: 'A',
    hints: [
      'Block size is 64 — subnets start at 0, 64, 128, 192',
      '50 is less than 64',
      'Count from 0: 0–63 is the first subnet',
    ],
    explanation: 'With a block size of 64, the first subnet spans 0–63. Since 50 falls within that range, it belongs to 192.168.1.0/26.',
  },

  {
    id: 5, type: 'subnet-identification',
    prompt: 'Which subnet range does 192.168.1.70/26 belong to?',
    options: [
      { key: 'A', text: '192.168.1.0 – 192.168.1.63' },
      { key: 'B', text: '192.168.1.64 – 192.168.1.127' },
      { key: 'C', text: '192.168.1.128 – 192.168.1.191' },
      { key: 'D', text: '192.168.1.192 – 192.168.1.255' },
    ],
    correctAnswer: 'B',
    hints: [
      'Block size is 64',
      '70 is greater than 64 but less than 128',
      'Second subnet starts at 64',
    ],
    explanation: 'The second /26 subnet spans 64–127. Since 70 falls in that range, it belongs to 192.168.1.64/26.',
  },

  {
    id: 6, type: 'topology-reasoning',
    prompt: 'Can PC-A (192.168.1.10/26) communicate DIRECTLY with PC-B (192.168.1.50/26) without a router?',
    options: [
      { key: 'A', text: 'Yes — both are in the same /26 subnet' },
      { key: 'B', text: 'No — they are in different subnets' },
      { key: 'C', text: 'Only if NAT is configured' },
      { key: 'D', text: 'Only through the default gateway' },
    ],
    correctAnswer: 'A',
    hints: [
      'Compare the subnet both addresses fall in',
      'PC-A is .10 and PC-B is .50 — both less than 64',
      'If same subnet, no router needed',
    ],
    explanation: 'Both .10 and .50 fall within the 192.168.1.0–63 range of the first /26 subnet. They can communicate directly.',
  },

  {
    id: 7, type: 'topology-reasoning',
    prompt: 'Can PC-A (192.168.1.10/26) communicate DIRECTLY with PC-C (192.168.1.70/26)?',
    options: [
      { key: 'A', text: 'Yes — same subnet mask' },
      { key: 'B', text: 'No — they are in different subnets and need a router' },
      { key: 'C', text: 'Yes — ARP will resolve the address' },
      { key: 'D', text: 'No — the switch blocks it' },
    ],
    correctAnswer: 'B',
    hints: [
      'PC-A is in 0–63, PC-C is in 64–127',
      'Different subnet = different broadcast domain',
      'A router is required for inter-subnet communication',
    ],
    explanation: 'PC-A (.10) is in subnet 0/26 (0–63), while PC-C (.70) is in subnet 64/26 (64–127). A router is required.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'PC-A needs to send a packet to PC-C on a different subnet. Where does the packet go FIRST?',
    options: [
      { key: 'A', text: 'Directly to the Switch' },
      { key: 'B', text: 'Directly to PC-C' },
      { key: 'C', text: 'To the default gateway (Router G0/0)' },
      { key: 'D', text: 'Broadcasted to all devices' },
    ],
    correctAnswer: 'C',
    hints: [
      'The destination is on a different subnet',
      'Remote traffic is always sent to the gateway first',
      'The router decides where to forward from there',
    ],
    explanation: 'When a destination is on a remote subnet, the packet is sent to the default gateway, which forwards it appropriately.',
  },

  {
    id: 9, type: 'sequencing',
    prompt: 'Order the steps for remote communication between subnets:',
    shuffledItems: [
      'Router forwards packet to destination',
      'PC sends packet to default gateway',
      'PC checks if destination is local or remote',
      'Router receives the frame',
    ],
    correctOrder: [
      'PC checks if destination is local or remote',
      'PC sends packet to default gateway',
      'Router receives the frame',
      'Router forwards packet to destination',
    ],
    hints: [
      'Always starts with a subnet check',
      'If remote, the gateway is next',
      'The router handles the rest',
    ],
    explanation: 'Devices first determine if the destination is local or remote, then route through the gateway if needed.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'What happens to MAC addresses when a packet crosses a router?',
    options: [
      { key: 'A', text: 'They stay the same throughout the path' },
      { key: 'B', text: 'They change at each router hop' },
      { key: 'C', text: 'They become broadcast addresses' },
      { key: 'D', text: 'They are removed from the packet' },
    ],
    correctAnswer: 'B',
    hints: [
      'MAC addresses are Layer 2 — local segment only',
      'The router creates a new frame for the next hop',
      'IP addresses remain the same end-to-end',
    ],
    explanation: 'MAC addresses change at each hop because routers create new frames for each outgoing segment. IP addresses stay the same.',
  },

  {
    id: 11, type: 'cli-input',
    prompt: 'Enter the command to test connectivity to a remote host at 8.8.8.8.',
    terminalPrompt: 'PC>',
    expectedAnswer: 'ping 8.8.8.8',
    acceptedAnswers: ['ping 8.8.8.8'],
    hints: [
      'Uses ICMP echo requests',
      'Basic connectivity test command',
      'Starts with "ping" followed by the destination',
    ],
    explanation: 'The ping command sends ICMP echo requests to test connectivity and measure round-trip time.',
  },

  {
    id: 12, type: 'output-interpretation',
    prompt: 'A ping result shows: .....\nWhat does this output indicate?',
    options: [
      { key: 'A', text: 'The ping was successful' },
      { key: 'B', text: 'The destination replied slowly' },
      { key: 'C', text: 'No reply was received — connectivity failed' },
      { key: 'D', text: 'DNS resolution failed' },
    ],
    correctAnswer: 'C',
    hints: [
      'Each dot represents a timeout',
      'No data came back',
      'This indicates a connectivity failure',
    ],
    explanation: 'Dots (or Request timed out messages) indicate that no ICMP echo replies were received — connectivity to the destination failed.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'A PC can successfully ping 127.0.0.1 but cannot ping its default gateway. What is the MOST likely issue?',
    options: [
      { key: 'A', text: 'The TCP/IP stack has failed' },
      { key: 'B', text: 'There is a local network connectivity issue' },
      { key: 'C', text: 'DNS is not resolving correctly' },
      { key: 'D', text: 'The router has rebooted' },
    ],
    correctAnswer: 'B',
    hints: [
      '127.0.0.1 working means TCP/IP stack is fine',
      'The issue is between the PC and the gateway',
      'Think about cables, switch ports, and IP config',
    ],
    explanation: 'If loopback (127.0.0.1) works but the gateway is unreachable, the TCP/IP stack is healthy — the problem is at the local network layer.',
  },

  {
    id: 14, type: 'troubleshooting',
    prompt: 'A PC can ping all local devices but cannot reach any internet address. What is the MOST likely cause?',
    options: [
      { key: 'A', text: 'The switch is down' },
      { key: 'B', text: 'The default gateway is missing or incorrect' },
      { key: 'C', text: 'ARP cache is full' },
      { key: 'D', text: 'The NIC has failed' },
    ],
    correctAnswer: 'B',
    hints: [
      'Local works — so the PC and switch are fine',
      'Internet = remote = needs a gateway',
      'Check IP configuration for the gateway setting',
    ],
    explanation: 'If local communication works but remote fails, the default gateway is likely missing, incorrect, or unreachable.',
  },

  {
    id: 15, type: 'scenario-analysis',
    prompt: 'After analysis, you confirm: PC-A and PC-B communicate directly, but PC-A and PC-C require a router. What is the best explanation?',
    options: [
      { key: 'A', text: 'PC-C has a different MAC address' },
      { key: 'B', text: 'PC-A and PC-C are on different subnets' },
      { key: 'C', text: 'The switch blocks PC-C traffic' },
      { key: 'D', text: 'PC-C has no IP address assigned' },
    ],
    correctAnswer: 'B',
    hints: [
      'Check which subnet each device belongs to',
      'Same subnet = Layer 2, different subnet = Layer 3',
      'Routing is required when crossing subnet boundaries',
    ],
    explanation: 'PC-A and PC-B are in the same /26 subnet (0–63), so no router is needed. PC-C is in a different /26 subnet (64–127), requiring a router.',
  },
]

export const LAB06_COMPLETION = {
  conceptMastered: 'Subnetting and Troubleshooting',
  summary:
    'You successfully applied subnetting, packet flow analysis, and connectivity troubleshooting to real network scenarios.',
  masteredPoints: [
    'Subnet boundaries and block sizes',
    'Identifying network, broadcast, and host ranges',
    'Local vs remote communication decisions',
    'How packets flow across subnets',
    'MAC vs IP behavior at routers',
    'Structured troubleshooting with ping',
  ],
  reviewIfNeeded: [
    { id: '30', title: 'Subnetting Fundamentals' },
    { id: '31', title: 'Network / Broadcast / Host Range' },
    { id: '32', title: 'Subnet Patterns' },
    { id: '33', title: 'VLSM' },
    { id: '34', title: 'Default Gateway' },
    { id: '35', title: 'Packet Flow' },
    { id: '36', title: 'ICMP / Ping' },
    { id: '37', title: 'Troubleshooting' },
  ],
  nextLab: {
    id: 'lab07',
    title: 'Lab 07 – Routing Fundamentals',
  },
}
