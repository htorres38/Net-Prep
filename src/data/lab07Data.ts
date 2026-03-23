
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'troubleshooting'
  | 'scenario-analysis'
  | 'output-interpretation'
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
  { name: 'PC-A', emoji: '💻', ip: '192.168.1.10', label: '/24' },
  { name: 'PC-B', emoji: '🖥️', ip: '192.168.2.20', label: '/24' },
  { name: 'Router', emoji: '🌐', ip: 'G0/0: .1.1 | G0/1: .2.1' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  3:  ['PC-A', 'Router', 'PC-B'],
  8:  ['Router', 'PC-B'],
  12: ['Router'],
}

export interface RouteEntry { code: string; network: string; interface: string; description: string }

export const ROUTING_TABLE: RouteEntry[] = [
  { code: 'C', network: '192.168.1.0/24', interface: 'G0/0', description: 'Connected' },
  { code: 'C', network: '192.168.2.0/24', interface: 'G0/1', description: 'Connected' },
  { code: 'L', network: '192.168.1.1/32', interface: 'G0/0', description: 'Local (router IP)' },
  { code: 'L', network: '192.168.2.1/32', interface: 'G0/1', description: 'Local (router IP)' },
]

export const LAB07_META = {
  id: 'lab07',
  title: 'Routing Fundamentals and Path Decisions',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '30–40 min',
  skillsTested: [
    'Understand the role of routers in networks',
    'Identify router interfaces and their purpose',
    'Analyze how routers forward packets between networks',
    'Interpret routing table entries',
    'Apply longest prefix match logic',
    'Identify connected vs local routes',
    'Trace packet flow through a router',
  ],
  lessonsReinforced: [
    { id: '38', title: 'What Routers Do' },
    { id: '39', title: 'Router Interfaces' },
    { id: '40', title: 'Routing Tables' },
    { id: '41', title: 'Connected and Local Routes' },
  ],
}

