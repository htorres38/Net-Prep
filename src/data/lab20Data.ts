
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
  1:  ['PC-A', 'PC-B'],
  2:  ['S1', 'R1'],
  3:  ['S1'],
  4:  ['R1'],
  5:  ['R1', 'R2'],
  6:  ['R1', 'R2', 'Server'],
  7:  ['R1', 'R2'],
  8:  ['R1', 'R2'],
  9:  ['PC-A'],
  12: ['R2'],
  13: ['R2'],
  14: ['R2', 'Server'],
  18: ['S1'],
  19: ['S1', 'PC-A', 'PC-B'],
  20: ['PC-A', 'PC-B', 'S1', 'R1', 'R2', 'Server'],
}

export const LAB20_META = {
  id: 'lab20',
  title: 'Final CCNA Practical Review',
  difficulty: 'Advanced' as const,
  estimatedTime: '60–75 min',
  skillsTested: [
    'End-to-end network troubleshooting across all layers',
    'VLAN and trunk configuration validation',
    'Inter-VLAN routing analysis',
    'Static and dynamic routing decisions',
    'OSPF neighbor and route verification',
    'DHCP, DNS, and NAT troubleshooting',
    'ACL traffic filtering analysis',
    'Wireless and port security concepts',
    'CLI interpretation across multiple devices',
  ],
  lessonsReinforced: [
    { id: '83', title: 'Final Review' },
    { id: '1–82', title: 'Full Course Comprehensive Review' },
  ],
}

