# Telecom Network Operations & Intelligence Platform (NOC)

A production-oriented Proof of Concept (PoC) web application providing a unified **Network Operations Center (NOC)** interface for monitoring hybrid telecom and network infrastructure across diverse access technologies:
- **5G Core / NR** (Next-Generation Cellular)
- **4G LTE** (Long Term Evolution)
- **Fibre Optic** (High-capacity metro & long-haul transport)
- **Microwave Radio** (Point-to-Point terrestrial backhaul)
- **Satellite Backhaul** (LEO/GEO constellation terminals such as Starlink & OneWeb)
- **Hybrid Multi-Link** (Dynamic failover & multi-WAN aggregation)

---

## 1. High-Level Architecture & Domain Separation

In enterprise telecommunications, network infrastructure spans across diverse physical terrains, remote stations, and multi-vendor equipment. This platform strictly separates **data sources**, **integration adapters**, **internal business domain**, and **NOC visualization**:

```
                       NETWORK ENVIRONMENT
                                |
             +------------------+------------------+
             |                  |                  |
           4G/5G              Fibre            Satellite
             |                  |                  |
             +------------------+------------------+
                                |
                      Network Data Sources
                                |
                  +-------------+-------------+
                  |                           |
             Simulator                   Future Real
                                        Integrations
                  |                           |
                  +-------------+-------------+
                                |
                        Integration Layer
                                |
                       Data Normalization
                                |
                         Backend API
                                |
                         PostgreSQL
                                |
                   +------------+-------------+
                   |            |             |
                Sites        Devices      Telemetry
                   |            |             |
                   +------------+-------------+
                                |
                          Alarm Engine
                                |
                       Incident Management
                                |
                          NOC Dashboard
                                |
                       Future AI Assistant
```

### Key Telecom Domain Concepts:
- **Site**: A physical or logical POP (Point of Presence), cellular tower, or regional substation (e.g. `ZM-001` Lusaka Central Hub).
- **Device**: Physical or virtual equipment stationed at a site (e.g., Cisco ASR 9001 edge router, Huawei 5G BBU, Starlink VSAT terminal).
- **Connectivity**: Transport and access links connecting a site to the national core (e.g., Primary 5G with redundant Fibre, or 4G with Satellite backhaul).
- **MNO (Mobile Network Operator)**: A telecommunications provider providing wireless connectivity (cellular towers, spectrum, core network).
- **ISP (Internet Service Provider)**: Provides IP transit and backbone optical fibre connectivity.
- **NMS (Network Management System)**: Vendor-specific or domain software monitoring equipment health (e.g. Huawei U2000, Cisco DNA Center, Nokia NetAct).
- **OSS (Operations Support System)**: Telecom back-office systems managing network inventory, service provisioning, faults, and configuration.

---

## 2. Technology Stack

| Layer | Technologies | Rationale |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React-Leaflet, Lucide Icons | Modern, ultra-fast UI rendering with interactive map tiles and dark NOC telemetry layout. |
| **Reverse Proxy** | Nginx Alpine | Serves React production static bundle and proxies `/api/*` traffic to the backend container. |
| **Backend** | Node.js, NestJS, TypeScript, Prisma ORM, Helmet, Class-Validator | Robust enterprise modular architecture with strict types and security headers. |
| **Database** | PostgreSQL 16 | ACID-compliant relational storage for sites, devices, and relational indexes. |
| **Containerization** | Docker, Docker Compose | Consistent multi-stage builds and isolated bridge networking. |

---

## 3. Directory Structure

