
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'sequencing'
  | 'output-interpretation'
  | 'troubleshooting'
  | 'scenario-analysis'
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
  terminalOutput?: string
}

export interface SeqQuestion {
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

export type Question = MCQuestion | SeqQuestion | CLIQuestion

export interface KnownDevice {
  name: string
  port: string
  ip: string
  mac: string
  emoji: string
}

export const KNOWN_DEVICES: KnownDevice[] = [
  { name: 'PC-A', port: 'Gi0/1', ip: '192.168.1.10', mac: 'AA:AA:AA:AA:AA:AA', emoji: '💻' },
  { name: 'PC-B', port: 'Gi0/2', ip: '192.168.1.20', mac: 'BB:BB:BB:BB:BB:BB', emoji: '🖥️' },
  { name: 'PC-C', port: 'Gi0/3', ip: '192.168.1.30', mac: 'CC:CC:CC:CC:CC:CC', emoji: '🖥️' },
  { name: 'PC-D', port: 'Gi0/4', ip: '192.168.1.40', mac: 'DD:DD:DD:DD:DD:DD', emoji: '🖥️' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  3:  ['Switch'],
  6:  ['PC-B', 'PC-C', 'PC-D'],
  13: ['Switch', 'PC-B', 'PC-C', 'PC-D'],
}

export const LAB04_META = {
  id: 'lab04',
  title: 'Switching Logic, MAC Tables, and ARP',
  difficulty: 'Beginner–Intermediate' as const,
  estimatedTime: '25–30 min',
  skillsTested: [
    'Understand MAC address learning and CAM tables',
    'Analyze switch forwarding, flooding, and filtering',
    'Identify unknown unicast traffic behavior',
    'Understand collision vs broadcast domains',
    'Explain ARP request and reply process',
    'Trace full packet flow between LAN devices',
  ],
  lessonsReinforced: [
    { id: '16', title: 'MAC Learning' },
    { id: '17', title: 'Forwarding Decisions' },
    { id: '18', title: 'Flooding and Filtering' },
    { id: '19', title: 'Collision vs Broadcast Domains' },
    { id: '20', title: 'ARP Fundamentals' },
    { id: '21', title: 'ARP Tables' },
    { id: '22', title: 'Packet Walkthrough' },
  ],
}

export const LAB04_SCENARIO = {
  context: 'You are now assisting in troubleshooting a real LAN issue.',
  reports: [
    'Intermittent connectivity between devices',
    'Devices not responding at first, then working later',
  ],
  suspectedCauses: [
    'MAC address learning behavior',
    'ARP discovery process',
    'Switch forwarding decisions',
  ],
  challenge: 'Analyze traffic behavior and determine what the switch is doing at each step.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'What does a switch learn from incoming frames?',
    options: [
      { key: 'A', text: 'Destination IP address' },
      { key: 'B', text: 'Source MAC address' },
      { key: 'C', text: 'Destination MAC address' },
      { key: 'D', text: 'Port number' },
    ],
    correctAnswer: 'B',
    hints: [
      'Learned automatically from every incoming frame',
      'Used to build the MAC address table',
      'Comes from the sender, not the receiver',
    ],
    explanation: 'Switches learn the source MAC address from each incoming frame and associate it with the receiving port.',
  },

  {
    id: 2,
    type: 'output-interpretation',
    prompt: 'You run the following command on the switch. What does this table represent?',
    terminalOutput:
      'Switch# show mac address-table\n\n          Mac Address Table\n-------------------------------------------\n\nVlan    Mac Address         Type        Ports\n----    -----------         --------    -----\n   1    aaaa.aaaa.aaaa      DYNAMIC     Gi0/1\n   1    bbbb.bbbb.bbbb      DYNAMIC     Gi0/2\n   1    cccc.cccc.cccc      DYNAMIC     Gi0/3\n   1    dddd.dddd.dddd      DYNAMIC     Gi0/4\n\nTotal Mac Addresses for this criterion: 4',
    options: [
      { key: 'A', text: 'IP routing paths' },
      { key: 'B', text: 'MAC to port mappings' },
      { key: 'C', text: 'ARP cache entries' },
      { key: 'D', text: 'DNS records' },
    ],
    correctAnswer: 'B',
    hints: [
      'This is stored in switch memory',
      'Maps device identifiers to physical ports',
      'The switch uses this to make forwarding decisions',
    ],
    explanation: 'The MAC address table (CAM table) maps each learned MAC address to the switch port it was received on.',
  },

  {
    id: 3,
    type: 'topology-reasoning',
    prompt: 'PC-A sends a frame. The switch receives it on Gi0/1. What does the switch do FIRST?',
    options: [
      { key: 'A', text: 'Forwards the frame immediately to all ports' },
      { key: 'B', text: 'Learns PC-A\'s MAC address on Gi0/1' },
      { key: 'C', text: 'Drops the frame until ARP completes' },
      { key: 'D', text: 'Sends the frame to the router' },
    ],
    correctAnswer: 'B',
    hints: [
      'This is the first step in switch behavior',
      'Happens before any forwarding decision',
      'The switch reads the source MAC and records the port',
    ],
    explanation: 'Switches always learn the source MAC address and its port before making any forwarding decision.',
  },

  {
    id: 4,
    type: 'multiple-choice',
    prompt: 'If the destination MAC is already in the MAC table, what happens?',
    options: [
      { key: 'A', text: 'Flood out all ports' },
      { key: 'B', text: 'Drop the frame' },
      { key: 'C', text: 'Forward directly to the correct port' },
      { key: 'D', text: 'Send to the router' },
    ],
    correctAnswer: 'C',
    hints: [
      'The switch already knows where the device is',
      'This is the most efficient behavior',
      'Only one port is used',
    ],
    explanation: 'If the destination MAC is known, the frame is forwarded directly to the correct port.',
  },

  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'If the destination MAC is UNKNOWN, what does the switch do?',
    options: [
      { key: 'A', text: 'Drops the frame' },
      { key: 'B', text: 'Sends it to the router' },
      { key: 'C', text: 'Floods all ports except the incoming port' },
      { key: 'D', text: 'Stores it in a buffer' },
    ],
    correctAnswer: 'C',
    hints: [
      'Happens on the first frame to an unknown device',
      'The MAC is not in the table yet',
      'The switch has to send it everywhere to find the device',
    ],
    explanation: 'Unknown unicast frames are flooded out all ports except the one they arrived on.',
  },