export const LAB20_SCENARIO = {
  context: 'You are assigned to troubleshoot a production network before a major deployment.',
  reports: [
    'Some VLANs cannot communicate with each other',
    'Internet access is inconsistent across subnets',
    'Routing appears unstable between sites',
    'One subnet cannot reach an application server',
    'Wireless clients can connect but have limited access',
  ],
  challenge: 'Analyze multiple simultaneous issues and determine their root causes. Apply systematic Layer 1–7 troubleshooting across switching, routing, services, and security.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'troubleshooting',
    prompt: 'PC-A (VLAN 10, 192.168.10.10) can reach its default gateway but cannot communicate with PC-B (VLAN 20, 192.168.20.10).\n\nWhat is the MOST likely issue?',
    options: [
      { key: 'A', text: 'VLAN separation without routing — different VLANs cannot communicate without a Layer 3 device' },
      { key: 'B', text: 'DHCP failure — both PCs failed to obtain addresses from the DHCP server' },
      { key: 'C', text: 'NAT failure — the router is not translating addresses between VLANs' },
      { key: 'D', text: 'DNS issue — name resolution is preventing inter-VLAN connectivity' },
    ],
    correctAnswer: 'A',
    hints: [
      'PC-A can reach its own gateway — the NIC and switch port are working',
      'VLANs are isolated Layer 2 broadcast domains',
      'Traffic between VLANs must be routed — a Layer 3 device is required',
    ],
    explanation: 'VLANs create separate broadcast domains. Devices in VLAN 10 and VLAN 20 cannot communicate directly at Layer 2. Inter-VLAN routing (via a router or Layer 3 switch) must forward traffic between them. Since PC-A can reach its own gateway, local Layer 2 is fine — the issue is the inter-VLAN routing path.',
  },

  {
    id: 2, type: 'topology-reasoning',
    prompt: 'Analyze the switch output. What is preventing VLAN 10 and VLAN 20 traffic from reaching the router subinterfaces?',
    terminalOutput:
      'Switch# show interfaces trunk\n\n' +
      'Port        Mode         Encapsulation  Status\n' +
      'Gi0/1       auto         n-802.1q       not-trunking',
    options: [
      { key: 'A', text: 'The trunk is blocked by Spanning Tree — STP is putting the port in blocking state' },
      { key: 'B', text: 'Trunk is not configured — G0/1 is in "auto" mode and is not trunking, so VLAN traffic cannot reach R1' },
      { key: 'C', text: 'The router subinterfaces are using the wrong encapsulation type' },
      { key: 'D', text: 'VLAN 10 and VLAN 20 are not in the VLAN database on this switch' },
    ],
    correctAnswer: 'B',
    hints: [
      'Router-on-a-stick requires the switch-to-router port to carry multiple VLANs',
      'The status shows "not-trunking" — what does that mean for VLAN tagged traffic?',
      '"auto" mode alone will not negotiate trunking unless the other side is "desirable"',
    ],
    explanation: 'The port Gi0/1 is in "auto" mode which means it will only trunk if the other side actively negotiates it. The status "not-trunking" confirms trunking is not active. Router-on-a-stick requires the port to be explicitly set to trunk mode so VLAN-tagged traffic can reach R1\'s subinterfaces.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Fix the trunk issue on Switch S1, interface G0/1. The port must carry all VLAN traffic to R1.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport mode trunk',
    acceptedAnswers: ['switchport mode trunk'],
    hints: [
      'Force the port into trunk mode — do not rely on auto-negotiation',
      'A trunk port carries tagged frames for all VLANs',
      'Command: switchport mode trunk',
    ],
    explanation: 'switchport mode trunk forces the port into permanent trunk mode, enabling 802.1Q tagging for all VLANs. This allows VLAN 10 and VLAN 20 traffic to cross the single link between S1 and R1, where R1\'s subinterfaces (G0/0.10, G0/0.20) handle routing between them.',
  },

  {
    id: 4, type: 'troubleshooting',
    prompt: 'The trunk is now fixed and VLANs can reach R1. But PC-A still cannot reach the server at 192.168.30.10.\n\nR1 routing table shows:\n  C  192.168.10.0/24  directly connected\n  C  192.168.20.0/24  directly connected\n  C  10.0.12.0/30     directly connected\n\nWhat is missing?',
    options: [
      { key: 'A', text: 'A route to 192.168.30.0/24 — R1 has no path to the server network' },
      { key: 'B', text: 'A VLAN entry for the server — the server must be added to the VLAN database' },
      { key: 'C', text: 'OSPF must be enabled — static routes are not supported on R1' },
      { key: 'D', text: 'NAT must be configured on R1 — the server needs address translation' },
    ],
    correctAnswer: 'A',
    hints: [
      'R1 only knows its directly connected networks',
      'The server is at 192.168.30.10 — is 192.168.30.0/24 in the routing table?',
      'No route to 192.168.30.0/24 means R1 drops packets destined for the server',
    ],
    explanation: 'R1\'s routing table shows only directly connected networks. There is no route to 192.168.30.0/24 (the server LAN behind R2). Without this route, R1 cannot forward packets from PC-A toward the server — they are dropped. A static route or dynamic routing protocol must add this path.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Add a static route on R1 to reach the server network (192.168.30.0/24) via R2\'s interface (next hop: 10.0.12.2).',
    terminalPrompt: 'R1(config)#',
    expectedAnswer: 'ip route 192.168.30.0 255.255.255.0 10.0.12.2',
    acceptedAnswers: ['ip route 192.168.30.0 255.255.255.0 10.0.12.2'],
    hints: [
      'Static route syntax: ip route [network] [subnet mask] [next-hop IP]',
      'The next hop is R2\'s IP on the shared link: 10.0.12.2',
      'Command: ip route 192.168.30.0 255.255.255.0 10.0.12.2',
    ],
    explanation: 'ip route 192.168.30.0 255.255.255.0 10.0.12.2 installs a static route on R1 pointing to R2 (10.0.12.2) as the next hop for the server network. Now when PC-A sends traffic to 192.168.30.10, R1 knows to forward it toward R2.',
  },

  {
    id: 6, type: 'troubleshooting',
    prompt: 'After adding the static route, the server can receive packets from PC-A, but PC-A still cannot complete the connection.\n\nWhat is the MOST likely remaining issue?',
    options: [
      { key: 'A', text: 'Missing return route — the server or R2 has no route back to 192.168.10.0/24' },
      { key: 'B', text: 'VLAN mismatch — the server is in the wrong VLAN on S1' },
      { key: 'C', text: 'Port Security — the server\'s switch port is in err-disabled state' },
      { key: 'D', text: 'Wireless issue — the server is using Wi-Fi with poor signal strength' },
    ],
    correctAnswer: 'A',
    hints: [
      'IP communication is bidirectional — both directions need a path',
      'The server received the packet, but where does it send the reply?',
      'R2 or the server needs a route back to the 192.168.10.0/24 network',
    ],
    explanation: 'IP routing is bidirectional. While R1 now knows how to reach the server (192.168.30.0/24), the server\'s router R2 must also have a return route to 192.168.10.0/24 (PC-A\'s network) and 192.168.20.0/24. Without a return path, server replies are dropped and the connection cannot complete.',
  },

  {
    id: 7, type: 'topology-reasoning',
    prompt: 'Review the OSPF neighbor output on R2. What does the neighbor state indicate about the routing relationship?',
    terminalOutput:
      'R2# show ip ospf neighbor\n\n' +
      'Neighbor ID     Pri   State       Dead Time   Address\n' +
      '1.1.1.1           1   INIT/DR     00:00:39    10.0.12.1',
    options: [
      { key: 'A', text: 'Full adjacency is formed — R1 and R2 are exchanging routes successfully' },
      { key: 'B', text: 'OSPF adjacency is not fully formed — the routers are not yet exchanging routes' },
      { key: 'C', text: 'The neighbor is being excluded from routing by an ACL on R2' },
      { key: 'D', text: 'The OSPF process is restarting — this is normal during convergence' },
    ],
    correctAnswer: 'B',
    hints: [
      'OSPF must reach FULL state before routes are exchanged',
      'INIT means R2 received a Hello from R1 but the 2-way relationship is not yet confirmed',
      'If state stays at INIT, routes are not being shared between R1 and R2',
    ],
    explanation: 'INIT state means R2 has received an OSPF Hello from R1 (Neighbor ID 1.1.1.1) but has not yet established bidirectional communication. OSPF must progress through: INIT → 2WAY → EXSTART → EXCHANGE → LOADING → FULL before routes are exchanged. A stuck INIT usually indicates a Hello/Dead timer mismatch, area mismatch, or authentication issue.',
  },

  {
    id: 8, type: 'troubleshooting',
    prompt: 'R1 and R2 are configured with OSPF but cannot form a full adjacency (state is stuck at INIT).\n\nWhat is the MOST common configuration mismatch that prevents OSPF adjacency?',
    options: [
      { key: 'A', text: 'Different OSPF area IDs — routers must be in the same area to exchange routes' },
      { key: 'B', text: 'Routers on the same subnet — OSPF cannot run when routers share a network' },
      { key: 'C', text: 'Same router ID — having identical router IDs prevents neighbor formation' },
      { key: 'D', text: 'Matching dead timers — if dead timers are the same, OSPF will not form adjacency' },
    ],
    correctAnswer: 'A',
    hints: [
      'OSPF Hello packets carry the area ID — both sides must match',
      'Routers in different areas cannot become neighbors (unless they are ABRs)',
      'Area 0 (backbone) is required for all OSPF areas to interconnect',
    ],
    explanation: 'OSPF area ID mismatch is the most common cause of failed adjacency. Both routers must be in the same OSPF area on the shared interface. Hello packets carry the area ID, and if they don\'t match, the neighbor relationship is rejected. Other causes: hello/dead timer mismatch, authentication mismatch, and MTU mismatch.',
  },

  {
    id: 9, type: 'troubleshooting',
    prompt: 'A PC displays the IP address 169.254.10.5 after attempting to connect to the network.\n\nWhat is the root cause?',
    options: [
      { key: 'A', text: 'The PC was assigned a duplicate IP address by the DHCP server' },
      { key: 'B', text: 'DHCP failed — the PC could not obtain a lease and self-assigned an APIPA address' },
      { key: 'C', text: 'The switch port is in the wrong VLAN — the PC cannot reach its default gateway' },
      { key: 'D', text: 'DNS failed — the hostname the PC tried to resolve does not exist' },
    ],
    correctAnswer: 'B',
    hints: [
      '169.254.0.0/16 is the APIPA range — Automatic Private IP Addressing',
      'Operating systems assign an APIPA address when DHCP discovery times out',
      'APIPA always means the host tried DHCP and received no response',
    ],
    explanation: 'An APIPA address (169.254.0.0/16) is automatically assigned by the OS when a DHCP server cannot be reached within the timeout period. The host sent DHCP Discover broadcasts but received no Offer. This indicates the DHCP server is unreachable, down, or the DHCP scope is exhausted.',
  },

  {
    id: 10, type: 'sequencing',
    prompt: 'Put the DHCP process (DORA) in the correct order from start to finish:',
    shuffledItems: ['Offer', 'Discover', 'Request', 'Acknowledge'],
    correctOrder: ['Discover', 'Offer', 'Request', 'Acknowledge'],
    hints: [
      'The client always initiates DHCP by broadcasting first',
      'DORA is the acronym — the first letter of each step spells it out',
      'Discover → Offer → Request → Acknowledge',
    ],
    explanation: 'DHCP DORA: 1) Discover — client broadcasts to find a DHCP server. 2) Offer — server unicasts or broadcasts an IP address offer. 3) Request — client requests that specific address (broadcast, so other servers know). 4) Acknowledge — server confirms the lease with duration and other options (DNS, gateway).',
  },

  {
    id: 11, type: 'troubleshooting',
    prompt: 'Users can successfully ping external IP addresses (e.g., 8.8.8.8) but cannot open any websites by domain name.\n\nWhat is failing?',
    options: [
      { key: 'A', text: 'NAT — the router is not translating private source addresses' },
      { key: 'B', text: 'Default route — R1 is missing a default route to the internet' },
      { key: 'C', text: 'DNS — hostname-to-IP address resolution is not working' },
      { key: 'D', text: 'HTTP — an ACL is blocking TCP port 80 outbound from the LAN' },
    ],
    correctAnswer: 'C',
    hints: [
      'Pinging 8.8.8.8 by IP works — this confirms routing, NAT, and connectivity are fine',
      'Websites are accessed by hostname (google.com), not by IP address',
      'Something must translate domain names into IP addresses before browsing can work',
    ],
    explanation: 'If IP-based connectivity works (ping to 8.8.8.8) but domain names fail, the problem is DNS. Browsers resolve domain names to IPs using DNS before making connections. Without a reachable DNS server, hostnames cannot be resolved and browsing fails even though the network itself is functional.',
  },

  {
    id: 12, type: 'topology-reasoning',
    prompt: 'Examine the NAT translation table on R2. What does this entry represent?',
    terminalOutput:
      'Router# show ip nat translations\n\n' +
      'Pro  Inside local      Inside global     Outside global\n' +
      'tcp  192.168.20.10     203.0.113.5       142.250.190.14',
    options: [
      { key: 'A', text: 'The outside global address (142.250.190.14) is being translated to a private IP' },
      { key: 'B', text: 'A private internal IP (192.168.20.10) is being translated to a public IP (203.0.113.5) for internet access' },
      { key: 'C', text: 'R2 is performing PAT and both inside addresses share the same port' },
      { key: 'D', text: 'The inside global address is the server at 192.168.20.10' },
    ],
    correctAnswer: 'B',
    hints: [
      'Inside local = the private IP of the host before translation',
      'Inside global = the public IP the host appears as to the internet',
      'NAT maps private → public to allow internet access for internal devices',
    ],
    explanation: 'This NAT entry shows PC-B (192.168.20.10, inside local) communicating with an external server (142.250.190.14, outside global). NAT on R2 translates the private source address to the public IP 203.0.113.5 (inside global) so the packet can be routed on the public internet and the reply can find its way back.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'All internal hosts can reach each other and DNS is working, but no host can access the internet at all.\n\nWhat is MOST likely missing?',
    options: [
      { key: 'A', text: 'ACL — an access control list is blocking all outbound traffic' },
      { key: 'B', text: 'NAT — private IP addresses are not being translated to a routable public address' },
      { key: 'C', text: 'VLAN — the internet VLAN is not configured on the switch' },
      { key: 'D', text: 'STP — Spanning Tree is blocking the uplink port to the ISP' },
    ],
    correctAnswer: 'B',
    hints: [
      'Internal communication works — Layer 2 and internal Layer 3 are fine',
      'Private addresses (10.x, 172.16.x, 192.168.x) are not routable on the internet',
      'Something must translate private IPs to the public ISP-assigned address',
    ],
    explanation: 'Private IP addresses (RFC 1918) cannot be routed on the public internet — ISP routers discard packets with private source addresses. NAT must be configured on R2 to translate internal private IPs to the public IP assigned by the ISP. Without NAT, all packets with private source addresses are dropped at the ISP boundary.',
  },

  {
    id: 14, type: 'topology-reasoning',
    prompt: 'Review this ACL applied inbound on R2\'s server-facing interface. PC-A can browse the web server but cannot ping it. Why does ping fail?',
    terminalOutput:
      'access-list 110 permit tcp any host 192.168.30.10 eq 80\n' +
      'access-list 110 deny ip any any',
    options: [
      { key: 'A', text: 'TCP is blocked — only ICMP is permitted by the first ACE' },
      { key: 'B', text: 'PC-A\'s source address is not included in the "any" keyword' },
      { key: 'C', text: 'ICMP is not permitted — ping traffic does not match TCP eq 80 and is denied by the final rule' },
      { key: 'D', text: 'The ACL has no permit statement so all traffic is blocked' },
    ],
    correctAnswer: 'C',
    hints: [
      'The first ACE only permits TCP — what protocol does ping use?',
      'Ping uses ICMP — is ICMP permitted in this ACL?',
      'Unmatched traffic falls through to "deny ip any any" at the bottom',
    ],
    explanation: 'The ACL permits only TCP traffic destined to the server on port 80 (HTTP). Ping uses ICMP, which is not TCP — it does not match the permit ACE. ICMP traffic falls through to the explicit "deny ip any any" at the bottom and is dropped. Web browsing works because it uses TCP port 80 which is explicitly permitted.',
  },

  {
    id: 15, type: 'cli-input',
    prompt: 'Enter the command to display the routing table and verify all known routes including their source codes.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip route',
    acceptedAnswers: ['show ip route'],
    hints: [
      'This command shows all route sources: C (connected), S (static), O (OSPF)',
      'Use this to confirm a missing route is the cause of connectivity failure',
      'Command: show ip route',
    ],
    explanation: 'show ip route displays the complete routing table with route source codes (C=connected, S=static, O=OSPF, R=RIP), metrics, and next-hop information. This is one of the most important verification commands — use it to confirm routes are installed and identify missing paths.',
  },

  {
    id: 16, type: 'cli-input',
    prompt: 'Enter the command to verify OSPF neighbor relationships and confirm the adjacency state.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ip ospf neighbor',
    acceptedAnswers: ['show ip ospf neighbor'],
    hints: [
      'This command shows all OSPF neighbors and their current states',
      'Look for "FULL" state to confirm a healthy adjacency',
      'Command: show ip ospf neighbor',
    ],
    explanation: 'show ip ospf neighbor displays all known OSPF neighbors, their router IDs, priority, adjacency state, dead timer countdown, and the interface address. The neighbor must reach FULL state for LSAs to be exchanged and routes to appear in the routing table.',
  },

  {
    id: 17, type: 'cli-input',
    prompt: 'Enter the command to verify VLAN configuration and confirm which ports belong to which VLANs on the switch.',
    terminalPrompt: 'Switch#',
    expectedAnswer: 'show vlan brief',
    acceptedAnswers: ['show vlan brief'],
    hints: [
      'This command shows all VLANs, their status, and assigned ports',
      'Use this to confirm a port is in the correct VLAN',
      'Command: show vlan brief',
    ],
    explanation: 'show vlan brief displays all VLANs in the VLAN database with their names, status (active/act/unsupported), and assigned access ports. This is essential for verifying VLAN membership and identifying misconfigured or missing VLAN assignments.',
  },

  {
    id: 18, type: 'troubleshooting',
    prompt: 'A switch port automatically shuts down immediately after a new device is plugged in.\n\nWhat is the MOST likely cause?',
    options: [
      { key: 'A', text: 'STP detected a loop — Spanning Tree blocked the port to prevent broadcast storms' },
      { key: 'B', text: 'Port Security violation — the new device\'s MAC address was not authorized on the port' },
      { key: 'C', text: 'VLAN mismatch — the new device is in the wrong VLAN' },
      { key: 'D', text: 'DHCP exhaustion — the DHCP pool has run out of available addresses' },
    ],
    correctAnswer: 'B',
    hints: [
      'Port Security controls which MAC addresses can connect to a switch port',
      'Violation mode "shutdown" places the port in err-disabled state when an unauthorized MAC connects',
      'The port went down immediately when the new device connected — what tracks device identity at Layer 2?',
    ],
    explanation: 'Port Security in shutdown violation mode places a port in err-disabled state the moment an unauthorized MAC address is detected. When a new device is plugged in and its MAC address does not match the configured or learned secure address, the port shuts down immediately. Recovery requires "shutdown" then "no shutdown" on the interface.',
  },

  {
    id: 19, type: 'conceptual',
    prompt: 'Why are VLANs used in enterprise networks? What is their primary purpose?',
    options: [
      { key: 'A', text: 'To increase the physical speed of switch ports from 100 Mbps to 1 Gbps' },
      { key: 'B', text: 'To separate broadcast domains — isolating traffic between groups of devices' },
      { key: 'C', text: 'To encrypt all traffic between switches for improved security' },
      { key: 'D', text: 'To replace the need for routers by creating Layer 2 paths between sites' },
    ],
    correctAnswer: 'B',
    hints: [
      'VLANs are a Layer 2 concept — think about what Layer 2 devices propagate',
      'Without VLANs, all devices on a switch share the same broadcast domain',
      'VLANs = logical segmentation of a physical switch into separate broadcast domains',
    ],
    explanation: 'VLANs separate a physical switch into multiple logical broadcast domains. Broadcasts from one VLAN are not forwarded to other VLANs. This improves security (isolates sensitive groups), reduces broadcast traffic, and simplifies network management by grouping devices logically regardless of physical location.',
  },

  {
    id: 20, type: 'conceptual',
    prompt: 'A network has multiple simultaneous issues:\n• Missing trunk between switch and router\n• Missing route on R1 to the server network\n• ACL blocking ICMP to the server\n• DHCP server unreachable for VLAN 10\n\nWhat is the correct troubleshooting approach?',
    options: [
      { key: 'A', text: 'Fix all issues at once by replacing the entire configuration from backup' },
      { key: 'B', text: 'Fix Layer 1–3 issues step-by-step — resolve the trunk first, then routing, then services' },
      { key: 'C', text: 'Focus only on the ACL — all other issues will resolve automatically' },
      { key: 'D', text: 'Reboot all devices — this clears all configuration issues simultaneously' },
    ],
    correctAnswer: 'B',
    hints: [
      'The OSI model provides a framework: fix lower layers before higher layers',
      'If Layer 2 (trunk) is broken, Layer 3 (routing) will also fail regardless of configuration',
      'Systematic troubleshooting prevents confusion and identifies true root causes',
    ],
    explanation: 'Systematic OSI-model troubleshooting resolves issues in dependency order: 1) Fix the trunk (Layer 2) so VLAN traffic can reach the router. 2) Fix routing (Layer 3) so traffic can reach the server. 3) Fix services (DHCP, DNS, NAT) at Layer 4–7. 4) Fix ACLs last since they filter traffic that must first be routable. Fixing all at once makes it impossible to isolate root causes.',
  },
]

