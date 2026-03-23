
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
  2:  ['Switch', 'Authorized PC'],
  3:  ['Switch'],
  4:  ['Switch'],
  5:  ['Switch'],
  6:  ['Switch'],
  7:  ['Switch'],
  9:  ['Access Point', 'Wireless Clients'],
  10: ['WLC', 'Access Point'],
  11: ['Access Point'],
  12: ['WLC', 'Access Point'],
}

export const LAB17_META = {
  id: 'lab17',
  title: 'Port Security and Wireless Basics',
  difficulty: 'Intermediate–Advanced' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Configure and verify Port Security',
    'Identify secure MAC address behavior',
    'Understand violation modes (protect, restrict, shutdown)',
    'Recognize err-disabled state and recovery',
    'Understand wireless fundamentals (802.11, APs)',
    'Identify wireless architecture components (AP, WLC)',
    'Understand CAPWAP purpose',
    'Identify wireless security protocols (WPA2, WPA3, 802.1X)',
  ],
  lessonsReinforced: [
    { id: '75', title: 'Port Security' },
    { id: '76', title: 'Wireless Fundamentals' },
    { id: '77', title: 'Wireless Architecture' },
    { id: '78', title: 'Wireless Security' },
  ],
}

export const LAB17_SCENARIO = {
  context: 'A company is improving network security and expanding wireless connectivity.',
  reports: [
    'Unauthorized devices are connecting to switch ports',
    'Wireless network roles and components are unclear in the growing office',
    'Inconsistent wireless security policies across access points',
  ],
  challenge: 'Secure switch ports using Port Security, analyze wireless network components, and identify proper wireless security methods.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What does Port Security primarily use to identify and control devices?',
    options: [
      { key: 'A', text: 'IP address — assigned by the DHCP server' },
      { key: 'B', text: 'MAC address — burned into the network interface card' },
      { key: 'C', text: 'VLAN ID — assigned by the switch administrator' },
      { key: 'D', text: 'Port number — the TCP/UDP port of the application' },
    ],
    correctAnswer: 'B',
    hints: [
      'Port Security operates at Layer 2 — not Layer 3',
      'What Layer 2 identifier is unique to each network interface?',
      'MAC address = the hardware address of the device',
    ],
    explanation: 'Port Security uses MAC addresses to control which devices can connect to a switch port. It operates at Layer 2. Administrators configure the allowed MAC addresses, and the switch blocks any device whose MAC address does not match.',
  },

  {
    id: 2, type: 'cli-input',
    prompt: 'Enable Port Security on switch interface G0/1.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport port-security',
    acceptedAnswers: ['switchport port-security'],
    hints: [
      'The interface must be set to access mode before enabling port-security',
      'The command to activate the feature is straightforward',
      'Command: switchport port-security',
    ],
    explanation: 'switchport port-security activates Port Security on an access-mode interface. Once enabled, the interface begins tracking MAC addresses and enforcing the configured maximum and violation policy.',
  },

  {
    id: 3, type: 'cli-input',
    prompt: 'Set the maximum number of allowed MAC addresses to 1 on the current interface.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport port-security maximum 1',
    acceptedAnswers: ['switchport port-security maximum 1'],
    hints: [
      'Use the maximum keyword to limit the number of devices',
      'Limiting to 1 ensures only one device can connect at a time',
      'Command: switchport port-security maximum 1',
    ],
    explanation: 'switchport port-security maximum [number] limits how many unique MAC addresses the port will learn or allow. Setting it to 1 ensures only a single device can be connected. If a second device connects, the violation action is triggered.',
  },

  {
    id: 4, type: 'cli-input',
    prompt: 'Enable sticky MAC learning — automatically learn and save the MAC address to the configuration.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport port-security mac-address sticky',
    acceptedAnswers: ['switchport port-security mac-address sticky'],
    hints: [
      'Sticky learning automatically saves learned MAC addresses to running-config',
      'No need to manually enter the MAC address',
      'Command: switchport port-security mac-address sticky',
    ],
    explanation: 'switchport port-security mac-address sticky enables sticky learning — the switch dynamically learns the MAC address of the first connected device and saves it as a secure address in the running configuration. This address persists if saved with write memory.',
  },

  {
    id: 5, type: 'cli-input',
    prompt: 'Set the Port Security violation mode to shutdown.',
    terminalPrompt: 'Switch(config-if)#',
    expectedAnswer: 'switchport port-security violation shutdown',
    acceptedAnswers: ['switchport port-security violation shutdown'],
    hints: [
      'Shutdown is the default violation mode in most Cisco configurations',
      'Use the violation keyword followed by the mode name',
      'Command: switchport port-security violation shutdown',
    ],
    explanation: 'switchport port-security violation {shutdown|restrict|protect} sets the action taken when a violation occurs. Shutdown (default) disables the port and places it in err-disabled state. Restrict drops violation traffic and logs it. Protect silently drops violation traffic.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'What happens to a switch port when a Port Security violation occurs in shutdown mode?',
    options: [
      { key: 'A', text: 'Only the violating traffic is ignored — other traffic continues normally' },
      { key: 'B', text: 'The port is disabled and placed in err-disabled state' },
      { key: 'C', text: 'The VLAN assignment is changed to an isolated VLAN' },
      { key: 'D', text: 'The switch assigns a new IP address to the violating device' },
    ],
    correctAnswer: 'B',
    hints: [
      'Shutdown mode is the strictest violation response',
      'The entire port goes down — not just filtered traffic',
      'The port enters err-disabled and must be manually recovered',
    ],
    explanation: 'In shutdown violation mode, the port is immediately disabled and placed in err-disabled state. No traffic can pass. To recover, an administrator must manually shut down the interface (shutdown) and re-enable it (no shutdown). A log message and SNMP trap are also generated.',
  },

  {
    id: 7, type: 'troubleshooting',
    prompt: 'A switch port shows as err-disabled in the output of show interfaces. What is the most likely cause?',
    options: [
      { key: 'A', text: 'The cable is physically disconnected from the switch port' },
      { key: 'B', text: 'A Port Security violation was triggered by an unauthorized MAC address' },
      { key: 'C', text: 'The VLAN assigned to this port does not exist in the VLAN database' },
      { key: 'D', text: 'The switch needs to be rebooted to clear the interface state' },
    ],
    correctAnswer: 'B',
    hints: [
      'err-disabled is not a physical state — the cable may still be connected',
      'What feature automatically shuts down a port upon unauthorized access?',
      'Port Security in shutdown mode places violated ports in err-disabled state',
    ],
    explanation: 'err-disabled is most commonly caused by Port Security in shutdown mode when an unauthorized MAC address is detected. Other causes include BPDU Guard violations and other security features. Recovery requires "shutdown" then "no shutdown" on the interface.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'Which IEEE standard defines Wi-Fi (wireless LAN) communication?',
    options: [
      { key: 'A', text: '802.3 — Ethernet wired LAN standard' },
      { key: 'B', text: '802.1Q — VLAN trunking standard' },
      { key: 'C', text: '802.11 — Wireless LAN (Wi-Fi) standard' },
      { key: 'D', text: '802.15 — Bluetooth personal area network standard' },
    ],
    correctAnswer: 'C',
    hints: [
      'Wi-Fi is defined by a specific IEEE 802 series standard',
      '802.11 has variants like 802.11a/b/g/n/ac/ax',
      '802.11 = the wireless LAN family of standards',
    ],
    explanation: 'IEEE 802.11 is the standard that defines wireless LAN (Wi-Fi) communication. Variants include 802.11b (2.4 GHz/11 Mbps), 802.11g (54 Mbps), 802.11n (300+ Mbps), 802.11ac (Wi-Fi 5), and 802.11ax (Wi-Fi 6).',
  },

  {
    id: 9, type: 'conceptual',
    prompt: 'What is the role of an Access Point (AP) in a wireless network?',
    options: [
      { key: 'A', text: 'Routes packets between different IP subnets using a routing table' },
      { key: 'B', text: 'Bridges wireless clients to the wired network infrastructure' },
      { key: 'C', text: 'Assigns IP addresses to wireless clients via DHCP' },
      { key: 'D', text: 'Encrypts all network traffic between the ISP and end users' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think of the AP as a bridge between two different media types',
      'Wireless clients cannot connect directly to the switch — what connects them?',
      'AP = the wireless bridge between Wi-Fi clients and the wired LAN',
    ],
    explanation: 'An Access Point (AP) bridges wireless clients (laptops, phones) to the wired network. It operates at Layer 2, connecting 802.11 wireless frames to the 802.3 Ethernet network. The AP itself does not route or assign IP addresses — it only provides wireless connectivity.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'Which device centrally manages multiple Access Points in an enterprise wireless network?',
    options: [
      { key: 'A', text: 'A Layer 2 switch — it controls all connected APs directly' },
      { key: 'B', text: 'A router — it routes traffic from each AP to the internet' },
      { key: 'C', text: 'A Wireless LAN Controller (WLC) — centralized AP management' },
      { key: 'D', text: 'A firewall — it authenticates wireless clients before they connect' },
    ],
    correctAnswer: 'C',
    hints: [
      'Large enterprise networks need centralized control for many APs',
      'WLC = the controller that manages AP configuration, firmware, and policy',
      'Wireless LAN Controller (WLC) is the centralized management device',
    ],
    explanation: 'A Wireless LAN Controller (WLC) centrally manages all lightweight APs in an enterprise network. It handles AP configuration, firmware updates, RF management, client authentication, and roaming. APs communicate with the WLC using CAPWAP tunnels.',
  },

  {
    id: 11, type: 'multiple-choice',
    prompt: 'Which type of Access Point requires a WLC (Wireless LAN Controller) to operate?',
    options: [
      { key: 'A', text: 'Autonomous AP — self-contained, manages its own configuration' },
      { key: 'B', text: 'Lightweight AP — offloads management to a WLC' },
      { key: 'C', text: 'Bridge AP — connects two wired networks wirelessly' },
      { key: 'D', text: 'Repeater AP — extends wireless coverage without a WLC' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think of "lightweight" as meaning the AP does less work on its own',
      'A lightweight AP cannot function without its controller',
      'WLC-dependent = Lightweight AP (LWAP)',
    ],
    explanation: 'Lightweight APs (LWAPs) offload all management, security, and control functions to a Wireless LAN Controller. They cannot operate independently. Autonomous APs are self-contained and do not require a WLC — each manages its own configuration.',
  },

  {
    id: 12, type: 'multiple-choice',
    prompt: 'Which protocol do lightweight Access Points use to communicate with a Wireless LAN Controller?',
    options: [
      { key: 'A', text: 'ARP — Address Resolution Protocol' },
      { key: 'B', text: 'OSPF — Open Shortest Path First routing protocol' },
      { key: 'C', text: 'CAPWAP — Control and Provisioning of Wireless Access Points' },
      { key: 'D', text: 'DHCP — Dynamic Host Configuration Protocol' },
    ],
    correctAnswer: 'C',
    hints: [
      'This protocol creates a tunnel between lightweight APs and the WLC',
      'CAPWAP handles both control messages and data forwarding',
      'CAPWAP = Control And Provisioning of Wireless Access Points',
    ],
    explanation: 'CAPWAP (Control and Provisioning of Wireless Access Points) is the protocol that lightweight APs use to communicate with a WLC. It creates an encrypted tunnel for control traffic (management/config) and optionally for data traffic. CAPWAP uses UDP ports 5246 (control) and 5247 (data).',
  },

  {
    id: 13, type: 'multiple-choice',
    prompt: 'Which wireless security protocol uses AES encryption and is the current enterprise standard?',
    options: [
      { key: 'A', text: 'WEP — Wired Equivalent Privacy (deprecated, easily cracked)' },
      { key: 'B', text: 'WPA2 — Wi-Fi Protected Access 2 with AES/CCMP' },
      { key: 'C', text: 'Telnet — remote management protocol' },
      { key: 'D', text: 'FTP — File Transfer Protocol' },
    ],
    correctAnswer: 'B',
    hints: [
      'WEP is broken — never use it. What replaced WPA?',
      'AES = Advanced Encryption Standard — strong modern encryption',
      'WPA2 uses AES with CCMP for wireless encryption',
    ],
    explanation: 'WPA2 (Wi-Fi Protected Access 2) uses AES with CCMP (Counter/CBC-MAC Protocol) for strong encryption. It replaced WPA (which used TKIP) and WEP (which had critical weaknesses). WPA3 is the latest standard with even stronger security.',
  },

  {
    id: 14, type: 'multiple-choice',
    prompt: 'What does 802.1X provide in a wireless or wired network?',
    options: [
      { key: 'A', text: 'Dynamic routing between network segments' },
      { key: 'B', text: 'Port-based Network Access Control — authenticates users and devices' },
      { key: 'C', text: 'VLAN tagging on trunk ports between switches' },
      { key: 'D', text: 'Traffic encryption between the client and access point' },
    ],
    correctAnswer: 'B',
    hints: [
      '802.1X is an authentication framework — not encryption or routing',
      'It verifies the identity of users or devices before granting network access',
      '802.1X = port-based authentication using EAP and a RADIUS server',
    ],
    explanation: '802.1X is an IEEE standard for port-based Network Access Control (PNAC). It authenticates devices or users using EAP (Extensible Authentication Protocol) with a RADIUS server before granting access. Used in WPA2-Enterprise and wired 802.1X deployments.',
  },

  {
    id: 15, type: 'troubleshooting',
    prompt: 'Wireless users can see the company Wi-Fi SSID but cannot connect to the network. What is the most likely cause?',
    options: [
      { key: 'A', text: 'VLAN misconfiguration — the wireless VLAN is not trunked to the WLC' },
      { key: 'B', text: 'Authentication failure — the client cannot complete the WPA2 or 802.1X process' },
      { key: 'C', text: 'Routing failure — the default route on the router is missing' },
      { key: 'D', text: 'NAT failure — the router is not translating wireless client addresses' },
    ],
    correctAnswer: 'B',
    hints: [
      'If the SSID is visible, the AP is broadcasting correctly — it is not an RF issue',
      'Can see = AP is working. Cannot connect = what happens after clicking the SSID?',
      'Authentication (WPA2 password, 802.1X certificate) is the most common failure point',
    ],
    explanation: 'If the SSID is visible but clients cannot connect, the AP is functioning. The most common cause is authentication failure — an incorrect WPA2 password, expired 802.1X certificate, or RADIUS server unreachable. The client can see the network but fails the security handshake.',
  },
]

export const LAB17_COMPLETION = {
  conceptMastered: 'Port Security and Wireless Basics',
  summary:
    'You successfully secured switch ports using Port Security and analyzed wireless network architecture and security protocols.',
  masteredPoints: [
    'Port Security uses MAC addresses to control device access at Layer 2',
    'Sticky learning auto-saves learned MACs to running configuration',
    'Shutdown mode places violated ports in err-disabled state',
    'Violation modes: shutdown (default), restrict, protect',
    'IEEE 802.11 defines wireless LAN (Wi-Fi) standards',
    'Access Points bridge wireless clients to the wired network',
    'Lightweight APs require a WLC; Autonomous APs are self-managing',
    'CAPWAP creates tunnels between lightweight APs and the WLC',
    'WPA2 uses AES/CCMP encryption; 802.1X provides port-based authentication',
  ],
  reviewIfNeeded: [
    { id: '75', title: 'Port Security' },
    { id: '76', title: 'Wireless Fundamentals' },
    { id: '77', title: 'Wireless Architecture' },
    { id: '78', title: 'Wireless Security' },
  ],
  nextLab: {
    id: 'lab18',
    title: 'Lab 18 – Network Automation and Programmability',
  },
}
