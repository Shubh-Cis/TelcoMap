import { Site, EnterpriseBssProfile, OssWorkOrder } from '../types/network';

export function getSiteBssProfile(site: Site, isFailoverActive = false): EnterpriseBssProfile {
  switch (site.siteCode) {
    case 'ZM-004': // Solwezi Remote Station
      return {
        clientName: 'First Quantum Minerals (Sentinel & Kansanshi)',
        industry: 'Copper & Nickel Heavy Mining',
        contractTier: 'Tier-1 Mission-Critical SLA',
        monthlyRevenueUsd: 28500,
        slaTargetPercent: 99.90,
        currentSlaPercent: isFailoverActive ? 98.40 : site.status === 'CRITICAL' ? 95.80 : 98.90,
        penaltyRiskUsd: isFailoverActive ? 1800 : site.status === 'CRITICAL' ? 5700 : 0,
        dataSovereignty: 'Local Breakout (Lusaka Core Gateway)',
        lawfulInterceptionStatus: 'ZICTA-LI Probe Certified (Compliant)',
        zictaLicense: 'ZICTA-VSAT-NTN-2026-084',
      };
    case 'ZM-003': // Kabwe Rural Outpost
      return {
        clientName: 'Zambia Railways & Central Grain Logistics',
        industry: 'National Rail & Heavy Transport',
        contractTier: 'Tier-2 Industrial Enterprise',
        monthlyRevenueUsd: 14200,
        slaTargetPercent: 99.50,
        currentSlaPercent: isFailoverActive ? 98.90 : site.status === 'DEGRADED' ? 98.10 : 99.65,
        penaltyRiskUsd: isFailoverActive ? 800 : site.status === 'DEGRADED' ? 1420 : 0,
        dataSovereignty: 'National Microwave Transit Ring',
        lawfulInterceptionStatus: 'Standard Terrestrial Intercept Active',
        zictaLicense: 'ZICTA-MW-REG-2026-041',
      };
    case 'ZM-002': // Copperbelt Regional Hub (Ndola)
      return {
        clientName: 'Konkola Copper Mines & Mopani Smelters',
        industry: 'Copper Smelting & Refining',
        contractTier: 'Tier-1 Mission-Critical SLA',
        monthlyRevenueUsd: 36000,
        slaTargetPercent: 99.95,
        currentSlaPercent: isFailoverActive ? 99.10 : 99.98,
        penaltyRiskUsd: isFailoverActive ? 2200 : 0,
        dataSovereignty: 'Copperbelt DWDM Metro Ring (Local Breakout)',
        lawfulInterceptionStatus: 'Carrier-Grade LI Gateway Active',
        zictaLicense: 'ZICTA-LTE-METRO-2026-012',
      };
    case 'ZM-005': // Livingstone Border Hub
      return {
        clientName: 'Zambia Sugar & Southern SADC Transit Border',
        industry: 'Agro-Industrial & Cross-Border Logistics',
        contractTier: 'Tier-2 Regional Enterprise',
        monthlyRevenueUsd: 16800,
        slaTargetPercent: 99.50,
        currentSlaPercent: isFailoverActive ? 98.70 : 99.72,
        penaltyRiskUsd: isFailoverActive ? 950 : 0,
        dataSovereignty: 'Cross-Border SADC Gateway (Monitored)',
        lawfulInterceptionStatus: 'Customs & Border LI Probe Active',
        zictaLicense: 'ZICTA-VSAT-SADC-2026-099',
      };
    case 'ZM-001': // Lusaka Central Hub
    default:
      return {
        clientName: 'Stanbic Bank & Central Financial Switch',
        industry: 'Commercial Banking & National Clearing',
        contractTier: 'Tier-1 Core Financial Infrastructure',
        monthlyRevenueUsd: 48000,
        slaTargetPercent: 99.99,
        currentSlaPercent: isFailoverActive ? 99.50 : 99.99,
        penaltyRiskUsd: isFailoverActive ? 3500 : 0,
        dataSovereignty: 'National Sovereign Core (Direct Tier-1 IXP Landing)',
        lawfulInterceptionStatus: 'National Lawful Interception Center (NLIC) Certified',
        zictaLicense: 'ZICTA-5G-NR-NATIONAL-2026-001',
      };
  }
}

export function generateOssWorkOrder(site: Site): OssWorkOrder {
  const isCritical = site.status === 'CRITICAL';
  const isDegraded = site.status === 'DEGRADED';

  const orderId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let assignedCrew = 'Lusaka Metro Rapid Response Crew';
  let vehicle = 'Toyota LandCruiser 4x4 Mobile Field Unit (ZM-NOC-01)';
  let estimatedArrival = '45 Minutes';
  let truckRollCostUsd = 280;
  let requiredSpares = [
    'Cisco 10G SFP+ Optical Transceiver (10G-SR)',
    'Single-Mode OS2 Fiber Patch Cord (10m LC-LC)',
    'Fluke OTDR Optical Cable Fault Locator',
  ];

  if (site.siteCode === 'ZM-004') {
    assignedCrew = 'North-Western Mobile Rigging & VSAT Unit 2';
    vehicle = 'Toyota Hilux 4x4 Heavy-Duty Rigging Truck (ZM-NOC-44)';
    estimatedArrival = '1 Hour 35 Minutes';
    truckRollCostUsd = 480;
    requiredSpares = [
      'Ku-Band Phased-Array VSAT Feedhorn & LNB Assembly',
      'Starlink High-Performance Terminal Mount & Mast Adapter',
      'MikroTik Cloud Core Router (CCR2004-16G-2S+)',
      '100m Cat6A Heavy-Duty UV-Rated Shielded Cable',
    ];
  } else if (site.siteCode === 'ZM-003') {
    assignedCrew = 'Central Province Microwave Radio Team';
    vehicle = 'Nissan Patrol 4x4 Field Maintenance Lab (ZM-NOC-19)';
    estimatedArrival = '1 Hour 10 Minutes';
    truckRollCostUsd = 360;
    requiredSpares = [
      'Huawei OptiX RTN 950 Microwave Outdoor Transceiver (ODU)',
      'Precision Dual-Polarized Microwave Dish Antenna Feed',
      'Industrial Din-Rail 48V DC Power Supply Module',
    ];
  } else if (site.siteCode === 'ZM-002') {
    assignedCrew = 'Copperbelt Regional Fiber Splicing Unit 1';
    vehicle = 'Ford Ranger 4x4 Fusion Splicing Van (ZM-NOC-08)';
    estimatedArrival = '30 Minutes';
    truckRollCostUsd = 320;
    requiredSpares = [
      'Nokia AirScale Baseband Optical SFP28 Module',
      'Fujikura 90S+ Core-Alignment Fusion Splicer Kit',
      'Heavy-Duty Armored Fiber Splice Enclosure (24-Core)',
    ];
  }

  return {
    orderId,
    siteCode: site.siteCode,
    siteName: site.siteName,
    priority: isCritical ? 'P1 - CRITICAL' : isDegraded ? 'P2 - HIGH' : 'P3 - NORMAL',
    assignedCrew,
    vehicle,
    truckRollCostUsd,
    estimatedArrival,
    requiredSpares,
    status: 'PENDING_AUTHORIZATION',
    createdAt: new Date().toISOString(),
  };
}