export const LAB20_COMPLETION = {
  conceptMastered: 'Full CCNA Practical Skills',
  summary:
    'You successfully diagnosed and resolved multiple real-world network issues across switching, routing, services, and security — demonstrating full CCNA readiness.',
  masteredPoints: [
    'VLANs create broadcast domains — inter-VLAN routing is required for cross-VLAN traffic',
    'Router-on-a-stick requires an 802.1Q trunk between the switch and router',
    'Static routes must exist for each remote network in both directions',
    'OSPF adjacency must reach FULL state — area ID mismatch is the most common cause',
    'APIPA (169.254.x.x) always indicates DHCP failure',
    'Pinging by IP works but hostnames fail = DNS is the problem',
    'NAT translates private IPs to public for internet access — required for RFC 1918 networks',
    'Extended ACLs filter by src, dst, protocol, and port — ICMP must be explicitly permitted',
    'Port Security shutdown mode puts ports in err-disabled on unauthorized MAC detection',
    'Systematic Layer 1→7 troubleshooting prevents confusion and finds root causes efficiently',
  ],
  reviewIfNeeded: [
    { id: '83', title: 'Final Review' },
    { id: '1–82', title: 'Full Course — Review any weak topic areas identified' },
  ],
  nextLab: {
    id: 'labs',
    title: 'All Labs Complete — CCNA Exam Ready! 🎓',
  },
}
