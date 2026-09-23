import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(siteId?: string, status?: string) {
    const where: any = {};
    if (siteId) {
      where.siteId = siteId;
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    return this.prisma.device.findMany({
      where,
      include: {
        site: {
          select: {
            id: true,
            siteCode: true,
            siteName: true,
            city: true,
            country: true,
            status: true,
          },
        },
      },
      orderBy: { deviceCode: 'asc' },
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!device) {
      throw new NotFoundException(`Network device '${id}' not found`);
    }

    return device;
  }
}
