
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
  1:  ['Automation Server'],
  2:  ['Automation Server', 'Router', 'Switch', 'AP'],
  7:  ['Automation Server', 'Router'],
  11: ['Automation Server', 'Router'],
  12: ['Automation Server'],
  13: ['Automation Server'],
}

export const LAB18_META = {
  id: 'lab18',
  title: 'Network Automation and Programmability',
  difficulty: 'Intermediate' as const,
  estimatedTime: '35–45 min',
  skillsTested: [
    'Understand network automation concepts',
    'Identify benefits of automation vs manual configuration',
    'Recognize structured data formats (JSON, XML, YAML)',
    'Interpret JSON output',
    'Understand REST API behavior and HTTP methods',
    'Identify API request/response flow',
    'Recognize automation tools (Ansible, Puppet, Chef)',
    'Understand how automation scales networks',
  ],
  lessonsReinforced: [
    { id: '79', title: 'Network Automation Overview' },
    { id: '80', title: 'JSON, XML, YAML' },
    { id: '81', title: 'REST APIs and Programmability' },
    { id: '82', title: 'Configuration Management Tools' },
  ],
}

export const LAB18_SCENARIO = {
  context: 'A company network has grown significantly and engineers are struggling to manage it manually.',
  reports: [
    'Manual configuration is taking too long across hundreds of devices',
    'Inconsistent configurations are causing connectivity issues',
    'Frequent human errors during routine configuration changes',
    'Engineers need to understand automation tools and data formats',
  ],
  challenge: 'Analyze automation concepts, identify structured data formats, and understand how APIs and tools interact with network devices.',
}

