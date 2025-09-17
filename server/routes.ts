import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendEmail, formatPreApprovalEmail, formatRateTrackerEmail, formatScheduleCallEmail, formatContactEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  const TARGET_EMAIL = "polo.perry@yahoo.com";
  const FROM_EMAIL = "noreply@example.com"; // Using a generic domain that should work with SendGrid

  // Pre-Approval Form Submission
  app.post("/api/pre-approval", async (req, res) => {
    try {
      const { preApprovalData, coBorrowerData } = req.body;
      
      const emailHtml = formatPreApprovalEmail(preApprovalData, coBorrowerData);
      
      // Attempt to send email, but don't fail the request if email fails
      const emailSuccess = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Pre-Approval Application from ${preApprovalData.fullName}`,
        html: emailHtml
      });

      if (!emailSuccess) {
        console.warn("Email delivery failed for pre-approval application, but form submission accepted");
      }

      // Always return success to frontend - email delivery is secondary
      res.json({ success: true, message: "Pre-approval application received successfully" });
    } catch (error) {
      console.error("Pre-approval submission error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Rate Tracker Form Submission
  app.post("/api/rate-tracker", async (req, res) => {
    try {
      const rateTrackerData = req.body;
      
      const emailHtml = formatRateTrackerEmail(rateTrackerData);
      
      // Attempt to send email, but don't fail the request if email fails
      const emailSuccess = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Rate Tracker Request from ${rateTrackerData.name}`,
        html: emailHtml
      });

      if (!emailSuccess) {
        console.warn("Email delivery failed for rate tracker request, but form submission accepted");
      }

      // Always return success to frontend - email delivery is secondary
      res.json({ success: true, message: "Rate tracker request received successfully" });
    } catch (error) {
      console.error("Rate tracker submission error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Schedule Call Form Submission
  app.post("/api/schedule-call", async (req, res) => {
    try {
      const scheduleCallData = req.body;
      
      const emailHtml = formatScheduleCallEmail(scheduleCallData);
      
      // Attempt to send email, but don't fail the request if email fails
      const emailSuccess = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Call Schedule Request from ${scheduleCallData.name}`,
        html: emailHtml
      });

      if (!emailSuccess) {
        console.warn("Email delivery failed for call schedule request, but form submission accepted");
      }

      // Always return success to frontend - email delivery is secondary
      res.json({ success: true, message: "Call schedule request received successfully" });
    } catch (error) {
      console.error("Schedule call submission error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Contact Form Submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = req.body;
      
      const emailHtml = formatContactEmail(contactData);
      
      // Attempt to send email, but don't fail the request if email fails
      const emailSuccess = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: emailHtml
      });

      if (!emailSuccess) {
        console.warn("Email delivery failed for contact form, but form submission accepted");
      }

      // Always return success to frontend - email delivery is secondary
      res.json({ success: true, message: "Contact form received successfully" });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Simple hardcoded authentication
      if (email === "polo.perry@yahoo.com" && password === "password") {
        // Set session/cookie for authentication
        // For development, use simpler cookie settings
        res.cookie('admin_session', 'authenticated', { 
          httpOnly: true,
          secure: false, // Allow over HTTP in development
          sameSite: 'lax',
          path: '/',
          maxAge: 2 * 60 * 60 * 1000 // 2 hours for better security
        });
        
        console.log("Login successful, cookie set for:", email);
        console.log("Cookie headers being sent:", res.getHeaders()['set-cookie']);
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/admin/verify", async (req, res) => {
    try {
      const adminSession = req.cookies?.admin_session;
      
      // Debug logging to see what we're getting
      console.log("Verify request cookies:", req.cookies);
      console.log("Verify request headers:", req.headers.cookie);
      console.log("Admin session cookie:", adminSession);
      
      if (adminSession === 'authenticated') {
        res.json({ success: true, authenticated: true });
      } else {
        res.status(401).json({ success: false, authenticated: false });
      }
    } catch (error) {
      console.error("Admin verify error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      res.clearCookie('admin_session');
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Client Management Routes
  app.post("/api/admin/clients", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const clientData = req.body;
      
      // Add timestamp and ID
      const client = {
        ...clientData,
        id: Date.now().toString(), // Simple ID generation for development
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store client using storage interface
      const savedClient = await storage.createClient(client);
      
      res.json({ success: true, data: savedClient, message: "Client added successfully" });
    } catch (error) {
      console.error("Add client error:", error);
      res.status(500).json({ success: false, message: "Failed to add client" });
    }
  });

  app.get("/api/admin/clients", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const clients = await storage.getClients();
      res.json({ success: true, data: clients });
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ success: false, message: "Failed to get clients" });
    }
  });

  app.get("/api/admin/clients/:id", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }
      
      res.json({ success: true, data: client });
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ success: false, message: "Failed to get client" });
    }
  });

  app.put("/api/admin/clients/:id", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const clientData = req.body;
      
      // Update timestamp
      const updatedClient = {
        ...clientData,
        id,
        updatedAt: new Date().toISOString(),
      };

      const client = await storage.updateClient(id, updatedClient);
      
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }
      
      res.json({ success: true, data: client, message: "Client updated successfully" });
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ success: false, message: "Failed to update client" });
    }
  });

  app.delete("/api/admin/clients/:id", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }
      
      res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ success: false, message: "Failed to delete client" });
    }
  });

  // Search clients
  app.get("/api/admin/clients/search/:query", async (req, res) => {
    try {
      // Check authentication
      const adminSession = req.cookies?.admin_session;
      if (adminSession !== 'authenticated') {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { query } = req.params;
      const clients = await storage.searchClients(query);
      res.json({ success: true, data: clients });
    } catch (error) {
      console.error("Search clients error:", error);
      res.status(500).json({ success: false, message: "Failed to search clients" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
