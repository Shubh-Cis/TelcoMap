export interface RadarMetricValue {
  p25: number;
  p50: number; // Median
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
  dateRange: string;
}
