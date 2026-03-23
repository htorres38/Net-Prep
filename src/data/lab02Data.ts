

export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'sequencing'
  | 'output-interpretation'
  | 'troubleshooting'
  | 'matching'
  | 'cli-input'

export interface MCOption {
  key: string
  text: string
}

export interface MCQuestion {
  id: number
  type: Exclude<QType, 'sequencing' | 'cli-input'>
  prompt: string
  options: MCOption[]
  correctAnswer: string
  hints: string[]
  explanation: string
  terminalOutput?: string  // for output-interpretation
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
  terminalPrompt: string      // prefix shown before the input, e.g. "Device>"
  expectedAnswer: string      // canonical answer (normalized for comparison)
  acceptedAnswers: string[]   // all accepted variations
  hints: string[]
  explanation: string
}

export type Question = MCQuestion | SeqQuestion | CLIQuestion

export interface DeviceDetail {
  name: string
  emoji: string
  zone: 'LAN-A' | 'Gateway' | 'WAN' | 'LAN-B'
  details: string[]
}

export const LAB02_META = {
  id: 'lab02',
  title: 'Models, Layers, and Packet Journey',
  difficulty: 'Beginner' as const,
  estimatedTime: '20–25 min',
  skillsTested: [
    'Identify OSI and TCP/IP layers',
    'Understand encapsulation and decapsulation',
    'Recognize PDUs at each layer',
    'Analyze packet flow from host to host',
    'Map OSI to TCP/IP models',
  ],
  lessonsReinforced: [
    { id: '05', title: 'OSI Model Overview' },
    { id: '06', title: 'TCP/IP Model Overview' },
    { id: '07', title: 'Encapsulation and Decapsulation' },
    { id: '08', title: 'Protocol Data Units (PDUs)' },
    { id: '09', title: 'Packet Journey' },
  ],
}

export const LAB02_SCENARIO = {
  context:
    'You are shadowing a network engineer who is troubleshooting connectivity between two devices.',
  goals: [
    'How data moves through networking layers',
    'How packets are formed and delivered',
    'How OSI and TCP/IP models describe the same process',
  ],
  challenge:
    'Before allowing you to assist with real troubleshooting, you must analyze how data travels through the network and explain what is happening at each step.',
}

export const TOPOLOGY_NODES = [
  'Host A',
  'Switch A',
  'Router A',
  'Internet',
  'Router B',
  'Switch B',
  'Host B',
]

export const DEVICES: DeviceDetail[] = [
  {
    name: 'Host A',
    emoji: '💻',
    zone: 'LAN-A',
    details: ['Sends application data', 'Starts encapsulation process'],
  },
  {
    name: 'Switch A',
    emoji: '🔀',
    zone: 'LAN-A',
    details: ['Forwards frames within LAN', 'Uses MAC addresses'],
  },
  {
    name: 'Router A',
    emoji: '🌐',
    zone: 'Gateway',
    details: ['Forwards packets between networks', 'Uses IP addresses'],
  },
  {
    name: 'Internet',
    emoji: '☁️',
    zone: 'WAN',
    details: ['Collection of interconnected networks'],
  },
  {
    name: 'Router B',
    emoji: '🌐',
    zone: 'Gateway',
    details: ['Forwards packets between networks', 'Uses IP addresses'],
  },
  {
    name: 'Switch B',
    emoji: '🔀',
    zone: 'LAN-B',
    details: ['Forwards frames within LAN', 'Uses MAC addresses'],
  },
  {
    name: 'Host B',
    emoji: '🖥️',
    zone: 'LAN-B',
    details: ['Receives and decapsulates data'],
  },
]

