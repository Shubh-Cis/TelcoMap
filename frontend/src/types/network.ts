export type OperationalStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
export type DeviceStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';
export type ConnectivityTechnology = 'FIVE_G' | 'FOUR_G' | 'FIBRE' | 'MICROWAVE' | 'SATELLITE' | 'HYBRID';

export interface Device {
  id: string;
  deviceCode: string;
  name: string;
  type: string;
  vendor: string;
  model: string;
  ipAddress: string;
  status: DeviceStatus;
  siteId: string;
}

export interface Site {
  id: string;
  siteCode: string;
  siteName: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  status: OperationalStatus;
  primaryTech: ConnectivityTechnology;
  backupTech?: ConnectivityTechnology | null;
  devices: Device[];
  createdAt: string;
  updatedAt: string;
}

export interface NetworkSummary {
  totalSites: number;
  healthySites: number;
  degradedSites: number;
  criticalSites: number;
  totalDevices: number;
  onlineDevices: number;
  networkAvailabilityPercent: number;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'CORE' | 'BACKBONE' | 'SITE' | 'DEVICE';
  status?: OperationalStatus | DeviceStatus | string;
  details?: Record<string, any>;
}

export interface TopologyEdge {
  source: string;
  target: string;
  technology: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface SystemHealth {
  status: string;
  service: string;
  database: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}
