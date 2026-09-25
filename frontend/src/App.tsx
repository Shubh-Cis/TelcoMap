import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NetworkSummary } from './components/NetworkSummary';
import { NetworkMap } from './components/NetworkMap';
import { SiteDetails } from './components/SiteDetails';
import { SiteTable } from './components/SiteTable';
import { NetworkTopology } from './components/NetworkTopology';
import { AddSiteModal } from './components/AddSiteModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { RadarWidget } from './components/RadarWidget';
import { GuidedDemoBar, TOUR_STEPS } from './components/GuidedDemoBar';
import { networkApi } from './services/networkApi';
import { Site, NetworkSummary as SummaryType, TopologyData, SystemHealth, OperationalStatus } from './types/network';
import { Info, AlertCircle } from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'map' | 'topology' | 'table'>('map');
  const [selectedFilter, setSelectedFilter] = useState<OperationalStatus | 'ALL'>('ALL');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState<boolean>(false);
  const [isFailoverActive, setIsFailoverActive] = useState<boolean>(false);

  // Phase 11: Guided Executive Pitch Tour state
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [topology, setTopology] = useState<TopologyData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNetworkData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrently fetch health, summary, sites, and topology
      const [healthData, summaryData, sitesData, topologyData] = await Promise.all([
        networkApi.getHealth().catch(() => null),
        networkApi.getSummary().catch(() => null),
        networkApi.getSites(),
        networkApi.getTopology().catch(() => null),
      ]);

      if (healthData) setHealth(healthData);
      if (summaryData) setSummary(summaryData);
      if (sitesData) {
        setSites(sitesData);
        // Default to selecting the degraded or critical site if none selected
        if (!selectedSite && sitesData.length > 0) {
          const problemSite = sitesData.find((s) => s.status === 'CRITICAL') || sitesData[0];
          setSelectedSite(problemSite);
        }
      }
      if (topologyData) setTopology(topologyData);
    } catch (err: any) {
      console.error('Failed to load network data:', err);
      setError(err?.message || 'Unable to connect to Telecom Network API');
    } finally {
      setLoading(false);
    }
  }, [selectedSite]);

  useEffect(() => {
    loadNetworkData();
    // Auto-refresh health every 15 seconds
    const interval = setInterval(async () => {
      try {
        const h = await networkApi.getHealth();
        setHealth(h);
      } catch (e) {
        // silent fail for periodic check
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleSiteCreated = (newSite: Site) => {
    setSites((prev) => {
      const exists = prev.some((s) => s.id === newSite.id || s.siteCode === newSite.siteCode);
      if (exists) return prev;
      return [...prev, newSite];
    });
    setSelectedSite(newSite);
    setActiveView('map');
    // Refresh operational summary and topology
    loadNetworkData();
  };

  const handleToggleTour = () => {
    const next = !isTourOpen;
    setIsTourOpen(next);
    if (next) {
      setTourStep(1);
      setActiveView('map');
    }
  };

  const handleTourStepChange = (step: number) => {
    setTourStep(step);
    setActiveView('map');
    if (step >= 2) {
      const livingstone = sites.find((s) => s.siteCode === 'ZM-005') || sites[0];
      if (livingstone) setSelectedSite(livingstone);
      setTimeout(() => {
        const inspector = document.getElementById('site-inspector-panel');
        if (inspector) inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top NOC Header */}
      <Header
        health={health}
        loading={loading}
        onRefresh={loadNetworkData}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenAddSite={() => setIsAddModalOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyModalOpen(true)}
        onToggleGuidedTour={handleToggleTour}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1760px] mx-auto w-full">
        {/* Error Alert if API is down */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Network API Connection Notice</p>
                <p className="text-xs text-rose-400/90">{error}</p>
              </div>
            </div>
            <button
              onClick={loadNetworkData}
              className="text-xs px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Phase Indicator & Architecture Context Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200">
              Telecom Network Feature Active:
            </span>{' '}
            Monitoring multi-technology infrastructure across Zambia (4G, 5G, Fibre, Microwave, Satellite). Sites, devices, coordinates, and health statuses are loaded directly from the NestJS Backend and PostgreSQL database.
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Sticky Radar + Right Main Operations */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT SIDEBAR: Regional Internet & ISP Radar (Always Visible, Sticky) */}
          <aside className="w-full lg:w-[350px] xl:w-[380px] shrink-0 lg:sticky lg:top-20 z-20">
            <RadarWidget />
          </aside>

          {/* RIGHT COLUMN: Executive Metrics + Map + Site Inspector / Other Views */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Executive Metric Summary */}
            <NetworkSummary
              summary={summary}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
            />

            {/* VIEW 1: Interactive Geographic NOC Map */}
            {activeView === 'map' && (
              <div className="space-y-6">
                {/* Full-Width Interactive Geographic Map */}
                <div className="w-full">
                  <NetworkMap
                    sites={sites.filter((s) => selectedFilter === 'ALL' || s.status === selectedFilter)}
                    selectedSite={selectedSite}
                    onSelectSite={setSelectedSite}
                    isFailoverActive={isFailoverActive}
                  />
                </div>

                {/* Site Details Panel Directly Below Map */}
                <div className="w-full rounded-xl transition-all duration-300" id="site-inspector-panel">
                  {selectedSite ? (
                    <SiteDetails
                      site={selectedSite}
                      onClose={() => setSelectedSite(null)}
                      isFailoverActive={isFailoverActive}
                      onFailoverToggle={setIsFailoverActive}
                    />
                  ) : (
                    <div className="w-full min-h-[140px] border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                      <p className="font-semibold mb-1 text-slate-300">No Site Selected</p>
                      <p>Click on any marker on the map above to inspect its live network links, AI diagnostics, BSS contract, and hardware devices.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Visual Network Topology */}
            {activeView === 'topology' && (
              <NetworkTopology
                topology={topology}
                sites={sites}
                onSelectSite={(site) => {
                  setSelectedSite(site);
                  setActiveView('map');
                }}
              />
            )}

            {/* VIEW 3: Site Inventory Table */}
            {activeView === 'table' && (
              <div className="space-y-6">
                <SiteTable
                  sites={sites}
                  selectedFilter={selectedFilter}
                  onSelectFilter={setSelectedFilter}
                  onSelectSite={(site) => {
                    setSelectedSite(site);
                    setActiveView('map');
                  }}
                  selectedSiteId={selectedSite?.id}
                  onOpenAddSite={() => setIsAddModalOpen(true)}
                />
                {selectedSite && (
                  <SiteDetails
                    site={selectedSite}
                    onClose={() => setSelectedSite(null)}
                    isFailoverActive={isFailoverActive}
                    onFailoverToggle={setIsFailoverActive}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Provision New Site Modal */}
      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSiteCreated={handleSiteCreated}
      />

      {/* Weekly AI Operations & Focus Report Modal */}
      <WeeklyReportModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        onSelectSite={(siteCode) => {
          const match = sites.find((s) => s.siteCode === siteCode);
          if (match) {
            setSelectedSite(match);
            setActiveView('map');
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-300">Joint Initiative:</span>
          <span className="text-sky-400 font-medium">Intellilink Media Advisory</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-indigo-400 font-medium">CIS Engineering Delivery</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-500">Telecom Operations &amp; Intelligence Platform (Zambia Demo Network)</span>
        </div>
      </footer>

      {/* Phase 11: 1-Click Guided Pitch & Demo Mode */}
      <GuidedDemoBar
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentStep={tourStep}
        onNextStep={() => handleTourStepChange(Math.min(tourStep + 1, TOUR_STEPS.length))}
        onPrevStep={() => handleTourStepChange(Math.max(tourStep - 1, 1))}
        onJumpToStep={handleTourStepChange}
      />
    </div>
  );
}

export default App;