  {
    id: 6,
    type: 'topology-reasoning',
    prompt: 'PC-A sends a frame to PC-B, but PC-B\'s MAC is unknown to the switch. Which ports receive the flooded frame?',
    options: [
      { key: 'A', text: 'Only Gi0/2 (PC-B\'s port)' },
      { key: 'B', text: 'Gi0/1 and Gi0/2 only' },
      { key: 'C', text: 'Gi0/2, Gi0/3, and Gi0/4' },
      { key: 'D', text: 'All ports including Gi0/1' },
    ],
    correctAnswer: 'C',
    hints: [
      'Flood excludes the port the frame arrived on',
      'PC-A came in on Gi0/1 — that port is excluded',
      'All remaining ports receive the frame',
    ],
    explanation: 'Flooding sends frames to all ports except the one it arrived on — here Gi0/2, Gi0/3, and Gi0/4.',
  },

  {
    id: 7,
    type: 'multiple-choice',
    prompt: 'What is it called when a switch does NOT forward a frame?',
    options: [
      { key: 'A', text: 'Flooding' },
      { key: 'B', text: 'Filtering' },
      { key: 'C', text: 'Routing' },
      { key: 'D', text: 'Bridging' },
    ],
    correctAnswer: 'B',
    hints: [
      'Prevents unnecessary traffic',
      'Occurs when source and destination are on the same port',
      'The frame is intentionally stopped',
    ],
    explanation: 'Filtering occurs when a switch drops a frame because forwarding it would be unnecessary.',
  },

  {
    id: 8,
    type: 'multiple-choice',
    prompt: 'What type of traffic is sent to ALL devices in a broadcast domain?',
    options: [
      { key: 'A', text: 'Unicast' },
      { key: 'B', text: 'Multicast' },
      { key: 'C', text: 'Broadcast' },
      { key: 'D', text: 'Directed' },
    ],
    correctAnswer: 'C',
    hints: [
      'Every device receives it',
      'ARP uses this type',
      'Uses a special all-Fs MAC address',
    ],
    explanation: 'Broadcast traffic is sent to all devices in the broadcast domain.',
  },

  {
    id: 9,
    type: 'multiple-choice',
    prompt: 'Which device separates broadcast domains?',
    options: [
      { key: 'A', text: 'Switch' },
      { key: 'B', text: 'Router' },
      { key: 'C', text: 'Hub' },
      { key: 'D', text: 'Cable' },
    ],
    correctAnswer: 'B',
    hints: [
      'Operates at Layer 3',
      'Creates a network boundary',
      'Broadcasts do not cross this device',
    ],
    explanation: 'Routers separate broadcast domains — broadcasts do not cross router interfaces.',
  },

