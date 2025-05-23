import { apiRequest } from "./queryClient";

export interface DashboardStats {
  activeRequests: number;
  urgentRequests: number;
  availableTechs: number;
  totalTechs: number;
  avgResponseTime: string;
}

export const api = {
  // Support Requests
  getSupportRequests: () => fetch("/api/support-requests").then(res => res.json()),
  createSupportRequest: (data: any) => apiRequest("POST", "/api/support-requests", data),
  updateSupportRequest: (id: number, data: any) => apiRequest("PATCH", `/api/support-requests/${id}`, data),
  
  // Technicians
  getTechnicians: () => fetch("/api/technicians").then(res => res.json()),
  updateTechnician: (id: number, data: any) => apiRequest("PATCH", `/api/technicians/${id}`, data),
  
  // Knowledge Base
  getKnowledgeBase: () => fetch("/api/knowledge-base").then(res => res.json()),
  
  // System Status
  getSystemStatus: () => fetch("/api/system-status").then(res => res.json()),
  
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> => fetch("/api/dashboard-stats").then(res => res.json()),
  
  // Emergency
  sendEmergencyAlert: (data: { message: string; location: string }) => 
    apiRequest("POST", "/api/emergency-alert", data),
};
