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
      
      const success = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Pre-Approval Application from ${preApprovalData.fullName}`,
        html: emailHtml
      });

      if (success) {
        res.json({ success: true, message: "Pre-approval application sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send pre-approval application" });
      }
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
      
      const success = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Rate Tracker Request from ${rateTrackerData.name}`,
        html: emailHtml
      });

      if (success) {
        res.json({ success: true, message: "Rate tracker request sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send rate tracker request" });
      }
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
      
      const success = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Call Schedule Request from ${scheduleCallData.name}`,
        html: emailHtml
      });

      if (success) {
        res.json({ success: true, message: "Call schedule request sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send call schedule request" });
      }
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
      
      const success = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: emailHtml
      });

      if (success) {
        res.json({ success: true, message: "Contact form sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send contact form" });
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
