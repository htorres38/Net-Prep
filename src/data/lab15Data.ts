
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
  2:  ['NTP Server', 'Router'],
  3:  ['NTP Server', 'Router'],
  11: ['Router', 'Switch'],
  12: ['NTP Server', 'Router'],
}

export const LAB15_META = {
  id: 'lab15',
  title: 'NTP, Syslog, SNMP, CDP, and LLDP',
  difficulty: 'Intermediate' as const,
  estimatedTime: '40–50 min',
  skillsTested: [
    'Understand NTP time synchronization',
    'Identify Syslog purpose and severity levels',
    'Understand SNMP architecture and behavior',
    'Identify SNMP polling vs traps',
    'Analyze device discovery protocols',
    'Differentiate CDP vs LLDP',
    'Interpret CLI output for management protocols',
  ],
  lessonsReinforced: [
    { id: '67', title: 'NTP Fundamentals' },
    { id: '68', title: 'Syslog Fundamentals' },
    { id: '69', title: 'SNMP Fundamentals' },
    { id: '70', title: 'QoS Basics' },
    { id: '71', title: 'CDP and LLDP' },
  ],
}

export const LAB15_SCENARIO = {
  context: 'A network administrator is troubleshooting a production network with poor visibility.',
  reports: [
    'Log entries appear out of chronological order — timestamps are inconsistent',
    'No centralized logging visibility across all devices',
    'Network devices are not being monitored for performance or alerts',
    'Device-to-device connections are unclear — no discovery protocol output',
  ],
  challenge: 'Analyze management protocols to identify what is missing, understand how each protocol works, and improve network visibility.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What does NTP stand for?',
    options: [
      { key: 'A', text: 'Network Transfer Protocol' },
      { key: 'B', text: 'Network Time Protocol' },
      { key: 'C', text: 'Network Timing Process' },
      { key: 'D', text: 'Network Transmission Program' },
    ],
    correctAnswer: 'B',
    hints: [
      'NTP synchronizes clocks across network devices',
      'Time synchronization is critical for log correlation',
      'Network Time Protocol',
    ],
    explanation: 'NTP (Network Time Protocol) synchronizes the clocks of network devices to a reliable time source. Accurate time is critical for log correlation, security analysis, and certificate validation.',
  },

  {
    id: 2, type: 'conceptual',
    prompt: 'Why is accurate time synchronization important in a network?',
    options: [
      { key: 'A', text: 'To increase overall network bandwidth and throughput' },
      { key: 'B', text: 'To ensure log entries, security events, and audit trails are in correct chronological order' },
      { key: 'C', text: 'To allow network devices to communicate at faster speeds' },
      { key: 'D', text: 'To synchronize VLAN configurations automatically across all switches' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about troubleshooting a security incident — you need logs in the right order',
      'If clocks are off by minutes or hours, correlating events becomes impossible',
      'NTP ensures every device agrees on what time it is',
    ],
    explanation: 'Accurate timestamps are critical for log correlation, security incident investigation, and compliance auditing. Without NTP, log entries from different devices may be out of order, making troubleshooting and forensics unreliable.',
  },

  {
    id: 3, type: 'topology-reasoning',
    prompt: 'A router synchronizes its clock directly from a stratum 1 NTP server (like the one in the topology). What stratum level does the router become?',
    options: [
      { key: 'A', text: 'Stratum 0 — the highest accuracy level' },
      { key: 'B', text: 'Stratum 1 — same as its time source' },
      { key: 'C', text: 'Stratum 2 — one level below its time source' },
      { key: 'D', text: 'Stratum 3 — two levels below its time source' },
    ],
    correctAnswer: 'C',
    hints: [
      'Stratum indicates how many hops away from the reference clock',
      'Stratum 0 = atomic/GPS reference clock (not a network device)',
      'Each NTP hop adds one stratum level',
    ],
    explanation: 'NTP uses stratum levels to indicate clock accuracy. Stratum 0 = atomic/GPS reference (not on the network). A device that syncs directly from a stratum 1 server becomes stratum 2. Each hop down adds one stratum level.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'What is the purpose of Syslog in a network?',
    options: [
      { key: 'A', text: 'Automatically assign IP addresses to devices as they join the network' },
      { key: 'B', text: 'Translate domain names to IP addresses for web browsing' },
      { key: 'C', text: 'Collect and centrally store log messages from network devices' },
      { key: 'D', text: 'Route packets between different network segments' },
    ],
    correctAnswer: 'C',
    hints: [
      'Without centralized logging, you\'d have to check each device separately',
      'Syslog sends log messages to a central server',
      'Syslog = system logging protocol',
    ],
    explanation: 'Syslog centralizes log messages from routers, switches, firewalls, and servers to a Syslog server. Administrators can review all device logs in one place for troubleshooting, security monitoring, and compliance.',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'Which Syslog severity level indicates the MOST critical condition?',
    options: [
      { key: 'A', text: 'Level 0 — Emergency (system is unusable)' },
      { key: 'B', text: 'Level 3 — Error' },
      { key: 'C', text: 'Level 5 — Notice' },
      { key: 'D', text: 'Level 7 — Debug (most verbose)' },
    ],
    correctAnswer: 'A',
    hints: [
      'Syslog severity levels run from 0 to 7',
      'Lower number = more critical',
      'Level 0 = Emergency — the system is completely unusable',
    ],
    explanation: 'Syslog uses severity levels 0–7. Level 0 (Emergency) is the most critical — the system is unusable. Level 7 (Debug) is the least critical and most verbose. Lower numbers always indicate more serious conditions.',
  },

  {
    id: 6, type: 'conceptual',
    prompt: 'What is the primary purpose of SNMP (Simple Network Management Protocol)?',
    options: [
      { key: 'A', text: 'Assign IP addresses to network devices automatically' },
      { key: 'B', text: 'Synchronize device clocks across the network' },
      { key: 'C', text: 'Monitor network devices and collect performance data centrally' },
      { key: 'D', text: 'Translate domain names to IP addresses for clients' },
    ],
    correctAnswer: 'C',
    hints: [
      'SNMP allows a central management station to query device data',
      'It can collect CPU usage, interface stats, error counters, and more',
      'SNMP = Simple Network Management Protocol',
    ],
    explanation: 'SNMP allows a central Network Management System (NMS) to monitor network devices by querying performance data (CPU, memory, interface errors, bandwidth usage) and receive alerts when issues occur.',
  },

  {
    id: 7, type: 'multiple-choice',
    prompt: 'Which SNMP component stores structured information about a network device\'s capabilities and statistics?',
    options: [
      { key: 'A', text: 'DNS — Domain Name System' },
      { key: 'B', text: 'MIB — Management Information Base' },
      { key: 'C', text: 'ARP — Address Resolution Protocol' },
      { key: 'D', text: 'VLAN — Virtual Local Area Network' },
    ],
    correctAnswer: 'B',
    hints: [
      'SNMP has three main components: Manager, Agent, and this database',
      'MIB organizes device data in a structured tree format',
      'MIB = Management Information Base',
    ],
    explanation: 'The MIB (Management Information Base) is a structured database on every SNMP-managed device that organizes device data (interface stats, CPU, error counters) into a hierarchical tree. The SNMP manager queries specific MIB objects using OIDs.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'What is the difference between SNMP polling and SNMP traps?',
    options: [
      { key: 'A', text: 'Polling sends unsolicited alerts; traps request data from devices' },
      { key: 'B', text: 'Traps request data from the manager; polling sends data automatically' },
      { key: 'C', text: 'Polling: the manager requests data; traps: the device sends alerts proactively' },
      { key: 'D', text: 'There is no functional difference between polling and traps' },
    ],
    correctAnswer: 'C',
    hints: [
      'Polling = manager asks the device for data on a schedule',
      'Traps = device notifies the manager when something important happens',
      'Traps are event-driven; polling is scheduled',
    ],
    explanation: 'SNMP polling: the manager periodically queries the device for statistics. SNMP traps: the device proactively sends alerts to the manager when a threshold is crossed or an event occurs (like an interface going down), without being asked.',
  },

  {
    id: 9, type: 'multiple-choice',
    prompt: 'What does CDP stand for?',
    options: [
      { key: 'A', text: 'Cisco Data Protocol' },
      { key: 'B', text: 'Cisco Discovery Protocol' },
      { key: 'C', text: 'Central Device Protocol' },
      { key: 'D', text: 'Cisco Distribution Process' },
    ],
    correctAnswer: 'B',
    hints: [
      'CDP is a Cisco proprietary protocol',
      'It discovers directly connected neighbors',
      'Cisco Discovery Protocol',
    ],
    explanation: 'CDP (Cisco Discovery Protocol) is a Cisco proprietary Layer 2 protocol that runs on all Cisco devices. It advertises device information (hostname, model, IOS version, IP address, port ID) to directly connected Cisco neighbors.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'Which device discovery protocol is vendor-neutral and works across multiple manufacturers?',
    options: [
      { key: 'A', text: 'CDP — Cisco Discovery Protocol (Cisco proprietary)' },
      { key: 'B', text: 'LLDP — Link Layer Discovery Protocol (IEEE 802.1AB)' },
      { key: 'C', text: 'SNMP — Simple Network Management Protocol' },
      { key: 'D', text: 'DHCP — Dynamic Host Configuration Protocol' },
    ],
    correctAnswer: 'B',
    hints: [
      'CDP is Cisco-only — what is the open standard equivalent?',
      'IEEE 802.1AB defines the vendor-neutral discovery protocol',
      'LLDP = Link Layer Discovery Protocol',
    ],
    explanation: 'LLDP (Link Layer Discovery Protocol, IEEE 802.1AB) is the vendor-neutral equivalent of CDP. It works across Cisco, Juniper, HP, and other vendors. In multi-vendor environments, LLDP is preferred over CDP.',
  },

  {
    id: 11, type: 'topology-reasoning',
    prompt: 'Analyze this CDP output. What does it show?',
    terminalOutput:
      'Switch# show cdp neighbors\n\n' +
      'Device ID     Local Interface    Holdtme    Port ID\n' +
      'SwitchB       Gi0/1             157        Gi0/2',
    options: [
      { key: 'A', text: 'The IP routing table entry for SwitchB' },
      { key: 'B', text: 'The VLAN database configured on SwitchB' },
      { key: 'C', text: 'SwitchB is directly connected via local port Gi0/1 to SwitchB\'s Gi0/2' },
      { key: 'D', text: 'A NAT translation for SwitchB\'s management IP' },
    ],
    correctAnswer: 'C',
    hints: [
      'CDP shows directly connected neighbors only — not multi-hop',
      'Local Interface = the port on THIS switch',
      'Port ID = the port on the NEIGHBOR switch',
    ],
    explanation: 'This CDP output shows that SwitchB is directly connected — reachable through local interface Gi0/1 and connected to SwitchB\'s Gi0/2 port. CDP only shows directly connected (one-hop) neighbors, not multi-hop devices.',
  },

  {
    id: 12, type: 'cli-input',
    prompt: 'Enter the command to verify NTP synchronization status on a router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show ntp status',
    acceptedAnswers: ['show ntp status', 'sh ntp status'],
    hints: [
      'This command shows whether the router is synchronized to an NTP server',
      'It displays the reference clock and stratum level',
      'Command: show ntp status',
    ],
    explanation: 'show ntp status displays the NTP synchronization state (synchronized or unsynchronized), the stratum level, the reference clock address, and the polling interval. "Clock is synchronized" confirms NTP is working.',
  },

  {
    id: 13, type: 'cli-input',
    prompt: 'Enter the command to view Syslog messages stored in the router\'s local buffer.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show logging',
    acceptedAnswers: ['show logging', 'sh logging'],
    hints: [
      'This command shows all locally buffered log messages',
      'It also shows the current logging configuration',
      'Command: show logging',
    ],
    explanation: 'show logging displays all log messages in the local buffer along with the logging configuration (severity level, destination, buffer size). Essential for reviewing recent device events and troubleshooting.',
  },

  {
    id: 14, type: 'cli-input',
    prompt: 'Enter the command to view the current SNMP configuration and statistics on a router.',
    terminalPrompt: 'Router#',
    expectedAnswer: 'show snmp',
    acceptedAnswers: ['show snmp', 'sh snmp'],
    hints: [
      'This command displays SNMP configuration and counters',
      'It shows whether SNMP is enabled and packet statistics',
      'Command: show snmp',
    ],
    explanation: 'show snmp displays the SNMP configuration including community strings, trap destinations, and packet statistics (input/output packets, errors). Use this to verify SNMP is active and communicating with the NMS.',
  },
]

export const LAB15_COMPLETION = {
  conceptMastered: 'Network Management Protocols',
  summary:
    'You successfully analyzed how network devices are synchronized, logged, monitored, and discovered using management protocols.',
  masteredPoints: [
    'NTP synchronizes device clocks — critical for log correlation',
    'Stratum levels indicate distance from the reference clock',
    'Syslog centralizes log collection with severity levels 0–7',
    'SNMP monitors device health using polling and traps',
    'MIB (Management Information Base) stores structured device data',
    'CDP (Cisco proprietary) vs LLDP (IEEE open standard) discovery',
    'CDP/LLDP reveal directly connected neighbor information',
    'CLI verification: show ntp status, show logging, show snmp, show cdp neighbors',
  ],
  reviewIfNeeded: [
    { id: '67', title: 'NTP Fundamentals' },
    { id: '68', title: 'Syslog Fundamentals' },
    { id: '69', title: 'SNMP Fundamentals' },
    { id: '70', title: 'QoS Basics' },
    { id: '71', title: 'CDP and LLDP' },
  ],
  nextLab: {
    id: 'lab16',
    title: 'Lab 16 – ACL Fundamentals',
  },
}
