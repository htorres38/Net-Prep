
export type QType =
  | 'multiple-choice'
  | 'topology-reasoning'
  | 'troubleshooting'
  | 'conceptual'
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

export interface ConfigStep { label: string; command: string; context: string; color: string }

export const ROUTER_ON_STICK_STEPS: ConfigStep[] = [
  { label: 'Trunk link',         command: 'switchport mode trunk',                     context: 'Switch(config-if)#',    color: 'bg-purple-100 text-purple-700' },
  { label: 'VLAN 10 subif',      command: 'interface g0/0.10',                         context: 'Router(config)#',       color: 'bg-fuchsia-100 text-fuchsia-700' },
  { label: 'Tag VLAN 10',        command: 'encapsulation dot1Q 10',                    context: 'Router(config-subif)#', color: 'bg-fuchsia-100 text-fuchsia-700' },
  { label: 'VLAN 10 gateway',    command: 'ip address 192.168.10.1 255.255.255.0',     context: 'Router(config-subif)#', color: 'bg-fuchsia-100 text-fuchsia-700' },
  { label: 'VLAN 20 subif',      command: 'interface g0/0.20',                         context: 'Router(config)#',       color: 'bg-pink-100 text-pink-700' },
  { label: 'Tag VLAN 20',        command: 'encapsulation dot1Q 20',                    context: 'Router(config-subif)#', color: 'bg-pink-100 text-pink-700' },
  { label: 'VLAN 20 gateway',    command: 'ip address 192.168.20.1 255.255.255.0',     context: 'Router(config-subif)#', color: 'bg-pink-100 text-pink-700' },
]

export interface SVIStep { label: string; command: string; context: string }
export const SVI_STEPS: SVIStep[] = [
  { label: 'Create SVI',   command: 'interface vlan 10',                         context: 'Switch(config)#' },
  { label: 'Assign IP',    command: 'ip address 192.168.10.1 255.255.255.0',     context: 'Switch(config-if)#' },
  { label: 'Bring up',     command: 'no shutdown',                               context: 'Switch(config-if)#' },
]

export interface TopoNode { name: string; emoji: string; vlan?: string; port?: string; ip?: string; label?: string }

export const TOPO_NODES: TopoNode[] = [
  { name: 'PC-A',     emoji: '💻', vlan: 'VLAN 10', port: 'Fa0/3',    ip: '192.168.10.x' },
  { name: 'PC-B',     emoji: '🖥️', vlan: 'VLAN 20', port: 'Fa0/5',    ip: '192.168.20.x' },
  { name: 'Switch S1',emoji: '🔀', label: 'S1' },
  { name: 'Router R1',emoji: '🌐', label: 'R1',                       ip: 'G0/0.10: .10.1 | G0/0.20: .20.1' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  8:  ['PC-A', 'Router R1'],
  9:  ['PC-A', 'Switch S1', 'Router R1', 'PC-B'],
  10: ['Switch S1', 'Router R1'],
}

export const LAB10_META = {
  id: 'lab10',
  title: 'Trunking and Inter-VLAN Routing',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Configure trunk ports using 802.1Q',
    'Understand VLAN tagging behavior',
    'Configure Router-on-a-Stick subinterfaces',
    'Identify default gateways per VLAN',
    'Analyze inter-VLAN packet flow',
    'Troubleshoot VLAN communication issues',
    'Understand Layer 3 switch routing with SVIs',
  ],
  lessonsReinforced: [
    { id: '48', title: '802.1Q Trunking' },
    { id: '49', title: 'Inter-VLAN Routing Overview' },
    { id: '50', title: 'Router on a Stick' },
    { id: '51', title: 'Layer 3 Switches and SVIs' },
  ],
}

