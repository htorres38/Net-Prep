'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle, X, Trophy,
  RotateCcw, Brain, Target, Home, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { setFinalExamCompletion } from '@/lib/progress'
import AiExplanation from '@/components/AiExplanation'

// types

interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface ExamSection {
  id: string
  title: string
  description: string
  questions: ExamQuestion[]
}

// data

const EXAM_SECTIONS: ExamSection[] = [
  {
    id: 'fundamentals-osi',
    title: 'Networking Fundamentals & OSI Model',
    description: 'Network types, devices, OSI layers, encapsulation, and TCP vs UDP',
    questions: [
      { id: 's1q1', question: 'Which network type connects devices within a small geographic area such as a home or office?', options: ['WAN — Wide Area Network spanning cities or countries', 'LAN — Local Area Network within a limited geographic area', 'MAN — Metropolitan Area Network spanning a city', 'Internet — the global public network'], correctAnswer: 1, explanation: 'A LAN (Local Area Network) connects devices within a limited geographic area such as a single office, home, or floor of a building. LANs are typically fast, low-latency, and privately owned.' },
      { id: 's1q2', question: 'Which OSI layer handles logical IP addressing and routing between networks?', options: ['Data Link (Layer 2)', 'Transport (Layer 4)', 'Network (Layer 3)', 'Session (Layer 5)'], correctAnswer: 2, explanation: 'OSI Layer 3 (Network) is responsible for logical addressing (IP addresses) and routing packets between networks. Routers operate at this layer, using routing tables to forward packets.' },
      { id: 's1q3', question: 'Which OSI layer does a switch primarily operate at?', options: ['Physical (Layer 1)', 'Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)'], correctAnswer: 1, explanation: 'Switches operate at Layer 2 (Data Link), forwarding Ethernet frames based on MAC addresses. They build and maintain a MAC address table to deliver frames efficiently to the correct port.' },
      { id: 's1q4', question: 'What is encapsulation in networking?', options: ['Compressing data to reduce file size for storage', 'Encrypting data before it leaves the network', 'Adding protocol headers to data as it moves down the OSI layers', 'Stripping headers from data as it arrives at the destination'], correctAnswer: 2, explanation: 'Encapsulation adds protocol headers (and sometimes trailers) at each layer as data moves down the OSI stack. Each layer adds its own addressing and control information before passing data to the next layer.' },
      { id: 's1q5', question: 'What is the PDU (Protocol Data Unit) name at the Transport layer (Layer 4)?', options: ['Frame', 'Packet', 'Segment', 'Bit'], correctAnswer: 2, explanation: 'At Layer 4 (Transport), the PDU is a Segment. At Layer 3 (Network) it is a Packet. At Layer 2 (Data Link) it is a Frame. At Layer 1 (Physical) it is Bits.' },
      { id: 's1q6', question: 'Which transport protocol provides reliable, ordered, and error-checked delivery?', options: ['UDP — User Datagram Protocol, fast but no delivery guarantee', 'ICMP — Internet Control Message Protocol used for diagnostics', 'TCP — Transmission Control Protocol with acknowledgments and sequencing', 'ARP — Address Resolution Protocol for MAC resolution'], correctAnswer: 2, explanation: 'TCP (Transmission Control Protocol) provides reliable, connection-oriented delivery using acknowledgments, sequence numbers, and retransmission. UDP is faster but does not guarantee delivery, order, or error recovery.' },
      { id: 's1q7', question: 'What is a WAN?', options: ['A network on a single building floor using wireless access points', 'A network connecting devices within one office using a single switch', 'A network spanning large geographic areas, often connecting multiple LANs', 'A VLAN extension across multiple physical switches'], correctAnswer: 2, explanation: 'A WAN (Wide Area Network) spans large geographic areas — connecting cities, countries, or continents. WANs link multiple LANs across long distances. The internet is the largest WAN in existence.' },
    ],
  },
  {
    id: 'ethernet-switching',
    title: 'Ethernet & Switching',
    description: 'MAC addresses, switch operation, STP, and EtherChannel',
    questions: [
      { id: 's2q1', question: 'How many bits long is a MAC address?', options: ['32 bits — the same length as an IPv4 address', '48 bits — 6 bytes written as 12 hex digits', '64 bits — used in modern Ethernet standards', '128 bits — the same length as an IPv6 address'], correctAnswer: 1, explanation: 'A MAC address is 48 bits (6 bytes) written as 12 hexadecimal digits (e.g., AA:BB:CC:DD:EE:FF). The first 24 bits are the OUI (manufacturer ID) and the last 24 bits are device-specific.' },
      { id: 's2q2', question: 'What does a switch do when it receives a frame with an unknown destination MAC address?', options: ['Drops the frame and sends an error to the source', 'Forwards the frame only to the router for delivery', 'Floods the frame out all ports except the incoming port', 'Holds the frame in memory until the address is learned'], correctAnswer: 2, explanation: 'Unknown unicast flooding — when the switch has no MAC table entry for the destination, it copies the frame to all ports except the one it arrived on. When the destination replies, the switch learns its MAC and port.' },
      { id: 's2q3', question: 'What is the purpose of STP (Spanning Tree Protocol)?', options: ['To increase port speeds on redundant switch links', 'To prevent Layer 2 loops in networks with redundant switch paths', 'To automatically assign IP addresses to connected switches', 'To tag VLAN traffic on trunk links between switches'], correctAnswer: 1, explanation: 'STP prevents broadcast storms and infinite loops caused by redundant Layer 2 paths. It elects a root bridge, calculates the best paths, and blocks redundant ports — creating a loop-free, active topology.' },
      { id: 's2q4', question: 'How does STP elect the root bridge?', options: ['The switch with the most connected devices wins', 'The switch with the highest port speed wins', 'The switch with the lowest Bridge ID (priority + MAC address) wins', 'The switch that is powered on first becomes root'], correctAnswer: 2, explanation: 'STP selects the root bridge using the Bridge ID — a combination of configurable priority (default 32768) and MAC address. The switch with the lowest Bridge ID wins. Lower priority = more likely to become root.' },
      { id: 's2q5', question: 'Which command displays the MAC address table on a Cisco switch?', options: ['show ip route', 'show arp', 'show mac address-table', 'show vlan brief'], correctAnswer: 2, explanation: '"show mac address-table" displays the switch\'s CAM table — showing all known MAC addresses, the port they were learned on, and whether they were learned dynamically or configured statically.' },
      { id: 's2q6', question: 'What is EtherChannel?', options: ['A VLAN trunking protocol used between switches', 'A logical aggregation of multiple physical links acting as one high-bandwidth connection', 'An encrypted channel for secure management traffic', 'A Cisco protocol for spanning tree convergence'], correctAnswer: 1, explanation: 'EtherChannel (Link Aggregation) bundles multiple physical Ethernet links into one logical link, multiplying bandwidth and providing redundancy. LACP (IEEE) and PAgP (Cisco) are the negotiation protocols used.' },
      { id: 's2q7', question: 'A switch receives a frame with destination MAC FF:FF:FF:FF:FF:FF. What does the switch do?', options: ['Drops the frame as it is invalid', 'Forwards the frame only to the router', 'Forwards the frame out all ports except the incoming port', 'Looks up the MAC in the routing table'], correctAnswer: 2, explanation: 'FF:FF:FF:FF:FF:FF is the Ethernet broadcast address. The switch floods it out all ports except the incoming port. All devices on that VLAN receive it. Broadcasts do not cross routers.' },
    ],
  },
  {
    id: 'ip-subnetting',
    title: 'IP Addressing & Subnetting',
    description: 'IPv4 structure, CIDR, subnet masks, host counts, and private ranges',
    questions: [
      { id: 's3q1', question: 'How many bits are in an IPv4 address?', options: ['16 bits', '32 bits', '48 bits', '128 bits'], correctAnswer: 1, explanation: 'IPv4 addresses are 32 bits long, written as four 8-bit octets in dotted-decimal notation (e.g., 192.168.1.1). IPv6 uses 128-bit addresses to solve IPv4 exhaustion.' },
      { id: 's3q2', question: 'What subnet mask corresponds to the /24 prefix?', options: ['255.255.0.0', '255.0.0.0', '255.255.255.0', '255.255.255.128'], correctAnswer: 2, explanation: '/24 means the first 24 bits are the network portion — all 1s in the first three octets, all 0s in the last. This equals 255.255.255.0. The remaining 8 host bits allow up to 254 usable addresses.' },
      { id: 's3q3', question: 'How many usable host addresses does a /24 network provide?', options: ['255', '256', '254', '253'], correctAnswer: 2, explanation: 'A /24 has 2^8 = 256 total addresses. Subtract 2: the network address (all host bits 0) and the broadcast address (all host bits 1). Result: 254 usable host addresses.' },
      { id: 's3q4', question: 'Which of the following is a private (RFC 1918) IP address?', options: ['8.8.8.8 — Google public DNS', '172.25.10.5 — falls in the 172.16.0.0/12 private range', '203.0.113.1 — documentation/public range', '1.1.1.1 — Cloudflare public DNS'], correctAnswer: 1, explanation: 'RFC 1918 defines three private ranges not routable on the internet: 10.0.0.0/8, 172.16.0.0/12 (172.16.x.x–172.31.x.x), and 192.168.0.0/16. 172.25.10.5 is in the 172.16.0.0/12 private range.' },
      { id: 's3q5', question: 'What is the network address of 192.168.10.50/24?', options: ['192.168.10.50 — the host address itself', '192.168.10.255 — the broadcast address', '192.168.0.0 — wrong subnet', '192.168.10.0 — the network address'], correctAnswer: 3, explanation: 'ANDing 192.168.10.50 with subnet mask 255.255.255.0 gives 192.168.10.0 — the network address. The host portion (50) is set to all zeros to identify the subnet itself.' },
      { id: 's3q6', question: 'What is the broadcast address for the 192.168.1.0/24 network?', options: ['192.168.1.0', '192.168.1.1', '192.168.1.254', '192.168.1.255'], correctAnswer: 3, explanation: 'The broadcast address has all host bits set to 1. For 192.168.1.0/24, the last 8 bits are host bits. Setting all to 1 gives 255 in the final octet: 192.168.1.255.' },
      { id: 's3q7', question: 'How many usable host addresses does a /26 subnet provide?', options: ['62', '64', '30', '126'], correctAnswer: 0, explanation: '/26 leaves 6 bits for hosts (32-26=6). 2^6 = 64 total addresses. Subtract 2 (network + broadcast) = 62 usable host addresses. The /26 subnet mask is 255.255.255.192.' },
      { id: 's3q8', question: 'What subnet mask corresponds to /28?', options: ['255.255.255.240', '255.255.255.224', '255.255.255.248', '255.255.255.192'], correctAnswer: 0, explanation: '/28 = 28 network bits, 4 host bits. The last octet in binary: 11110000 = 240. Full mask: 255.255.255.240. Each /28 subnet has 16 total addresses (2^4) and 14 usable host addresses.' },
      { id: 's3q9', question: 'Why is /30 commonly used for point-to-point links between routers?', options: ['It provides the maximum number of hosts for router interfaces', 'It provides exactly 2 usable host addresses — one per router end', 'It is the only mask that supports OSPF adjacency', 'It provides a large broadcast domain for routing protocols'], correctAnswer: 1, explanation: '/30 gives 4 total addresses (2^2) with only 2 usable hosts — perfect for point-to-point router links needing only 2 IPs. Using /30 wastes minimal address space compared to larger subnets.' },
      { id: 's3q10', question: 'A device has IP address 192.168.5.66/27. What is its subnet\'s network address?', options: ['192.168.5.0', '192.168.5.32', '192.168.5.64', '192.168.5.96'], correctAnswer: 2, explanation: '/27 mask is 255.255.255.224 (block size 32). Subnets: .0, .32, .64, .96, .128 etc. 192.168.5.66 falls in the .64 block (.64–.95). Network address = 192.168.5.64.' },
    ],
  },
  {
    id: 'routing-arp',
    title: 'Routing & ARP',
    description: 'Routing tables, static routes, ARP, default routes, and output interpretation',
    questions: [
      { id: 's4q1', question: 'What does a router use to determine where to forward a packet?', options: ['MAC address table', 'ARP cache', 'Routing table', 'DNS cache'], correctAnswer: 2, explanation: 'Routers use a routing table — a database of known network destinations with next-hop addresses, outgoing interfaces, and metrics. The router uses longest-prefix matching to find the most specific route.' },
      { id: 's4q2', question: 'What does a default route (0.0.0.0/0) do?', options: ['Blocks all traffic that does not match a specific route', 'Matches any destination when no more specific route exists', 'Provides a path only to the directly connected network', 'Automatically configures routing between all VLANs'], correctAnswer: 1, explanation: '0.0.0.0/0 is the default route — it matches any destination. When no more specific route exists in the table, traffic is sent via the default route. Commonly points toward an ISP or internet gateway.' },
      { id: 's4q3', question: 'In the output of "show ip route," what does the route code "C" indicate?', options: ['A route learned via OSPF dynamic routing', 'A static route manually configured by the administrator', 'A directly connected network on a local interface', 'A default route to the internet'], correctAnswer: 2, explanation: 'Code C in "show ip route" means directly connected — the network is on a physical interface that is up/up. Other codes: S = static, O = OSPF, R = RIP. Connected routes are always preferred.' },
      { id: 's4q4', question: 'What does ARP (Address Resolution Protocol) resolve?', options: ['Domain names to IP addresses', 'IP addresses to MAC addresses', 'Private IPs to public IPs', 'Port numbers to application names'], correctAnswer: 1, explanation: 'ARP resolves IP addresses to MAC addresses. When a device knows the destination IP but needs the Layer 2 MAC address to build an Ethernet frame, it broadcasts an ARP Request. The owner of that IP replies with its MAC.' },
      { id: 's4q5', question: 'Which command correctly adds a static route on a Cisco router to reach 10.1.1.0/24 via next-hop 192.168.1.1?', options: ['route add 10.1.1.0 255.255.255.0 192.168.1.1', 'ip route 10.1.1.0 255.255.255.0 192.168.1.1', 'ip static-route 10.1.1.0 /24 192.168.1.1', 'add route 10.1.1.0 next-hop 192.168.1.1'], correctAnswer: 1, explanation: 'Cisco static route syntax: "ip route [destination] [mask] [next-hop]". This installs a manual route that persists in the routing table until removed with "no ip route."' },
      { id: 's4q6', question: 'Which device separates broadcast domains at Layer 3?', options: ['Switch — connects devices in the same broadcast domain', 'Hub — forwards all traffic to all ports', 'Access Point — extends wireless coverage', 'Router — does not forward Layer 2 broadcasts'], correctAnswer: 3, explanation: 'Routers operate at Layer 3 and do not forward broadcast frames. Each router interface is a separate broadcast domain. This prevents broadcast storms from crossing between networks.' },
      { id: 's4q7', question: 'A host needs to communicate with 10.2.0.1 but is on the 192.168.1.0/24 network. What does it send first?', options: ['An ARP request for 10.2.0.1 directly', 'A DNS query to resolve 10.2.0.1', 'An Ethernet frame to its default gateway\'s MAC address', 'A ping to the broadcast address to find the remote host'], correctAnswer: 2, explanation: 'When the destination is on a different subnet, the host sends the packet to its default gateway. It ARPs for the gateway\'s MAC, builds an Ethernet frame to the gateway\'s MAC, and puts the remote destination IP in the packet.' },
    ],
  },
  {
    id: 'vlans-trunking',
    title: 'VLANs & Trunking',
    description: 'VLAN segmentation, trunk ports, 802.1Q, and inter-VLAN routing',
    questions: [
      { id: 's5q1', question: 'What is the primary purpose of VLANs?', options: ['To increase the physical speed of switch ports', 'To logically segment a switch into separate broadcast domains', 'To replace routers for inter-network communication', 'To encrypt traffic between switch ports'], correctAnswer: 1, explanation: 'VLANs (Virtual LANs) logically divide a physical switch into multiple separate broadcast domains. Devices in different VLANs cannot communicate at Layer 2 — they require a Layer 3 device (router) to communicate.' },
      { id: 's5q2', question: 'What is a trunk port on a switch?', options: ['A port that carries traffic for only one VLAN to an end device', 'A port that connects directly to a server in the DMZ', 'A port that carries traffic for multiple VLANs simultaneously using 802.1Q tagging', 'A port used only for out-of-band switch management'], correctAnswer: 2, explanation: 'A trunk port carries 802.1Q-tagged traffic for multiple VLANs on a single link — typically between switches or between a switch and a router. The tag identifies which VLAN each frame belongs to.' },
      { id: 's5q3', question: 'What protocol tags Ethernet frames with a VLAN ID on trunk links?', options: ['OSPF — Open Shortest Path First', 'STP — Spanning Tree Protocol', '802.1Q — the IEEE VLAN tagging standard', 'CDP — Cisco Discovery Protocol'], correctAnswer: 2, explanation: '802.1Q (dot1q) is the IEEE standard for VLAN tagging. It inserts a 4-byte tag in the Ethernet frame header containing the VLAN ID (1–4094). This enables trunk ports to carry hundreds of VLANs.' },
      { id: 's5q4', question: 'In a router-on-a-stick configuration, what must the switch port connecting to the router be configured as?', options: ['An access port in the default VLAN', 'A trunk port carrying all required VLANs', 'A routed port with a dedicated IP address', 'A mirrored port for traffic inspection'], correctAnswer: 1, explanation: 'Router-on-a-stick uses subinterfaces on one physical router port to route between VLANs. The switch port must be a trunk so that 802.1Q-tagged traffic from all VLANs can reach the router\'s subinterfaces.' },
      { id: 's5q5', question: 'A switch port shows "not-trunking" in "show interfaces trunk." What is the most likely fix?', options: ['Reload the switch to reset the port state', 'Change the VLAN membership of the port', 'Configure "switchport mode trunk" to force trunk mode', 'Disable STP on the port to allow trunking'], correctAnswer: 2, explanation: '"Not-trunking" means the port is not in trunk mode — it\'s likely set to "auto" or "access." Use "switchport mode trunk" to force the port into permanent trunk mode, enabling 802.1Q VLAN tagging.' },
      { id: 's5q6', question: 'Which command verifies VLAN membership — showing which ports belong to which VLANs?', options: ['show ip route', 'show interfaces trunk', 'show vlan brief', 'show mac address-table'], correctAnswer: 2, explanation: '"show vlan brief" displays all VLANs in the database, their status, and the access ports assigned to each VLAN. Use this to verify ports are in the correct VLANs and VLANs are active.' },
      { id: 's5q7', question: 'PC-A in VLAN 10 cannot reach PC-B in VLAN 20 on the same switch. Both have correct IPs and gateways. What is needed?', options: ['A higher-speed switch with more bandwidth', 'A trunk link running between the two VLANs directly', 'A Layer 3 device to route traffic between VLAN 10 and VLAN 20', 'A crossover Ethernet cable connecting the two PCs'], correctAnswer: 2, explanation: 'VLANs are separate broadcast domains — Layer 2 traffic cannot cross between them without a Layer 3 device. A router (router-on-a-stick) or Layer 3 switch must route packets between VLAN 10 and VLAN 20.' },
    ],
  },
  {
    id: 'ospf-dynamic-routing',
    title: 'OSPF & Dynamic Routing',
    description: 'OSPF operation, neighbor states, cost metric, and troubleshooting',
    questions: [
      { id: 's6q1', question: 'What type of routing protocol is OSPF?', options: ['Distance-vector — shares routing table with neighbors', 'Hybrid — combines distance-vector and link-state', 'Path-vector — used for inter-autonomous system routing', 'Link-state — builds a complete map of the topology'], correctAnswer: 3, explanation: 'OSPF (Open Shortest Path First) is a link-state routing protocol. Each router builds a complete map of the network using LSAs (Link State Advertisements) and runs the Dijkstra (SPF) algorithm to find the shortest path.' },
      { id: 's6q2', question: 'What metric does OSPF use to select the best path?', options: ['Hop count — total number of routers in the path', 'Cost — inversely proportional to interface bandwidth', 'Delay — measured in microseconds across the path', 'Bandwidth — the raw speed of the exit interface'], correctAnswer: 1, explanation: 'OSPF uses cost as its metric. Cost = Reference Bandwidth / Interface Bandwidth (default reference = 100 Mbps). Higher bandwidth = lower cost. OSPF selects the path with the lowest total cumulative cost.' },
      { id: 's6q3', question: 'What state must OSPF neighbors reach before they exchange routing information?', options: ['INIT — neighbor\'s Hello has been received', '2WAY — bidirectional communication confirmed', 'EXCHANGE — database descriptions being shared', 'FULL — complete LSDB synchronization achieved'], correctAnswer: 3, explanation: 'OSPF neighbors must reach FULL state to have synchronized Link State Databases and begin installing routes. The progression: DOWN → INIT → 2WAY → EXSTART → EXCHANGE → LOADING → FULL.' },
      { id: 's6q4', question: 'An OSPF neighbor relationship is stuck at INIT. What is the most likely cause?', options: ['Both routers are connected on the same subnet', 'The routers have matching hostnames', 'An OSPF area ID mismatch between the two routers', 'The routers both have the same interface speed'], correctAnswer: 2, explanation: 'OSPF Hello packets carry the area ID. If the two routers have different area IDs configured on the shared link, the relationship cannot progress past INIT. Also check: hello/dead timers, authentication, and MTU.' },
      { id: 's6q5', question: 'In "show ip route" output, what does the code "O" indicate?', options: ['A directly connected network on a local interface', 'A static route manually configured by an administrator', 'A route learned via OSPF dynamic routing', 'A route to the internet via default route'], correctAnswer: 2, explanation: 'Code O in "show ip route" means the route was learned via OSPF. It includes the cost metric and next-hop address. Compare: C = connected, S = static, O = OSPF.' },
      { id: 's6q6', question: 'What is OSPF area 0 called, and why is it required?', options: ['The root area — all other areas are children of area 0', 'The management area — used only for NMS communication', 'The backbone area — all other OSPF areas must connect to it', 'The default area — created automatically on all OSPF routers'], correctAnswer: 2, explanation: 'Area 0 is the OSPF backbone area. In multi-area OSPF designs, all other areas must connect to area 0 (directly or via virtual link) to ensure proper route distribution across the entire OSPF domain.' },
      { id: 's6q7', question: 'Which command verifies OSPF neighbor relationships and shows their current state?', options: ['show ip route ospf', 'show ip ospf neighbor', 'show ip protocols', 'show ospf database'], correctAnswer: 1, explanation: '"show ip ospf neighbor" displays all OSPF neighbors, their Router IDs, adjacency state, dead-time countdown, priority, and the interface address they are reachable through. Confirm FULL state for healthy adjacency.' },
    ],
  },
  {
    id: 'ip-services',
    title: 'IP Services: DHCP, DNS & NAT',
    description: 'DHCP DORA, APIPA, DNS records, NAT translation, and NTP',
    questions: [
      { id: 's7q1', question: 'What is the correct order of the DHCP DORA process?', options: ['Discover, Acknowledge, Request, Offer', 'Discover, Offer, Request, Acknowledge', 'Offer, Discover, Acknowledge, Request', 'Request, Discover, Offer, Acknowledge'], correctAnswer: 1, explanation: 'DORA: 1) Discover — client broadcasts to find a server. 2) Offer — server offers an IP address. 3) Request — client formally requests that IP. 4) Acknowledge — server confirms the lease with full configuration.' },
      { id: 's7q2', question: 'A PC shows IP address 169.254.45.200 after booting. What does this indicate?', options: ['The PC received a valid IP lease from the DHCP server', 'The PC is using a static IP configured by an administrator', 'The PC failed to get a DHCP lease and self-assigned an APIPA address', 'The PC is using an IPv6 link-local address for communication'], correctAnswer: 2, explanation: '169.254.0.0/16 is the APIPA range (Automatic Private IP Addressing). Windows and macOS assign an APIPA address when DHCP fails. APIPA addresses cannot route to other subnets or the internet.' },
      { id: 's7q3', question: 'A user can ping 8.8.8.8 successfully but cannot open google.com. What is the most likely failure?', options: ['NAT — IP addresses are not being translated by the router', 'DHCP — the host does not have a valid IP address', 'DNS — hostname-to-IP resolution is not working', 'Default route — the router is missing a path to the internet'], correctAnswer: 2, explanation: 'Pinging 8.8.8.8 by IP confirms connectivity, NAT, and routing are working. The failure to reach google.com by name points to DNS — without it, the browser cannot resolve the domain to an IP address.' },
      { id: 's7q4', question: 'Which DNS record type maps a hostname to an IPv4 address?', options: ['AAAA — maps hostname to IPv6 address', 'PTR — maps IP address to hostname (reverse)', 'CNAME — creates a hostname alias', 'A — maps hostname to IPv4 address'], correctAnswer: 3, explanation: 'An A record (Address record) maps a hostname to a 32-bit IPv4 address. AAAA maps to a 128-bit IPv6 address. PTR is for reverse DNS lookups. CNAME creates an alias pointing one hostname to another.' },
      { id: 's7q5', question: 'In a NAT translation table, what is the "inside local" address?', options: ['The public IP address assigned to the router\'s WAN interface', 'The IP address of the external server on the internet', 'The private IP address of the internal host before NAT translation', 'The translated public IP that the host appears as on the internet'], correctAnswer: 2, explanation: 'Inside local = the private RFC 1918 IP of the internal device before NAT (e.g., 192.168.1.10). Inside global = the public IP it appears as after NAT. Outside global = the external destination\'s public IP.' },
      { id: 's7q6', question: 'What is the purpose of NTP (Network Time Protocol)?', options: ['To assign IP addresses dynamically to network devices', 'To synchronize clocks across all devices in a network', 'To monitor device performance and generate alerts', 'To resolve hostnames to IP addresses for web browsing'], correctAnswer: 1, explanation: 'NTP synchronizes device clocks across a network. Accurate time is essential for log correlation, security certificate validation, time-sensitive protocols, and security auditing. Stratum 1 NTP servers sync to atomic clocks.' },
      { id: 's7q7', question: 'Why do hosts with private IP addresses require NAT to access the internet?', options: ['Private IPs use a different packet format than public IPs', 'Private IP addresses are not globally routable on the public internet', 'Private IPs require AES encryption before crossing the internet', 'ISPs charge extra for routing private addresses'], correctAnswer: 1, explanation: 'RFC 1918 private addresses (10.x, 172.16–31.x, 192.168.x) are reserved for internal use only. Internet routers discard packets with private source IPs. NAT translates them to a globally routable public IP before forwarding.' },
    ],
  },
  {
    id: 'acls-security',
    title: 'ACLs & Network Security',
    description: 'Standard vs Extended ACLs, implicit deny, port security violation modes',
    questions: [
      { id: 's8q1', question: 'What is the key difference between Standard and Extended ACLs?', options: ['Standard ACLs are applied outbound; Extended ACLs inbound only', 'Standard ACLs filter on source IP only; Extended ACLs filter on source, destination, protocol, and port', 'Standard ACLs block all traffic by default; Extended ACLs permit all traffic', 'Standard ACLs use numbers 100–199; Extended ACLs use 1–99'], correctAnswer: 1, explanation: 'Standard ACLs (1–99) match only on source IP address. Extended ACLs (100–199) can match source IP, destination IP, protocol (TCP/UDP/ICMP), and port numbers — providing far more precise traffic control.' },
      { id: 's8q2', question: 'What happens to a packet that does not match any rule in an ACL?', options: ['It is forwarded to the next-hop router', 'It is logged and then allowed through', 'It is returned to the source with an error', 'It is dropped by the implicit deny all at the end of every ACL'], correctAnswer: 3, explanation: 'Every ACL ends with an invisible "deny ip any any" that is not shown in the config. Any packet that does not match an explicit permit or deny is silently dropped. This implicit deny is a critical security concept.' },
      { id: 's8q3', question: 'ACLs process rules in what order?', options: ['Most specific rule to least specific, regardless of position', 'Last rule to first rule — newest rules take priority', 'Top to bottom — the first matching rule is applied and processing stops', 'Random order based on current traffic load'], correctAnswer: 2, explanation: 'ACLs use top-down, first-match processing. The router evaluates rules in order from first to last. When a packet matches a rule (permit or deny), that action is applied and no further rules are checked. Order is critical.' },
      { id: 's8q4', question: 'Where should a Standard ACL be placed for best practice?', options: ['Near the source — to stop traffic as early as possible', 'Near the destination — to avoid blocking unintended traffic to other networks', 'On the ISP uplink — to protect against external threats', 'On every interface in the network for maximum coverage'], correctAnswer: 1, explanation: 'Standard ACLs only match on source IP, so placing them near the source could block that source from reaching all destinations. Near-destination placement prevents accidental blocking of traffic to other networks.' },
      { id: 's8q5', question: 'An ACL has: "permit tcp 192.168.1.0 0.0.0.255 any eq 80" then "deny ip any any". A host at 192.168.1.50 sends a ping to 8.8.8.8. What happens to the ping?', options: ['It is permitted because the source is in the allowed subnet', 'It is denied because ICMP does not match the TCP permit rule', 'It is permitted after logging by the deny rule', 'It creates a new dynamic permit entry in the ACL'], correctAnswer: 1, explanation: 'The first ACE permits only TCP (not ICMP) on port 80. Ping uses ICMP. Since ICMP does not match the permit rule, it falls through to "deny ip any any" and is dropped. Web browsing (TCP 80) would be permitted.' },
      { id: 's8q6', question: 'What happens to a switch port when Port Security detects a violation in "shutdown" mode?', options: ['The violating device is moved to an isolated quarantine VLAN', 'Only the violating frames are dropped; other traffic continues normally', 'The port is placed in err-disabled state and all traffic stops', 'The switch sends an SNMP alert but continues forwarding'], correctAnswer: 2, explanation: 'In shutdown violation mode, the port is immediately disabled and placed in err-disabled state. No traffic can pass. Recovery requires an administrator to manually run "shutdown" then "no shutdown" on the interface.' },
      { id: 's8q7', question: 'What does "switchport port-security mac-address sticky" do?', options: ['Manually pins one specific pre-configured MAC to the port', 'Automatically learns and saves the connected device\'s MAC to running-config', 'Blocks all devices except those in the VLAN allowed list', 'Removes all existing secure MAC addresses from the port'], correctAnswer: 1, explanation: 'Sticky learning dynamically learns the MAC of the first device to connect and saves it as a secure MAC in running-config. If saved with "write memory," the address persists across reboots — no manual entry needed.' },
      { id: 's8q8', question: 'Which Port Security violation mode silently drops unauthorized traffic without disabling the port or generating logs?', options: ['Shutdown — disables the port into err-disabled', 'Restrict — drops and logs violations', 'Protect — silently drops unauthorized frames, no log, port stays up', 'Block — drops and quarantines the device'], correctAnswer: 2, explanation: 'Protect mode silently drops frames from unauthorized MAC addresses without logging the event or disabling the port. Restrict drops and logs (SNMP trap, syslog). Shutdown disables the port into err-disabled state.' },
    ],
  },
  {
    id: 'wireless-ipv6-automation',
    title: 'Wireless, IPv6 & Network Automation',
    description: 'Wi-Fi standards, WLCs, CAPWAP, IPv6, and automation concepts',
    questions: [
      { id: 's9q1', question: 'Which IEEE standard defines wireless LAN (Wi-Fi) communication?', options: ['802.3 — wired Ethernet standard', '802.1Q — VLAN trunking standard', '802.11 — Wireless LAN (Wi-Fi) standard', '802.15 — Bluetooth personal area network'], correctAnswer: 2, explanation: 'IEEE 802.11 defines the wireless LAN standard. Variants include 802.11b/g/n (Wi-Fi 4), 802.11ac (Wi-Fi 5), and 802.11ax (Wi-Fi 6). 802.3 is wired Ethernet. 802.1Q is VLAN tagging.' },
      { id: 's9q2', question: 'What is the difference between an Autonomous AP and a Lightweight AP?', options: ['Autonomous APs provide faster speeds; Lightweight APs have better range', 'Autonomous APs are self-managed; Lightweight APs require a Wireless LAN Controller (WLC)', 'Autonomous APs only support 2.4 GHz; Lightweight APs support dual-band', 'Autonomous APs use CAPWAP tunnels; Lightweight APs use 802.1Q'], correctAnswer: 1, explanation: 'Autonomous APs manage their own RF, security, and configuration independently. Lightweight APs (LWAP) offload all management to a WLC and cannot operate without one. They communicate with the WLC via CAPWAP.' },
      { id: 's9q3', question: 'How long is an IPv6 address?', options: ['32 bits — same as IPv4', '64 bits — uses only the network portion', '128 bits — written as eight groups of hex digits', '256 bits — provides maximum security'], correctAnswer: 2, explanation: 'IPv6 addresses are 128 bits, written as eight groups of four hex digits separated by colons (e.g., 2001:0DB8::1). IPv4 is 32 bits. IPv6 provides 2^128 possible addresses — solving IPv4 exhaustion.' },
      { id: 's9q4', question: 'What does CAPWAP do in a wireless network?', options: ['Encrypts VLAN traffic between access switches', 'Creates a management and data tunnel between lightweight APs and the WLC', 'Authenticates wireless clients using EAP and a RADIUS server', 'Assigns IP addresses to wireless clients via DHCP'], correctAnswer: 1, explanation: 'CAPWAP (Control and Provisioning of Wireless Access Points) creates an encrypted tunnel between lightweight APs and the WLC. It carries control traffic on UDP 5246 and optionally data traffic on UDP 5247.' },
      { id: 's9q5', question: 'Which wireless security protocol uses AES/CCMP encryption and is the current enterprise standard?', options: ['WEP — Wired Equivalent Privacy, deprecated and broken', 'WPA — Wi-Fi Protected Access using TKIP encryption', 'WPA2 — uses AES/CCMP, the current security standard', 'Open — no encryption, public network access'], correctAnswer: 2, explanation: 'WPA2 uses AES with CCMP (Counter/CBC-MAC Protocol) for strong wireless encryption. WEP is broken (RC4 vulnerabilities). WPA uses TKIP which is stronger than WEP but weaker than WPA2. WPA3 is the newest standard.' },
      { id: 's9q6', question: 'What is the primary benefit of network automation over manual configuration?', options: ['Automation is always faster to set up than manual CLI', 'Automation reduces the number of network devices required', 'Automation provides consistency — the same correct config applied every time', 'Automation eliminates the need for IP addressing in the network'], correctAnswer: 2, explanation: 'Consistency is the primary benefit — automation applies configurations identically every time without typos, missed steps, or human variations. Other benefits: faster deployment, scalability, easy rollback, and reduced operational costs.' },
    ],
  },
]


