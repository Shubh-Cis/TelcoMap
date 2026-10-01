# TelcoMap: Carrier-Grade OSS/BSS Integration & Platform Architecture

> **Document Type:** Enterprise Architecture & Executive Presentation Brief  
> **Prepared For:** Emmanuel Mukwesa (CEO, Intellilink Media, Zambia) & CIS Engineering Delivery Team  
> **Platform:** TelcoMap — Telecom Operations & Intelligence Platform (Zambia National Network)  
> **Date:** October 2026  
> **Status:** Production-Ready & Deployed Live on Render Cloud + Neon Serverless PostgreSQL  

---

## 1. Executive Summary & Overview

### Is OSS and BSS Dynamic or Static in TelcoMap?
**TelcoMap is 100% dynamic.** All Operations Support Systems (OSS) hardware inventories, FCAPS active alarms, 4x4 field work orders, and Business Support Systems (BSS) enterprise customer contracts, monthly recurring revenues (MRR), and SLA penalty exposures are **modeled as relational entities in PostgreSQL on Neon**, served through **NestJS REST APIs**, and dynamically rendered in real time across the **React 18 / Vite / Tailwind frontend**.

Previously, frontend prototypes often used static mock fixtures in isolated UI widgets. In this major release, the architecture has been upgraded to a **true Tier-1 carrier schema conforming to TM Forum Open Digital Architecture (ODA), eTOM, and SID standards**.

---

## 2. Telecom Industry Standards: How OSS & BSS Are Integrated

In global telecommunication operations (such as MTN, Airtel, Liquid Telecom, and Vodafone), the network infrastructure and the commercial business are governed by two interrelated software stacks defined by the **TM Forum (TeleManagement Forum)**:

```
+-----------------------------------------------------------------------------------+
|                           TM FORUM OPEN DIGITAL ARCHITECTURE                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +------------------------------------+   +------------------------------------+ |
|   |         OSS (eTOM PROCESSES)       |   |         BSS (SID ENTITIES)         | |
|   +------------------------------------+   +------------------------------------+ |
|   | • FCAPS Fault Management (X.733)   |   | • Customer Account Management      | |
|   | • CMDB Hardware Inventory          |   | • Monthly Recurring Revenue (MRR)  | |
|   | • Optical Loss & Link Telemetry    |   | • Contracted SLA Targets (99.9x%)  | |
|   | • 4x4 Rigging Workforce Dispatch   |   | • Financial Penalty Exposure Risk  | |
|   | • Spare Parts & Truck-Roll Costs   |   | • ZICTA Regulatory Compliance      | |
|   +-----------------+------------------+   +-----------------+------------------+ |
|                     |                                        |                    |
|                     +-------------------+--------------------+                    |
|                                         |                                         |
|                    EVENT-DRIVEN CORRELATION ENGINE (AIOps)                        |
|             "When Port 1/0/1 fails in OSS -> Correlate to BSS SLA ->              |
|              Calculate $2,850 Penalty -> Trigger Sub-Second LEO Failover ->       |
|              Dispatch Rigging Truck with OTDR & Spares -> Preserve Revenue"       |
+-----------------------------------------------------------------------------------+
```

### The Separation of Concerns
1. **OSS (Operations Support Systems):**
   - Focuses on the **Network, Hardware, and Field Operations**.
   - Governed by **ITU-T X.733** alarm standards and **TM Forum eTOM (Enhanced Telecom Operations Map)**.
   - Monitors device transceivers, fiber attenuation (dB loss), microwave fade, satellite SNR, and automatically organizes field repair crews (rigging trucks, fusion splicers, optical spares).

2. **BSS (Business Support Systems):**
   - Focuses on the **Customer, Revenue, and Regulatory Compliance**.
   - Governed by **TM Forum SID (Shared Information/Data Model)**.
   - Manages corporate customer agreements (e.g. Stanbic Bank, First Quantum Minerals, Zambeef), monthly billing (MRR), SLA tiers (e.g., 99.99% core vs 99.50% regional), penalty credit formulas, and national data sovereignty regulations (ZICTA spectrum and lawful interception compliance).

