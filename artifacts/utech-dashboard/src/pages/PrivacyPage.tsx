import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, AlertCircle, FileText } from 'lucide-react';

const LAST_UPDATED = "July 1, 2026";

export const POLICIES: { id: string; title: string; content: React.ReactNode }[] = [
  {
    id: 'policy-1',
    title: '1. Overview of Data Collection',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK collects personal and technical data necessary to provide carrier unlock services. This Privacy Policy explains what data we collect, how it is used, how it is stored, and your rights regarding that data. By using the platform, you consent to the practices described in this policy.
      </p>
    ),
  },
  {
    id: 'policy-2',
    title: '2. Account Information',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        When you register an account, we collect your name, email address, phone number (optional), and account credentials. This information is required to provide access to the UTECH SERVER UNLOCK platform, manage your account, and communicate with you about your orders and account status.
      </p>
    ),
  },
  {
    id: 'policy-3',
    title: '3. Device and IMEI Data',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        When you submit unlock requests, we collect IMEI numbers, device model information, carrier details, and associated access tokens. This data is processed solely for the purpose of executing unlock requests, diagnosing device compatibility, and maintaining accurate order records for dispute resolution.
      </p>
    ),
  },
  {
    id: 'policy-4',
    title: '4. Payment Information',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We do not store payment card details. Payments via Binance Pay are processed directly by Binance and are subject to Binance's privacy policy. We retain only transaction IDs, payment confirmation timestamps, and order amounts for order fulfillment, credit management, and dispute resolution.
      </p>
    ),
  },
  {
    id: 'policy-5',
    title: '5. Usage and Technical Data',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We automatically collect IP addresses, browser type, operating system, pages visited, session duration, API call logs, and device identifiers when you access the platform. This technical data helps us improve system performance, detect fraud, and maintain platform security.
      </p>
    ),
  },
  {
    id: 'policy-6',
    title: '6. Communication Data',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        If you contact our support team via the live chat widget, email, or any other channel, we collect and retain the content of those communications. Chat logs may be reviewed for quality assurance, compliance verification, and dispute resolution purposes.
      </p>
    ),
  },
  {
    id: 'policy-7',
    title: '7. How We Use Your Information',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We use collected data to: process and fulfill unlock requests; communicate order status and updates; authenticate user identity; manage credits and billing; detect and prevent fraud and abuse; comply with applicable laws; improve platform features; and provide customer support. We do not use your data for purposes incompatible with these stated uses.
      </p>
    ),
  },
  {
    id: 'policy-8',
    title: '8. Service Delivery',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your personal data and IMEI information are used to process and fulfill unlock requests, deliver SIP bypass files, communicate order status, and issue notifications upon completion. This is the primary purpose for which your data is collected.
      </p>
    ),
  },
  {
    id: 'policy-9',
    title: '9. Account Management',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We use your account information to authenticate your identity, manage your credit balance, process top-up transactions, maintain order history, and provide customer support. Account information is also used to enforce platform policies and respond to disputes.
      </p>
    ),
  },
  {
    id: 'policy-10',
    title: '10. Security and Fraud Prevention',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We analyze usage patterns, device submissions, and account behavior to detect and prevent unauthorized access, fraudulent IMEI submissions, chargeback fraud, and abuse of the platform. Flagged accounts are reviewed by our security team. We may share relevant data with law enforcement where required by law.
      </p>
    ),
  },
  {
    id: 'policy-11',
    title: '11. Legal Compliance',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We process and retain data as required to comply with applicable laws and regulations in Texas, United States, and internationally. This includes responding to lawful requests from government authorities, courts, and law enforcement agencies, as well as maintaining records for tax, audit, and compliance purposes.
      </p>
    ),
  },
  {
    id: 'policy-12',
    title: '12. Service Improvement',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We analyze aggregated usage data, error logs, and system performance metrics to identify areas for improvement, optimize processing pipelines, enhance unlock success rates, and develop new features. Analysis for this purpose uses de-identified or aggregated data wherever possible.
      </p>
    ),
  },
  {
    id: 'policy-13',
    title: '13. Marketing and Service Communications',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        With your consent, we may send you information about new supported device models, promotional credit offers, service updates, and platform announcements. You may opt out of marketing communications at any time through your account settings. Transactional communications (order updates, notices) cannot be opted out of while your account is active.
      </p>
    ),
  },
  {
    id: 'policy-14',
    title: '14. Payment Disputes and Refund Policy',
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Any order that has been left unpaid or incomplete is subject to cancellation, refund, or no refund, depending on the technicality of the order at the time of resolution. The following sub-policies govern refund eligibility:
        </p>
        <div className="pl-4 border-l-2 border-primary/30 flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">14.1 — Service Completed, Incomplete Payment (2 Notices Issued and Not Complied With)</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has been completed but payment remains incomplete, and two (2) notices were issued and not complied with — <strong className="text-foreground">no refund</strong> will be issued. The service is considered rendered and the payment obligation remains enforceable.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">14.2 — Service Incomplete, Incomplete Payment</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has not been completed and payment is incomplete, an <strong className="text-foreground">80% refund</strong> of the amount already paid will be processed. The remaining 20% covers costs incurred during partial processing.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">14.3 — Service Not Completed, Full Payment Received</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has not been completed but the full payment has been received, a <strong className="text-foreground">93% refund</strong> will be issued. The retained 7% covers transaction processing fees, gateway charges, and operational costs. Refunds are processed within 5–10 business days.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'policy-15',
    title: '15. Data Sharing Overview',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We do not share your personal data with third parties except as described in this Privacy Policy. Sharing is limited to circumstances required for service delivery, legal compliance, fraud prevention, and business continuity. All data sharing arrangements are subject to appropriate contractual or legal protections.
      </p>
    ),
  },
  {
    id: 'policy-16',
    title: '16. No Sale of Personal Data',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK does not sell, rent, trade, or otherwise transfer your personal information to third parties for marketing, advertising, or commercial purposes under any circumstances. Your data is used solely to provide and improve our services to you.
      </p>
    ),
  },
  {
    id: 'policy-17',
    title: '17. Service Providers and Processors',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We may share data with trusted third-party service providers who assist in operating our platform, including cloud hosting providers, database infrastructure, analytics tools, and fraud detection systems. These parties are contractually obligated to protect your data and may not use it for their own purposes.
      </p>
    ),
  },
  {
    id: 'policy-18',
    title: '18. Legal Requirements and Law Enforcement',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We may disclose your information if required by law, court order, subpoena, or governmental authority, or when we believe in good faith that disclosure is necessary to protect our rights, protect your safety, protect the safety of others, investigate fraud, or respond to lawful government requests.
      </p>
    ),
  },
  {
    id: 'policy-19',
    title: '19. Business Transfers',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        In the event of a merger, acquisition, reorganization, asset sale, or similar corporate transaction, your data may be transferred to the successor entity. We will notify registered users of any such transfer and the applicable privacy policy changes at least 30 days prior to the transfer taking effect.
      </p>
    ),
  },
  {
    id: 'policy-20',
    title: '20. International Data Transfers',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your data may be processed and stored in Texas, United States and in other jurisdictions where our service providers operate. When transferring data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses and data processing agreements compliant with applicable data protection laws.
      </p>
    ),
  },
  {
    id: 'policy-21',
    title: '21. Data Security Overview',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK implements industry-standard security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. Our security program includes technical, administrative, and physical safeguards appropriate to the sensitivity of the data we process.
      </p>
    ),
  },
  {
    id: 'policy-22',
    title: '22. Encryption Standards',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        All data transmitted to and from our platform is encrypted using TLS 1.3 with AES-256-GCM ciphers. IMEI data, access tokens, and sensitive fields are encrypted at rest using AES-256 encryption. Encryption keys are managed using a dedicated key management system with regular rotation.
      </p>
    ),
  },
  {
    id: 'policy-23',
    title: '23. Access Controls',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Access to personal data is restricted to authorized personnel on a strict need-to-know basis. All staff with data access undergo background verification and sign confidentiality agreements. Access is logged, monitored, and reviewed regularly. Multi-factor authentication is required for all administrative access.
      </p>
    ),
  },
  {
    id: 'policy-24',
    title: '24. Incident Response',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        In the event of a data breach or security incident, UTECH SERVER UNLOCK will notify affected users within 72 hours of becoming aware of the incident, in accordance with applicable data protection laws. Notifications will describe the nature of the incident, data affected, and steps taken to mitigate harm.
      </p>
    ),
  },
  {
    id: 'policy-25',
    title: '25. Security Limitations',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        While we employ commercially reasonable security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee the absolute security of your data. You are responsible for ensuring the security of your own device and network when accessing the platform.
      </p>
    ),
  },
  {
    id: 'policy-26',
    title: '26. Data Retention Periods',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We retain account information for the duration of your active account plus 36 months post-closure. Order and IMEI records are retained for a minimum of 36 months for compliance and dispute resolution. Payment transaction records are retained for 7 years in accordance with financial record-keeping requirements.
      </p>
    ),
  },
  {
    id: 'policy-27',
    title: '27. Your Right to Access and Portability',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You may request a copy of all personal data we hold about you at any time. We will provide this in a structured, machine-readable format (JSON or CSV) within 30 days of a verified request. Requests may be submitted via the support channel or to privacy@utechserverunlock.com.
      </p>
    ),
  },
  {
    id: 'policy-28',
    title: '28. Your Right to Correction',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You have the right to request correction of any inaccurate, incomplete, or outdated personal information we hold. Upon receiving a verified correction request, we will update our records within 15 business days and confirm the changes to you in writing.
      </p>
    ),
  },
  {
    id: 'policy-29',
    title: '29. Your Right to Deletion',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You may request deletion of your personal data. We will comply with deletion requests unless we are required to retain data for legal, regulatory, contractual, or legitimate business purposes, such as ongoing dispute resolution, fraud investigations, or statutory retention requirements.
      </p>
    ),
  },
  {
    id: 'policy-30',
    title: '30. Your Right to Object and Restrict Processing',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You have the right to object to or request restriction of the processing of your personal data in certain circumstances, including where processing is based on legitimate interests or where data accuracy is contested. We will honor valid restriction requests while evaluating your objection.
      </p>
    ),
  },
  {
    id: 'policy-31',
    title: '31. Withdrawal of Consent',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Where data processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of processing that occurred prior to withdrawal. Withdrawal of consent for essential processing may limit your ability to use certain platform features.
      </p>
    ),
  },
  {
    id: 'policy-32',
    title: '32. Cookie Policy Overview',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK uses cookies and similar tracking technologies to enable essential platform functions, maintain user sessions, and — with your consent — analyze platform usage. Cookies do not contain your personal data in plaintext. Your cookie preferences can be managed through your browser or account settings.
      </p>
    ),
  },
  {
    id: 'policy-33',
    title: '33. Essential Cookies',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Essential cookies are strictly necessary for the platform to function. They enable authentication, session management, security token validation, and basic platform operations. These cookies cannot be disabled without impairing your ability to use the platform.
      </p>
    ),
  },
  {
    id: 'policy-34',
    title: '34. Analytics Cookies',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        With your consent, we may use analytics cookies to understand how users interact with the platform, identify performance bottlenecks, and improve the user experience. Analytics data is aggregated and de-identified where possible. You may opt out at any time through your account settings.
      </p>
    ),
  },
  {
    id: 'policy-35',
    title: '35. No Third-Party Advertising Tracking',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK does not allow third-party advertising networks to place tracking cookies or pixels on our platform. We do not use retargeting advertising, behavioral advertising, or cross-site tracking of any kind. Your browsing behavior on our platform is not shared with advertising platforms.
      </p>
    ),
  },
  {
    id: 'policy-36',
    title: '36. Children\'s Privacy',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Our platform is not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided personal data without parental consent, we will take immediate steps to delete that information. Parents may contact us to report suspected minor accounts.
      </p>
    ),
  },
  {
    id: 'policy-37',
    title: '37. Third-Party Links',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Our platform may contain links to third-party websites or services, including Binance Pay. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party services you access through or in connection with our platform.
      </p>
    ),
  },
  {
    id: 'policy-38',
    title: '38. Policy Changes and Updates',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or platform capabilities. We will notify registered users of material changes via email at least 14 days prior to the changes taking effect. Continued use of the platform after changes constitutes acceptance of the updated policy.
      </p>
    ),
  },
  {
    id: 'policy-39',
    title: '39. Contact and Data Requests',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        For all privacy-related queries, data access requests, deletion requests, or concerns, please contact our Data Protection team at privacy@utechserverunlock.com. Our team is based in Texas, United States, and aims to respond to all privacy inquiries within 5 business days.
      </p>
    ),
  },
  {
    id: 'policy-40',
    title: '40. Enforcement and Complaints',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        If you believe your privacy rights have been violated, you have the right to lodge a complaint with the applicable data protection authority in your jurisdiction. We take all privacy complaints seriously and commit to investigating and resolving all reported violations promptly and transparently.
      </p>
    ),
  },
];

interface PrivacyPageProps {
  targetAnchor?: string;
}

export function PrivacyPage({ targetAnchor }: PrivacyPageProps) {
  useEffect(() => {
    const anchor = targetAnchor || window.location.hash.replace('#', '');
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
          setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background'), 2500);
        }
      }, 120);
    }
  }, [targetAnchor]);

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
          At UTECH SERVER UNLOCK, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your data across all 40 policies below.
        </p>
      </Card>

      {POLICIES.map(({ id, title, content }) => (
        <Card
          key={id}
          id={id}
          className="border-border bg-card/50 overflow-hidden transition-all duration-300 scroll-mt-6"
        >
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          </div>
          <div className="p-5">
            {content}
          </div>
        </Card>
      ))}

      <Card className="p-5 border-border bg-card/50">
        <h3 className="font-semibold text-foreground mb-2">Contact Our Data Protection Team</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          For any privacy-related queries, requests, or concerns:
        </p>
        <div className="flex flex-col gap-1.5 text-sm font-mono text-muted-foreground">
          <span>Email: privacy@utechserverunlock.com</span>
          <span>Response time: Within 5 business days</span>
          <span>Location: Texas, United States</span>
        </div>
      </Card>
    </div>
  );
}
