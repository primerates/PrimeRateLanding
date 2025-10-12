import { type User, type InsertUser, type Client, type InsertClient, type PdfDocument, type InsertPdfDocument } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client management methods
  createClient(client: Client): Promise<Client>;
  getClient(id: string): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  updateClient(id: string, patch: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  searchClients(query: string): Promise<Client[]>;
  
  // PDF Document methods
  createPdfDocument(doc: InsertPdfDocument): Promise<PdfDocument>;
  getPdfDocument(id: string): Promise<PdfDocument | undefined>;
  getPdfDocuments(clientId?: string): Promise<PdfDocument[]>;
  deletePdfDocument(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private pdfDocuments: Map<string, PdfDocument>;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.pdfDocuments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client management methods
  async createClient(client: Client): Promise<Client> {
    if (!client.id) {
      client.id = randomUUID();
    }
    this.clients.set(client.id, client);
    return client;
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async updateClient(id: string, patch: Partial<Client>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) {
      return undefined;
    }

    // Deep merge the patch with existing client data
    const updatedClient: Client = {
      ...existing,
      ...patch,
      id: existing.id, // Always preserve the original ID
      status: patch.status ?? existing.status ?? 'active',
      updatedAt: new Date().toISOString(),
      // Deep merge borrower (required field)
      borrower: {
        ...existing.borrower,
        ...(patch.borrower ?? {}),
      },
      // Deep merge optional nested objects
      coBorrower: patch.coBorrower !== undefined ? {
        ...existing.coBorrower,
        ...patch.coBorrower,
      } : existing.coBorrower,
      income: patch.income !== undefined ? {
        ...existing.income,
        ...patch.income,
      } : existing.income,
      coBorrowerIncome: patch.coBorrowerIncome !== undefined ? {
        ...existing.coBorrowerIncome,
        ...patch.coBorrowerIncome,
      } : existing.coBorrowerIncome,
      property: patch.property !== undefined ? {
        ...existing.property,
        ...patch.property,
      } : existing.property,
      currentLoan: patch.currentLoan !== undefined ? {
        ...existing.currentLoan,
        ...patch.currentLoan,
      } : existing.currentLoan,
      newLoan: patch.newLoan !== undefined ? {
        ...existing.newLoan,
        ...patch.newLoan,
      } : existing.newLoan,
      vendors: patch.vendors !== undefined ? {
        ...existing.vendors,
        ...patch.vendors,
      } : existing.vendors,
    };

    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  async searchClients(query: string): Promise<Client[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.clients.values()).filter(client => {
      // Search in borrower information
      const borrower = client.borrower;
      if (borrower?.firstName?.toLowerCase().includes(lowerQuery) ||
          borrower?.lastName?.toLowerCase().includes(lowerQuery) ||
          borrower?.email?.toLowerCase().includes(lowerQuery) ||
          borrower?.phone?.includes(query)) {
        return true;
      }
      
      // Search in co-borrower information if it exists
      const coBorrower = client.coBorrower;
      if (coBorrower?.firstName?.toLowerCase().includes(lowerQuery) ||
          coBorrower?.lastName?.toLowerCase().includes(lowerQuery) ||
          coBorrower?.email?.toLowerCase().includes(lowerQuery) ||
          coBorrower?.phone?.includes(query)) {
        return true;
      }
      
      // Search in property address
      if (client.property?.propertyAddress?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
  }

  // PDF Document methods
  async createPdfDocument(doc: InsertPdfDocument): Promise<PdfDocument> {
    const id = randomUUID();
    const pdfDocument: PdfDocument = { 
      ...doc, 
      id,
      documentType: doc.documentType || null,
      fileSize: doc.fileSize || null,
      extractedText: doc.extractedText || null,
      structuredData: doc.structuredData || null,
      clientId: doc.clientId || null,
      status: doc.status || 'processed'
    };
    this.pdfDocuments.set(id, pdfDocument);
    return pdfDocument;
  }

  async getPdfDocument(id: string): Promise<PdfDocument | undefined> {
    return this.pdfDocuments.get(id);
  }

  async getPdfDocuments(clientId?: string): Promise<PdfDocument[]> {
    const allDocs = Array.from(this.pdfDocuments.values());
    if (clientId) {
      return allDocs.filter(doc => doc.clientId === clientId);
    }
    return allDocs;
  }

  async deletePdfDocument(id: string): Promise<boolean> {
    return this.pdfDocuments.delete(id);
  }
}

export const storage = new MemStorage();
