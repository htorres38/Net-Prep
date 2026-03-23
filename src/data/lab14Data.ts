
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
  3:  ['PC1', 'Router'],
  4:  ['PC1', 'Router'],
  10: ['PC1', 'Router'],
  11: ['PC1'],
  13: ['Router'],
}

export const LAB14_META = {
  id: 'lab14',
  title: 'DHCP, DNS, and NAT',
  difficulty: 'Intermediate' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Understand DHCP automatic addressing',
    'Identify the DHCP DORA process',
    'Analyze DNS name resolution behavior',
    'Identify DNS record types',
    'Understand NAT translation concepts',
    'Interpret NAT table output',
    'Troubleshoot IP service failures',
  ],
  lessonsReinforced: [
    { id: '64', title: 'DHCP Fundamentals' },
    { id: '65', title: 'DNS Fundamentals' },
    { id: '66', title: 'NAT Fundamentals' },
  ],
}

export const LAB14_SCENARIO = {
  context: 'A small office network is experiencing multiple IP service failures simultaneously.',
  reports: [
    'PCs are not receiving IP addresses automatically',
    'Users cannot access websites using domain names like google.com',
    'Internal devices can talk to each other but cannot reach the internet',
  ],
  challenge: 'Analyze DHCP, DNS, and NAT services to identify what is failing and understand how each service works.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What does DHCP stand for?',
    options: [
      { key: 'A', text: 'Dynamic Configuration Host Protocol' },
      { key: 'B', text: 'Dynamic Host Configuration Protocol' },
      { key: 'C', text: 'Distributed Host Communication Protocol' },
      { key: 'D', text: 'Data Host Control Protocol' },
    ],
    correctAnswer: 'B',
    hints: [
      'DHCP automatically assigns IP addresses to devices',
      'Think: Dynamic Host Configuration',
      'DHCP removes the need for manual IP address configuration',
    ],
    explanation: 'DHCP stands for Dynamic Host Configuration Protocol. It automatically assigns IP addresses, subnet masks, default gateways, and DNS servers to network devices, eliminating manual IP configuration.',
  },

  {
    id: 2, type: 'conceptual',
    prompt: 'What is the main purpose of DHCP in a network?',
    options: [
      { key: 'A', text: 'Encrypt network traffic between devices' },
      { key: 'B', text: 'Translate private IP addresses into public addresses' },
      { key: 'C', text: 'Automatically assign IP addresses and network settings to devices' },
      { key: 'D', text: 'Resolve domain names to IP addresses' },
    ],
    correctAnswer: 'C',
    hints: [
      'Without DHCP, every device would need a manual IP address configuration',
      'DHCP simplifies administration especially in large networks',
      'A DHCP server assigns: IP address, subnet mask, gateway, DNS',
    ],
    explanation: 'DHCP automatically assigns IP addresses, subnet masks, default gateways, and DNS server information to network clients. This eliminates manual configuration and prevents IP address conflicts.',
  },

  {
    id: 3, type: 'sequencing',
    prompt: 'Place the four DHCP steps (DORA) in the correct order:',
    shuffledItems: ['Request', 'Discover', 'Acknowledge', 'Offer'],
    correctOrder: ['Discover', 'Offer', 'Request', 'Acknowledge'],
    hints: [
      'The client always initiates the process by searching for a server',
      'DORA is a useful acronym — what word does it spell?',
      'Discover → Offer → Request → Acknowledge',
    ],
    explanation: 'DHCP follows the DORA process: 1. Discover — client broadcasts to find a server. 2. Offer — server offers an IP. 3. Request — client formally requests the offered IP. 4. Acknowledge — server confirms the assignment.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'A device sends a broadcast asking for an IP address. Which DHCP message is this?',
    options: [
      { key: 'A', text: 'DHCP Offer — the server responding with an address' },
      { key: 'B', text: 'DHCP Request — the client formally requesting the offered address' },
      { key: 'C', text: 'DHCP Discover — the client\'s initial broadcast to find a server' },
      { key: 'D', text: 'DHCP Acknowledge — the server confirming the assignment' },
    ],
    correctAnswer: 'C',
    hints: [
      'This is the very first message in the DORA process',
      'The client has no IP yet, so it broadcasts to find a DHCP server',
      'Discover = D in DORA',
    ],
    explanation: 'DHCP Discover is the first message. The client (with no IP address yet) broadcasts to 255.255.255.255 to find any available DHCP server. This starts the DORA exchange.',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'What does DNS do in a network?',
    options: [
      { key: 'A', text: 'Assigns IP addresses automatically to devices' },
      { key: 'B', text: 'Translates domain names into IP addresses' },
      { key: 'C', text: 'Encrypts traffic between clients and servers' },
      { key: 'D', text: 'Routes packets between different networks' },
    ],
    correctAnswer: 'B',
    hints: [
      'DNS is often called the "phonebook of the internet"',
      'Humans remember names, computers route to IP addresses',
      'DNS translates google.com into something like 142.250.190.14',
    ],
    explanation: 'DNS (Domain Name System) translates human-readable domain names (like google.com) into IP addresses (like 142.250.190.14) that routers use to deliver packets to the correct destination.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'Which DNS record type maps a hostname to an IPv4 address?',
    options: [
      { key: 'A', text: 'AAAA — maps a hostname to an IPv6 address' },
      { key: 'B', text: 'A — maps a hostname to an IPv4 address' },
      { key: 'C', text: 'CNAME — creates an alias to another hostname' },
      { key: 'D', text: 'PTR — maps an IP address to a hostname (reverse lookup)' },
    ],
    correctAnswer: 'B',
    hints: [
      'A = Address record (IPv4)',
      'AAAA = IPv6 address record (four times an A)',
      'The A record is the most common DNS record type',
    ],
    explanation: 'The DNS A record maps a hostname to an IPv4 address (e.g., www.example.com → 93.184.216.34). AAAA records map to IPv6 addresses. CNAME creates aliases, and PTR records enable reverse DNS lookups.',
  },

  {
    id: 7, type: 'conceptual',
    prompt: 'Why is DNS necessary in a modern network?',
    options: [
      { key: 'A', text: 'To encrypt website addresses before they are transmitted over the network' },
      { key: 'B', text: 'To automatically assign IP addresses to servers when they start up' },
      { key: 'C', text: 'To allow users to use memorable domain names instead of numeric IP addresses' },
      { key: 'D', text: 'To route packets between different networks using IP addresses' },
    ],
    correctAnswer: 'C',
    hints: [
      'People can remember "google.com" much easier than "142.250.190.14"',
      'IP addresses change — domain names stay consistent',
      'Without DNS, users would need to type IP addresses into browsers',
    ],
    explanation: 'DNS is necessary because humans easily remember domain names but computers route using IP addresses. DNS bridges this gap — users type "google.com" and DNS resolves it to the correct IP address automatically.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'What does NAT stand for?',
    options: [
      { key: 'A', text: 'Network Address Table' },
      { key: 'B', text: 'Network Address Translation' },
      { key: 'C', text: 'Network Access Translation' },
      { key: 'D', text: 'Network Allocation Technology' },
    ],
    correctAnswer: 'B',
    hints: [
      'NAT translates between private and public IP addresses',
      'It is performed by the router at the edge of the network',
      'Network Address Translation',
    ],
    explanation: 'NAT stands for Network Address Translation. It is typically performed by the edge router and translates private IP addresses (like 192.168.1.x) to a public IP address before packets leave the network.',
  },

  {
    id: 9, type: 'conceptual',
    prompt: 'Why is NAT used in most home and business networks?',
    options: [
      { key: 'A', text: 'To improve wireless signal strength across the building' },
      { key: 'B', text: 'To prevent DNS cache poisoning and spoofing attacks' },
      { key: 'C', text: 'To allow multiple private IP address devices to share a single public IP and access the internet' },
      { key: 'D', text: 'To encrypt all outbound network traffic through VPN tunnels' },
    ],
    correctAnswer: 'C',
    hints: [
      'Private IP addresses (192.168.x.x, 10.x.x.x) cannot be routed on the internet',
      'NAT translates private IPs → public IP at the router',
      'One public IP can be shared by hundreds of internal devices using PAT',
    ],
    explanation: 'Private IP addresses are not internet-routable. NAT (specifically PAT — Port Address Translation) allows multiple internal devices to share a single public IP address by tracking connections using port numbers.',
  },

  {
    id: 10, type: 'topology-reasoning',
    prompt: 'Analyze this NAT translation table. What is the inside local address?',
    terminalOutput:
      'Router# show ip nat translations\n\n' +
      'Pro  Inside global    Inside local      Outside global\n' +
      'tcp  203.0.113.5     192.168.1.10      142.250.190.14',
    options: [
      { key: 'A', text: '203.0.113.5 — the inside global (public) address' },
      { key: 'B', text: '192.168.1.10 — the inside local (private) address' },
      { key: 'C', text: '142.250.190.14 — the outside global (destination) address' },
      { key: 'D', text: 'None — the table does not show inside local addresses' },
    ],
    correctAnswer: 'B',
    hints: [
      'Inside local = the private IP address of the internal device',
      'Inside global = the public IP address (after NAT)',
      '192.168.x.x is a private address range',
    ],
    explanation: '192.168.1.10 is the inside local address — the private IP of the internal PC. 203.0.113.5 is the inside global — the public IP assigned after NAT translation. 142.250.190.14 is the external destination.',
  },

  {
    id: 11, type: 'troubleshooting',
    prompt: 'A PC receives an IP address of 169.254.1.10. What is the issue?',
    options: [
      { key: 'A', text: 'DNS resolution has failed — the PC cannot reach the DNS server' },
      { key: 'B', text: 'NAT has failed — the router is not translating addresses' },
      { key: 'C', text: 'DHCP has failed — the PC self-assigned an APIPA address' },
      { key: 'D', text: 'Routing has failed — default route is missing' },
    ],
    correctAnswer: 'C',
    hints: [
      '169.254.x.x is the APIPA range — Automatic Private IP Addressing',
      'Windows assigns an APIPA address when DHCP fails',
      'APIPA = no DHCP response was received',
    ],
    explanation: '169.254.x.x is an APIPA (Automatic Private IP Addressing) address. Windows automatically assigns this when DHCP fails — the PC sent a DHCP Discover but received no Offer response. This confirms a DHCP problem.',
  },

  {
    id: 12, type: 'troubleshooting',
    prompt: 'Users can ping 8.8.8.8 successfully but cannot open google.com in a browser. What is the issue?',
    options: [
      { key: 'A', text: 'DHCP failure — PCs do not have valid IP addresses' },
      { key: 'B', text: 'DNS failure — domain names are not being resolved to IP addresses' },
      { key: 'C', text: 'NAT failure — the router is not translating private addresses' },
      { key: 'D', text: 'VLAN misconfiguration — devices are in the wrong network segment' },
    ],
    correctAnswer: 'B',
    hints: [
      'If you can ping the IP but not access the name, what service converts names to IPs?',
      'Successfully pinging 8.8.8.8 proves connectivity and NAT are working',
      'google.com must be resolved to an IP address — which service does that?',
    ],
    explanation: 'Pinging 8.8.8.8 (by IP) succeeds, which confirms IP connectivity and NAT are working. Failing to reach google.com (by name) means DNS is not resolving domain names to IP addresses — the DNS service is broken or unreachable.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'Devices can communicate locally within the office but cannot access the internet. What is the most likely issue?',
    options: [
      { key: 'A', text: 'DNS failure — the DNS server is unreachable' },
      { key: 'B', text: 'DHCP failure — devices did not receive IP addresses' },
      { key: 'C', text: 'NAT failure — private addresses are not being translated to a public IP' },
      { key: 'D', text: 'VLAN misconfiguration — devices are isolated in the wrong segment' },
    ],
    correctAnswer: 'C',
    hints: [
      'Local communication works fine — IP addressing and switching are OK',
      'Private IP addresses (192.168.x.x) cannot be routed on the internet',
      'Something must translate private IPs to a public IP at the border router',
    ],
    explanation: 'Local communication working means DHCP, IP addressing, and switching are fine. Failing to reach the internet means private addresses are not being translated to a public IP. NAT (specifically PAT) on the router is likely misconfigured or missing.',
  },

  {
    id: 14, type: 'cli-input',
    prompt: 'Enter the command to view the DHCP address bindings and see which IPs have been assigned.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip dhcp binding',
    acceptedAnswers: ['show ip dhcp binding', 'sh ip dhcp binding', 'show ip dhcp bindings'],
    hints: [
      'This command shows all active DHCP leases',
      'It lists which IPs were assigned to which MAC addresses',
      'Command: show ip dhcp binding',
    ],
    explanation: 'show ip dhcp binding displays all active DHCP leases — each client\'s IP address, MAC address, lease expiry, and binding type. Useful for confirming which devices received addresses and troubleshooting DHCP issues.',
  },

  {
    id: 15, type: 'cli-input',
    prompt: 'Enter the command to view the active NAT translation table on a router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip nat translations',
    acceptedAnswers: ['show ip nat translations', 'sh ip nat translations', 'show ip nat trans'],
    hints: [
      'This command shows all active NAT translations',
      'It displays inside local, inside global, and outside addresses',
      'Command: show ip nat translations',
    ],
    explanation: 'show ip nat translations displays all active NAT entries — inside local (private IP), inside global (public IP after translation), and outside global (destination IP). Use this to confirm NAT is translating correctly.',
  },
]

export const LAB14_COMPLETION = {
  conceptMastered: 'DHCP, DNS, and NAT',
  summary:
    'You successfully analyzed how devices receive IP addresses, resolve domain names, and communicate with the internet through NAT.',
  masteredPoints: [
    'DHCP DORA process (Discover, Offer, Request, Acknowledge)',
    'Automatic IP address assignment eliminating manual config',
    'DNS translating domain names to IP addresses',
    'DNS A records (IPv4) and AAAA records (IPv6)',
    'NAT translating private IPs to public IPs at the border',
    'Inside local vs inside global vs outside global addresses',
    'APIPA (169.254.x.x) as a DHCP failure indicator',
    'Troubleshooting: ping IP vs ping name to isolate DNS failure',
  ],
  reviewIfNeeded: [
    { id: '64', title: 'DHCP Fundamentals' },
    { id: '65', title: 'DNS Fundamentals' },
    { id: '66', title: 'NAT Fundamentals' },
  ],
  nextLab: {
    id: 'lab15',
    title: 'Lab 15 – Network Management Protocols',
  },
}
