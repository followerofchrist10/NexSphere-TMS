/**
 * NexSphere TMS In-Memory Data Store
 * Professional Technical Training Management System
 * Tech-only training courses, commencing dates, session-based attendance,
 * hands-on lecture plans, grade distributions, and user roles.
 */

export const mockUsers = [
  {
    id: 'usr-admin-1',
    role: 'admin',
    full_name: 'Dr. Sarah Chen (Training Director)',
    email: 'admin@nexsphere.edu',
    password: 'Admin@123456',
    phone: '+1 (555) 019-2831',
    is_active: true,
    created_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'usr-inst-1',
    role: 'instructor',
    full_name: 'Prof. Alex Rivera (Lead Cloud Architect)',
    email: 'alex.rivera@nexsphere.edu',
    password: 'Faculty@123456',
    phone: '+1 (555) 019-4820',
    is_active: true,
    created_at: '2026-08-10T10:00:00Z',
  },
  {
    id: 'usr-inst-2',
    role: 'instructor',
    full_name: 'Dr. Maya Patel (Senior AI Systems Engineer)',
    email: 'maya.patel@nexsphere.edu',
    password: 'Faculty@123456',
    phone: '+1 (555) 019-7733',
    is_active: true,
    created_at: '2026-08-12T11:00:00Z',
  },
  {
    id: 'usr-inst-3',
    role: 'instructor',
    full_name: 'Vikram Malhotra (CyberSec Specialist)',
    email: 'vikram.m@nexsphere.edu',
    password: 'Faculty@123456',
    phone: '+1 (555) 019-3391',
    is_active: true,
    created_at: '2026-08-15T12:00:00Z',
  },
  {
    id: 'usr-stud-1',
    role: 'student',
    full_name: 'Jordan Lee (Trainee)',
    email: 'jordan.lee@nexsphere.edu',
    password: 'Student@123456',
    phone: '+1 (555) 019-8812',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
    details: {
      learning_pathway: 'Distributed Systems & Cloud Architecture',
      date_of_birth: '2002-05-14',
      guardian_name: 'Apex Cloud Solutions Inc. (Corporate Sponsor)',
      guardian_phone: '+1 (555) 019-8800',
    },
  },
  {
    id: 'usr-stud-2',
    role: 'student',
    full_name: 'Ananya Sharma (Trainee)',
    email: 'ananya.s@nexsphere.edu',
    password: 'Student@123456',
    phone: '+1 (555) 019-5561',
    is_active: true,
    created_at: '2026-09-01T08:30:00Z',
    details: {
      learning_pathway: 'Generative AI & LLM Systems',
      date_of_birth: '2001-08-22',
      guardian_name: 'NeuralScale Research Labs (Sponsor)',
      guardian_phone: '+1 (555) 019-5500',
    },
  },
  {
    id: 'usr-stud-3',
    role: 'student',
    full_name: 'Marcus Vance (Trainee)',
    email: 'marcus.v@nexsphere.edu',
    password: 'Student@123456',
    phone: '+1 (555) 019-6619',
    is_active: true,
    created_at: '2026-09-02T09:00:00Z',
    details: {
      learning_pathway: 'Cyber Defense & Zero-Trust Architecture',
      date_of_birth: '2000-11-09',
      guardian_name: 'CyberFort Defense Systems (Sponsor)',
      guardian_phone: '+1 (555) 019-6600',
    },
  },
  {
    id: 'usr-stud-4',
    role: 'student',
    full_name: 'Elena Rostova (Trainee)',
    email: 'elena.r@nexsphere.edu',
    password: 'Student@123456',
    phone: '+1 (555) 019-4411',
    is_active: true,
    created_at: '2026-09-03T10:00:00Z',
    details: {
      learning_pathway: 'High-Performance Backend Engineering',
      date_of_birth: '2001-02-18',
      guardian_name: 'QuantCore Systems (Sponsor)',
      guardian_phone: '+1 (555) 019-4400',
    },
  },
  {
    id: 'usr-stud-5',
    role: 'student',
    full_name: 'Devon Miller (Trainee)',
    email: 'devon.m@nexsphere.edu',
    password: 'Student@123456',
    phone: '+1 (555) 019-7102',
    is_active: true,
    created_at: '2026-09-04T11:00:00Z',
    details: {
      learning_pathway: 'Cloud DevOps & SRE Pipelines',
      date_of_birth: '2002-09-30',
      guardian_name: 'Claire Miller',
      guardian_phone: '+1 (555) 019-7100',
    },
  },
];