  {
    id: 10,
    type: 'sequencing',
    prompt: 'Place the ARP process in the correct order:',
    shuffledItems: ['ARP reply', 'ARP request broadcast', 'Frame sent', 'ARP table updated'],
    correctOrder: ['ARP request broadcast', 'ARP reply', 'ARP table updated', 'Frame sent'],
    hints: [
      'ARP starts because the MAC address is unknown',
      'The sender broadcasts first, then waits',
      'After learning the MAC, the table is cached before sending',
    ],
    explanation: 'ARP first broadcasts to find the MAC, receives a reply, caches the result, then communication begins.',
  },

  {
    id: 11,
    type: 'cli-input',
    prompt: 'Enter the command to view the ARP table on a device.',
    terminalPrompt: 'Device>',
    expectedAnswer: 'arp -a',
    acceptedAnswers: ['arp -a', 'arp-a'],
    hints: [
      'Shows IP to MAC mappings',
      'Common cross-platform command',
      'Starts with "arp"',
    ],
    explanation: 'The arp -a command displays the ARP cache (IP to MAC mappings).',
  },

  {
    id: 12,
    type: 'cli-input',
    prompt: 'Enter the Cisco IOS command to view the ARP table on a router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show arp',
    acceptedAnswers: ['show arp'],
    hints: [
      'Cisco IOS version of arp -a',
      'Starts with "show"',
      'Two words: show followed by arp',
    ],
    explanation: 'The show arp command displays ARP entries on Cisco devices.',
  },

  {
    id: 13,
    type: 'topology-reasoning',
    prompt: 'PC-A sends an ARP request to find PC-B\'s MAC address. What destination MAC address is used in the frame?',
    options: [
      { key: 'A', text: 'AA:AA:AA:AA:AA:AA  (PC-A\'s own MAC)' },
      { key: 'B', text: 'BB:BB:BB:BB:BB:BB  (PC-B\'s MAC)' },
      { key: 'C', text: 'FF:FF:FF:FF:FF:FF  (broadcast)' },
      { key: 'D', text: '00:00:00:00:00:00' },
    ],
    correctAnswer: 'C',
    hints: [
      'ARP requests go to everyone on the LAN',
      'A broadcast MAC means all devices receive it',
      'All Fs in hex = all 1s in binary = broadcast',
    ],
    explanation: 'ARP requests are broadcast frames using FF:FF:FF:FF:FF:FF so every device on the LAN receives them.',
  },

  {
    id: 14,
    type: 'troubleshooting',
    prompt: 'A device cannot communicate initially but works correctly after a few seconds. What is MOST likely happening?',
    options: [
      { key: 'A', text: 'A cable has failed' },
      { key: 'B', text: 'MAC learning and ARP are completing' },
      { key: 'C', text: 'The router has rebooted' },
      { key: 'D', text: 'DNS resolution is taking too long' },
    ],
    correctAnswer: 'B',
    hints: [
      'Happens on the very first communication attempt',
      'Switch and device need to discover each other',
      'After discovery, everything works normally',
    ],
    explanation: 'Initial communication requires ARP to resolve MACs and the switch to learn MAC addresses — this causes a brief delay.',
  },

  {
    id: 15,
    type: 'scenario-analysis',
    prompt: 'After the first successful exchange between PC-A and PC-B, why does communication become faster?',
    options: [
      { key: 'A', text: 'The cable was upgraded automatically' },
      { key: 'B', text: 'MAC and ARP tables are now populated' },
      { key: 'C', text: 'The router rerouted the traffic' },
      { key: 'D', text: 'DHCP assigned faster addresses' },
    ],
    correctAnswer: 'B',
    hints: [
      'Both devices now know each other\'s MAC',
      'The switch no longer needs to flood',
      'Cached information enables direct forwarding',
    ],
    explanation: 'Once MAC and ARP tables are populated, communication becomes direct and efficient — no more flooding or ARP broadcasts.',
  },
]

export const LAB04_COMPLETION = {
  conceptMastered: 'Switching Logic and ARP Behavior',
  summary:
    'You successfully analyzed how switches learn MAC addresses, make forwarding decisions, and how ARP enables communication within a LAN.',
  masteredPoints: [
    'MAC learning and CAM tables',
    'Forwarding vs flooding vs filtering',
    'Broadcast domain behavior',
    'ARP request and reply process',
    'Full packet flow in a LAN',
  ],
  reviewIfNeeded: [
    { id: '16', title: 'MAC Learning' },
    { id: '17', title: 'Forwarding Decisions' },
    { id: '18', title: 'Flooding and Filtering' },
    { id: '19', title: 'Collision vs Broadcast Domains' },
    { id: '20–22', title: 'ARP and Packet Walkthrough' },
  ],
  nextLab: {
    id: 'lab05',
    title: 'Lab 05 – IPv4 Addressing Fundamentals',
  },
}
