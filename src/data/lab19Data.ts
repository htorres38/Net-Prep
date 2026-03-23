
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
  1:  ['R1', 'R2'],
  2:  ['R1'],
  3:  ['R1', 'R2'],
  4:  ['PC-A', 'PC-B', 'S1'],
  5:  ['S1', 'R1'],
  6:  ['S1'],
  7:  ['PC-A'],
  11: ['R2'],
  12: ['R2'],
  13: ['R1', 'R2'],
  14: ['R1', 'R2'],
  15: ['R2', 'Server'],
}

export const LAB19_META = {
  id: 'lab19',
  title: 'Mixed Network Troubleshooting Challenge',
  difficulty: 'Advanced' as const,
  estimatedTime: '50–60 min',
  skillsTested: [
    'Diagnose Layer 2 and Layer 3 connectivity problems',
    'Interpret routing, VLAN, ARP, and interface output together',
    'Identify subnetting and default gateway issues',
    'Troubleshoot OSPF neighbor and route learning problems',
    'Diagnose DHCP, DNS, and NAT failures',
    'Recognize ACL-related traffic blocking',
    'Apply a structured multi-step troubleshooting process',
  ],
  lessonsReinforced: [
    { id: '4–11', title: 'Switching, ARP, IPv4, Routing, VLANs, OSPF, IP Services, ACLs' },
  ],
}

