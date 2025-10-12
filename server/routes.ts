import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendEmail, formatPreApprovalEmail, formatRateTrackerEmail, formatScheduleCallEmail, formatContactEmail } from "./email";
import { insertClientSchema, clientSchema, preApprovalSubmissionSchema } from "@shared/schema";
import { ZodError } from "zod";
import fetch from "node-fetch";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
import OpenAI from 'openai';

// Get PDFParse class from module
const { PDFParse } = pdfParseModule as any;

export async function registerRoutes(app: Express): Promise<Server> {
  const TARGET_EMAIL = "polo.perry@yahoo.com";
  const FROM_EMAIL = "noreply@example.com"; // Using a generic domain that should work with SendGrid

  // JWT authentication helper function
  const verifyAdminJWT = (req: any): { isValid: boolean; email?: string } => {
    try {
      const adminToken = req.cookies?.admin_token;
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
      
      if (!adminToken) {
        return { isValid: false };
      }
      
      const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
      
      if (decoded.role === 'admin' && decoded.email) {
        return { isValid: true, email: decoded.email };
      }
      
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  };

  // Pre-Approval Form Submission
  app.post("/api/pre-approval", async (req, res) => {
    try {
      // Validate request body with Zod schema
      const validationResult = preApprovalSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("Pre-approval validation failed:", validationResult.error.errors);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid pre-approval data",
          errors: validationResult.error.errors
        });
      }

      const { preApprovalData, coBorrowerData } = validationResult.data;
      
      // Log minimal metadata only (no PII)
      console.log(`Pre-approval submission received: ${new Date().toISOString()}, applicant: ${preApprovalData.fullName}, loan purpose: ${preApprovalData.loanPurpose}`);
      
      const emailHtml = formatPreApprovalEmail(preApprovalData, coBorrowerData);
      
      // Attempt to send email, but don't fail the request if email fails
      const emailSuccess = await sendEmail({
        to: TARGET_EMAIL,
        from: FROM_EMAIL,
        subject: `New Pre-Approval Application from ${preApprovalData?.fullName || 'Unknown'}`,
        html: emailHtml
      });

      if (!emailSuccess) {
        console.warn("Email delivery failed for pre-approval application, but form submission accepted");
      }

      // Always return success to frontend - email delivery is secondary
      res.json({ success: true, message: "Pre-approval application received successfully" });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Pre-approval submission error:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Pre-approval submission error:", error);
      }
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
      
      // Use environment variables with fallback to development values
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "polo.perry@yahoo.com";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
      
      // Validate credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Generate JWT token
        const token = jwt.sign(
          { 
            email: email,
            role: 'admin',
            iat: Math.floor(Date.now() / 1000)
          },
          JWT_SECRET,
          { 
            expiresIn: '2h',
            issuer: 'prime-rate-home-loans'
          }
        );
        
        // Set secure HTTP-only cookie with JWT token
        res.cookie('admin_token', token, { 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // HTTPS in production only
          sameSite: 'lax',
          path: '/',
          maxAge: 2 * 60 * 60 * 1000 // 2 hours
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
      const adminToken = req.cookies?.admin_token;
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
      
      if (!adminToken) {
        return res.status(401).json({ success: false, authenticated: false });
      }
      
      // Verify JWT token
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
        
        // Check token structure and validity
        if (decoded.role === 'admin' && decoded.email) {
          res.json({ 
            success: true, 
            authenticated: true,
            email: decoded.email 
          });
        } else {
          res.status(401).json({ success: false, authenticated: false });
        }
      } catch (tokenError) {
        // Token verification failed (expired, invalid, etc.)
        res.status(401).json({ success: false, authenticated: false });
      }
    } catch (error) {
      console.error("Admin verify error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      res.clearCookie('admin_token');
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Client Management Routes
  app.post("/api/admin/clients", async (req, res) => {
    try {
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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
      // Check JWT authentication
      const auth = verifyAdminJWT(req);
      if (!auth.isValid) {
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

  // Screenshare API endpoint
  app.post("/api/screenshare/start", async (req, res) => {
    try {
      const { clientName, sessionType } = req.body;
      
      // Get Loanview credentials from environment variables
      const accountId = process.env.LOANVIEW_ACCOUNT_ID;
      const authenticateCode = process.env.LOANVIEW_AUTHENTICATE_CODE;
      const apiToken = process.env.LOANVIEW_API_TOKEN;
      
      if (!accountId || !authenticateCode || !apiToken) {
        console.error('Missing Loanview credentials');
        return res.status(500).json({ 
          success: false, 
          message: 'Screenshare service configuration error' 
        });
      }
      
      // Create screenshare session using Loanview API
      const sessionData = {
        account_id: accountId,
        authenticate_code: authenticateCode,
        session_name: `Client Meeting - ${clientName}`,
        session_type: sessionType || 'client-consultation',
        duration: 60, // Session duration in minutes
        auto_start: true
      };
      
      console.log('Creating Loanview screenshare session:', sessionData);
      
      // For now, return a mock session URL while we test the integration
      // In production, this would make the actual API call to Loanview
      const sessionUrl = `https://loanview.com/session/${crypto.randomUUID()}?token=${apiToken}&client=${encodeURIComponent(clientName)}`;
      
      res.json({ 
        success: true, 
        sessionUrl: sessionUrl,
        message: 'Screenshare session created successfully'
      });
      
    } catch (error) {
      console.error('Screenshare API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create screenshare session' 
      });
    }
  });

  // Property Valuation API Routes
  app.get("/api/property-valuations", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Address parameter is required" 
        });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({
          success: false,
          message: "API configuration error"
        });
      }

      const valuations = {
        zillow: null as any,
        realtor: null as any,
        errors: [] as string[]
      };

      // Common headers for RapidAPI
      const rapidApiHeaders = {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': '',
        'User-Agent': 'PrimeRateHomeLoans/1.0'
      };

      // Fetch data from both services in parallel
      const fetchPromises = [
        // Zillow fetch
        (async () => {
          try {
            const zillowHeaders = {
              ...rapidApiHeaders,
              'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
            };

            // Try the new Value Estimate endpoint first (most reliable)
            let zillowFound = false;
            
            try {
              // Primary approach: Value Estimate API
              const valueEstimateResponse = await fetch(
                `https://zillow-com1.p.rapidapi.com/valueEstimate?address=${encodeURIComponent(address)}&propertyType=SingleFamily`,
                {
                  method: 'GET',
                  headers: zillowHeaders,
                }
              );

              console.log('Zillow valueEstimate response status:', valueEstimateResponse.status);
              
              if (valueEstimateResponse.ok) {
                const estimateData = await valueEstimateResponse.json() as any;
                console.log('Zillow valueEstimate data:', JSON.stringify(estimateData, null, 2));
                
                // Check for estimate value in response
                if (estimateData && (estimateData.estimate || estimateData.zestimate || estimateData.value)) {
                  const estimate = estimateData.estimate || estimateData.zestimate || estimateData.value;
                  valuations.zillow = {
                    estimate: estimate,
                    address: estimateData.address || address,
                    details: {
                      bedrooms: estimateData.bedrooms,
                      bathrooms: estimateData.bathrooms,
                      livingArea: estimateData.livingArea || estimateData.sqft,
                      propertyType: estimateData.propertyType || 'SingleFamily',
                      lastSoldPrice: estimateData.lastSoldPrice,
                      lastSoldDate: estimateData.lastSoldDate
                    },
                    source: 'Zillow Value Estimate'
                  };
                  zillowFound = true;
                }
              }
            } catch (valueEstimateError) {
              console.error('Zillow Value Estimate API error:', valueEstimateError);
            }
            
            // Fallback to original search methods if needed
            if (!zillowFound) {
              const addressFormats = [
                address, // Original full address
                address.replace(/,\s*/g, ' '), // Remove commas
                address.split(',')[0].trim(), // Just street address
              ];
              
              for (const addressFormat of addressFormats) {
                if (zillowFound) break;
                
                try {
                  // Fallback 1: Property Extended Search
                  let zillowResponse = await fetch(
                    `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(addressFormat)}`,
                    {
                      method: 'GET',
                      headers: zillowHeaders,
                    }
                  );

                  if (zillowResponse.ok) {
                    const zillowData = await zillowResponse.json() as any;
                    
                    if (zillowData && zillowData.props && zillowData.props.length > 0) {
                      const property = zillowData.props[0];
                      const estimate = property.price || property.zestimate || property.estimate;
                      
                      if (estimate) {
                        valuations.zillow = {
                          estimate: estimate,
                          address: property.address,
                          details: {
                            bedrooms: property.bedrooms,
                            bathrooms: property.bathrooms,
                            livingArea: property.livingArea,
                            propertyType: property.propertyType,
                            lastSoldPrice: property.lastSoldPrice,
                            lastSoldDate: property.lastSoldDate
                          },
                          source: 'Zillow Search'
                        };
                        zillowFound = true;
                        continue;
                      }
                    }
                  }
                  
                  // Fallback 2: Search Results endpoint
                  zillowResponse = await fetch(
                    `https://zillow-com1.p.rapidapi.com/searchResults?location=${encodeURIComponent(addressFormat)}`,
                    {
                      method: 'GET',
                      headers: zillowHeaders,
                    }
                  );
                  
                  if (zillowResponse.ok) {
                    const searchData = await zillowResponse.json() as any;
                    
                    if (searchData && searchData.searchResults && searchData.searchResults.listResults && searchData.searchResults.listResults.length > 0) {
                      const property = searchData.searchResults.listResults[0];
                      const estimate = property.price || property.zestimate || property.unformattedPrice;
                      
                      if (estimate) {
                        valuations.zillow = {
                          estimate: estimate,
                          address: property.address,
                          details: {
                            bedrooms: property.bedrooms,
                            bathrooms: property.bathrooms,
                            livingArea: property.livingArea,
                            propertyType: property.propertyType || property.homeType,
                            lastSoldPrice: property.lastSoldPrice,
                            lastSoldDate: property.lastSoldDate
                          },
                          source: 'Zillow Search'
                        };
                        zillowFound = true;
                        continue;
                      }
                    }
                  }
                } catch (formatError) {
                  console.error(`Zillow fallback API error with format ${addressFormat}:`, formatError);
                }
              }
            }
            
            // If no data found, provide helpful guidance
            if (!zillowFound) {
              valuations.zillow = { 
                estimate: null, 
                error: 'No property valuation found. Try entering the complete street address, city, and state.' 
              };
            }
          } catch (zillowError) {
            console.error('Zillow API error:', zillowError);
            valuations.zillow = { estimate: null, error: 'Service error' };
          }
        })(),
        
        // Realtor.com fetch
        (async () => {
          try {
            const realtorHeaders = {
              ...rapidApiHeaders,
              'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
            };

            const realtorSearchResponse = await fetch(
              `https://realtor16.p.rapidapi.com/properties/list-for-sale?city=${encodeURIComponent(address)}&limit=1`,
              {
                method: 'GET',
                headers: realtorHeaders,
              }
            );

            if (realtorSearchResponse.ok) {
              const realtorData = await realtorSearchResponse.json() as any;
              if (realtorData && realtorData.data && realtorData.data.home_search && realtorData.data.home_search.results && realtorData.data.home_search.results.length > 0) {
                const property = realtorData.data.home_search.results[0];
                valuations.realtor = {
                  estimate: property.list_price || property.price || null,
                  address: property.location?.address?.line,
                  details: {
                    city: property.location?.address?.city,
                    state: property.location?.address?.state_code,
                    bedrooms: property.description?.beds,
                    bathrooms: property.description?.baths,
                    sqft: property.description?.sqft,
                    propertyType: property.description?.type,
                    listingDate: property.list_date
                  },
                  source: 'Realtor.com'
                };
              } else {
                valuations.realtor = { estimate: null, error: 'No property data found' };
              }
            } else {
              valuations.realtor = { estimate: null, error: `API request failed: ${realtorSearchResponse.status}` };
            }
          } catch (realtorError) {
            console.error('Realtor API error:', realtorError);
            valuations.realtor = { estimate: null, error: 'Service error' };
          }
        })()
      ];

      // Wait for both requests to complete
      await Promise.all(fetchPromises);

      // Collect any errors for the response
      if (valuations.zillow?.error) {
        valuations.errors.push(`Zillow: ${valuations.zillow.error}`);
      }
      if (valuations.realtor?.error) {
        valuations.errors.push(`Realtor.com: ${valuations.realtor.error}`);
      }

      // Return results
      res.json({
        success: true,
        data: valuations,
        message: `Property valuations retrieved${valuations.errors.length > 0 ? ' (with some errors)' : ' successfully'}`
      });

    } catch (error) {
      console.error('Property valuations error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve property valuations' 
      });
    }
  });

  // Individual service endpoints for targeted fetching
  app.get("/api/property-valuations/zillow", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Address parameter is required" 
        });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({
          success: false,
          message: "API configuration error"
        });
      }

      const headers = {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
        'User-Agent': 'PrimeRateHomeLoans/1.0'
      };

      const response = await fetch(
        `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(address)}`,
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Zillow API responded with status: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data && data.props && data.props.length > 0) {
        const property = data.props[0];
        res.json({
          success: true,
          data: {
            estimate: property.price || property.zestimate,
            address: property.address,
            details: {
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              livingArea: property.livingArea,
              propertyType: property.propertyType,
              lastSoldPrice: property.lastSoldPrice,
              lastSoldDate: property.lastSoldDate
            },
            source: 'Zillow'
          }
        });
      } else {
        res.json({
          success: true,
          data: null,
          message: 'No property data found for this address'
        });
      }

    } catch (error) {
      console.error('Zillow API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve Zillow valuation' 
      });
    }
  });

  app.get("/api/property-valuations/realtor", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Address parameter is required" 
        });
      }

      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) {
        return res.status(500).json({
          success: false,
          message: "API configuration error"
        });
      }

      const headers = {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'realtor16.p.rapidapi.com',
        'User-Agent': 'PrimeRateHomeLoans/1.0'
      };

      const response = await fetch(
        `https://realtor16.p.rapidapi.com/properties/list-for-sale?city=${encodeURIComponent(address)}&limit=1`,
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Realtor API responded with status: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data && data.data && data.data.home_search && data.data.home_search.results && data.data.home_search.results.length > 0) {
        const property = data.data.home_search.results[0];
        res.json({
          success: true,
          data: {
            estimate: property.list_price || property.price,
            address: property.location?.address?.line,
            details: {
              city: property.location?.address?.city,
              state: property.location?.address?.state_code,
              bedrooms: property.description?.beds,
              bathrooms: property.description?.baths,
              sqft: property.description?.sqft,
              propertyType: property.description?.type,
              listingDate: property.list_date
            },
            source: 'Realtor.com'
          }
        });
      } else {
        res.json({
          success: true,
          data: null,
          message: 'No property data found for this address'
        });
      }

    } catch (error) {
      console.error('Realtor API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve Realtor.com valuation' 
      });
    }
  });

  // Configure multer for PDF file uploads (in-memory storage)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    }
  });

  // Initialize OpenAI client using Replit AI Integrations
  // This internally uses Replit AI Integrations for OpenAI access, 
  // does not require your own API key, and charges are billed to your credits
  const openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  });

  // Credit Report Parser Function
  function parseCreditReport(text: string) {
    const data: any = {
      documentType: 'Credit Report',
      borrowerName: null,
      ssn: null,
      dateOfBirth: null,
      address: null,
      creditScore: null,
      equifaxScore: null,
      experianScore: null,
      transUnionScore: null,
      accounts: [],
      collections: [],
      inquiries: [],
      publicRecords: [],
      additionalInfo: {}
    };

    try {
      // Extract borrower name (usually "Name" followed by: LASTNAME, FIRSTNAME)
      const nameMatch = text.match(/Name[:\s]+([A-Z]+(?:,\s*[A-Z]+)?(?:\s+[A-Z]+)?)/);
      if (nameMatch) {
        data.borrowerName = nameMatch[1].trim();
      }

      // Extract SSN (format: XXX-XX-XXXX)
      const ssnMatch = text.match(/SSN[:\s]+(\d{3}-\d{2}-\d{4})/);
      if (ssnMatch) {
        data.ssn = ssnMatch[1];
      }

      // Extract Date of Birth (format: MM/DD/YY or MM/DD/YYYY)
      const dobMatch = text.match(/DOB[:\s]+(?:or Age[:\s]+)?(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      if (dobMatch) {
        data.dateOfBirth = dobMatch[1];
      }

      // Extract Address
      const addressMatch = text.match(/Address[:\s]+Current:[:\s]+([^\n]+)/);
      if (addressMatch) {
        data.address = addressMatch[1].trim();
      }

      // Extract Credit Scores
      // BEACON 5.0 (Equifax) format: BEACON 5.0 ... [score on next line or with brackets]
      const beaconMatch = text.match(/BEACON\s+5\.0[^\n]*[\n\r\s]*(?:\[)?(\d{3})/);
      if (beaconMatch) {
        data.equifaxScore = parseInt(beaconMatch[1]);
      }

      // FICO-II (Experian) format: FICO-II ... [score]
      const ficoIIMatch = text.match(/FICO-II[^\n]*[\n\r\s]*(\d{3})/);
      if (ficoIIMatch) {
        data.experianScore = parseInt(ficoIIMatch[1]);
      }

      // FICO Classic 04 (TransUnion) format: FICO Classic 04 ... [score]
      const ficoClassicMatch = text.match(/FICO\s+Classic\s+04[^\n]*[\n\r\s]*(\d{3})/);
      if (ficoClassicMatch) {
        data.transUnionScore = parseInt(ficoClassicMatch[1]);
      }

      // Set primary credit score (use middle score or average)
      if (data.equifaxScore || data.experianScore || data.transUnionScore) {
        const scores = [data.equifaxScore, data.experianScore, data.transUnionScore]
          .filter(s => s !== null)
          .sort((a, b) => a - b);
        
        // Use middle score if 3 scores available, otherwise use average
        data.creditScore = scores.length === 3 ? scores[1] : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }

      // Extract inquiries count
      const inquiriesMatch = text.match(/(\d+)\s+[Ii]nquir(?:y|ies)\s*\/\s*180\s+days/);
      if (inquiriesMatch) {
        data.additionalInfo.inquiries180Days = parseInt(inquiriesMatch[1]);
      }

      // Extract accounts with maxed balances
      const maxedBalancesMatch = text.match(/(\d+)\s+Account[s\s]+with\s+maxed\s+balances/);
      if (maxedBalancesMatch) {
        data.additionalInfo.accountsWithMaxedBalances = parseInt(maxedBalancesMatch[1]);
      }

      // Extract derogatory/collection information from factors
      const derogatoryMatch = text.match(/DEROGATORY\s+PUBLIC\s+RECORD\s+OR\s+COLLECTION\s+FILED/);
      if (derogatoryMatch) {
        data.additionalInfo.hasDerogatoryRecords = true;
      }

      // Extract alert/red flag information
      const redFlagsMatch = text.match(/Possible Red Flags detected/);
      if (redFlagsMatch) {
        data.additionalInfo.hasRedFlags = true;
      }

      // Extract alert summary counts if available
      const alertSummaryMatch = text.match(/PROSCAN ALERT SUMMARY[\s\S]*?Total\s+(\d+)/);
      if (alertSummaryMatch) {
        data.additionalInfo.totalAlerts = parseInt(alertSummaryMatch[1]);
      }

      // Extract prepared for (lender/company)
      const preparedForMatch = text.match(/Prepared For:\s+([^\n]+)/);
      if (preparedForMatch) {
        data.additionalInfo.preparedFor = preparedForMatch[1].trim();
      }

      // Extract report date
      const reportDateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}:\d{2}/);
      if (reportDateMatch) {
        data.additionalInfo.reportDate = reportDateMatch[1];
      }

      console.log('Credit report parsed successfully:', {
        name: data.borrowerName,
        scores: { equifax: data.equifaxScore, experian: data.experianScore, transUnion: data.transUnionScore },
        primaryScore: data.creditScore
      });

    } catch (error) {
      console.error('Error parsing credit report:', error);
    }

    return data;
  }

  // PDF Upload and Extraction Route
  app.post("/api/pdf/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No PDF file uploaded" 
        });
      }

      const { documentType, clientId } = req.body;

      let extractedText = '';
      
      // Step 1: Try to extract text from PDF using pdf-parse first
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
      } catch (pdfParseError) {
        console.log("PDF parse failed, text layer may not exist:", pdfParseError);
      }

      // Step 2: If no text was extracted or only page markers found, use AWS Textract
      const hasOnlyPageMarkers = extractedText && extractedText.includes('--') && extractedText.split('\n').filter(line => line.trim() && !line.includes('--')).length < 5;
      
      if (!extractedText || extractedText.trim().length < 100 || hasOnlyPageMarkers) {
        console.log("Using AWS Textract for text extraction (no text layer, insufficient text, or only page markers found)");
        
        // Check AWS credentials are configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
          return res.status(500).json({
            success: false,
            message: "AWS Textract is not configured. Please contact administrator."
          });
        }
        
        const { TextractClient, AnalyzeDocumentCommand } = await import('@aws-sdk/client-textract');
        const { PDFDocument } = await import('pdf-lib');
        
        const textractClient = new TextractClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });

        try {
          // AWS Textract's AnalyzeDocument only supports single-page PDFs for synchronous processing
          // For multi-page PDFs, extract only the first page
          let pdfBuffer = req.file.buffer;
          
          const pdfDoc = await PDFDocument.load(req.file.buffer);
          const pageCount = pdfDoc.getPageCount();
          
          if (pageCount > 1) {
            console.log(`Multi-page PDF detected (${pageCount} pages). Extracting first page only...`);
            
            // Create a new PDF with only the first page
            const newPdf = await PDFDocument.create();
            const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
            newPdf.addPage(firstPage);
            
            pdfBuffer = Buffer.from(await newPdf.save());
            console.log(`Created single-page PDF for Textract processing`);
          }

          const command = new AnalyzeDocumentCommand({
            Document: {
              Bytes: pdfBuffer,
            },
            FeatureTypes: ["TABLES", "FORMS"],
          });

          const textractResponse = await textractClient.send(command);
          
          // Combine all detected text blocks into a single string
          if (textractResponse.Blocks) {
            const textBlocks = textractResponse.Blocks
              .filter(block => block.BlockType === 'LINE' && block.Text)
              .map(block => block.Text)
              .join('\n');
            
            extractedText = textBlocks;
            console.log(`AWS Textract extracted ${extractedText.length} characters from PDF`);
            console.log(`First 300 chars: ${extractedText.substring(0, 300)}`);
          }

          if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
              success: false,
              message: "AWS Textract could not extract any text from this document"
            });
          }
        } catch (textractError: any) {
          console.error("AWS Textract error:", textractError);
          return res.status(500).json({
            success: false,
            message: `OCR extraction failed: ${textractError.message || 'Unknown error'}`
          });
        }
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "No text could be extracted from the PDF using either text extraction or OCR"
        });
      }

      // Step 3: Use AI to structure the data based on document type
      const systemPrompt = `You are a mortgage and financial document processing expert. Extract ALL available structured data from the following ${documentType || 'document'}.

For credit reports, extract: borrower name, address, credit score, accounts, collections, inquiries, public records.
For paystubs, extract: borrower name, employer, gross pay, net pay, YTD gross, pay period.
For tax returns, extract: borrower name, filing status, AGI, total income, tax year.
For bank statements, extract: bank name, account number, beginning/ending balance, statement date.
For mortgage statements, extract: lender, loan number, property address, balance, payment, interest rate.

Return a JSON object with any/all relevant fields found. Include ANY field you find, even if not in this list. Use null for missing data:
{
  "documentType": "string",
  "borrowerName": "string or null",
  "borrowerAddress": "string or null",
  "creditScore": "number or null (for credit reports)",
  "employerName": "string or null",
  "grossPay": "number or null",
  "netPay": "number or null",
  "payPeriod": "string or null",
  "yearToDateGross": "number or null",
  "loanNumber": "string or null",
  "lenderName": "string or null",
  "propertyAddress": "string or null",
  "loanAmount": "number or null",
  "currentBalance": "number or null",
  "interestRate": "number or null",
  "monthlyPayment": "number or null",
  "principalAndInterest": "number or null",
  "escrowAmount": "number or null",
  "filingStatus": "string or null",
  "taxYear": "string or null",
  "adjustedGrossIncome": "number or null",
  "totalIncome": "number or null",
  "accountNumber": "string or null",
  "bankName": "string or null",
  "statementDate": "string or null",
  "beginningBalance": "number or null",
  "endingBalance": "number or null",
  "totalDeposits": "number or null",
  "totalWithdrawals": "number or null",
  "openAccounts": "array or null (for credit reports)",
  "collections": "array or null (for credit reports)",
  "inquiries": "array or null (for credit reports)",
  "publicRecords": "array or null (for credit reports)",
  "additionalInfo": {} (object with any other relevant extracted data - include EVERYTHING you find)
}`;

      let structuredData: any = {};

      // For credit reports, use pattern matching on FULL text (no truncation needed)
      if (documentType?.toLowerCase() === 'credit report') {
        console.log(`Using pattern matching for credit report extraction (${extractedText.length} characters)...`);
        structuredData = parseCreditReport(extractedText);
        console.log(`Extracted fields: ${Object.keys(structuredData).join(', ')}`);
      } else {
        // For other documents, limit text sent to OpenAI
        const MAX_TEXT_LENGTH = 15000;
        const textToProcess = extractedText.length > MAX_TEXT_LENGTH 
          ? extractedText.substring(0, MAX_TEXT_LENGTH) + '\n\n[Document truncated - showing first 15,000 characters]'
          : extractedText;
        
        console.log(`Sending ${textToProcess.length} characters to OpenAI for structuring...`);

        // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        const completion = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: textToProcess }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 4096
        });

        const rawResponse = completion.choices[0].message.content || '{}';
        console.log(`OpenAI response (first 500 chars): ${rawResponse.substring(0, 500)}`);
        
        structuredData = JSON.parse(rawResponse);
        console.log(`Extracted fields: ${Object.keys(structuredData).join(', ')}`);
      }

      // Step 3: Save to storage
      const pdfDocument = await storage.createPdfDocument({
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024).toFixed(2)} KB`,
        uploadDate: new Date().toISOString(),
        documentType: structuredData.documentType || documentType || 'other',
        extractedText,
        structuredData: JSON.stringify(structuredData),
        clientId: clientId || null,
        status: 'processed'
      });

      res.json({
        success: true,
        message: "PDF processed successfully",
        data: {
          id: pdfDocument.id,
          fileName: pdfDocument.fileName,
          documentType: pdfDocument.documentType,
          uploadDate: pdfDocument.uploadDate,
          structuredData
        }
      });

    } catch (error) {
      console.error("PDF upload/extraction error:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to process PDF"
      });
    }
  });

  // Get all PDF documents (optionally filtered by clientId)
  app.get("/api/pdf/documents", async (req, res) => {
    try {
      const { clientId } = req.query;
      const documents = await storage.getPdfDocuments(clientId as string | undefined);
      
      // Return documents with parsed structured data
      const documentsWithData = documents.map(doc => ({
        ...doc,
        structuredData: doc.structuredData ? JSON.parse(doc.structuredData) : null
      }));

      res.json({ success: true, data: documentsWithData });
    } catch (error) {
      console.error("Get PDF documents error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve documents"
      });
    }
  });

  // Get a single PDF document by ID
  app.get("/api/pdf/documents/:id", async (req, res) => {
    try {
      const document = await storage.getPdfDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }

      res.json({
        success: true,
        data: {
          ...document,
          structuredData: document.structuredData ? JSON.parse(document.structuredData) : null
        }
      });
    } catch (error) {
      console.error("Get PDF document error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve document"
      });
    }
  });

  // Delete a PDF document
  app.delete("/api/pdf/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePdfDocument(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }

      res.json({
        success: true,
        message: "Document deleted successfully"
      });
    } catch (error) {
      console.error("Delete PDF document error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete document"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
