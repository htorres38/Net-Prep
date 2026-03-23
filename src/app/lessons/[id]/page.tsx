'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle, Zap, Target,
  Trophy, RotateCcw, Lightbulb, ArrowRight, X, Brain, FileText,
  Star, Clock, PlayCircle, Globe, Network,
} from 'lucide-react'
import { useTimer } from '@/components/TimerProvider'
import { CCNA_CURRICULUM, getAllLessons, getLessonById } from '../../../data/ccna-curriculum'
import {
  TOPIC_COLORS, cn,
  topicBgLight, topicBgMed, topicText, topicTextDark, topicBtn, topicCard,
} from '@/lib/utils'
import { setLessonCompletion, getLessonCompletion, initProgress } from '@/lib/progress'
import AiExplanation from '@/components/AiExplanation'
import AiTutor from '@/components/AiTutor'

// types

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// quiz data

const LESSON_QUIZ_DATA: Record<string, QuizQuestion[]> = {
  'what-is-networking': [
    { id: 'l1q1', question: 'What is a computer network?', options: ['A type of operating system', 'A group of devices connected together to communicate', 'A storage device', 'A single computer system'], correctAnswer: 1, explanation: 'A computer network is a group of devices connected together so they can communicate and exchange data. This foundational definition underpins every topic in networking.' },
    { id: 'l1q2', question: 'Which of the following is an example of data traveling across a network?', options: ['Opening a website', 'Streaming a video', 'Sending an email', 'All of the above'], correctAnswer: 3, explanation: 'All three activities involve data traveling across a network — opening a website requests data from a remote server, streaming delivers continuous data, and email transmits data to another device.' },
  ],
  'types-of-networks': [
    { id: 'l2q1', question: 'Which network type connects devices within a small geographic area like a home or office?', options: ['WAN', 'LAN', 'Internet', 'MPLS'], correctAnswer: 1, explanation: 'A LAN (Local Area Network) connects devices within a limited geographic area such as a home, office, or school. LANs are typically fast, low-latency, and owned by a single organization.' },
    { id: 'l2q2', question: 'Which network type typically connects networks across large geographic distances?', options: ['LAN', 'WLAN', 'WAN', 'VLAN'], correctAnswer: 2, explanation: 'A WAN (Wide Area Network) connects multiple networks across large geographic distances, such as connecting offices in different cities. WANs often use ISP infrastructure including MPLS, fiber, and leased lines.' },
    { id: 'l2q3', question: 'What is the Internet?', options: ['A wireless LAN', 'A private network', 'A global network made up of many interconnected networks', 'A router protocol'], correctAnswer: 2, explanation: 'The Internet is the largest WAN in the world — a massive global network made up of millions of interconnected networks including home, corporate, ISP, and backbone networks.' },
  ],
  'network-devices-overview': [
    { id: 'l3q1', question: 'Which device forwards frames using MAC addresses?', options: ['Router', 'Switch', 'Firewall', 'Access Point'], correctAnswer: 1, explanation: 'A switch operates at Layer 2 (Data Link layer) and forwards Ethernet frames using MAC addresses. It maintains a MAC address table to efficiently deliver frames to the correct device within a LAN.' },
    { id: 'l3q2', question: 'Which device connects different networks together?', options: ['Switch', 'Router', 'Access Point', 'Printer'], correctAnswer: 1, explanation: 'A router operates at Layer 3 (Network layer) and connects different networks by forwarding packets using IP addresses. Routers use routing tables to determine the best path for data.' },
    { id: 'l3q3', question: 'Which device allows wireless devices to connect to a network?', options: ['Router', 'Firewall', 'Wireless Access Point', 'Switch'], correctAnswer: 2, explanation: 'A Wireless Access Point (AP) provides wireless connectivity by allowing devices to connect to a wired network via Wi-Fi (802.11). The AP bridges wireless devices to the wired LAN.' },
  ],
  'how-data-moves': [
    { id: 'l4q1', question: 'What unit of data is commonly sent across a network?', options: ['File', 'Packet', 'Signal', 'Frame'], correctAnswer: 1, explanation: 'Data is broken into packets for transmission. Each packet contains the data, source/destination addressing, and delivery instructions. Packets allow networks to handle multiple data streams simultaneously.' },
    { id: 'l4q2', question: 'Which device connects a local network to other networks such as the internet?', options: ['Switch', 'Router', 'Printer', 'Access Point'], correctAnswer: 1, explanation: 'A router connects a LAN to other networks, including the internet. The router forwards packets based on IP addresses using its routing table to determine the best path.' },
    { id: 'l4q3', question: 'What does traceroute show?', options: ['The speed of the internet connection', 'The path packets take through a network', 'The MAC address of a device', 'The operating system of a device'], correctAnswer: 1, explanation: 'Traceroute shows the path packets take through a network by displaying each router (hop) on the route to the destination. It is commonly used for troubleshooting connectivity issues.' },
  ],
  'osi-model-overview': [
    { id: 'l5q1', question: 'Which OSI layer is responsible for routing packets between networks?', options: ['Data Link', 'Network', 'Transport', 'Session'], correctAnswer: 1, explanation: 'The Network layer (Layer 3) handles logical addressing and routing packets between networks. Routers operate at this layer using IP addresses to find the best path.' },
    { id: 'l5q2', question: 'Which device commonly operates at the Data Link layer?', options: ['Router', 'Switch', 'Firewall', 'Server'], correctAnswer: 1, explanation: 'Switches operate at Layer 2 (Data Link layer), forwarding Ethernet frames using MAC addresses. Routers operate at Layer 3, and most firewalls operate at Layers 3–7.' },
    { id: 'l5q3', question: 'How many layers are in the OSI model?', options: ['4', '5', '7', '9'], correctAnswer: 2, explanation: 'The OSI model has 7 layers: Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7). Mnemonic: "All People Seem To Need Data Processing."' },
  ],
  'tcp-ip-model-overview': [
    { id: 'l6q1', question: 'How many layers are in the TCP/IP model?', options: ['4', '5', '6', '7'], correctAnswer: 0, explanation: 'The TCP/IP model has 4 layers: Application, Transport, Internet, and Network Access. It combines the OSI Session, Presentation, and Application layers into a single Application layer.' },
    { id: 'l6q2', question: 'Which TCP/IP layer is responsible for routing packets between networks?', options: ['Application', 'Transport', 'Internet', 'Network Access'], correctAnswer: 2, explanation: 'The Internet layer in TCP/IP corresponds to OSI Layer 3 (Network). It is responsible for logical IP addressing and routing packets between networks.' },
    { id: 'l6q3', question: 'Which protocol is responsible for logical addressing in the TCP/IP model?', options: ['HTTP', 'TCP', 'IP', 'FTP'], correctAnswer: 2, explanation: 'IP (Internet Protocol) operates at the Internet layer and provides logical addressing (IP addresses) and routing, determining the path data takes across networks.' },
  ],
  'encapsulation-decapsulation': [
    { id: 'l7q1', question: 'What is the process of adding headers to data as it moves down networking layers called?', options: ['Decapsulation', 'Encapsulation', 'Fragmentation', 'Compression'], correctAnswer: 1, explanation: 'Encapsulation is the process of wrapping data with headers as it moves down the networking stack. Each layer adds its own header containing addressing and control information.' },
    { id: 'l7q2', question: 'What is the name for data at the Network layer?', options: ['Frame', 'Packet', 'Segment', 'Bit'], correctAnswer: 1, explanation: 'At the Network layer (Layer 3), data is called a Packet. The Network layer adds an IP header with source and destination IP addresses.' },
    { id: 'l7q3', question: 'Which layer converts frames into signals for transmission across the network?', options: ['Transport', 'Network', 'Physical', 'Application'], correctAnswer: 2, explanation: 'The Physical layer (Layer 1) converts frames into electrical signals (copper), light pulses (fiber), or radio waves (wireless) for transmission across network media.' },
  ],
  'pdus-explained': [
    { id: 'l8q1', question: 'What does PDU stand for?', options: ['Packet Delivery Unit', 'Protocol Data Unit', 'Packet Distribution Utility', 'Protocol Device Utility'], correctAnswer: 1, explanation: 'PDU stands for Protocol Data Unit — the name given to data at a specific networking layer. The five PDU names are: Data, Segment, Packet, Frame, and Bits.' },
    { id: 'l8q2', question: 'What is the name of data at the Data Link layer?', options: ['Packet', 'Segment', 'Frame', 'Bit'], correctAnswer: 2, explanation: 'At Layer 2 (Data Link), data is called a Frame. An Ethernet frame contains source/destination MAC addresses, the data payload, and a Frame Check Sequence (FCS) for error detection.' },
    { id: 'l8q3', question: 'What is the name for data at the Transport layer when TCP is used?', options: ['Frame', 'Segment', 'Packet', 'Bit'], correctAnswer: 1, explanation: 'When TCP is used, data at the Transport layer is called a Segment. When UDP is used, it is called a Datagram. The Transport layer adds port numbers and (for TCP) sequencing information.' },
  ],
  'real-packet-journey': [
    { id: 'l9q1', question: 'Which device forwards frames within a local network?', options: ['Router', 'Switch', 'Firewall', 'Server'], correctAnswer: 1, explanation: 'A switch forwards Ethernet frames within a LAN using MAC addresses. It reads the destination MAC and forwards the frame to the correct port based on its MAC address table.' },
    { id: 'l9q2', question: 'Which device forwards packets between different networks?', options: ['Switch', 'Access Point', 'Router', 'Printer'], correctAnswer: 2, explanation: 'A router forwards packets between different networks using IP addresses. Routers examine the destination IP, consult their routing table, and forward packets toward the destination network.' },
    { id: 'l9q3', question: 'What command shows the path packets take across networks?', options: ['ping', 'traceroute', 'ipconfig', 'arp'], correctAnswer: 1, explanation: 'The traceroute command shows the sequence of routers (hops) a packet travels through to reach its destination. Each line represents a router that forwarded the packet.' },
  ],
  'interfaces-ports-media': [
    { id: 'l10q1', question: 'What hardware component allows a device to connect to a network?', options: ['CPU', 'Network Interface Card (NIC)', 'RAM', 'Hard Drive'], correctAnswer: 1, explanation: 'A NIC (Network Interface Card) allows a device to connect to a network. Every NIC has a unique MAC address. NICs can be built into the motherboard or installed as expansion cards.' },
    { id: 'l10q2', question: 'What is the most common connector used for Ethernet cables?', options: ['USB', 'HDMI', 'RJ-45', 'VGA'], correctAnswer: 2, explanation: 'RJ-45 is the standard 8-pin connector for Ethernet copper cables in LAN environments. It is the most common network connector found on computers, switches, and routers.' },
    { id: 'l10q3', question: 'Which OSI layer is responsible for transmitting bits across the network media?', options: ['Network', 'Transport', 'Data Link', 'Physical'], correctAnswer: 3, explanation: 'The Physical layer (Layer 1) transmits raw bits across network media, converting frames into electrical signals, light pulses, or radio waves.' },
  ],
  'copper-fiber-cabling': [
    { id: 'l11q1', question: 'Which cable type transmits data using electrical signals?', options: ['Fiber optic', 'Copper Ethernet', 'Wireless', 'Satellite'], correctAnswer: 1, explanation: 'Copper Ethernet cables transmit data using electrical signals through twisted wire pairs. Twisting reduces electromagnetic interference (EMI). Maximum distance is 100 meters.' },
    { id: 'l11q2', question: 'What is the typical maximum distance for Ethernet copper cables?', options: ['50 meters', '100 meters', '500 meters', '1 kilometer'], correctAnswer: 1, explanation: 'The maximum distance for Ethernet copper cables (Cat5e, Cat6, Cat6a) is 100 meters. Beyond this, signal degrades. Fiber optic cables are used for longer distances.' },
    { id: 'l11q3', question: 'Which cable type uses light to transmit data?', options: ['Copper cable', 'Coaxial cable', 'Fiber optic cable', 'Twisted pair cable'], correctAnswer: 2, explanation: 'Fiber optic cables transmit data using pulses of light through glass or plastic fiber. This enables much higher speeds, longer distances, and immunity to electromagnetic interference.' },
  ],
  'ethernet-fundamentals': [
    { id: 'l12q1', question: 'At which OSI layer does Ethernet primarily operate?', options: ['Physical', 'Data Link', 'Network', 'Transport'], correctAnswer: 1, explanation: 'Ethernet operates primarily at Layer 2 (Data Link layer) using MAC addresses to identify devices and transmit data in frames. The Physical layer handles the actual electrical signals.' },
    { id: 'l12q2', question: 'What type of address is used by Ethernet to identify devices on a network?', options: ['IP address', 'MAC address', 'Port number', 'Hostname'], correctAnswer: 1, explanation: 'Ethernet uses MAC (Media Access Control) addresses to identify devices on a local network. MAC addresses are 48-bit hardware addresses permanently assigned to network interfaces.' },
    { id: 'l12q3', question: 'What unit of data is used by Ethernet?', options: ['Packet', 'Segment', 'Frame', 'Bit'], correctAnswer: 2, explanation: 'Ethernet transmits data in Frames. An Ethernet frame contains the destination MAC, source MAC, EtherType, data payload, and Frame Check Sequence (FCS) for error detection.' },
  ],
  'ethernet-frame-structure': [
    { id: 'l13q1', question: 'What unit of data does Ethernet use to transmit information?', options: ['Packet', 'Segment', 'Frame', 'Bit'], correctAnswer: 2, explanation: 'Ethernet uses Frames to transmit data. A frame is the Layer 2 PDU that encapsulates the payload along with MAC addressing and error-checking information for local delivery.' },
    { id: 'l13q2', question: 'Which field in an Ethernet frame identifies the receiving device?', options: ['Source MAC address', 'Destination MAC address', 'EtherType', 'Frame Check Sequence'], correctAnswer: 1, explanation: 'The Destination MAC address field identifies the device that should receive the frame. The switch reads this address and consults its MAC table to determine which port to forward to.' },
    { id: 'l13q3', question: 'What is the purpose of the Frame Check Sequence (FCS)?', options: ['Identify the destination device', 'Identify the protocol type', 'Detect transmission errors', 'Store the IP address'], correctAnswer: 2, explanation: 'The FCS is used for error detection. The sender calculates a checksum and appends it. The receiver recalculates — if they don\'t match, the frame was corrupted and is discarded.' },
  ],
  'mac-addresses': [
    { id: 'l14q1', question: 'How many bits long is a MAC address?', options: ['32', '48', '64', '128'], correctAnswer: 1, explanation: 'A MAC address is 48 bits long, written as 12 hexadecimal characters (e.g., 00:1A:2B:3C:4D:5E). It is divided into the OUI (manufacturer, first 24 bits) and device identifier (last 24 bits).' },
    { id: 'l14q2', question: 'Which part of a MAC address identifies the manufacturer?', options: ['Last 24 bits', 'Middle 16 bits', 'First 24 bits', 'Entire address'], correctAnswer: 2, explanation: 'The first 24 bits (first 3 bytes) are the OUI (Organizationally Unique Identifier) and identify the manufacturer. The last 24 bits identify the specific device.' },
    { id: 'l14q3', question: 'At which OSI layer do MAC addresses operate?', options: ['Physical', 'Data Link', 'Network', 'Transport'], correctAnswer: 1, explanation: 'MAC addresses operate at Layer 2 (Data Link layer) and are used for local network delivery within the same network segment. IP addresses at Layer 3 handle inter-network routing.' },
  ],
  'unicast-broadcast-multicast': [
    { id: 'l15q1', question: 'Which communication type sends data from one device to one specific device?', options: ['Broadcast', 'Multicast', 'Unicast', 'Flooding'], correctAnswer: 2, explanation: 'Unicast sends data from one device to one specific device. The Ethernet frame contains the MAC address of the single destination. This is the most common type of network communication.' },
    { id: 'l15q2', question: 'What MAC address is used for Ethernet broadcast frames?', options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', 'AA:AA:AA:AA:AA:AA', '11:11:11:11:11:11'], correctAnswer: 1, explanation: 'Ethernet broadcast frames use FF:FF:FF:FF:FF:FF as the destination MAC. When a switch receives this, it forwards the frame out all ports except the one it arrived on.' },
    { id: 'l15q3', question: 'Which communication type sends data to a specific group of devices?', options: ['Broadcast', 'Multicast', 'Unicast', 'Loopback'], correctAnswer: 1, explanation: 'Multicast sends data to a specific group of devices that have joined the multicast group. It is more efficient than broadcast for applications like video streaming.' },
  ],
  'switch-mac-learning': [
    { id: 'l16q1', question: 'What information does a switch learn from incoming frames?', options: ['Destination IP address', 'Source MAC address', 'Destination port number', 'DNS server address'], correctAnswer: 1, explanation: 'A switch learns the source MAC address from incoming frames, recording it along with the arrival port in the MAC address table (CAM table) to enable efficient future forwarding.' },
    { id: 'l16q2', question: 'What table does a switch use to store learned MAC addresses?', options: ['Routing table', 'ARP table', 'MAC address table', 'DNS table'], correctAnswer: 2, explanation: 'Switches use a MAC address table (also called a CAM table — Content Addressable Memory) to store learned MAC addresses and their corresponding ports for efficient frame forwarding.' },
    { id: 'l16q3', question: 'Which command displays the MAC address table on a Cisco switch?', options: ['show ip route', 'show interfaces', 'show mac address-table', 'show arp'], correctAnswer: 2, explanation: '"show mac address-table" displays the MAC address table on a Cisco switch, showing which MAC addresses have been learned and the ports they are associated with.' },
  ],
  'mac-address-tables': [
    { id: 'l17q1', question: 'Which address does a switch learn from incoming frames?', options: ['Destination MAC address', 'Source MAC address', 'Source IP address', 'Destination IP address'], correctAnswer: 1, explanation: 'A switch learns the source MAC address from incoming frames. By recording where frames originate, the switch builds its MAC table and can later forward frames directly to the correct port.' },
    { id: 'l17q2', question: 'What happens if a switch receives a frame with an unknown destination MAC address?', options: ['The frame is dropped', 'The frame is sent to the router', 'The frame is flooded to all ports except the incoming port', 'The frame is stored in memory'], correctAnswer: 2, explanation: 'When a switch receives a frame with an unknown destination MAC, it floods the frame to all ports except the incoming port. When the destination device replies, the switch learns its MAC address.' },
    { id: 'l17q3', question: 'What is it called when a switch sends a frame only to the correct destination port?', options: ['Flooding', 'Forwarding', 'Filtering', 'Routing'], correctAnswer: 1, explanation: 'When a switch sends a frame only to the correct destination port because the destination MAC is known, this is called Forwarding — the normal efficient operation after MAC addresses are learned.' },
  ],
  'unknown-unicast-flooding': [
    { id: 'l18q1', question: 'What type of frame occurs when a switch receives a frame with a destination MAC not in its table?', options: ['Broadcast', 'Multicast', 'Unknown unicast', 'Loopback'], correctAnswer: 2, explanation: 'An unknown unicast frame has a single destination MAC address, but the switch does not know which port leads to that device. Unable to forward directly, the switch floods it to all other ports.' },
    { id: 'l18q2', question: 'What action does a switch take when it receives an unknown unicast frame?', options: ['Drops the frame', 'Sends the frame to the router', 'Floods the frame to all ports except the incoming port', 'Sends the frame back to the sender'], correctAnswer: 2, explanation: 'The switch floods the unknown unicast frame to all ports except the incoming port, ensuring the destination device receives it. Once the device replies, the switch learns its MAC address.' },
    { id: 'l18q3', question: 'What is it called when a switch does not forward a frame because it is unnecessary?', options: ['Flooding', 'Filtering', 'Routing', 'Bridging'], correctAnswer: 1, explanation: 'Filtering occurs when a switch determines a frame does not need to be forwarded — for example, when the destination device is on the same port as the source. This prevents unnecessary traffic.' },
  ],
  'collision-vs-broadcast-domains': [
    { id: 'l19q1', question: 'Which device separates collision domains?', options: ['Hub', 'Switch', 'Repeater', 'Cable'], correctAnswer: 1, explanation: 'A switch separates collision domains by creating one domain per port. Devices on different ports do not compete for the same transmission medium and cannot cause collisions with each other.' },
    { id: 'l19q2', question: 'Which device separates broadcast domains?', options: ['Switch', 'Router', 'Hub', 'Bridge'], correctAnswer: 1, explanation: 'A router separates broadcast domains. Broadcast frames (FF:FF:FF:FF:FF:FF) do not cross a router. This prevents broadcast storms from spreading across large networks and improves performance.' },
    { id: 'l19q3', question: 'What type of traffic is sent to all devices within a broadcast domain?', options: ['Unicast', 'Multicast', 'Broadcast', 'Segmented'], correctAnswer: 2, explanation: 'Broadcast traffic is sent to all devices within the broadcast domain using destination MAC FF:FF:FF:FF:FF:FF. Common examples include ARP requests and DHCP discovery messages.' },
  ],
  'arp-fundamentals': [
    { id: 'l20q1', question: 'What does ARP do?', options: ['Resolves MAC addresses to IP addresses', 'Resolves IP addresses to MAC addresses', 'Routes packets between networks', 'Encrypts network traffic'], correctAnswer: 1, explanation: 'ARP (Address Resolution Protocol) resolves IP addresses to MAC addresses. When a device knows the IP but needs the MAC to create an Ethernet frame, it sends an ARP broadcast request.' },
    { id: 'l20q2', question: 'What type of frame is used for an ARP request?', options: ['Unicast', 'Multicast', 'Broadcast', 'Loopback'], correctAnswer: 2, explanation: 'ARP requests are sent as broadcast frames (destination FF:FF:FF:FF:FF:FF). This ensures all devices on the local network receive the "Who has this IP address?" query.' },
    { id: 'l20q3', question: 'Where are ARP mappings stored on a device?', options: ['Routing table', 'ARP table', 'MAC table', 'DNS table'], correctAnswer: 1, explanation: 'ARP mappings (IP-to-MAC bindings) are stored in the ARP table (ARP cache). Entries expire after a timeout period to prevent the table from holding outdated information.' },
  ],
  'arp-tables-requests-replies': [
    { id: 'l21q1', question: 'What information is stored in an ARP table?', options: ['IP address to MAC address mapping', 'MAC address to switch port mapping', 'DNS name to IP mapping', 'Routing paths between networks'], correctAnswer: 0, explanation: 'An ARP table stores IP-to-MAC address mappings, allowing devices to quickly find the MAC address for a known IP without sending another ARP broadcast.' },
    { id: 'l21q2', question: 'What type of message is an ARP request?', options: ['Unicast', 'Broadcast', 'Multicast', 'Directed'], correctAnswer: 1, explanation: 'An ARP request is a broadcast — all devices on the local network receive it because the sender does not yet know which device owns the requested IP address.' },
    { id: 'l21q3', question: 'What type of message is an ARP reply?', options: ['Broadcast', 'Multicast', 'Unicast', 'Flooded'], correctAnswer: 2, explanation: 'An ARP reply is a unicast message sent directly to the device that sent the ARP request. Only the device that owns the requested IP responds with its MAC address.' },
  ],
  'packet-walkthrough-same-lan': [
    { id: 'l22q1', question: 'What protocol is used to discover a MAC address from an IP address?', options: ['DNS', 'ARP', 'DHCP', 'ICMP'], correctAnswer: 1, explanation: 'ARP (Address Resolution Protocol) discovers the MAC address associated with a known IP address by sending a broadcast request and receiving a unicast reply.' },
    { id: 'l22q2', question: 'What type of message is an ARP request?', options: ['Unicast', 'Multicast', 'Broadcast', 'Directed'], correctAnswer: 2, explanation: 'An ARP request is a broadcast (destination FF:FF:FF:FF:FF:FF). All devices on the local network receive it, but only the device with the matching IP replies.' },
    { id: 'l22q3', question: 'Which address does a switch use to forward Ethernet frames?', options: ['IP address', 'Port number', 'MAC address', 'DNS name'], correctAnswer: 2, explanation: 'Switches forward Ethernet frames using MAC addresses. The switch reads the destination MAC and consults its MAC address table to determine which port to send the frame out of.' },
  ],
  'ipv4-address-structure': [
    { id: 'l23q1', question: 'How many bits long is an IPv4 address?', options: ['16', '32', '64', '128'], correctAnswer: 1, explanation: 'An IPv4 address is 32 bits long, divided into four 8-bit octets in dotted-decimal notation (e.g., 192.168.1.10). IPv6 uses 128-bit addresses.' },
    { id: 'l23q2', question: 'How many octets are in an IPv4 address?', options: ['2', '4', '6', '8'], correctAnswer: 1, explanation: 'An IPv4 address contains 4 octets (groups of 8 bits), separated by dots. For example: 192.168.1.10 has octets 192, 168, 1, and 10.' },
    { id: 'l23q3', question: 'What is the maximum value of a single IPv4 octet?', options: ['128', '192', '255', '512'], correctAnswer: 2, explanation: 'The maximum octet value is 255 (11111111 in binary — all 8 bits set to 1). The minimum is 0. This gives an address range of 0.0.0.0 to 255.255.255.255.' },
  ],
  'network-vs-host-portion': [
    { id: 'l24q1', question: 'What determines where the network portion of an IP address ends?', options: ['MAC address', 'Subnet mask', 'DNS server', 'Default gateway'], correctAnswer: 1, explanation: 'The subnet mask determines the boundary between the network and host portions. The 1s in the subnet mask represent the network portion; the 0s represent the host portion.' },
    { id: 'l24q2', question: 'Which part of the IP address identifies a specific device on the network?', options: ['Network portion', 'Host portion', 'Broadcast address', 'Gateway portion'], correctAnswer: 1, explanation: 'The host portion identifies a specific device within a network. In 192.168.1.10/24, the last octet (10) is the host portion, uniquely identifying that device in the 192.168.1.0 network.' },
    { id: 'l24q3', question: 'If a device determines the destination is on another network, where does it send the packet?', options: ['Switch', 'DNS server', 'Default gateway', 'Broadcast address'], correctAnswer: 2, explanation: 'When a destination IP is on a different network, the device sends the packet to the default gateway (the local router). The router then forwards the packet toward the destination network.' },
  ],
  'cidr-notation': [
    { id: 'l25q1', question: 'What does the prefix length /24 represent?', options: ['24 decimal values', '24 bits used for the network portion', '24 devices on the network', '24 routers on the network'], correctAnswer: 1, explanation: '/24 means the first 24 bits are the network portion, corresponding to subnet mask 255.255.255.0. The remaining 8 bits identify hosts within that network.' },
    { id: 'l25q2', question: 'What subnet mask corresponds to /24?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], correctAnswer: 2, explanation: '/24 = 255.255.255.0. The first 24 bits are 1s (11111111.11111111.11111111) and the last 8 bits are 0s (00000000), representing the host portion.' },
    { id: 'l25q3', question: 'How many total bits are in an IPv4 address?', options: ['16', '24', '32', '64'], correctAnswer: 2, explanation: 'An IPv4 address is 32 bits total, which is why the maximum CIDR prefix is /32 (all bits are network bits, representing a single host). CIDR notation ranges from /0 to /32.' },
  ],
  'binary-basics': [
    { id: 'l26q1', question: 'How many bits are in a single IPv4 octet?', options: ['4', '8', '16', '32'], correctAnswer: 1, explanation: 'Each IPv4 octet contains 8 bits. An IPv4 address has 4 octets × 8 bits = 32 total bits. Each bit position represents a power of 2: 128, 64, 32, 16, 8, 4, 2, 1.' },
    { id: 'l26q2', question: 'What is the decimal value of binary 11000000?', options: ['64', '128', '192', '256'], correctAnswer: 2, explanation: '11000000 = 128 + 64 = 192. The first bit (128) is ON, the second bit (64) is ON, all others are OFF. This is the first octet of addresses like 192.168.x.x.' },
    { id: 'l26q3', question: 'Which numbering system uses only 0 and 1?', options: ['Decimal', 'Binary', 'Hexadecimal', 'Octal'], correctAnswer: 1, explanation: 'Binary uses only 0 and 1, representing electronic circuits as on (1) or off (0). IPv4 addresses and subnet masks are stored and processed in binary internally.' },
  ],
  'subnet-masks': [
    { id: 'l27q1', question: 'What is the purpose of a subnet mask?', options: ['Identify the MAC address', 'Separate the network and host portions of an IP address', 'Assign IP addresses automatically', 'Encrypt network traffic'], correctAnswer: 1, explanation: 'A subnet mask separates the network and host portions of an IP address. The 1 bits mark the network portion; the 0 bits mark the host portion, enabling routers and hosts to determine which network a device belongs to.' },
    { id: 'l27q2', question: 'Which subnet mask corresponds to the prefix length /24?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], correctAnswer: 2, explanation: '/24 means 24 bits are the network portion. In dotted-decimal, 24 consecutive 1-bits = 255.255.255.0. The last octet (all 0s) represents the host portion.' },
    { id: 'l27q3', question: 'In a subnet mask, what do the binary 1s represent?', options: ['Host portion', 'Network portion', 'Broadcast address', 'Default gateway'], correctAnswer: 1, explanation: 'The 1 bits in a subnet mask identify the network portion of an IP address. The 0 bits identify the host portion. ANDing the IP address with the subnet mask reveals the network address.' },
  ],
  'public-vs-private-ipv4': [
    { id: 'l28q1', question: 'Which of the following is a private IPv4 address?', options: ['8.8.8.8', '192.168.1.10', '54.23.17.2', '1.1.1.1'], correctAnswer: 1, explanation: '192.168.1.10 is in the 192.168.0.0/16 range, one of the three RFC 1918 private ranges. Private addresses are not routable on the public internet and are used inside organizations.' },
    { id: 'l28q2', question: 'Which range is reserved for private IPv4 addressing?', options: ['8.0.0.0 – 8.255.255.255', '192.168.0.0 – 192.168.255.255', '50.0.0.0 – 50.255.255.255', '1.0.0.0 – 1.255.255.255'], correctAnswer: 1, explanation: 'RFC 1918 defines three private ranges: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. The 192.168.0.0–192.168.255.255 range is the most commonly used for home and small office networks.' },
    { id: 'l28q3', question: 'What technology allows private IP addresses to communicate with the internet?', options: ['DHCP', 'DNS', 'NAT', 'ARP'], correctAnswer: 2, explanation: 'NAT (Network Address Translation) translates private IP addresses to a public IP address before packets leave the network. This allows many devices with private addresses to share a single public IP.' },
  ],
  'apipa-special-addresses': [
    { id: 'l29q1', question: 'Which RFC defines the APIPA address range?', options: ['RFC 1918', 'RFC 3927', 'RFC 802.3', 'RFC 791'], correctAnswer: 1, explanation: 'RFC 3927 defines the APIPA (Automatic Private IP Addressing) range of 169.254.0.0/16. These addresses are self-assigned by a host when no DHCP server is reachable.' },
    { id: 'l29q2', question: 'What is the default subnet mask for an APIPA address?', options: ['255.0.0.0', '255.255.255.0', '255.255.0.0', '255.255.255.255'], correctAnswer: 2, explanation: 'APIPA addresses always use a /16 subnet mask (255.255.0.0), covering the entire 169.254.0.0–169.254.255.255 range. All APIPA hosts are on the same link-local network.' },
    { id: 'l29q3', question: 'A technician runs ipconfig on a PC and sees the address 169.254.45.12. What is the most likely cause?', options: ['The router assigned the address', 'The PC failed to contact a DHCP server', 'DNS resolution failed', 'The NIC hardware failed'], correctAnswer: 1, explanation: 'A 169.254.x.x address indicates APIPA — the PC could not reach a DHCP server and self-assigned a link-local address. This usually signals a DHCP or network connectivity problem.' },
  ],
  'subnetting-fundamentals': [
    { id: 'l30q1', question: 'What is the purpose of subnetting?', options: ['Encrypt network traffic', 'Divide networks into smaller segments', 'Increase internet speed', 'Replace routers'], correctAnswer: 1, explanation: 'Subnetting divides a large network into smaller, more manageable segments. This reduces broadcast domains, improves security, and allows more efficient use of IP address space.' },
    { id: 'l30q2', question: 'What device allows communication between different subnets?', options: ['Switch', 'Router', 'Access Point', 'Firewall'], correctAnswer: 1, explanation: 'Routers operate at Layer 3 and forward packets between different subnets using IP addresses and routing tables. Switches only forward frames within the same subnet at Layer 2.' },
    { id: 'l30q3', question: 'PC A has IP 192.168.1.10/24 and PC B has IP 192.168.2.15/24. What must happen for PC A to reach PC B?', options: ['PC A sends the packet directly to PC B', 'PC A sends the packet to the default gateway', 'PC A uses ARP to find PC B', 'PC A broadcasts the packet'], correctAnswer: 1, explanation: 'Because PC A and PC B are on different subnets (/24 means different third octets = different networks), PC A must send traffic to its default gateway (router) which then forwards it to the 192.168.2.0/24 network.' },
  ],
  'network-broadcast-host-range': [
    { id: 'l31q1', question: 'What is the network address of subnet 192.168.1.0/24?', options: ['192.168.1.1', '192.168.1.0', '192.168.1.254', '192.168.1.255'], correctAnswer: 1, explanation: 'The network address is the first address in the subnet where all host bits are 0. For 192.168.1.0/24, the last octet is all zeros, making 192.168.1.0 the network address.' },
    { id: 'l31q2', question: 'What is the broadcast address of subnet 192.168.1.0/24?', options: ['192.168.1.0', '192.168.1.1', '192.168.1.254', '192.168.1.255'], correctAnswer: 3, explanation: 'The broadcast address is the last address in the subnet where all host bits are 1. For 192.168.1.0/24, the host portion is the last octet — all 1s = 255, giving broadcast 192.168.1.255.' },
    { id: 'l31q3', question: 'A device has IP 192.168.1.100/24. Which address is the broadcast address?', options: ['192.168.1.0', '192.168.1.1', '192.168.1.255', '192.168.255.255'], correctAnswer: 2, explanation: 'With /24, the last octet is the host portion. Setting all host bits to 1 gives 255. The broadcast address for the 192.168.1.0/24 subnet is 192.168.1.255.' },
  ],
  'subnetting-patterns': [
    { id: 'l32q1', question: 'What is the block size for subnet mask 255.255.255.192?', options: ['16', '32', '64', '128'], correctAnswer: 2, explanation: '255.255.255.192 = /26. The last octet is 192 (11000000). The block size = 256 − 192 = 64. Subnets occur at multiples of 64: .0, .64, .128, .192.' },
    { id: 'l32q2', question: 'Which prefix length creates subnets with 64 addresses?', options: ['/24', '/26', '/27', '/28'], correctAnswer: 1, explanation: '/26 leaves 6 host bits: 2^6 = 64 addresses per subnet. The block size of 64 means subnets start at .0, .64, .128, .192 in the last octet.' },
    { id: 'l32q3', question: 'A device has IP 192.168.1.70 with mask 255.255.255.192. Which subnet does it belong to?', options: ['192.168.1.0 – 192.168.1.63', '192.168.1.64 – 192.168.1.127', '192.168.1.128 – 192.168.1.191', '192.168.1.192 – 192.168.1.255'], correctAnswer: 1, explanation: '/26 has block size 64. Subnets: .0–.63, .64–.127, .128–.191, .192–.255. Address .70 falls in the .64–.127 range, so it belongs to the 192.168.1.64/26 subnet.' },
  ],
  'vlsm': [
    { id: 'l33q1', question: 'What does VLSM allow in a network?', options: ['Multiple subnet sizes within the same network', 'Only equal-sized subnets', 'Only Class A networks', 'Only private IP addressing'], correctAnswer: 0, explanation: 'VLSM (Variable Length Subnet Masking) allows subnets of different sizes within the same major network. This optimizes IP address usage by matching each subnet size to its actual host requirements.' },
    { id: 'l33q2', question: 'What is the main advantage of VLSM?', options: ['Faster routing', 'Improved IP address efficiency', 'Increased network speed', 'Eliminates routers'], correctAnswer: 1, explanation: 'VLSM improves IP address efficiency by allowing each subnet to be sized appropriately — a WAN link gets a /30 (2 hosts), a small office gets a /28 (14 hosts), preventing waste of address space.' },
    { id: 'l33q3', question: 'A company needs subnets for Engineering (120 hosts), Sales (40 hosts), and a WAN link (2 hosts). Which subnet should be allocated first in VLSM design?', options: ['WAN link', 'Sales network', 'Engineering network', 'Any order works'], correctAnswer: 2, explanation: 'In VLSM design, always allocate the largest subnet first to ensure it fits without fragmentation. Engineering needs 120 hosts → /25 (126 hosts). Allocate it from the start of the address block, then Sales, then WAN.' },
  ],
  'default-gateway': [
    { id: 'l34q1', question: 'What device typically serves as the default gateway?', options: ['Switch', 'Router', 'Access point', 'Firewall'], correctAnswer: 1, explanation: 'The default gateway is the router interface on the local subnet. When a host needs to send traffic to a different network, it forwards the packet to the default gateway which routes it onward.' },
    { id: 'l34q2', question: 'When does a host send traffic to the default gateway?', options: ['When communicating with devices on the same subnet', 'When communicating with devices on a different subnet', 'When sending ARP requests', 'When assigning DHCP addresses'], correctAnswer: 1, explanation: 'A host sends traffic to its default gateway only when the destination IP is on a different subnet. If the destination is local (same subnet), the host communicates directly using ARP and the switch.' },
    { id: 'l34q3', question: 'A PC (IP: 192.168.1.20/24, Gateway: 192.168.1.1) attempts to reach 192.168.1.50. Where will the packet be sent?', options: ['Directly to the router', 'Directly to 192.168.1.50', 'To the broadcast address', 'To the DNS server'], correctAnswer: 1, explanation: '192.168.1.50 is in the same /24 subnet as the PC. Since it is a local destination, the PC sends directly to 192.168.1.50 using ARP to find its MAC — no gateway needed.' },
  ],
  'packet-walkthrough-local-vs-remote': [
    { id: 'l35q1', question: 'When two hosts are on the same subnet, how do they communicate?', options: ['Through a router', 'Through a switch', 'Through a firewall', 'Through a DNS server'], correctAnswer: 1, explanation: 'Hosts on the same subnet communicate through a switch at Layer 2 using MAC addresses. No router is needed — the switch forwards Ethernet frames directly between devices on the same network.' },
    { id: 'l35q2', question: 'When a host sends traffic to another subnet, where is the packet sent first?', options: ['The broadcast address', 'The DNS server', 'The default gateway', 'The destination host'], correctAnswer: 2, explanation: 'When the destination is on a different subnet, the host sends the packet to its default gateway (the router\'s local interface). The router then forwards the packet toward the destination network.' },
    { id: 'l35q3', question: 'A host sends traffic to a remote server. What happens to the MAC address when the packet passes through a router?', options: ['It remains the same', 'It changes at each hop', 'It becomes a broadcast address', 'It is removed'], correctAnswer: 1, explanation: 'The destination MAC address changes at each router hop. Each router strips the old frame and creates a new Ethernet frame with the next-hop MAC as the destination. The IP addresses remain unchanged end-to-end.' },
  ],
  'icmp-and-ping': [
    { id: 'l36q1', question: 'What protocol does the ping command use?', options: ['TCP', 'UDP', 'ICMP', 'ARP'], correctAnswer: 2, explanation: 'Ping uses ICMP (Internet Control Message Protocol). It sends ICMP Echo Request messages and listens for ICMP Echo Reply messages to test reachability and measure round-trip time.' },
    { id: 'l36q2', question: 'What type of ICMP message does ping send first?', options: ['Echo Reply', 'Echo Request', 'Destination Unreachable', 'Redirect'], correctAnswer: 1, explanation: 'Ping sends an ICMP Echo Request to the target. If the target is reachable and not blocking ICMP, it responds with an ICMP Echo Reply, confirming connectivity.' },
    { id: 'l36q3', question: 'A technician runs "ping 192.168.1.1" and sees five dots (.....). What does this indicate?', options: ['The router is functioning normally', 'The device did not receive any replies', 'DNS resolution failed', 'The switch is offline'], correctAnswer: 1, explanation: 'On Cisco IOS, a dot (.) represents a timeout — no reply received. Five dots means all five ping attempts timed out, indicating the destination is unreachable or ICMP is being blocked.' },
  ],
  'troubleshooting-ipv4': [
    { id: 'l37q1', question: 'What is the first step when troubleshooting a connectivity problem?', options: ['Replace the router', 'Verify the physical connection', 'Reconfigure the subnet mask', 'Restart the server'], correctAnswer: 1, explanation: 'Always start troubleshooting at the Physical layer (Layer 1). A disconnected cable or link-down interface is the most common cause of connectivity failure and is the quickest to rule out.' },
    { id: 'l37q2', question: 'Which command is commonly used to test network connectivity?', options: ['show version', 'ping', 'show running-config', 'show vlan'], correctAnswer: 1, explanation: 'The ping command tests end-to-end IP connectivity using ICMP Echo Request/Reply messages. It quickly shows whether a destination is reachable from the source device.' },
    { id: 'l37q3', question: 'A PC can successfully ping 127.0.0.1 but cannot ping its default gateway. What does this indicate?', options: ['The TCP/IP stack is working but there may be a network connectivity problem', 'The DNS server is down', 'The subnet mask is wrong', 'The PC has no IP address'], correctAnswer: 0, explanation: 'Pinging 127.0.0.1 (loopback) confirms the local TCP/IP stack works. Failing to ping the default gateway suggests a physical, VLAN, or IP configuration problem between the PC and the router.' },
  ],
  'what-routers-do': [
    { id: 'l38q1', question: 'What is the primary role of a router?', options: ['Assign IP addresses', 'Connect multiple networks and forward packets', 'Convert IP addresses to MAC addresses', 'Provide wireless connectivity'], correctAnswer: 1, explanation: 'Routers connect multiple IP networks and forward packets between them using routing tables. They operate at Layer 3 and make forwarding decisions based on destination IP addresses.' },
    { id: 'l38q2', question: 'At which OSI layer do routers primarily operate?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], correctAnswer: 2, explanation: 'Routers operate at Layer 3 (Network layer). They examine IP addresses in packets and use routing tables to determine the best path to forward packets toward their destination.' },
    { id: 'l38q3', question: 'PC A (192.168.1.10) wants to communicate with PC B (192.168.2.20). What device must forward the packet?', options: ['Switch', 'Router', 'Access point', 'DNS server'], correctAnswer: 1, explanation: 'PC A and PC B are on different subnets (192.168.1.0/24 and 192.168.2.0/24). Only a router can forward packets between different IP networks.' },
  ],
  'router-interfaces-l3-forwarding': [
    { id: 'l39q1', question: 'What role does a router interface typically serve for devices on a local network?', options: ['DNS server', 'Default gateway', 'DHCP server', 'Firewall'], correctAnswer: 1, explanation: 'Each router interface connected to a LAN serves as the default gateway for devices on that subnet. Hosts send all off-subnet traffic to the router interface IP address.' },
    { id: 'l39q2', question: 'What information does a router examine to decide where to forward a packet?', options: ['Destination MAC address', 'Destination IP address', 'Source MAC address', 'Source port number'], correctAnswer: 1, explanation: 'Routers examine the destination IP address and look it up in the routing table to determine the outgoing interface and next-hop router. MAC addresses are used at Layer 2 within each hop.' },
    { id: 'l39q3', question: 'A router receives a packet destined for 192.168.2.0/24. What action does the router perform?', options: ['Forward the packet out the interface connected to 192.168.2.0/24', 'Drop the packet', 'Send an ARP request for the destination', 'Broadcast the packet'], correctAnswer: 0, explanation: 'The router looks up 192.168.2.0/24 in its routing table, finds the matching route, and forwards the packet out the interface connected to that network toward the destination.' },
  ],
  'routing-tables': [
    { id: 'l40q1', question: 'What is the purpose of a routing table?', options: ['Assign IP addresses to devices', 'Store network paths used for packet forwarding', 'Convert IP addresses to MAC addresses', 'Manage VLAN configurations'], correctAnswer: 1, explanation: 'The routing table stores routes to known networks, including the network address, prefix, next-hop IP or outgoing interface, and the route source. Routers consult it for every packet forwarding decision.' },
    { id: 'l40q2', question: 'What information does a router use to search its routing table?', options: ['Source IP address', 'Destination IP address', 'MAC address', 'Port number'], correctAnswer: 1, explanation: 'Routers perform a longest prefix match lookup using the destination IP address. The most specific matching route in the routing table determines where the packet is forwarded.' },
    { id: 'l40q3', question: 'A router has route 192.168.2.0/24 → G0/1. A packet arrives destined for 192.168.2.25. What does the router do?', options: ['Drop the packet', 'Forward the packet out G0/1', 'Send an ARP request', 'Broadcast the packet'], correctAnswer: 1, explanation: '192.168.2.25 matches the 192.168.2.0/24 route. The router forwards the packet out interface G0/1, then sends an ARP request if needed to find the MAC address of the next hop or destination.' },
  ],
  'connected-and-local-routes': [
    { id: 'l41q1', question: 'What does the letter "C" represent in a routing table?', options: ['Configured route', 'Connected route', 'Central route', 'Core route'], correctAnswer: 1, explanation: '"C" in a Cisco routing table indicates a Connected route — a network directly attached to one of the router\'s interfaces. These are automatically added when an interface is configured with an IP and is active.' },
    { id: 'l41q2', question: 'What does a local route represent?', options: ['A remote network', 'The router\'s interface IP address', 'The default gateway', 'A DHCP address'], correctAnswer: 1, explanation: 'A local route (marked "L" in the routing table) represents the exact IP address of a router interface (/32 host route). It tells the router this specific IP belongs to itself, not a connected network.' },
    { id: 'l41q3', question: 'A router interface is configured with 192.168.1.1/24. Which connected route appears in the routing table?', options: ['192.168.1.1/24', '192.168.1.0/24', '192.168.0.0/24', '192.168.1.255/24'], correctAnswer: 1, explanation: 'The connected route (C) shows the network address, not the interface IP. 192.168.1.1/24 is in the 192.168.1.0/24 network, so 192.168.1.0/24 appears as the connected route.' },
  ],
  'static-routes': [
    { id: 'l42q1', question: 'What is a static route?', options: ['A route learned automatically from a routing protocol', 'A route manually configured by a network engineer', 'A route learned from ARP', 'A route generated by DHCP'], correctAnswer: 1, explanation: 'Static routes are manually entered by administrators using the "ip route" command. They do not update automatically when topology changes, but provide predictable, low-overhead routing for simple or specific paths.' },
    { id: 'l42q2', question: 'Which Cisco IOS command is used to configure a static route?', options: ['route add', 'ip static route', 'ip route', 'add route'], correctAnswer: 2, explanation: 'The "ip route" command configures static routes on Cisco IOS. Syntax: ip route [network] [mask] [next-hop-IP or exit-interface]. Example: ip route 192.168.5.0 255.255.255.0 10.0.0.2' },
    { id: 'l42q3', question: 'To reach 192.168.5.0/24 via next-hop 10.0.0.2, which command is correct?', options: ['ip route 192.168.5.0 255.255.255.0 10.0.0.2', 'ip route 10.0.0.2 255.255.255.0 192.168.5.0', 'ip static 192.168.5.0/24 10.0.0.2', 'route add 192.168.5.0/24 via 10.0.0.2'], correctAnswer: 0, explanation: '"ip route 192.168.5.0 255.255.255.0 10.0.0.2" — the order is always: destination network, subnet mask, then next-hop IP address (or exit interface).' },
  ],
  'default-routes': [
    { id: 'l43q1', question: 'What network prefix represents the default route?', options: ['255.255.255.255/32', '192.168.0.0/16', '0.0.0.0/0', '127.0.0.0/8'], correctAnswer: 2, explanation: '0.0.0.0/0 is the default route — the "catch-all" route that matches any destination when no more specific route exists. It is often called the "gateway of last resort."' },
    { id: 'l43q2', question: 'What is the primary purpose of a default route?', options: ['Assign IP addresses automatically', 'Forward packets when no specific route exists', 'Resolve MAC addresses', 'Manage VLAN traffic'], correctAnswer: 1, explanation: 'A default route forwards packets destined for networks not listed in the routing table. It is essential on edge routers connecting to the internet, where listing every possible destination is impractical.' },
    { id: 'l43q3', question: 'A router receives a packet for 203.0.113.5 with no matching route, but has a default route to 10.0.0.2. What happens?', options: ['The packet is dropped', 'The packet is forwarded to 10.0.0.2', 'The router sends an ICMP redirect', 'The packet is broadcast'], correctAnswer: 1, explanation: 'The default route (0.0.0.0/0) matches any destination when no specific route is found. The router forwards the packet to the next-hop 10.0.0.2 per the default route.' },
  ],
  'administrative-distance': [
    { id: 'l44q1', question: 'What does administrative distance represent?', options: ['The number of routers between networks', 'The trustworthiness of a routing source', 'The speed of a network link', 'The number of IP addresses in a subnet'], correctAnswer: 1, explanation: 'Administrative Distance (AD) rates the trustworthiness of a routing source. Lower AD = more trusted. When multiple sources learn a route to the same network, the router installs the route with the lowest AD.' },
    { id: 'l44q2', question: 'Which route type has the lowest administrative distance?', options: ['Static route', 'Connected route', 'OSPF route', 'RIP route'], correctAnswer: 1, explanation: 'Connected routes have AD of 0 — the lowest possible, representing a directly attached network. The router knows with certainty these networks are reachable through its own interfaces.' },
    { id: 'l44q3', question: 'A router learns routes to 10.1.1.0/24 via Static (AD 1) and OSPF (AD 110). Which is installed?', options: ['Static route', 'OSPF route', 'Both are installed', 'Neither is installed'], correctAnswer: 0, explanation: 'Lower AD wins. Static routes have AD 1, OSPF has AD 110. The static route (AD 1) is more trusted, so it is installed in the routing table. The OSPF route remains in the OSPF database as a backup.' },
  ],
  'packet-walkthrough-remote-network': [
    { id: 'l45q1', question: 'What device forwards packets between networks?', options: ['Switch', 'Router', 'Access point', 'DNS server'], correctAnswer: 1, explanation: 'Routers forward packets between different IP networks using routing tables. Switches only forward frames within the same Layer 2 network.' },
    { id: 'l45q2', question: 'When a host sends traffic to another network, where is the packet sent first?', options: ['The destination host', 'The broadcast address', 'The default gateway', 'The DNS server'], correctAnswer: 2, explanation: 'A host sends all off-subnet traffic to its configured default gateway (the local router interface). The router then consults its routing table to forward the packet toward the destination.' },
    { id: 'l45q3', question: 'A packet travels through three routers. What happens to the MAC address at each router?', options: ['It remains the same', 'It changes at each hop', 'It becomes a broadcast address', 'It is removed from the packet'], correctAnswer: 1, explanation: 'At each router hop, the Layer 2 frame is discarded and a new one is created with updated source and destination MAC addresses for the next segment. The Layer 3 IP addresses remain unchanged end-to-end.' },
  ],
  'vlan-fundamentals': [
    { id: 'l46q1', question: 'What does VLAN stand for?', options: ['Virtual Link Access Network', 'Virtual Local Area Network', 'Variable Local Access Node', 'Virtual Layered Address Network'], correctAnswer: 1, explanation: 'VLAN stands for Virtual Local Area Network. VLANs logically segment a physical switch into multiple separate broadcast domains, improving security and reducing unnecessary broadcast traffic.' },
    { id: 'l46q2', question: 'What problem do VLANs help reduce?', options: ['Physical cabling complexity', 'Broadcast traffic within a network', 'Router CPU usage', 'DNS resolution failures'], correctAnswer: 1, explanation: 'VLANs divide one physical network into multiple separate broadcast domains. Broadcasts sent in one VLAN are not forwarded to other VLANs, reducing overall broadcast traffic and improving performance.' },
    { id: 'l46q3', question: 'Two PCs are on the same switch but in different VLANs. PC A sends a broadcast. Who receives it?', options: ['All devices on the switch', 'Only PC B', 'Only devices in PC A\'s VLAN', 'No devices receive it'], correctAnswer: 2, explanation: 'VLANs create separate broadcast domains. Broadcasts from PC A remain within PC A\'s VLAN — devices in other VLANs on the same switch do not receive them.' },
  ],
  'access-vs-trunk-ports': [
    { id: 'l47q1', question: 'What type of switch port connects directly to end devices?', options: ['Trunk port', 'Access port', 'Routed port', 'Management port'], correctAnswer: 1, explanation: 'Access ports connect end devices (PCs, printers, phones) to a switch. An access port belongs to one VLAN and carries untagged traffic. The device does not need to understand VLANs.' },
    { id: 'l47q2', question: 'What type of port carries traffic for multiple VLANs?', options: ['Access port', 'Trunk port', 'Loopback port', 'Routed port'], correctAnswer: 1, explanation: 'Trunk ports carry tagged traffic for multiple VLANs simultaneously. They are used for switch-to-switch and switch-to-router connections where frames from multiple VLANs must pass through a single link.' },
    { id: 'l47q3', question: 'Two switches must carry VLAN 10 and VLAN 20 traffic between them. What type of port is needed?', options: ['Access port', 'Trunk port', 'Routed port', 'VLAN port'], correctAnswer: 1, explanation: 'A trunk port is required between switches to carry multiple VLANs. The 802.1Q standard adds VLAN ID tags to frames, allowing the receiving switch to identify which VLAN each frame belongs to.' },
  ],
  '802-1q-trunking': [
    { id: 'l48q1', question: 'What standard defines VLAN trunk tagging?', options: ['IEEE 802.3', 'IEEE 802.1Q', 'RFC 1918', 'RFC 792'], correctAnswer: 1, explanation: 'IEEE 802.1Q is the standard that defines VLAN trunk tagging. It adds a 4-byte tag to Ethernet frames containing the VLAN ID, enabling switches to carry multiple VLANs on a single trunk link.' },
    { id: 'l48q2', question: 'What information does the 802.1Q tag contain?', options: ['Source MAC address', 'Destination IP address', 'VLAN ID', 'TCP port number'], correctAnswer: 2, explanation: 'The 802.1Q tag (inserted into the Ethernet frame header) contains the VLAN ID (12-bit field supporting 1–4094 VLANs), plus priority bits (PCP) and other fields. The VLAN ID tells the switch which VLAN the frame belongs to.' },
    { id: 'l48q3', question: 'A frame from VLAN 20 is sent across a trunk link. What happens to the frame?', options: ['The frame is dropped', 'The frame is tagged with VLAN ID 20', 'The frame is converted to a broadcast', 'The frame is forwarded without changes'], correctAnswer: 1, explanation: 'When a frame enters a trunk link, an 802.1Q tag containing the VLAN ID is inserted into the frame header. The receiving switch reads the tag to determine the VLAN and forwards accordingly.' },
  ],
  'inter-vlan-routing': [
    { id: 'l49q1', question: 'Why can devices in different VLANs not communicate directly?', options: ['VLANs block MAC addresses', 'VLANs create separate Layer 3 networks', 'Switches cannot forward frames', 'IP addresses are not required'], correctAnswer: 1, explanation: 'Each VLAN is a separate broadcast domain and typically a separate IP subnet. Layer 2 switches cannot forward frames between VLANs — a Layer 3 device (router or Layer 3 switch) is required for inter-VLAN routing.' },
    { id: 'l49q2', question: 'What device allows communication between VLANs?', options: ['Switch', 'Router', 'Access point', 'Hub'], correctAnswer: 1, explanation: 'A router (or Layer 3 switch) performs inter-VLAN routing by routing packets between the IP subnets assigned to each VLAN. Without a router, devices in different VLANs cannot communicate.' },
    { id: 'l49q3', question: 'PC A is in VLAN 10 (192.168.10.10) and PC B is in VLAN 20 (192.168.20.10). Which device forwards traffic between them?', options: ['Switch', 'Router', 'Firewall', 'DNS server'], correctAnswer: 1, explanation: 'PC A and PC B are on different subnets (different VLANs). A router must route the packet from the 192.168.10.0/24 network to the 192.168.20.0/24 network to enable communication.' },
  ],
  'router-on-a-stick': [
    { id: 'l50q1', question: 'What is Router on a Stick?', options: ['A routing protocol', 'A method for routing multiple VLANs using one router interface', 'A VLAN tagging protocol', 'A switch configuration method'], correctAnswer: 1, explanation: 'Router on a Stick is an inter-VLAN routing technique where one physical router interface connects to a trunk port and uses logical subinterfaces (one per VLAN) to route between VLANs without additional physical interfaces.' },
    { id: 'l50q2', question: 'What router feature allows a single interface to support multiple VLANs?', options: ['Subinterfaces', 'VLAN trunking protocol', 'DHCP relay', 'Loopback interfaces'], correctAnswer: 0, explanation: 'Subinterfaces are logical divisions of a physical interface. Each subinterface is configured with an 802.1Q encapsulation command and an IP address to serve as the gateway for one VLAN.' },
    { id: 'l50q3', question: 'A router has "interface g0/0.10 / encapsulation dot1Q 10". What does the 10 represent?', options: ['The router ID', 'The VLAN ID', 'The subnet mask', 'The port number'], correctAnswer: 1, explanation: '"encapsulation dot1Q 10" configures the subinterface to accept and send 802.1Q-tagged frames for VLAN 10. The number identifies which VLAN this subinterface handles.' },
  ],
  'l3-switches-svis': [
    { id: 'l51q1', question: 'What type of device can perform both switching and routing?', options: ['Hub', 'Layer 2 switch', 'Layer 3 switch', 'Access point'], correctAnswer: 2, explanation: 'A Layer 3 switch combines Layer 2 switching with Layer 3 routing capabilities. It can forward frames within VLANs at wire speed and route packets between different VLANs using SVIs.' },
    { id: 'l51q2', question: 'What does SVI stand for?', options: ['Switched Virtual Interface', 'Static VLAN Interface', 'Secure Virtual Internet', 'Switching VLAN Instance'], correctAnswer: 0, explanation: 'SVI stands for Switched Virtual Interface. An SVI is a virtual Layer 3 interface associated with a VLAN on a Layer 3 switch, providing the default gateway IP address for devices in that VLAN.' },
    { id: 'l51q3', question: 'A Layer 3 switch has SVIs: Vlan10 → 192.168.10.1 and Vlan20 → 192.168.20.1. What function do these perform?', options: ['DNS resolution', 'Default gateway for each VLAN', 'VLAN tagging', 'Trunk configuration'], correctAnswer: 1, explanation: 'SVIs serve as the default gateway for devices in each VLAN. Devices in VLAN 10 use 192.168.10.1 as their gateway, and the Layer 3 switch routes between the two VLANs internally.' },
  ],
  'layer2-loops': [
    { id: 'l52q1', question: 'What is a Layer 2 loop?', options: ['A routing loop between routers', 'Frames circulating endlessly between switches', 'A DHCP configuration error', 'A DNS resolution failure'], correctAnswer: 1, explanation: 'A Layer 2 loop occurs when Ethernet frames circulate continuously between switches due to redundant links without a loop-prevention mechanism. Unlike IP, Ethernet frames have no TTL to expire and discard them.' },
    { id: 'l52q2', question: 'What problem occurs when broadcast frames multiply across a looped network?', options: ['Routing instability', 'Broadcast storm', 'VLAN tagging failure', 'Packet fragmentation'], correctAnswer: 1, explanation: 'A broadcast storm occurs when broadcast frames loop through switches endlessly, being copied and re-sent by each switch. The exponential growth overwhelms switches and consumes all available bandwidth.' },
    { id: 'l52q3', question: 'Two switches are connected with redundant links. Users report extremely slow performance and high CPU on switches. What is the likely cause?', options: ['OSPF misconfiguration', 'A Layer 2 loop causing a broadcast storm', 'DNS server failure', 'Incorrect VLAN configuration'], correctAnswer: 1, explanation: 'The symptoms — slow performance and high CPU on switches connected by redundant links — are classic signs of a Layer 2 broadcast storm caused by a switching loop. STP should be configured to prevent this.' },
  ],
  'stp-fundamentals': [
    { id: 'l53q1', question: 'What problem does Spanning Tree Protocol solve?', options: ['IP address conflicts', 'Layer 2 loops', 'Routing table errors', 'DNS resolution failures'], correctAnswer: 1, explanation: 'STP (Spanning Tree Protocol) prevents Layer 2 loops by placing redundant switch ports into a blocking state. It maintains a loop-free logical topology while keeping redundant links available as backup paths.' },
    { id: 'l53q2', question: 'Which organization developed the original Spanning Tree Protocol standard?', options: ['IETF', 'IEEE', 'ISO', 'ICANN'], correctAnswer: 1, explanation: 'The IEEE developed STP as standard 802.1D. Radia Perlman invented the original algorithm. IEEE later developed RSTP (802.1w) and MSTP (802.1s) as faster, more efficient successors.' },
    { id: 'l53q3', question: 'Three switches form a triangle topology with redundant links. Which protocol prevents endless frame circulation?', options: ['ARP', 'OSPF', 'STP', 'DHCP'], correctAnswer: 2, explanation: 'STP (Spanning Tree Protocol) blocks one or more ports in a redundant topology to create a loop-free path. Blocked ports do not forward frames but can be unblocked if an active link fails.' },
  ],
  'root-bridge-port-roles-states': [
    { id: 'l54q1', question: 'What determines which switch becomes the root bridge?', options: ['Highest MAC address', 'Lowest Bridge ID', 'Highest port number', 'Lowest VLAN number'], correctAnswer: 1, explanation: 'The root bridge is the switch with the lowest Bridge ID. The Bridge ID consists of a 2-byte priority (default 32768) + the switch MAC address. To influence root bridge election, lower the priority.' },
    { id: 'l54q2', question: 'What port role provides the best path to the root bridge?', options: ['Designated port', 'Root port', 'Blocked port', 'Alternate port'], correctAnswer: 1, explanation: 'Each non-root switch has one root port — the port with the best (lowest cost) path to the root bridge. Root ports are always in the forwarding state.' },
    { id: 'l54q3', question: 'A switch port is placed in STP blocking state. What is the purpose?', options: ['Increase bandwidth', 'Prevent Layer 2 loops', 'Disable VLAN tagging', 'Improve routing performance'], correctAnswer: 1, explanation: 'STP blocks redundant ports to eliminate Layer 2 loops. Blocked ports still receive BPDUs to monitor the topology but do not forward data frames. If the active link fails, the blocked port can transition to forwarding.' },
  ],
  'rstp-basics': [
    { id: 'l55q1', question: 'Which IEEE standard defines Rapid Spanning Tree Protocol?', options: ['802.1D', '802.1Q', '802.1w', '802.11'], correctAnswer: 2, explanation: 'RSTP is defined in IEEE 802.1w. It was later incorporated into the 802.1D-2004 standard. RSTP dramatically reduces convergence time compared to original STP (802.1D) from 30–50 seconds to near-instant.' },
    { id: 'l55q2', question: 'What is the main advantage of RSTP over traditional STP?', options: ['It eliminates the need for switches', 'It increases broadcast traffic', 'It allows faster network convergence', 'It removes the need for root bridges'], correctAnswer: 2, explanation: 'RSTP converges much faster than traditional STP — typically in 1–2 seconds instead of 30–50 seconds. It achieves this through new port roles (alternate, backup) and a handshake mechanism instead of timers.' },
    { id: 'l55q3', question: 'A link fails in a network using RSTP. What happens next?', options: ['The network shuts down until manually reconfigured', 'The switch reboots to rebuild the topology', 'RSTP rapidly recalculates and an alternate port transitions to forwarding', 'STP must be re-enabled manually'], correctAnswer: 2, explanation: 'RSTP uses pre-calculated alternate paths. When a link fails, the alternate port transitions to forwarding almost immediately through a rapid negotiation handshake, restoring connectivity in seconds.' },
  ],
  'etherchannel-fundamentals': [
    { id: 'l56q1', question: 'What is EtherChannel?', options: ['A protocol that encrypts Ethernet traffic', 'A method for combining multiple physical links into one logical link', 'A routing protocol for switches', 'A wireless networking technology'], correctAnswer: 1, explanation: 'EtherChannel bundles multiple physical Ethernet links into one logical link, increasing bandwidth and providing redundancy. STP treats the entire bundle as a single link, so no ports are blocked.' },
    { id: 'l56q2', question: 'Why is EtherChannel useful in switched networks?', options: ['It replaces routers', 'It increases bandwidth and prevents STP from blocking redundant links', 'It eliminates broadcast traffic', 'It removes VLAN requirements'], correctAnswer: 1, explanation: 'EtherChannel aggregates bandwidth from multiple links (e.g., 4 × 1 Gbps = 4 Gbps logical link) and provides redundancy. Since STP sees one logical link, it does not block any member ports.' },
    { id: 'l56q3', question: 'Two switches are connected with four Ethernet links. Without EtherChannel, what does STP do?', options: ['Forwards traffic across all four links', 'Blocks three of the four links', 'Disables all four links', 'Uses all four links with load balancing'], correctAnswer: 1, explanation: 'Without EtherChannel, STP sees four redundant parallel links and blocks three to prevent loops, leaving only one active. EtherChannel bundles them so STP sees one link and all four carry traffic.' },
  ],
  'lacp-pagp': [
    { id: 'l57q1', question: 'Which protocol is an IEEE standard used to form EtherChannel links?', options: ['PAgP', 'LACP', 'STP', 'ARP'], correctAnswer: 1, explanation: 'LACP (Link Aggregation Control Protocol) is the IEEE 802.3ad standard for dynamic EtherChannel negotiation. It works across multi-vendor environments, unlike the Cisco-proprietary PAgP.' },
    { id: 'l57q2', question: 'Which EtherChannel protocol is Cisco proprietary?', options: ['LACP', 'PAgP', 'OSPF', 'ICMP'], correctAnswer: 1, explanation: 'PAgP (Port Aggregation Protocol) is Cisco\'s proprietary EtherChannel negotiation protocol. It only works between Cisco devices. LACP is the open IEEE standard that works between any vendor\'s equipment.' },
    { id: 'l57q3', question: 'Two switches attempt LACP EtherChannel. Both interfaces are set to Passive. What happens?', options: ['The EtherChannel forms successfully', 'The switches reboot', 'The EtherChannel will not form', 'The link becomes a trunk automatically'], correctAnswer: 2, explanation: 'LACP Passive mode waits for the other side to initiate. If both sides are Passive, neither initiates negotiation and the EtherChannel does not form. One side must be Active (initiates) for it to work.' },
  ],
  'ospf-fundamentals': [
    { id: 'l58q1', question: 'What type of routing protocol is OSPF?', options: ['Distance-vector', 'Link-state', 'Hybrid', 'Static'], correctAnswer: 1, explanation: 'OSPF is a link-state routing protocol. Each router builds a complete map of the network topology (LSDB) and runs Dijkstra\'s algorithm to calculate the shortest path to every network.' },
    { id: 'l58q2', question: 'What algorithm does OSPF use to calculate the best path?', options: ['Bellman-Ford', 'Dijkstra Shortest Path First', 'Flooding algorithm', 'Round robin'], correctAnswer: 1, explanation: 'OSPF uses Dijkstra\'s Shortest Path First (SPF) algorithm to calculate the least-cost path to each network. This gives OSPF its name — Open Shortest Path First.' },
    { id: 'l58q3', question: 'A router has a route marked with code "O" in the routing table. What does this mean?', options: ['The route was learned through OSPF', 'The route is a static route', 'The route is directly connected', 'The route was learned through DHCP'], correctAnswer: 0, explanation: '"O" in Cisco\'s routing table indicates the route was learned via OSPF. The administrative distance for OSPF is 110. "C" = Connected, "S" = Static, "R" = RIP.' },
  ],
  'ospf-neighbors-adjacencies': [
    { id: 'l59q1', question: 'What type of packet does OSPF use to discover neighboring routers?', options: ['ARP packet', 'Hello packet', 'ICMP packet', 'DHCP packet'], correctAnswer: 1, explanation: 'OSPF sends Hello packets multicast to 224.0.0.5 to discover and maintain neighbor relationships. Routers that receive Hello packets and agree on parameters become OSPF neighbors.' },
    { id: 'l59q2', question: 'What is the default OSPF Hello interval on most Ethernet networks?', options: ['5 seconds', '10 seconds', '20 seconds', '60 seconds'], correctAnswer: 1, explanation: 'The default OSPF Hello interval on broadcast networks (Ethernet) is 10 seconds. The Dead interval (how long before a neighbor is declared down) defaults to 4× the Hello interval = 40 seconds.' },
    { id: 'l59q3', question: 'Two routers fail to form OSPF adjacency. Which mismatch could prevent it?', options: ['Different VLAN numbers', 'Different OSPF area IDs', 'Different DNS servers', 'Different hostnames'], correctAnswer: 1, explanation: 'OSPF neighbors must agree on Area ID, Hello/Dead intervals, authentication, and stub flags. A mismatch in any of these prevents adjacency. Different area IDs is one of the most common causes.' },
  ],
  'ospf-cost-best-path': [
    { id: 'l60q1', question: 'What metric does OSPF use to determine the best path?', options: ['Hop count', 'Cost', 'Delay', 'Bandwidth utilization'], correctAnswer: 1, explanation: 'OSPF uses Cost as its metric. Cost is calculated as 100 Mbps ÷ link bandwidth. Lower cost = better path. A 1 Gbps link has cost 1; a 10 Mbps link has cost 10.' },
    { id: 'l60q2', question: 'Which type of link generally has the lowest OSPF cost?', options: ['Low bandwidth links', 'High bandwidth links', 'Wireless links', 'Dial-up links'], correctAnswer: 1, explanation: 'OSPF cost = 100 Mbps ÷ link bandwidth. High bandwidth links have lower cost. A 1 Gbps link has cost 1; a 100 Mbps link has cost 1 (at default reference); slower links have higher costs.' },
    { id: 'l60q3', question: 'A router compares two OSPF paths: Path 1 cost = 20, Path 2 cost = 15. Which does OSPF select?', options: ['Path 1', 'Path 2', 'Both paths equally', 'Neither path'], correctAnswer: 1, explanation: 'OSPF selects the path with the lowest total cost. Path 2 has cost 15 (lower than Path 1\'s 20), so Path 2 is installed in the routing table.' },
  ],
  'ipv6-addressing-basics': [
    { id: 'l61q1', question: 'How many bits long is an IPv6 address?', options: ['32 bits', '64 bits', '128 bits', '256 bits'], correctAnswer: 2, explanation: 'IPv6 addresses are 128 bits long, written as 8 groups of 4 hexadecimal characters separated by colons (e.g., 2001:0DB8:0000:0000:0000:0000:0000:0001). This provides ~3.4 × 10^38 unique addresses.' },
    { id: 'l61q2', question: 'What numbering system is used in IPv6 addresses?', options: ['Binary', 'Decimal', 'Hexadecimal', 'Octal'], correctAnswer: 2, explanation: 'IPv6 uses hexadecimal (base 16), using digits 0–9 and letters A–F. Each group of 4 hex characters represents 16 bits, and 8 such groups give the full 128-bit address.' },
    { id: 'l61q3', question: 'Which of the following is a valid IPv6 address?', options: ['192.168.1.1', '2001:DB8::1', '255.255.255.0', '10.0.0.1'], correctAnswer: 1, explanation: '2001:DB8::1 is a valid IPv6 address. The double colon (::) represents consecutive groups of all zeros. 2001:DB8::/32 is the documentation prefix (similar to 192.0.2.0/24 in IPv4).' },
  ],
  'ipv6-address-types': [
    { id: 'l62q1', question: 'Which IPv6 address type is globally routable on the internet?', options: ['Link-local', 'Multicast', 'Global unicast', 'Loopback'], correctAnswer: 2, explanation: 'Global unicast addresses (prefix 2000::/3) are publicly routable on the internet, similar to public IPv4 addresses. They start with 2 or 3 in the first hex digit.' },
    { id: 'l62q2', question: 'Which prefix identifies a link-local IPv6 address?', options: ['2000::/3', 'FE80::/10', 'FF00::/8', 'FD00::/8'], correctAnswer: 1, explanation: 'Link-local addresses start with FE80::/10 and are automatically configured on every IPv6 interface. They are only valid on the local link and are used for neighbor discovery and routing protocols.' },
    { id: 'l62q3', question: 'A device sends traffic to FF02::1. Which devices receive this message?', options: ['One specific host', 'All IPv6 nodes on the local network', 'Only routers', 'Only servers'], correctAnswer: 1, explanation: 'FF02::1 is the all-nodes multicast address — all IPv6-enabled devices on the local link receive messages sent to this address. IPv6 uses multicast instead of broadcast for similar purposes.' },
  ],
  'slaac-nd': [
    { id: 'l63q1', question: 'What does SLAAC stand for?', options: ['Stateless Link Address Assignment Control', 'Stateless Address Autoconfiguration', 'Secure Link Access Address Control', 'Standard Local Address Assignment Control'], correctAnswer: 1, explanation: 'SLAAC stands for Stateless Address Autoconfiguration. It allows IPv6 devices to automatically configure their own global unicast address using the network prefix from a Router Advertisement plus a self-generated interface ID.' },
    { id: 'l63q2', question: 'Which protocol replaces ARP in IPv6 networks?', options: ['DHCP', 'ICMPv6 Neighbor Discovery', 'DNS', 'OSPF'], correctAnswer: 1, explanation: 'IPv6 uses ICMPv6 Neighbor Discovery Protocol (NDP) instead of ARP. NDP uses multicast messages for neighbor solicitation and advertisement to resolve IPv6 addresses to MAC addresses.' },
    { id: 'l63q3', question: 'A device joins an IPv6 network and asks routers for network information. What message type is this?', options: ['Router Advertisement', 'Router Solicitation', 'Neighbor Solicitation', 'Neighbor Advertisement'], correctAnswer: 1, explanation: 'A Router Solicitation (RS) is sent by a newly connected device to ask routers to immediately send their Router Advertisement (RA). Routers normally send RAs periodically, but the RS triggers an immediate response.' },
  ],
  'dhcp-fundamentals': [
    { id: 'l64q1', question: 'What does DHCP stand for?', options: ['Dynamic Configuration Host Protocol', 'Dynamic Host Configuration Protocol', 'Distributed Host Communication Protocol', 'Data Host Control Protocol'], correctAnswer: 1, explanation: 'DHCP stands for Dynamic Host Configuration Protocol. It automates the assignment of IP addresses, subnet masks, default gateways, and DNS server addresses to network devices.' },
    { id: 'l64q2', question: 'What is the purpose of DHCP?', options: ['Encrypt network traffic', 'Assign IP addresses automatically', 'Replace routers', 'Control VLAN communication'], correctAnswer: 1, explanation: 'DHCP automatically assigns IP configuration to network devices, eliminating manual configuration. A DHCP server leases addresses from a pool, ensuring no duplicates and simplifying administration.' },
    { id: 'l64q3', question: 'A device joins a network and sends a broadcast asking for an IP address. Which DHCP message is this?', options: ['DHCP Offer', 'DHCP Request', 'DHCP Discover', 'DHCP Acknowledge'], correctAnswer: 2, explanation: 'DHCP Discover is the first message — a broadcast (255.255.255.255) sent by a client to locate available DHCP servers. The DORA process: Discover → Offer → Request → Acknowledge.' },
  ],
  'dns-fundamentals': [
    { id: 'l65q1', question: 'What does DNS stand for?', options: ['Domain Naming Service', 'Domain Name System', 'Data Network Service', 'Dynamic Naming System'], correctAnswer: 1, explanation: 'DNS stands for Domain Name System. It is the hierarchical, distributed naming system that translates human-readable domain names (like www.example.com) into IP addresses that computers use to communicate.' },
    { id: 'l65q2', question: 'What is the primary function of DNS?', options: ['Assign IP addresses to devices', 'Translate domain names into IP addresses', 'Encrypt network traffic', 'Manage VLAN communication'], correctAnswer: 1, explanation: 'DNS translates domain names into IP addresses. When you type "google.com" in a browser, DNS resolves it to an IP address so your device can connect. This is called DNS resolution or name resolution.' },
    { id: 'l65q3', question: 'A user types "example.com" into a web browser. Which service translates this name into an IP address?', options: ['DHCP', 'DNS', 'NAT', 'ARP'], correctAnswer: 1, explanation: 'DNS resolves the domain name "example.com" to an IP address. The browser queries a DNS resolver, which may contact root, TLD, and authoritative DNS servers to find the answer.' },
  ],
  'nat-fundamentals': [
    { id: 'l66q1', question: 'What does NAT stand for?', options: ['Network Address Table', 'Network Address Translation', 'Network Access Translation', 'Network Allocation Technology'], correctAnswer: 1, explanation: 'NAT stands for Network Address Translation. It modifies IP address information in packet headers while in transit, typically translating private addresses to a public address for internet access.' },
    { id: 'l66q2', question: 'Why is NAT commonly used in networks?', options: ['To encrypt traffic', 'To allow private IP addresses to access the internet', 'To replace DNS servers', 'To improve wireless performance'], correctAnswer: 1, explanation: 'NAT allows many devices with RFC 1918 private addresses to share one (or a few) public IP addresses for internet access. This conserves public IPv4 addresses and provides a basic security layer.' },
    { id: 'l66q3', question: 'A router translates 192.168.1.10 to 203.0.113.5 before sending to the internet. What is this?', options: ['DNS resolution', 'NAT translation', 'ARP resolution', 'Routing'], correctAnswer: 1, explanation: 'This is NAT — the router replaces the private source IP (192.168.1.10) with a public IP (203.0.113.5) in the packet header. The NAT table records the translation so replies can be forwarded back correctly.' },
  ],
  'ntp-fundamentals': [
    { id: 'l67q1', question: 'What does NTP stand for?', options: ['Network Transfer Protocol', 'Network Time Protocol', 'Network Timing Process', 'Network Transmission Program'], correctAnswer: 1, explanation: 'NTP stands for Network Time Protocol. It synchronizes the clocks of network devices to a common time source, which is critical for accurate log timestamps, security certificates, and time-based events.' },
    { id: 'l67q2', question: 'Why is accurate time important in networks?', options: ['To increase bandwidth', 'To organize log files and security events', 'To reduce broadcast traffic', 'To replace DHCP'], correctAnswer: 1, explanation: 'Accurate time ensures that log entries from different devices are correlated correctly during troubleshooting, that security certificates validate properly, and that time-based ACLs and policies function correctly.' },
    { id: 'l67q3', question: 'A router receives time from a stratum 1 server. What stratum level will the router most likely be?', options: ['Stratum 0', 'Stratum 1', 'Stratum 2', 'Stratum 5'], correctAnswer: 2, explanation: 'Stratum represents distance from the authoritative time source. Stratum 0 = atomic clocks (not on network). Stratum 1 = directly connected to stratum 0. A device syncing from stratum 1 becomes stratum 2.' },
  ],
  'syslog-fundamentals': [
    { id: 'l68q1', question: 'What is the primary purpose of Syslog?', options: ['Assign IP addresses to devices', 'Translate domain names', 'Collect and store log messages from network devices', 'Encrypt network traffic'], correctAnswer: 2, explanation: 'Syslog is a standard protocol for sending log messages from network devices (routers, switches, firewalls) to a centralized syslog server. This enables centralized monitoring, analysis, and long-term storage of events.' },
    { id: 'l68q2', question: 'Which Syslog severity level represents the most critical condition?', options: ['Level 0', 'Level 3', 'Level 5', 'Level 7'], correctAnswer: 0, explanation: 'Syslog severity levels: 0 = Emergency (system unusable), 1 = Alert, 2 = Critical, 3 = Error, 4 = Warning, 5 = Notice, 6 = Informational, 7 = Debug. Level 0 is the most severe.' },
    { id: 'l68q3', question: 'A network admin wants to monitor events from multiple routers in one location. What service should be used?', options: ['DHCP', 'Syslog', 'DNS', 'NAT'], correctAnswer: 1, explanation: 'A centralized Syslog server collects log messages from all network devices. Administrators can review all events in one place, set alerts, and maintain records for compliance and troubleshooting.' },
  ],
  'snmp-fundamentals': [
    { id: 'l69q1', question: 'What does SNMP stand for?', options: ['Simple Network Monitoring Protocol', 'Simple Network Management Protocol', 'Secure Network Monitoring Program', 'System Network Management Process'], correctAnswer: 1, explanation: 'SNMP stands for Simple Network Management Protocol. It is used to monitor and manage network devices — collecting statistics, checking status, and making configuration changes from a central NMS.' },
    { id: 'l69q2', question: 'What component stores information about a device in SNMP?', options: ['DNS table', 'Management Information Base (MIB)', 'Routing table', 'ARP table'], correctAnswer: 1, explanation: 'The MIB (Management Information Base) is a hierarchical database on each managed device that defines what information can be queried or set via SNMP. OID (Object Identifier) values address specific MIB entries.' },
    { id: 'l69q3', question: 'A monitoring server periodically requests interface statistics from routers. What SNMP method is being used?', options: ['Trap', 'Polling', 'Broadcast', 'Multicast'], correctAnswer: 1, explanation: 'SNMP polling is when the NMS (Network Management System) periodically sends GET requests to devices to retrieve statistics. SNMP Traps are the opposite — devices proactively send alerts to the NMS.' },
  ],
  'qos-basics': [
    { id: 'l70q1', question: 'What does QoS stand for?', options: ['Quality of Service', 'Quantity of Signals', 'Quick Operating System', 'Query Optimization Service'], correctAnswer: 0, explanation: 'QoS stands for Quality of Service. It refers to techniques that prioritize certain types of network traffic to ensure performance requirements (low latency, jitter, and packet loss) are met for critical applications.' },
    { id: 'l70q2', question: 'Why is QoS used in networks?', options: ['To encrypt traffic', 'To prioritize certain types of traffic', 'To assign IP addresses', 'To manage DNS records'], correctAnswer: 1, explanation: 'QoS ensures that delay-sensitive traffic (voice, video) is prioritized over less time-sensitive traffic (file transfers, email). Without QoS, all traffic is treated equally, which degrades real-time application quality.' },
    { id: 'l70q3', question: 'Which type of traffic is most sensitive to latency?', options: ['File downloads', 'Email messages', 'Voice calls', 'Software updates'], correctAnswer: 2, explanation: 'Voice (VoIP) calls are extremely sensitive to latency and jitter. Even a few hundred milliseconds of delay makes conversations unintelligible. QoS prioritizes voice packets in queues to minimize delay.' },
  ],
  'cdp-lldp': [
    { id: 'l71q1', question: 'What does CDP stand for?', options: ['Cisco Data Protocol', 'Cisco Discovery Protocol', 'Central Device Protocol', 'Cisco Distribution Process'], correctAnswer: 1, explanation: 'CDP stands for Cisco Discovery Protocol. It is a Cisco proprietary Layer 2 protocol that allows Cisco devices to discover directly connected neighbors and share information like device type, IP address, and software version.' },
    { id: 'l71q2', question: 'Which protocol is vendor-neutral and works with devices from different manufacturers?', options: ['CDP', 'LLDP', 'SNMP', 'DHCP'], correctAnswer: 1, explanation: 'LLDP (Link Layer Discovery Protocol) is the IEEE 802.1AB standard — the vendor-neutral equivalent of CDP. It works between devices from any manufacturer, making it essential in multi-vendor environments.' },
    { id: 'l71q3', question: 'A network engineer wants to view information about directly connected Cisco devices. Which command is used?', options: ['show ip route', 'show cdp neighbors', 'show vlan brief', 'show running-config'], correctAnswer: 1, explanation: '"show cdp neighbors" displays information about directly connected Cisco devices including device ID, local interface, hold time, capability, platform, and port ID — essential for network documentation.' },
  ],
  'acl-fundamentals': [
    { id: 'l72q1', question: 'What does ACL stand for?', options: ['Access Communication Layer', 'Access Control List', 'Application Control Layer', 'Address Control Logic'], correctAnswer: 1, explanation: 'ACL stands for Access Control List. An ACL is an ordered list of permit and deny rules that a router applies to packets based on defined criteria such as source/destination IP, protocol, or port number.' },
    { id: 'l72q2', question: 'What action occurs if a packet does not match any rule in an ACL?', options: ['The packet is forwarded automatically', 'The packet is encrypted', 'The packet is denied due to the implicit deny rule', 'The router sends an ARP request'], correctAnswer: 2, explanation: 'Every ACL ends with an implicit "deny all" rule that drops any packet not explicitly permitted. This is a critical security concept — if no permit rule matches, the packet is denied.' },
    { id: 'l72q3', question: 'A router processes an ACL and the packet matches the third rule. What happens next?', options: ['The router checks all remaining rules too', 'The action in the third rule is applied and processing stops', 'The packet is dropped', 'The packet is sent to the firewall'], correctAnswer: 1, explanation: 'ACL processing stops at the first match. Once a packet matches a rule (permit or deny), that action is applied immediately and the remaining rules are not checked. Rule order is critical in ACL design.' },
  ],
  'standard-acls': [
    { id: 'l73q1', question: 'What field does a Standard ACL evaluate?', options: ['Destination IP address', 'Source IP address', 'TCP port number', 'VLAN ID'], correctAnswer: 1, explanation: 'Standard ACLs (numbered 1–99, 1300–1999) match traffic based only on the source IP address. They cannot filter by destination, protocol, or port — making them less flexible than Extended ACLs.' },
    { id: 'l73q2', question: 'Which number range identifies Standard ACLs?', options: ['100 – 199', '200 – 299', '1 – 99', '300 – 399'], correctAnswer: 2, explanation: 'Standard ACLs use numbers 1–99 (and extended range 1300–1999). Extended ACLs use 100–199 (and 2000–2699). Named ACLs can be used as an alternative to numbered ACLs.' },
    { id: 'l73q3', question: 'An admin wants to block traffic from host 192.168.1.50 regardless of destination. Which ACL type should be used?', options: ['Standard ACL', 'Extended ACL', 'NAT rule', 'VLAN ACL'], correctAnswer: 0, explanation: 'Since the requirement is to filter based only on source IP (192.168.1.50), a Standard ACL is appropriate. Standard ACLs match on source IP only and are simpler to configure for this use case.' },
  ],
  'extended-acls': [
    { id: 'l74q1', question: 'Which field can Extended ACLs examine that Standard ACLs cannot?', options: ['Source IP address', 'Destination IP address', 'MAC address', 'Hostname'], correctAnswer: 1, explanation: 'Extended ACLs can match on source IP, destination IP, protocol (TCP, UDP, ICMP), and port numbers. Standard ACLs only match on source IP. This extra granularity allows very specific traffic filtering.' },
    { id: 'l74q2', question: 'Which number range identifies Extended ACLs?', options: ['1 – 99', '50 – 75', '100 – 199', '500 – 600'], correctAnswer: 2, explanation: 'Extended ACLs are numbered 100–199 (and extended range 2000–2699). The number range tells you the ACL type — critical for the CCNA exam and real-world configuration.' },
    { id: 'l74q3', question: 'An admin wants to allow HTTP traffic but block FTP. Which ACL type should be used?', options: ['Standard ACL', 'Extended ACL', 'VLAN ACL', 'NAT rule'], correctAnswer: 1, explanation: 'Extended ACLs can filter by protocol and port number. To allow HTTP (TCP port 80) and deny FTP (TCP port 21), you need Extended ACLs — Standard ACLs can only filter on source IP, not specific protocols/ports.' },
  ],
  'port-security': [
    { id: 'l75q1', question: 'What does Port Security primarily use to identify devices?', options: ['IP addresses', 'MAC addresses', 'VLAN IDs', 'Hostnames'], correctAnswer: 1, explanation: 'Port Security restricts access to a switch port based on MAC addresses. It can limit the number of devices per port and/or allow only specific MAC addresses, preventing unauthorized device connections.' },
    { id: 'l75q2', question: 'Which Port Security violation mode disables the port?', options: ['Protect', 'Restrict', 'Shutdown', 'Block'], correctAnswer: 2, explanation: 'Shutdown mode (the default) places the port in err-disabled state when a violation occurs, effectively disabling it. The port must be manually re-enabled with "shutdown" then "no shutdown" commands.' },
    { id: 'l75q3', question: 'A switch port allows only one MAC address. A second device connects. What occurs?', options: ['The switch reboots', 'A security violation is triggered', 'The VLAN changes automatically', 'The device receives a new IP address'], correctAnswer: 1, explanation: 'When a port security violation occurs (a MAC address is seen that is not the allowed one, or the maximum count is exceeded), the configured violation action (protect, restrict, or shutdown) is taken.' },
  ],
  'wireless-fundamentals': [
    { id: 'l76q1', question: 'What standard defines Wi-Fi networking?', options: ['IEEE 802.3', 'IEEE 802.11', 'IEEE 802.1Q', 'IEEE 802.15'], correctAnswer: 1, explanation: 'IEEE 802.11 is the standard that defines Wi-Fi. Different amendments specify bands and speeds: 802.11a, b, g (older), 802.11n (Wi-Fi 4), 802.11ac (Wi-Fi 5), 802.11ax (Wi-Fi 6).' },
    { id: 'l76q2', question: 'What device allows wireless clients to connect to a wired network?', options: ['Router', 'Access Point', 'Firewall', 'Hub'], correctAnswer: 1, explanation: 'A Wireless Access Point (AP) bridges wireless clients to the wired LAN. Clients associate with the AP using a Service Set Identifier (SSID), and the AP forwards traffic between the wireless and wired segments.' },
    { id: 'l76q3', question: 'A laptop sends data over a wireless network. What medium transmits the data?', options: ['Fiber optics', 'Copper cable', 'Radio waves', 'Electrical pulses'], correctAnswer: 2, explanation: 'Wireless networks transmit data using radio waves in the 2.4 GHz and 5 GHz frequency bands (and 6 GHz for Wi-Fi 6E). Radio waves carry the modulated data signal through the air.' },
  ],
  'wireless-architecture': [
    { id: 'l77q1', question: 'What device centrally manages multiple wireless access points?', options: ['Router', 'Switch', 'Wireless LAN Controller', 'Firewall'], correctAnswer: 2, explanation: 'A Wireless LAN Controller (WLC) centrally manages lightweight APs in an enterprise wireless network. It handles configuration, firmware updates, RF management, and client roaming across all managed APs.' },
    { id: 'l77q2', question: 'What type of access point relies on a Wireless LAN Controller for configuration?', options: ['Autonomous AP', 'Lightweight AP', 'Bridge AP', 'Distribution AP'], correctAnswer: 1, explanation: 'Lightweight APs (also called thin APs) depend on a WLC for all configuration and management. They use the CAPWAP protocol to tunnel traffic to the WLC. Autonomous APs are self-contained and do not require a WLC.' },
    { id: 'l77q3', question: 'An admin wants to manage hundreds of APs from a single device. Which technology should be used?', options: ['Autonomous access points', 'Wireless LAN Controller', 'DHCP server', 'DNS server'], correctAnswer: 1, explanation: 'A Wireless LAN Controller enables centralized management of many APs. All configuration changes, policies, and monitoring are applied from the WLC, making it far more scalable than managing each AP individually.' },
  ],
  'wireless-security': [
    { id: 'l78q1', question: 'Which wireless security protocol uses AES encryption?', options: ['WEP', 'WPA2', 'Bluetooth', 'Telnet'], correctAnswer: 1, explanation: 'WPA2 (Wi-Fi Protected Access 2) uses AES (Advanced Encryption Standard) with CCMP for strong encryption. WEP used weak RC4 encryption and is considered broken. WPA2 is the CCNA standard recommendation.' },
    { id: 'l78q2', question: 'What authentication protocol is commonly used in enterprise wireless networks?', options: ['802.1X', 'OSPF', 'NAT', 'DHCP'], correctAnswer: 0, explanation: '802.1X is a port-based network access control standard used in enterprise Wi-Fi (WPA2-Enterprise). It requires users to authenticate with a RADIUS server using credentials before network access is granted.' },
    { id: 'l78q3', question: 'A company wants each employee to authenticate individually when connecting to Wi-Fi. Which mode should be used?', options: ['WPA2-Personal', 'WPA2-Enterprise', 'Open authentication', 'WEP'], correctAnswer: 1, explanation: 'WPA2-Enterprise uses 802.1X and a RADIUS server for individual user authentication. Each user has unique credentials. WPA2-Personal uses a single pre-shared key (PSK) shared by all users.' },
  ],
  'network-automation-overview': [
    { id: 'l79q1', question: 'What is the primary goal of network automation?', options: ['Replace network engineers', 'Automatically configure and manage network devices', 'Eliminate routers and switches', 'Increase wireless coverage'], correctAnswer: 1, explanation: 'Network automation uses software to automatically configure, manage, and monitor network devices. It reduces manual effort, speeds deployment, ensures consistency, and minimizes human error.' },
    { id: 'l79q2', question: 'Which of the following is a benefit of network automation?', options: ['Reduced scalability', 'Increased manual configuration', 'Reduced human error', 'Slower network deployment'], correctAnswer: 2, explanation: 'Network automation reduces human error by applying consistent, tested configurations programmatically. Manual configuration is error-prone; automation ensures every device is configured identically and correctly.' },
    { id: 'l79q3', question: 'A company wants to apply the same configuration to hundreds of switches automatically. What approach should be used?', options: ['Configure each switch manually via CLI', 'Use network automation tools', 'Use DHCP', 'Use DNS'], correctAnswer: 1, explanation: 'Network automation tools (like Ansible, Python scripts, or Cisco NSO) can deploy configurations to hundreds of devices simultaneously, ensuring consistency and saving enormous amounts of time.' },
  ],
  'json-xml-yaml': [
    { id: 'l80q1', question: 'Which data format is commonly used in REST APIs?', options: ['JSON', 'FTP', 'ARP', 'DHCP'], correctAnswer: 0, explanation: 'JSON (JavaScript Object Notation) is the most widely used format for REST API data exchange. It uses key-value pairs and arrays, is human-readable, and is natively supported by most programming languages.' },
    { id: 'l80q2', question: 'Which format organizes data using opening and closing tags?', options: ['JSON', 'XML', 'YAML', 'SNMP'], correctAnswer: 1, explanation: 'XML (eXtensible Markup Language) uses opening and closing tags (like HTML) to structure data. Example: <interface><name>GigabitEthernet0/0</name></interface>. It is verbose but widely supported.' },
    { id: 'l80q3', question: 'A network automation system retrieves structured data from a router\'s API. Which format might the router return?', options: ['ICMP', 'JSON', 'ARP', 'VLAN'], correctAnswer: 1, explanation: 'Modern network device APIs (like Cisco RESTCONF/YANG) commonly return data in JSON or XML format. JSON is preferred for its simplicity and wide language support in automation scripts.' },
    { id: 'l80q4', question: 'Which data format uses indentation to structure information?', options: ['XML', 'JSON', 'YAML', 'HTTP'], correctAnswer: 2, explanation: 'YAML (YAML Ain\'t Markup Language) uses indentation (spaces) to define hierarchy, making it very human-readable. It is widely used for configuration files in tools like Ansible playbooks.' },
  ],
  'rest-apis-programmability': [
    { id: 'l81q1', question: 'What does API stand for?', options: ['Automated Processing Interface', 'Application Programming Interface', 'Advanced Packet Integration', 'Access Protocol Identifier'], correctAnswer: 1, explanation: 'API stands for Application Programming Interface — a method that allows software applications to communicate with each other. In networking, APIs allow automation tools and scripts to interact directly with network devices.' },
    { id: 'l81q2', question: 'Which protocol is commonly used by REST APIs?', options: ['HTTP', 'ARP', 'OSPF', 'ICMP'], correctAnswer: 0, explanation: 'REST APIs use HTTP (HyperText Transfer Protocol) to send requests and receive responses. HTTP is the same protocol used for web traffic, which makes REST APIs a familiar and widely supported communication method.' },
    { id: 'l81q3', question: 'An automation tool wants to retrieve interface status from a router. Which HTTP method should be used?', options: ['POST', 'PUT', 'GET', 'DELETE'], correctAnswer: 2, explanation: 'HTTP GET is used to retrieve information from a device without modifying it. When an automation tool needs to read data such as interface status, it sends a GET request to the router\'s REST API endpoint.' },
    { id: 'l81q4', question: 'Which data format is commonly used in REST API responses?', options: ['JSON', 'ARP', 'VLAN', 'STP'], correctAnswer: 0, explanation: 'JSON (JavaScript Object Notation) is a structured data format commonly used in REST API responses. It uses key-value pairs and is easy for both humans and automation systems to read and process.' },
  ],
  'config-management-tools': [
    { id: 'l82q1', question: 'What is the primary purpose of configuration management tools?', options: ['Replace routers', 'Automate configuration and management of devices', 'Increase wireless speed', 'Eliminate IP addressing'], correctAnswer: 1, explanation: 'Configuration management tools (Ansible, Puppet, Chef) automate the deployment and management of device configurations at scale. They ensure consistency, enable version control, and support infrastructure-as-code practices.' },
    { id: 'l82q2', question: 'Which configuration management tool commonly uses YAML playbooks?', options: ['Puppet', 'Chef', 'Ansible', 'SNMP'], correctAnswer: 2, explanation: 'Ansible uses YAML-formatted playbooks to define automation tasks. It is agentless (no software needed on managed devices) and uses SSH or APIs to push configurations — making it popular for network automation.' },
    { id: 'l82q3', question: 'A network admin wants to apply the same configuration to dozens of switches automatically. What type of tool should be used?', options: ['DHCP server', 'Configuration management tool', 'DNS server', 'Syslog server'], correctAnswer: 1, explanation: 'Configuration management tools like Ansible can apply identical configurations to dozens or hundreds of devices simultaneously using playbooks, ensuring consistency and eliminating repetitive manual CLI work.' },
  ],
}

// fallback quiz

function getEthernetQuizQuestions(): QuizQuestion[] {
  return [
    { id: 'eth1', question: 'What is the maximum payload size of a standard Ethernet frame?', options: ['512 bytes', '1500 bytes', '1518 bytes', '9000 bytes'], correctAnswer: 1, explanation: 'The maximum Ethernet payload (MTU) is 1500 bytes. The total frame including headers and FCS is 1518 bytes. Jumbo frames extend this to 9000 bytes on supported hardware.' },
    { id: 'eth2', question: 'How many bytes is a MAC address?', options: ['4 bytes', '6 bytes', '8 bytes', '16 bytes'], correctAnswer: 1, explanation: 'MAC addresses are 48-bit (6-byte) hardware addresses written in hex. First 3 bytes = manufacturer OUI, last 3 = device ID.' },
    { id: 'eth3', question: 'What is the broadcast MAC address?', options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:01', '7F:FF:FF:FF:FF:FF'], correctAnswer: 1, explanation: 'FF:FF:FF:FF:FF:FF is the Ethernet broadcast address. Frames sent to it are delivered to all devices on the same network segment.' },
    { id: 'eth4', question: 'What does CSMA/CD stand for?', options: ['Carrier Sense Multiple Access with Collision Detection', 'Common Signal Multiple Access with Channel Division', 'Carrier Signal Management and Collision Defense', 'Channel Sensing and Media Access Control with Detection'], correctAnswer: 0, explanation: 'CSMA/CD = Carrier Sense Multiple Access with Collision Detection — the access control method for half-duplex Ethernet.' },
    { id: 'eth5', question: 'Which Ethernet standard supports 1 Gbps over Cat5e/Cat6 cabling up to 100 meters?', options: ['100BASE-TX', '1000BASE-T', '1000BASE-SX', '10GBASE-T'], correctAnswer: 1, explanation: '1000BASE-T supports 1 Gbps over Cat5e or Cat6 UTP cabling up to 100 meters.' },
    { id: 'eth6', question: 'Which mode eliminates collisions on modern switched Ethernet networks?', options: ['Half-duplex mode', 'Full-duplex mode', 'CSMA/CD mode', 'Auto-negotiation mode'], correctAnswer: 1, explanation: 'Full-duplex allows simultaneous send and receive on separate wire pairs, eliminating collisions entirely.' },
  ]
}

function getIPAddressingQuizQuestions(): QuizQuestion[] {
  return [
    { id: 'ip1', question: 'How many bits are in an IPv4 address?', options: ['16 bits', '32 bits', '64 bits', '128 bits'], correctAnswer: 1, explanation: 'An IPv4 address is 32 bits long, written as four 8-bit octets in dotted-decimal notation.' },
    { id: 'ip2', question: 'Which of the following is an RFC 1918 private IP address range?', options: ['100.64.0.0/10', '172.16.0.0/12', '169.254.0.0/16', '192.0.2.0/24'], correctAnswer: 1, explanation: 'RFC 1918 defines three private ranges: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. These are not routable on the public Internet.' },
    { id: 'ip3', question: 'A /26 subnet mask in dotted-decimal notation is:', options: ['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224'], correctAnswer: 2, explanation: '/26 means 26 bits are the network portion. Last octet has 2 bits set = 128+64 = 192. So /26 = 255.255.255.192.' },
    { id: 'ip4', question: 'How many usable host addresses does a /28 subnet provide?', options: ['6 hosts', '14 hosts', '30 hosts', '62 hosts'], correctAnswer: 1, explanation: 'A /28 leaves 4 bits for hosts: 2^4 = 16 total − 2 = 14 usable hosts.' },
    { id: 'ip5', question: 'What is the network address of 192.168.10.75/27?', options: ['192.168.10.0', '192.168.10.32', '192.168.10.64', '192.168.10.72'], correctAnswer: 2, explanation: '/27 block size = 32. Subnets: .0, .32, .64, .96. Host .75 falls in the .64 block.' },
    { id: 'ip6', question: 'What is VLSM used for?', options: ['Assigning the same subnet size to all segments', 'Using different subnet sizes within the same major network', 'Converting private addresses to public addresses', 'Assigning dynamic IP addresses to hosts'], correctAnswer: 1, explanation: 'VLSM (Variable Length Subnet Masking) allows different prefix lengths for different subnets, preventing address waste.' },
  ]
}

function getGenericQuizQuestions(lessonTitle: string): QuizQuestion[] {
  return [
    { id: 'gen1', question: `Which OSI layer is most directly associated with the concepts in "${lessonTitle}"?`, options: ['Physical Layer (Layer 1)', 'Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Application Layer (Layer 7)'], correctAnswer: 2, explanation: `${lessonTitle} relates primarily to Layer 3 concepts, though many topics span multiple OSI layers.` },
    { id: 'gen2', question: 'Which approach is best when troubleshooting a complex network problem?', options: ['Randomly test different settings', 'Use a systematic layered approach', 'Replace all network hardware immediately', 'Disable all security features'], correctAnswer: 1, explanation: 'A systematic layered troubleshooting approach (bottom-up or top-down) isolates the specific layer where the problem occurs.' },
  ]
}

function getQuizQuestionsForLesson(lessonId: string, lessonTitle: string): QuizQuestion[] {
  if (LESSON_QUIZ_DATA[lessonId]) return LESSON_QUIZ_DATA[lessonId]
  if (lessonId === 'ethernet-fundamentals') return getEthernetQuizQuestions()
  if (lessonId === 'ip-addressing') return getIPAddressingQuizQuestions()
  return getGenericQuizQuestions(lessonTitle)
}

// content parsing

type ContentBlock = { type: 'text'; text: string } | { type: 'bullet'; text: string }

type SemanticBlock =
  | { kind: 'bullet'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'step'; num: number; header: string; items: string[] }
  | { kind: 'definition'; term: string; body: string[] }
  | { kind: 'commands'; lines: string[] }
  | { kind: 'callout'; marker: string; body: string[] }
  | { kind: 'keyval'; key: string; value: string }

interface ParsedSlide {
  title: string
  intro: string
  paragraphs: string[]
  bullets: string[]
  examTip: string | null
  terminalLines: string[] | null
  diagramLines: string[] | null
  contentBlocks: ContentBlock[]
  semanticBlocks: SemanticBlock[]
}

function isCliLike(line: string): boolean {
  const t = line.trim()
  if (!t) return false
  if (t.startsWith('!')) return true
  if (/^[A-Za-z][\w-]*[#>]\s/.test(t)) return true  // Router# / Switch> prompts
  if (t.startsWith('$') || t.startsWith('>')) return true
  const cliWords = ['access-list ', 'interface ', 'ip ', 'no ', 'show ', 'router ', 'network ',
    'switchport', 'spanning-tree', 'vlan ', 'hostname ', 'line ', 'crypto ', 'aaa ',
    'username ', 'service ', 'description ', 'duplex', 'speed ', 'shutdown', 'exit',
    'end', 'copy ', 'write ', 'ping ', 'traceroute ', 'clear ', 'debug ', 'ntp ',
    'snmp', 'logging', 'banner', 'clock ']
  return cliWords.some(w => t.toLowerCase().startsWith(w))
}

function buildSemanticBlocks(paraBlocks: string[]): SemanticBlock[] {
  const out: SemanticBlock[] = []

  for (const block of paraBlocks) {
    const lines = block.split('\n')
    const firstLine = lines[0].trim()
    const rest = lines.slice(1).map(l => l.trim()).filter(Boolean)

    const stepM = firstLine.match(/^Step\s+(\d+)\s*[:—–\-]+\s*(.*)/i)
    if (stepM) {
      out.push({ kind: 'step', num: parseInt(stepM[1]), header: stepM[2].trim(), items: rest })
      continue
    }

    const calloutM = firstLine.match(/^(Example|Important|Note|Remember|Why|Formula|Warning)[:\?]\s*(.*)/i)
    if (calloutM) {
      const body = [calloutM[2].trim(), ...rest].filter(Boolean)
      out.push({ kind: 'callout', marker: calloutM[1], body })
      continue
    }

    const defM = firstLine.match(/^([^→=:]+):$/)
    if (defM && rest.length > 0) {
      out.push({ kind: 'definition', term: defM[1].trim(), body: rest })
      continue
    }

    const dashSep = firstLine.includes(' \u2014 ') ? ' \u2014 ' : firstLine.includes(' \u2013 ') ? ' \u2013 ' : null
    if (dashSep) {
      const sepIdx = firstLine.indexOf(dashSep)
      const key = firstLine.slice(0, sepIdx).trim()
      const val = firstLine.slice(sepIdx + dashSep.length).trim()
      if (key.length > 0 && key.length <= 30) {
        if (rest.length > 0) {
          out.push({ kind: 'definition', term: key, body: [val, ...rest].filter(Boolean) })
        } else {
          out.push({ kind: 'keyval', key, value: val })
        }
        continue
      }
    }

    const nonEmpty = lines.filter(l => l.trim()).length
    const cliCount = lines.filter(l => isCliLike(l)).length
    if (nonEmpty > 0 && cliCount >= Math.ceil(nonEmpty * 0.5)) {
      out.push({ kind: 'commands', lines: lines.map(l => l.trim()).filter(Boolean) })
      continue
    }

    for (const raw of lines) {
      const t = raw.trim()
      if (!t) continue

      if (t.startsWith('•')) { out.push({ kind: 'bullet', text: t.slice(1).trim() }); continue }
      if (t.startsWith('- ')) { out.push({ kind: 'bullet', text: t.slice(2).trim() }); continue }
      if (/^\d+\.\s/.test(t)) { out.push({ kind: 'bullet', text: t.replace(/^\d+\.\s+/, '').trim() }); continue }

      const inStep = t.match(/^Step\s+(\d+)\s*[:—–\-]+\s*(.*)/i)
      if (inStep) { out.push({ kind: 'step', num: parseInt(inStep[1]), header: inStep[2].trim(), items: [] }); continue }

      if (t.includes(' \u2192 ') && t.split(' \u2192 ').length === 2 && t.length < 80) {
        const arrowIdx = t.indexOf(' \u2192 ')
        const k = t.slice(0, arrowIdx).trim()
        const v = t.slice(arrowIdx + 3).trim()
        if (k.length <= 30) { out.push({ kind: 'keyval', key: k, value: v }); continue }
      }

      if (/ = /.test(t) && t.split(' = ').length === 2 && t.length < 60) {
        const eqIdx = t.indexOf(' = ')
        const k = t.slice(0, eqIdx).trim()
        const v = t.slice(eqIdx + 3).trim()
        if (k.length <= 30) { out.push({ kind: 'keyval', key: k, value: v }); continue }
      }

      out.push({ kind: 'text', text: t })
    }
  }

  return out
}

function parseSlide(raw: string): ParsedSlide {
  const trimmed = raw.trim()
  if (/^TERMINAL:\n/.test(trimmed)) {
    const terminalLines = trimmed.replace(/^TERMINAL:\n/, '').split('\n')
    return { title: '', intro: '', paragraphs: [], bullets: [], examTip: null, terminalLines, diagramLines: null, contentBlocks: [], semanticBlocks: [] }
  }
  if (/^DIAGRAM:\n/.test(trimmed)) {
    const diagramLines = trimmed.replace(/^DIAGRAM:\n/, '').split('\n')
    return { title: '', intro: '', paragraphs: [], bullets: [], examTip: null, terminalLines: null, diagramLines, contentBlocks: [], semanticBlocks: [] }
  }

  const blocks = raw.split('\n\n').map(b => b.trim()).filter(Boolean)
  let title = ''
  let intro = ''
  const paragraphs: string[] = []
  const bullets: string[] = []
  let examTip: string | null = null
  let terminalLines: string[] | null = null
  let diagramLines: string[] | null = null
  const contentBlocks: ContentBlock[] = []
  const paraBlocks: string[] = []

  blocks.forEach((block, i) => {
    if (/^TERMINAL:\n/.test(block)) {
      terminalLines = block.replace(/^TERMINAL:\n/, '').split('\n')
    } else if (/^DIAGRAM:\n/.test(block)) {
      diagramLines = block.replace(/^DIAGRAM:\n/, '').split('\n')
    } else if (i === 0) {
      const colonIdx = block.indexOf(':')
      if (colonIdx > 0 && colonIdx <= 35 && !block.startsWith('•') && !block.startsWith('- ')) {
        title = block.substring(0, colonIdx).trim()
        intro = block.substring(colonIdx + 1).trim()
      } else if (!block.includes('\n') && block.length <= 60 && !block.startsWith('•') && !block.startsWith('- ') && blocks.length > 1) {
        title = block.trim()
        intro = ''
      } else {
        intro = block
      }
    } else if (/^exam tip:/i.test(block)) {
      examTip = block.replace(/^exam tip:\s*/i, '').trim()
    } else {
      paraBlocks.push(block)
      block.split('\n').forEach(line => {
        const t = line.trim()
        if (!t) return
        if (t.startsWith('•')) {
          const text = t.substring(1).trim()
          bullets.push(text)
          contentBlocks.push({ type: 'bullet', text })
        } else if (t.startsWith('- ')) {
          const text = t.substring(2).trim()
          bullets.push(text)
          contentBlocks.push({ type: 'bullet', text })
        } else if (/^\d+\.\s/.test(t)) {
          const text = t.replace(/^\d+\.\s+/, '').trim()
          bullets.push(text)
          contentBlocks.push({ type: 'bullet', text })
        } else if (/^Step\s+\d+\s*[:—–\-]/i.test(t)) {
          const text = t.replace(/^Step\s+\d+\s*[:—–\-]+\s*/i, '').trim()
          const bulletText = text || t
          bullets.push(bulletText)
          contentBlocks.push({ type: 'bullet', text: bulletText })
        } else {
          paragraphs.push(t)
          contentBlocks.push({ type: 'text', text: t })
        }
      })
    }
  })

  const semanticBlocks = buildSemanticBlocks(paraBlocks)

  return { title, intro, paragraphs, bullets, examTip, terminalLines, diagramLines, contentBlocks, semanticBlocks }
}


type SectionType = 'objective' | 'analogy' | 'walkthrough' | 'takeaway' | 'examtip' | 'cli' | 'diagram' | 'concept'

function detectSectionType(slide: ParsedSlide): SectionType {
  const t = slide.title.toLowerCase()
  if (t === 'exam tip' || t.startsWith('exam tip')) return 'examtip'
  if (t.includes('objective') || t.includes('learning')) return 'objective'
  if (t.includes('analogy') || t.includes('real world')) return 'analogy'
  if (t.includes('takeaway') || t.includes('key take')) return 'takeaway'
  if (t.includes('walkthrough') || t.includes('packet walk') || t.includes('step ')) return 'walkthrough'
  if (slide.terminalLines || t.includes('cli') || t.includes('example') || t.includes('terminal')) return 'cli'
  if (slide.diagramLines || t.includes('diagram') || t.includes('network diagram')) return 'diagram'
  return 'concept'
}

type Phase = 'intro' | 'learn' | 'quiz' | 'complete'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const lesson = getLessonById(lessonId)
  const allLessons = getAllLessons()
  const lessonIdx = allLessons.findIndex(l => l.id === lessonId)
  const nextLesson = allLessons[lessonIdx + 1] ?? null
  const prevLesson = allLessons[lessonIdx - 1] ?? null

  const module = CCNA_CURRICULUM.find(m => m.lessons.some(l => l.id === lessonId))
  const color = TOPIC_COLORS[module?.color as keyof typeof TOPIC_COLORS] ?? 'blue'

  const [phase, setPhase] = useState<Phase>('intro')
  const [slideIdx, setSlideIdx] = useState(0)
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')
  const [animKey, setAnimKey] = useState(0)

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [answerAnim, setAnswerAnim] = useState<'correct' | 'wrong' | null>(null)

  const [isCompleted, setIsCompleted] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [flippedTerms, setFlippedTerms] = useState<Record<number | string, boolean>>({})
  const { showTimer } = useTimer()

  useEffect(() => {
    setPhase('intro')
    setSlideIdx(0)
    setSlideDir('forward')
    setAnimKey(0)
    setQuizIdx(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCorrectCount(0)
    setQuizDone(false)
    setAnswerAnim(null)
    setFlippedTerms({})
    setShowNotes(false)
    setShowTerms(false)
    setIsCompleted(false)
    setNotes('')
    setQuizQuestions([])
  }, [lessonId])

  useEffect(() => {
    if (!lesson) return
    async function load() {
      await initProgress()
      setIsCompleted(getLessonCompletion(lessonId))
      try {
        const { localDB } = await import('@/lib/localdb')
        const note = await localDB.notes.get(lessonId)
        setNotes(note?.content ?? '')
      } catch { setNotes('') }
    }
    load()
    setQuizQuestions(getQuizQuestionsForLesson(lessonId, lesson.title))
  }, [lessonId, lesson])

  useEffect(() => {
    const t = setTimeout(() => {
      import('@/lib/localdb').then(({ localDB }) => {
        const lastUpdated = new Date().toLocaleDateString()
        if (notes.trim()) {
          localDB.notes.put({ lessonId, content: notes, lastUpdated })
          import('@/lib/db').then(({ syncNote }) => syncNote(lessonId, notes)).catch(() => {})
        } else {
          localDB.notes.delete(lessonId)
        }
      }).catch(() => {})
    }, 1000)
    return () => clearTimeout(t)
  }, [notes, lessonId])

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl border shadow-sm p-10">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-500 mb-5 text-sm">This lesson doesn&apos;t exist in the curriculum.</p>
          <button onClick={() => router.push('/curriculum')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            Back to Curriculum
          </button>
        </div>
      </div>
    )
  }

  const totalSlides = lesson.content.length
  const hasKeyTerms = !!(lesson.termDefinitions && Object.keys(lesson.termDefinitions).length > 0)
  const isKeyTermsStep = phase === 'learn' && slideIdx === totalSlides
  const parsedSlide = slideIdx < totalSlides ? parseSlide(lesson.content[slideIdx]) : parseSlide('')
  const sectionType: SectionType = isKeyTermsStep ? 'concept' : detectSectionType(parsedSlide)

  const totalLearnSteps = totalSlides + (hasKeyTerms ? 1 : 0)
  const currentLearnStep = isKeyTermsStep ? totalLearnSteps : (slideIdx + 1)

  const progress =
    phase === 'intro' ? 0
    : phase === 'learn' ? Math.round((currentLearnStep / totalLearnSteps) * (quizQuestions.length > 0 ? 70 : 95))
    : phase === 'quiz'
      ? 70 + Math.round(((quizIdx + 1) / Math.max(quizQuestions.length, 1)) * 25)
    : 100

  function goNext() {
    if (phase !== 'learn') return
    if (!isKeyTermsStep && slideIdx < totalSlides - 1) {
      setSlideDir('forward')
      setAnimKey(k => k + 1)
      setSlideIdx(i => i + 1)
    } else if (!isKeyTermsStep && hasKeyTerms) {
      setSlideDir('forward')
      setAnimKey(k => k + 1)
      setSlideIdx(totalSlides)
      setFlippedTerms({})
    } else if (quizQuestions.length > 0) {
      setPhase('quiz')
    } else {
      completeLesson()
    }
  }

  function goPrev() {
    if (phase !== 'learn') return
    if (isKeyTermsStep) {
      setSlideDir('back')
      setAnimKey(k => k + 1)
      setSlideIdx(totalSlides - 1)
    } else if (slideIdx > 0) {
      setSlideDir('back')
      setAnimKey(k => k + 1)
      setSlideIdx(i => i - 1)
    } else {
      setPhase('intro')
    }
  }

  function handleSelectAnswer(idx: number) {
    if (showExplanation) return
    setSelectedAnswer(idx)
  }

  function submitAnswer() {
    if (selectedAnswer === null) return
    const correct = selectedAnswer === quizQuestions[quizIdx].correctAnswer
    if (correct) setCorrectCount(c => c + 1)
    setAnswerAnim(correct ? 'correct' : 'wrong')
    setTimeout(() => setAnswerAnim(null), 500)
    setShowExplanation(true)
  }

  function nextQuestion() {
    if (quizIdx < quizQuestions.length - 1) {
      setQuizIdx(i => i + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizDone(true)
      completeLesson()
    }
  }

  function resetQuiz() {
    setQuizIdx(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCorrectCount(0)
    setQuizDone(false)
    setPhase('quiz')
  }

  function completeLesson() {
    setLessonCompletion(lessonId)
    setIsCompleted(true)
    setPhase('complete')
  }

  const btnClass = topicBtn(color)

  function getSectionLabel(): string {
    if (isKeyTermsStep) return 'Key Terms'
    const t = parsedSlide.title.toLowerCase()
    if (t.includes('objective') || t.includes('learning')) return 'Learning Objective'
    if (t.includes('analogy') || t.includes('real world')) return 'Real World Analogy'
    if (t.includes('takeaway')) return 'Key Takeaways'
    if (t.includes('walkthrough') || t.includes('packet walk')) return 'Packet Walkthrough'
    if (t === 'exam tip' || t.startsWith('exam tip')) return 'Exam Tip'
    if (parsedSlide.terminalLines || t.includes('cli')) return 'CLI Example'
    if (parsedSlide.diagramLines || t.includes('diagram')) return 'Network Diagram'
    return parsedSlide.title || 'Concept'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {showNotes && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> My Notes
              </h3>
              <button onClick={() => setShowNotes(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Type your notes here... They auto-save as you type." className="w-full h-48 sm:h-64 p-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className="px-4 pb-4 flex-shrink-0">
              <p className="text-xs text-gray-400 text-center">Notes are saved automatically</p>
            </div>
          </div>
        </div>
      )}

      {showTerms && lesson.keyTerms && lesson.keyTerms.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" /> Key Terms
              </h3>
              <button onClick={() => setShowTerms(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-xs text-gray-500 px-5 pt-3 pb-1 flex-shrink-0">Tap a card to flip and see the definition</p>
            <div className="flex-1 overflow-auto px-4 py-3 space-y-2.5">
              {lesson.keyTerms.map((term, i) => (
                <div key={i} className="flip-card-scene w-full cursor-pointer"
                  onClick={() => setFlippedTerms(prev => ({ ...prev, [`m${i}`]: !prev[`m${i}`] }))}>
                  <div className={cn('flip-card-inner rounded-xl', flippedTerms[`m${i}`] ? 'is-flipped' : '')}>
                    <div className="flip-front w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-between gap-3 min-h-[52px]">
                      <p className="text-sm font-semibold text-gray-800">{term}</p>
                      <span className={cn('text-xs font-medium flex-shrink-0', topicText(color))}>tap to flip →</span>
                    </div>
                    <div className={cn('flip-back w-full p-4 rounded-xl border-2 min-h-[52px]', topicCard(color))}>
                      <p className={cn('text-xs font-bold uppercase tracking-wide mb-1.5', topicText(color))}>{term}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{lesson.termDefinitions?.[term] ?? 'No definition available.'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => router.push('/curriculum')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0" aria-label="Back to curriculum">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate leading-tight">{module?.title}</p>
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{lesson.title}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lesson.keyTerms && lesson.keyTerms.length > 0 && (
              <button onClick={() => setShowTerms(true)} className="p-2 hover:bg-purple-50 text-purple-500 rounded-xl transition-colors" aria-label="Key terms" title="Key Terms">
                <Brain className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setShowNotes(true)} className="p-2 hover:bg-amber-50 text-amber-500 rounded-xl transition-colors" aria-label="Notes" title="Notes">
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={showTimer} className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors" aria-label="Focus timer" title="Focus Timer">
              <Target className="w-4 h-4" />
            </button>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> Done
              </span>
            )}
          </div>
        </div>

        <div className="h-1.5 bg-gray-100">
          <div className={cn('h-full transition-all duration-500 ease-out', topicBtn(color).split(' ')[0])} style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">

        {phase === 'intro' && (
          <div className="flex flex-col gap-4">

            <div className={cn('rounded-2xl p-6', topicBgLight(color))}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <span className={cn('text-xs font-bold uppercase tracking-widest', topicText(color))}>{module?.title}</span>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{lesson.title}</h1>
                </div>
                <div className={cn('flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold capitalize', topicBgMed(color), topicTextDark(color))}>
                  {lesson.difficulty}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{lesson.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {totalSlides} steps</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {lesson.duration} min</span>
                {lesson.videoUrl && (
                  <span className="flex items-center gap-1.5 text-red-500"><PlayCircle className="w-3.5 h-3.5" /> Video included</span>
                )}
                <span className={cn('px-2 py-0.5 rounded-full font-semibold',
                  lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  lesson.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                  {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" /> What you&apos;ll learn
              </h2>
              <ul className="space-y-2.5">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {hasKeyTerms && (
              <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Key Terms included</p>
                  <p className="text-xs text-gray-500">{Object.keys(lesson.termDefinitions ?? {}).length} flip-cards to review</p>
                </div>
                <Star className="w-4 h-4 text-amber-400 flex-shrink-0 ml-auto" />
              </div>
            )}

            {quizQuestions.length > 0 && (
              <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Knowledge Check at the end</p>
                  <p className="text-xs text-gray-500">{quizQuestions.length} questions from this lesson</p>
                </div>
              </div>
            )}

            <button onClick={() => { setSlideIdx(0); setPhase('learn') }}
              className={cn('flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base transition-all', btnClass)}>
              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
              <ArrowRight className="w-5 h-5" />
            </button>

            {isCompleted && nextLesson && (
              <button onClick={() => router.push(`/lessons/${nextLesson.id}`)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Next: {nextLesson.title} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {phase === 'learn' && (
          <div className="flex flex-col gap-4 flex-1">

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {lesson.content.map((_, i) => (
                <button key={i}
                  onClick={() => {
                    if (!isKeyTermsStep || i !== slideIdx) {
                      setSlideDir(i > slideIdx ? 'forward' : 'back')
                      setAnimKey(k => k + 1)
                      setSlideIdx(i)
                    }
                  }}
                  className={cn('flex-shrink-0 rounded-full transition-all duration-300',
                    i === slideIdx && !isKeyTermsStep ? cn('w-5 h-2', topicBtn(color).split(' ')[0]) :
                    (i < slideIdx || isKeyTermsStep) ? cn('w-2 h-2 opacity-50', topicBtn(color).split(' ')[0]) :
                    'w-2 h-2 bg-gray-200')}
                />
              ))}
              {hasKeyTerms && (
                <div className={cn('flex-shrink-0 rounded-full transition-all duration-300',
                  isKeyTermsStep ? 'w-5 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-200')} />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-bold uppercase tracking-widest',
                isKeyTermsStep ? 'text-purple-600' :
                sectionType === 'analogy' ? 'text-purple-600' :
                sectionType === 'takeaway' ? 'text-green-600' :
                sectionType === 'examtip' ? 'text-amber-600' :
                sectionType === 'objective' ? 'text-blue-600' :
                sectionType === 'walkthrough' ? 'text-indigo-600' :
                topicText(color))}>
                {getSectionLabel()}
              </span>
              <span className="text-xs text-gray-400">
                {isKeyTermsStep ? `${Object.keys(lesson.termDefinitions ?? {}).length} terms` : `${slideIdx + 1} / ${totalSlides}`}
              </span>
            </div>

            {isKeyTermsStep && (
              <div key={animKey} className={cn('rounded-2xl border shadow-sm overflow-hidden', slideDir === 'forward' ? 'section-enter' : 'section-enter-back')}>
                <div className="bg-purple-50 px-5 py-4 border-b border-purple-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-900">Key Terms Review</p>
                    <p className="text-xs text-purple-600">Tap each card to flip and see the definition</p>
                  </div>
                </div>
                <div className="p-4 space-y-2.5 bg-white">
                  {Object.entries(lesson.termDefinitions ?? {}).map(([term, def], i) => (
                    <div key={i} className="flip-card-scene w-full cursor-pointer"
                      onClick={() => setFlippedTerms(prev => ({ ...prev, [i]: !prev[i] }))}>
                      <div className={cn('flip-card-inner rounded-xl', flippedTerms[i] ? 'is-flipped' : '')}>
                        <div className="flip-front w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-between gap-3 min-h-[52px]">
                          <p className="text-sm font-semibold text-gray-800">{term}</p>
                          <span className="text-xs text-purple-400 font-medium flex-shrink-0">tap to flip →</span>
                        </div>
                        <div className="flip-back w-full p-4 rounded-xl border-2 border-purple-300 bg-purple-50 min-h-[52px]">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">{term}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{def}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isKeyTermsStep && (
              <div key={animKey} className={cn('rounded-2xl border shadow-sm overflow-hidden', slideDir === 'forward' ? 'section-enter' : 'section-enter-back')}>

                {sectionType === 'objective' && (
                  <div>
                    <div className="bg-blue-50 px-5 py-3.5 border-b border-blue-100 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <h2 className="text-sm font-bold text-blue-800">By the end of this lesson you will:</h2>
                    </div>
                    <div className="p-4 space-y-2 bg-white">
                      {parsedSlide.intro && (
                        <p className="text-xs text-gray-500 pb-1">{parsedSlide.intro}</p>
                      )}
                      {(() => {
                        let objIdx = 0
                        return parsedSlide.contentBlocks.map((cb, i) => {
                          if (cb.type === 'bullet') {
                            objIdx++
                            const n = objIdx
                            return (
                              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
                                <span className="text-sm text-gray-700 leading-relaxed">{cb.text}</span>
                              </div>
                            )
                          }
                          return (
                            <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                              {cb.text}
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

                {sectionType === 'analogy' && (
                  <div>
                    <div className="bg-purple-50 px-5 py-3.5 border-b border-purple-100 flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Real World Analogy</p>
                        {parsedSlide.title && parsedSlide.title.toLowerCase() !== 'real world analogy' && (
                          <p className="text-sm font-bold text-purple-900">{parsedSlide.title}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5 bg-white">
                      {parsedSlide.intro && (
                        <blockquote className="text-sm text-gray-700 leading-relaxed italic pl-3 border-l-[3px] border-purple-300 pb-1">{parsedSlide.intro}</blockquote>
                      )}
                      {parsedSlide.contentBlocks.map((cb, i) =>
                        cb.type === 'bullet' ? (
                          <div key={i} className="flex items-start gap-3 bg-purple-50 rounded-xl px-3 py-2.5 border border-purple-100">
                            <span className="text-purple-500 font-bold text-sm flex-shrink-0 mt-0.5">→</span>
                            <span className="text-sm text-gray-700 leading-relaxed">{cb.text}</span>
                          </div>
                        ) : (
                          <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                            {cb.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'walkthrough' && (
                  <div>
                    <div className={cn('px-5 py-3.5 border-b flex items-center gap-2', topicBgLight(color))}>
                      <Network className={cn('w-4 h-4 flex-shrink-0', topicText(color))} />
                      <h2 className={cn('text-sm font-bold', topicText(color))}>{parsedSlide.title || 'Step by Step'}</h2>
                    </div>
                    <div className="p-4 space-y-2.5 bg-white">
                      {parsedSlide.intro && (
                        <p className="text-sm text-gray-600 leading-relaxed pb-1">{parsedSlide.intro}</p>
                      )}
                      {(() => {
                        let stepIdx = 0
                        const bulletCount = parsedSlide.contentBlocks.filter(b => b.type === 'bullet').length
                        return parsedSlide.contentBlocks.map((cb, i) => {
                          if (cb.type === 'bullet') {
                            const n = ++stepIdx
                            const isLast = n === bulletCount
                            return (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className={cn('w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center z-10', topicBtn(color).split(' ')[0])}>
                                    {n}
                                  </div>
                                  {!isLast && <div className="w-0.5 h-4 bg-gray-200 my-0.5" />}
                                </div>
                                <div className={cn('flex-1 rounded-xl px-3 py-2.5 mb-0', topicBgLight(color))}>
                                  <p className="text-sm text-gray-700 leading-relaxed">{cb.text}</p>
                                </div>
                              </div>
                            )
                          }
                          return (
                            <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                              {cb.text}
                            </div>
                          )
                        })
                      })()}
                      {parsedSlide.examTip && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Exam Tip</span>
                          </div>
                          <p className="text-sm text-amber-800 leading-relaxed">{parsedSlide.examTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'takeaway' && (
                  <div>
                    <div className="bg-green-50 px-5 py-3.5 border-b border-green-100 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <h2 className="text-sm font-bold text-green-800">Key Takeaways</h2>
                    </div>
                    <div className="p-4 space-y-2 bg-white">
                      {parsedSlide.intro && <p className="text-sm text-gray-600 pb-1">{parsedSlide.intro}</p>}
                      {parsedSlide.contentBlocks.map((cb, i) =>
                        cb.type === 'bullet' ? (
                          <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-green-500 text-base leading-none flex-shrink-0 mt-0.5 font-bold">✓</span>
                            <span className="text-sm text-gray-700 leading-relaxed">{cb.text}</span>
                          </div>
                        ) : (
                          <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                            {cb.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'examtip' && (
                  <div>
                    <div className="bg-amber-50 px-5 py-3.5 border-b border-amber-200 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">CCNA Exam Tip</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2.5 bg-amber-50">
                      <p className="text-amber-900 text-sm leading-relaxed font-medium">{parsedSlide.examTip || parsedSlide.intro}</p>
                      {parsedSlide.contentBlocks.map((cb, i) =>
                        cb.type === 'bullet' ? (
                          <div key={i} className="flex items-start gap-2.5 bg-amber-100 rounded-xl px-3 py-2.5 border border-amber-200">
                            <span className="text-amber-600 font-bold text-sm flex-shrink-0">•</span>
                            <span className="text-sm text-amber-900 leading-relaxed">{cb.text}</span>
                          </div>
                        ) : (
                          <div key={i} className="px-4 py-2.5 rounded-xl bg-amber-100/60 border border-amber-200 text-sm text-amber-900 leading-relaxed">
                            {cb.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'cli' && (
                  <div>
                    {parsedSlide.title && (
                      <div className={cn('px-5 py-3.5 border-b', topicBgLight(color))}>
                        <h2 className={cn('text-sm font-bold', topicText(color))}>{parsedSlide.title}</h2>
                      </div>
                    )}
                    <div className="p-4 space-y-3 bg-white">
                      {parsedSlide.intro && <p className="text-gray-700 text-sm leading-relaxed">{parsedSlide.intro}</p>}
                      {parsedSlide.contentBlocks.map((cb, i) =>
                        cb.type === 'bullet' ? (
                          <div key={i} className={cn('flex items-start gap-3 px-3 py-2.5 rounded-xl', topicBgLight(color))}>
                            <div className={cn('w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5', topicBtn(color).split(' ')[0])}>•</div>
                            <span className="text-sm text-gray-700">{cb.text}</span>
                          </div>
                        ) : (
                          <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                            {cb.text}
                          </div>
                        )
                      )}
                      {parsedSlide.terminalLines && parsedSlide.terminalLines.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-700 shadow-md">
                          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <span className="text-gray-400 text-xs font-mono ml-2">Terminal</span>
                          </div>
                          <div className="bg-gray-900 p-4">
                            <div className="font-mono text-sm space-y-1">
                              {parsedSlide.terminalLines.map((line, i) => (
                                <div key={i} className={
                                  line.startsWith('$') || line.startsWith('>') || line.startsWith('Router') || line.startsWith('Switch')
                                    ? 'text-green-400'
                                    : line.startsWith('!') || line.startsWith('%')
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }>
                                  {line || '\u00A0'}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {parsedSlide.diagramLines && parsedSlide.diagramLines.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-md">
                          <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <Network className="w-3.5 h-3.5 text-gray-400 ml-2" />
                            <span className="text-gray-400 text-xs font-mono">Network Diagram</span>
                          </div>
                          <div className="bg-gray-950 p-5 overflow-x-auto">
                            <pre className="font-mono text-sm text-cyan-300 leading-relaxed whitespace-pre">{parsedSlide.diagramLines.join('\n')}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'diagram' && (
                  <div>
                    {parsedSlide.title && (
                      <div className={cn('px-5 py-3.5 border-b', topicBgLight(color))}>
                        <h2 className={cn('text-sm font-bold', topicText(color))}>{parsedSlide.title}</h2>
                      </div>
                    )}
                    <div className="p-5 space-y-4 bg-white">
                      {parsedSlide.intro && <p className="text-gray-700 text-sm leading-relaxed">{parsedSlide.intro}</p>}
                      {parsedSlide.paragraphs.map((p, i) => (
                        <p key={i} className="text-gray-700 text-sm leading-relaxed">{p}</p>
                      ))}
                      {parsedSlide.bullets.length > 0 && (
                        <div className="space-y-2">
                          {parsedSlide.bullets.map((b, i) => (
                            <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl', topicBgLight(color))}>
                              <div className={cn('w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5', topicBtn(color).split(' ')[0])}>{i + 1}</div>
                              <span className="text-sm text-gray-700">{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {parsedSlide.diagramLines && parsedSlide.diagramLines.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-md">
                          <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <Network className="w-3.5 h-3.5 text-gray-400 ml-2" />
                            <span className="text-gray-400 text-xs font-mono">Network Diagram</span>
                          </div>
                          <div className="bg-gray-950 p-5 overflow-x-auto">
                            <pre className="font-mono text-sm text-cyan-300 leading-relaxed whitespace-pre">{parsedSlide.diagramLines.join('\n')}</pre>
                          </div>
                        </div>
                      )}
                      {parsedSlide.examTip && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Exam Tip</span>
                          </div>
                          <p className="text-sm text-amber-800 leading-relaxed">{parsedSlide.examTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sectionType === 'concept' && (
                  <div>
                    {parsedSlide.title && (
                      <div className={cn('px-5 py-3.5 border-b', topicBgLight(color))}>
                        <h2 className={cn('font-bold text-base leading-snug', topicText(color))}>{parsedSlide.title}</h2>
                      </div>
                    )}
                    <div className="p-4 space-y-2.5 bg-white">
                      {parsedSlide.intro && parsedSlide.intro.split('\n').filter(Boolean).map((line, i) => (
                        <p key={i} className="text-sm text-gray-600 leading-relaxed pb-0.5">{line}</p>
                      ))}

                      {(() => {
                        const blocks = parsedSlide.semanticBlocks
                        if (blocks.length === 0) return null
                        let bIdx = 0
                        return blocks.map((sb, i) => {
                          const next = blocks[i + 1]

                          if (sb.kind === 'step') {
                            const isLastStep = next?.kind !== 'step'
                            return (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className={cn('w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center', topicBtn(color).split(' ')[0])}>
                                    {sb.num}
                                  </div>
                                  {!isLastStep && <div className="w-0.5 h-4 bg-gray-200 my-0.5" />}
                                </div>
                                <div className={cn('flex-1 rounded-xl px-3 py-2.5 mb-0.5', topicBgLight(color))}>
                                  <p className="text-sm font-semibold text-gray-800 leading-snug">{sb.header}</p>
                                  {sb.items.map((item, j) => (
                                    <p key={j} className="text-xs text-gray-600 mt-1 leading-relaxed">{item}</p>
                                  ))}
                                </div>
                              </div>
                            )
                          }

                          if (sb.kind === 'definition') {
                            return (
                              <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                                <div className={cn('px-3 py-2 text-xs font-bold uppercase tracking-wide', topicBgLight(color), topicText(color))}>
                                  {sb.term}
                                </div>
                                <div className="px-3 py-2.5 bg-white space-y-1">
                                  {sb.body.map((line, j) => (
                                    <p key={j} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                                  ))}
                                </div>
                              </div>
                            )
                          }

                          if (sb.kind === 'commands') {
                            return (
                              <div key={i} className="rounded-xl overflow-hidden border border-gray-700 shadow-sm">
                                <div className="bg-gray-800 px-3 py-1.5 flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                  </div>
                                  <span className="text-gray-400 text-xs font-mono ml-1">Terminal</span>
                                </div>
                                <div className="bg-gray-900 px-4 py-3 font-mono text-sm space-y-0.5">
                                  {sb.lines.map((line, j) => (
                                    <div key={j} className={
                                      line.startsWith('!') ? 'text-yellow-400' :
                                      isCliLike(line) ? 'text-green-400' : 'text-gray-300'
                                    }>{line || '\u00A0'}</div>
                                  ))}
                                </div>
                              </div>
                            )
                          }

                          if (sb.kind === 'callout') {
                            return (
                              <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">{sb.marker}</p>
                                {sb.body.map((line, j) => (
                                  <p key={j} className="text-sm text-amber-900 leading-relaxed">{line}</p>
                                ))}
                              </div>
                            )
                          }

                          if (sb.kind === 'keyval') {
                            return (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                                <span className={cn('text-sm font-semibold flex-shrink-0', topicText(color))}>{sb.key}</span>
                                <span className="text-gray-400 flex-shrink-0 text-sm">&rarr;</span>
                                <span className="text-sm text-gray-700 flex-1">{sb.value}</span>
                              </div>
                            )
                          }

                          if (sb.kind === 'bullet') {
                            bIdx++
                            const n = bIdx
                            return (
                              <div key={i} className={cn('flex items-start gap-3 px-3 py-2.5 rounded-xl', topicBgLight(color))}>
                                <div className={cn('flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5', topicBtn(color).split(' ')[0])}>{n}</div>
                                <span className="text-sm text-gray-700 leading-relaxed">{sb.text}</span>
                              </div>
                            )
                          }

                          return (
                            <div key={i} className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                              {sb.text}
                            </div>
                          )
                        })
                      })()}

                      {parsedSlide.terminalLines && parsedSlide.terminalLines.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-700 shadow-md">
                          <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <span className="text-gray-400 text-xs font-mono ml-2">Terminal</span>
                          </div>
                          <div className="bg-gray-900 p-4">
                            <div className="font-mono text-sm space-y-1">
                              {parsedSlide.terminalLines.map((line, i) => (
                                <div key={i} className={
                                  line.startsWith('$') || line.startsWith('>') || line.startsWith('Router') || line.startsWith('Switch')
                                    ? 'text-green-400'
                                    : line.startsWith('!') || line.startsWith('%')
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }>
                                  {line || '\u00A0'}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {parsedSlide.diagramLines && parsedSlide.diagramLines.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-md">
                          <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <Network className="w-3.5 h-3.5 text-gray-400 ml-2" />
                            <span className="text-gray-400 text-xs font-mono">Network Diagram</span>
                          </div>
                          <div className="bg-gray-950 p-5 overflow-x-auto">
                            <pre className="font-mono text-sm text-cyan-300 leading-relaxed whitespace-pre">{parsedSlide.diagramLines.join('\n')}</pre>
                          </div>
                        </div>
                      )}

                      {parsedSlide.examTip && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Exam Tip</span>
                          </div>
                          <p className="text-sm text-amber-800 leading-relaxed">{parsedSlide.examTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isKeyTermsStep && (
              <AiTutor
                key={`${lesson.id}-${slideIdx}`}
                lessonTitle={lesson.title}
                slideTitle={parsedSlide.title}
                slideContent={lesson.content[slideIdx]}
              />
            )}

            <div className="flex gap-3 mt-auto">
              <button onClick={goPrev}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={goNext}
                className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-colors', btnClass)}>
                {isKeyTermsStep
                  ? quizQuestions.length > 0
                    ? <><Zap className="w-4 h-4" /> Take Quiz</>
                    : <><CheckCircle className="w-4 h-4" /> Finish Lesson</>
                  : slideIdx === totalSlides - 1 && !hasKeyTerms
                    ? quizQuestions.length > 0
                      ? <><Zap className="w-4 h-4" /> Take Quiz</>
                      : <><CheckCircle className="w-4 h-4" /> Finish Lesson</>
                    : <>Next <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        )}

        {phase === 'quiz' && !quizDone && (
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-bold text-gray-800">Knowledge Check</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {quizQuestions.map((_, i) => (
                    <div key={i} className={cn('w-2 h-2 rounded-full transition-colors',
                      i === quizIdx ? 'bg-purple-500' :
                      i < quizIdx ? 'bg-purple-300' : 'bg-gray-200')} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{quizIdx + 1}/{quizQuestions.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <p className="text-base font-bold text-gray-900 mb-5 leading-snug">
                {quizQuestions[quizIdx].question}
              </p>

              <div className="space-y-2.5">
                {quizQuestions[quizIdx].options.map((opt, i) => {
                  let optStyle = 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  if (showExplanation) {
                    if (i === quizQuestions[quizIdx].correctAnswer) {
                      optStyle = 'border-green-400 bg-green-50 text-green-800'
                    } else if (i === selectedAnswer) {
                      optStyle = cn('border-red-400 bg-red-50 text-red-700', answerAnim === 'wrong' ? 'answer-shake' : '')
                    } else {
                      optStyle = 'border-gray-100 bg-gray-50 text-gray-400'
                    }
                  } else if (i === selectedAnswer) {
                    optStyle = 'border-blue-400 bg-blue-50 text-blue-800'
                  }

                  return (
                    <button key={i} disabled={showExplanation} onClick={() => handleSelectAnswer(i)}
                      className={cn('w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium', optStyle)}>
                      <span className="flex items-start gap-3">
                        <span className={cn('flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5',
                          i === selectedAnswer && !showExplanation ? 'border-blue-400 bg-blue-400 text-white' : 'border-current')}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {showExplanation && (
                <div className={cn('mt-4 p-4 rounded-xl',
                  selectedAnswer === quizQuestions[quizIdx].correctAnswer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200')}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {selectedAnswer === quizQuestions[quizIdx].correctAnswer
                      ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      : <X className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    <span className={cn('text-xs font-bold uppercase tracking-wide',
                      selectedAnswer === quizQuestions[quizIdx].correctAnswer ? 'text-green-700' : 'text-red-700')}>
                      {selectedAnswer === quizQuestions[quizIdx].correctAnswer ? 'Correct!' : 'Not quite — here\'s why:'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{quizQuestions[quizIdx].explanation}</p>
                  {selectedAnswer !== quizQuestions[quizIdx].correctAnswer && selectedAnswer !== null && (
                    <AiExplanation
                      questionId={quizQuestions[quizIdx].id}
                      question={quizQuestions[quizIdx].question}
                      options={quizQuestions[quizIdx].options}
                      userAnswer={quizQuestions[quizIdx].options[selectedAnswer]}
                      correctAnswer={quizQuestions[quizIdx].options[quizQuestions[quizIdx].correctAnswer]}
                      existingExplanation={quizQuestions[quizIdx].explanation}
                      context="lesson quiz"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!showExplanation ? (
                <button onClick={submitAnswer} disabled={selectedAnswer === null}
                  className={cn('flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors',
                    selectedAnswer !== null ? cn(btnClass) : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
                  Check Answer
                </button>
              ) : (
                <button onClick={nextQuestion}
                  className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-colors', btnClass)}>
                  {quizIdx < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div className="flex flex-col items-center gap-5 py-6">

            <div className="celebrate-bounce">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Lesson Complete!</h2>
              <p className="text-gray-500 text-sm mt-1">{lesson.title}</p>
            </div>

            {quizQuestions.length > 0 && (
              <div className="flex gap-3 w-full">
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{correctCount}/{quizQuestions.length}</div>
                  <div className="text-xs font-semibold text-blue-700 mt-0.5 flex items-center justify-center gap-1">
                    <Brain className="w-3 h-3" /> Quiz Score
                  </div>
                </div>
                <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{totalSlides}</div>
                  <div className="text-xs font-semibold text-green-700 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Sections Done
                  </div>
                </div>
              </div>
            )}

            {quizQuestions.length > 0 && correctCount < quizQuestions.length && (
              <button onClick={resetQuiz} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Retake quiz
              </button>
            )}

            <div className="w-full space-y-3">
              {nextLesson ? (
                <button onClick={() => router.push(`/lessons/${nextLesson.id}`)}
                  className={cn('w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base transition-colors', btnClass)}>
                  Next Lesson <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => router.push('/curriculum')}
                  className={cn('w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base transition-colors', btnClass)}>
                  Back to Curriculum <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setSlideIdx(0); setPhase('learn') }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Review
                </button>
                <button onClick={() => setShowTerms(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <Brain className="w-3.5 h-3.5" /> Terms
                </button>
                <button onClick={() => setShowNotes(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </button>
              </div>

              {prevLesson && (
                <button onClick={() => router.push(`/lessons/${prevLesson.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2">
                  <ChevronLeft className="w-3.5 h-3.5" /> {prevLesson.title}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
