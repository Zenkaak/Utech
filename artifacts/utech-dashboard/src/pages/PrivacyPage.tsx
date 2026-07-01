import { Card } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, Globe, Mail, AlertCircle, FileText } from 'lucide-react';

const LAST_UPDATED = "June 22, 2026";

export function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Privacy Policy
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Last updated: {LAST_UPDATED} — Effective immediately upon account registration.</p>
      </div>

      <Card className="p-5 border-primary/20 bg-primary/5 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          At UTECH SERVER UNLOCK, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our unlock server platform. Please read it carefully.
        </p>
      </Card>

      {[
        {
          icon: Database,
          title: '1. Information We Collect',
          content: [
            {
              sub: 'Account Information',
              text: 'When you register an account, we collect your name, email address, phone number, and account credentials. This information is required to provide you access to the UTECH SERVER UNLOCK platform and associated services.',
            },
            {
              sub: 'Device & IMEI Data',
              text: 'When you submit unlock requests, we collect IMEI numbers, device model information, carrier details, and associated authentication passwords. This data is processed solely for the purpose of executing unlock requests and diagnosing device compatibility.',
            },
            {
              sub: 'Payment Information',
              text: 'We do not store payment card details. Payments made via Binance Pay are processed directly by Binance and are subject to their privacy policy. We only retain transaction IDs and payment confirmation timestamps for order fulfillment and dispute resolution.',
            },
            {
              sub: 'Usage & Technical Data',
              text: 'We automatically collect IP addresses, browser type, operating system, pages visited, time spent on the platform, and device identifiers. This data helps us improve system performance, detect fraud, and maintain security.',
            },
          ],
        },
        {
          icon: Eye,
          title: '2. How We Use Your Information',
          content: [
            { sub: 'Service Delivery', text: 'To process and fulfill unlock requests, communicate order status, and deliver purchased SIP bypass files and related products.' },
            { sub: 'Account Management', text: 'To manage your account, authenticate your identity, manage credits, and provide customer support.' },
            { sub: 'Security & Fraud Prevention', text: 'To detect and prevent unauthorized access, fraudulent orders, and abuse of the platform.' },
            { sub: 'Legal Compliance', text: 'To comply with applicable laws, regulations, and lawful requests from public authorities.' },
            { sub: 'Service Improvement', text: 'To analyze usage trends, troubleshoot technical issues, and improve platform features and reliability.' },
          ],
        },
        {
          icon: Globe,
          title: '3. Data Sharing & Disclosure',
          content: [
            { sub: 'No Sale of Data', text: 'We do not sell, rent, or trade your personal information to third parties for marketing purposes under any circumstances.' },
            { sub: 'Service Providers', text: 'We may share data with trusted third-party service providers who assist in operating our platform (e.g., cloud hosting, analytics, fraud detection). These parties are contractually obligated to protect your data.' },
            { sub: 'Legal Requirements', text: 'We may disclose your information if required by law, court order, or governmental authority, or when we believe disclosure is necessary to protect our rights or the safety of others.' },
            { sub: 'Business Transfers', text: 'In the event of a merger, acquisition, or asset sale, your information may be transferred. We will notify you before your data becomes subject to a different privacy policy.' },
          ],
        },
        {
          icon: Lock,
          title: '4. Data Security',
          content: [
            { sub: 'Encryption', text: 'All data transmitted to and from our platform is encrypted using industry-standard TLS 1.3 (256-bit) encryption. IMEI data and sensitive fields are encrypted at rest using AES-256.' },
            { sub: 'Access Controls', text: 'Access to personal data is restricted to authorized personnel only, on a need-to-know basis. All staff with data access undergo background verification and sign confidentiality agreements.' },
            { sub: 'Incident Response', text: 'In the event of a data breach, we will notify affected users within 72 hours of becoming aware of the incident, in accordance with applicable data protection laws.' },
            { sub: 'Limitations', text: 'No method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.' },
          ],
        },
        {
          icon: FileText,
          title: '5. Your Rights',
          content: [
            { sub: 'Access & Portability', text: 'You may request a copy of all personal data we hold about you at any time. We will provide this in a structured, machine-readable format within 30 days of request.' },
            { sub: 'Correction', text: 'You have the right to request correction of inaccurate or incomplete personal information.' },
            { sub: 'Deletion', text: 'You may request deletion of your personal data. We will comply unless we are required to retain it for legal, regulatory, or legitimate business purposes.' },
            { sub: 'Objection & Restriction', text: 'You have the right to object to or restrict the processing of your personal data in certain circumstances.' },
            { sub: 'Withdraw Consent', text: 'Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of prior processing.' },
          ],
        },
        {
          icon: Mail,
          title: '6. Cookies & Tracking',
          content: [
            { sub: 'Essential Cookies', text: 'We use strictly necessary cookies for authentication, session management, and platform security. These cannot be disabled as they are required for the service to function.' },
            { sub: 'Analytics Cookies', text: 'With your consent, we may use analytics cookies to understand how users interact with the platform. You may opt out at any time through your account settings.' },
            { sub: 'No Third-Party Tracking', text: 'We do not allow third-party advertising networks to place tracking cookies on our platform.' },
          ],
        },
      ].map(({ icon: Icon, title, content }) => (
        <Card key={title} className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {content.map(({ sub, text }) => (
              <div key={sub}>
                <p className="text-sm font-semibold text-foreground mb-1">{sub}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-5 border-border bg-card/50">
        <h3 className="font-semibold text-foreground mb-2">Contact Our Data Protection Officer</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          For any privacy-related queries, requests, or concerns, please contact our Data Protection Officer:
        </p>
        <div className="flex flex-col gap-1.5 text-sm font-mono text-muted-foreground">
          <span>Email: privacy@utechserverunlock.com</span>
          <span>Response time: Within 5 business days</span>
          <span>Company: UTECH SERVER UNLOCK</span>
        </div>
      </Card>
    </div>
  );
}
