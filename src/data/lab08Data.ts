
export type QType =
  | 'multiple-choice'
  | 'output-interpretation'
  | 'troubleshooting'
  | 'scenario-analysis'
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

export interface SeqQuestion {
  id: number
  type: 'sequencing'
  prompt: string
  shuffledItems: string[]
  correctOrder: string[]
  hints: string[]
  explanation: string
}

export type Question = MCQuestion | CLIQuestion | SeqQuestion

export interface RouterInterface { router: string; interface: string; ip: string; connects: string }

export const ROUTER_INTERFACES: RouterInterface[] = [
  { router: 'R1', interface: 'G0/0', ip: '192.168.1.1/24', connects: '→ PC-A network' },
  { router: 'R1', interface: 'G0/1', ip: '10.0.0.1/30',    connects: '→ R2 link' },
  { router: 'R2', interface: 'G0/0', ip: '10.0.0.2/30',    connects: '→ R1 link' },
  { router: 'R2', interface: 'G0/1', ip: '192.168.2.1/24', connects: '→ PC-B network' },
]

export interface TopoNode { name: string; emoji: string; ip?: string; label?: string }

export const TOPO_NODES: TopoNode[] = [
  { name: 'PC-A', emoji: '💻', ip: '192.168.1.10', label: '/24' },
  { name: 'R1',   emoji: '🌐', ip: '10.0.0.1',     label: 'G0/1' },
  { name: 'R2',   emoji: '🌐', ip: '10.0.0.2',     label: 'G0/0' },
  { name: 'PC-B', emoji: '🖥️', ip: '192.168.2.20',  label: '/24' },
]

export const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  1:  ['R1', 'R2'],
  2:  ['R2', 'R1'],
  3:  ['R1'],
  9:  ['R1'],
  10: ['R1', 'R2'],
}

export const LAB08_META = {
  id: 'lab08',
  title: 'Static Routing and Default Routes',
  difficulty: 'Intermediate' as const,
  estimatedTime: '35–45 min',
  skillsTested: [
    'Configure static routes using Cisco CLI',
    'Configure a default route',
    'Interpret routing table output',
    'Apply administrative distance logic',
    'Trace packet flow across multiple networks',
    'Troubleshoot missing routes',
  ],
  lessonsReinforced: [
    { id: '42', title: 'Static Routes' },
    { id: '43', title: 'Default Routes' },
    { id: '44', title: 'Administrative Distance' },
    { id: '45', title: 'Packet Walkthrough – Host to Remote Network' },
  ],
}

