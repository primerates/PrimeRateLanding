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
    <p><strong>Name:</strong> ${data.fullName || 'Not provided'}</p>
    <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
    <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
    <p><strong>Address:</strong> ${data.streetAddress || ''} ${data.unitApt || ''}, ${data.city || ''}, ${data.state || ''} ${data.zipCode || ''}</p>
    
    <h3>Income Information</h3>
    <p><strong>Income Source:</strong> ${data.incomeSource || 'Not provided'}</p>
    <p><strong>Gross Annual Income:</strong> $${data.grossAnnualIncome || 'Not provided'}</p>
    
    <h3>Loan Details</h3>
    <p><strong>Loan Purpose:</strong> ${data.loanPurpose || 'Not provided'}</p>
    <p><strong>Property Type:</strong> ${data.propertyType || 'Not provided'}</p>
    <p><strong>Intended Use:</strong> ${data.intendedUse || 'Not provided'}</p>
    <p><strong>Desired Loan Amount:</strong> $${data.desiredLoanAmount || 'Not provided'}</p>
    ${data.downPayment ? `<p><strong>Down Payment:</strong> $${data.downPayment}</p>` : ''}
    ${data.desiredCashAmount ? `<p><strong>Desired Cash Amount:</strong> $${data.desiredCashAmount}</p>` : ''}
    <p><strong>Estimated Property Value:</strong> $${data.estimatedPropertyValue || 'Not provided'}</p>
    
    ${data.loanPurpose === 'purchase' ? `
    <h3>Purchase Details</h3>
    <p><strong>First Time Home Buyer:</strong> ${data.firstTimeBuyer || 'Not provided'}</p>
    <p><strong>Timeline to Purchase:</strong> ${data.timelineToPurchase || 'Not provided'}</p>
    ` : ''}
    
    ${data.loanPurpose?.startsWith('refinance') ? `
    <h3>Refinance Details</h3>
    <p><strong>Appraisal Completed:</strong> ${data.appraisalCompleted || 'Not provided'}</p>
    ` : ''}
    
    ${data.additionalInfo ? `<h3>Additional Information</h3><p>${data.additionalInfo}</p>` : ''}
    
    ${coBorrowerData ? `
    <h3>Co-Borrower Information</h3>
    <p><strong>Name:</strong> ${coBorrowerData.fullName || 'Not provided'}</p>
    <p><strong>Email:</strong> ${coBorrowerData.email || 'Not provided'}</p>
    <p><strong>Phone:</strong> ${coBorrowerData.phone || 'Not provided'}</p>
    ${!coBorrowerData.sameAsBorrower ? `
    <p><strong>Address:</strong> ${coBorrowerData.streetAddress || ''} ${coBorrowerData.unitApt || ''}, ${coBorrowerData.city || ''}, ${coBorrowerData.state || ''} ${coBorrowerData.zipCode || ''}</p>
    ` : '<p><strong>Address:</strong> Same as borrower</p>'}
    <p><strong>Income Source:</strong> ${coBorrowerData.incomeSource || 'Not provided'}</p>
    <p><strong>Gross Annual Income:</strong> $${coBorrowerData.grossAnnualIncome || 'Not provided'}</p>
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