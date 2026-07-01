import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, AlertTriangle } from 'lucide-react';

const LAST_UPDATED = "July 1, 2026";

export const TERMS: { id: string; title: string; content: React.ReactNode }[] = [
  {
    id: 'term-1',
    title: '1. Agreement by Submission',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        By proceeding and entering an IMEI or submitting any request through our server, you expressly agree to all Terms and Conditions of UTECH SERVER UNLOCK. This agreement is binding immediately upon submission. If you do not agree with any part of these Terms, you must not submit any request or use any part of this platform.
      </p>
    ),
  },
  {
    id: 'term-2',
    title: '2. Eligibility',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You must be at least 18 years of age and possess the legal authority to enter into binding contracts. By using this platform, you represent and warrant that you meet these requirements. Accounts opened on behalf of a business must be authorized by that business.
      </p>
    ),
  },
  {
    id: 'term-3',
    title: '3. Account Registration and Responsibilities',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify UTECH SERVER UNLOCK of any unauthorized use of your account. We are not liable for losses arising from unauthorized access resulting from your failure to secure your credentials.
      </p>
    ),
  },
  {
    id: 'term-4',
    title: '4. Service Description',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK provides a professional carrier unlock server platform allowing mobile device technicians, resellers, and authorized service providers based in Texas, United States and worldwide to submit IMEI-based carrier unlock requests for supported devices. The platform does not guarantee unlock success for all device models.
      </p>
    ),
  },
  {
    id: 'term-5',
    title: '5. IMEI Submission Requirements',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        All IMEI numbers submitted must be exactly 15 digits and must pass Luhn algorithm validation. You may only submit IMEI numbers for devices you legally own or for which you have written authorization from the owner. Submission of false, stolen, or blacklisted device information is strictly prohibited and may result in immediate account termination and legal action.
      </p>
    ),
  },
  {
    id: 'term-6',
    title: '6. SIP File Services',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Certain devices require SIP (Session Initiation Protocol) bypass files to complete the unlock process. These files are device-specific and are sold separately per unique IMEI. SIP file purchases are final and non-transferable to other IMEI numbers or device configurations.
      </p>
    ),
  },
  {
    id: 'term-7',
    title: '7. Processing Times',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Estimated processing times are provided as guidance only and do not constitute contractual commitments. Processing times may vary based on carrier response times, device model, queue load, and third-party system availability. UTECH SERVER UNLOCK shall not be held liable for delays caused by external factors.
      </p>
    ),
  },
  {
    id: 'term-8',
    title: '8. Accuracy of Device Information',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You are solely responsible for the accuracy of all device information submitted, including IMEI, device model, carrier, and region. Submissions containing inaccurate information may result in failed unlock attempts, consumed credits without refund, and potential account suspension.
      </p>
    ),
  },
  {
    id: 'term-9',
    title: '9. Permitted Use',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You may use UTECH SERVER UNLOCK solely for lawful purposes. Permitted uses include: submitting unlock requests for devices you legally own or are authorized to unlock; reselling unlock services to end users as a licensed technician or service provider; and managing orders through the platform interface.
      </p>
    ),
  },
  {
    id: 'term-10',
    title: '10. Prohibited Activities',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You must not: submit unlock requests for stolen, lost, or blacklisted devices; use the platform for fraudulent or illegal activity; attempt to reverse-engineer or exploit the platform; share account credentials with unauthorized parties; submit false device or carrier information; circumvent credit systems or payment obligations; or attempt to manipulate processing queues.
      </p>
    ),
  },
  {
    id: 'term-11',
    title: '11. Legal Compliance',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You are solely responsible for ensuring that your use of this service complies with all applicable laws and regulations in your jurisdiction, including but not limited to the DMCA (USA), Computer Fraud and Abuse Act, and equivalent legislation in your country. UTECH SERVER UNLOCK operates in compliance with applicable laws of Texas, United States.
      </p>
    ),
  },
  {
    id: 'term-12',
    title: '12. Credit System and Payment Obligations',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        The platform operates on a prepaid credit system. Credits are consumed per unlock request processed. Credit balances are non-transferable between accounts, have no cash value, and do not expire unless the account is terminated for violations. Payments are processed via Binance Pay (Binance ID: 490759406). All prices are displayed prior to purchase.
      </p>
    ),
  },
  {
    id: 'term-13',
    title: '13. Order Closure Upon Repeated Non-Compliance',
    content: (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          If two (2) notices have been issued to a user regarding a pending order — including but not limited to pending payment, pending device information, or any other outstanding obligation — the order is automatically closed without further communication. No additional warnings will be issued prior to closure.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          UTECH SERVER UNLOCK will not be liable for any loss, damage, or inconvenience incurred as a result of an order being closed under this provision. It is the user's sole responsibility to respond to notices in a timely manner.
        </p>
      </div>
    ),
  },
  {
    id: 'term-14',
    title: '14. Refund Policy',
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Refund eligibility is determined by the state of service completion and payment at the time of order closure. The following sub-policies apply:
        </p>
        <div className="pl-4 border-l-2 border-primary/30 flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">14.1 — Service Completed, Incomplete Payment (Notices Unaddressed)</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has been completed but payment remains incomplete, and two (2) notices have been issued and not complied with — <strong className="text-foreground">no refund</strong> will be issued. The completed service constitutes delivery, and the outstanding payment remains due.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">14.2 — Service Incomplete, Incomplete Payment</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has not been completed and payment is incomplete, an <strong className="text-foreground">80% refund</strong> of the amount paid will be issued. The remaining 20% covers administrative and processing costs already incurred.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">14.3 — Service Not Completed, Full Payment Received</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Where the service has not been completed but full payment has been received, a <strong className="text-foreground">93% refund</strong> will be issued. The remaining 7% covers transaction fees, gateway charges, and administrative costs. Refunds are processed within 5–10 business days.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'term-15',
    title: '15. Chargebacks and Payment Disputes',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Initiating an unauthorized chargeback or payment dispute may result in immediate account suspension and permanent ban from the platform. UTECH SERVER UNLOCK cooperates with payment processors and law enforcement in investigating fraudulent chargebacks. Users are encouraged to contact support before initiating any payment dispute.
      </p>
    ),
  },
  {
    id: 'term-16',
    title: '16. Order Status and Notifications',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You are responsible for monitoring order status through the platform dashboard and responding to any status notifications promptly. Failure to act on notifications within a reasonable timeframe may result in order closure as described in Term 13. UTECH SERVER UNLOCK is not responsible for undelivered notifications caused by user-side email or system issues.
      </p>
    ),
  },
  {
    id: 'term-17',
    title: '17. Account Security and Access Tokens',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        API access tokens issued to your account are strictly personal and non-transferable. You must not share access tokens with unauthorized parties. Compromised tokens must be reported immediately. Orders submitted using your token are your sole responsibility regardless of who submitted them.
      </p>
    ),
  },
  {
    id: 'term-18',
    title: '18. Grounds for Account Suspension',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK reserves the right to suspend or terminate your account immediately and without prior notice if we determine that you have violated these Terms, engaged in fraudulent activity, submitted blacklisted devices, initiated unauthorized chargebacks, or pose a security risk to the platform or other users.
      </p>
    ),
  },
  {
    id: 'term-19',
    title: '19. Effect of Account Termination',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Upon termination, your access to the platform will cease immediately. Unused credits may be forfeited in cases of violation-based termination. UTECH SERVER UNLOCK reserves the right to retain data as required by law or legitimate business interest, including records of fraudulent or non-compliant activity.
      </p>
    ),
  },
  {
    id: 'term-20',
    title: '20. User-Initiated Account Closure',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You may close your account at any time by contacting support. Account closure does not entitle you to a refund of unused credits unless otherwise required by applicable law. Outstanding balances or pending orders must be resolved prior to account closure.
      </p>
    ),
  },
  {
    id: 'term-21',
    title: '21. Intellectual Property',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        All content, trademarks, logos, software, databases, and proprietary systems on UTECH SERVER UNLOCK are owned by or licensed to us. No rights are granted to you except as expressly stated in these Terms. Unauthorized reproduction, distribution, or use of our proprietary materials is prohibited.
      </p>
    ),
  },
  {
    id: 'term-22',
    title: '22. License Grant',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the platform solely for the permitted purposes described in these Terms. This license does not include the right to sublicense, modify, or create derivative works from any platform component.
      </p>
    ),
  },
  {
    id: 'term-23',
    title: '23. Confidentiality of Platform Data',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You agree to treat all proprietary information obtained through your use of the platform as confidential, including but not limited to unlock methodologies, server infrastructure details, pricing structures, and technical processes. Disclosure of such information to third parties is strictly prohibited.
      </p>
    ),
  },
  {
    id: 'term-24',
    title: '24. Third-Party Services',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK may integrate with or reference third-party services, including Binance Pay for payment processing. We are not responsible for the terms, privacy practices, or performance of third-party services. Your use of such services is subject to their respective terms and conditions.
      </p>
    ),
  },
  {
    id: 'term-25',
    title: '25. Service Availability',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance, force majeure events, carrier API changes, or third-party infrastructure failures may affect service availability. We are not liable for losses arising from temporary service interruptions or outages.
      </p>
    ),
  },
  {
    id: 'term-26',
    title: '26. Service Modifications',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK reserves the right to modify, suspend, or discontinue any part of the platform, including supported device models, carriers, pricing, or features, at any time with or without notice. Continued use of the platform after modifications constitutes acceptance of the updated service terms.
      </p>
    ),
  },
  {
    id: 'term-27',
    title: '27. Force Majeure',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK shall not be liable for any failure or delay in performance caused by circumstances beyond our reasonable control, including acts of God, natural disasters, government actions, carrier policy changes, cyberattacks, internet infrastructure failures, or other force majeure events.
      </p>
    ),
  },
  {
    id: 'term-28',
    title: '28. Limitation of Liability',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, UTECH SERVER UNLOCK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE PRIOR 30 DAYS.
      </p>
    ),
  },
  {
    id: 'term-29',
    title: '29. Disclaimer of Warranties',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE ERROR-FREE OR THAT RESULTS WILL MEET YOUR EXPECTATIONS.
      </p>
    ),
  },
  {
    id: 'term-30',
    title: '30. Device Responsibility',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You accept full responsibility for any device submitted for unlock. UTECH SERVER UNLOCK is not responsible for any hardware damage, software malfunction, data loss, or voiding of manufacturer warranty that may occur during or after the unlock process. Ensure device backups are made prior to submission.
      </p>
    ),
  },
  {
    id: 'term-31',
    title: '31. Indemnification',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        You agree to indemnify, defend, and hold harmless UTECH SERVER UNLOCK, its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the platform.
      </p>
    ),
  },
  {
    id: 'term-32',
    title: '32. No Guarantee of Unlock Success',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Carrier unlock outcomes depend on carrier policies, device eligibility, and network conditions outside our direct control. UTECH SERVER UNLOCK does not guarantee that every submitted device will be successfully unlocked. In cases where unlock is not achievable, credits consumed may be subject to refund consideration at our discretion.
      </p>
    ),
  },
  {
    id: 'term-33',
    title: '33. Data Retention',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        UTECH SERVER UNLOCK retains order data, IMEI records, and transaction histories for a minimum of 36 months for compliance, fraud prevention, and dispute resolution purposes. You may request data deletion subject to our Privacy Policy and applicable retention obligations.
      </p>
    ),
  },
  {
    id: 'term-34',
    title: '34. Communication Consent',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        By registering an account, you consent to receiving transactional communications related to your orders, account status, notices, and platform updates via the email address associated with your account. You may opt out of non-essential communications at any time through your account settings.
      </p>
    ),
  },
  {
    id: 'term-35',
    title: '35. Support and Dispute Resolution',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        For any disputes or concerns, you must first contact our support team and allow a minimum of 10 business days for resolution. UTECH SERVER UNLOCK is committed to resolving all disputes in good faith. Escalating to external authorities prior to this process may affect your standing with the platform.
      </p>
    ),
  },
  {
    id: 'term-36',
    title: '36. Governing Law',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States of America, without regard to conflict of law principles. You agree to submit to the personal jurisdiction of courts located in Texas, United States for the resolution of any disputes arising hereunder.
      </p>
    ),
  },
  {
    id: 'term-37',
    title: '37. Arbitration Agreement',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Any dispute, controversy, or claim arising out of or relating to these Terms or the platform that cannot be resolved through good-faith negotiation shall be submitted to binding arbitration conducted in Texas, United States in accordance with applicable arbitration rules. The arbitrator's decision shall be final and binding.
      </p>
    ),
  },
  {
    id: 'term-38',
    title: '38. Class Action Waiver',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        YOU AGREE THAT ANY PROCEEDINGS TO RESOLVE DISPUTES WILL BE CONDUCTED ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. You waive any right to participate in class action lawsuits or class-wide arbitration against UTECH SERVER UNLOCK.
      </p>
    ),
  },
  {
    id: 'term-39',
    title: '39. Severability',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that most closely reflects the intent of the original.
      </p>
    ),
  },
  {
    id: 'term-40',
    title: '40. Entire Agreement',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        These Terms, together with the Privacy Policy and any additional service agreements, constitute the entire agreement between you and UTECH SERVER UNLOCK regarding your use of the platform and supersede all prior agreements, representations, or understandings. No waiver of any term shall be deemed a further or continuing waiver.
      </p>
    ),
  },
];

interface TermsPageProps {
  targetAnchor?: string;
}

export function TermsPage({ targetAnchor }: TermsPageProps) {
  const highlightRef = useRef<string | null>(targetAnchor ?? null);

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
          <FileText className="w-5 h-5 text-primary" />
          Terms and Conditions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Last updated: {LAST_UPDATED} — By using UTECH SERVER UNLOCK, you agree to these terms.</p>
      </div>

      <Card className="p-5 border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Please read all 40 Terms and Conditions carefully before using UTECH SERVER UNLOCK. By registering an account, submitting an IMEI, or using any part of our service, you agree to be legally bound by these terms.
        </p>
      </Card>

      {TERMS.map(({ id, title, content }) => (
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
        <h3 className="font-semibold text-foreground mb-2">Questions About These Terms?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          If you have questions or concerns, please contact our legal team:
        </p>
        <div className="flex flex-col gap-1.5 text-sm font-mono text-muted-foreground">
          <span>Email: legal@utechserverunlock.com</span>
          <span>Response time: Within 10 business days</span>
          <span>Jurisdiction: Texas, United States</span>
        </div>
      </Card>
    </div>
  );
}