export const LAB08_SCENARIO = {
  context: 'You are configuring routing between two networks connected by two routers.',
  reports: [
    'PC-A cannot reach PC-B',
    'The router is not forwarding traffic correctly',
  ],
  challenge: 'Configure static and default routes, verify routing behavior, and troubleshoot missing connectivity.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'cli-input',
    prompt: 'Configure a static route on R1 to reach the 192.168.2.0/24 network using next-hop 10.0.0.2.',
    terminalPrompt: 'R1(config)#',
    expectedAnswer: 'ip route 192.168.2.0 255.255.255.0 10.0.0.2',
    acceptedAnswers: ['ip route 192.168.2.0 255.255.255.0 10.0.0.2'],
    hints: [
      'Command starts with "ip route"',
      'Format: ip route [network] [mask] [next-hop]',
      'Destination is 192.168.2.0 with mask 255.255.255.0',
    ],
    explanation: 'Static routes are manually configured using: ip route [destination network] [subnet mask] [next-hop IP]. This tells R1 how to reach the 192.168.2.0 network.',
  },

  {
    id: 2, type: 'cli-input',
    prompt: 'Configure a static route on R2 to reach the 192.168.1.0/24 network using next-hop 10.0.0.1.',
    terminalPrompt: 'R2(config)#',
    expectedAnswer: 'ip route 192.168.1.0 255.255.255.0 10.0.0.1',
    acceptedAnswers: ['ip route 192.168.1.0 255.255.255.0 10.0.0.1'],
    hints: [
      'Routing must exist in both directions',
      'Same format as Q1 but reversed',
      'R2 needs to know how to reach 192.168.1.0',
    ],
    explanation: 'Routing is bidirectional. R2 needs a static route back to 192.168.1.0/24 or traffic can only flow one way.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Configure a default route on R1 to forward all unknown traffic to 10.0.0.2.',
    terminalPrompt: 'R1(config)#',
    expectedAnswer: 'ip route 0.0.0.0 0.0.0.0 10.0.0.2',
    acceptedAnswers: ['ip route 0.0.0.0 0.0.0.0 10.0.0.2'],
    hints: [
      'A default route matches ANY destination',
      'Uses 0.0.0.0 0.0.0.0 as network and mask',
      'Catches all traffic with no more specific route',
    ],
    explanation: 'The default route (0.0.0.0/0) is a catch-all. All traffic without a more specific route match is forwarded to the specified next-hop.',
  },

  {
    id: 4, type: 'output-interpretation',
    prompt: 'This routing table entry appears on R1. What does the asterisk (*) represent?',
    terminalOutput: 'R1# show ip route\n\nCodes: C - connected, L - local, S - static, * - candidate default\n\nS   192.168.2.0/24 [1/0] via 10.0.0.2\nS*  0.0.0.0/0 [1/0] via 10.0.0.2\nC   192.168.1.0/24 is directly connected, G0/0\nL   192.168.1.1/32 is directly connected, G0/0',
    options: [
      { key: 'A', text: 'A static route to a specific network' },
      { key: 'B', text: 'The default route — used for all unknown destinations' },
      { key: 'C', text: 'A connected route learned from an interface' },
      { key: 'D', text: 'An error — this entry is invalid' },
    ],
    correctAnswer: 'B',
    hints: [
      'S* is a special notation',
      'It matches any destination not in the table',
      'The "candidate default" line in the legend confirms it',
    ],
    explanation: 'The asterisk (*) in S* marks the default route — the catch-all route used when no more specific match exists.',
  },

  {
    id: 5, type: 'output-interpretation',
    prompt: 'Looking at this routing table, which network is DIRECTLY CONNECTED to the router?',
    terminalOutput: 'R1# show ip route\n\nC   192.168.1.0/24 is directly connected, G0/0\nS   192.168.2.0/24 [1/0] via 10.0.0.2\nS*  0.0.0.0/0 [1/0] via 10.0.0.2',
    options: [
      { key: 'A', text: '192.168.1.0/24 (code C — directly connected)' },
      { key: 'B', text: '192.168.2.0/24 (code S — static)' },
      { key: 'C', text: '0.0.0.0/0 (default route)' },
      { key: 'D', text: '10.0.0.0/30 (link network)' },
    ],
    correctAnswer: 'A',
    hints: [
      'C = Connected',
      'Connected routes are automatically added when an interface is configured',
      'Static (S) routes are manually configured',
    ],
    explanation: 'The C code means Connected — 192.168.1.0/24 is directly attached to R1\'s G0/0 interface.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'A router has no matching route and no default route configured. A packet arrives for an unknown network. What happens?',
    options: [
      { key: 'A', text: 'The packet is forwarded to the nearest router' },
      { key: 'B', text: 'The packet is dropped' },
      { key: 'C', text: 'The packet is sent as a broadcast to all interfaces' },
      { key: 'D', text: 'The packet is queued until a route appears' },
    ],
    correctAnswer: 'B',
    hints: [
      'No route = no path forward',
      'Routers do not guess',
      'An ICMP Unreachable message is typically sent to the source',
    ],
    explanation: 'Without a matching route or default route, a router drops the packet. It cannot forward traffic it has no route for.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'A router has both a static route (AD 1) and an OSPF-learned route (AD 110) for the same network. Which route does it install in the routing table?',
    options: [
      { key: 'A', text: 'The static route (AD 1 — lower is better)' },
      { key: 'B', text: 'The OSPF route (AD 110 — dynamic is preferred)' },
      { key: 'C', text: 'Both routes — the router load-balances' },
      { key: 'D', text: 'Neither — conflicting routes are discarded' },
    ],
    correctAnswer: 'A',
    hints: [
      'AD = Administrative Distance',
      'Lower AD = more trusted source',
      'Static routes are manually configured and trusted more than OSPF',
    ],
    explanation: 'Administrative Distance determines route trustworthiness. Lower AD wins. Static (AD 1) beats OSPF (AD 110).',
  },

  {
    id: 8, type: 'cli-input',
    prompt: 'Enter the command to display the complete routing table on a Cisco router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip route',
    acceptedAnswers: ['show ip route', 'sh ip route'],
    hints: [
      'Starts with "show"',
      'Displays all C, S, L, and dynamic routes',
      'Two words after "show": ip route',
    ],
    explanation: '\'show ip route\' displays the full routing table including all connected, local, static, and dynamic routes.',
  },

  {
    id: 9, type: 'troubleshooting',
    prompt: 'PC-A cannot reach PC-B. You check R1\'s routing table and find no route for 192.168.2.0/24. What is the issue?',
    options: [
      { key: 'A', text: 'PC-A has the wrong IP address' },
      { key: 'B', text: 'R1 is missing a static route to 192.168.2.0/24' },
      { key: 'C', text: 'The switch between PC-A and R1 is failing' },
      { key: 'D', text: 'PC-B\'s NIC is offline' },
    ],
    correctAnswer: 'B',
    hints: [
      'The routing table showed no entry for 192.168.2.0',
      'Without a route, the router drops the packet',
      'Static routes must be manually configured',
    ],
    explanation: 'R1 has no route for 192.168.2.0/24, so it drops packets destined for PC-B. A static route must be configured.',
  },

  {
    id: 10, type: 'troubleshooting',
    prompt: 'R1 has a correct static route to 192.168.2.0/24. R2 has NO route back to 192.168.1.0/24. What is the result?',
    options: [
      { key: 'A', text: 'Traffic flows from PC-A to PC-B but replies cannot return — communication fails' },
      { key: 'B', text: 'Traffic flows both ways because R1 handles return traffic too' },
      { key: 'C', text: 'The static route on R1 is automatically reversed on R2' },
      { key: 'D', text: 'PC-B can send traffic because it uses the router\'s ARP cache' },
    ],
    correctAnswer: 'A',
    hints: [
      'Traffic must be able to flow in BOTH directions',
      'R2 cannot reply if it has no route back to 192.168.1.0',
      'Routing must be bidirectional to work',
    ],
    explanation: 'Packets can reach PC-B via R1\'s route, but R2 has no return path and drops reply packets. Communication fails.',
  },

  {
    id: 11, type: 'sequencing',
    prompt: 'Order the steps for a packet traveling from PC-A to PC-B across two routers:',
    shuffledItems: [
      'Router R1 forwards packet toward R2',
      'PC-A sends packet to its default gateway (R1)',
      'Router R2 forwards packet to PC-B',
      'R1 checks its routing table for 192.168.2.0',
    ],
    correctOrder: [
      'PC-A sends packet to its default gateway (R1)',
      'R1 checks its routing table for 192.168.2.0',
      'Router R1 forwards packet toward R2',
      'Router R2 forwards packet to PC-B',
    ],
    hints: [
      'PC always starts by sending to the gateway',
      'Routing table lookup before forwarding',
      'Each router handles its own segment',
    ],
    explanation: 'Packets flow from the originating PC to its gateway, which looks up the route and forwards toward the destination network.',
  },

  {
    id: 12, type: 'scenario-analysis',
    prompt: 'Why is a default route important in a real-world network, especially at the edge router connecting to the internet?',
    options: [
      { key: 'A', text: 'It removes the need for any specific static routes' },
      { key: 'B', text: 'It handles traffic destined for unknown networks (like internet destinations)' },
      { key: 'C', text: 'It replaces OSPF and EIGRP routing protocols' },
      { key: 'D', text: 'It improves the speed of packet processing on all routers' },
    ],
    correctAnswer: 'B',
    hints: [
      'Internet has millions of networks — you cannot list them all',
      'The default route catches everything with no specific match',
      'Edge routers use this to send unknown traffic to the ISP',
    ],
    explanation: 'Default routes are essential at edge routers — they forward all internet-bound traffic to the ISP without needing routes for every possible destination.',
  },
]

export const LAB08_COMPLETION = {
  conceptMastered: 'Static Routing and Default Routes',
  summary:
    'You successfully configured static and default routes and analyzed how routers forward packets between multiple networks.',
  masteredPoints: [
    'Configuring static routes with ip route command',
    'Configuring default routes using 0.0.0.0/0',
    'How administrative distance affects route selection',
    'Why routing must be bidirectional',
    'Packet flow across multiple routers',
    'Troubleshooting missing routes',
  ],
  reviewIfNeeded: [
    { id: '42', title: 'Static Routes' },
    { id: '43', title: 'Default Routes' },
    { id: '44', title: 'Administrative Distance' },
    { id: '45', title: 'Packet Walkthrough' },
  ],
  nextLab: {
    id: 'lab09',
    title: 'Lab 09 – VLAN Fundamentals and Port Roles',
  },
}
