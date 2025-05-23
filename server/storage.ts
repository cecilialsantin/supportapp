import { 
  supportRequests, 
  technicians, 
  knowledgeBaseArticles, 
  systemNotifications,
  type SupportRequest, 
  type InsertSupportRequest,
  type Technician,
  type InsertTechnician,
  type KnowledgeBaseArticle,
  type InsertKnowledgeBaseArticle,
  type SystemNotification
} from "@shared/schema";

export interface IStorage {
  // Support Requests
  getSupportRequests(): Promise<SupportRequest[]>;
  getSupportRequest(id: number): Promise<SupportRequest | undefined>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined>;
  
  // Technicians
  getTechnicians(): Promise<Technician[]>;
  getTechnician(id: number): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;
  
  // Knowledge Base
  getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]>;
  getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticle | undefined>;
  createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle>;
  
  // System Status
  getSystemNotifications(): Promise<SystemNotification[]>;
  updateSystemNotification(id: number, updates: Partial<SystemNotification>): Promise<SystemNotification | undefined>;
}

export class MemStorage implements IStorage {
  private supportRequestsMap: Map<number, SupportRequest>;
  private techniciansMap: Map<number, Technician>;
  private knowledgeBaseMap: Map<number, KnowledgeBaseArticle>;
  private systemNotificationsMap: Map<number, SystemNotification>;
  private currentRequestId: number;
  private currentTechnicianId: number;
  private currentArticleId: number;
  private currentNotificationId: number;

  constructor() {
    this.supportRequestsMap = new Map();
    this.techniciansMap = new Map();
    this.knowledgeBaseMap = new Map();
    this.systemNotificationsMap = new Map();
    this.currentRequestId = 1;
    this.currentTechnicianId = 1;
    this.currentArticleId = 1;
    this.currentNotificationId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize technicians
    const initialTechnicians: Technician[] = [
      {
        id: this.currentTechnicianId++,
        name: "Mike Chen",
        email: "mike.chen@hospital.com",
        phone: "+1234567890",
        specialty: "Senior Technician",
        status: "available",
        activeRequests: 2
      },
      {
        id: this.currentTechnicianId++,
        name: "Sarah Kim",
        email: "sarah.kim@hospital.com",
        phone: "+1234567891",
        specialty: "Lead Technician",
        status: "busy",
        activeRequests: 1
      },
      {
        id: this.currentTechnicianId++,
        name: "Alex Rodriguez",
        email: "alex.rodriguez@hospital.com",
        phone: "+1234567892",
        specialty: "Technician",
        status: "off_duty",
        activeRequests: 0
      }
    ];

    initialTechnicians.forEach(tech => this.techniciansMap.set(tech.id, tech));

    // Initialize knowledge base articles
    const initialArticles: KnowledgeBaseArticle[] = [
      {
        id: this.currentArticleId++,
        title: "Calibration Errors",
        content: "Step-by-step guide to troubleshoot GEM 5000 calibration issues...",
        category: "troubleshooting",
        readTime: 5,
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: this.currentArticleId++,
        title: "Network Issues",
        content: "How to resolve connectivity problems with GEM 5000 devices...",
        category: "network",
        readTime: 3,
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      },
      {
        id: this.currentArticleId++,
        title: "Maintenance Schedule",
        content: "Preventive maintenance guidelines for optimal GEM 5000 performance...",
        category: "maintenance",
        readTime: 8,
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    initialArticles.forEach(article => this.knowledgeBaseMap.set(article.id, article));

    // Initialize system notifications
    const initialNotifications: SystemNotification[] = [
      {
        id: this.currentNotificationId++,
        type: "email",
        status: "active",
        lastActivity: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      },
      {
        id: this.currentNotificationId++,
        type: "sms",
        status: "active",
        lastActivity: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: this.currentNotificationId++,
        type: "system",
        status: "active",
        lastActivity: new Date()
      }
    ];

    initialNotifications.forEach(notification => this.systemNotificationsMap.set(notification.id, notification));

    // Initialize some sample support requests
    const initialRequests: SupportRequest[] = [
      {
        id: this.currentRequestId++,
        serialNumber: "GEM5000-ICU-007",
        priority: "high",
        description: "Calibration error - Device showing incorrect values",
        location: "ICU - Room 302",
        contactNumber: "ext. 4567",
        status: "in_progress",
        assignedTechnician: "Mike Chen",
        submittedBy: "Dr. Johnson",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        updatedAt: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: this.currentRequestId++,
        serialNumber: "GEM5000-LAB-012",
        priority: "medium",
        description: "Routine maintenance required",
        location: "Laboratory - Station 3",
        contactNumber: "ext. 7890",
        status: "open",
        assignedTechnician: "Sarah Kim",
        submittedBy: "Lab Tech",
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: this.currentRequestId++,
        serialNumber: "GEM5000-ER-004",
        priority: "low",
        description: "Software update completed successfully",
        location: "Emergency - Bay 2",
        contactNumber: "ext. 1234",
        status: "resolved",
        assignedTechnician: "Alex Rodriguez",
        submittedBy: "ER Staff",
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(Date.now() - 60 * 60 * 1000)
      }
    ];

    initialRequests.forEach(request => this.supportRequestsMap.set(request.id, request));
  }

  // Support Requests
  async getSupportRequests(): Promise<SupportRequest[]> {
    return Array.from(this.supportRequestsMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSupportRequest(id: number): Promise<SupportRequest | undefined> {
    return this.supportRequestsMap.get(id);
  }

  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const id = this.currentRequestId++;
    const now = new Date();
    const newRequest: SupportRequest = {
      ...request,
      id,
      status: "open",
      assignedTechnician: null,
      contactNumber: request.contactNumber || null,
      createdAt: now,
      updatedAt: now
    };
    this.supportRequestsMap.set(id, newRequest);
    return newRequest;
  }

  async updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    const request = this.supportRequestsMap.get(id);
    if (!request) return undefined;

    const updatedRequest = {
      ...request,
      ...updates,
      updatedAt: new Date()
    };
    this.supportRequestsMap.set(id, updatedRequest);
    return updatedRequest;
  }

  // Technicians
  async getTechnicians(): Promise<Technician[]> {
    return Array.from(this.techniciansMap.values());
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    return this.techniciansMap.get(id);
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const id = this.currentTechnicianId++;
    const newTechnician: Technician = {
      ...technician,
      id,
      phone: technician.phone || null,
      activeRequests: 0
    };
    this.techniciansMap.set(id, newTechnician);
    return newTechnician;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    const technician = this.techniciansMap.get(id);
    if (!technician) return undefined;

    const updatedTechnician = {
      ...technician,
      ...updates
    };
    this.techniciansMap.set(id, updatedTechnician);
    return updatedTechnician;
  }

  // Knowledge Base
  async getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]> {
    return Array.from(this.knowledgeBaseMap.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticle | undefined> {
    return this.knowledgeBaseMap.get(id);
  }

  async createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle> {
    const id = this.currentArticleId++;
    const newArticle: KnowledgeBaseArticle = {
      ...article,
      id,
      updatedAt: new Date()
    };
    this.knowledgeBaseMap.set(id, newArticle);
    return newArticle;
  }

  // System Status
  async getSystemNotifications(): Promise<SystemNotification[]> {
    return Array.from(this.systemNotificationsMap.values());
  }

  async updateSystemNotification(id: number, updates: Partial<SystemNotification>): Promise<SystemNotification | undefined> {
    const notification = this.systemNotificationsMap.get(id);
    if (!notification) return undefined;

    const updatedNotification = {
      ...notification,
      ...updates
    };
    this.systemNotificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