```
telecom-network-platform/
├── .env.example              # Environment variables template
├── .env                      # Local runtime environment file
├── .gitignore                # Git exclusion rules
├── docker-compose.yml        # Multi-container orchestration (DB, API, Frontend)
├── README.md                 # System documentation & architectural guide
│
├── frontend/
│   ├── Dockerfile            # Multi-stage build (Node build -> Nginx alpine)
│   ├── nginx.conf            # Nginx routing & reverse proxy configuration
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # NOC dark theme styling config
│   ├── vite.config.ts        # Vite build tool and development proxy
│   └── src/
│       ├── types/network.ts  # Domain TypeScript models
│       ├── services/         # API integration layer (fetch client)
│       └── components/       # NOC Map, Summary cards, Topology, Table
│
├── backend/
│   ├── Dockerfile            # Multi-stage build (Node build -> Node runtime)
│   ├── docker-entrypoint.sh  # Auto-migration & seed initialization
│   ├── package.json          # NestJS dependencies & scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── prisma/
│   │   ├── schema.prisma     # Relational schema (Site & Device models)
│   │   └── seed.ts           # Initial 5-site demo network seed
│   └── src/
│       ├── main.ts           # NestJS bootstrap, Helmet, CORS, Validation
│       ├── app.module.ts     # Root module
│       ├── health/           # Health check endpoints (/api/health)
│       ├── sites/            # Site inventory, summary, & topology APIs
│       ├── devices/          # Hardware inventory APIs
│       └── common/           # Prisma service and HTTP request logger
│
├── simulator/                # Reserved for Phase 7 Network Simulator
└── k8s/                      # Reserved for Kubernetes manifests
```

---

## 4. Initial Demo Network (Zambia Infrastructure)

The system seeds a realistic African national network topology across 5 distinct strategic regions:

| Site Code | Site Name | City / Region | Primary Tech | Backup Tech | Operational Status | Deployed Devices |
|---|---|---|---|---|---|---|
| **ZM-001** | Lusaka Central Hub | Lusaka | **5G** | **Fibre** | <span style="color:#10b981">**HEALTHY**</span> | Huawei 5G BBU5900, Cisco ASR 9001 |
| **ZM-002** | Copperbelt Regional Hub | Ndola | **4G** | **Fibre** | <span style="color:#10b981">**HEALTHY**</span> | Nokia AirScale Gateway, Cisco Catalyst 9300 |
| **ZM-003** | Rural Zambia Outpost | Kabwe Rural | **4G** | **Microwave** | <span style="color:#f59e0b">**DEGRADED**</span> | Ericsson RBS 6601, Huawei OptiX RTN 950 Radio |
| **ZM-004** | Remote Zambia Station | Solwezi Outskirts | **4G** | **Satellite** | <span style="color:#ef4444">**CRITICAL**</span> | Cisco ISR 4331 Gateway, Starlink VSAT Terminal |
| **ZM-005** | Border Region Outpost | Livingstone Border | **4G** | **Satellite** | <span style="color:#10b981">**HEALTHY**</span> | MikroTik Cloud Core Router, OneWeb VSAT Terminal |

---

## 5. How to Run the Platform

### Running with Docker Compose (Recommended)

1. Verify environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Build and start all three containers:
   ```bash
   docker compose up --build -d
   ```

3. Check container statuses:
   ```bash
   docker compose ps
   ```

4. View logs:
   ```bash
   docker compose logs -f backend
   ```

5. Access the platforms:
   - **NOC Web Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - **Network Sites REST Endpoint**: [http://localhost:3000/api/sites](http://localhost:3000/api/sites)
   - **Network Topology REST Endpoint**: [http://localhost:3000/api/sites/topology](http://localhost:3000/api/sites/topology)

### Stopping Containers
```bash
docker compose down
```
*(Database volume `postgres_data` is preserved across container restarts)*.

---

## 6. Real-World MNO / ISP Comparison

In this first phase, the network inventory and status are stored in PostgreSQL and seeded deterministically. When transitioning to a production Tier-1 telecom environment, the following changes occur:

1. **Physical Site Discovery**:
   - Instead of static seeding, sites and devices are synchronized via **OSS/Inventory APIs** (e.g., Amdocs, Netcracker, ServiceNow Telecom Service Management).
2. **Device Telemetry & Status**:
   - Device states (`ONLINE`, `DEGRADED`, `OFFLINE`) are updated in real-time via:
     - **SNMP v2c/v3 traps** and polling (RFC 1213 MIB-II).
     - **NETCONF / RESTCONF** (YANG data models over SSH/TLS).
     - **Streaming Telemetry (gNMI / gRPC)** from Cisco IOS-XR and Huawei VRP routers.
     - **Satellite Provider Telemetry APIs** (Starlink Starlink gRPC/HTTP API, Eutelsat Portal).
3. **Data Normalization Layer**:
   - An adapter translates raw vendor telemetry (e.g., Huawei TL1, Ericsson CLI, Cisco Syslog) into the unified `NetworkTelemetry` interface before reaching the monitoring engine.