export const LAB19_SCENARIO = {
  context: 'You are assisting with a branch office network that has several simultaneous problems.',
  reports: [
    'Some PCs can reach local devices but not remote devices',
    'Some VLAN users cannot reach servers in other VLANs',
    'Internet access is failing for some hosts',
    'Name resolution works inconsistently',
    'One application server is unreachable from a specific subnet',
  ],
  challenge: 'Analyze the available information and determine the most likely root cause in each case. This lab simulates a real mixed troubleshooting challenge.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'troubleshooting',
    prompt: 'PC-A can ping 192.168.10.1 (its default gateway) but cannot ping 192.168.30.10 (the remote server).\n\nWhat is the FIRST major area you should check?',
    options: [
      { key: 'A', text: 'Local NIC failure — the network interface card may be faulty' },
      { key: 'B', text: 'Routing between R1 and R2 — the Layer 3 path to the remote network' },
      { key: 'C', text: 'Wireless authentication — the PC may have Wi-Fi connectivity issues' },
      { key: 'D', text: 'Port Security violation — the switch port may be in err-disabled state' },
    ],
    correctAnswer: 'B',
    hints: [
      'The local gateway responds — the NIC and local switch are working',
      'The failure is at the remote network — that means Layer 3 path delivery',
      'If local works but remote fails, check the routing path between routers',
    ],
    explanation: 'If the local gateway responds (192.168.10.1) but a remote host does not (192.168.30.10), the issue is in Layer 3 routing — specifically the path between R1 and R2 to reach the remote server LAN. Local Layer 2 and NIC are confirmed working.',
  },

  {
    id: 2, type: 'topology-reasoning',
    prompt: 'Examine R1\'s routing table. What is the problem preventing PC-A from reaching the server at 192.168.30.10?',
    terminalOutput:
      'R1# show ip route\n\n' +
      'C    192.168.10.0/24 is directly connected, G0/0.10\n' +
      'C    192.168.20.0/24 is directly connected, G0/0.20\n' +
      'C    10.0.12.0/30    is directly connected, G0/1',
    options: [
      { key: 'A', text: 'R1 has too many directly connected routes — it is overloaded' },
      { key: 'B', text: 'R1 has no route to 192.168.30.0/24 — the server network is unreachable' },
      { key: 'C', text: 'R1\'s G0/0 interface is down — the subinterfaces are not active' },
      { key: 'D', text: 'OSPF is advertising the wrong networks to R1' },
    ],
    correctAnswer: 'B',
    hints: [
      'Read the routing table — what network is missing?',
      'The server is at 192.168.30.10 — is 192.168.30.0/24 in the table?',
      'Three directly connected routes exist, but the server network is not listed',
    ],
    explanation: 'R1\'s routing table shows only directly connected networks. There is no route to 192.168.30.0/24 (the server LAN). Without this route, R1 cannot forward traffic from PC-A to the server and will drop packets destined for that network.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Configure a static route on R1 to reach the server network (192.168.30.0/24) through R2 (next hop: 10.0.12.2).',
    terminalPrompt: 'R1(config)#',
    expectedAnswer: 'ip route 192.168.30.0 255.255.255.0 10.0.12.2',
    acceptedAnswers: ['ip route 192.168.30.0 255.255.255.0 10.0.12.2'],
    hints: [
      'Static route syntax: ip route [network] [mask] [next-hop]',
      'The destination network is 192.168.30.0/24 and the next hop is R2\'s address',
      'Command: ip route 192.168.30.0 255.255.255.0 10.0.12.2',
    ],
    explanation: 'ip route 192.168.30.0 255.255.255.0 10.0.12.2 adds a static route on R1 pointing to R2 as the next hop for the server network. R1 will now forward traffic destined for 192.168.30.x to R2, which has the server directly connected.',
  },

  {
    id: 4, type: 'troubleshooting',
    prompt: 'PC-A can reach devices in its own VLAN 10, but cannot reach PC-B in VLAN 20.\n\nBoth PCs have correct IP addresses and default gateways configured.\n\nWhat is the MOST likely cause?',
    options: [
      { key: 'A', text: 'Missing inter-VLAN routing — traffic between VLANs requires a router' },
      { key: 'B', text: 'DHCP failure — the PCs did not receive IP addresses from the server' },
      { key: 'C', text: 'NAT failure — NAT is not translating between the two VLANs' },
      { key: 'D', text: 'SNMP trap configuration — the switch is blocking cross-VLAN traffic' },
    ],
    correctAnswer: 'A',
    hints: [
      'VLANs create separate broadcast domains — they are isolated at Layer 2',
      'Both PCs have correct IPs, so DHCP is not the issue',
      'To cross between VLANs, a Layer 3 device (router or L3 switch) must route the traffic',
    ],
    explanation: 'Devices in different VLANs cannot communicate at Layer 2 — they are in separate broadcast domains. A router (inter-VLAN routing, or router-on-a-stick) must route traffic between VLAN 10 and VLAN 20. If the routing is misconfigured or missing, cross-VLAN traffic fails.',
  },

  {
    id: 5, type: 'topology-reasoning',
    prompt: 'Analyze the switch trunk output. Why are VLAN 10 and VLAN 20 users unable to reach their gateways on R1?',
    terminalOutput:
      'Switch# show interfaces trunk\n\n' +
      'Port        Mode         Encapsulation  Status\n' +
      'Gi0/1       auto         n-802.1q       not-trunking',
    options: [
      { key: 'A', text: 'The trunk is carrying too many VLANs — VLAN pruning is required' },
      { key: 'B', text: 'The switch-to-router link is not trunking — VLAN traffic cannot reach R1' },
      { key: 'C', text: 'R1\'s subinterfaces have incorrect encapsulation type configured' },
      { key: 'D', text: 'The switch does not support 802.1Q trunking on GigabitEthernet ports' },
    ],
    correctAnswer: 'B',
    hints: [
      'Router-on-a-stick requires a trunk link between the switch and router',
      'Status shows "not-trunking" — what does that mean for VLAN traffic?',
      'Without trunking, each VLAN\'s traffic is isolated and cannot reach the router',
    ],
    explanation: 'The output shows Gi0/1 is in "auto" mode and is "not-trunking". Router-on-a-stick requires the switch port to be configured as a trunk so that all VLAN traffic can pass over the single link to the router. Without trunking, VLAN 10 and VLAN 20 traffic cannot reach R1\'s subinterfaces.',
  },

  {
    id: 6, type: 'cli-input',
    prompt: 'Configure interface G0/1 on the switch as a trunk to allow all VLAN traffic to reach R1.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport mode trunk',
    acceptedAnswers: ['switchport mode trunk'],
    hints: [
      'A trunk port carries traffic for multiple VLANs across a single link',
      'Router-on-a-stick requires the switch port to be manually set to trunk mode',
      'Command: switchport mode trunk',
    ],
    explanation: 'switchport mode trunk forces the port into trunk mode, enabling it to carry tagged traffic from all VLANs. This is required for router-on-a-stick configurations where R1 uses subinterfaces (G0/0.10, G0/0.20) to route between VLANs.',
  },

  {
    id: 7, type: 'troubleshooting',
    prompt: 'A host displays the IP address 169.254.20.15 after booting.\n\nWhat is the most likely root cause?',
    options: [
      { key: 'A', text: 'OSPF misconfiguration — the routing protocol assigned an APIPA address' },
      { key: 'B', text: 'ACL deny — an access control list is blocking the host\'s IP traffic' },
      { key: 'C', text: 'DHCP failure — the host did not receive a lease from the DHCP server' },
      { key: 'D', text: 'DNS record error — the hostname is resolving to the wrong IP address' },
    ],
    correctAnswer: 'C',
    hints: [
      '169.254.0.0/16 is the APIPA range — Automatic Private IP Addressing',
      'Windows assigns an APIPA address when no DHCP server responds',
      'APIPA = DHCP failed to deliver an address to the host',
    ],
    explanation: '169.254.x.x is the APIPA (Automatic Private IP Addressing) range. When a host cannot reach a DHCP server to obtain an IP lease, it self-assigns an address from this range. This confirms DHCP is failing — the server may be down, unreachable, or misconfigured.',
  },

  {
    id: 8, type: 'sequencing',
    prompt: 'Place the DHCP DORA process steps in the correct order:',
    shuffledItems: ['Offer', 'Discover', 'Acknowledge', 'Request'],
    correctOrder: ['Discover', 'Offer', 'Request', 'Acknowledge'],
    hints: [
      'The client always initiates — it sends the first message',
      'DORA is the acronym — what does each letter stand for?',
      'Discover → Offer → Request → Acknowledge',
    ],
    explanation: 'DHCP follows the DORA sequence: 1) Discover — client broadcasts to find a DHCP server. 2) Offer — server responds with an available IP address. 3) Request — client requests that specific address. 4) Acknowledge — server confirms the lease. Missing any step causes DHCP failure.',
  },

  {
    id: 9, type: 'troubleshooting',
    prompt: 'Users can successfully ping 8.8.8.8 but cannot open websites like example.com.\n\nWhat service is most likely failing?',
    options: [
      { key: 'A', text: 'NAT — the router is not translating private IPs to public IPs' },
      { key: 'B', text: 'Default route — the router is missing a path to the internet' },
      { key: 'C', text: 'DNS — hostname-to-IP resolution is failing' },
      { key: 'D', text: 'HTTP — TCP port 80 is blocked by an ACL on the router' },
    ],
    correctAnswer: 'C',
    hints: [
      'If pinging 8.8.8.8 works, IP connectivity and NAT are confirmed working',
      'Web browsers use hostnames (example.com), not IP addresses — what resolves them?',
      'IP works, name does not — DNS is the service between names and IPs',
    ],
    explanation: 'Pinging 8.8.8.8 by IP address confirms that NAT, routing, and IP connectivity are working. The failure to open websites by domain name points to DNS — the service that translates hostnames like example.com into IP addresses. Without DNS, browsers cannot resolve destinations.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'Which DNS record type maps a hostname to an IPv4 address?',
    options: [
      { key: 'A', text: 'AAAA — maps a hostname to an IPv6 address' },
      { key: 'B', text: 'CNAME — creates an alias from one hostname to another' },
      { key: 'C', text: 'A — maps a hostname to an IPv4 address' },
      { key: 'D', text: 'PTR — maps an IP address back to a hostname (reverse lookup)' },
    ],
    correctAnswer: 'C',
    hints: [
      'IPv4 hostname mapping is the most common DNS record type',
      'Think: A for Address (IPv4)',
      'A record = hostname → IPv4 address',
    ],
    explanation: 'An A record (Address record) maps a hostname to a 32-bit IPv4 address. AAAA records map to 128-bit IPv6 addresses. CNAME records create hostname aliases. PTR records are used for reverse DNS lookups (IP to hostname).',
  },

  {
    id: 11, type: 'topology-reasoning',
    prompt: 'Analyze the NAT translation table on R2. Which address is the inside local address of the translating host?',
    terminalOutput:
      'Router# show ip nat translations\n\n' +
      'Pro  Inside global     Inside local      Outside global\n' +
      'tcp  203.0.113.5       192.168.20.10     142.250.190.14',
    options: [
      { key: 'A', text: '203.0.113.5 — the public IP assigned to the router\'s WAN interface' },
      { key: 'B', text: '192.168.20.10 — the private IP of the internal host before translation' },
      { key: 'C', text: '142.250.190.14 — the external destination server address' },
      { key: 'D', text: '192.168.20.1 — the default gateway of the internal VLAN' },
    ],
    correctAnswer: 'B',
    hints: [
      'Inside local = the private IP address of the internal device',
      'The "Inside local" column shows the host\'s original private address',
      '192.168.20.10 is in the "Inside local" column — private, before NAT translation',
    ],
    explanation: 'Inside local is the private IP address assigned to the internal host before NAT translates it. In this table, 192.168.20.10 is the inside local address of PC-B. NAT translates it to 203.0.113.5 (inside global — the public IP) to communicate with the internet.',
  },

  {
    id: 12, type: 'troubleshooting',
    prompt: 'Hosts can reach local LAN and other internal networks, but cannot access the internet. DNS is working correctly.\n\nWhat is the MOST likely missing feature?',
    options: [
      { key: 'A', text: 'VLAN trunk — the switch is not passing VLAN traffic to the router' },
      { key: 'B', text: 'NAT — private IP addresses are not being translated to a public address' },
      { key: 'C', text: 'Port Security — the switch is blocking outbound traffic' },
      { key: 'D', text: 'NTP — without time sync, internet connections fail' },
    ],
    correctAnswer: 'B',
    hints: [
      'Hosts can reach internal networks — Layer 2 and internal Layer 3 are working',
      'Private IPs (192.168.x.x) cannot route on the public internet',
      'Something must translate private IPs to the public IP before packets leave the router',
    ],
    explanation: 'Private IP addresses (RFC 1918 — 10.x, 172.16.x, 192.168.x) are not routable on the public internet. NAT (Network Address Translation) must be configured on R2 to translate private source addresses to the public IP before forwarding to the internet. Without NAT, return traffic cannot reach internal hosts.',
  },

  {
    id: 13, type: 'topology-reasoning',
    prompt: 'Examine the OSPF neighbor output on R1. What does this indicate about the routing relationship between R1 and R2?',
    terminalOutput:
      'R1# show ip ospf neighbor\n\n' +
      'Neighbor ID     Pri   State      Dead Time   Address\n' +
      '2.2.2.2           1   INIT/DR    00:00:38    10.0.12.2',
    options: [
      { key: 'A', text: 'Full adjacency is formed — R1 and R2 are exchanging routes normally' },
      { key: 'B', text: 'OSPF adjacency is incomplete — the neighbor relationship is not fully established' },
      { key: 'C', text: 'NAT translation is interfering with the OSPF hello packets' },
      { key: 'D', text: 'The ACL on R2 is successfully matching OSPF traffic' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF adjacency states: INIT → 2-WAY → EXSTART → EXCHANGE → LOADING → FULL',
      'INIT means R1 has received a hello from R2 but R2 has not confirmed seeing R1',
      'The state must reach FULL for routes to be exchanged',
    ],
    explanation: 'The INIT state indicates R1 has received OSPF Hello packets from R2 (Neighbor ID 2.2.2.2) but the bidirectional communication required to reach FULL state has not completed. OSPF must reach FULL state to exchange Link State Advertisements and install routes. Common causes: area mismatch, authentication mismatch, or hello/dead timer mismatch.',
  },

  {
    id: 14, type: 'troubleshooting',
    prompt: 'R1 and R2 are configured for OSPF but are not forming a full adjacency.\n\nWhich configuration mismatch is the MOST common cause?',
    options: [
      { key: 'A', text: 'Different OSPF area IDs — routers must be in the same area to form adjacency' },
      { key: 'B', text: 'Different hostnames — OSPF uses hostname matching to find neighbors' },
      { key: 'C', text: 'Different CDP timer values — CDP timers affect OSPF neighbor discovery' },
      { key: 'D', text: 'Different DNS server addresses — name resolution affects OSPF operation' },
    ],
    correctAnswer: 'A',
    hints: [
      'OSPF has several requirements that must match on both sides of a link',
      'The area ID is exchanged in OSPF Hello packets — mismatches prevent adjacency',
      'Both routers must be in the same OSPF area (e.g., area 0) to form adjacency',
    ],
    explanation: 'OSPF routers must match on area ID, hello/dead timers, authentication, and subnet mask to form adjacency. Area ID mismatch is the most common cause of OSPF failure — routers in different areas cannot become neighbors. Other common mismatches include stub area type and MTU.',
  },

  {
    id: 15, type: 'topology-reasoning',
    prompt: 'Review this ACL applied to R2. PC-A (192.168.10.x) can browse the web server but cannot ping it. Why?',
    terminalOutput:
      'access-list 110 permit tcp 192.168.10.0 0.0.0.255 host 192.168.30.10 eq 80\n' +
      'access-list 110 deny ip any any',
    options: [
      { key: 'A', text: 'ICMP is permitted but TCP is blocked by the first ACE' },
      { key: 'B', text: 'PC-A\'s subnet (192.168.10.0) is not in the permitted range of the ACL' },
      { key: 'C', text: 'The ACL permits only TCP port 80 (HTTP) — ICMP ping is blocked by the deny statement' },
      { key: 'D', text: 'The ACL has no permit statement — all traffic including HTTP is being dropped' },
    ],
    correctAnswer: 'C',
    hints: [
      'The first ACE permits only TCP (not ICMP) from 192.168.10.0 to the server on port 80',
      'Ping uses ICMP — which rule does ICMP match in this ACL?',
      'The deny ip any any at the bottom catches all unmatched traffic, including ICMP',
    ],
    explanation: 'The first ACE permits only TCP port 80 (HTTP) from 192.168.10.0/24 to the server. Ping uses ICMP, which is not TCP — it does not match the permit statement and falls through to the implicit (and explicit) "deny ip any any" at the end. Web browsing works because HTTP uses TCP port 80.',
  },

  {
    id: 16, type: 'multiple-choice',
    prompt: 'Which ACL type can filter traffic based on destination IP address, transport protocol, and port number?',
    options: [
      { key: 'A', text: 'Standard ACL — filters based on source IP address only' },
      { key: 'B', text: 'Extended ACL — filters based on source, destination, protocol, and port' },
      { key: 'C', text: 'Port Security — filters based on MAC address at Layer 2' },
      { key: 'D', text: 'NAT ACL — selects which traffic should be translated' },
    ],
    correctAnswer: 'B',
    hints: [
      'Standard ACLs are limited — they only look at the source IP',
      'Think about which ACL type gives you the most control',
      'Extended ACL = numbers 100–199, matches src, dst, protocol, port',
    ],
    explanation: 'Extended ACLs (numbered 100–199) can match on source IP, destination IP, protocol (TCP, UDP, ICMP, etc.), and source/destination port numbers. This makes them far more precise than Standard ACLs (1–99), which only match on the source IP address.',
  },

  {
    id: 17, type: 'cli-input',
    prompt: 'Enter the command to verify OSPF neighbor relationships and their current states.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip ospf neighbor',
    acceptedAnswers: ['show ip ospf neighbor'],
    hints: [
      'This command shows all OSPF neighbors and their adjacency states',
      'Look for the "FULL" state to confirm a working neighbor relationship',
      'Command: show ip ospf neighbor',
    ],
    explanation: 'show ip ospf neighbor displays all OSPF neighbor relationships, their states (INIT, 2WAY, EXSTART, EXCHANGE, LOADING, FULL), dead timers, and interface details. The neighbor must reach FULL state for LSAs and routes to be exchanged.',
  },

  {
    id: 18, type: 'cli-input',
    prompt: 'Enter the command to view the routing table and verify known routes including their source (connected, static, OSPF).',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip route',
    acceptedAnswers: ['show ip route'],
    hints: [
      'This command shows all known routes including connected, static, and dynamic routes',
      'It displays route source codes: C (connected), S (static), O (OSPF)',
      'Command: show ip route',
    ],
    explanation: 'show ip route displays the IP routing table including all network prefixes, their source (C=connected, S=static, O=OSPF, etc.), metric, and next-hop information. Use this to verify routes are installed and traffic will be forwarded correctly.',
  },

  {
    id: 19, type: 'cli-input',
    prompt: 'Enter the command to verify VLAN membership — which ports are assigned to which VLANs on the switch.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show vlan brief',
    acceptedAnswers: ['show vlan brief'],
    hints: [
      'This command shows VLANs and their assigned ports in a compact format',
      'Use this to confirm ports are in the correct VLANs',
      'Command: show vlan brief',
    ],
    explanation: 'show vlan brief displays all VLANs, their names, status, and assigned ports in a concise table. Use this to verify that access ports are assigned to the correct VLANs and confirm active VLAN status.',
  },

  {
    id: 20, type: 'conceptual',
    prompt: 'A user reports "the network is broken." After investigation you find:\n• Local gateway ping succeeds\n• Remote network ping fails\n• DNS works\n• ACL denies ICMP to the server\n• R1 routing table missing 192.168.30.0/24\n\nWhat are the TWO most likely root causes?',
    options: [
      { key: 'A', text: 'Power failure and physical cable disconnection at the server rack' },
      { key: 'B', text: 'Missing route (no path to 192.168.30.0/24) and ACL filtering ICMP traffic' },
      { key: 'C', text: 'DNS failure and DHCP server unreachable' },
      { key: 'D', text: 'Port Security violation and wireless authentication failure' },
    ],
    correctAnswer: 'B',
    hints: [
      'Local gateway responds — Layer 1 and Layer 2 are fine',
      'Remote ping fails — what Layer 3 cause could block delivery?',
      'ACL denies ICMP — what does that do to ping specifically?',
    ],
    explanation: 'Two issues explain the symptoms: 1) Missing route — R1 has no route to 192.168.30.0/24, so packets for the server are dropped at R1 before reaching R2. 2) ACL filtering ICMP — even if the route existed, the ACL on R2 blocks ICMP (ping). Both must be fixed for full connectivity. This demonstrates real-world multi-cause troubleshooting.',
  },
]

export const LAB19_COMPLETION = {
  conceptMastered: 'Mixed Network Troubleshooting',
  summary:
    'You successfully worked through a multi-layer troubleshooting scenario involving switching, routing, VLANs, OSPF, IP services, NAT, DNS, and ACLs.',
  masteredPoints: [
    'Local gateway success + remote failure = Layer 3 routing issue',
    'Missing routes cause silent packet drops at the router',
    'Router-on-a-stick requires a trunk link between switch and router',
    'APIPA (169.254.x.x) always indicates DHCP failure',
    'Ping works but hostname fails = DNS is the problem',
    'NAT translates private IPs to a public address for internet access',
    'OSPF must reach FULL state to exchange routes (area mismatch prevents this)',
    'Extended ACLs filter by source, destination, protocol, and port',
    'Real troubleshooting often involves multiple simultaneous root causes',
  ],
  reviewIfNeeded: [
    { id: '4–11', title: 'Switching, Routing, VLANs, OSPF, IP Services, ACLs' },
  ],
  nextLab: {
    id: 'lab20',
    title: 'Lab 20 – Final CCNA Practical Review',
  },
}
