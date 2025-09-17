import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Address schema for reusable address components
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  unit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
});

// Client Management Schema
export const borrowerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(1, "SSN is required"),
  residenceAddress: addressSchema,
  yearsAtAddress: z.string().min(1, "Years at address is required"),
  subjectProperty: addressSchema.partial().optional(),
  leadRef: z.string().optional(),
  callDate: z.string().optional(),
  startDate: z.string().optional(),
});

export const incomeSchema = z.object({
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.string().optional(),
  yearsEmployed: z.string().optional(),
  additionalIncome: z.string().optional(),
  incomeSource: z.string().optional(),
});

export const propertySchema = z.object({
  propertyAddress: addressSchema.partial().optional(),
  propertyType: z.enum(["single-family", "condo", "townhouse", "multi-family", "land", ""]).optional(),
  propertyValue: z.string().optional(),
  propertyUse: z.enum(["primary", "secondary", "investment", ""]).optional(),
  downPayment: z.string().optional(),
  purchasePrice: z.string().optional(),
});

export const currentLoanSchema = z.object({
  currentLender: z.string().optional(),
  currentBalance: z.string().optional(),
  currentRate: z.string().optional(),
  currentPayment: z.string().optional(),
  loanType: z.string().optional(),
  remainingTerm: z.string().optional(),
});

export const newLoanSchema = z.object({
  loanAmount: z.string().optional(),
  loanProgram: z.string().optional(),
  interestRate: z.string().optional(),
  loanTerm: z.string().optional(),
  loanPurpose: z.enum(["purchase", "refinance", "cash-out", ""]).optional(),
  lockPeriod: z.string().optional(),
});

export const vendorsSchema = z.object({
  realtor: z.string().optional(),
  appraiser: z.string().optional(),
  titleCompany: z.string().optional(),
  inspector: z.string().optional(),
  insurance: z.string().optional(),
  attorney: z.string().optional(),
});

export const clientSchema = z.object({
  id: z.string().optional(),
  // Borrower Information
  borrower: borrowerInfoSchema,
  coBorrower: borrowerInfoSchema.partial().optional(),
  // Additional Categories
  income: incomeSchema.optional(),
  coBorrowerIncome: incomeSchema.optional(),
  property: propertySchema.optional(),
  currentLoan: currentLoanSchema.optional(),
  newLoan: newLoanSchema.optional(),
  vendors: vendorsSchema.optional(),
  // Metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  status: z.enum(["active", "closed", "on-hold"]).default("active"),
});

export type Address = z.infer<typeof addressSchema>;
export type BorrowerInfo = z.infer<typeof borrowerInfoSchema>;
export type Income = z.infer<typeof incomeSchema>;
export type Property = z.infer<typeof propertySchema>;
export type CurrentLoan = z.infer<typeof currentLoanSchema>;
export type NewLoan = z.infer<typeof newLoanSchema>;
export type Vendors = z.infer<typeof vendorsSchema>;
export type Client = z.infer<typeof clientSchema>;

// Create insert schema (excluding auto-generated fields)
export const insertClientSchema = clientSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
