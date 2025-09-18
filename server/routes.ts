import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendEmail, formatPreApprovalEmail, formatRateTrackerEmail, formatScheduleCallEmail, formatContactEmail } from "./email";
import { insertClientSchema, clientSchema } from "@shared/schema";
import { ZodError } from "zod";
import fetch from "node-fetch";

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

  // County lookup from ZIP code
  app.get("/api/county-lookup/:zipCode", async (req, res) => {
    try {
      const { zipCode } = req.params;
      
      if (!zipCode || zipCode.length < 5) {
        return res.json({ success: true, counties: [] });
      }
      
      // First try FCC API directly with ZIP to get all possible counties
      try {
        const fccZipResponse = await fetch(`https://geo.fcc.gov/api/census/area?zip=${zipCode}&format=json`);
        if (fccZipResponse.ok) {
          const fccZipData = await fccZipResponse.json() as any;
          if (fccZipData.results && fccZipData.results.length > 0) {
            // Extract unique counties from all results
            const counties = new Map();
            
            fccZipData.results.forEach((result: any) => {
              if (result.county_name && result.county_fips && result.state_code) {
                const countyKey = `${result.county_fips}-${result.state_code}`;
                // Format county name properly - don't duplicate "County" if it already exists
                const baseCountyName = result.county_name.replace(/\s+County$/i, ''); // Remove existing "County" suffix
                const countyLabel = `${baseCountyName} County`; // Clean label without state
                counties.set(countyKey, {
                  value: result.county_fips,
                  label: countyLabel,
                  county_name: result.county_name,
                  state_code: result.state_code
                });
              }
            });
            
            if (counties.size > 0) {
              const countyList = Array.from(counties.values()).map((county: any) => ({
                value: county.value,
                label: county.label
              }));
              return res.json({ success: true, counties: countyList });
            }
          }
        }
      } catch (fccError) {
        console.warn('FCC ZIP lookup failed:', fccError);
      }
      
      // Fallback: Use Nominatim for geocoding, then FCC for county lookup
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&countrycodes=us&format=json&limit=3`,
        {
          headers: {
            'User-Agent': 'PrimeRateHomeLoans/1.0 (contact@primerateloans.com)'
          }
        }
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json() as any[];
        if (nominatimData && nominatimData.length > 0) {
          const counties = new Map();
          
          // Try multiple coordinate points if available
          for (const location of nominatimData.slice(0, 3)) {
            try {
              const { lat, lon } = location;
              const fccResponse = await fetch(`https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lon}&format=json`);
              
              if (fccResponse.ok) {
                const countyData = await fccResponse.json() as any;
                if (countyData.results && countyData.results.length > 0) {
                  countyData.results.forEach((result: any) => {
                    if (result.county_name && result.county_fips && result.state_code) {
                      const countyKey = `${result.county_fips}-${result.state_code}`;
                      // Format county name properly - don't duplicate "County" if it already exists
                      const baseCountyName = result.county_name.replace(/\s+County$/i, ''); // Remove existing "County" suffix
                      const countyLabel = `${baseCountyName} County`; // Clean label without state
                      counties.set(countyKey, {
                        value: result.county_fips,
                        label: countyLabel
                      });
                    }
                  });
                }
              }
              
              // Add small delay between requests to be respectful to APIs
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (coordError) {
              console.warn(`Error looking up county for coordinate ${location.lat}, ${location.lon}:`, coordError);
            }
          }
          
          if (counties.size > 0) {
            const countyList = Array.from(counties.values());
            return res.json({ success: true, counties: countyList });
          }
        }
      }
      
      // No counties found
      res.json({ success: true, counties: [] });
      
    } catch (error) {
      console.error('County lookup error:', error);
      res.status(500).json({ success: false, message: 'Failed to lookup county information' });
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
        
        console.log("Admin login successful");
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
      
      // Verify admin session without logging sensitive data
      
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

      // Validate request body with Zod schema
      const validationResult = insertClientSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid client data",
          errors: validationResult.error.errors
        });
      }

      const clientData = validationResult.data;
      
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
      
      // Validate request body with Zod schema (partial update allowed)
      const updateSchema = clientSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid client data",
          errors: validationResult.error.errors
        });
      }

      const clientData = validationResult.data;
      
      // Storage handles merging with existing data and setting timestamps
      const client = await storage.updateClient(id, clientData);
      
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
