
export type QType =
  | 'multiple-choice'
  | 'output-interpretation'
  | 'troubleshooting'
  | 'scenario-analysis'
  | 'topology-reasoning'
  | 'cli-input'

export interface MCOption { key: string; text: string }

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

export interface VlanInfo { id: number; name: string; color: string; devices: string[] }

export const VLANS: VlanInfo[] = [
  { id: 10, name: 'Engineering', color: 'blue',   devices: ['PC-A (S1 Fa0/3)', 'PC-C (S2 Fa0/3)'] },
  { id: 20, name: 'Sales',       color: 'orange', devices: ['PC-B (S1 Fa0/5)', 'PC-D (S2 Fa0/4)'] },
]

export interface PortMapping { switch: string; port: string; mode: string; vlan: string }

export const PORT_MAP: PortMapping[] = [
  { switch: 'S1', port: 'Fa0/3', mode: 'access', vlan: 'VLAN 10' },
  { switch: 'S1', port: 'Fa0/5', mode: 'access', vlan: 'VLAN 20' },
  { switch: 'S1', port: 'G0/1',  mode: 'trunk',  vlan: 'All VLANs' },
  { switch: 'S2', port: 'Fa0/3', mode: 'access', vlan: 'VLAN 10' },
  { switch: 'S2', port: 'Fa0/4', mode: 'access', vlan: 'VLAN 20' },
  { switch: 'S2', port: 'G0/1',  mode: 'trunk',  vlan: 'All VLANs' },
]

export interface TopoNode { name: string; emoji: string; vlan?: string; port?: string; label?: string }