export const LAB10_SCENARIO = {
  context: 'A company has implemented VLANs to separate Engineering (VLAN 10) and Sales (VLAN 20).',
  reports: [
    'Devices within the same VLAN can communicate normally',
    'Devices in DIFFERENT VLANs cannot communicate at all',
  ],
  challenge: 'Configure trunking and inter-VLAN routing so all departments can communicate through the router.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'cli-input',
    prompt: 'Configure interface G0/1 on the switch as a trunk port to carry VLAN-tagged traffic to the router.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport mode trunk',
    acceptedAnswers: ['switchport mode trunk'],
    hints: [
      'Trunk ports carry traffic for multiple VLANs using 802.1Q tags',
      'This is required for the Router-on-a-Stick connection',
      'Command: switchport mode trunk',
    ],
    explanation: 'Trunk ports use 802.1Q encapsulation to tag frames with a VLAN ID, allowing multiple VLANs to share a single physical link.',
  },

  {
    id: 2, type: 'cli-input',
    prompt: 'Create a subinterface on the router for VLAN 10. Enter the command to create subinterface g0/0.10.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'interface g0/0.10',
    acceptedAnswers: ['interface g0/0.10', 'int g0/0.10'],
    hints: [
      'Subinterfaces use dot notation: physical.vlan-id',
      'The subinterface number typically matches the VLAN ID',
      'Command: interface g0/0.10',
    ],
    explanation: 'Subinterfaces allow a single physical router interface to handle multiple VLANs. Each VLAN gets its own logical subinterface.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Assign VLAN 10 to the subinterface using 802.1Q encapsulation.',
    terminalPrompt: 'Router(config-subif)#',
    expectedAnswer: 'encapsulation dot1Q 10',
    acceptedAnswers: ['encapsulation dot1Q 10', 'encapsulation dot1q 10'],
    hints: [
      'This tells the router which VLAN this subinterface belongs to',
      'dot1Q is the 802.1Q standard for VLAN tagging',
      'Format: encapsulation dot1Q [vlan-id]',
    ],
    explanation: 'The encapsulation dot1Q command maps the subinterface to a specific VLAN. The router uses this to identify incoming tagged frames.',
  },

  {
    id: 4, type: 'cli-input',
    prompt: 'Assign the IP address 192.168.10.1/24 to the VLAN 10 subinterface. This will be the default gateway for VLAN 10 devices.',
    terminalPrompt: 'Router(config-subif)#',
    expectedAnswer: 'ip address 192.168.10.1 255.255.255.0',
    acceptedAnswers: ['ip address 192.168.10.1 255.255.255.0'],
    hints: [
      'This IP becomes the default gateway for all VLAN 10 devices',
      'Format: ip address [ip] [mask]',
      'Mask for /24 is 255.255.255.0',
    ],
    explanation: 'Each VLAN subinterface needs an IP address that acts as the default gateway for devices in that VLAN.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Begin creating the VLAN 20 subinterface on the router. Enter the interface creation command.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'interface g0/0.20',
    acceptedAnswers: ['interface g0/0.20', 'int g0/0.20'],
    hints: [
      'Same process as VLAN 10 — just a different subinterface number',
      'After this you would run: encapsulation dot1Q 20',
      'Then: ip address 192.168.20.1 255.255.255.0',
    ],
    explanation: 'Each VLAN requires its own subinterface. After creating g0/0.20, you would assign encapsulation dot1Q 20 and an IP address for the VLAN 20 gateway.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'Why is a trunk link required between the switch and the router in a Router-on-a-Stick setup?',
    options: [
      { key: 'A', text: 'To increase bandwidth between the two devices' },
      { key: 'B', text: 'To carry VLAN-tagged traffic for multiple VLANs over a single link' },
      { key: 'C', text: 'To assign IP addresses to switch ports' },
      { key: 'D', text: 'To reduce the number of routes in the routing table' },
    ],
    correctAnswer: 'B',
    hints: [
      'Router-on-a-Stick serves multiple VLANs through one physical router interface',
      'Without tagging, the router cannot distinguish which VLAN a frame belongs to',
      'Trunk = 802.1Q tags + multiple VLANs',
    ],
    explanation: 'A trunk link uses 802.1Q tagging so the router can identify which VLAN each frame belongs to, enabling it to route between them.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'What information does an 802.1Q tag add to an Ethernet frame?',
    options: [
      { key: 'A', text: 'The source MAC address of the switch' },
      { key: 'B', text: 'The VLAN ID the frame belongs to' },
      { key: 'C', text: 'The destination IP address' },
      { key: 'D', text: 'The TCP port number' },
    ],
    correctAnswer: 'B',
    hints: [
      'The tag is inserted into the frame header',
      'It identifies which logical network this frame belongs to',
      '802.1Q = the VLAN tagging standard',
    ],
    explanation: 'An 802.1Q tag inserts a 4-byte field into the Ethernet frame containing the VLAN ID (0–4094), identifying which VLAN the frame belongs to.',
  },

  {
    id: 8, type: 'topology-reasoning',
    prompt: 'PC-A (VLAN 10) needs to send traffic to PC-B (VLAN 20). What is the FIRST device PC-A sends its traffic to?',
    options: [
      { key: 'A', text: 'Directly to PC-B (same switch, no routing needed)' },
      { key: 'B', text: 'To the switch S1 which routes between VLANs' },
      { key: 'C', text: 'To its default gateway — the router subinterface 192.168.10.1' },
      { key: 'D', text: 'To a DNS server to resolve PC-B\'s address' },
    ],
    correctAnswer: 'C',
    hints: [
      'PC-A and PC-B are in different VLANs — different networks',
      'Traffic to a remote network always goes to the default gateway first',
      'The gateway for VLAN 10 is the router subinterface g0/0.10',
    ],
    explanation: 'Different VLANs = different IP networks. PC-A sends inter-VLAN traffic to its default gateway (router g0/0.10 at 192.168.10.1), which routes it to PC-B.',
  },

  {
    id: 9, type: 'sequencing',
    prompt: 'Place the inter-VLAN packet flow steps in the correct order:',
    shuffledItems: [
      'Router routes packet to VLAN 20',
      'PC-A sends frame to default gateway',
      'Switch tags frame with VLAN 10 ID',
      'Router receives tagged frame on G0/0.10',
    ],
    correctOrder: [
      'PC-A sends frame to default gateway',
      'Switch tags frame with VLAN 10 ID',
      'Router receives tagged frame on G0/0.10',
      'Router routes packet to VLAN 20',
    ],
    hints: [
      'The PC always initiates by sending to its gateway',
      'The switch tags the frame before it leaves',
      'The router sees the tag and knows which subinterface to process it on',
    ],
    explanation: 'The switch tags the frame with the VLAN ID before sending it to the router. The router strips the tag, routes the packet, re-tags for VLAN 20, and sends it back.',
  },

  {
    id: 10, type: 'troubleshooting',
    prompt: 'Devices in VLAN 10 and VLAN 20 cannot communicate even though the router subinterfaces are configured correctly. The switch-to-router port is set to ACCESS mode. What is the issue?',
    options: [
      { key: 'A', text: 'The router subinterfaces need to be rebooted' },
      { key: 'B', text: 'The switch port must be a trunk port — access mode only carries one untagged VLAN' },
      { key: 'C', text: 'The IP addresses on the subinterfaces are incorrect' },
      { key: 'D', text: 'The switch does not have VLANs configured' },
    ],
    correctAnswer: 'B',
    hints: [
      'Router-on-a-Stick requires tagged frames for each VLAN',
      'Access mode only carries one VLAN — no tags',
      'Without tags, the router cannot distinguish between VLANs',
    ],
    explanation: 'Router-on-a-Stick requires the switch port connected to the router to be a trunk. Access mode sends only one untagged VLAN — the router never sees VLAN-tagged traffic.',
  },

  {
    id: 11, type: 'cli-input',
    prompt: 'Enter the command to verify which switch interfaces are currently operating as trunk ports.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show interfaces trunk',
    acceptedAnswers: ['show interfaces trunk', 'sh int trunk'],
    hints: [
      'Displays trunk status for all interfaces',
      'Shows allowed VLANs on each trunk',
      'Starts with "show interfaces"',
    ],
    explanation: 'show interfaces trunk shows all trunk links, their 802.1Q encapsulation status, and which VLANs are allowed across each trunk.',
  },

  {
    id: 12, type: 'cli-input',
    prompt: 'Enter the command to verify router subinterfaces and confirm their IP addresses are assigned.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip interface brief',
    acceptedAnswers: ['show ip interface brief', 'sh ip int br'],
    hints: [
      'Lists all interfaces including subinterfaces',
      'Shows IP addresses and up/down status',
      'Same command used to verify physical interfaces',
    ],
    explanation: 'show ip interface brief shows all interfaces including subinterfaces (g0/0.10, g0/0.20) with their assigned IPs and status.',
  },

  {
    id: 13, type: 'conceptual',
    prompt: 'Why are standard (Layer 2) switches unable to route traffic between VLANs on their own?',
    options: [
      { key: 'A', text: 'Switches do not support 802.1Q tagging' },
      { key: 'B', text: 'Switches operate at Layer 2 and use MAC addresses — they cannot make IP routing decisions' },
      { key: 'C', text: 'Switches are too slow to process inter-VLAN traffic' },
      { key: 'D', text: 'Switches require DNS to route between VLANs' },
    ],
    correctAnswer: 'B',
    hints: [
      'Layer 2 devices use MAC addresses, not IP addresses',
      'Routing requires Layer 3 intelligence',
      'VLANs are separate IP networks — Layer 3 is needed to cross them',
    ],
    explanation: 'Layer 2 switches forward frames based on MAC addresses within the same VLAN. Routing between VLANs requires Layer 3 (IP) decision-making, which standard switches cannot do.',
  },

  {
    id: 14, type: 'conceptual',
    prompt: 'What device can perform inter-VLAN routing INTERNALLY without a separate external router?',
    options: [
      { key: 'A', text: 'A standard Layer 2 switch' },
      { key: 'B', text: 'A wireless access point' },
      { key: 'C', text: 'A Layer 3 switch using SVIs (Switched Virtual Interfaces)' },
      { key: 'D', text: 'A hub with multiple VLANs configured' },
    ],
    correctAnswer: 'C',
    hints: [
      'SVI = Switched Virtual Interface',
      'This type of switch has built-in routing capability',
      'Used instead of Router-on-a-Stick in modern networks',
    ],
    explanation: 'A Layer 3 switch uses SVIs — virtual interfaces assigned to each VLAN — to route between VLANs internally, eliminating the need for an external router.',
  },

  {
    id: 15, type: 'cli-input',
    prompt: 'Create an SVI for VLAN 10 on a Layer 3 switch. Enter the command to create the virtual interface.',
    terminalPrompt: 'Switch(config)#',
    expectedAnswer: 'interface vlan 10',
    acceptedAnswers: ['interface vlan 10', 'int vlan 10'],
    hints: [
      'SVIs use the "interface vlan" command format',
      'After creating it you would assign: ip address 192.168.10.1 255.255.255.0',
      'Then activate it with: no shutdown',
    ],
    explanation: 'SVIs are created with "interface vlan [id]". After assigning an IP and running "no shutdown", the SVI acts as the default gateway for all VLAN 10 devices.',
  },
]

export const LAB10_COMPLETION = {
  conceptMastered: 'Trunking and Inter-VLAN Routing',
  summary:
    'You successfully configured trunk links and implemented inter-VLAN routing using Router-on-a-Stick and Layer 3 switch SVIs.',
  masteredPoints: [
    'How 802.1Q VLAN tagging works on trunk links',
    'Trunk port configuration on switches',
    'Router-on-a-Stick subinterface configuration',
    'Assigning per-VLAN default gateways',
    'Inter-VLAN packet flow through the router',
    'Layer 3 switch SVIs as an alternative to Router-on-a-Stick',
  ],
  reviewIfNeeded: [
    { id: '48', title: '802.1Q Trunking' },
    { id: '49', title: 'Inter-VLAN Routing Overview' },
    { id: '50', title: 'Router on a Stick' },
    { id: '51', title: 'Layer 3 Switches and SVIs' },
  ],
  nextLab: {
    id: 'lab11',
    title: 'Lab 11 – STP Fundamentals and Loop Prevention',
  },
}
