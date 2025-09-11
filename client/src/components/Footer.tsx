import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold font-serif mb-4" data-testid="text-footer-company">
              Prime Rate Home Loans
            </h3>
            <p className="text-primary-foreground/80 mb-4" data-testid="text-footer-description">
              Your trusted mortgage partner for over 25 years. We're committed to helping you achieve homeownership with competitive rates and exceptional service.
            </p>
            <div className="space-y-2">
              <p className="font-semibold" data-testid="text-footer-license">
                NMLS #123456 | Licensed in all 50 states
              </p>
              <p className="text-sm text-primary-foreground/70" data-testid="text-footer-equal-housing">
                Equal Housing Lender | Equal Opportunity Employer
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-quicklinks-title">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                'Loan Programs',
                'Mortgage Rates',
                'Refinancing',
                'First-Time Buyers',
                'Loan Calculator',
                'About Us'
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    data-testid={`link-footer-quicklink-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(`${link} footer link clicked`);
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-contact-title">
              Contact Info
            </h4>
            <div className="space-y-2">
              <p className="text-primary-foreground/80" data-testid="text-footer-phone">
                Phone: (555) 123-LOAN
              </p>
              <p className="text-primary-foreground/80" data-testid="text-footer-email">
                Email: info@primerateloans.com
              </p>
              <p className="text-primary-foreground/80" data-testid="text-footer-address">
                123 Main Street, Suite 200<br />
                Your City, ST 12345
              </p>
              <p className="text-primary-foreground/80" data-testid="text-footer-hours">
                Mon-Fri: 8AM-8PM<br />
                Saturday: 9AM-5PM
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/70" data-testid="text-footer-copyright">
            © 2025 Prime Rate Home Loans. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {[
              'Privacy Policy',
              'Terms of Service', 
              'Disclosure',
              'Sitemap'
            ].map((link, index) => (
              <a 
                key={index}
                href="#" 
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                data-testid={`link-footer-legal-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`${link} footer link clicked`);
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}