### How They Are Integrated in Industry vs TelcoMap
- **In Traditional Legacy Telcos:** OSS and BSS were historically isolated silos. An optical cut occurred in OSS, took hours for human operators to notice, and days later billing discovered a massive customer refund penalty.
- **In TelcoMap (Modern Event-Driven Architecture):** When an optical degradation alarm (`ALM-FBR-001`) fires in OSS, TelcoMap immediately:
  1. Identifies the customer on that backhaul port in BSS (e.g. First Quantum Minerals / $28,500 MRR).
  2. Calculates the SLA penalty risk if downtime exceeds 43 minutes ($2,850 penalty).
  3. Executes autonomous sub-second reroute to backup Starlink LEO Satellite link (38ms latency).
  4. Automatically issues Work Order `WO-2026-6706` dispatching a 4x4 heavy-duty rigging unit with the exact required spare transceiver and Fluke OTDR cable tester.
  5. Preserves 100% of customer SLA compliance with zero revenue penalty!

---

## 3. Persistent Relational Schema (PostgreSQL on Neon)

The database schema in `backend/prisma/schema.prisma` reflects this carrier-grade architecture:

```prisma
// Site: Physical or logical telecom point of presence (POP)
model Site {
  id          String       @id @default(uuid())
  siteCode    String       @unique // e.g. "ZM-001"
  siteName    String               // e.g. "Lusaka Central Hub"
  country     String
  region      String
  city        String
  latitude    Float
  longitude   Float
  status      String       @default("HEALTHY") // HEALTHY | DEGRADED | CRITICAL
  primaryTech String               // FIVE_G | FOUR_G | FIBRE | MICROWAVE | SATELLITE
  backupTech  String?              // FIBRE | MICROWAVE | SATELLITE | null
  devices     Device[]
  bssContract BssContract?
  workOrders  WorkOrder[]
  alarms      Alarm[]
}

// BSS: Enterprise SLA Contract & Regulatory Sovereignty (TM Forum SID)
model BssContract {
  id                       String   @id @default(uuid())
  siteId                   String   @unique
  site                     Site     @relation(fields: [siteId], references: [id])
  clientName               String   // e.g. "Stanbic Bank & Central Financial Switch"
  industry                 String   // e.g. "Commercial Banking & National Clearing"
  contractTier             String   // e.g. "Tier-1 Core Financial Infrastructure"
  monthlyRevenueUsd        Float    // e.g. $48,000 USD
  slaTargetPercent         Float    // e.g. 99.99%
  dataSovereignty          String   // e.g. "National Sovereign Core (Direct IXP Landing)"
  lawfulInterceptionStatus String   // e.g. "NLIC Certified (Compliant)"
  zictaLicense             String   // e.g. "ZICTA-5G-NR-NATIONAL-2026-001"
}

// OSS: Field Force Workforce Automation (TM Forum eTOM)
model WorkOrder {
  id               String   @id @default(uuid())
  orderId          String   @unique // e.g. "WO-2026-6706"
  siteId           String
  site             Site     @relation(fields: [siteId], references: [id])
  priority         String   // "P1 - CRITICAL" | "P2 - HIGH" | "P3 - NORMAL"
  assignedCrew     String   // e.g. "North-Western Mobile Rigging & VSAT Unit 2"
  vehicle          String   // e.g. "Toyota Hilux 4x4 Heavy-Duty Rigging Truck"
  truckRollCostUsd Float    // e.g. $480 USD
  estimatedArrival String   // e.g. "1 Hour 35 Minutes"
  requiredSpares   String   // Loaded spare transceivers, cables, OTDR testers
  status           String   @default("STAGED") // STAGED | DISPATCHED | IN_PROGRESS
}

// OSS: ITU-T X.733 Active Alarm Console
model Alarm {
  id          String   @id @default(uuid())
  alarmCode   String   // e.g. "ALM-FBR-001"
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  severity    String   // "CRITICAL" | "MAJOR" | "MINOR" | "WARNING"
  title       String   // e.g. "Carrier Optical Signal Loss Detected"
  source      String   // e.g. "Port 1/0/1 - DWDM Transceiver"
  description String   // Detailed optical diagnostic
  status      String   @default("ACTIVE") // ACTIVE | ACKNOWLEDGED | CLEARED
}
```

---

## 4. Dedicated Carrier Navigation Sidebar

To give Emmanuel Mukwesa and executive stakeholders a clear, separated view of every capability, TelcoMap now features a **Carrier-Grade Navigation Sidebar** with dedicated, uncluttered views:

