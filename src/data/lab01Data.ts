
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'sequencing'
  | 'output-interpretation'
  | 'troubleshooting'

export interface MCOption {
  key: string
  text: string
}

export interface MCQuestion {
  id: number
  type: Exclude<QType, 'sequencing'>
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

export type Question = MCQuestion | SeqQuestion

export interface DeviceDetail {
  name: string
  emoji: string
  zone: 'LAN' | 'Gateway' | 'WAN'
  details: string[]
}

export const LAB01_META = {
  id: 'lab01',
  title: 'Network Foundations and Device Roles',
  difficulty: 'Beginner' as const,
  estimatedTime: '15–20 min',
  skillsTested: [
    'Identify network devices and their roles',
    'Understand basic packet flow across a network',
    'Distinguish LAN, WAN, WLAN, and Internet',
    'Recognize how data moves from source to destination',
  ],
  lessonsReinforced: [
    { id: '01', title: 'What Is Networking and Why It Matters' },
    { id: '02', title: 'Types of Networks' },
    { id: '03', title: 'Network Devices Overview' },
    { id: '04', title: 'How Data Moves Across a Network' },
  ],
}

export const LAB01_SCENARIO = {
  context:
    'You are assisting a junior IT team setting up a small office network.',
  goals: [
    'How devices are connected',
    'How traffic moves through the network',
    'What each device is responsible for',
  ],
  challenge:
    'Before allowing you to configure real equipment, they give you a series of challenges. Analyze the network and explain how it works.',
}

export const TOPOLOGY_NODES = [
  'Laptop',
  'Access Point',
  'Switch',
  'Router',
  'Internet',
  'Web Server',
]

export const DEVICES: DeviceDetail[] = [
  {
    name: 'Laptop',
    emoji: '💻',
    zone: 'LAN',
    details: ['Wireless device', 'Connected via Wi-Fi'],
  },
  {
    name: 'Access Point',
    emoji: '📡',
    zone: 'LAN',
    details: ['Connects wireless devices to the wired network'],
  },
  {
    name: 'Switch',
    emoji: '🔀',
    zone: 'LAN',
    details: [
      'Connects devices inside the LAN',
      'Forwards traffic using MAC addresses',
    ],
  },
  {
    name: 'Router',
    emoji: '🌐',
    zone: 'Gateway',
    details: [
      'Connects the LAN to other networks (WAN/Internet)',
      'Uses IP addresses to forward packets',
    ],
  },
  {
    name: 'Internet',
    emoji: '☁️',
    zone: 'WAN',
    details: ['Collection of interconnected networks'],
  },
  {
    name: 'Web Server',
    emoji: '🖥️',
    zone: 'WAN',
    details: ['Hosts websites and responds to requests'],
  },
]

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'What is a computer network?',
    options: [
      { key: 'A', text: 'A type of operating system' },
      { key: 'B', text: 'A group of connected devices that communicate' },
      { key: 'C', text: 'A storage device' },
      { key: 'D', text: 'A single computer' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about the definition from Lesson 1',
      'Focus on communication between devices',
      'It involves more than one device',
    ],
    explanation:
      'A network is a group of devices connected together so they can communicate and exchange data.',
  },
  {
    id: 2,
    type: 'multiple-choice',
    prompt:
      'Which network type connects devices within a small area like a home or office?',
    options: [
      { key: 'A', text: 'WAN' },
      { key: 'B', text: 'LAN' },
      { key: 'C', text: 'Internet' },
      { key: 'D', text: 'MPLS' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think "local"',
      'Small geographic area',
      'Used in homes and offices',
    ],
    explanation:
      'A LAN (Local Area Network) connects devices within a limited geographic area.',
  },
  {
    id: 3,
    type: 'multiple-choice',
    prompt:
      'Which network type connects networks across large geographic distances?',
    options: [
      { key: 'A', text: 'LAN' },
      { key: 'B', text: 'WLAN' },
      { key: 'C', text: 'WAN' },
      { key: 'D', text: 'VLAN' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think long distance',
      'Connects multiple LANs',
      'Often provided by ISPs',
    ],
    explanation: 'A WAN connects networks across large geographic distances.',
  },
  {
    id: 4,
    type: 'topology-reasoning',
    prompt:
      'In the topology shown, which device connects the local network to the internet?',
    options: [
      { key: 'A', text: 'Laptop' },
      { key: 'B', text: 'Switch' },
      { key: 'C', text: 'Router' },
      { key: 'D', text: 'Web Server' },
    ],
    correctAnswer: 'C',
    hints: [
      'This device connects different networks',
      'It uses IP addresses',
      'It is the "gateway" to other networks',
    ],
    explanation:
      'Routers connect different networks and allow traffic to move from a LAN to the internet.',
  },
  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'Which device allows wireless devices to connect to the network?',
    options: [
      { key: 'A', text: 'Switch' },
      { key: 'B', text: 'Router' },
      { key: 'C', text: 'Firewall' },
      { key: 'D', text: 'Access Point' },
    ],
    correctAnswer: 'D',
    hints: [
      'Think Wi-Fi',
      'Connects wireless devices',
      'Bridges wireless to wired',
    ],
    explanation:
      'An access point allows wireless devices to connect to a wired network.',
  },
  {
    id: 6,
    type: 'multiple-choice',
    prompt: 'Which device forwards traffic using MAC addresses?',
    options: [
      { key: 'A', text: 'Router' },
      { key: 'B', text: 'Switch' },
      { key: 'C', text: 'Firewall' },
      { key: 'D', text: 'Access Point' },
    ],
    correctAnswer: 'B',
    hints: [
      'Works inside the LAN',
      'Connects local devices',
      'Uses MAC addresses',
    ],
    explanation:
      'Switches use MAC addresses to forward frames within a LAN.',
  },
  {
    id: 7,
    type: 'sequencing',
    prompt:
      'Place the path of a packet in the correct order when accessing a website:',
    shuffledItems: ['Router', 'Access Point', 'Internet', 'Laptop', 'Switch'],
    correctOrder: ['Laptop', 'Access Point', 'Switch', 'Router', 'Internet'],
    hints: [
      'Start from the user device',
      'Think local network first',
      'Then move outward',
    ],
    explanation:
      'Traffic starts at the device, moves through local infrastructure, then reaches external networks.',
  },
  {
    id: 8,
    type: 'multiple-choice',
    prompt: 'What unit of data is sent across a network?',
    options: [
      { key: 'A', text: 'File' },
      { key: 'B', text: 'Packet' },
      { key: 'C', text: 'Signal' },
      { key: 'D', text: 'Frame' },
    ],
    correctAnswer: 'B',
    hints: [
      'Data is broken into smaller pieces',
      'Used across networks',
      'Key term from Lesson 4',
    ],
    explanation: 'Networks send data in small units called packets.',
  },
  {
    id: 9,
    type: 'output-interpretation',
    prompt:
      'A user runs the following command and receives replies. What does this confirm?',
    terminalOutput:
      '$ ping 8.8.8.8\nPING 8.8.8.8: 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=118 time=12.4 ms\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=11.9 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=12.1 ms\n\n--- 8.8.8.8 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss',
    options: [
      { key: 'A', text: 'The device has Wi-Fi disabled' },
      { key: 'B', text: 'The device can communicate across the network' },
      { key: 'C', text: 'The switch is broken' },
      { key: 'D', text: 'The firewall is blocking traffic' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think connectivity test',
      'Sends small messages',
      'Waits for a reply',
    ],
    explanation:
      'Ping verifies that a device can successfully communicate with another device across the network.',
  },
  {
    id: 10,
    type: 'troubleshooting',
    prompt:
      'A laptop is connected to Wi-Fi but cannot access any websites. Which device is MOST likely responsible for connecting the network to the internet?',
    options: [
      { key: 'A', text: 'Switch' },
      { key: 'B', text: 'Router' },
      { key: 'C', text: 'Access Point' },
      { key: 'D', text: 'Printer' },
    ],
    correctAnswer: 'B',
    hints: [
      'Connects LAN to WAN',
      'Sends traffic outside the network',
      'Default gateway device',
    ],
    explanation:
      'The router connects the local network to external networks like the internet.',
  },
]

export const LAB01_COMPLETION = {
  conceptMastered: 'Network Foundations and Device Roles',
  summary:
    'You identified how devices connect within a network and how data flows from a local device to a remote destination.',
  masteredPoints: [
    'The role of routers, switches, and access points',
    'The difference between LAN and WAN',
    'How packets move through a network',
  ],
  reviewIfNeeded: [
    { id: '01', title: 'What Is Networking' },
    { id: '02', title: 'Network Types' },
    { id: '03', title: 'Network Devices' },
    { id: '04', title: 'Packet Flow' },
  ],
  nextLab: {
    id: 'lab02',
    title: 'Lab 02 – Models, Layers, and Packet Journey',
  },
}
