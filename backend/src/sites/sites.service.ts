import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Provisions a new network site with its backhauls and initial device hardware.
   */
  async create(data: {
    siteCode: string;
    siteName: string;
    country?: string;
    region?: string;
    city: string;
    latitude: number;
    longitude: number;
    status?: string;
    primaryTech: string;
    backupTech?: string;
    device?: {
      deviceCode?: string;
      name?: string;
      type?: string;
      vendor?: string;
      model?: string;
      ipAddress?: string;
      status?: string;
    };
  }) {
    if (!data.siteCode || !data.siteName || !data.city || data.latitude === undefined || data.longitude === undefined) {
      throw new BadRequestException('Site code, name, city, latitude, and longitude are required');
    }

    const cleanCode = data.siteCode.trim().toUpperCase();

    const existing = await this.prisma.site.findUnique({
      where: { siteCode: cleanCode },
    });

    if (existing) {
      throw new BadRequestException(`A network site with code '${cleanCode}' already exists`);
    }

    const deviceData = data.device && data.device.name ? [
      {
        deviceCode: data.device.deviceCode || `DEV-${cleanCode}-01`,
        name: data.device.name,
        type: data.device.type || 'GATEWAY',
        vendor: data.device.vendor || 'Generic',
        model: data.device.model || 'Standard Edge',
        ipAddress: data.device.ipAddress || '10.10.99.1',
        status: data.device.status || (data.status === 'CRITICAL' ? 'OFFLINE' : data.status === 'DEGRADED' ? 'DEGRADED' : 'ONLINE'),
      }
    ] : [];

    return this.prisma.site.create({
      data: {
        siteCode: cleanCode,
        siteName: data.siteName.trim(),
        country: (data.country || 'Zambia').trim(),
        region: (data.region || 'General').trim(),
        city: data.city.trim(),
        latitude: parseFloat(String(data.latitude)),
        longitude: parseFloat(String(data.longitude)),
        status: (data.status || 'HEALTHY').toUpperCase(),
        primaryTech: (data.primaryTech || 'FOUR_G').toUpperCase(),
        backupTech: data.backupTech ? data.backupTech.toUpperCase() : null,
        devices: {
          create: deviceData,
        },
      },
      include: {
        devices: true,
      },
    });
  }

  /**
   * Retrieves all network sites with their deployed devices.
   * Can optionally filter by operational status (HEALTHY, DEGRADED, CRITICAL) or country.
   */
  async findAll(status?: string, country?: string) {
    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    return this.prisma.site.findMany({
      where,
      include: {
        devices: {
          select: {
            id: true,
            deviceCode: true,
            name: true,
            type: true,
            vendor: true,
            model: true,
            ipAddress: true,
            status: true,
          },
        },
        bssContract: true,
        workOrders: true,
        alarms: true,
      },
      orderBy: { siteCode: 'asc' },
    });
  }

  /**
   * Retrieves a single site by its unique ID or siteCode (e.g. ZM-001)
   */
  async findOne(idOrCode: string) {
    const site = await this.prisma.site.findFirst({
      where: {
        OR: [{ id: idOrCode }, { siteCode: idOrCode }],
      },
      include: {
        devices: true,
        bssContract: true,
        workOrders: true,
        alarms: true,
      },
    });

    if (!site) {
      throw new NotFoundException(`Network site '${idOrCode}' not found`);
    }

    return site;
  }

  /**
   * BSS Governance: Customer SLA portfolio, revenue exposure, and regulatory metrics
   */
  async getBssContracts() {
    const contracts = await this.prisma.bssContract.findMany({
      include: {
        site: {
          select: {
            id: true,
            siteCode: true,
            siteName: true,
            city: true,
            status: true,
            primaryTech: true,
            backupTech: true,
          },
        },
      },
      orderBy: { monthlyRevenueUsd: 'desc' },
    });

    const totalMrr = contracts.reduce((sum, c) => sum + c.monthlyRevenueUsd, 0);
    const affectedContracts = contracts.filter((c) => c.site.status !== 'HEALTHY');
    const monthlyRevenueAtRisk = affectedContracts.reduce((sum, c) => sum + c.monthlyRevenueUsd, 0);
    const avgSla = contracts.length > 0 ? (contracts.reduce((sum, c) => sum + c.slaTargetPercent, 0) / contracts.length).toFixed(2) : '99.90';

    return {
      summary: {
        totalContracts: contracts.length,
        totalMrrUsd: totalMrr,
        monthlyRevenueAtRiskUsd: monthlyRevenueAtRisk,
        slaComplianceRate: contracts.length > 0 ? Math.round(((contracts.length - affectedContracts.length) / contracts.length) * 100) : 100,
        averageSlaTarget: parseFloat(avgSla),
        zictaAuditStatus: '100% AUDITED & COMPLIANT',
      },
      contracts,
    };
  }

  /**
   * OSS Field Force: 4x4 Rigging dispatch, spare parts inventory, and truck roll costs
   */
  async getWorkOrders() {
    const orders = await this.prisma.workOrder.findMany({
      include: {
        site: {
          select: {
            id: true,
            siteCode: true,
            siteName: true,
            city: true,
            status: true,
            primaryTech: true,
            backupTech: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const staged = orders.filter((o) => o.status === 'STAGED').length;
    const dispatched = orders.filter((o) => o.status === 'DISPATCHED').length;
    const inProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length;
    const resolved = orders.filter((o) => o.status === 'RESOLVED').length;
    const totalCost = orders.reduce((sum, o) => sum + o.truckRollCostUsd, 0);

    return {
      summary: {
        totalOrders: orders.length,
        staged,
        dispatched,
        inProgress,
        resolved,
        totalTruckRollCostUsd: totalCost,
        avgEtaMinutes: 65,
      },
      workOrders: orders,
    };
  }

  /**
   * OSS Fault Management: Active FCAPS Carrier Alarms with ITU-T X.733 severity classification
   */
  async getAlarms() {
    const alarms = await this.prisma.alarm.findMany({
      include: {
        site: {
          select: {
            id: true,
            siteCode: true,
            siteName: true,
            city: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const critical = alarms.filter((a) => a.severity === 'CRITICAL').length;
    const major = alarms.filter((a) => a.severity === 'MAJOR').length;
    const minor = alarms.filter((a) => a.severity === 'MINOR').length;
    const warning = alarms.filter((a) => a.severity === 'WARNING').length;

    return {
      summary: {
        totalActiveAlarms: alarms.filter((a) => a.status === 'ACTIVE').length,
        critical,
        major,
        minor,
        warning,
        mttrMinutes: 18.4,
      },
      alarms,
    };
  }

  /**
   * Returns aggregated network operational health summary:
   * Total Sites, Healthy Sites, Degraded Sites, Critical Sites.
   */
  async getSummary() {
    const [totalSites, healthySites, degradedSites, criticalSites, totalDevices, onlineDevices] =
      await Promise.all([
        this.prisma.site.count(),
        this.prisma.site.count({ where: { status: 'HEALTHY' } }),
        this.prisma.site.count({ where: { status: 'DEGRADED' } }),
        this.prisma.site.count({ where: { status: 'CRITICAL' } }),
        this.prisma.device.count(),
        this.prisma.device.count({ where: { status: 'ONLINE' } }),
      ]);

    return {
      totalSites,
      healthySites,
      degradedSites,
      criticalSites,
      totalDevices,
      onlineDevices,
      networkAvailabilityPercent: totalSites > 0 ? Math.round(((healthySites + degradedSites * 0.5) / totalSites) * 100) : 100,
    };
  }

  /**
   * Generates graph nodes and edges for visualizing network topology:
   * Internet Core -> Transport Technology Hubs -> Network Sites -> Local Devices
   */
  async getTopology() {
    const sites = await this.prisma.site.findMany({
      include: { devices: true },
      orderBy: { siteCode: 'asc' },
    });

    const nodes: Array<{ id: string; label: string; type: string; status?: string; details?: any }> = [
      { id: 'core-internet', label: 'Global Internet / Tier 1 Transit', type: 'CORE', status: 'HEALTHY' },
      { id: 'core-noc', label: 'National Telecom Core (Lusaka)', type: 'CORE', status: 'HEALTHY' },
      { id: 'transport-fibre', label: 'National DWDM Fibre Backbone', type: 'BACKBONE', status: 'HEALTHY' },
      { id: 'transport-microwave', label: 'Regional Microwave Network', type: 'BACKBONE', status: 'DEGRADED' },
      { id: 'transport-satellite', label: 'LEO / GEO Satellite Gateway', type: 'BACKBONE', status: 'CRITICAL' },
    ];

    const edges: Array<{ source: string; target: string; technology: string }> = [
      { source: 'core-internet', target: 'core-noc', technology: 'FIBRE' },
      { source: 'core-noc', target: 'transport-fibre', technology: 'FIBRE' },
      { source: 'core-noc', target: 'transport-microwave', technology: 'MICROWAVE' },
      { source: 'core-noc', target: 'transport-satellite', technology: 'SATELLITE' },
    ];

    sites.forEach((site) => {
      // Add Site Node
      nodes.push({
        id: `site-${site.id}`,
        label: `${site.siteCode} (${site.city})`,
        type: 'SITE',
        status: site.status,
        details: {
          siteCode: site.siteCode,
          primaryTech: site.primaryTech,
          backupTech: site.backupTech,
          city: site.city,
        },
      });

      // Connect Site to Transport Backbone
      const transportMap: Record<string, string> = {
        FIBRE: 'transport-fibre',
        MICROWAVE: 'transport-microwave',
        SATELLITE: 'transport-satellite',
        FIVE_G: 'transport-fibre',
        FOUR_G: site.backupTech === 'SATELLITE' ? 'transport-satellite' : site.backupTech === 'MICROWAVE' ? 'transport-microwave' : 'transport-fibre',
        HYBRID: 'transport-fibre',
      };

      const parentTransport = transportMap[site.primaryTech] || transportMap[site.backupTech || ''] || 'transport-fibre';
      edges.push({
        source: parentTransport,
        target: `site-${site.id}`,
        technology: site.primaryTech,
      });

      // Add Devices under Site
      site.devices.forEach((device) => {
        nodes.push({
          id: `dev-${device.id}`,
          label: device.name,
          type: 'DEVICE',
          status: device.status,
          details: {
            code: device.deviceCode,
            vendor: device.vendor,
            model: device.model,
            ip: device.ipAddress,
          },
        });

        edges.push({
          source: `site-${site.id}`,
          target: `dev-${device.id}`,
          technology: 'ETHERNET',
        });
      });
    });

    return { nodes, edges };
  }
}