| Sidebar Tab | View Name | Primary Function & Value Proposition |
|:---|:---|:---|
| 📊 **Overview** | **Executive Cockpit** | High-level KPI summary, national availability gauge, live incident tickers, and 1-click drill launcher. |
| 🗺️ **GIS Map** | **Interactive Geospatial NOC** | Pan and zoom across Zambia's regional hubs, inspect tower coordinates, link backhauls, and trigger live node failover. |
| ⚙️ **OSS Suite** | **FCAPS Alarms & 4x4 Rigging** | ITU-T X.733 active alarm management table, hardware CMDB inventory, and 4x4 mobile rigging dispatch with ETA countdowns. |
| 💼 **BSS Governance** | **SLA Contracts & MRR Protection** | Corporate client portfolio (Stanbic, FQM, Zambeef), $150k+ MRR tracking, SLA penalty exposure modeling, and ZICTA audit verification. |
| 🌐 **Cloudflare Radar** | **Macro Internet Telemetry** | National internet latency and bandwidth percentiles (P25/P50/P75), BGP routing outages, and AS36962 / AS37150 / AS37153 monitoring. |
| 🕸️ **Network Topology** | **Carrier Hierarchy Graph** | Interactive graph tracing connectivity from Global Tier-1 Internet Transit -> Lusaka Core -> DWDM Backbone -> Base Stations -> Hardware. |
| 🤖 **AIOps Copilot** | **Autonomous Diagnostics** | Gemini 2.5 Pro neural engine analyzing root cause, answering natural language operator queries, and generating TM Forum incident drafts. |
| ⚡ **Disaster Simulator** | **Chaos Engineering Failover Drill** | Live interactive 5-step simulation of a backhoe optical fiber cut with sub-second LEO Starlink failover and zero SLA credit penalty. |

---

## 5. Live Production Endpoints & URLs

- **Live Frontend (React + Vite):**  
  [`https://telcomap-frontend.onrender.com`](https://telcomap-frontend.onrender.com)
- **Live Backend API (NestJS + Swagger):**  
  [`https://telcomap-backend.onrender.com/api`](https://telcomap-backend.onrender.com/api)
- **Dedicated BSS Endpoint:**  
  [`https://telcomap-backend.onrender.com/api/sites/bss`](https://telcomap-backend.onrender.com/api/sites/bss)
- **Dedicated OSS Alarms Endpoint:**  
  [`https://telcomap-backend.onrender.com/api/sites/alarms`](https://telcomap-backend.onrender.com/api/sites/alarms)
- **Dedicated OSS Work Orders Endpoint:**  
  [`https://telcomap-backend.onrender.com/api/sites/work-orders`](https://telcomap-backend.onrender.com/api/sites/work-orders)
- **System Health & Neon DB Status:**  
  [`https://telcomap-backend.onrender.com/api/health`](https://telcomap-backend.onrender.com/api/health)
- **GitHub Repository:**  
  [`https://github.com/Shubh-Cis/TelcoMap.git`](https://github.com/Shubh-Cis/TelcoMap.git) (Synchronized on `master` and `main`)

---

## 6. Executive Presentation Walkthrough for Emmanuel Mukwesa (CEO, Intellilink Media)

When presenting this system to Emmanuel Mukwesa or enterprise clients in Zambia, follow this recommended 5-minute walkthrough:

```
Step 1: Open Navigation Sidebar -> Click "Executive Cockpit" (Overview)
Show the high-level KPIs: 90% availability, 5 regional hubs, $150,500 contracted MRR, and 100% ZICTA sovereign compliance.

Step 2: Click "BSS Governance"
Highlight the enterprise accounts:
- Stanbic Bank ($48,000 MRR)
- First Quantum Minerals ($28,500 MRR)
- Konkola Copper Mines ($36,000 MRR)
Show how each contract has contractual SLA targets (99.9x%) and explain that TelcoMap protects this revenue from downtime penalties.

Step 3: Click "OSS Suite"
Show the ITU-T X.733 Active Alarm Console:
- Point out ALM-FBR-001 (Optical Loss on Livingstone link).
- Point to the 4x4 Rigging Truck dispatch: Southern Province Unit 3 rolling with OTDR testers and replacement Cisco SFP+ optics (ETA: 1h 35m).

Step 4: Click "Disaster Simulator" (Chaos Drill)
Click "Simulate Optical Fibre Sever":
- Watch the live millisecond timer:
  - T+00.00s: Backhoe cuts primary fiber on highway.
  - T+00.14s: BGP automatically converges to Starlink LEO Satellite.
  - T+00.23s: Packet flow restored (38ms latency).
- Emphasize to Emmanuel: "Without TelcoMap, this is a $2,850 penalty. With TelcoMap, uptime is preserved and penalty is $0."

Step 5: Click "AIOps Copilot" & "Weekly SLA Report"
Demonstrate Gemini AI diagnosing the root cause and generate the Executive SLA Audit Report in 1 click.
```

---

*Joint Initiative by Intellilink Media Advisory & CIS Engineering Delivery.*