type ExamPhase = 'intro' | 'section' | 'results'


export default function ExamPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<ExamPhase>('intro')
  const [sectionIdx, setSectionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, number>>({})

  const currentSection = EXAM_SECTIONS[sectionIdx]
  const isLastSection = sectionIdx === EXAM_SECTIONS.length - 1

  function startExam() {
    setPhase('section')
    setSectionIdx(0)
    setAnswers({})
    setSectionAnswers({})
  }

  function selectAnswer(questionId: string, optionIdx: number) {
    setSectionAnswers(prev => ({ ...prev, [questionId]: optionIdx }))
  }

  function submitSection() {
    const merged = { ...answers, ...sectionAnswers }
    setAnswers(merged)
    if (isLastSection) {
      const allQs = EXAM_SECTIONS.flatMap(s => s.questions)
      const correct = allQs.filter(q => merged[q.id] === q.correctAnswer).length
      setFinalExamCompletion(correct, allQs.length)
      setPhase('results')
    } else {
      setSectionIdx(i => i + 1)
      setSectionAnswers({})
    }
  }

  const allQuestions = EXAM_SECTIONS.flatMap(s => s.questions.map(q => ({ ...q, sectionTitle: s.title })))
  const totalQuestions = allQuestions.length
  const totalCorrect = allQuestions.filter(q => answers[q.id] === q.correctAnswer).length
  const pct = Math.round((totalCorrect / totalQuestions) * 100)
  const passed = pct >= 70

  const answeredInSection = currentSection?.questions.filter(q => sectionAnswers[q.id] !== undefined).length ?? 0
  const allSectionAnswered = answeredInSection === (currentSection?.questions.length ?? 0)

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <p className="text-xs text-gray-400">CCNA 200-301</p>
              <p className="text-sm font-bold text-gray-900">Final Practice Exam</p>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-7 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">CCNA Final Practice Exam</h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Test your knowledge across all major CCNA topics. Answer all questions before seeing your results.
            </p>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h2 className="font-bold text-gray-900 text-base">Exam Details</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-blue-700">{totalQuestions}</div>
                <div className="text-xs text-blue-600 mt-0.5 font-medium">Questions</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-purple-700">{EXAM_SECTIONS.length}</div>
                <div className="text-xs text-purple-600 mt-0.5 font-medium">Sections</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-700">70%</div>
                <div className="text-xs text-green-600 mt-0.5 font-medium">To Pass</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> How It Works
            </h2>
            <div className="space-y-2.5">
              {[
                'Answer all questions in each section before moving on',
                'You will not see right or wrong feedback during the exam',
                'Submit the final section to see your complete results',
                'Results show every question with correct and incorrect answers',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-2.5">
            <h2 className="font-bold text-gray-900 text-base mb-1">Sections</h2>
            {EXAM_SECTIONS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.questions.length} questions · {s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startExam}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl transition-colors"
          >
            Begin Exam <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'section') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Section {sectionIdx + 1} of {EXAM_SECTIONS.length}</p>
              <p className="text-sm font-bold text-gray-900 truncate">{currentSection.title}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {answeredInSection}/{currentSection.questions.length} answered
              </span>
            </div>
          </div>
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((sectionIdx) / EXAM_SECTIONS.length) * 100}%` }} />
          </div>
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-900">{currentSection.title}</p>
              <p className="text-xs text-indigo-600">{currentSection.description}</p>
            </div>
            <div className="ml-auto text-xs text-indigo-500 font-medium">{sectionIdx + 1}/{EXAM_SECTIONS.length}</div>
          </div>

          {currentSection.questions.map((q, qIdx) => {
            const selected = sectionAnswers[q.id]
            return (
              <div key={q.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{q.question}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selected === oIdx
                    return (
                      <button
                        key={oIdx}
                        onClick={() => selectAnswer(q.id, oIdx)}
                        className={cn(
                          'w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn(
                            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                            isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400'
                          )}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="space-y-3 pb-6">
            {!allSectionAnswered && (
              <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Answer all {currentSection.questions.length} questions to continue
              </p>
            )}
            <button
              onClick={submitSection}
              disabled={!allSectionAnswered}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all',
                allSectionAnswered
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isLastSection
                ? <><Trophy className="w-5 h-5" /> Submit Final Exam</>
                : <>Next Section: {EXAM_SECTIONS[sectionIdx + 1]?.title} <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <p className="text-sm font-bold text-gray-900">Exam Results</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className={cn('rounded-2xl p-7 text-center', passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600')}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {passed ? <Trophy className="w-10 h-10 text-white" /> : <Target className="w-10 h-10 text-white" />}
            </div>
            <div className="text-5xl font-bold text-white mb-1">{pct}%</div>
            <div className="text-white/80 text-sm mb-3">{totalCorrect} of {totalQuestions} correct</div>
            <div className={cn('inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold', passed ? 'bg-white/20 text-white' : 'bg-white/20 text-white')}>
              {passed ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {passed ? 'Passed' : 'Not Passed — Keep Studying!'}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Section Breakdown</h2>
            {EXAM_SECTIONS.map(s => {
              const correct = s.questions.filter(q => answers[q.id] === q.correctAnswer).length
              const total = s.questions.length
              const sPct = Math.round((correct / total) * 100)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate">{s.title}</span>
                      <span className={cn('text-xs font-bold ml-2 flex-shrink-0', sPct >= 70 ? 'text-green-600' : 'text-orange-600')}>{correct}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', sPct >= 70 ? 'bg-green-500' : 'bg-orange-400')} style={{ width: `${sPct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide px-1">Detailed Review</h2>
            {EXAM_SECTIONS.map((s, sIdx) => (
              <div key={s.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{sIdx + 1}</span>
                  <p className="text-sm font-bold text-gray-900">{s.title}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {s.questions.map((q, qIdx) => {
                    const userAnswer = answers[q.id]
                    const isCorrect = userAnswer === q.correctAnswer
                    const skipped = userAnswer === undefined
                    return (
                      <div key={q.id} className="p-4 space-y-3">
                        <div className="flex items-start gap-2.5">
                          {skipped
                            ? <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            : isCorrect
                              ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              : <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            Q{qIdx + 1}. {q.question}
                          </p>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctAnswer
                            const isUserPick = oIdx === userAnswer
                            let cls = 'border-gray-100 bg-gray-50 text-gray-500'
                            if (isCorrectOpt) cls = 'border-green-300 bg-green-50 text-green-800 font-semibold'
                            else if (isUserPick && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-700 line-through'
                            return (
                              <div key={oIdx} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${cls} text-xs`}>
                                <span className="font-bold flex-shrink-0">{String.fromCharCode(65 + oIdx)}</span>
                                <span>{opt}</span>
                                {isCorrectOpt && <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto flex-shrink-0" />}
                                {isUserPick && !isCorrect && <X className="w-3.5 h-3.5 text-red-500 ml-auto flex-shrink-0" />}
                              </div>
                            )
                          })}
                        </div>
                        <div className={cn('pl-6 p-3 rounded-xl text-xs leading-relaxed', isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800')}>
                          <span className="font-bold">{isCorrect ? '✓ Correct: ' : 'Explanation: '}</span>
                          {q.explanation}
                        </div>
                        {!isCorrect && !skipped && userAnswer !== undefined && (
                          <div className="pl-6">
                            <AiExplanation
                              questionId={q.id}
                              question={q.question}
                              options={q.options}
                              userAnswer={q.options[userAnswer]}
                              correctAnswer={q.options[q.correctAnswer]}
                              existingExplanation={q.explanation}
                              context="final exam"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pb-8">
            <button
              onClick={startExam}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" /> Retake Exam
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <button
                onClick={() => router.push('/curriculum')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
