'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle, Terminal,
  BookOpen, Clock, Star, Lightbulb, Network, Shield, Zap,
  RotateCcw, ChevronDown, ChevronUp, Eye, EyeOff, Trophy
} from 'lucide-react'

// types

interface LabStep {
  id: string
  title: string
  explanation: string
  commands: string[]
  expectedOutput?: string
  hint?: string
  note?: string
}

interface Lab {
  id: string
  title: string
  module: string
  moduleColor: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  objectives: string[]
  background: string
  topology: string
  steps: LabStep[]
}

const LABS: Lab[] = [
  {
    id: 'basic-switch-config',
    title: 'Basic Switch Configuration',
    module: 'Network Fundamentals',
    moduleColor: 'blue',
    difficulty: 'beginner',
    duration: 20,
    background: 'TBD',
    topology: 'TBD',
    objectives: [
      'TBD',
    ],
    steps: [
      {
        id: 's1',
        title: 'Enter Privileged EXEC Mode',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 's2',
        title: 'Enter Global Configuration Mode',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 's3',
        title: 'Set the Hostname',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 's4',
        title: 'Set the Enable Secret Password',
        explanation: 'TBD',
        commands: ['TBD'],
        hint: 'TBD',
      },
      {
        id: 's5',
        title: 'Secure the Console Line',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 's6',
        title: 'Secure VTY Lines (Telnet/SSH Access)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 's7',
        title: 'Encrypt All Passwords in Config',
        explanation: 'TBD',
        commands: ['TBD'],
        hint: 'TBD',
      },
      {
        id: 's8',
        title: 'Add a Login Banner',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 's9',
        title: 'Disable Unused Ports',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
      {
        id: 's10',
        title: 'Save the Configuration',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 's11',
        title: 'Verify the Configuration',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
    ],
  },

  {
    id: 'vlan-trunking',
    title: 'VLAN and Trunk Configuration',
    module: 'Network Access',
    moduleColor: 'green',
    difficulty: 'intermediate',
    duration: 30,
    background: 'TBD',
    topology: 'TBD',
    objectives: [
      'TBD',
    ],
    steps: [
      {
        id: 'v1',
        title: 'Create VLANs on SW1',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'v2',
        title: 'Assign Access Ports on SW1',
        explanation: 'TBD',
        commands: ['TBD'],
        hint: 'TBD',
      },
      {
        id: 'v3',
        title: 'Configure the Trunk Port on SW1',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'v4',
        title: 'Repeat Configuration on SW2',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'v5',
        title: 'Verify VLANs',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'v6',
        title: 'Verify the Trunk Link',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'v7',
        title: 'Test Connectivity (Conceptual)',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'v8',
        title: 'Save Configuration',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
    ],
  },

  {
    id: 'router-static-routing',
    title: 'Static Routing Configuration',
    module: 'IP Connectivity',
    moduleColor: 'purple',
    difficulty: 'intermediate',
    duration: 30,
    background: 'TBD',
    topology: 'TBD',
    objectives: [
      'TBD',
    ],
    steps: [
      {
        id: 'r1',
        title: 'Configure R1 Interfaces',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'r2',
        title: 'Configure R2 Interfaces',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'r3',
        title: 'Configure R3 Interfaces',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'r4',
        title: 'Check the Routing Table — Before Static Routes',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'r5',
        title: 'Add Static Routes on R1',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'r6',
        title: 'Add Static Routes on R2',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'r7',
        title: 'Add Static Routes on R3',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'r8',
        title: 'Add a Default Route on R1 (Simulated Internet)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'r9',
        title: 'Verify Routing Tables',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'r10',
        title: 'Test End-to-End Connectivity',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
    ],
  },

  {
    id: 'ospf-single-area',
    title: 'OSPF Single-Area Configuration',
    module: 'IP Connectivity',
    moduleColor: 'purple',
    difficulty: 'intermediate',
    duration: 35,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'o1',
        title: 'Configure R1 IP Addressing',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'o2',
        title: 'Enable OSPF on R1',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'o3',
        title: 'Enable OSPF on R2',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'o4',
        title: 'Enable OSPF on R3',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'o5',
        title: 'Verify OSPF Neighbor Adjacencies',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'o6',
        title: 'Verify OSPF Routes in Routing Table',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'o7',
        title: 'Verify OSPF Interface Details',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
      {
        id: 'o8',
        title: 'Adjust OSPF Reference Bandwidth',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'o9',
        title: 'Test End-to-End Connectivity',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
    ],
  },

  {
    id: 'basic-dhcp-config',
    title: 'DHCP Server Configuration',
    module: 'IP Services',
    moduleColor: 'orange',
    difficulty: 'intermediate',
    duration: 25,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'd1',
        title: 'Exclude Static IP Addresses',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'd2',
        title: 'Create the DHCP Pool',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'd3',
        title: 'Verify the DHCP Pool Configuration',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
      {
        id: 'd4',
        title: 'Create a DHCP Reservation',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'd5',
        title: 'Configure DHCP Relay for Branch Subnet',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'd6',
        title: 'Simulate Client Address Request (IOS DHCP Client)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'd7',
        title: 'Verify DHCP Bindings',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'd8',
        title: 'Troubleshoot DHCP Issues',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
    ],
  },

  {
    id: 'acl-configuration',
    title: 'ACL Configuration Lab',
    module: 'Security Fundamentals',
    moduleColor: 'red',
    difficulty: 'intermediate',
    duration: 35,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'a1',
        title: 'Configure Interface IP Addresses',
        explanation: 'TBD',
        commands: ['TBD'],
      },
      {
        id: 'a2',
        title: 'Create a Standard ACL — Restrict SSH Access',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'a3',
        title: 'Apply Standard ACL to VTY Lines',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'a4',
        title: 'Create an Extended ACL — Block HR from the SSH Server',
        explanation: 'TBD',
        commands: ['TBD'],
        hint: 'TBD',
      },
      {
        id: 'a5',
        title: 'Apply Extended ACL to Interface',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'a6',
        title: 'Verify ACLs Are Applied',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
      {
        id: 'a7',
        title: 'View ACL Hit Counters',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'a8',
        title: 'Test and Troubleshoot the ACL',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
    ],
  },

  {
    id: 'basic-nat-config',
    title: 'NAT and PAT Configuration',
    module: 'IP Services',
    moduleColor: 'orange',
    difficulty: 'intermediate',
    duration: 30,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'n1',
        title: 'Configure Interfaces',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'n2',
        title: 'Mark Inside and Outside Interfaces',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'n3',
        title: 'Configure PAT (NAT Overload)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
        hint: 'TBD',
      },
      {
        id: 'n4',
        title: 'Configure Static NAT for the Web Server',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'n5',
        title: 'Verify NAT Configuration',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
      },
      {
        id: 'n6',
        title: 'Test PAT — Inside Host Accessing Internet',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'n7',
        title: 'Troubleshoot NAT',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        hint: 'TBD',
      },
    ],
  },

  {
    id: 'wireless-setup',
    title: 'Wireless Security Configuration',
    module: 'Security Fundamentals',
    moduleColor: 'red',
    difficulty: 'intermediate',
    duration: 20,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'w1',
        title: 'Understanding Wireless Security Protocols',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'w2',
        title: 'Create the Corporate SSID (WPA2-PSK)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'w3',
        title: 'Create a Guest SSID (Isolated)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'w4',
        title: 'Enable 802.1X Authentication (WPA2-Enterprise Concept)',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'w5',
        title: 'Wireless Security Best Practices',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
    ],
  },

  {
    id: 'api-exploration',
    title: 'Network Automation Concepts Lab',
    module: 'Network Automation',
    moduleColor: 'indigo',
    difficulty: 'advanced',
    duration: 25,
    background: 'TBD',
    topology: 'TBD',
    objectives: ['TBD'],
    steps: [
      {
        id: 'api1',
        title: 'Understanding REST API Methods',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'api2',
        title: 'Using curl to Call a REST API',
        explanation: 'TBD',
        commands: ['TBD'],
        expectedOutput: 'TBD',
        note: 'TBD',
      },
      {
        id: 'api3',
        title: 'Reading JSON Data',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'api4',
        title: 'Ansible Playbook Structure',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'api5',
        title: 'Ansible Inventory File',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
      {
        id: 'api6',
        title: 'SDN Architecture Overview',
        explanation: 'TBD',
        commands: ['TBD'],
        note: 'TBD',
      },
    ],
  },
]

// styles

const MODULE_STYLES: Record<string, { bg: string; light: string; text: string; border: string; badge: string; btn: string }> = {
  blue:   { bg: 'bg-blue-600',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  green:  { bg: 'bg-green-600',  light: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  btn: 'bg-green-600 hover:bg-green-700 text-white' },
  purple: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
  orange: { bg: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-600 hover:bg-orange-700 text-white' },
  red:    { bg: 'bg-red-600',    light: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    btn: 'bg-red-600 hover:bg-red-700 text-white' },
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
}

const difficultyStyle = (d: string) =>
  d === 'beginner' ? 'bg-green-100 text-green-700' :
  d === 'intermediate' ? 'bg-amber-100 text-amber-700' :
  'bg-red-100 text-red-700'


export default function LabsPage() {
  const router = useRouter()
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<string>>>({})
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set())
  const [revealedOutputs, setRevealedOutputs] = useState<Set<string>>(new Set())
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const { localDB } = await import('@/lib/localdb')
        const all = await localDB.labSteps.toArray()
        const converted: Record<string, Set<string>> = {}
        for (const rec of all) {
          converted[rec.labId] = new Set(rec.completedSteps)
        }
        setCompletedSteps(converted)
      } catch { /* ignore */ }
    }
    load()
  }, [])

  function saveProgress(updated: Record<string, Set<string>>) {
    import('@/lib/localdb').then(({ localDB }) =>
      Promise.all(
        Object.entries(updated).map(([labId, steps]) =>
          localDB.labSteps.put({ labId, completedSteps: Array.from(steps) })
        )
      )
    ).catch(() => {})
  }

  function toggleStep(labId: string, stepId: string) {
    setCompletedSteps(prev => {
      const labSteps = new Set(prev[labId] ?? [])
      if (labSteps.has(stepId)) {
        labSteps.delete(stepId)
      } else {
        labSteps.add(stepId)
      }
      const updated = { ...prev, [labId]: labSteps }
      saveProgress(updated)
      return updated
    })
  }

  function toggleExpanded(stepId: string) {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  function getLabProgress(lab: Lab): number {
    const done = completedSteps[lab.id]?.size ?? 0
    return Math.round((done / lab.steps.length) * 100)
  }

  function resetLabProgress(lab: Lab) {
    setCompletedSteps(prev => {
      const updated: Record<string, Set<string>> = { ...prev, [lab.id]: new Set<string>() }
      saveProgress(updated)
      return updated
    })
    setRevealedHints(new Set())
    setRevealedOutputs(new Set())
    setExpandedSteps(new Set())
  }

  // list

  if (!selectedLab) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Back to home"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Practice Labs</h1>
              <p className="text-xs text-gray-500">Step-by-step Cisco CLI labs</p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hands-On Labs</h2>
            <p className="text-gray-500 text-sm max-w-2xl">
              Each lab provides step-by-step instructions with exact commands and expected output. Work through them in order or jump to the topic you are studying. Use Cisco Packet Tracer or a DevNet Sandbox to practice with real devices.
            </p>
          </div>

          {/* ── Lab 01 – Featured (fully interactive, links to dedicated page) ── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Start Here</span>
              <span className="text-xs text-gray-400">· Beginner Foundations</span>
            </div>
            <Link
              href="/labs/lab01"
              className="group block bg-white rounded-2xl border-2 border-primary-200 shadow-card hover:shadow-card-hover hover:border-primary-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary-600">Lab 01</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Beginner</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Network Foundations and Device Roles
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Network className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Analyze a small office network topology. Identify device roles, distinguish LAN from WAN, and trace how packets travel from a laptop to a web server.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 15–20 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 10 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {['MC', 'Topology', 'Sequencing', 'Output', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 02 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab02"
              className="group block bg-white rounded-2xl border-2 border-indigo-200 shadow-card hover:shadow-card-hover hover:border-indigo-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">Lab 02</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Beginner</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Models, Layers, and Packet Journey
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Explore the OSI and TCP/IP models, identify PDUs at each layer, trace a packet from Host A to Host B, and type your first CLI commands.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 20–25 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 12 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Sequencing', 'CLI Input', 'Output', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 03 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab03"
              className="group block bg-white rounded-2xl border-2 border-teal-200 shadow-card hover:shadow-card-hover hover:border-teal-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-teal-600">Lab 03</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Beginner</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Ethernet, Frames, and MAC Addressing
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <Network className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Explore how Ethernet frames are built, how switches use MAC address tables, and how unicast, broadcast, and multicast traffic behave in a LAN.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 20–25 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Frame Mapping', 'CLI Input', 'Output', 'Topology'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 04 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab04"
              className="group block bg-white rounded-2xl border-2 border-orange-200 shadow-card hover:shadow-card-hover hover:border-orange-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600">Lab 04</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Beginner–Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Switching Logic, MAC Tables, and ARP
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Network className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Trace how switches learn MAC addresses, make forwarding decisions, and how ARP enables communication within a LAN — with live flooding and CAM table visualization.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 25–30 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'Sequencing', 'CLI Input', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 05 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab05"
              className="group block bg-white rounded-2xl border-2 border-green-200 shadow-card hover:shadow-card-hover hover:border-green-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-green-600">Lab 05</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      IPv4 Addressing and Network Fundamentals
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Network className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Master IPv4 structure, subnet masks, CIDR notation, binary conversion, and special addresses — including APIPA, loopback, and public vs private IP ranges.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 30–35 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 18 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Binary', 'Topology', 'CLI Input', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 06 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab06"
              className="group block bg-white rounded-2xl border-2 border-amber-200 shadow-card hover:shadow-card-hover hover:border-amber-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-600">Lab 06</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Subnetting, Packet Flow, and Troubleshooting
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Network className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Apply subnetting to real scenarios — identify subnet boundaries, trace packet flow between subnets, and troubleshoot connectivity issues using ping and structured analysis.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 35–45 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Subnetting', 'Topology', 'CLI Input', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 07 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab07"
              className="group block bg-white rounded-2xl border-2 border-indigo-200 shadow-card hover:shadow-card-hover hover:border-indigo-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">Lab 07</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Routing Fundamentals and Path Decisions
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Network className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Understand how routers forward packets using routing tables, connected and local routes, longest prefix match, and how MAC addresses change at each hop.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 30–40 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Routing Table', 'Topology', 'CLI Input', 'Sequencing'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 08 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab08"
              className="group block bg-white rounded-2xl border-2 border-blue-200 shadow-card hover:shadow-card-hover hover:border-blue-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-slate-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600">Lab 08</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Static Routing and Default Routes
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Network className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Configure static routes and default routes on Cisco routers, interpret routing tables, understand administrative distance, and troubleshoot missing connectivity across two routers.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 35–45 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 12 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['CLI Config', 'Routing Table', 'Sequencing', 'Troubleshoot', 'Output'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 09 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab09"
              className="group block bg-white rounded-2xl border-2 border-violet-200 shadow-card hover:shadow-card-hover hover:border-violet-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-600">Lab 09</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      VLAN Fundamentals and Port Roles
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                    <Network className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Configure VLANs on a dual-switch network, assign access ports to Engineering and Sales VLANs, set up trunk links, and troubleshoot VLAN isolation and broadcast domain behavior.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 30–40 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 14 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['CLI Config', 'VLAN Table', 'Topology', 'Troubleshoot', 'Output'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-violet-600 group-hover:text-violet-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 10 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab10"
              className="group block bg-white rounded-2xl border-2 border-purple-200 shadow-card hover:shadow-card-hover hover:border-purple-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-purple-500 to-fuchsia-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-600">Lab 10</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-100 text-fuchsia-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Trunking and Inter-VLAN Routing
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Network className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Configure 802.1Q trunk ports, implement Router-on-a-Stick with subinterfaces, assign VLAN gateways, analyze inter-VLAN packet flow, and create SVIs on a Layer 3 switch.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['CLI Config', 'Router-on-a-Stick', 'Topology', 'Troubleshoot', 'Conceptual'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 11 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab11"
              className="group block bg-white rounded-2xl border-2 border-emerald-200 shadow-card hover:shadow-card-hover hover:border-emerald-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600">Lab 11</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      STP Foundations and EtherChannel
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Network className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Analyze how STP prevents Layer 2 loops, trace root bridge election, identify port roles, understand RSTP improvements, and differentiate LACP vs PAgP for link aggregation.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'Sequencing', 'CLI Input', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 12 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab12"
              className="group block bg-white rounded-2xl border-2 border-blue-200 shadow-card hover:shadow-card-hover hover:border-blue-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-sky-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600">Lab 12</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      OSPF Fundamentals
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Network className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Explore OSPF link-state routing, Hello packets and adjacency states, Dijkstra SPF algorithm, cost metric, and troubleshoot neighbor relationships using CLI output.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'CLI Input', 'Output', 'Conceptual'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 13 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab13"
              className="group block bg-white rounded-2xl border-2 border-cyan-200 shadow-card hover:shadow-card-hover hover:border-cyan-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-cyan-600">Lab 13</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      IPv6 Addressing and Neighbor Discovery
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <Network className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Master IPv6 128-bit hex addressing, shortening rules, global unicast vs link-local vs multicast types, SLAAC with RS/RA, and how NDP replaces ARP.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 35–45 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'CLI Input', 'Conceptual', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-cyan-600 group-hover:text-cyan-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 14 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab14"
              className="group block bg-white rounded-2xl border-2 border-orange-200 shadow-card hover:shadow-card-hover hover:border-orange-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600">Lab 14</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      DHCP, DNS, and NAT
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Network className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Trace the DHCP DORA process, understand DNS A and AAAA records, analyze NAT translation tables, and troubleshoot APIPA addressing and internet connectivity failures.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Sequencing', 'Topology', 'CLI Input', 'Troubleshoot'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 15 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab15"
              className="group block bg-white rounded-2xl border-2 border-violet-200 shadow-card hover:shadow-card-hover hover:border-violet-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-600">Lab 15</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      NTP, Syslog, SNMP, CDP, and LLDP
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                    <Network className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Understand NTP stratum levels, Syslog severity 0–7, SNMP polling vs traps, MIB structure, and how CDP and LLDP reveal directly connected neighbor information.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 14 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'CLI Input', 'Conceptual', 'Output'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-violet-600 group-hover:text-violet-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 16 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab16"
              className="group block bg-white rounded-2xl border-2 border-rose-200 shadow-card hover:shadow-card-hover hover:border-rose-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-rose-500 to-red-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-rose-600">Lab 16</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      ACL Fundamentals
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                    <Network className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Configure Standard and Extended ACLs, apply wildcard masks, understand top-down processing and implicit deny, place ACLs correctly, and troubleshoot common misconfigurations.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'CLI Input', 'Topology', 'Troubleshoot', 'Sequencing'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-rose-600 group-hover:text-rose-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 17 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab17"
              className="group block bg-white rounded-2xl border-2 border-slate-200 shadow-card hover:shadow-card-hover hover:border-slate-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-slate-500 to-teal-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-600">Lab 17</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Intermediate–Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Port Security and Wireless Basics
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <Network className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Configure Port Security with sticky MAC learning and violation modes, understand err-disabled recovery, and identify wireless architecture components including APs, WLCs, CAPWAP, and wireless security protocols.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 40–50 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'CLI Input', 'Troubleshoot', 'Conceptual'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 18 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab18"
              className="group block bg-white rounded-2xl border-2 border-indigo-200 shadow-card hover:shadow-card-hover hover:border-indigo-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">Lab 18</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Intermediate</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Network Automation and Programmability
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Network className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Understand network automation benefits, identify JSON/XML/YAML data formats, interpret API responses, apply REST HTTP methods, trace client-server API flow, and compare Ansible, Puppet, and Chef.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 35–45 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 15 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['MC', 'Topology', 'Sequencing', 'Conceptual'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 19 – Featured ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab19"
              className="group block bg-white rounded-2xl border-2 border-fuchsia-200 shadow-card hover:shadow-card-hover hover:border-fuchsia-400 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-fuchsia-500 to-pink-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-fuchsia-600">Lab 19</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Advanced</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-100 text-fuchsia-700">Interactive</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Mixed Network Troubleshooting Challenge
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center group-hover:bg-fuchsia-200 transition-colors">
                    <Network className="w-5 h-5 text-fuchsia-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Diagnose simultaneous Layer 2–7 failures across VLANs, routing, OSPF, DHCP, DNS, NAT, and ACLs in a realistic branch office network scenario.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 50–60 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 20 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['Troubleshoot', 'Output Analysis', 'CLI Input', 'MC', 'Sequencing'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-fuchsia-600 group-hover:text-fuchsia-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Lab 20 – Featured (Final) ── */}
          <div className="mb-8">
            <Link
              href="/labs/lab20"
              className="group block bg-white rounded-2xl border-2 border-amber-300 shadow-card hover:shadow-card-hover hover:border-amber-500 transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-yellow-500 to-amber-500" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-600">Lab 20 · Final</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Advanced</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">
                      Final CCNA Practical Review
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Network className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  End-to-end practical review covering core CCNA concepts — VLANs, routing, OSPF, DHCP, DNS, NAT, ACLs, port security, and wireless. A great companion for your exam prep.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> 60–75 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" /> 20 Questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {['Troubleshoot', 'Output Analysis', 'CLI Input', 'Sequencing', 'Conceptual'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">
                    Start Lab →
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    )
  }

  // detail

  const style = MODULE_STYLES[selectedLab.moduleColor] ?? MODULE_STYLES.blue
  const progress = getLabProgress(selectedLab)
  const labStepsDone = completedSteps[selectedLab.id] ?? new Set<string>()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedLab(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${style.text}`}>{selectedLab.module}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{selectedLab.title}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden sm:inline">{progress}%</span>
            <button
              onClick={() => resetLabProgress(selectedLab)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Reset progress"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div className={`h-full transition-all duration-500 ${style.bg}`} style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        <div className={`rounded-2xl p-5 ${style.light}`}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${difficultyStyle(selectedLab.difficulty)}`}>
              {selectedLab.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" /> {selectedLab.duration} min
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <BookOpen className="w-3.5 h-3.5" /> {selectedLab.steps.length} steps
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedLab.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{selectedLab.background}</p>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-500" /> Objectives
          </h3>
          <ul className="space-y-2">
            {selectedLab.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" /> Lab Topology
          </h3>
          <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre">
            {selectedLab.topology}
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Lab Steps
          </h3>
          <div className="space-y-3">
            {selectedLab.steps.map((step, idx) => {
              const isDone = labStepsDone.has(step.id)
              const isExpanded = expandedSteps.has(step.id)
              const hintKey = `${selectedLab.id}-${step.id}-hint`
              const outputKey = `${selectedLab.id}-${step.id}-output`
              const hintVisible = revealedHints.has(hintKey)
              const outputVisible = revealedOutputs.has(outputKey)

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isDone ? 'border-green-200' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleStep(selectedLab.id, step.id)}
                      className="flex-shrink-0"
                      aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isDone
                        ? <CheckCircle className="w-6 h-6 text-green-500" />
                        : <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400 transition-colors" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${style.text}`}>Step {idx + 1}</span>
                        {isDone && <span className="text-xs text-green-600 font-medium">Complete</span>}
                      </div>
                      <p className={`font-semibold text-sm leading-snug ${isDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {step.title}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleExpanded(step.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{step.explanation}</p>

                      {step.note && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Note</p>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{step.note}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Commands to Enter</p>
                        <div className="bg-gray-900 rounded-xl p-4 space-y-1 overflow-x-auto">
                          {step.commands.map((cmd, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-green-400 text-xs font-mono flex-shrink-0 mt-0.5 select-none">$</span>
                              <code className="text-green-300 text-xs font-mono leading-relaxed break-all">{cmd}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      {step.expectedOutput && (
                        <div>
                          <button
                            onClick={() => setRevealedOutputs(prev => {
                              const next = new Set(prev)
                              if (next.has(outputKey)) next.delete(outputKey)
                              else next.add(outputKey)
                              return next
                            })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {outputVisible
                              ? <><EyeOff className="w-3.5 h-3.5" /> Hide Expected Output</>
                              : <><Eye className="w-3.5 h-3.5" /> Show Expected Output</>}
                          </button>
                          {outputVisible && (
                            <div className="mt-2 bg-gray-800 rounded-xl p-4 overflow-x-auto">
                              <pre className="text-amber-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">{step.expectedOutput}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {step.hint && (
                        <div>
                          <button
                            onClick={() => setRevealedHints(prev => {
                              const next = new Set(prev)
                              if (next.has(hintKey)) next.delete(hintKey)
                              else next.add(hintKey)
                              return next
                            })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            {hintVisible ? 'Hide Hint' : 'Show Hint'}
                          </button>
                          {hintVisible && (
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                              <p className="text-sm text-amber-800 leading-relaxed">{step.hint}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          toggleStep(selectedLab.id, step.id)
                          if (!isDone && idx < selectedLab.steps.length - 1) {
                            const nextStep = selectedLab.steps[idx + 1].id
                            setExpandedSteps(prev => {
                              const next = new Set(prev)
                              next.delete(step.id)
                              next.add(nextStep)
                              return next
                            })
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                          isDone
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : `${style.btn}`
                        }`}
                      >
                        {isDone ? 'Mark as Incomplete' : idx === selectedLab.steps.length - 1 ? 'Complete Lab!' : 'Mark Complete & Continue'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {progress === 100 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center celebrate-bounce">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Lab Complete!</h3>
            <p className="text-gray-500 text-sm mb-4">{selectedLab.title} — Completed!</p>
            <button
              onClick={() => setSelectedLab(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Back to All Labs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3 pb-6">
          <button
            onClick={() => setSelectedLab(null)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> All Labs
          </button>
          <button
            onClick={() => router.push('/curriculum')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Curriculum
          </button>
        </div>
      </div>
    </div>
  )
}
