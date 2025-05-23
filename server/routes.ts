import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportRequestSchema } from "@shared/schema";
import nodemailer from "nodemailer";

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || "test@example.com",
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "testpass"
  }
});

// Mock SMS function (in production, use Twilio or similar)
async function sendSMS(phone: string, message: string) {
  console.log(`SMS to ${phone}: ${message}`);
  // In production, implement actual SMS sending
  return true;
}

async function sendNotification(type: "email" | "sms", recipient: string, subject: string, message: string) {
  try {
    if (type === "email") {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || "support@hospital.com",
        to: recipient,
        subject,
        text: message,
        html: `<p>${message}</p>`
      });
    } else if (type === "sms") {
      await sendSMS(recipient, `${subject}: ${message}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to send ${type} notification:`, error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all support requests
  app.get("/api/support-requests", async (req, res) => {
    try {
      const requests = await storage.getSupportRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      res.status(500).json({ message: "Failed to fetch support requests" });
    }
  });

  // Get single support request
  app.get("/api/support-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getSupportRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Support request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching support request:", error);
      res.status(500).json({ message: "Failed to fetch support request" });
    }
  });

  // Create new support request
  app.post("/api/support-requests", async (req, res) => {
    try {
      const validatedData = insertSupportRequestSchema.parse(req.body);
      const request = await storage.createSupportRequest(validatedData);
      
      // Send notifications to available technicians
      const technicians = await storage.getTechnicians();
      const availableTechs = technicians.filter(tech => tech.status === "available");
      
      const notificationMessage = `New ${request.priority} priority support request for device ${request.serialNumber} in ${request.location}. Description: ${request.description}`;
      
      // Send email notifications
      for (const tech of availableTechs) {
        await sendNotification(
          "email",
          tech.email,
          `Urgent: New Support Request #${request.id}`,
          notificationMessage
        );
        
        // Send SMS for high priority requests
        if (request.priority === "high" && tech.phone) {
          await sendNotification(
            "sms",
            tech.phone,
            `URGENT Support Request`,
            `Device ${request.serialNumber} in ${request.location} needs immediate attention.`
          );
        }
      }
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating support request:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ message: "Validation error", details: error.issues });
      }
      res.status(500).json({ message: "Failed to create support request" });
    }
  });

  // Update support request
  app.patch("/api/support-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateSupportRequest(id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Support request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error updating support request:", error);
      res.status(500).json({ message: "Failed to update support request" });
    }
  });

  // Get all technicians
  app.get("/api/technicians", async (req, res) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  // Update technician status
  app.patch("/api/technicians/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const technician = await storage.updateTechnician(id, req.body);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.json(technician);
    } catch (error) {
      console.error("Error updating technician:", error);
      res.status(500).json({ message: "Failed to update technician" });
    }
  });

  // Get knowledge base articles
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const articles = await storage.getKnowledgeBaseArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge base articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base articles" });
    }
  });

  // Get system status
  app.get("/api/system-status", async (req, res) => {
    try {
      const notifications = await storage.getSystemNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const requests = await storage.getSupportRequests();
      const technicians = await storage.getTechnicians();
      
      const activeRequests = requests.filter(r => r.status === "open" || r.status === "in_progress").length;
      const urgentRequests = requests.filter(r => r.priority === "high" && r.status !== "resolved" && r.status !== "closed").length;
      const availableTechs = technicians.filter(t => t.status === "available").length;
      
      // Calculate average response time (mock calculation)
      const avgResponseTimeMinutes = 4.2;
      
      res.json({
        activeRequests,
        urgentRequests,
        availableTechs,
        totalTechs: technicians.length,
        avgResponseTime: `${avgResponseTimeMinutes}min`
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Whaticket integration endpoint
  app.post("/api/whaticket/webhook", async (req, res) => {
    try {
      const { message, phone, deviceSerial } = req.body;
      
      // Create support request from Whaticket message
      const supportRequest = {
        serialNumber: deviceSerial || "Unknown",
        priority: "medium" as const,
        description: `Request via Whaticket: ${message}`,
        location: "Remote/Whaticket",
        contactNumber: phone,
        submittedBy: "Whaticket Bot"
      };
      
      const request = await storage.createSupportRequest(supportRequest);
      
      res.json({ 
        success: true, 
        requestId: request.id,
        message: `Support request #${request.id} created successfully` 
      });
    } catch (error) {
      console.error("Error processing Whaticket webhook:", error);
      res.status(500).json({ message: "Failed to process Whaticket request" });
    }
  });

  // Emergency alert endpoint
  app.post("/api/emergency-alert", async (req, res) => {
    try {
      const { message, location } = req.body;
      
      // Send emergency alerts to all available technicians
      const technicians = await storage.getTechnicians();
      const availableTechs = technicians.filter(tech => tech.status === "available");
      
      const emergencyMessage = `EMERGENCY ALERT: ${message} at ${location}. Immediate response required.`;
      
      for (const tech of availableTechs) {
        await sendNotification("email", tech.email, "EMERGENCY ALERT", emergencyMessage);
        if (tech.phone) {
          await sendNotification("sms", tech.phone, "EMERGENCY", emergencyMessage);
        }
      }
      
      res.json({ success: true, message: "Emergency alerts sent to all available technicians" });
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
