
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
  12: ['PC-A', 'Server'],
  13: ['PC-A', 'Router R1'],
  14: ['PC-B', 'Server'],
}

export const LAB16_META = {
  id: 'lab16',
  title: 'ACL Fundamentals',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Understand ACL purpose and behavior',
    'Apply ACL processing logic (top-down, first match)',
    'Identify implicit deny behavior',
    'Configure Standard ACLs',
    'Configure Extended ACLs',
    'Apply ACLs to interfaces (inbound vs outbound)',
    'Determine correct ACL placement',
    'Troubleshoot blocked traffic',
  ],
  lessonsReinforced: [
    { id: '72', title: 'ACL Fundamentals' },
    { id: '73', title: 'Standard ACLs' },
    { id: '74', title: 'Extended ACLs' },
  ],
}

export const LAB16_SCENARIO = {
  context: 'A company needs to secure its network using Access Control Lists.',
  reports: [
    'Some traffic is unexpectedly blocked that should be allowed',
    'Some traffic is allowed when it should be denied',
    'A specific host needs to be blocked from reaching a server',
    'Only web traffic should be permitted between two networks',
  ],
  challenge: 'Configure ACLs correctly, analyze ACL behavior, and troubleshoot filtering issues.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What is the main purpose of an ACL (Access Control List)?',
    options: [
      { key: 'A', text: 'Assign IP addresses to devices automatically' },
      { key: 'B', text: 'Filter traffic by permitting or denying packets' },
      { key: 'C', text: 'Route packets between different networks' },
      { key: 'D', text: 'Resolve domain names to IP addresses' },
    ],
    correctAnswer: 'B',
    hints: [
      'ACLs are a security feature — think about controlling what traffic is allowed',
      'ACLs use permit and deny statements',
      'ACLs filter packets based on criteria like IP address, protocol, and port',
    ],
    explanation: 'ACLs (Access Control Lists) filter network traffic by evaluating each packet against a list of permit and deny rules. They are used to control which traffic can enter or exit a router interface — enforcing security policies.',
  },

  {
    id: 2, type: 'conceptual',
    prompt: 'How does a router process ACL rules when evaluating a packet?',
    options: [
      { key: 'A', text: 'Random order — the best matching rule wins regardless of position' },
      { key: 'B', text: 'Bottom to top — the last rule takes highest priority' },
      { key: 'C', text: 'Top to bottom — stops at the first matching rule' },
      { key: 'D', text: 'All rules are evaluated and the most specific one wins' },
    ],
    correctAnswer: 'C',
    hints: [
      'Order matters in ACLs — the position of each rule affects the outcome',
      'Once a match is found, processing stops — no further rules are checked',
      'Top-down, first match wins',
    ],
    explanation: 'ACLs are processed top to bottom. The router compares the packet against each rule in sequence and stops at the first match — applying that rule\'s permit or deny action. This is why rule order is critical.',
  },

  {
    id: 3, type: 'conceptual',
    prompt: 'What happens if a packet does not match any rule in an ACL?',
    options: [
      { key: 'A', text: 'The packet is forwarded normally without any action' },
      { key: 'B', text: 'The packet is logged and then permitted' },
      { key: 'C', text: 'The packet is denied — ACLs have an implicit deny at the end' },
      { key: 'D', text: 'The ACL is bypassed and the packet is routed normally' },
    ],
    correctAnswer: 'C',
    hints: [
      'There is a hidden rule at the end of every ACL',
      'If nothing matches, what is the default action?',
      'Implicit deny — every ACL silently denies unmatched traffic',
    ],
    explanation: 'Every ACL contains an implicit "deny all" at the end, even though it is not shown in the configuration. If a packet does not match any explicit rule, it is silently dropped. This is why a "permit any" is often needed at the end of an ACL.',
  },

  {
    id: 4, type: 'cli-input',
    prompt: 'Create a Standard ACL (number 10) to deny host 192.168.1.50.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'access-list 10 deny 192.168.1.50',
    acceptedAnswers: [
      'access-list 10 deny 192.168.1.50',
      'access-list 10 deny host 192.168.1.50',
    ],
    hints: [
      'Standard ACLs use numbers 1–99',
      'Syntax: access-list [number] deny [source-IP]',
      'Command: access-list 10 deny 192.168.1.50',
    ],
    explanation: 'Standard ACL syntax: access-list [1–99] {permit|deny} [source]. A host match can use the IP directly (default wildcard 0.0.0.0) or the keyword "host". Standard ACLs filter based on source IP only.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Add a rule to ACL 10 to permit all other traffic.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'access-list 10 permit any',
    acceptedAnswers: ['access-list 10 permit any'],
    hints: [
      'Without this rule, the implicit deny blocks ALL other traffic',
      'Use the keyword "any" to match all source addresses',
      'Command: access-list 10 permit any',
    ],
    explanation: 'Because of the implicit deny at the end of every ACL, a "permit any" statement must be added to allow all other traffic not explicitly denied. Without it, only host 192.168.1.50 would be blocked — all other traffic would also be denied.',
  },

  {
    id: 6, type: 'cli-input',
    prompt: 'Apply ACL 10 inbound on interface G0/0.',
    terminalPrompt: 'Router(config-if)#',
    expectedAnswer: 'ip access-group 10 in',
    acceptedAnswers: ['ip access-group 10 in'],
    hints: [
      'ACLs must be applied to an interface to take effect',
      'Use ip access-group to apply an ACL to an interface',
      'Command: ip access-group 10 in',
    ],
    explanation: 'ip access-group [ACL-number] {in|out} applies an ACL to an interface. "in" filters traffic entering the interface from the connected network. "out" filters traffic leaving the interface toward the connected network.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'What does a Standard ACL evaluate when filtering packets?',
    options: [
      { key: 'A', text: 'Destination IP address only' },
      { key: 'B', text: 'Source IP address only' },
      { key: 'C', text: 'Source IP, destination IP, and port number' },
      { key: 'D', text: 'Protocol type and port number only' },
    ],
    correctAnswer: 'B',
    hints: [
      'Standard = simple — it only checks one thing',
      'Where is the packet coming FROM?',
      'Standard ACLs only look at the source IP address',
    ],
    explanation: 'Standard ACLs (numbered 1–99, 1300–1999) filter traffic based on source IP address only. They cannot match on destination IP, protocol, or port. For more granular filtering, Extended ACLs are required.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'Where should Standard ACLs be placed for best practice?',
    options: [
      { key: 'A', text: 'Close to the source of traffic to stop it early' },
      { key: 'B', text: 'Close to the destination — Standard ACLs cannot filter by destination' },
      { key: 'C', text: 'Anywhere on the network — placement does not matter' },
      { key: 'D', text: 'Only on WAN interfaces connecting to the internet' },
    ],
    correctAnswer: 'B',
    hints: [
      'Standard ACLs only check source IP — they cannot be specific about the destination',
      'Placing near the source might block traffic to other valid destinations',
      'Place near destination to avoid unintended traffic blocking',
    ],
    explanation: 'Standard ACLs should be placed close to the destination. Because they only filter by source IP (not destination), placing them near the source could block traffic to other valid destinations. Placement near the destination limits the impact to only the intended target.',
  },

  {
    id: 9, type: 'cli-input',
    prompt: 'Create an Extended ACL (110) to permit HTTP traffic (TCP port 80) from the 192.168.1.0/24 network to any destination.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 80',
    acceptedAnswers: [
      'access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 80',
      'access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq www',
    ],
    hints: [
      'Extended ACLs use numbers 100–199 or 2000–2699',
      'Syntax: access-list [num] permit [protocol] [source] [wildcard] [destination] eq [port]',
      'HTTP = TCP port 80. Wildcard for /24 = 0.0.0.255',
    ],
    explanation: 'Extended ACL syntax: access-list [100–199] {permit|deny} [protocol] [source-IP] [wildcard] [dest-IP] [wildcard] eq [port]. Extended ACLs can match on source IP, destination IP, protocol, and port — much more granular than Standard ACLs.',
  },

  {
    id: 10, type: 'cli-input',
    prompt: 'Add an explicit deny-all rule to ACL 110 to block all other IP traffic.',
    terminalPrompt: 'Router(config)#',
    expectedAnswer: 'access-list 110 deny ip any any',
    acceptedAnswers: ['access-list 110 deny ip any any'],
    hints: [
      'Use "ip" as the protocol to match all IP traffic',
      'Use "any any" to match any source and any destination',
      'Command: access-list 110 deny ip any any',
    ],
    explanation: 'access-list 110 deny ip any any adds an explicit deny for all IP traffic. While the implicit deny would handle this automatically, adding it explicitly makes the policy visible in the running configuration and makes the intent clear.',
  },

  {
    id: 11, type: 'multiple-choice',
    prompt: 'Where should Extended ACLs be placed for best practice?',
    options: [
      { key: 'A', text: 'Close to the source — Extended ACLs can be very specific' },
      { key: 'B', text: 'Close to the destination — same as Standard ACLs' },
      { key: 'C', text: 'Anywhere — Extended ACLs work the same regardless of placement' },
      { key: 'D', text: 'Only on switches — Extended ACLs cannot be applied on routers' },
    ],
    correctAnswer: 'A',
    hints: [
      'Extended ACLs can specify source AND destination',
      'Blocking early saves bandwidth — traffic is stopped before it travels far',
      'Place near source to stop unwanted traffic before it consumes resources',
    ],
    explanation: 'Extended ACLs should be placed close to the source. Because they can match on both source AND destination IP, placing them near the source blocks unwanted traffic early — preventing it from using network bandwidth before being dropped.',
  },

  {
    id: 12, type: 'troubleshooting',
    prompt: 'A user reports they cannot reach the server. The ACL on the router contains:\n\naccess-list 10 deny 192.168.1.0 0.0.0.255\naccess-list 10 permit any\n\nWhat is causing the issue?',
    options: [
      { key: 'A', text: 'The permit any rule is missing — all traffic is denied by default' },
      { key: 'B', text: 'The entire 192.168.1.0/24 network is denied, not just one host' },
      { key: 'C', text: 'ACL 10 is not applied to any interface — it has no effect' },
      { key: 'D', text: 'The deny rule should come after the permit any rule' },
    ],
    correctAnswer: 'B',
    hints: [
      'Look at the wildcard mask: 0.0.0.255 means all hosts in the /24 subnet are matched',
      'The intent was to block one host — but the wildcard mask is too broad',
      'To block only one host: use 0.0.0.0 wildcard or the "host" keyword',
    ],
    explanation: 'The wildcard mask 0.0.0.255 matches ALL hosts in the 192.168.1.0/24 network — not just one host. To deny a single host, the wildcard should be 0.0.0.0 (or use "host 192.168.1.50"). This common mistake blocks the entire subnet.',
  },

  {
    id: 13, type: 'troubleshooting',
    prompt: 'An ACL contains only one rule:\n\naccess-list 10 deny 192.168.1.50\n\nA user at 192.168.1.100 cannot reach the server either. Why?',
    options: [
      { key: 'A', text: 'The deny rule accidentally matches 192.168.1.100 due to the wildcard' },
      { key: 'B', text: 'There is no permit rule — the implicit deny blocks ALL other traffic' },
      { key: 'C', text: 'ACL number 10 is reserved and cannot be used for deny rules' },
      { key: 'D', text: 'The ACL needs to be applied outbound instead of inbound' },
    ],
    correctAnswer: 'B',
    hints: [
      'Every ACL has an implicit deny at the end',
      'There is no "permit any" rule — so what happens to 192.168.1.100?',
      'No match = implicit deny — ALL traffic is blocked except what is explicitly permitted',
    ],
    explanation: 'The ACL only has one explicit deny rule. After denying 192.168.1.50, all other traffic hits the implicit deny at the end of the ACL — including 192.168.1.100. A "permit any" rule must be added to allow all other traffic.',
  },

  {
    id: 14, type: 'topology-reasoning',
    prompt: 'An ACL is configured as:\n\naccess-list 10 permit 192.168.1.10\naccess-list 10 deny any\n\nA packet arrives with source IP 192.168.1.10. What happens to this packet?',
    options: [
      { key: 'A', text: 'Denied — the deny any rule at the end blocks all traffic' },
      { key: 'B', text: 'Permitted — the first rule matches and processing stops' },
      { key: 'C', text: 'Forwarded randomly — both rules apply and the result is unpredictable' },
      { key: 'D', text: 'Dropped silently — the router logs the event without forwarding' },
    ],
    correctAnswer: 'B',
    hints: [
      'ACLs process rules top to bottom and stop at the first match',
      'Source IP 192.168.1.10 matches the very first rule — permit 192.168.1.10',
      'First match wins — processing stops and the permit action is applied',
    ],
    explanation: 'The packet from 192.168.1.10 matches the first rule (permit 192.168.1.10) and is immediately permitted. ACL processing stops at the first match — the deny any rule at the bottom is never reached for this packet. First match wins.',
  },

  {
    id: 15, type: 'sequencing',
    prompt: 'Place the ACL packet processing steps in the correct order:',
    shuffledItems: ['Apply action (permit or deny)', 'Stop processing', 'Compare packet to current rule', 'Check next rule if no match'],
    correctOrder: ['Compare packet to current rule', 'Apply action (permit or deny)', 'Stop processing', 'Check next rule if no match'],
    hints: [
      'First, compare the packet against the current ACL rule',
      'If the packet matches — apply the action and stop',
      'If no match — move to the next rule and repeat',
    ],
    explanation: 'ACL processing: 1) Compare packet to the current rule. 2) If matched → apply action (permit/deny) and stop processing. 3) If not matched → move to the next rule and repeat. If no rules match, the implicit deny is applied.',
  },
]

export const LAB16_COMPLETION = {
  conceptMastered: 'ACL Fundamentals',
  summary:
    'You successfully configured and analyzed ACL behavior, including rule processing logic, placement strategy, and traffic filtering.',
  masteredPoints: [
    'ACLs filter traffic using permit and deny rules',
    'Top-down processing — first match wins, then stops',
    'Implicit deny at the end of every ACL — blocks unmatched traffic',
    'Standard ACL — filters source IP only (place near destination)',
    'Extended ACL — filters source, destination, protocol, port (place near source)',
    'ip access-group [ACL] {in|out} applies ACL to interface',
    'Wildcard masks identify which bits must match in ACL rules',
    'Always add permit any if you want non-denied traffic to pass',
  ],
  reviewIfNeeded: [
    { id: '72', title: 'ACL Fundamentals' },
    { id: '73', title: 'Standard ACLs' },
    { id: '74', title: 'Extended ACLs' },
  ],
  nextLab: {
    id: 'lab17',
    title: 'Lab 17 – Port Security and Wireless Basics',
  },
}
