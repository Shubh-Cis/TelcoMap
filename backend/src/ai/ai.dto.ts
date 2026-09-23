import { IsOptional, IsString } from 'class-validator';

export class DiagnoseSiteDto {
  @IsOptional()
  @IsString()
  customQuery?: string;
}

export interface AiDiagnosisResult {
  siteCode: string;
  siteName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  primaryTech: string;
  backupTech?: string | null;
  summary: string;
  probableRootCause: string;
  slaImpact: string;
  recommendedActions: string[];
  incidentDraft: {
    incidentCode: string;
    incidentTitle: string;
    severity: 'P1 - CRITICAL' | 'P2 - MAJOR' | 'P3 - MINOR' | 'P4 - INFORMATIONAL';
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
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
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
    reliabilityScore: number; // e.g. 99, 92, 75
    observation: string;
  }[];
  weeklyFieldRecommendations: string[];
  modelUsed: string;
}