export const QUESTIONS: Question[] = [
  {
    id: 1, type: 'multiple-choice',
    prompt: 'What is network automation?',
    options: [
      { key: 'A', text: 'Replacing physical routers with virtual cloud-based routing' },
      { key: 'B', text: 'Using software to automatically configure and manage network devices' },
      { key: 'C', text: 'Increasing bandwidth capacity by adding additional hardware' },
      { key: 'D', text: 'Encrypting all network traffic to improve security' },
    ],
    correctAnswer: 'B',
    hints: [
      'Automation replaces manual CLI configuration with software-driven management',
      'Think about what tools like Ansible and Puppet do',
      'Automation = software managing network devices at scale',
    ],
    explanation: 'Network automation uses software to automatically configure, manage, monitor, and operate network devices — replacing or augmenting manual CLI work. Tools like Ansible, Puppet, and Chef interact with devices through APIs or SSH to deploy consistent configurations at scale.',
  },

  {
    id: 2, type: 'multiple-choice',
    prompt: 'Which is a key benefit of network automation over manual configuration?',
    options: [
      { key: 'A', text: 'Slower deployment — automation takes more time to set up' },
      { key: 'B', text: 'Increased human error — automation introduces new mistakes' },
      { key: 'C', text: 'Consistency — automation applies the same configuration every time' },
      { key: 'D', text: 'Reduced scalability — automation only works for small networks' },
    ],
    correctAnswer: 'C',
    hints: [
      'Think about what happens when a human manually configures 500 devices vs a script',
      'Automation is repeatable and free from typos',
      'Consistency = the same correct config applied identically every time',
    ],
    explanation: 'The primary benefit of automation is consistency — software applies configurations identically every time without typos or human variations. Other benefits include faster deployment, easier rollbacks, and scalability across thousands of devices.',
  },

  {
    id: 3, type: 'conceptual',
    prompt: 'Why is manual configuration not scalable in large networks?',
    options: [
      { key: 'A', text: 'Manual configuration only works on Cisco devices — not multi-vendor environments' },
      { key: 'B', text: 'It is too slow and error-prone — engineers cannot manually configure hundreds of devices efficiently' },
      { key: 'C', text: 'Manual configuration does not support modern protocols like OSPF or BGP' },
      { key: 'D', text: 'CLI commands are deprecated and being removed from modern devices' },
    ],
    correctAnswer: 'B',
    hints: [
      'Imagine configuring 1,000 devices one by one via CLI',
      'Each manual change is an opportunity for human error',
      'Large environments require speed and accuracy that humans alone cannot sustain',
    ],
    explanation: 'Manual configuration does not scale because it is slow (one device at a time), error-prone (human typos and missed steps), and inconsistent. In large environments with hundreds or thousands of devices, automation is essential for speed, accuracy, and operational efficiency.',
  },

  {
    id: 4, type: 'multiple-choice',
    prompt: 'Which data format uses key-value pairs enclosed in curly braces { }?',
    options: [
      { key: 'A', text: 'XML — uses angle-bracket tags like <tag>value</tag>' },
      { key: 'B', text: 'YAML — uses indentation and dashes for structure' },
      { key: 'C', text: 'JSON — uses key-value pairs in curly braces { }' },
      { key: 'D', text: 'SNMP — a management protocol, not a data format' },
    ],
    correctAnswer: 'C',
    hints: [
      'JSON uses { } and "key": "value" syntax',
      'You have probably seen JSON in web APIs and configuration files',
      'JSON = JavaScript Object Notation — curly braces + key-value pairs',
    ],
    explanation: 'JSON (JavaScript Object Notation) uses key-value pairs inside curly braces { }. Example: {"hostname": "Router1", "status": "up"}. JSON is the most common format for REST API responses and is human-readable and machine-parseable.',
  },

  {
    id: 5, type: 'multiple-choice',
    prompt: 'Which structured data format uses opening and closing tags like <hostname>Router1</hostname>?',
    options: [
      { key: 'A', text: 'JSON — uses key-value pairs in curly braces' },
      { key: 'B', text: 'XML — eXtensible Markup Language with tag-based structure' },
      { key: 'C', text: 'YAML — uses indentation and colons, no brackets' },
      { key: 'D', text: 'HTTP — the web transfer protocol, not a data format' },
    ],
    correctAnswer: 'B',
    hints: [
      'Think about HTML — XML is similar but used for data instead of web pages',
      'Tags come in pairs: <open> and </close>',
      'XML = eXtensible Markup Language — angle bracket tags',
    ],
    explanation: 'XML (eXtensible Markup Language) uses opening and closing tags to structure data: <tag>value</tag>. XML is verbose but self-describing. It is used in NETCONF and some legacy network management systems. YANG models are often represented in XML format.',
  },

  {
    id: 6, type: 'multiple-choice',
    prompt: 'Which data format uses indentation to define structure — no brackets or tags required?',
    options: [
      { key: 'A', text: 'JSON — uses curly braces { } and square brackets [ ]' },
      { key: 'B', text: 'XML — uses <opening> and </closing> tags' },
      { key: 'C', text: 'YAML — uses indentation and colons for human-readable structure' },
      { key: 'D', text: 'CLI — command-line text, not a structured data format' },
    ],
    correctAnswer: 'C',
    hints: [
      'YAML is known for being the most human-readable format',
      'Ansible playbooks are written in YAML',
      'YAML uses spaces/indentation — no braces, no tags',
    ],
    explanation: 'YAML (YAML Ain\'t Markup Language) uses indentation and colons to define structure. It is the most human-readable of the three formats. Ansible playbooks are written in YAML. Example: hostname: Router1 (no quotes, no brackets, just indentation).',
  },

  {
    id: 7, type: 'topology-reasoning',
    prompt: 'Analyze this JSON output from a network device API. What is the value of the "status" key?',
    terminalOutput:
      '{\n' +
      '  "hostname": "Router1",\n' +
      '  "interface": "GigabitEthernet0/1",\n' +
      '  "status": "up"\n' +
      '}',
    options: [
      { key: 'A', text: '"Router1" — the value of the hostname key' },
      { key: 'B', text: '"GigabitEthernet0/1" — the value of the interface key' },
      { key: 'C', text: '"up" — the value paired with the "status" key' },
      { key: 'D', text: 'null — the key exists but has no value assigned' },
    ],
    correctAnswer: 'C',
    hints: [
      'In JSON, each key is paired with a value using a colon: "key": "value"',
      'Find the "status" key and read the value to its right',
      '"status": "up" — the value is "up"',
    ],
    explanation: 'In JSON key-value syntax, "status": "up" means the key "status" has the value "up". JSON parsing always maps the key on the left of the colon to the value on the right. API responses commonly use JSON to return interface states, device info, and configuration data.',
  },

  {
    id: 8, type: 'multiple-choice',
    prompt: 'What does API stand for?',
    options: [
      { key: 'A', text: 'Automated Packet Interface' },
      { key: 'B', text: 'Application Programming Interface' },
      { key: 'C', text: 'Advanced Protocol Integration' },
      { key: 'D', text: 'Access Point Interface' },
    ],
    correctAnswer: 'B',
    hints: [
      'APIs allow software systems to communicate with each other',
      'REST APIs let applications talk to network devices over HTTP',
      'API = Application Programming Interface',
    ],
    explanation: 'API (Application Programming Interface) is a defined interface that allows two software systems to communicate. Network devices expose REST APIs that automation tools use to configure, monitor, and retrieve data — replacing or supplementing traditional CLI management.',
  },

  {
    id: 9, type: 'multiple-choice',
    prompt: 'Which protocol do REST APIs use to send and receive data?',
    options: [
      { key: 'A', text: 'ARP — Address Resolution Protocol' },
      { key: 'B', text: 'ICMP — Internet Control Message Protocol (ping)' },
      { key: 'C', text: 'HTTP/HTTPS — HyperText Transfer Protocol' },
      { key: 'D', text: 'OSPF — Open Shortest Path First routing protocol' },
    ],
    correctAnswer: 'C',
    hints: [
      'REST APIs work over the web — what protocol powers the web?',
      'REST uses the same protocol as web browsers',
      'HTTP (and HTTPS for security) is the transport for REST APIs',
    ],
    explanation: 'REST (Representational State Transfer) APIs use HTTP/HTTPS as their transport protocol. Network devices like Cisco IOS-XE and Meraki expose REST APIs that accept HTTP GET, POST, PUT, and DELETE requests — making it easy to integrate with web-based automation tools.',
  },

  {
    id: 10, type: 'multiple-choice',
    prompt: 'Which HTTP method is used to retrieve (read) information from a REST API?',
    options: [
      { key: 'A', text: 'POST — creates a new resource on the server' },
      { key: 'B', text: 'GET — retrieves data from the server without modifying it' },
      { key: 'C', text: 'PUT — updates or replaces an existing resource' },
      { key: 'D', text: 'DELETE — removes a resource from the server' },
    ],
    correctAnswer: 'B',
    hints: [
      'CRUD = Create, Read, Update, Delete — which HTTP method means Read?',
      'GET retrieves data — it is read-only and does not change anything',
      'GET is the most common HTTP method for querying device status via API',
    ],
    explanation: 'HTTP GET retrieves data from a REST API without modifying the server state. In network automation, GET is used to read interface status, routing tables, VLAN configs, and device info. POST creates, PUT updates, and DELETE removes resources.',
  },

  {
    id: 11, type: 'sequencing',
    prompt: 'Place the REST API client-server interaction steps in the correct order:',
    shuffledItems: ['Server sends response back to client', 'Client sends HTTP request to server', 'Server processes the request'],
    correctOrder: ['Client sends HTTP request to server', 'Server processes the request', 'Server sends response back to client'],
    hints: [
      'The client always initiates — it sends the request first',
      'After receiving the request, what does the server do next?',
      'Client → Server processes → Server responds',
    ],
    explanation: 'REST API interaction follows the client-server model: 1) Client sends an HTTP request (GET/POST/PUT/DELETE). 2) Server receives and processes the request. 3) Server sends the HTTP response (with status code and JSON body). The client always initiates.',
  },

  {
    id: 12, type: 'multiple-choice',
    prompt: 'Which configuration management tool uses YAML-formatted playbooks to define automation tasks?',
    options: [
      { key: 'A', text: 'Puppet — uses its own DSL (Domain Specific Language) manifest files' },
      { key: 'B', text: 'Chef — uses Ruby-based cookbook and recipe files' },
      { key: 'C', text: 'Ansible — uses YAML playbooks and does not require agents' },
      { key: 'D', text: 'SNMP — a monitoring protocol, not a configuration management tool' },
    ],
    correctAnswer: 'C',
    hints: [
      'This tool is agentless — no software installed on managed devices',
      'It connects via SSH and uses YAML for its configuration files',
      'Ansible uses YAML playbooks — most popular for network automation',
    ],
    explanation: 'Ansible uses YAML-formatted playbooks to define automation tasks. It is agentless — it connects to managed devices via SSH (or API) and does not require software installed on them. Puppet uses DSL manifests and Chef uses Ruby cookbooks.',
  },

  {
    id: 13, type: 'multiple-choice',
    prompt: 'Which protocol does Ansible commonly use to connect to and manage network devices?',
    options: [
      { key: 'A', text: 'FTP — File Transfer Protocol' },
      { key: 'B', text: 'ICMP — Internet Control Message Protocol (ping)' },
      { key: 'C', text: 'SSH — Secure Shell for encrypted remote access' },
      { key: 'D', text: 'ARP — Address Resolution Protocol' },
    ],
    correctAnswer: 'C',
    hints: [
      'Ansible is agentless — it needs a secure way to send commands remotely',
      'This protocol is the secure replacement for Telnet',
      'SSH = Secure Shell — encrypted remote management',
    ],
    explanation: 'Ansible primarily uses SSH (Secure Shell) to connect to and manage network devices. Because it is agentless, Ansible does not require pre-installed software — it simply connects over SSH and runs modules on the managed device. Some network platforms also support Ansible via REST APIs.',
  },

  {
    id: 14, type: 'conceptual',
    prompt: 'What is the main goal of configuration management tools like Ansible, Puppet, and Chef?',
    options: [
      { key: 'A', text: 'Replace network hardware with virtual software instances' },
      { key: 'B', text: 'Automate and standardize device configurations across large environments' },
      { key: 'C', text: 'Monitor network performance and generate real-time alerts' },
      { key: 'D', text: 'Encrypt all management traffic between administrators and devices' },
    ],
    correctAnswer: 'B',
    hints: [
      'These tools solve the problem of inconsistent configurations at scale',
      'Think: "infrastructure as code" — defining desired config in files',
      'Automate + standardize = every device gets the same correct configuration',
    ],
    explanation: 'Configuration management tools automate and standardize device configurations across large environments. They implement "infrastructure as code" — defining desired states in files (playbooks, manifests, cookbooks) and ensuring every device matches that desired state consistently.',
  },

  {
    id: 15, type: 'conceptual',
    prompt: 'Why is network automation essential for modern enterprise networks?',
    options: [
      { key: 'A', text: 'Modern protocols like IPv6 and OSPF cannot be configured manually' },
      { key: 'B', text: 'Networks are too large and complex to manage manually at speed and scale' },
      { key: 'C', text: 'Regulatory requirements mandate the use of automation tools' },
      { key: 'D', text: 'Cisco IOS has removed CLI access from modern hardware platforms' },
    ],
    correctAnswer: 'B',
    hints: [
      'Modern networks can have thousands of devices spanning multiple data centers',
      'Speed, consistency, and error reduction are impossible at scale manually',
      'Scale + speed + accuracy = the reason automation is essential',
    ],
    explanation: 'Networks have grown too large and complex for manual CLI management to remain practical. Modern enterprises manage thousands of devices across multiple sites, requiring instant deployment, consistent configuration, and rapid response — all impossible without automation. Automation provides speed, accuracy, and scalability.',
  },
]

export const LAB18_COMPLETION = {
  conceptMastered: 'Network Automation and Programmability',
  summary:
    'You successfully analyzed network automation concepts, structured data formats, REST API behavior, and modern configuration management tools.',
  masteredPoints: [
    'Automation replaces manual CLI with software-driven configuration management',
    'Key benefit: consistency — same correct config applied every time',
    'JSON uses key-value pairs in curly braces { }',
    'XML uses opening/closing tags <tag>value</tag>',
    'YAML uses indentation — most human-readable format',
    'REST APIs use HTTP: GET (read), POST (create), PUT (update), DELETE (remove)',
    'API client-server flow: client sends request → server processes → server responds',
    'Ansible is agentless, uses YAML playbooks, connects via SSH',
    'Configuration management tools standardize configs at scale (infrastructure as code)',
  ],
  reviewIfNeeded: [
    { id: '79', title: 'Network Automation Overview' },
    { id: '80', title: 'JSON, XML, YAML' },
    { id: '81', title: 'REST APIs and Programmability' },
    { id: '82', title: 'Configuration Management Tools' },
  ],
  nextLab: {
    id: 'final-review',
    title: 'Final Review Lab – CCNA Comprehensive Challenge',
  },
}
