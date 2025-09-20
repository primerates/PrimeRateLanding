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
      console.log("Pre-approval request body:", JSON.stringify(req.body, null, 2));
      
      const { preApprovalData, coBorrowerData } = req.body;
      
      // Check if preApprovalData exists
      if (!preApprovalData) {
        console.error("preApprovalData is missing from request body");
        return res.status(400).json({ success: false, message: "Pre-approval data is required" });
      }
      
      console.log("Pre-approval data:", JSON.stringify(preApprovalData, null, 2));
      console.log("Co-borrower data:", JSON.stringify(coBorrowerData, null, 2));
      
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
      console.error("Pre-approval submission error:", error);
      console.error("Error stack:", error.stack);
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

  const httpServer = createServer(app);

  return httpServer;
}
