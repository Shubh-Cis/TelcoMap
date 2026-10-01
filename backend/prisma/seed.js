const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Enterprise Telecom OSS & BSS Infrastructure...');

  // Clean existing tables in correct order
  try {
    await prisma.alarm.deleteMany({});
    await prisma.workOrder.deleteMany({});
    await prisma.bssContract.deleteMany({});
    await prisma.device.deleteMany({});
    await prisma.site.deleteMany({});
  } catch (err) {
    console.log('Clean-up note:', err.message);
  }

  // 1. ZM-001: Lusaka Central Hub (5G + Fibre) - HEALTHY
  const site1 = await prisma.site.create({
    data: {
      siteCode: 'ZM-001',
      siteName: 'Lusaka Central Hub',
      country: 'Zambia',
      region: 'Lusaka Province',
      city: 'Lusaka',
      latitude: -15.3875,
      longitude: 28.3228,
      status: 'HEALTHY',
      primaryTech: 'FIVE_G',
      backupTech: 'FIBRE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM001-01',
            name: 'Lusaka 5G Baseband Gateway',
            type: 'GATEWAY',
            vendor: 'Huawei',
            model: '5G BBU5900',
            ipAddress: '10.10.1.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM001-02',
            name: 'Lusaka Core Fibre Router',
            type: 'ROUTER',
            vendor: 'Cisco',
            model: 'ASR 9001',
            ipAddress: '10.10.1.2',
            status: 'ONLINE',
          },
        ],
      },
      bssContract: {
        create: {
          clientName: 'Stanbic Bank & Central Financial Switch',
          industry: 'Commercial Banking & National Clearing',
          contractTier: 'Tier-1 Core Financial Infrastructure',
          monthlyRevenueUsd: 48000,
          slaTargetPercent: 99.99,
          dataSovereignty: 'National Sovereign Core (Direct Tier-1 IXP Landing)',
          lawfulInterceptionStatus: 'National Lawful Interception Center (NLIC) Certified',
          zictaLicense: 'ZICTA-5G-NR-NATIONAL-2026-001',
        },
      },
      workOrders: {
        create: [
          {
            orderId: 'WO-2026-1002',
            priority: 'P3 - NORMAL',
            assignedCrew: 'Lusaka Metro Rapid Response Crew',
            vehicle: 'Toyota LandCruiser 4x4 Mobile Field Unit (ZM-NOC-01)',
            truckRollCostUsd: 280,
            estimatedArrival: '45 Minutes',
            requiredSpares: 'Cisco 10G SFP+ Optical Transceiver, Single-Mode OS2 Fiber Patch Cord, Fluke OTDR Fault Locator',
            status: 'STAGED',
          },
        ],
      },
    },
  });

  // 2. ZM-002: Copperbelt Regional Hub (Ndola - 4G + Fibre) - HEALTHY
  const site2 = await prisma.site.create({
    data: {
      siteCode: 'ZM-002',
      siteName: 'Copperbelt Regional Hub',
      country: 'Zambia',
      region: 'Copperbelt',
      city: 'Ndola',
      latitude: -12.9688,
      longitude: 28.6366,
      status: 'HEALTHY',
      primaryTech: 'FOUR_G',
      backupTech: 'FIBRE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM002-01',
            name: 'Copperbelt LTE Base Station',
            type: 'GATEWAY',
            vendor: 'Nokia',
            model: 'AirScale Baseband',
            ipAddress: '10.10.2.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM002-02',
            name: 'Ndola Aggregation Switch',
            type: 'FIBRE_SWITCH',
            vendor: 'Cisco',
            model: 'Catalyst 9500',
            ipAddress: '10.10.2.2',
            status: 'ONLINE',
          },
        ],
      },
      bssContract: {
        create: {
          clientName: 'Konkola Copper Mines & Mopani Smelters',
          industry: 'Copper Smelting & Refining',
          contractTier: 'Tier-1 Mission-Critical SLA',
          monthlyRevenueUsd: 36000,
          slaTargetPercent: 99.95,
          dataSovereignty: 'Copperbelt DWDM Metro Ring (Local Breakout)',
          lawfulInterceptionStatus: 'Carrier-Grade LI Gateway Active',
          zictaLicense: 'ZICTA-LTE-METRO-2026-012',
        },
      },
      workOrders: {
        create: [
          {
            orderId: 'WO-2026-2104',
            priority: 'P2 - HIGH',
            assignedCrew: 'Copperbelt Regional Fiber Splicing Unit 1',
            vehicle: 'Ford Ranger 4x4 Fusion Splicing Van (ZM-NOC-08)',
            truckRollCostUsd: 320,
            estimatedArrival: '30 Minutes',
            requiredSpares: 'Nokia AirScale Baseband Optical SFP28, Fujikura 90S+ Core Fusion Splicer, Armored Splice Enclosure',
            status: 'STAGED',
          },
        ],
      },
    },
  });

  // 3. ZM-003: Kabwe Rural Outpost (Microwave) - DEGRADED
  const site3 = await prisma.site.create({
    data: {
      siteCode: 'ZM-003',
      siteName: 'Kabwe Rural Outpost',
      country: 'Zambia',
      region: 'Central Province',
      city: 'Kabwe',
      latitude: -14.4426,
      longitude: 28.4464,
      status: 'DEGRADED',
      primaryTech: 'MICROWAVE',
      backupTech: null,
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM003-01',
            name: 'Kabwe Wireless Gateway',
            type: 'GATEWAY',
            vendor: 'Huawei',
            model: 'AR6280',
            ipAddress: '10.10.3.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM003-02',
            name: 'Long-Haul Microwave Radio',
            type: 'MICROWAVE_RADIO',
            vendor: 'Huawei',
            model: 'OptiX RTN 950',
            ipAddress: '10.10.3.2',
            status: 'DEGRADED',
          },
        ],
      },
      bssContract: {
        create: {
          clientName: 'Zambia Railways & Central Grain Logistics',
          industry: 'National Rail & Heavy Transport',
          contractTier: 'Tier-2 Industrial Enterprise',
          monthlyRevenueUsd: 14200,
          slaTargetPercent: 99.50,
          dataSovereignty: 'National Microwave Transit Ring',
          lawfulInterceptionStatus: 'Standard Terrestrial Intercept Active',
          zictaLicense: 'ZICTA-MW-REG-2026-041',
        },
      },
      alarms: {
        create: [
          {
            alarmCode: 'ALM-MW-042',
            severity: 'MAJOR',
            title: 'Microwave Radio Latency & BER Degradation',
            source: 'OptiX RTN 950 IDU',
            description: 'Adaptive modulation downshift detected due to convective atmospheric attenuation. Latency > 310ms.',
            status: 'ACTIVE',
          },
        ],
      },
      workOrders: {
        create: [
          {
            orderId: 'WO-2026-3391',
            priority: 'P2 - HIGH',
            assignedCrew: 'Central Province Microwave Radio Team',
            vehicle: 'Nissan Patrol 4x4 Field Maintenance Lab (ZM-NOC-19)',
            truckRollCostUsd: 360,
            estimatedArrival: '1 Hour 10 Minutes',
            requiredSpares: 'Huawei OptiX RTN 950 Microwave Outdoor Transceiver (ODU), Precision Dual-Polarized Feed, 48V DC Power Module',
            status: 'STAGED',
          },
        ],
      },
    },
  });

  // 4. ZM-004: Solwezi Remote Station (Copper Mining Hub) - CRITICAL
  const site4 = await prisma.site.create({
    data: {
      siteCode: 'ZM-004',
      siteName: 'Solwezi Remote Station',
      country: 'Zambia',
      region: 'North-Western Province',
      city: 'Solwezi',
      latitude: -12.1814,
      longitude: 26.3986,
      status: 'CRITICAL',
      primaryTech: 'FOUR_G',
      backupTech: 'SATELLITE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM004-01',
            name: 'Solwezi LTE Gateway',
            type: 'GATEWAY',
            vendor: 'Cisco',
            model: 'ISR 4451',
            ipAddress: '10.10.4.1',
            status: 'DEGRADED',
          },
          {
            deviceCode: 'DEV-ZM004-02',
            name: 'Eutelsat OneWeb / Starlink VSAT Dish',
            type: 'SATELLITE_TERMINAL',
            vendor: 'Starlink',
            model: 'Business Dishy Flat High-Performance',
            ipAddress: '10.10.4.2',
            status: 'OFFLINE',
          },
        ],
      },
      bssContract: {
        create: {
          clientName: 'First Quantum Minerals (Sentinel & Kansanshi)',
          industry: 'Copper & Nickel Heavy Mining',
          contractTier: 'Tier-1 Mission-Critical SLA',
          monthlyRevenueUsd: 28500,
          slaTargetPercent: 99.90,
          dataSovereignty: 'Local Breakout (Lusaka Core Gateway)',
          lawfulInterceptionStatus: 'ZICTA-LI Probe Certified (Compliant)',
          zictaLicense: 'ZICTA-VSAT-NTN-2026-084',
        },
      },
      alarms: {
        create: [
          {
            alarmCode: 'ALM-FBR-001',
            severity: 'CRITICAL',
            title: 'Carrier Primary Link Optical Loss Detected',
            source: 'Port 1/0/1 - Primary Terrestrial Interface',
            description: '100% optical signal loss detected. BFD micro-probes dropped. Primary path declared DEAD.',
            status: 'ACTIVE',
          },
          {
            alarmCode: 'ALM-SAT-088',
            severity: 'MAJOR',
            title: 'Standby LEO Satellite Dish Re-Pointing Triggered',
            source: 'Eutelsat OneWeb Dish Terminal',
            description: 'Automatic protection switching (APS) initiating fast-reroute cutover to LEO satellite beam.',
            status: 'ACTIVE',
          },
        ],
      },
      workOrders: {
        create: [
          {
            orderId: 'WO-2026-6706',
            priority: 'P1 - CRITICAL',
            assignedCrew: 'North-Western Mobile Rigging & VSAT Unit 2',
            vehicle: 'Toyota Hilux 4x4 Heavy-Duty Rigging Truck (ZM-NOC-44)',
            truckRollCostUsd: 480,
            estimatedArrival: '1 Hour 35 Minutes',
            requiredSpares: 'Ku-Band Phased-Array VSAT Feedhorn & LNB, Starlink High-Performance Terminal Mount, MikroTik CCR2004',
            status: 'DISPATCHED',
          },
        ],
      },
    },
  });

  // 5. ZM-005: Livingstone Border Gateway (Fibre + Microwave) - HEALTHY
  const site5 = await prisma.site.create({
    data: {
      siteCode: 'ZM-005',
      siteName: 'Livingstone Border Gateway',
      country: 'Zambia',
      region: 'Southern Province',
      city: 'Livingstone',
      latitude: -17.8419,
      longitude: 25.8543,
      status: 'HEALTHY',
      primaryTech: 'FIBRE',
      backupTech: 'MICROWAVE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM005-01',
            name: 'Livingstone Border Gateway Router',
            type: 'ROUTER',
            vendor: 'Cisco',
            model: 'ASR 1001-X',
            ipAddress: '10.10.5.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM005-02',
            name: 'SADC Border Microwave Relay',
            type: 'MICROWAVE_RADIO',
            vendor: 'Huawei',
            model: 'OptiX RTN 950',
            ipAddress: '10.10.5.2',
            status: 'ONLINE',
          },
        ],
      },
      bssContract: {
        create: {
          clientName: 'Zambia Sugar & Southern SADC Transit Border',
          industry: 'Agro-Industrial & Cross-Border Logistics',
          contractTier: 'Tier-2 Regional Enterprise',
          monthlyRevenueUsd: 16800,
          slaTargetPercent: 99.50,
          dataSovereignty: 'Cross-Border SADC Gateway (Monitored)',
          lawfulInterceptionStatus: 'Customs & Border LI Probe Active',
          zictaLicense: 'ZICTA-VSAT-SADC-2026-099',
        },
      },
      workOrders: {
        create: [
          {
            orderId: 'WO-2026-5519',
            priority: 'P3 - NORMAL',
            assignedCrew: 'Southern Province Cross-Border Rigging Crew',
            vehicle: 'Toyota LandCruiser 4x4 Inspection Unit (ZM-NOC-05)',
            truckRollCostUsd: 260,
            estimatedArrival: '40 Minutes',
            requiredSpares: 'Cisco SFP+ Optical Transceiver, Single-Mode LC-LC Patch Cord',
            status: 'STAGED',
          },
        ],
      },
    },
  });

  console.log('Successfully seeded 5 network sites with full OSS Alarms, WorkOrders, and BSS Contracts!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
