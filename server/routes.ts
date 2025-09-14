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

  const httpServer = createServer(app);

  return httpServer;
}