export const LAB07_SCENARIO = {
  context: 'You are working with a network that connects multiple subnets.',
  reports: [
    'Devices on different networks cannot communicate properly',
    'Some packets are being sent to the wrong interface',
  ],
  challenge: 'Analyze how the router makes forwarding decisions and determine where packets will go.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What is the primary function of a router?',
    options: [
      { key: 'A', text: 'Assign IP addresses to devices' },
      { key: 'B', text: 'Connect multiple networks and forward packets between them' },
      { key: 'C', text: 'Convert MAC addresses to IP addresses' },
      { key: 'D', text: 'Provide wireless connectivity' },
    ],
    correctAnswer: 'B',
    hints: [
      'Operates at Layer 3',
      'Makes decisions based on destination IP',
      'Connects separate networks together',
    ],
    explanation: 'Routers connect multiple networks and use routing tables to forward packets to the correct destination.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'At which OSI layer do routers primarily operate?',
    options: [
      { key: 'A', text: 'Layer 1 – Physical' },
      { key: 'B', text: 'Layer 2 – Data Link' },
      { key: 'C', text: 'Layer 3 – Network' },
      { key: 'D', text: 'Layer 4 – Transport' },
    ],
    correctAnswer: 'C',
    hints: [
      'IP addressing is at this layer',
      'Above the MAC address layer',
      'Uses logical addressing',
    ],
    explanation: 'Routers operate at Layer 3 (Network), using IP addresses to make forwarding decisions.',
  },

  {
    id: 3, type: 'topology-reasoning',
    prompt: 'PC-A (192.168.1.10) wants to send data to PC-B (192.168.2.20). Which device is responsible for forwarding the packet?',
    options: [
      { key: 'A', text: 'The switch' },
      { key: 'B', text: 'The router' },
      { key: 'C', text: "PC-B's NIC receives it directly" },
      { key: 'D', text: 'The ARP cache' },
    ],
    correctAnswer: 'B',
    hints: [
      'PC-A and PC-B are on different networks',
      'Layer 3 forwarding is needed',
      'Check the topology',
    ],
    explanation: 'Because PC-A and PC-B are on different subnets, the router must forward the packet between the two networks.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'What information does a router use to make forwarding decisions?',
    options: [
      { key: 'A', text: 'Source MAC address' },
      { key: 'B', text: 'Destination MAC address' },
      { key: 'C', text: 'Destination IP address' },
      { key: 'D', text: 'Source port number' },
    ],
    correctAnswer: 'C',
    hints: [
      'MAC addresses are Layer 2 — routers strip them',
      'Routers use Layer 3 addressing',
      'The routing table is indexed by this value',
    ],
    explanation: 'Routers examine the destination IP address and look it up in the routing table to determine where to forward the packet.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Enter the Cisco IOS command to view all router interfaces and their status.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip interface brief',
    acceptedAnswers: ['show ip interface brief', 'sh ip int br'],
    hints: [
      'Displays all interfaces with IPs and status',
      'Starts with "show"',
      'Three words: show ip interface brief',
    ],
    explanation: "'show ip interface brief' displays a summary of all router interfaces, their IP addresses, and up/down status.",
  },

  {
    id: 6, type: 'output-interpretation',
    prompt: "You see this routing table entry:\n\n    C 192.168.1.0/24 [0/0] via G0/0\n\nWhat does the code 'C' represent?",
    options: [
      { key: 'A', text: 'Configured' },
      { key: 'B', text: 'Connected' },
      { key: 'C', text: 'Central' },
      { key: 'D', text: 'Core' },
    ],
    correctAnswer: 'B',
    hints: [
      'These routes were not manually typed',
      'The router learned them from its own interfaces',
      'Direct physical connections create these',
    ],
    explanation: "The 'C' code stands for Connected — the router learned these routes automatically from its directly attached interfaces.",
  },

  {
    id: 7, type: 'output-interpretation',
    prompt: "Looking at this routing table entry:\n\n    L 192.168.1.1/32 is directly connected, GigabitEthernet0/0\n\nWhat does this 'L' (Local) route represent?",
    options: [
      { key: 'A', text: 'A learned route from a neighbor' },
      { key: 'B', text: "The router's own interface IP address" },
      { key: 'C', text: 'A loopback interface' },
      { key: 'D', text: 'An external route from the internet' },
    ],
    correctAnswer: 'B',
    hints: [
      '/32 means exactly one address',
      'L = Local to this router',
      'This is the IP assigned to G0/0',
    ],
    explanation: "Local routes (/32) represent the router's own interface IP addresses — they tell the router to process packets destined for itself.",
  },

  {
    id: 8, type: 'topology-reasoning',
    prompt: 'A packet arrives at the router destined for 192.168.2.20. Based on the routing table, which interface will the router use to forward it?',
    options: [
      { key: 'A', text: 'G0/0 (192.168.1.1)' },
      { key: 'B', text: 'G0/1 (192.168.2.1)' },
      { key: 'C', text: 'Both interfaces simultaneously' },
      { key: 'D', text: 'The packet is dropped — no match' },
    ],
    correctAnswer: 'B',
    hints: [
      'Check the routing table for the matching network',
      '192.168.2.0/24 is the network containing .2.20',
      'Look at which interface that network is connected to',
    ],
    explanation: '192.168.2.20 falls within 192.168.2.0/24, which is connected to G0/1. The router forwards the packet out G0/1.',
  },

  {
    id: 9, type: 'multiple-choice',
    prompt: 'What happens to the MAC address of a packet when it passes through a router?',
    options: [
      { key: 'A', text: 'The MAC address stays the same end-to-end' },
      { key: 'B', text: 'The MAC address changes at each router hop' },
      { key: 'C', text: 'The MAC becomes a broadcast address' },
      { key: 'D', text: 'The MAC address is permanently removed' },
    ],
    correctAnswer: 'B',
    hints: [
      'MAC addresses are Layer 2 — they are local to each segment',
      'The router strips the old frame and builds a new one',
      'IP addresses stay the same; MAC changes per hop',
    ],
    explanation: 'Routers discard the incoming frame and create a new one for the outgoing segment — so MAC addresses change at each hop.',
  },

  {
    id: 10, type: 'sequencing',
    prompt: 'Place the router forwarding process in the correct order:',
    shuffledItems: [
      'Forward the packet out the correct interface',
      'Examine the destination IP address',
      'Receive the incoming packet',
      'Look up the destination in the routing table',
    ],
    correctOrder: [
      'Receive the incoming packet',
      'Examine the destination IP address',
      'Look up the destination in the routing table',
      'Forward the packet out the correct interface',
    ],
    hints: [
      'Receive comes before any processing',
      'IP examination happens before table lookup',
      'Forwarding is always last',
    ],
    explanation: 'Routers follow a structured process: receive → examine destination IP → look up routing table → forward.',
  },

  {
    id: 11, type: 'multiple-choice',
    prompt: 'If multiple routing table entries could match a destination, which one does the router choose?',
    options: [
      { key: 'A', text: 'The shortest path by hop count' },
      { key: 'B', text: 'The first entry in the table' },
      { key: 'C', text: 'The most specific match (longest prefix)' },
      { key: 'D', text: 'A random entry' },
    ],
    correctAnswer: 'C',
    hints: [
      'More specific = longer subnet prefix',
      '/32 is more specific than /24',
      'This is called Longest Prefix Match',
    ],
    explanation: 'Routers use Longest Prefix Match — the most specific route (longest subnet mask) wins when multiple entries could match.',
  },

  {
    id: 12, type: 'scenario-analysis',
    prompt: 'A packet arrives at the router destined for 192.168.1.1. According to the routing table, what happens to this packet?',
    options: [
      { key: 'A', text: 'Forwarded out G0/0 to PC-A' },
      { key: 'B', text: "The router processes it locally (it is the router's own IP)" },
      { key: 'C', text: 'Dropped — no specific route' },
      { key: 'D', text: 'Flooded to all interfaces' },
    ],
    correctAnswer: 'B',
    hints: [
      "192.168.1.1 is the router's own interface address",
      'There is an L (local) route for /32',
      'Packets to the router itself are processed locally',
    ],
    explanation: "The routing table has a local (L) route for 192.168.1.1/32 — this is the router's own IP, so it processes the packet internally.",
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'Devices on two different subnets cannot communicate at all. The switch and all cables are working correctly. What is MOST likely required?',
    options: [
      { key: 'A', text: 'A second switch' },
      { key: 'B', text: 'A router connecting the two subnets' },
      { key: 'C', text: 'New cables between devices' },
      { key: 'D', text: 'A DNS server' },
    ],
    correctAnswer: 'B',
    hints: [
      'Switches operate at Layer 2 and cannot route between subnets',
      'Inter-subnet traffic requires a Layer 3 device',
      'Verify a router exists and is configured',
    ],
    explanation: 'Switches forward traffic within a subnet but cannot route between different subnets. A router is required for inter-network communication.',
  },

  {
    id: 14, type: 'troubleshooting',
    prompt: 'A router receives a packet destined for a network that is NOT in its routing table. What happens?',
    options: [
      { key: 'A', text: 'The packet is forwarded to the closest match' },
      { key: 'B', text: 'The packet is dropped' },
      { key: 'C', text: 'The packet is sent as a broadcast' },
      { key: 'D', text: 'The router waits for ARP to resolve the destination' },
    ],
    correctAnswer: 'B',
    hints: [
      'No route = no path',
      'The router has no idea where to send it',
      'Unless a default route exists, it is discarded',
    ],
    explanation: 'If no matching route exists (and no default route is configured), the packet is dropped. The router sends an ICMP Unreachable message to the source.',
  },

  {
    id: 15, type: 'scenario-analysis',
    prompt: "A technician says: 'The switches are all working fine — so there must be no routing issue.' Why is this reasoning incorrect?",
    options: [
      { key: 'A', text: 'Switches also perform routing at Layer 3' },
      { key: 'B', text: 'Switches cannot forward traffic between different subnets — only a router can do that' },
      { key: 'C', text: 'Switches are faster than routers and should handle all traffic' },
      { key: 'D', text: 'Routing is handled by the DNS server, not switches or routers' },
    ],
    correctAnswer: 'B',
    hints: [
      'Switches operate at Layer 2 — they forward frames, not packets',
      'Switches use MAC addresses, not IP addresses',
      'Inter-subnet routing requires a Layer 3 device',
    ],
    explanation: 'Switches operate at Layer 2 and only forward frames within the same subnet. Even if all switches are working, a router is still required to move traffic between different networks.',
  },
]

export const LAB07_COMPLETION = {
  conceptMastered: 'Routing Fundamentals',
  summary:
    'You successfully analyzed how routers forward packets, interpret routing tables, and make path decisions between networks.',
  masteredPoints: [
    'How routers connect and separate networks',
    'Routing tables and connected/local routes',
    'Packet forwarding process step-by-step',
    'Longest prefix match logic',
    'MAC address behavior at each hop',
    'Tracing packet flow through a router',
  ],
  reviewIfNeeded: [
    { id: '38', title: 'What Routers Do' },
    { id: '39', title: 'Router Interfaces' },
    { id: '40', title: 'Routing Tables' },
    { id: '41', title: 'Connected and Local Routes' },
  ],
  nextLab: {
    id: 'lab08',
    title: 'Lab 08 – Static Routing and Default Routes',
  },
}
