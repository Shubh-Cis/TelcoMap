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

export interface AiDiagnosisResult {
  siteCode: string;
  siteName: string;
  status: OperationalStatus;
  primaryTech: string;
  backupTech?: string | null;
  summary: string;
  probableRootCause: string;
  slaImpact: string;
  recommendedActions: string[];
  incidentDraft: {
    incidentCode: string;
    incidentTitle: string;
    severity: string;
    assignedTeam: string;
    description: string;
    immediateActions: string[];
  };
  confidenceScore: number;
  modelUsed: string;
  timestamp: string;
}

export interface WeeklyReportSiteFocus {
  siteCode: string;
  siteName: string;
  city: string;
  status: OperationalStatus;
  primaryTech: string;
  backupTech?: string | null;
  priorityLevel: 'CRITICAL - IMMEDIATE ACTION' | 'HIGH - ESCALATION' | 'MEDIUM - MONITOR';
  identifiedIssue: string;
  recommendedAction: string;
}

export interface WeeklyNetworkReport {
  reportPeriod: string;
  generatedAt: string;
  executiveSummary: string;
  networkSlaPercent: number;
  totalSites: number;
  criticalSitesCount: number;
  degradedSitesCount: number;
  healthySitesCount: number;
  priorityFocusSites: WeeklyReportSiteFocus[];
  technologyReliabilityBreakdown: {
    technology: string;
    reliabilityScore: number;
    observation: string;
  }[];
  weeklyFieldRecommendations: string[];
  modelUsed: string;
}

export interface RadarMetricValue {
  p25: number;
  p50: number;
  p75: number;
  unit: string;
}

export interface RadarOutageItem {
  id: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  outageCause: string;
  outageType: string;
  locations: string[];
  asns: number[];
  linkedUrl?: string | null;
}

export interface RadarTelemetrySummary {
  countryCode: string;
  countryName: string;
  source: string;
  lastUpdated: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DISRUPTED';
  statusMessage: string;
  bandwidth: RadarMetricValue;
  latency: RadarMetricValue;
  dns: RadarMetricValue;
  localOutagesCount: number;
  recentDisruptions: RadarOutageItem[];
  cached: boolean;
}
