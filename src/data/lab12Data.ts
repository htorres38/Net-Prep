
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
  3:  ['Router A', 'Router B'],
  7:  ['Router A', 'Router B'],
  9:  ['Router A', 'Router B', 'Router C'],
  11: ['Router A', 'Router B', 'Router C'],
  14: ['Router A', 'Router B', 'Router C'],
}

export const LAB12_META = {
  id: 'lab12',
  title: 'OSPF Fundamentals',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Understand dynamic routing vs static routing',
    'Identify OSPF behavior and purpose',
    'Analyze routing tables with OSPF entries',
    'Understand OSPF neighbor relationships',
    'Interpret OSPF states and CLI output',
    'Calculate OSPF cost and best path selection',
    'Troubleshoot OSPF adjacency issues',
  ],
  lessonsReinforced: [
    { id: '58', title: 'OSPF Fundamentals' },
    { id: '59', title: 'OSPF Neighbors and Adjacencies' },
    { id: '60', title: 'OSPF Cost and Best Path Selection' },
  ],
}

export const LAB12_SCENARIO = {
  context: 'A company network has grown rapidly. Static routes are no longer scalable and OSPF has been deployed.',
  reports: [
    'Some routers are not learning routes from neighbors',
    'Some paths are not optimal — traffic taking slower links',
    'Neighbor relationships may not be forming on all segments',
  ],
  challenge: 'Verify OSPF operation, analyze routing tables, troubleshoot adjacency issues, and determine correct best path selection.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What type of routing protocol is OSPF?',
    options: [
      { key: 'A', text: 'Distance-vector — shares entire routing tables with neighbors' },
      { key: 'B', text: 'Link-state — builds a complete topology map of the network' },
      { key: 'C', text: 'Static — requires manual configuration of each route' },
      { key: 'D', text: 'Hybrid — combines distance-vector and link-state algorithms' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF routers learn the full network topology',
      'They share Link-State Advertisements (LSAs), not just routing tables',
      'Link-state protocols run Dijkstra\'s SPF algorithm',
    ],
    explanation: 'OSPF is a link-state routing protocol. Each router builds a complete map of the network topology using LSAs, then independently runs the Dijkstra SPF algorithm to calculate the shortest paths.',
  },

  {
    id: 2, type: 'conceptual',
    prompt: 'What is the main advantage of dynamic routing protocols like OSPF over static routing?',
    options: [
      { key: 'A', text: 'Requires a network administrator to manually update each router individually' },
      { key: 'B', text: 'Automatically discovers neighbors and exchanges route updates as the network changes' },
      { key: 'C', text: 'Encrypts all routing information before sharing it between routers' },
      { key: 'D', text: 'Only works on Cisco equipment — not compatible with other vendors' },
    ],
    correctAnswer: 'B',
    hints: [
      'Static routing requires an admin to update every router manually',
      'Dynamic routing scales to large networks without per-device manual config',
      'OSPF automatically adapts when topology changes occur',
    ],
    explanation: 'Dynamic routing protocols like OSPF automatically discover neighbors and exchange route updates. When topology changes occur, OSPF re-converges automatically — eliminating the manual effort required by static routing in large networks.',
  },

  {
    id: 3, type: 'topology-reasoning',
    prompt: 'Analyze this routing table output. What does the "O" prefix code represent?',
    terminalOutput: 'O   192.168.2.0/24 [110/2] via 10.1.1.2, 00:01:23, GigabitEthernet0/0',
    options: [
      { key: 'A', text: 'An OSPF external route redistributed from another protocol' },
      { key: 'B', text: 'A directly connected route on a local interface' },
      { key: 'C', text: 'An OSPF-learned route from a neighbor router' },
      { key: 'D', text: 'A manually configured static route' },
    ],
    correctAnswer: 'C',
    hints: [
      'IOS uses single-letter codes to identify route sources in the routing table',
      'O = OSPF, C = Connected, S = Static, R = RIP',
      'The [110/2] shows administrative distance/metric',
    ],
    explanation: '"O" indicates an OSPF-learned route. The format [110/2] shows administrative distance (110 = OSPF default) and cost (2). The route was learned via OSPF from the neighbor at 10.1.1.2.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'Which algorithm does OSPF use to calculate the shortest path to each destination?',
    options: [
      { key: 'A', text: 'Bellman-Ford algorithm — used by distance-vector protocols' },
      { key: 'B', text: 'Dijkstra\'s Shortest Path First (SPF) algorithm' },
      { key: 'C', text: 'Flooding — sends all routes to all neighbors' },
      { key: 'D', text: 'Round-robin — distributes traffic across all equal paths' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF uses a specific shortest-path algorithm invented by Edsger Dijkstra',
      'SPF = Shortest Path First',
      'This algorithm runs on the LSDB to build the routing tree',
    ],
    explanation: 'OSPF uses Dijkstra\'s Shortest Path First (SPF) algorithm. Each router runs SPF on its Link-State Database (LSDB) to build a tree of shortest paths to all destinations in the OSPF area.',
  },

  {
    id: 5, type: 'conceptual',
    prompt: 'What is the primary purpose of OSPF Hello packets?',
    options: [
      { key: 'A', text: 'Encrypt routing updates before sending them to neighbors' },
      { key: 'B', text: 'Discover OSPF neighbors and maintain adjacency relationships' },
      { key: 'C', text: 'Calculate the best path using Dijkstra\'s algorithm' },
      { key: 'D', text: 'Assign IP addresses to router interfaces dynamically' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF uses a specific message type to find its neighbors',
      'These packets are sent periodically to confirm neighbors are still reachable',
      'Hello packets: discover → form adjacency → maintain relationship',
    ],
    explanation: 'OSPF Hello packets discover neighbors and maintain adjacency relationships. Routers multicast Hello packets on OSPF-enabled interfaces. Routers that share matching parameters (area, hello/dead intervals, subnet) form a neighbor relationship.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'What must happen before two OSPF routers can exchange full routing information?',
    options: [
      { key: 'A', text: 'Their VLAN configurations must match exactly' },
      { key: 'B', text: 'They must form a neighbor (adjacency) relationship first' },
      { key: 'C', text: 'A static route must already exist between them' },
      { key: 'D', text: 'DNS must be configured on both routers' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF has a structured process before routers share topology data',
      'Discovery comes first — neighbors must be established',
      'Only after adjacency is formed do routers exchange LSAs',
    ],
    explanation: 'OSPF routers must form a neighbor relationship (adjacency) before exchanging Link-State Advertisements (LSAs). The adjacency process verifies matching parameters — area ID, authentication, and hello/dead timers must match.',
  },

  {
    id: 7, type: 'topology-reasoning',
    prompt: 'Examine this OSPF neighbor output. What does the FULL state indicate?',
    terminalOutput:
      'Neighbor ID     Pri   State           Dead Time   Address         Interface\n' +
      '2.2.2.2           1   FULL/DR         00:00:33    10.1.1.2        Gi0/0',
    options: [
      { key: 'A', text: 'The router is still in the process of forming the adjacency' },
      { key: 'B', text: 'The neighbor adjacency is fully established — LSDBs are synchronized' },
      { key: 'C', text: 'The router has been elected as the Designated Router' },
      { key: 'D', text: 'The OSPF connection has failed and is retrying' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF adjacency has multiple states: Down → Init → 2-Way → ExStart → Exchange → Loading → Full',
      'FULL is the final healthy state',
      'FULL means both routers have synchronized their Link-State Databases',
    ],
    explanation: 'FULL state means the OSPF adjacency is fully established — both routers have synchronized their Link-State Databases (LSDBs). Routes learned through this neighbor will now appear in the routing table.',
  },

  {
    id: 8, type: 'troubleshooting',
    prompt: 'Two routers are directly connected but cannot form an OSPF adjacency. What is the most common cause?',
    options: [
      { key: 'A', text: 'The routers have different hostnames configured' },
      { key: 'B', text: 'One router has a higher MAC address than the other' },
      { key: 'C', text: 'Mismatched OSPF parameters such as area number or hello/dead intervals' },
      { key: 'D', text: 'The routers are using different switch chassis models' },
    ],
    correctAnswer: 'C',
    hints: [
      'OSPF routers check Hello packets for matching parameters before forming adjacency',
      'If parameters do not match, the routers stay in Init state and never progress',
      'Check: same area ID, same hello/dead timers, same subnet, matching authentication',
    ],
    explanation: 'OSPF adjacency requires matching parameters: same area ID, matching hello and dead intervals, same subnet, and matching authentication. Mismatched parameters prevent adjacency formation — routers stay stuck in Init or 2-Way state.',
  },

  {
    id: 9, type: 'cli-input',
    prompt: 'Enter the command to view OSPF neighbor relationships and adjacency states on a router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip ospf neighbor',
    acceptedAnswers: ['show ip ospf neighbor', 'sh ip ospf neighbor', 'show ip ospf nei'],
    hints: [
      'This command shows all OSPF neighbors and their current state',
      'Look for FULL state — that means healthy adjacency',
      'Command format: show ip ospf neighbor',
    ],
    explanation: 'show ip ospf neighbor displays all OSPF neighbors, their state (ideally FULL), DR/BDR role, dead timer, neighbor IP address, and the interface the neighbor is reachable through.',
  },

  {
    id: 10, type: 'conceptual',
    prompt: 'What metric does OSPF use to determine the best path to a destination?',
    options: [
      { key: 'A', text: 'Hop count — the number of routers between source and destination' },
      { key: 'B', text: 'Bandwidth — the raw link speed in megabits per second' },
      { key: 'C', text: 'Cost — a value derived from reference bandwidth divided by interface bandwidth' },
      { key: 'D', text: 'Delay — the total propagation delay across all links in the path' },
    ],
    correctAnswer: 'C',
    hints: [
      'OSPF does not use hop count like RIP',
      'Cost = Reference Bandwidth / Interface Bandwidth',
      'Lower cost = better path — OSPF prefers the lowest total cost',
    ],
    explanation: 'OSPF uses cost as its metric. Cost = Reference Bandwidth (default 100 Mbps) / Interface Bandwidth. A FastEthernet interface has a cost of 1, and a 10 Mbps link has a cost of 10. Lower total cost = better path.',
  },

  {
    id: 11, type: 'topology-reasoning',
    prompt: 'A router has two paths to reach 192.168.5.0/24. Path A has a total OSPF cost of 20. Path B has a total cost of 10. Which path does OSPF install in the routing table?',
    options: [
      { key: 'A', text: 'Path A — cost 20 (higher cost preferred)' },
      { key: 'B', text: 'Path B — cost 10 (lowest cost wins)' },
      { key: 'C', text: 'Both paths — OSPF always load-balances across all paths' },
      { key: 'D', text: 'Neither — OSPF requires equal cost paths to make a routing decision' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF always selects the path with the lowest total cost',
      'Lower cost = better path in OSPF',
      'Cost 10 < Cost 20 — Path B wins',
    ],
    explanation: 'OSPF always selects the path with the lowest cumulative cost. Path B with cost 10 wins over Path A with cost 20. OSPF can load-balance across equal-cost paths (ECMP), but with different costs it uses only the lowest.',
  },

  {
    id: 12, type: 'multiple-choice',
    prompt: 'Examine this routing table entry. What does the value 15 represent?',
    terminalOutput: 'O   192.168.5.0/24 [110/15] via 10.2.2.1, 00:04:12, GigabitEthernet0/1',
    options: [
      { key: 'A', text: 'The OSPF process ID configured on this router' },
      { key: 'B', text: 'The administrative distance of the OSPF protocol (110)' },
      { key: 'C', text: 'The total OSPF cost (metric) to reach this destination' },
      { key: 'D', text: 'The number of OSPF neighbors that advertised this route' },
    ],
    correctAnswer: 'C',
    hints: [
      'The format [AD/metric] means [administrative distance / metric]',
      '110 is the administrative distance — 15 is the metric',
      'OSPF metric = cost — lower is better',
    ],
    explanation: 'In [110/15], 110 is the administrative distance for OSPF and 15 is the OSPF cost (metric) — the total cumulative cost to reach 192.168.5.0/24. Lower cost paths are preferred over higher cost paths.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'A router has two paths to a destination but consistently chooses the slower physical link. What is the most likely reason?',
    options: [
      { key: 'A', text: 'The router is using RIP instead of OSPF for that specific path' },
      { key: 'B', text: 'The OSPF cost has not been tuned to reflect the actual link bandwidth' },
      { key: 'C', text: 'The routing table is corrupted and must be cleared with a reboot' },
      { key: 'D', text: 'OSPF only selects paths based on hop count, not bandwidth' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF calculates cost from the interface bandwidth — but the default reference bandwidth is 100 Mbps',
      'On links faster than 100 Mbps (GigE, 10GE), cost defaults to 1 for all — they look equal',
      'Manual cost adjustment is needed to differentiate high-speed links',
    ],
    explanation: 'OSPF default reference bandwidth is 100 Mbps, so GigE (1000 Mbps) and FastEthernet (100 Mbps) both calculate to a cost of 1. Without adjusting the auto-cost reference-bandwidth, OSPF cannot differentiate high-speed links.',
  },

  {
    id: 14, type: 'cli-input',
    prompt: 'Enter the command to view the IP routing table and confirm OSPF routes are being learned.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip route',
    acceptedAnswers: ['show ip route', 'sh ip route', 'sh ip ro'],
    hints: [
      'This is a fundamental routing verification command',
      'OSPF routes appear with the O prefix code',
      'Command format: show ip route',
    ],
    explanation: 'show ip route displays the full routing table including directly connected (C), OSPF-learned (O), static (S), and other routes. OSPF routes show [110/cost] for administrative distance and metric.',
  },

  {
    id: 15, type: 'conceptual',
    prompt: 'What database does OSPF use to store the complete network topology learned from all LSAs?',
    options: [
      { key: 'A', text: 'The routing table — stores the best paths to all destinations' },
      { key: 'B', text: 'The ARP table — stores IP-to-MAC address mappings' },
      { key: 'C', text: 'The Link-State Database (LSDB) — contains the full network topology map' },
      { key: 'D', text: 'The CAM table — stores MAC address to switch port mappings' },
    ],
    correctAnswer: 'C',
    hints: [
      'OSPF collects Link-State Advertisements (LSAs) from all routers',
      'These LSAs are stored in a specific database',
      'Dijkstra\'s SPF algorithm runs against this database to build routing paths',
    ],
    explanation: 'OSPF stores the complete network topology in the Link-State Database (LSDB). All routers in an OSPF area maintain identical LSDBs. The SPF algorithm runs against the LSDB to calculate the shortest paths and populate the routing table.',
  },
]

export const LAB12_COMPLETION = {
  conceptMastered: 'OSPF Fundamentals',
  summary:
    'You successfully analyzed OSPF behavior, neighbor relationships, and route selection in a dynamic routing environment.',
  masteredPoints: [
    'OSPF as a link-state protocol using the SPF algorithm',
    'Dynamic routing advantages over static routing',
    'OSPF Hello packets discovering and maintaining neighbors',
    'OSPF adjacency states — FULL = healthy neighbor',
    'Reading OSPF routes (O prefix) in the routing table',
    'OSPF cost metric and how it determines best path',
    'Troubleshooting adjacency failures from mismatched parameters',
    'Manual cost tuning for high-speed link differentiation',
  ],
  reviewIfNeeded: [
    { id: '58', title: 'OSPF Fundamentals' },
    { id: '59', title: 'OSPF Neighbors and Adjacencies' },
    { id: '60', title: 'OSPF Cost and Best Path Selection' },
  ],
  nextLab: {
    id: 'lab13',
    title: 'Lab 13 – IPv6 Addressing and Neighbor Discovery',
  },
}