export const mockAssets = [
  {
    id: 'ast-lab-402',
    name: 'Cloud Infrastructure & Kubernetes Lab (Room 402)',
    kind: 'lab',
    capacity: 45,
    location: 'Turing Block, 4th Floor',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'ast-lab-205',
    name: 'AI & GPU Cluster Research Lab (Room 205)',
    kind: 'lab',
    capacity: 40,
    location: 'Ada Lovelace Wing, 2nd Floor',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'ast-lab-301',
    name: 'Cyber Threat & Red Team Arena (Room 301)',
    kind: 'lab',
    capacity: 35,
    location: 'Cyber Defense Center, 3rd Floor',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'ast-hall-101',
    name: 'High-Tech Seminar Auditorium (Hall 101)',
    kind: 'classroom',
    capacity: 120,
    location: 'Main Complex, Ground Floor',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
  },
];

export const mockCourses = [
  {
    id: 'crs-cloud-arch',
    code: 'CLOUD-ARCH',
    title: 'Distributed Systems & Cloud Microservices',
    category: 'Cloud & Infrastructure',
    commencing_date: '2026-11-15',
    duration: '16 Weeks (48 Sessions)',
    total_lectures: 32,
    credits: 4,
    price: 14500,
    is_active: true,
    tech_stack: ['Kubernetes', 'Docker', 'Go', 'gRPC', 'Apache Kafka', 'Redis'],
    syllabus: `### Training Program Overview
Comprehensive enterprise training for large-scale distributed architectures, state replication, RPC protocols, consensus algorithms (Raft/Paxos), and cloud-native container orchestration with Kubernetes.

### Unit Breakdown:
- **Module 1**: RPC Protocols, Protocol Buffers & High-Throughput Networking
- **Module 2**: Consensus & Quorum Protocols (Raft, Paxos, Vector Clocks)
- **Module 3**: Event-Driven Pipelines with Apache Kafka & Stream Partitioning
- **Module 4**: Kubernetes Cluster Internals, Custom Controllers & Service Meshes (Istio)
- **Module 5**: Distributed Caching, Redis Cluster Sharding & CAP Theorem in Practice`,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'crs-ai-systems',
    code: 'AI-SYSTEMS',
    title: 'Full-Stack Generative AI & LLM Systems Engineering',
    category: 'Artificial Intelligence',
    commencing_date: '2026-11-18',
    duration: '16 Weeks (48 Sessions)',
    total_lectures: 28,
    credits: 4,
    price: 16000,
    is_active: true,
    tech_stack: ['PyTorch', 'LangChain', 'FastAPI', 'pgvector', 'Next.js 15', 'Ollama'],
    syllabus: `### Training Program Overview
Building production-grade AI systems: retrieval-augmented generation (RAG), vector embeddings, low-latency streaming inference, fine-tuning LoRA adapters, and agentic workflows.

### Unit Breakdown:
- **Module 1**: Transformer Architecture & Attention Mechanisms from Scratch
- **Module 2**: Advanced RAG: Hybrid BM25 + Vector Search, Re-ranking & Context Compression
- **Module 3**: High-Performance Inference Servers: vLLM, TensorRT-LLM & FastAPI
- **Module 4**: Autonomous Multi-Agent Graphs (LangGraph, Function Calling, ReAct loop)
- **Module 5**: Evaluation, Observability & Guardrails (Langfuse, Guardrails AI)`,
    created_at: '2026-09-02T00:00:00Z',
  },
  {
    id: 'crs-cyber-sec',
    code: 'CYBER-SEC',
    title: 'Offensive Cybersecurity, PenTesting & Zero-Trust Defense',
    category: 'Cybersecurity',
    commencing_date: '2026-11-20',
    duration: '14 Weeks (42 Sessions)',
    total_lectures: 24,
    credits: 4,
    price: 15000,
    is_active: true,
    tech_stack: ['Kali Linux', 'Burp Suite Pro', 'Wireshark', 'Metasploit', 'Wazuh SIEM', 'eBPF'],
    syllabus: `### Training Program Overview
Hands-on ethical hacking, vulnerability identification, network forensics, Active Directory attack paths, and zero-trust perimeter configuration.

### Unit Breakdown:
- **Module 1**: Reconnaissance, Port Scanning & Network Topology Mapping
- **Module 2**: Web App Vulnerabilities: SQLi, SSRF, IDOR, GraphQL Injections
- **Module 3**: Privilege Escalation in Linux & Windows Active Directory Domains
- **Module 4**: Zero-Trust Network Access (mTLS, WireGuard, Ephemeral PKI)
- **Module 5**: Blue Team Incident Response & Threat Hunting with SIEM/eBPF`,
    created_at: '2026-09-03T00:00:00Z',
  },
  {
    id: 'crs-db-internals',
    code: 'DB-INTERNALS',
    title: 'High-Performance Backend & Database Internals',
    category: 'Backend Systems',
    commencing_date: '2026-11-22',
    duration: '14 Weeks (42 Sessions)',
    total_lectures: 26,
    credits: 3,
    price: 13500,
    is_active: true,
    tech_stack: ['PostgreSQL', 'Rust', 'C++', 'LSM Trees', 'B-Trees', 'RocksDB'],
    syllabus: `### Training Program Overview
Dissecting database storage engines, write-ahead logging (WAL), MVCC, lock-free concurrency, and query execution planning.

### Unit Breakdown:
- **Module 1**: Disk I/O, Page Cache, and Buffer Pool Management
- **Module 2**: Index Structures: B+ Trees, GiST, GIN, and LSM Trees
- **Module 3**: Multi-Version Concurrency Control (MVCC) and Serialization Anomalies
- **Module 4**: Query Optimization, AST Parsing and Cost-Based Join Ordering
- **Module 5**: Building an In-Memory Key-Value Store from Scratch in Rust`,
    created_at: '2026-09-05T00:00:00Z',
  },
  {
    id: 'crs-devops-sre',
    code: 'DEVOPS-SRE',
    title: 'Cloud DevOps, Infrastructure-as-Code & SRE Systems',
    category: 'DevOps & SRE',
    commencing_date: '2026-11-25',
    duration: '12 Weeks (36 Sessions)',
    total_lectures: 24,
    credits: 3,
    price: 12500,
    is_active: true,
    tech_stack: ['Terraform', 'AWS', 'GitHub Actions', 'Prometheus', 'Grafana', 'ArgoCD'],
    syllabus: `### Training Program Overview
Reliability engineering for mission-critical deployments: automated GitOps pipelines, declarative multi-cloud infrastructure, SLO/SLI observability, and chaos testing.

### Unit Breakdown:
- **Module 1**: Declarative Infrastructure as Code with Terraform & OpenTofu
- **Module 2**: CI/CD Pipelines: Container Security Scanning, Multi-Stage Builds
- **Module 3**: GitOps Continuous Delivery with ArgoCD & Helm
- **Module 4**: Observability: Metrics (Prometheus), Distributed Tracing (OpenTelemetry)
- **Module 5**: Chaos Engineering, Disaster Recovery Drills & Zero-Downtime Releases`,
    created_at: '2026-09-08T00:00:00Z',
  },
  {
    id: 'crs-mobile-arch',
    code: 'MOBILE-ARCH',
    title: 'Modern Mobile Architecture & Real-Time Sync Engines',
    category: 'Mobile Engineering',
    commencing_date: '2026-11-28',
    duration: '14 Weeks (40 Sessions)',
    total_lectures: 22,
    credits: 3,
    price: 13000,
    is_active: true,
    tech_stack: ['React Native', 'Flutter', 'WatermelonDB', 'CRDTs', 'WebSockets'],
    syllabus: `### Training Program Overview
Engineering enterprise-grade mobile applications with offline-first local storage, Conflict-Free Replicated Data Types (CRDTs), and bidirectional real-time synchronization.

### Unit Breakdown:
- **Module 1**: Native Bridges, JSI Engine, and Threading Architecture
- **Module 2**: Offline-First Local Data Persistence with SQLite & WatermelonDB
- **Module 3**: Conflict Resolution with State-Based CRDTs & Vector Clocks
- **Module 4**: Background Sync, Push Notification Queues & Battery Optimization
- **Module 5**: Automated Mobile Testing: Maestro, Detox & Performance Profiling`,
    created_at: '2026-09-10T00:00:00Z',
  },
];

