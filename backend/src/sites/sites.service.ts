import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });

    if (!site) {
      throw new NotFoundException(`Network site '${idOrCode}' not found`);
    }

    return site;
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
