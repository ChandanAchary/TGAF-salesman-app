import { salesmanType } from "@/shared/zod";

export type FilterType = 
  | "TODAY" 
  | "YESTERDAY" 
  | "THIS_WEEK" 
  | "LAST_WEEK" 
  | "THIS_MONTH" 
  | "LAST_MONTH" 
  | "LAST_3_MONTHS" 
  | "THIS_YEAR" 
  | "CUSTOM";

export interface AnalyticsParams {
  filterType: FilterType;
  startDate?: string;
  endDate?: string;
  region?: string;
  branch?: string;
  area?: string;
  market?: string;
}

export interface SummaryMetric {
  value: string | number;
  growth: number;
  trend: "up" | "down" | "flat";
}

export interface AnalyticsSummary {
  sales: SummaryMetric;
  collection: SummaryMetric;
  outstanding: SummaryMetric;
  ordersCreated: SummaryMetric;
  ordersDelivered: SummaryMetric;
  retailersVisited: SummaryMetric;
  workingEmployees: SummaryMetric;
  attendancePercent: SummaryMetric;
  activeCustomers: SummaryMetric;
  newCustomers: SummaryMetric;
  pendingCollections: SummaryMetric;
  targetAchievement: SummaryMetric;
  averageOrderValue: SummaryMetric;
  averageCollection: SummaryMetric;
}

export interface ChartPoint {
  value: number;
  label: string;
}

export interface AnalyticsCharts {
  salesTrend: ChartPoint[];
  collectionTrend: ChartPoint[];
  orderTrend: ChartPoint[];
  salesByArea: { label: string; value: number }[];
  salesBySalesman: { label: string; value: number }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  sales: number;
  collection: number;
  orders: number;
  visits: number;
  attendance: number; // percentage
  targetAchievement: number; // percentage
  performance: number; // calculated score
  rank: number;
  status: "Present" | "Absent" | "Leave" | "Late";
  area?: string;
  market?: string;
}

export interface ProductMetric {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  status: "top" | "slow";
}

export interface AreaMetric {
  id: string;
  name: string;
  sales: number;
  collection: number;
  orders: number;
  outstanding: number;
  growth: number;
  rank: number;
}

export interface DistributorMetric {
  id: string;
  name: string;
  sales: number;
  outstanding: number;
  balance: number;
  status: "active" | "critical";
}

export interface AnalyticsAlert {
  id: string;
  type: "warning" | "danger" | "info";
  message: string;
  timestamp: string;
}

export interface DashboardData {
  summary: AnalyticsSummary;
  charts: AnalyticsCharts;
  team: TeamMember[];
  products: ProductMetric[];
  areas: AreaMetric[];
  distributors: DistributorMetric[];
  alerts: AnalyticsAlert[];
}
