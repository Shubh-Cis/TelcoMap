const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Initial Telecom Network Infrastructure...');

  // Clean existing data for deterministic setup
  await prisma.device.deleteMany({});
  await prisma.site.deleteMany({});

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
    },
  });

  // 2. ZM-002: Copperbelt Regional Hub (4G + Fibre) - HEALTHY
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
            name: 'Ndola 4G LTE Gateway',
            type: 'GATEWAY',
            vendor: 'Nokia',
            model: 'AirScale Base Station',
            ipAddress: '10.10.2.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM002-02',
            name: 'Copperbelt Metro Fibre Switch',
            type: 'FIBRE_SWITCH',
            vendor: 'Cisco',
            model: 'Catalyst 9300',
            ipAddress: '10.10.2.2',
            status: 'ONLINE',
          },
        ],
      },
    },
  });

  // 3. ZM-003: Rural Zambia Outpost (4G + Microwave) - DEGRADED
  const site3 = await prisma.site.create({
    data: {
      siteCode: 'ZM-003',
      siteName: 'Rural Zambia Outpost',
      country: 'Zambia',
      region: 'Central Province',
      city: 'Kabwe Rural',
      latitude: -14.4469,
      longitude: 28.4464,
      status: 'DEGRADED',
      primaryTech: 'FOUR_G',
      backupTech: 'MICROWAVE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM003-01',
            name: 'Rural Tower 4G eNodeB',
            type: 'GATEWAY',
            vendor: 'Ericsson',
            model: 'RBS 6601',
            ipAddress: '10.10.3.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM003-02',
            name: 'Microwave Backhaul Radio',
            type: 'MICROWAVE_RADIO',
            vendor: 'Huawei',
            model: 'OptiX RTN 950',
            ipAddress: '10.10.3.2',
            status: 'DEGRADED',
          },
        ],
      },
    },
  });

  // 4. ZM-004: Remote Zambia Station (4G + Satellite) - CRITICAL
  const site4 = await prisma.site.create({
    data: {
      siteCode: 'ZM-004',
      siteName: 'Remote Zambia Station',
      country: 'Zambia',
      region: 'North-Western Province',
      city: 'Solwezi Outskirts',
      latitude: -12.1688,
      longitude: 26.3894,
      status: 'CRITICAL',
      primaryTech: 'FOUR_G',
      backupTech: 'SATELLITE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM004-01',
            name: 'Remote Station Edge Gateway',
            type: 'ROUTER',
            vendor: 'Cisco',
            model: 'ISR 4331',
            ipAddress: '10.10.4.1',
            status: 'DEGRADED',
          },
          {
            deviceCode: 'DEV-ZM004-02',
            name: 'Satellite VSAT Terminal',
            type: 'SATELLITE_TERMINAL',
            vendor: 'Starlink Business',
            model: 'Dishy High Performance',
            ipAddress: '10.10.4.2',
            status: 'OFFLINE',
          },
        ],
      },
    },
  });

  // 5. ZM-005: Border Region Outpost (4G + Satellite) - HEALTHY
  const site5 = await prisma.site.create({
    data: {
      siteCode: 'ZM-005',
      siteName: 'Border Region Outpost',
      country: 'Zambia',
      region: 'Southern Province',
      city: 'Livingstone Border',
      latitude: -17.8419,
      longitude: 25.8544,
      status: 'HEALTHY',
      primaryTech: 'FOUR_G',
      backupTech: 'SATELLITE',
      devices: {
        create: [
          {
            deviceCode: 'DEV-ZM005-01',
            name: 'Border Checkpoint Router',
            type: 'ROUTER',
            vendor: 'MikroTik',
            model: 'Cloud Core CCR2004',
            ipAddress: '10.10.5.1',
            status: 'ONLINE',
          },
          {
            deviceCode: 'DEV-ZM005-02',
            name: 'VSAT Satellite Backhaul',
            type: 'SATELLITE_TERMINAL',
            vendor: 'Eutelsat OneWeb',
            model: 'OW50u Terminal',
            ipAddress: '10.10.5.2',
            status: 'ONLINE',
          },
        ],
      },
    },
  });

  console.log(`Successfully seeded 5 network sites and 10 devices.`);
}

main()
  .catch((e) => {
    console.error('Error seeding network data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
