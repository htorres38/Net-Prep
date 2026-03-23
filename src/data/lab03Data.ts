

export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
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
  type: Exclude<QType, 'cli-input'>
  prompt: string
  options: MCOption[]
  correctAnswer: string
  hints: string[]
  explanation: string
  terminalOutput?: string
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

export type Question = MCQuestion | CLIQuestion

export interface DeviceDetail {
  name: string
  emoji: string
  details: string[]
}

export interface FrameField {
  name: string
  size: string
  description: string
  color: string
}

export const ETHERNET_FRAME_FIELDS: FrameField[] = [
  { name: 'Preamble', size: '8 B', description: 'Signals start of frame', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { name: 'Dest MAC', size: '6 B', description: 'Receiving device address', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Src MAC', size: '6 B', description: 'Sending device address', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'EtherType', size: '2 B', description: 'Identifies Layer 3 protocol', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Data', size: '46–1500 B', description: 'Payload from upper layers', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { name: 'FCS', size: '4 B', description: 'Error detection checksum', color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

export const LAB03_META = {
  id: 'lab03',
  title: 'Ethernet, Frames, and MAC Addressing',
  difficulty: 'Beginner' as const,
  estimatedTime: '20–25 min',
  skillsTested: [
    'Identify Ethernet fundamentals and Layer 2 behavior',
    'Understand MAC addressing and frame delivery',
    'Analyze Ethernet frame structure',
    'Distinguish unicast, broadcast, and multicast traffic',
    'Recognize how switches forward frames',
  ],
  lessonsReinforced: [
    { id: '10', title: 'Interfaces, Ports, and Network Media' },
    { id: '11', title: 'Copper, Fiber, and Cabling' },
    { id: '12', title: 'Ethernet Fundamentals' },
    { id: '13', title: 'Ethernet Frame Structure' },
    { id: '14', title: 'MAC Addresses' },
    { id: '15', title: 'Unicast, Broadcast, Multicast' },
  ],
}

export const LAB03_SCENARIO = {
  context:
    'You are assisting a network engineer configuring a small LAN.',
  goals: [
    'How devices physically connect',
    'How Ethernet operates',
    'How frames are structured',
    'How switches use MAC addresses',
    'How different traffic types behave',
  ],
  challenge:
    'You will analyze traffic inside a LAN and determine how frames are delivered.',
}

export const TOPOLOGY_DEVICES: DeviceDetail[] = [
  {
    name: 'PC-A',
    emoji: '💻',
    details: ['Sends Ethernet frames', 'Has a MAC address'],
  },
  {
    name: 'Switch',
    emoji: '🔀',
    details: ['Forwards frames using MAC addresses', 'Learns MAC address table'],
  },
  {
    name: 'PC-B',
    emoji: '🖥️',
    details: ['Receives frames', 'Identified by MAC address'],
  },
  {
    name: 'PC-C',
    emoji: '🖥️',
    details: ['Receives frames', 'Identified by MAC address'],
  },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  8:  ['Switch'],
  14: ['Switch', 'PC-B', 'PC-C'],
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'What hardware component allows a device to connect to a network?',
    options: [
      { key: 'A', text: 'CPU' },
      { key: 'B', text: 'NIC' },
      { key: 'C', text: 'RAM' },
      { key: 'D', text: 'GPU' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about the physical connection to a network',
      'Found in every networked device',
      'It is an interface component',
    ],
    explanation: 'A Network Interface Card (NIC) allows a device to connect to a network.',
  },

  {
    id: 2,
    type: 'multiple-choice',
    prompt: 'Which connector is commonly used for Ethernet cables?',
    options: [
      { key: 'A', text: 'USB' },
      { key: 'B', text: 'HDMI' },
      { key: 'C', text: 'RJ-45' },
      { key: 'D', text: 'VGA' },
    ],
    correctAnswer: 'C',
    hints: [
      'Standard Ethernet connector',
      'Used in LANs',
      'Looks similar to a phone jack but wider',
    ],
    explanation: 'RJ-45 connectors are used for Ethernet cables in LANs.',
  },

  {
    id: 3,
    type: 'multiple-choice',
    prompt: 'Which type of cable transmits data using light?',
    options: [
      { key: 'A', text: 'Copper' },
      { key: 'B', text: 'Fiber' },
      { key: 'C', text: 'Coaxial' },
      { key: 'D', text: 'Twisted pair' },
    ],
    correctAnswer: 'B',
    hints: [
      'High speed, long distance',
      'Immune to electromagnetic interference',
      'Uses photons instead of electrons',
    ],
    explanation: 'Fiber optic cables transmit data using light signals.',
  },

  {
    id: 4,
    type: 'multiple-choice',
    prompt: 'At which OSI layer does Ethernet primarily operate?',
    options: [
      { key: 'A', text: 'Physical (Layer 1)' },
      { key: 'B', text: 'Data Link (Layer 2)' },
      { key: 'C', text: 'Network (Layer 3)' },
      { key: 'D', text: 'Transport (Layer 4)' },
    ],
    correctAnswer: 'B',
    hints: [
      'Layer 2',
      'Uses MAC addresses',
      'Works with frames',
    ],
    explanation: 'Ethernet operates at the Data Link layer (Layer 2).',
  },

  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'What unit of data is used by Ethernet?',
    options: [
      { key: 'A', text: 'Packet' },
      { key: 'B', text: 'Segment' },
      { key: 'C', text: 'Frame' },
      { key: 'D', text: 'Bit' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think Layer 2 PDU',
      'Contains MAC addresses',
      'Used inside a LAN',
    ],
    explanation: 'Ethernet transmits data using frames.',
  },

  {
    id: 6,
    type: 'matching',
    prompt: 'Which field in an Ethernet frame identifies the receiving device?',
    options: [
      { key: 'A', text: 'Source MAC Address' },
      { key: 'B', text: 'Destination MAC Address' },
      { key: 'C', text: 'EtherType' },
      { key: 'D', text: 'Frame Check Sequence (FCS)' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about where the frame is going',
      'The switch reads this field to decide the outport',
      'Look at the frame structure reference',
    ],
    explanation:
      'The destination MAC address tells the switch where to send the frame.',
  },

  {
    id: 7,
    type: 'multiple-choice',
    prompt: 'What is the purpose of the Frame Check Sequence (FCS)?',
    options: [
      { key: 'A', text: 'Identify destination' },
      { key: 'B', text: 'Identify protocol' },
      { key: 'C', text: 'Detect errors' },
      { key: 'D', text: 'Store IP address' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think error checking',
      'Ensures frame integrity',
      'Frame is discarded if this does not match',
    ],
    explanation: 'The FCS is used to detect transmission errors in frames.',
  },

  {
    id: 8,
    type: 'topology-reasoning',
    prompt: 'PC-A sends a frame to PC-B. Which device decides where the frame goes?',
    options: [
      { key: 'A', text: 'PC-A' },
      { key: 'B', text: 'PC-B' },
      { key: 'C', text: 'Switch' },
      { key: 'D', text: 'Router' },
    ],
    correctAnswer: 'C',
    hints: [
      'Uses MAC addresses to make forwarding decisions',
      'Operates at Layer 2',
      'Look at the topology — there is one in the middle',
    ],
    explanation:
      'The switch reads the destination MAC address and forwards the frame to the correct port.',
  },

  {
    id: 9,
    type: 'multiple-choice',
    prompt: 'How long is a MAC address?',
    options: [
      { key: 'A', text: '32 bits' },
      { key: 'B', text: '48 bits' },
      { key: 'C', text: '64 bits' },
      { key: 'D', text: '128 bits' },
    ],
    correctAnswer: 'B',
    hints: [
      '6 bytes total',
      'Written as 12 hexadecimal characters',
      'Example: AA:BB:CC:DD:EE:FF',
    ],
    explanation: 'MAC addresses are 48-bit (6-byte) identifiers.',
  },

  {
    id: 10,
    type: 'output-interpretation',
    prompt: 'You run the following command on the switch. What does this output show?',
    terminalOutput:
      'Switch> show mac address-table\n\n          Mac Address Table\n-------------------------------------------\n\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    000a.000a.000a    DYNAMIC     Fa0/1\n   1    000b.000b.000b    DYNAMIC     Fa0/2\n   1    000c.000c.000c    DYNAMIC     Fa0/3\n\nTotal Mac Addresses for this criterion: 3',
    options: [
      { key: 'A', text: 'IP routing table' },
      { key: 'B', text: 'MAC address to port mappings' },
      { key: 'C', text: 'Cable types per interface' },
      { key: 'D', text: 'Interface speeds' },
    ],
    correctAnswer: 'B',
    hints: [
      'This is a switch command — not a router command',
      'Look at the column headers in the output',
      'The switch uses this table to forward frames',
    ],
    explanation:
      'This command shows which MAC addresses are associated with which switch ports.',
  },

  {
    id: 11,
    type: 'cli-input',
    prompt: 'Enter the command to view the MAC address table on the switch.',
    terminalPrompt: 'Switch>',
    expectedAnswer: 'show mac address-table',
    acceptedAnswers: ['show mac address-table', 'show mac-address-table'],
    hints: [
      'Displays MAC address mappings',
      'Used on switches, not routers',
      'Starts with "show mac"',
    ],
    explanation:
      'This command displays MAC address entries learned by the switch.',
  },

  {
    id: 12,
    type: 'multiple-choice',
    prompt: 'Which communication type sends data to ONE specific device?',
    options: [
      { key: 'A', text: 'Broadcast' },
      { key: 'B', text: 'Multicast' },
      { key: 'C', text: 'Unicast' },
      { key: 'D', text: 'Flood' },
    ],
    correctAnswer: 'C',
    hints: [
      'One sender, one receiver',
      'Most common traffic type',
      'Direct point-to-point communication',
    ],
    explanation: 'Unicast sends data from one device to one specific device.',
  },

  {
    id: 13,
    type: 'multiple-choice',
    prompt: 'Which MAC address represents a broadcast frame?',
    options: [
      { key: 'A', text: '00:00:00:00:00:00' },
      { key: 'B', text: 'FF:FF:FF:FF:FF:FF' },
      { key: 'C', text: 'AA:AA:AA:AA:AA:AA' },
      { key: 'D', text: '11:11:11:11:11:11' },
    ],
    correctAnswer: 'B',
    hints: [
      'Sent to all devices',
      'A special reserved address',
      'All bits set to 1 — all Fs in hex',
    ],
    explanation: 'Broadcast frames use the destination MAC FF:FF:FF:FF:FF:FF.',
  },

  {
    id: 14,
    type: 'topology-reasoning',
    prompt:
      'PC-A sends a broadcast frame (FF:FF:FF:FF:FF:FF). What does the switch do?',
    options: [
      { key: 'A', text: 'Drops the frame' },
      { key: 'B', text: 'Forwards it only to PC-B' },
      { key: 'C', text: 'Forwards it to all ports except the one it arrived on' },
      { key: 'D', text: 'Sends it back to PC-A' },
    ],
    correctAnswer: 'C',
    hints: [
      'Switches cannot look up broadcast addresses in the MAC table',
      'Think about flood behavior',
      'The receiving port is excluded from the flood',
    ],
    explanation:
      'Switches flood broadcast frames to all ports except the one they were received on.',
  },

  {
    id: 15,
    type: 'troubleshooting',
    prompt:
      'PC-A cannot communicate with PC-B on the same LAN. Which OSI layer is MOST likely involved?',
    options: [
      { key: 'A', text: 'Layer 7 – Application' },
      { key: 'B', text: 'Layer 4 – Transport' },
      { key: 'C', text: 'Layer 3 – Network' },
      { key: 'D', text: 'Layer 2 – Data Link' },
    ],
    correctAnswer: 'D',
    hints: [
      'Both devices are on the same LAN — no router involved',
      'Think Ethernet and MAC addresses',
      'Local communication issues are a Layer 2 problem',
    ],
    explanation:
      'Issues within a LAN typically involve Layer 2 (Data Link layer), which handles Ethernet and MAC addressing.',
  },
]

export const LAB03_COMPLETION = {
  conceptMastered: 'Ethernet, Frames, and MAC Addressing',
  summary:
    'You successfully analyzed how Ethernet operates, how frames are structured, and how switches use MAC addresses to deliver data.',
  masteredPoints: [
    'How devices connect physically',
    'How Ethernet frames work',
    'How switches forward traffic',
    'How MAC addressing identifies devices',
    'How unicast, broadcast, and multicast behave',
  ],
  reviewIfNeeded: [
    { id: '10', title: 'Interfaces' },
    { id: '11', title: 'Cabling' },
    { id: '12', title: 'Ethernet' },
    { id: '13', title: 'Frames' },
    { id: '14', title: 'MAC Addresses' },
    { id: '15', title: 'Traffic Types' },
  ],
  nextLab: {
    id: 'lab04',
    title: 'Lab 04 – Switching Logic and MAC Address Tables',
  },
}