export const PDU_LAYERS = [
  { layer: 7, osi: 'Application', tcpip: 'Application', pdu: 'Data', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { layer: 6, osi: 'Presentation', tcpip: 'Application', pdu: 'Data', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { layer: 5, osi: 'Session', tcpip: 'Application', pdu: 'Data', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { layer: 4, osi: 'Transport', tcpip: 'Transport', pdu: 'Segment', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { layer: 3, osi: 'Network', tcpip: 'Internet', pdu: 'Packet', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { layer: 2, osi: 'Data Link', tcpip: 'Network Access', pdu: 'Frame', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { layer: 1, osi: 'Physical', tcpip: 'Network Access', pdu: 'Bits', color: 'bg-green-100 text-green-700 border-green-200' },
]

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'How many layers are in the OSI model?',
    options: [
      { key: 'A', text: '4' },
      { key: 'B', text: '5' },
      { key: 'C', text: '7' },
      { key: 'D', text: '9' },
    ],
    correctAnswer: 'C',
    hints: [
      'This is a core CCNA memorization concept',
      'More layers than TCP/IP',
      'Think "All People Seem To Need Data Processing"',
    ],
    explanation:
      'The OSI model contains 7 layers used to describe how data moves through a network.',
  },

  {
    id: 2,
    type: 'multiple-choice',
    prompt: 'Which OSI layer is responsible for routing packets?',
    options: [
      { key: 'A', text: 'Data Link' },
      { key: 'B', text: 'Network' },
      { key: 'C', text: 'Transport' },
      { key: 'D', text: 'Session' },
    ],
    correctAnswer: 'B',
    hints: [
      'Routers operate at this layer',
      'Uses IP addresses',
      'Handles path selection',
    ],
    explanation:
      'The Network layer (Layer 3) is responsible for routing packets between networks.',
  },

  {
    id: 3,
    type: 'multiple-choice',
    prompt: 'How many layers are in the TCP/IP model?',
    options: [
      { key: 'A', text: '4' },
      { key: 'B', text: '5' },
      { key: 'C', text: '6' },
      { key: 'D', text: '7' },
    ],
    correctAnswer: 'A',
    hints: [
      'Fewer layers than OSI',
      'Real-world model used on the internet',
      'Layers: Application, Transport, Internet, Network Access',
    ],
    explanation:
      'The TCP/IP model consists of 4 layers: Application, Transport, Internet, and Network Access.',
  },

  {
    id: 4,
    type: 'matching',
    prompt:
      'Which TCP/IP layer corresponds to routing and IP addressing?',
    options: [
      { key: 'A', text: 'Application Layer' },
      { key: 'B', text: 'Transport Layer' },
      { key: 'C', text: 'Internet Layer' },
      { key: 'D', text: 'Network Access Layer' },
    ],
    correctAnswer: 'C',
    hints: [
      'Equivalent to OSI Layer 3',
      'Uses IP addresses',
      'Routers operate at this layer',
    ],
    explanation:
      'The Internet layer in TCP/IP corresponds to the OSI Network layer and handles routing.',
  },

  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'What is the process of adding headers as data moves down the layers?',
    options: [
      { key: 'A', text: 'Decapsulation' },
      { key: 'B', text: 'Encapsulation' },
      { key: 'C', text: 'Compression' },
      { key: 'D', text: 'Routing' },
    ],
    correctAnswer: 'B',
    hints: [
      'Happens before sending data',
      'Adds information to each layer',
      'Opposite of decapsulation',
    ],
    explanation:
      'Encapsulation is the process of adding headers as data moves down through the layers.',
  },

  {
    id: 6,
    type: 'multiple-choice',
    prompt: 'What is the name for data at the Network layer?',
    options: [
      { key: 'A', text: 'Frame' },
      { key: 'B', text: 'Segment' },
      { key: 'C', text: 'Packet' },
      { key: 'D', text: 'Bits' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think routing',
      'Uses IP addresses',
      'Happens at OSI Layer 3',
    ],
    explanation: 'At the Network layer, data is called a packet.',
  },

  {
    id: 7,
    type: 'sequencing',
    prompt:
      'Place the PDU names in the correct order from top layer to bottom layer:',
    shuffledItems: ['Frame', 'Packet', 'Data', 'Bits', 'Segment'],
    correctOrder: ['Data', 'Segment', 'Packet', 'Frame', 'Bits'],
    hints: [
      'Starts at the Application layer',
      'Ends at the Physical layer',
      'Think about the encapsulation process top-down',
    ],
    explanation:
      'Data moves down the layers as: Data → Segment → Packet → Frame → Bits.',
  },

  {
    id: 8,
    type: 'topology-reasoning',
    prompt: 'At which point in the topology does routing occur?',
    options: [
      { key: 'A', text: 'Host A' },
      { key: 'B', text: 'Switch A' },
      { key: 'C', text: 'Router' },
      { key: 'D', text: 'Internet' },
    ],
    correctAnswer: 'C',
    hints: [
      'Happens between networks',
      'Uses IP addresses',
      'Not inside the LAN — look between LAN and WAN',
    ],
    explanation:
      'Routing occurs at routers, which forward packets between networks.',
  },

  {
    id: 9,
    type: 'output-interpretation',
    prompt:
      'A user runs the following command. What does this output show?',
    terminalOutput:
      '$ traceroute 8.8.8.8\ntraceroute to 8.8.8.8, 30 hops max\n 1  192.168.1.1    1.2 ms   1.0 ms   1.1 ms\n 2  10.0.0.1       8.4 ms   8.2 ms   8.5 ms\n 3  72.14.215.1   11.3 ms  11.1 ms  11.4 ms\n 4  8.8.8.8        12.2 ms  11.9 ms  12.0 ms',
    options: [
      { key: 'A', text: 'Packet size information' },
      { key: 'B', text: 'The path packets take through the network' },
      { key: 'C', text: 'The MAC address table' },
      { key: 'D', text: 'The device hostname' },
    ],
    correctAnswer: 'B',
    hints: [
      'Look at the numbered lines — each is a hop',
      'IP addresses on each line are routers in the path',
      'Used for troubleshooting path issues',
    ],
    explanation:
      'Traceroute shows the path packets take across multiple routers to reach a destination.',
  },

  {
    id: 10,
    type: 'troubleshooting',
    prompt:
      'A ping command fails. Based on OSI model understanding, which layers are MOST likely involved?',
    options: [
      { key: 'A', text: 'Application layer only' },
      { key: 'B', text: 'Layer 3 and below' },
      { key: 'C', text: 'Presentation layer only' },
      { key: 'D', text: 'Session layer only' },
    ],
    correctAnswer: 'B',
    hints: [
      'Ping uses ICMP — think which layer that is',
      'Think about what layers handle connectivity',
      'Lower layers handle physical delivery',
    ],
    explanation:
      'Ping uses ICMP at the Network layer, so failures usually indicate issues at Layer 3 or below.',
  },

  {
    id: 11,
    type: 'cli-input',
    prompt: 'You want to test connectivity to a remote host. Enter the correct command:',
    terminalPrompt: 'Device>',
    expectedAnswer: 'ping 8.8.8.8',
    acceptedAnswers: ['ping 8.8.8.8'],
    hints: [
      'Used to test network connectivity',
      'Sends small test packets and waits for replies',
      'Starts with the word "ping"',
    ],
    explanation:
      'The ping command verifies that a device can communicate with another device across the network.',
  },

  {
    id: 12,
    type: 'cli-input',
    prompt:
      'You want to see the path packets take to reach a destination. Enter the full command:',
    terminalPrompt: 'Device>',
    expectedAnswer: 'traceroute 8.8.8.8',
    acceptedAnswers: ['traceroute 8.8.8.8', 'tracert 8.8.8.8'],
    hints: [
      'Shows each hop along the path',
      'Used for troubleshooting routing problems',
      'Starts with "traceroute" followed by an IP address',
    ],
    explanation:
      'Traceroute displays each router (hop) a packet travels through on its path to the destination.',
  },
]

export const LAB02_COMPLETION = {
  conceptMastered: 'Models, Layers, and Packet Flow',
  summary:
    'You successfully analyzed how data moves through both the OSI and TCP/IP models, identified PDUs, and followed packet movement across a network.',
  masteredPoints: [
    'How layers interact',
    'How encapsulation works',
    'How data changes across layers',
    'How packets travel between hosts',
  ],
  reviewIfNeeded: [
    { id: '05', title: 'OSI Model' },
    { id: '06', title: 'TCP/IP Model' },
    { id: '07', title: 'Encapsulation' },
    { id: '08', title: 'PDUs' },
    { id: '09', title: 'Packet Journey' },
  ],
  nextLab: {
    id: 'lab03',
    title: 'Lab 03 – Ethernet, Frames, and MAC Addressing',
  },
}
