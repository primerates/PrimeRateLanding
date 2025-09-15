import sgMail from '@sendgrid/mail';
import client from '@sendgrid/client';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

// Configure SendGrid for EU data residency
client.setApiKey(SENDGRID_API_KEY);
client.setDefaultRequest('baseUrl', 'https://api.eu.sendgrid.com/');
sgMail.setClient(client);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) {
      emailData.text = params.text;
    }
    
    if (params.html) {
      emailData.html = params.html;
    }
    
    await sgMail.send(emailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Format form data for email content
export function formatPreApprovalEmail(data: any, coBorrowerData?: any) {
  const html = `
    <h2>New Pre-Approval Application</h2>
    
    <h3>Borrower Information</h3>
    <p><strong>Name:</strong> ${data.fullName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>State:</strong> ${data.state}</p>
    
    <h3>Employment & Income</h3>
    <p><strong>Employment Status:</strong> ${data.employmentStatus}</p>
    <p><strong>Annual Income:</strong> $${data.annualIncome}</p>
    <p><strong>Years at Current Job:</strong> ${data.yearsAtJob}</p>
    
    <h3>Financial Information</h3>
    <p><strong>Monthly Debts:</strong> $${data.monthlyDebts}</p>
    <p><strong>Assets/Savings:</strong> $${data.assets}</p>
    
    <h3>Loan Details</h3>
    <p><strong>Desired Loan Amount:</strong> $${data.desiredLoanAmount}</p>
    <p><strong>Down Payment:</strong> $${data.downPayment}</p>
    <p><strong>Property Value:</strong> $${data.propertyValue}</p>
    
    <h3>Property Information</h3>
    <p><strong>Property Type:</strong> ${data.propertyType}</p>
    <p><strong>Intended Use:</strong> ${data.intendedUse}</p>
    <p><strong>Timeline to Purchase:</strong> ${data.timelineToPurchase}</p>
    
    ${data.additionalInfo ? `<h3>Additional Information</h3><p>${data.additionalInfo}</p>` : ''}
    
    ${coBorrowerData ? `
    <h3>Co-Borrower Information</h3>
    <p><strong>Name:</strong> ${coBorrowerData.fullName}</p>
    <p><strong>Email:</strong> ${coBorrowerData.email}</p>
    <p><strong>Phone:</strong> ${coBorrowerData.phone}</p>
    <p><strong>State:</strong> ${coBorrowerData.state}</p>
    <p><strong>Employment Status:</strong> ${coBorrowerData.employmentStatus}</p>
    <p><strong>Annual Income:</strong> $${coBorrowerData.annualIncome}</p>
    <p><strong>Years at Job:</strong> ${coBorrowerData.yearsAtJob}</p>
    <p><strong>Monthly Debts:</strong> $${coBorrowerData.monthlyDebts}</p>
    <p><strong>Assets:</strong> $${coBorrowerData.assets}</p>
    ` : ''}
  `;
  
  return html;
}

export function formatRateTrackerEmail(data: any) {
  const html = `
    <h2>New Rate Tracker Request</h2>
    
    <p><strong>Name:</strong> ${data.fullName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>State:</strong> ${data.state}</p>
    <p><strong>Property Type:</strong> ${data.propertyType}</p>
    <p><strong>Property Use:</strong> ${data.propertyUse}</p>
    <p><strong>Loan Type:</strong> ${data.loanType}</p>
    <p><strong>Loan Purpose:</strong> ${data.loanPurpose}</p>
    <p><strong>Current Rate:</strong> ${data.currentRate}</p>
    <p><strong>Track Interest Rate Of:</strong> ${data.trackInterestRate}</p>
    
    ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
  `;
  
  return html;
}

export function formatScheduleCallEmail(data: any) {
  const html = `
    <h2>New Call Schedule Request</h2>
    
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
    <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
    <p><strong>Time Zone:</strong> ${data.timeZone}</p>
    <p><strong>Call Reason:</strong> ${data.callReason}</p>
    
    ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
  `;
  
  return html;
}

export function formatContactEmail(data: any) {
  const html = `
    <h2>New Contact Form Submission</h2>
    
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Loan Type:</strong> ${data.loanType}</p>
    <p><strong>Message:</strong> ${data.message}</p>
  `;
  
  return html;
}