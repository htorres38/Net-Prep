
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

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  4:  ['Switch A', 'Switch B', 'Switch C'],
  5:  ['Switch B', 'Switch C'],
  8:  ['Switch A', 'Switch B', 'Switch C'],
  9:  ['Switch A', 'Switch B', 'Switch C'],
  12: ['Switch A', 'Switch B', 'Switch C'],
}

export const LAB11_META = {
  id: 'lab11',
  title: 'STP Foundations and EtherChannel',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Identify Layer 2 loop problems',
    'Understand STP behavior and purpose',
    'Identify root bridge and port roles',
    'Interpret STP command output',
    'Understand RSTP improvements',
    'Configure and verify EtherChannel',
    'Identify LACP vs PAgP behavior',
    'Troubleshoot switching loops and link issues',
  ],
  lessonsReinforced: [
    { id: '52', title: 'Layer 2 Loops' },
    { id: '53', title: 'STP Fundamentals' },
    { id: '54', title: 'Root Bridge and Port Roles' },
    { id: '55', title: 'Rapid STP' },
    { id: '56', title: 'EtherChannel Fundamentals' },
    { id: '57', title: 'LACP and PAgP' },
  ],
}

export const LAB11_SCENARIO = {
  context: 'A company added redundant links between switches for reliability.',
  reports: [
    'Extremely slow network performance throughout the office',
    'Intermittent connectivity — devices dropping in and out',
    'Duplicate frames appearing on the network',
  ],
  challenge: 'Identify the issue, analyze STP behavior, ensure proper loop prevention, and implement EtherChannel correctly.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What is the main problem caused by Layer 2 loops in a switched network?',
    options: [
      { key: 'A', text: 'Packet encryption failure on all interfaces' },
      { key: 'B', text: 'Broadcast storms that overwhelm the network' },
      { key: 'C', text: 'DNS resolution failure for all domain names' },
      { key: 'D', text: 'Routing table corruption on connected routers' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about what happens when a broadcast frame loops endlessly',
      'Broadcast traffic multiplies with every loop cycle',
      'The network quickly becomes saturated — all bandwidth consumed',
    ],
    explanation: 'Layer 2 loops cause broadcast storms. Broadcast frames have no TTL, so they loop endlessly between switches, multiplying with each pass until all bandwidth is consumed and the network collapses.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'What protocol was specifically designed to prevent Layer 2 loops in switched networks?',
    options: [
      { key: 'A', text: 'ARP (Address Resolution Protocol)' },
      { key: 'B', text: 'DHCP (Dynamic Host Configuration Protocol)' },
      { key: 'C', text: 'STP (Spanning Tree Protocol)' },
      { key: 'D', text: 'NAT (Network Address Translation)' },
    ],
    correctAnswer: 'C',
    hints: [
      'This protocol creates a loop-free logical topology',
      'It blocks redundant ports while keeping physical links connected',
      'STP = Spanning Tree Protocol — named after the data structure it creates',
    ],
    explanation: 'STP (Spanning Tree Protocol) prevents Layer 2 loops by placing redundant switch ports in a blocked state, creating a loop-free logical topology while keeping physical redundancy for failover.',
  },

  {
    id: 3, type: 'conceptual',
    prompt: 'What is the role of the root bridge in an STP topology?',
    options: [
      { key: 'A', text: 'The switch with the highest MAC address — all ports remain forwarding' },
      { key: 'B', text: 'The central reference point — all switches calculate best paths relative to it' },
      { key: 'C', text: 'The switch with the highest STP priority number in the network' },
      { key: 'D', text: 'The switch that is physically connected to the internet router' },
    ],
    correctAnswer: 'B',
    hints: [
      'STP builds a tree — this switch is its root',
      'All path costs and port roles are calculated from this switch outward',
      'Think of it as the "center" of the spanning tree',
    ],
    explanation: 'The root bridge is the central reference point for the STP topology. Every switch calculates its best path to reach the root bridge, and all port roles (Root, Designated, Alternate) are determined based on those path costs.',
  },

  {
    id: 4, type: 'topology-reasoning',
    prompt: 'In the topology shown, which switch becomes the STP root bridge?',
    options: [
      { key: 'A', text: 'The switch with the highest MAC address in the network' },
      { key: 'B', text: 'The switch with the lowest Bridge ID (priority + MAC address)' },
      { key: 'C', text: 'The switch with the highest STP priority number configured' },
      { key: 'D', text: 'The first switch powered on in the network' },
    ],
    correctAnswer: 'B',
    hints: [
      'STP uses a Bridge ID to elect the root bridge',
      'Lower = better — the lowest Bridge ID wins the election',
      'Bridge ID = priority (default 32768) combined with the MAC address',
    ],
    explanation: 'The switch with the lowest Bridge ID wins the root bridge election. The Bridge ID combines a configurable priority (default 32768) and the switch MAC address. Equal priorities are broken by the lower MAC address.',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'Examine this STP output. Which port is in a blocked state?',
    terminalOutput:
      'Interface   Role  Sts\n' +
      'Fa0/1       Root  FWD\n' +
      'Fa0/2       Desg  FWD\n' +
      'Fa0/3       Altn  BLK',
    options: [
      { key: 'A', text: 'Fa0/1 — Root port, currently forwarding' },
      { key: 'B', text: 'Fa0/2 — Designated port, currently forwarding' },
      { key: 'C', text: 'Fa0/3 — Alternate port, currently blocked' },
      { key: 'D', text: 'All ports are in a forwarding state' },
    ],
    correctAnswer: 'C',
    hints: [
      'Look at the Sts column — it shows the port state',
      'BLK = Blocked state',
      'FWD = Forwarding state',
    ],
    explanation: 'Fa0/3 is in the BLK (Blocked) state with an Altn (Alternate) role. Blocked ports do not forward data frames but continue listening for BPDUs. This prevents the loop in the redundant path.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'What is the purpose of a blocked port in STP?',
    options: [
      { key: 'A', text: 'Increase link bandwidth by aggregating traffic' },
      { key: 'B', text: 'Prevent Layer 2 loops while keeping the physical link available for failover' },
      { key: 'C', text: 'Forward all traffic at a higher priority than other ports' },
      { key: 'D', text: 'Assign VLAN membership to connected end devices' },
    ],
    correctAnswer: 'B',
    hints: [
      'Blocked ports do not forward data frames',
      'But they listen for BPDUs in case the active path fails',
      'Blocking = loop prevention without removing the physical redundancy',
    ],
    explanation: 'Blocked ports prevent Layer 2 loops by refusing to forward data frames. They remain in standby, listening for BPDUs — if the active forwarding path fails, the blocked port can transition to forwarding to restore connectivity.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'What is the main advantage of RSTP (Rapid Spanning Tree Protocol) over original STP?',
    options: [
      { key: 'A', text: 'Better traffic encryption between switches' },
      { key: 'B', text: 'Much faster convergence after a topology change' },
      { key: 'C', text: 'Support for significantly more VLANs' },
      { key: 'D', text: 'Lower hardware cost per switch port' },
    ],
    correctAnswer: 'B',
    hints: [
      'Original STP could take 30–50 seconds to converge after a failure',
      'RSTP uses new port states and active negotiation to speed things up',
      'RSTP typically converges in 1–2 seconds',
    ],
    explanation: 'RSTP (802.1w) converges in seconds compared to 30–50 seconds for original STP. It achieves this through new port states (Discarding, Learning, Forwarding) and active topology negotiation between switches.',
  },

  {
    id: 8, type: 'troubleshooting',
    prompt: 'A network is experiencing extremely high CPU on all switches and users report receiving duplicate packets. What is the MOST likely cause?',
    options: [
      { key: 'A', text: 'Misconfigured VLAN assignments on trunk ports' },
      { key: 'B', text: 'DHCP server is responding too slowly' },
      { key: 'C', text: 'A Layer 2 loop is causing a broadcast storm' },
      { key: 'D', text: 'Incorrect IP addressing configured on end devices' },
    ],
    correctAnswer: 'C',
    hints: [
      'High CPU across all switches + duplicate frames is a classic symptom set',
      'Frames multiplying = broadcast storm behavior — not a Layer 3 issue',
      'Layer 2 loops cause this — check STP configuration',
    ],
    explanation: 'High CPU and duplicate frames are classic broadcast storm symptoms from a Layer 2 loop. Without STP blocking the redundant path, frames loop endlessly and multiply, consuming all bandwidth and processing power.',
  },

  {
    id: 9, type: 'cli-input',
    prompt: 'Enter the command to verify STP status and view port roles and states on a switch.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show spanning-tree',
    acceptedAnswers: ['show spanning-tree', 'sh spanning-tree', 'show span'],
    hints: [
      'This command displays the STP topology for all active VLANs',
      'It shows root bridge ID, port roles, and port states',
      'Command format: show spanning-tree',
    ],
    explanation: 'show spanning-tree displays the full STP topology including the root bridge ID, each port\'s role (Root, Designated, Alternate), and state (FWD = forwarding, BLK = blocked) for each VLAN.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'What does EtherChannel do in a switched network?',
    options: [
      { key: 'A', text: 'Blocks redundant switch ports to prevent loops' },
      { key: 'B', text: 'Combines multiple physical links into one logical high-bandwidth link' },
      { key: 'C', text: 'Routes traffic between different VLANs using subinterfaces' },
      { key: 'D', text: 'Encrypts all data frames between directly connected switches' },
    ],
    correctAnswer: 'B',
    hints: [
      'EtherChannel bundles multiple physical interfaces together',
      'The result appears as a single logical interface to STP and higher layers',
      'Think of it as link aggregation — more bandwidth, built-in redundancy',
    ],
    explanation: 'EtherChannel (link aggregation) combines multiple physical switch links into a single logical link. This increases total bandwidth proportionally and provides redundancy — if one physical member link fails, the others continue.',
  },

  {
    id: 11, type: 'multiple-choice',
    prompt: 'How does STP treat an EtherChannel bundle?',
    options: [
      { key: 'A', text: 'As multiple individual physical links that may be blocked separately' },
      { key: 'B', text: 'As one single logical link — STP will not block individual member ports' },
      { key: 'C', text: 'As blocked ports by default until EtherChannel is manually activated' },
      { key: 'D', text: 'As separate VLAN trunks requiring individual STP instances' },
    ],
    correctAnswer: 'B',
    hints: [
      'EtherChannel presents itself to STP as a single connection',
      'STP cannot see the individual physical links inside the bundle',
      'This prevents STP from accidentally blocking half the bundle',
    ],
    explanation: 'STP sees an EtherChannel bundle as a single logical link. This is critical — without it, STP might block some member ports and break the bundle. Always configure EtherChannel before STP to ensure correct behavior.',
  },

  {
    id: 12, type: 'cli-input',
    prompt: 'Enter the command to verify EtherChannel status and see which physical interfaces are bundled.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show etherchannel summary',
    acceptedAnswers: ['show etherchannel summary', 'sh etherchannel summary', 'show ether summary'],
    hints: [
      'This command shows all port-channel groups and their members',
      'It displays the protocol in use (LACP or PAgP) and the bundle state',
      'Command: show etherchannel summary',
    ],
    explanation: 'show etherchannel summary displays all port-channel groups, their member interfaces, the bundling protocol (LACP/PAgP), and state flags (U = in use, P = bundled in port-channel, I = standalone).',
  },

  {
    id: 13, type: 'multiple-choice',
    prompt: 'Which EtherChannel negotiation protocol is an IEEE open standard that works across multiple vendors?',
    options: [
      { key: 'A', text: 'PAgP — Port Aggregation Protocol (Cisco proprietary)' },
      { key: 'B', text: 'LACP — Link Aggregation Control Protocol (IEEE 802.3ad)' },
      { key: 'C', text: 'STP — Spanning Tree Protocol (IEEE 802.1D)' },
      { key: 'D', text: 'ARP — Address Resolution Protocol (RFC 826)' },
    ],
    correctAnswer: 'B',
    hints: [
      'One EtherChannel protocol is IEEE standard, one is Cisco proprietary',
      'IEEE = open standard, works between different manufacturers',
      'LACP is defined by IEEE 802.3ad',
    ],
    explanation: 'LACP (Link Aggregation Control Protocol) is defined by IEEE 802.3ad and is the open standard choice for EtherChannel. It works between different vendors. PAgP is Cisco proprietary and only works between Cisco devices.',
  },

  {
    id: 14, type: 'multiple-choice',
    prompt: 'Which EtherChannel protocol is Cisco proprietary and only works between Cisco devices?',
    options: [
      { key: 'A', text: 'LACP — Link Aggregation Control Protocol' },
      { key: 'B', text: 'PAgP — Port Aggregation Protocol' },
      { key: 'C', text: 'OSPF — Open Shortest Path First' },
      { key: 'D', text: 'ICMP — Internet Control Message Protocol' },
    ],
    correctAnswer: 'B',
    hints: [
      'Cisco created its own EtherChannel negotiation protocol before the IEEE standard',
      'This protocol only works between Cisco switches',
      'PAgP = Port Aggregation Protocol',
    ],
    explanation: 'PAgP (Port Aggregation Protocol) is Cisco proprietary and only works between Cisco devices. In Cisco-only environments both PAgP and LACP are valid, but LACP is preferred for multi-vendor environments.',
  },

  {
    id: 15, type: 'troubleshooting',
    prompt: 'Two switches are configured for EtherChannel using LACP, but both interfaces are set to passive mode. What happens?',
    options: [
      { key: 'A', text: 'EtherChannel forms normally — passive mode on both sides works fine' },
      { key: 'B', text: 'EtherChannel negotiates and automatically promotes one side to active mode' },
      { key: 'C', text: 'EtherChannel does not form — at least one side must be in active mode' },
      { key: 'D', text: 'The switches reboot and retry EtherChannel formation automatically' },
    ],
    correctAnswer: 'C',
    hints: [
      'LACP passive mode means: wait for the other side to initiate',
      'If both sides are passive, neither side will send LACP PDUs to start negotiation',
      'One side must be active to begin LACP negotiation',
    ],
    explanation: 'LACP passive mode means the switch waits for the other side to send LACP PDUs before responding. If both sides are passive, neither initiates — EtherChannel never forms. Configure at least one side as LACP active.',
  },
]

export const LAB11_COMPLETION = {
  conceptMastered: 'STP and EtherChannel',
  summary:
    'You successfully analyzed Layer 2 loops, understood STP behavior, and applied EtherChannel to improve network performance and redundancy.',
  masteredPoints: [
    'Why Layer 2 loops are dangerous (broadcast storms)',
    'How STP prevents loops by blocking redundant ports',
    'Root bridge election using Bridge ID (priority + MAC)',
    'STP port roles: Root, Designated, Alternate',
    'RSTP faster convergence compared to original STP',
    'EtherChannel link bundling for bandwidth and redundancy',
    'LACP (IEEE open standard) vs PAgP (Cisco proprietary)',
    'Troubleshooting EtherChannel LACP passive/passive failure',
  ],
  reviewIfNeeded: [
    { id: '52', title: 'Layer 2 Loops' },
    { id: '53', title: 'STP Fundamentals' },
    { id: '54', title: 'Root Bridge and Port Roles' },
    { id: '55', title: 'Rapid STP' },
    { id: '56', title: 'EtherChannel Fundamentals' },
    { id: '57', title: 'LACP and PAgP' },
  ],
  nextLab: {
    id: 'lab12',
    title: 'Lab 12 – OSPF Fundamentals',
  },
}
