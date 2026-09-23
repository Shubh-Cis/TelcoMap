import { Site, NetworkSummary, TopologyData, SystemHealth, Device } from '../types/network';

const API_BASE = '/api';

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
};
