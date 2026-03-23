
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
  6:  ['PC A'],
  7:  ['PC A', 'Router'],
  10: ['PC A'],
  11: ['PC A', 'Router'],
  12: ['PC A', 'Router'],
  14: ['Router'],
  15: ['Router'],
}

export const LAB13_META = {
  id: 'lab13',
  title: 'IPv6 Addressing and Neighbor Discovery',
  difficulty: 'Intermediate' as const,
  estimatedTime: '35–45 min',
  skillsTested: [
    'Understand IPv6 structure and format',
    'Identify IPv6 address types',
    'Apply IPv6 shortening rules',
    'Understand link-local vs global addresses',
    'Analyze multicast behavior in IPv6',
    'Understand SLAAC automatic configuration',
    'Identify Neighbor Discovery Protocol functions',
    'Troubleshoot IPv6 communication concepts',
  ],
  lessonsReinforced: [
    { id: '61', title: 'IPv6 Addressing Basics' },
    { id: '62', title: 'IPv6 Address Types' },
    { id: '63', title: 'SLAAC and Neighbor Discovery' },
  ],
}

export const LAB13_SCENARIO = {
  context: 'A company is transitioning from IPv4 to IPv6 across their network.',
  reports: [
    'Engineers are confused by IPv6 formatting and shortening rules',
    'Devices are not communicating properly after the migration',
    'Difficulty identifying correct IPv6 address types',
    'Automatic address configuration (SLAAC) is not functioning as expected',
  ],
  challenge: 'Analyze IPv6 addresses, identify address types, understand automatic configuration, and troubleshoot IPv6 communication behavior.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'How many bits are in an IPv6 address?',
    options: [
      { key: 'A', text: '32 bits — same as IPv4' },
      { key: 'B', text: '64 bits — double IPv4' },
      { key: 'C', text: '128 bits — four times IPv4' },
      { key: 'D', text: '256 bits — eight times IPv4' },
    ],
    correctAnswer: 'C',
    hints: [
      'IPv6 was designed to solve IPv4 address exhaustion — much larger',
      'IPv4 = 32 bits, IPv6 = 4× that',
      '128 bits allows for approximately 3.4 × 10^38 unique addresses',
    ],
    explanation: 'IPv6 uses 128-bit addresses compared to IPv4\'s 32 bits. This provides approximately 3.4 × 10^38 possible addresses — enough to assign billions of addresses to every person on Earth.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'What numbering system does IPv6 use to represent addresses?',
    options: [
      { key: 'A', text: 'Decimal (0–9) — same as IPv4 dotted-decimal notation' },
      { key: 'B', text: 'Binary (0 and 1) — raw bit representation' },
      { key: 'C', text: 'Hexadecimal (0–9, A–F) — groups of 16 bits separated by colons' },
      { key: 'D', text: 'Octal (0–7) — base-8 number system' },
    ],
    correctAnswer: 'C',
    hints: [
      'IPv6 addresses contain letters like A, B, C, D, E, F',
      'Eight groups of four hex digits, separated by colons',
      'Example: 2001:0DB8:0000:0000:0000:FF00:0042:8329',
    ],
    explanation: 'IPv6 uses hexadecimal notation. An IPv6 address consists of 8 groups of 4 hexadecimal digits separated by colons. Hexadecimal uses digits 0–9 and letters A–F to represent values 0–15.',
  },

  {
    id: 3, type: 'conceptual',
    prompt: 'Why was IPv6 created to replace IPv4?',
    options: [
      { key: 'A', text: 'IPv6 addresses use less bandwidth than IPv4 addresses in transit' },
      { key: 'B', text: 'IPv4 ran out of available addresses — IPv6 provides a vastly larger address space' },
      { key: 'C', text: 'IPv4 had no security features — IPv6 adds mandatory encryption' },
      { key: 'D', text: 'IPv6 routing is significantly faster because it uses hexadecimal' },
    ],
    correctAnswer: 'B',
    hints: [
      'The internet ran out of IPv4 addresses (32-bit = ~4.3 billion total)',
      'With mobile devices, IoT, and global growth, 4.3 billion was not enough',
      'IPv6\'s 128-bit space provides effectively unlimited addresses',
    ],
    explanation: 'IPv4\'s 32-bit address space allows only ~4.3 billion unique addresses, which was exhausted as the internet grew. IPv6\'s 128-bit address space provides 3.4 × 10^38 addresses — more than enough for all current and future devices.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'Which is the correctly shortened version of this IPv6 address?\n2001:0DB8:0000:0000:0000:FF00:0042:8329',
    options: [
      { key: 'A', text: '2001:DB8:0:0:0:FF00:42:8329' },
      { key: 'B', text: '2001:DB8::FF00:42:8329' },
      { key: 'C', text: '2001:0DB8::FF:42:8329' },
      { key: 'D', text: '2001::FF00:0042:8329' },
    ],
    correctAnswer: 'B',
    hints: [
      'Rule 1: Remove leading zeros within each group (0042 → 42, 0DB8 → DB8)',
      'Rule 2: Use :: to replace the longest consecutive run of all-zero groups',
      'The three consecutive 0000 groups become :: — but :: can only appear once',
    ],
    explanation: '2001:0DB8:0000:0000:0000:FF00:0042:8329 shortens to 2001:DB8::FF00:42:8329. Leading zeros are dropped in each group (0DB8→DB8, 0042→42) and the three consecutive all-zero groups become :: (used only once).',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'Which of these is a valid IPv6 address?',
    options: [
      { key: 'A', text: '192.168.1.1 — standard dotted-decimal format' },
      { key: 'B', text: '2001:DB8::1 — compressed hexadecimal format' },
      { key: 'C', text: '255.255.255.0 — subnet mask notation' },
      { key: 'D', text: '10.0.0.1 — private IPv4 address' },
    ],
    correctAnswer: 'B',
    hints: [
      'IPv6 addresses use colons, not dots',
      'IPv6 uses hexadecimal notation — can include A–F',
      '2001:DB8::/32 is the documentation/example range for IPv6',
    ],
    explanation: '2001:DB8::1 is a valid IPv6 address — it uses hexadecimal notation with colons and the :: shorthand for consecutive zero groups. The other options are IPv4 addresses or subnet masks.',
  },

  {
    id: 6, type: 'topology-reasoning',
    prompt: 'Looking at the topology, PC A has address 2001:DB8:1:1::10. Which IPv6 address type is this?',
    options: [
      { key: 'A', text: 'Link-local — only reachable on the local segment' },
      { key: 'B', text: 'Multicast — sends to a group of nodes' },
      { key: 'C', text: 'Global unicast — globally routable on the internet' },
      { key: 'D', text: 'Loopback — only reachable by the local device' },
    ],
    correctAnswer: 'C',
    hints: [
      'Global unicast addresses start with 2000::/3',
      '2001:DB8:: is in the 2000::/3 range',
      'These addresses are internet-routable',
    ],
    explanation: 'Addresses starting with 2001:DB8: are global unicast addresses (in the 2000::/3 range). Global unicast addresses are globally routable on the internet — similar to public IPv4 addresses.',
  },

  {
    id: 7, type: 'topology-reasoning',
    prompt: 'PC A also has address FE80::10. Looking at the topology, which prefix identifies this as a link-local address?',
    options: [
      { key: 'A', text: '2000::/3 — global unicast prefix' },
      { key: 'B', text: 'FE80::/10 — link-local prefix' },
      { key: 'C', text: 'FF00::/8 — multicast prefix' },
      { key: 'D', text: 'FD00::/8 — unique local prefix' },
    ],
    correctAnswer: 'B',
    hints: [
      'Link-local addresses always start with FE80',
      'FE80::/10 is reserved for link-local addresses',
      'They are not routable beyond the local segment',
    ],
    explanation: 'FE80::/10 identifies link-local addresses. All link-local addresses begin with FE80 and are automatically generated on every IPv6-enabled interface. They are not routable — only usable on the local network segment.',
  },

  {
    id: 8, type: 'conceptual',
    prompt: 'Does IPv6 use broadcast addresses?',
    options: [
      { key: 'A', text: 'Yes — IPv6 uses broadcast exactly the same way as IPv4' },
      { key: 'B', text: 'Yes — but only for ARP requests to find MAC addresses' },
      { key: 'C', text: 'No — IPv6 replaced broadcast with more efficient multicast and anycast' },
      { key: 'D', text: 'No — IPv6 uses anycast for all one-to-many communications' },
    ],
    correctAnswer: 'C',
    hints: [
      'Broadcast is inefficient — it forces every device to process the frame',
      'IPv6 designers removed broadcast entirely',
      'Multicast delivers packets only to interested subscribers',
    ],
    explanation: 'IPv6 has no broadcast. It was replaced with multicast — frames are only processed by devices that have joined a specific multicast group. This reduces unnecessary processing on uninvolved devices and improves network efficiency.',
  },

  {
    id: 9, type: 'multiple-choice',
    prompt: 'What does the IPv6 multicast address FF02::1 represent?',
    options: [
      { key: 'A', text: 'One specific host on the local segment' },
      { key: 'B', text: 'All IPv6 nodes on the local link segment' },
      { key: 'C', text: 'All IPv6 routers only — end hosts are excluded' },
      { key: 'D', text: 'The nearest DNS server' },
    ],
    correctAnswer: 'B',
    hints: [
      'FF02:: addresses are link-local multicast — only on the local segment',
      '::1 in the multicast group typically refers to "all"',
      'FF02::2 = all routers, FF02::1 = all nodes',
    ],
    explanation: 'FF02::1 is the all-nodes multicast address for the local link segment. Any frame sent to FF02::1 is received and processed by all IPv6-enabled nodes on that segment — it is IPv6\'s replacement for broadcast.',
  },

  {
    id: 10, type: 'conceptual',
    prompt: 'What is the very first IPv6 address that an interface automatically creates before it has a global address?',
    options: [
      { key: 'A', text: 'A global unicast address assigned by the upstream ISP' },
      { key: 'B', text: 'The loopback address (::1) for local device testing only' },
      { key: 'C', text: 'A link-local address (FE80::/10) — always automatically generated first' },
      { key: 'D', text: 'A multicast address to join the all-nodes group' },
    ],
    correctAnswer: 'C',
    hints: [
      'Devices create this address automatically without any configuration',
      'It starts with FE80 — derived from the interface MAC address',
      'This address is needed before a device can discover routers',
    ],
    explanation: 'The link-local address (FE80::/10) is always the first IPv6 address generated. Every IPv6-enabled interface automatically derives a link-local address from its MAC address using EUI-64. It is needed for neighbor discovery before any global address is obtained.',
  },

  {
    id: 11, type: 'topology-reasoning',
    prompt: 'PC A wants to find the router on the local segment. What type of message does PC A send?',
    options: [
      { key: 'A', text: 'RA (Router Advertisement) — proactively sent by routers' },
      { key: 'B', text: 'RS (Router Solicitation) — sent by hosts to find routers' },
      { key: 'C', text: 'ARP Request — asks who has the router\'s IP address' },
      { key: 'D', text: 'DNS Query — resolves the router\'s hostname to an IP' },
    ],
    correctAnswer: 'B',
    hints: [
      'Hosts send a specific message type to ask: "Are there any routers here?"',
      'RS = Router Solicitation — from host to all routers (FF02::2)',
      'The router responds with an RA',
    ],
    explanation: 'PC A sends a Router Solicitation (RS) to the all-routers multicast address (FF02::2). This asks "Are there any routers on this segment?" and triggers a Router Advertisement (RA) response from the router.',
  },

  {
    id: 12, type: 'topology-reasoning',
    prompt: 'The Router receives the RS from PC A. What message does it send back?',
    options: [
      { key: 'A', text: 'RS (Router Solicitation) — requesting the host\'s address' },
      { key: 'B', text: 'RA (Router Advertisement) — provides prefix and configuration info' },
      { key: 'C', text: 'ARP Reply — providing the router\'s MAC address' },
      { key: 'D', text: 'ICMP Echo Reply — confirming the router is reachable' },
    ],
    correctAnswer: 'B',
    hints: [
      'The router responds to RS messages with a specific advertisement',
      'RA = Router Advertisement — contains the network prefix',
      'Hosts use the RA prefix to build their own global unicast address (SLAAC)',
    ],
    explanation: 'The router responds with a Router Advertisement (RA) containing the network prefix (e.g., 2001:DB8:1:1::/64), default gateway information, and flags. Hosts use this RA to automatically configure their global unicast address via SLAAC.',
  },

  {
    id: 13, type: 'conceptual',
    prompt: 'What IPv6 protocol replaces ARP (Address Resolution Protocol) used in IPv4?',
    options: [
      { key: 'A', text: 'DHCP — Dynamic Host Configuration Protocol' },
      { key: 'B', text: 'ICMP — Internet Control Message Protocol (ping)' },
      { key: 'C', text: 'Neighbor Discovery Protocol (NDP) — uses ICMPv6 messages' },
      { key: 'D', text: 'DNS — Domain Name System for name resolution' },
    ],
    correctAnswer: 'C',
    hints: [
      'IPv4 uses ARP to find MAC addresses from IP addresses',
      'IPv6 replaced ARP entirely with a newer protocol',
      'NDP uses ICMPv6 Neighbor Solicitation and Neighbor Advertisement messages',
    ],
    explanation: 'Neighbor Discovery Protocol (NDP) replaces ARP in IPv6. NDP uses ICMPv6 messages — Neighbor Solicitation (NS) to find a neighbor\'s MAC address, and Neighbor Advertisement (NA) as the response. NDP also handles router discovery and SLAAC.',
  },

  {
    id: 14, type: 'cli-input',
    prompt: 'Enter the command to view all IPv6 addresses configured on router interfaces.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ipv6 interface brief',
    acceptedAnswers: ['show ipv6 interface brief', 'sh ipv6 int br', 'show ipv6 int brief'],
    hints: [
      'This is the IPv6 equivalent of show ip interface brief',
      'It shows link-local and global unicast addresses per interface',
      'Command: show ipv6 interface brief',
    ],
    explanation: 'show ipv6 interface brief displays all IPv6-enabled interfaces with their link-local and global unicast addresses, along with interface status. Essential for verifying IPv6 configuration.',
  },

  {
    id: 15, type: 'cli-input',
    prompt: 'Enter the command to view the IPv6 neighbor table (NDP cache) — the IPv6 equivalent of the ARP table.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ipv6 neighbors',
    acceptedAnswers: ['show ipv6 neighbors', 'sh ipv6 neighbors', 'show ipv6 neighbor'],
    hints: [
      'This is the IPv6 replacement for show ip arp',
      'It shows IPv6 addresses mapped to MAC addresses',
      'Command: show ipv6 neighbors',
    ],
    explanation: 'show ipv6 neighbors displays the NDP neighbor table — the IPv6 equivalent of the ARP table. It shows the IPv6 address to MAC address mappings learned through Neighbor Solicitation/Advertisement exchanges.',
  },
]

export const LAB13_COMPLETION = {
  conceptMastered: 'IPv6 Addressing and Neighbor Discovery',
  summary:
    'You successfully analyzed IPv6 addressing, identified address types, and understood automatic configuration through SLAAC and Neighbor Discovery.',
  masteredPoints: [
    'IPv6 uses 128-bit hexadecimal addresses',
    'IPv6 address shortening rules (remove leading zeros, use ::)',
    'Global unicast (2000::/3) vs link-local (FE80::/10) addresses',
    'IPv6 replaced broadcast with multicast (FF02::1 = all nodes)',
    'SLAAC uses Router Solicitation and Router Advertisement',
    'Neighbor Discovery Protocol (NDP) replaces ARP',
    'Link-local address automatically generated first on every interface',
    'CLI verification: show ipv6 interface brief, show ipv6 neighbors',
  ],
  reviewIfNeeded: [
    { id: '61', title: 'IPv6 Addressing Basics' },
    { id: '62', title: 'IPv6 Address Types' },
    { id: '63', title: 'SLAAC and Neighbor Discovery' },
  ],
  nextLab: {
    id: 'lab14',
    title: 'Lab 14 – DHCP, DNS, and NAT',
  },
}