export const mockBatches = [
  {
    id: 'btc-cloud-a',
    course_id: 'crs-cloud-arch',
    instructor_id: 'usr-inst-1',
    asset_id: 'ast-lab-402',
    name: 'Cloud Systems Training - Cohort Alpha',
    starts_on: '2026-11-15',
    ends_on: '2027-03-25',
    capacity: 35,
    is_open: true,
    created_at: '2026-09-12T00:00:00Z',
  },
  {
    id: 'btc-ai-a',
    course_id: 'crs-ai-systems',
    instructor_id: 'usr-inst-2',
    asset_id: 'ast-lab-205',
    name: 'AI Engineering Training - Cohort Alpha',
    starts_on: '2026-11-18',
    ends_on: '2027-03-28',
    capacity: 30,
    is_open: true,
    created_at: '2026-09-12T00:00:00Z',
  },
  {
    id: 'btc-cyber-a',
    course_id: 'crs-cyber-sec',
    instructor_id: 'usr-inst-3',
    asset_id: 'ast-lab-301',
    name: 'CyberSec Defensive Training - Cohort Alpha',
    starts_on: '2026-11-20',
    ends_on: '2027-03-15',
    capacity: 28,
    is_open: true,
    created_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'btc-db-a',
    course_id: 'crs-db-internals',
    instructor_id: 'usr-inst-1',
    asset_id: 'ast-hall-101',
    name: 'Database Internals - Cohort Alpha',
    starts_on: '2026-11-22',
    ends_on: '2027-03-18',
    capacity: 40,
    is_open: true,
    created_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'btc-devops-a',
    course_id: 'crs-devops-sre',
    instructor_id: 'usr-inst-1',
    asset_id: 'ast-lab-402',
    name: 'DevOps & SRE - Cohort Alpha',
    starts_on: '2026-11-25',
    ends_on: '2027-03-10',
    capacity: 35,
    is_open: true,
    created_at: '2026-09-18T00:00:00Z',
  },
];

