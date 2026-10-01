import {
  Site,
  NetworkSummary,
  TopologyData,
  SystemHealth,
  Device,
  AiDiagnosisResult,
  WeeklyNetworkReport,
  RadarTelemetrySummary,
  BssSummaryResponse,
  WorkOrdersResponse,
  AlarmsResponse,
} from '../types/network';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const networkApi = {
  /**
   * Health check verifying backend and PostgreSQL connectivity
   */
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  /**
   * Fetches all network sites with optional status filtering
   */
  async getSites(status?: string): Promise<Site[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    const url = `${API_BASE}/sites${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Site[]>(res);
  },

  /**
   * Fetches a single site with all its devices
   */
  async getSite(id: string): Promise<Site> {
    const res = await fetch(`${API_BASE}/sites/${id}`);
    return handleResponse<Site>(res);
  },

  /**
   * Fetches high-level operational counts (Total, Healthy, Degraded, Critical)
   */
  async getSummary(): Promise<NetworkSummary> {
    const res = await fetch(`${API_BASE}/sites/summary`);
    return handleResponse<NetworkSummary>(res);
  },

  /**
   * Fetches network topology graph nodes and edges
   */
  async getTopology(): Promise<TopologyData> {
    const res = await fetch(`${API_BASE}/sites/topology`);
    return handleResponse<TopologyData>(res);
  },

  /**
   * Fetches devices with optional site filter
   */
  async getDevices(siteId?: string): Promise<Device[]> {
    const params = new URLSearchParams();
    if (siteId) params.append('siteId', siteId);
    const url = `${API_BASE}/devices${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Device[]>(res);
  },

  /**
   * Provisions a new network site with coordinates and hardware in PostgreSQL
   */
  async createSite(data: any): Promise<Site> {
    const res = await fetch(`${API_BASE}/sites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Site>(res);
  },

  /**
   * Runs AI Root-Cause Diagnostic on a specific network site
   */
  async diagnoseSite(siteId: string, customQuery?: string): Promise<AiDiagnosisResult> {
    if (customQuery) {
      const res = await fetch(`${API_BASE}/ai/diagnose/${siteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customQuery }),
      });
      return handleResponse<AiDiagnosisResult>(res);
    }
    const res = await fetch(`${API_BASE}/ai/diagnose/${siteId}`);
    return handleResponse<AiDiagnosisResult>(res);
  },

  /**
   * Generates the Executive Weekly Operations & Focus Report
   */
  async getWeeklyReport(): Promise<WeeklyNetworkReport> {
    const res = await fetch(`${API_BASE}/ai/weekly-report`);
    return handleResponse<WeeklyNetworkReport>(res);
  },

  /**
   * Fetches real-time internet quality index & outage telemetry from Cloudflare Radar
   */
  async getRadarSummary(country = 'ZM', range = '7d', refresh = false): Promise<RadarTelemetrySummary> {
    const params = new URLSearchParams({ country, range });
    if (refresh) params.append('refresh', 'true');
    const res = await fetch(`${API_BASE}/radar/summary?${params.toString()}`);
    return handleResponse<RadarTelemetrySummary>(res);
  },

  /**
   * Fetches BSS Enterprise customer contracts, MRR breakdown, and SLA penalty risk
   */
  async getBssContracts(): Promise<BssSummaryResponse> {
    const res = await fetch(`${API_BASE}/sites/bss`);
    return handleResponse<BssSummaryResponse>(res);
  },

  /**
   * Fetches OSS Field Force 4x4 Rigging dispatch work orders and replacement parts
   */
  async getWorkOrders(): Promise<WorkOrdersResponse> {
    const res = await fetch(`${API_BASE}/sites/work-orders`);
    return handleResponse<WorkOrdersResponse>(res);
  },

  /**
   * Fetches OSS active FCAPS carrier alarms with ITU-T severity classifications
   */
  async getAlarms(): Promise<AlarmsResponse> {
    const res = await fetch(`${API_BASE}/sites/alarms`);
    return handleResponse<AlarmsResponse>(res);
  },
};