export const TOPO_NODES: TopoNode[] = [
  { name: 'PC-A', emoji: '💻', vlan: 'VLAN 10', port: 'Fa0/3' },
  { name: 'PC-B', emoji: '🖥️', vlan: 'VLAN 20', port: 'Fa0/5' },
  { name: 'S1',   emoji: '🔀', label: 'Switch S1' },
  { name: 'S2',   emoji: '🔀', label: 'Switch S2' },
  { name: 'PC-C', emoji: '💻', vlan: 'VLAN 10', port: 'Fa0/3' },
  { name: 'PC-D', emoji: '🖥️', vlan: 'VLAN 20', port: 'Fa0/4' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  9:  ['PC-A', 'PC-C'],
  10: ['PC-A', 'S1', 'S2', 'PC-C'],
}

export const LAB09_META = {
  id: 'lab09',
  title: 'VLAN Fundamentals and Port Roles',
  difficulty: 'Intermediate' as const,
  estimatedTime: '30–40 min',
  skillsTested: [
    'Understand VLAN behavior and broadcast domains',
    'Configure VLANs on a switch',
    'Configure access ports',
    'Configure trunk ports',
    'Interpret VLAN-related command output',
    'Analyze VLAN communication issues',
  ],
  lessonsReinforced: [
    { id: '46', title: 'VLAN Fundamentals' },
    { id: '47', title: 'Access Ports vs Trunk Ports' },
  ],
}

export const LAB09_SCENARIO = {
  context: 'You are configuring a switch for a company with two departments: Engineering (VLAN 10) and Sales (VLAN 20).',
  reports: [
    'Devices cannot communicate correctly',
    'VLAN separation may not be configured properly',
  ],
  challenge: 'Configure VLANs, assign ports correctly, and ensure VLAN traffic behaves as expected.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'cli-input',
    prompt: 'Create VLAN 10 on the switch.',
    terminalPrompt: 'Switch(config)#',
    expectedAnswer: 'vlan 10',
    acceptedAnswers: ['vlan 10'],
    hints: [
      'VLANs must be created before ports can be assigned',
      'The command is simply: vlan followed by the number',
      'This enters VLAN configuration mode',
    ],
    explanation: 'The \'vlan 10\' command creates VLAN 10 in the switch\'s VLAN database. VLANs must exist before they can be assigned to ports.',
  },

  {
    id: 2, type: 'cli-input',
    prompt: 'Create VLAN 20 on the switch.',
    terminalPrompt: 'Switch(config)#',
    expectedAnswer: 'vlan 20',
    acceptedAnswers: ['vlan 20'],
    hints: [
      'Same command as VLAN 10 but for VLAN 20',
      'Both VLANs must be created separately',
      'Enter the VLAN number to create it',
    ],
    explanation: 'Each VLAN must be independently created. \'vlan 20\' creates the Sales department VLAN.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Set interface Fa0/3 to access mode so it can be assigned to a single VLAN.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport mode access',
    acceptedAnswers: ['switchport mode access'],
    hints: [
      'Access mode limits the port to one VLAN',
      'Must be set before assigning a VLAN',
      'Used for ports connecting to end devices',
    ],
    explanation: '\'switchport mode access\' configures the port as an access port, which only carries traffic for a single VLAN — appropriate for devices like PCs.',
  },

  {
    id: 4, type: 'cli-input',
    prompt: 'Assign interface Fa0/3 (already in access mode) to VLAN 10.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport access vlan 10',
    acceptedAnswers: ['switchport access vlan 10'],
    hints: [
      'Assigns the VLAN to this access port',
      'Format: switchport access vlan [number]',
      'VLAN 10 = Engineering department',
    ],
    explanation: '\'switchport access vlan 10\' assigns the access port to VLAN 10, placing any connected device into the Engineering VLAN.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Configure interface G0/1 as a trunk port to carry multiple VLANs between switches.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport mode trunk',
    acceptedAnswers: ['switchport mode trunk'],
    hints: [
      'Trunk ports carry traffic for multiple VLANs',
      'Used on links between switches',
      'Command: switchport mode trunk',
    ],
    explanation: '\'switchport mode trunk\' enables the port to carry tagged VLAN traffic from all VLANs — essential for switch-to-switch connections.',
  },

  {
    id: 6, type: 'output-interpretation',
    prompt: 'This is the output of \'show vlan brief\' on S1. Which VLAN is interface Fa0/3 assigned to?',
    terminalOutput: 'S1# show vlan brief\n\nVLAN Name       Status    Ports\n---- ----------  --------- ---------\n1    default     active    Fa0/1, Fa0/2\n10   Eng         active    Fa0/3\n20   Sales       active    Fa0/5\n1002 fddi-default act/unsup \n1003 token-ring   act/unsup',
    options: [
      { key: 'A', text: 'VLAN 10 – Engineering' },
      { key: 'B', text: 'VLAN 20 – Sales' },
      { key: 'C', text: 'VLAN 1 – default' },
      { key: 'D', text: 'Not assigned to any VLAN' },
    ],
    correctAnswer: 'A',
    hints: [
      'Look at the Ports column',
      'Find Fa0/3 in the list',
      'Which VLAN row contains Fa0/3?',
    ],
    explanation: 'In the show vlan brief output, Fa0/3 appears under VLAN 10 (Eng) — so it is assigned to the Engineering VLAN.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'Which type of switch port is designed to carry traffic for MULTIPLE VLANs simultaneously?',
    options: [
      { key: 'A', text: 'Access port' },
      { key: 'B', text: 'Trunk port' },
      { key: 'C', text: 'Routed port' },
      { key: 'D', text: 'Loopback port' },
    ],
    correctAnswer: 'B',
    hints: [
      'Used for switch-to-switch connections',
      'Tags frames with VLAN IDs (802.1Q)',
      'Carries multiple VLAN traffic over a single link',
    ],
    explanation: 'Trunk ports use 802.1Q tagging to carry traffic for multiple VLANs over a single physical link.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'Which type of switch port is used to connect END DEVICES like PCs and printers?',
    options: [
      { key: 'A', text: 'Trunk port' },
      { key: 'B', text: 'Access port' },
      { key: 'C', text: 'Routed port' },
      { key: 'D', text: 'Management port' },
    ],
    correctAnswer: 'B',
    hints: [
      'Carries traffic for only one VLAN',
      'No VLAN tagging needed — devices don\'t understand it',
      'End devices connect here',
    ],
    explanation: 'Access ports connect to end devices and carry untagged traffic for a single VLAN. End devices are unaware of VLAN IDs.',
  },

  {
    id: 9, type: 'topology-reasoning',
    prompt: 'PC-A (VLAN 10, on S1) sends a broadcast frame. Which devices receive it?',
    options: [
      { key: 'A', text: 'All devices connected to both switches' },
      { key: 'B', text: 'Only devices in VLAN 10 — PC-A and PC-C' },
      { key: 'C', text: 'Only devices on S1 — PC-A and PC-B' },
      { key: 'D', text: 'All devices except PC-A' },
    ],
    correctAnswer: 'B',
    hints: [
      'Each VLAN is its own broadcast domain',
      'VLAN 10 contains PC-A and PC-C',
      'Broadcasts stay within the VLAN — VLAN 20 devices are isolated',
    ],
    explanation: 'VLANs create separate broadcast domains. A broadcast from PC-A (VLAN 10) only reaches other VLAN 10 devices — PC-C on S2.',
  },

  {
    id: 10, type: 'troubleshooting',
    prompt: 'PC-A (VLAN 10 on S1) cannot communicate with PC-C (VLAN 10 on S2). Both are correctly assigned to VLAN 10. The trunk link between S1 and S2 is NOT configured. What is the issue?',
    options: [
      { key: 'A', text: 'PC-A and PC-C are in different VLANs' },
      { key: 'B', text: 'The trunk port between S1 and S2 is missing — VLAN traffic cannot cross switches' },
      { key: 'C', text: 'VLAN 10 is not created on S2' },
      { key: 'D', text: 'The access ports are configured incorrectly' },
    ],
    correctAnswer: 'B',
    hints: [
      'Both PCs are in VLAN 10 — that is correct',
      'The problem is the switch-to-switch link',
      'Trunk must be configured on G0/1 of both switches',
    ],
    explanation: 'Even with correct VLAN assignments, VLAN traffic cannot travel between switches without a trunk link. Both G0/1 ports must be configured as trunk ports.',
  },

  {
    id: 11, type: 'cli-input',
    prompt: 'Enter the command to verify all VLANs and their port assignments on a switch.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show vlan brief',
    acceptedAnswers: ['show vlan brief', 'sh vlan br'],
    hints: [
      'Displays VLAN names, status, and port assignments',
      'Starts with "show vlan"',
      'Use "brief" for a compact summary',
    ],
    explanation: '\'show vlan brief\' displays all configured VLANs, their names, status, and which ports are assigned to each VLAN.',
  },

  {
    id: 12, type: 'cli-input',
    prompt: 'Enter the command to verify trunk port configuration on the switch.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show interfaces trunk',
    acceptedAnswers: ['show interfaces trunk', 'sh int trunk'],
    hints: [
      'Shows which interfaces are operating as trunks',
      'Displays allowed VLANs and native VLAN',
      'Starts with "show interfaces"',
    ],
    explanation: '\'show interfaces trunk\' displays all trunk links, their encapsulation type, status, and which VLANs are allowed across each trunk.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'PC-A physically connects to switch port Fa0/3, which is correctly in access mode. However, the port is assigned to VLAN 20 instead of VLAN 10. What happens?',
    options: [
      { key: 'A', text: 'PC-A is placed into VLAN 10 automatically because of its IP address' },
      { key: 'B', text: 'PC-A cannot communicate with other VLAN 10 devices — it is in the wrong VLAN' },
      { key: 'C', text: 'The switch broadcasts to both VLANs on PC-A\'s behalf' },
      { key: 'D', text: 'No impact — VLANs don\'t affect access ports' },
    ],
    correctAnswer: 'B',
    hints: [
      'VLAN assignment is per-port, not per-device',
      'If the port is in VLAN 20, the PC acts as if it is in VLAN 20',
      'PC-A would be isolated from the VLAN 10 devices it expects to talk to',
    ],
    explanation: 'VLAN assignment is port-based. If Fa0/3 is in VLAN 20, PC-A is treated as a VLAN 20 device — it cannot communicate with VLAN 10 devices.',
  },

  {
    id: 14, type: 'scenario-analysis',
    prompt: 'What is the primary reason a company would use VLANs to separate their Engineering and Sales departments?',
    options: [
      { key: 'A', text: 'VLANs increase the speed of traffic between departments' },
      { key: 'B', text: 'VLANs create separate broadcast domains, reducing unnecessary traffic and improving security and organization' },
      { key: 'C', text: 'VLANs automatically encrypt traffic between departments' },
      { key: 'D', text: 'VLANs allow devices to share the same IP address range safely' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about broadcast traffic in a flat network',
      'Separated traffic = less noise, better security',
      'Each VLAN is its own isolated segment',
    ],
    explanation: 'VLANs logically separate networks on the same physical infrastructure. Each VLAN is its own broadcast domain, reducing unnecessary traffic, improving security, and organizing the network by function.',
  },
]

export const LAB09_COMPLETION = {
  conceptMastered: 'VLANs and Port Roles',
  summary:
    'You successfully configured VLANs, assigned access ports, and configured trunk links between switches.',
  masteredPoints: [
    'How VLANs separate broadcast domains',
    'Difference between access and trunk ports',
    'How VLAN traffic flows across switches via trunks',
    'How to verify VLAN configuration with CLI commands',
    'Common VLAN misconfiguration issues and fixes',
  ],
  reviewIfNeeded: [
    { id: '46', title: 'VLAN Fundamentals' },
    { id: '47', title: 'Access Ports vs Trunk Ports' },
  ],
  nextLab: {
    id: 'lab10',
    title: 'Lab 10 – Trunking and Inter-VLAN Routing',
  },
}