export const mockLectures = [
  // Cloud Architecture Training Sessions
  {
    id: 'lec-cloud-01',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 1,
    topic: 'Introduction to Distributed Architectures & Network Realities',
    date: '2026-11-16',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-01-intro.pdf',
    lab_exercise: 'Analyze TCP latency vs UDP packet loss using Wireshark',
  },
  {
    id: 'lec-cloud-02',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 2,
    topic: 'RPC Protocols & High-Throughput gRPC with Protocol Buffers',
    date: '2026-11-18',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-02-grpc.pdf',
    lab_exercise: 'Build bidirectional streaming gRPC service in Go',
  },
  {
    id: 'lec-cloud-03',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 3,
    topic: 'Logical Clocks, Lamport Timestamps & Vector Clocks',
    date: '2026-11-20',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-03-clocks.pdf',
    lab_exercise: 'Simulate concurrent causality violations in a multi-node cluster',
  },
  {
    id: 'lec-cloud-04',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 4,
    topic: 'Consensus in Action: Raft Leader Election & Log Replication',
    date: '2026-11-23',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-04-raft.pdf',
    lab_exercise: 'Implement Raft state machine transitions in TypeScript',
  },
  {
    id: 'lec-cloud-05',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 5,
    topic: 'Event Streaming: Kafka Partitioning & Consumer Groups',
    date: '2026-11-25',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-05-kafka.pdf',
    lab_exercise: 'Spin up 3-broker Kafka cluster and benchmark rebalance protocols',
  },
  {
    id: 'lec-cloud-06',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 6,
    topic: 'Kubernetes Internal Architecture: etcd, API Server & Kubelet',
    date: '2026-11-27',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-06-k8s.pdf',
    lab_exercise: 'Deploy custom CRD (Custom Resource Definition) and operator',
  },
  {
    id: 'lec-cloud-07',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 7,
    topic: 'Distributed Transactions: 2PC vs Saga Orchestration',
    date: '2026-11-30',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-07-saga.pdf',
    lab_exercise: 'Implement compensation saga for payment flow',
  },
  {
    id: 'lec-cloud-08',
    course_id: 'crs-cloud-arch',
    batch_id: 'btc-cloud-a',
    lecture_number: 8,
    topic: 'Redis Cluster Sharding, Hash Slots & Consistent Hashing',
    date: '2026-12-02',
    time: '09:00 AM - 10:30 AM',
    room: 'Cloud Infrastructure Lab 402',
    instructor_id: 'usr-inst-1',
    instructor_name: 'Prof. Alex Rivera',
    status: 'upcoming',
    materials_url: 'https://docs.nexsphere.edu/cloud/session-08-redis.pdf',
    lab_exercise: 'Write consistent hashing ring in Go with virtual nodes',
  },

  // AI Systems Sessions
  {
    id: 'lec-ai-01',
    course_id: 'crs-ai-systems',
    batch_id: 'btc-ai-a',
    lecture_number: 1,
    topic: 'LLM Foundations: Tokenization, Positional Encodings & Attention',
    date: '2026-11-19',
    time: '11:00 AM - 12:30 PM',
    room: 'AI & GPU Research Lab 205',
    instructor_id: 'usr-inst-2',
    instructor_name: 'Dr. Maya Patel',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/ai/session-01-tokens.pdf',
    lab_exercise: 'Inspect BPE tokenizers and build self-attention in PyTorch',
  },
  {
    id: 'lec-ai-02',
    course_id: 'crs-ai-systems',
    batch_id: 'btc-ai-a',
    lecture_number: 2,
    topic: 'Vector Embeddings, Cosine Distance & HNSW Indexing in pgvector',
    date: '2026-11-21',
    time: '11:00 AM - 12:30 PM',
    room: 'AI & GPU Research Lab 205',
    instructor_id: 'usr-inst-2',
    instructor_name: 'Dr. Maya Patel',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/ai/session-02-embeddings.pdf',
    lab_exercise: 'Index 100k technical docs into PostgreSQL with pgvector HNSW',
  },
  {
    id: 'lec-ai-03',
    course_id: 'crs-ai-systems',
    batch_id: 'btc-ai-a',
    lecture_number: 3,
    topic: 'Production RAG: Chunking Strategies, Parent-Document & Re-ranking',
    date: '2026-11-24',
    time: '11:00 AM - 12:30 PM',
    room: 'AI & GPU Research Lab 205',
    instructor_id: 'usr-inst-2',
    instructor_name: 'Dr. Maya Patel',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/ai/session-03-rag.pdf',
    lab_exercise: 'Benchmark Cross-Encoder rerankers vs Dense retrieval',
  },
  {
    id: 'lec-ai-04',
    course_id: 'crs-ai-systems',
    batch_id: 'btc-ai-a',
    lecture_number: 4,
    topic: 'Autonomous Tool-Use & Multi-Agent State Machines (LangGraph)',
    date: '2026-11-26',
    time: '11:00 AM - 12:30 PM',
    room: 'AI & GPU Research Lab 205',
    instructor_id: 'usr-inst-2',
    instructor_name: 'Dr. Maya Patel',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/ai/session-04-agents.pdf',
    lab_exercise: 'Build code-execution agent with sandbox and verification loop',
  },
  {
    id: 'lec-ai-05',
    course_id: 'crs-ai-systems',
    batch_id: 'btc-ai-a',
    lecture_number: 5,
    topic: 'High-Throughput Serving: vLLM PagedAttention & Continuous Batching',
    date: '2026-11-28',
    time: '11:00 AM - 12:30 PM',
    room: 'AI & GPU Research Lab 205',
    instructor_id: 'usr-inst-2',
    instructor_name: 'Dr. Maya Patel',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/ai/session-05-vllm.pdf',
    lab_exercise: 'Deploy local 8B model on vLLM server with streaming SSE',
  },

  // Cyber Security Training Sessions
  {
    id: 'lec-cyber-01',
    course_id: 'crs-cyber-sec',
    batch_id: 'btc-cyber-a',
    lecture_number: 1,
    topic: 'Offensive Reconnaissance & Active Attack Surface Mapping',
    date: '2026-11-21',
    time: '02:00 PM - 03:30 PM',
    room: 'Cyber Defense Arena 301',
    instructor_id: 'usr-inst-3',
    instructor_name: 'Vikram Malhotra',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cyber/session-01-recon.pdf',
    lab_exercise: 'Subdomain brute forcing and ASN correlation analysis',
  },
  {
    id: 'lec-cyber-02',
    course_id: 'crs-cyber-sec',
    batch_id: 'btc-cyber-a',
    lecture_number: 2,
    topic: 'Deep Dive: Server-Side Request Forgery (SSRF) to Cloud Metadata Exfiltration',
    date: '2026-11-23',
    time: '02:00 PM - 03:30 PM',
    room: 'Cyber Defense Arena 301',
    instructor_id: 'usr-inst-3',
    instructor_name: 'Vikram Malhotra',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cyber/session-02-ssrf.pdf',
    lab_exercise: 'Bypass DNS rebinding defenses in vulnerable test application',
  },
  {
    id: 'lec-cyber-03',
    course_id: 'crs-cyber-sec',
    batch_id: 'btc-cyber-a',
    lecture_number: 3,
    topic: 'Active Directory BloodHound Attack Paths & Kerberoasting',
    date: '2026-11-25',
    time: '02:00 PM - 03:30 PM',
    room: 'Cyber Defense Arena 301',
    instructor_id: 'usr-inst-3',
    instructor_name: 'Vikram Malhotra',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cyber/session-03-kerberos.pdf',
    lab_exercise: 'Extract SPN tickets and crack NTLM hashes using Hashcat',
  },
  {
    id: 'lec-cyber-04',
    course_id: 'crs-cyber-sec',
    batch_id: 'btc-cyber-a',
    lecture_number: 4,
    topic: 'Zero-Trust Architecture: mTLS Handshakes, SPIFFE/SPIRE & Ephemeral Identity',
    date: '2026-11-27',
    time: '02:00 PM - 03:30 PM',
    room: 'Cyber Defense Arena 301',
    instructor_id: 'usr-inst-3',
    instructor_name: 'Vikram Malhotra',
    status: 'completed',
    materials_url: 'https://docs.nexsphere.edu/cyber/session-04-zerotrust.pdf',
    lab_exercise: 'Configure Envoy proxy with mutual TLS and SPIFFE workload identities',
  },
];

export const mockAttendance = [];

export const mockGrades = [];

export const mockInvoices = [];

export const mockNotifications = [];

export const mockApplications = [];

export const mockCertificates = [];

export const mockSubmissions = [];


