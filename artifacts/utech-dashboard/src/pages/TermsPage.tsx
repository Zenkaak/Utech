import { Card } from '@/components/ui/card';
import { FileText, AlertTriangle, Ban, CreditCard, RefreshCw, Scale, Globe, MessageSquare } from 'lucide-react';

const LAST_UPDATED = "June 22, 2026";

export function TermsPage() {
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
          Please read these Terms and Conditions carefully before using UTECH SERVER UNLOCK. By registering an account or using any part of our service, you agree to be bound by these terms. If you disagree with any part, you must not use our platform.
        </p>
      </Card>

      {[
        {
          icon: FileText,
          title: '1. Acceptance of Terms',
          items: [
            {
              sub: '1.1 Agreement',
              text: 'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you") and UTECH SERVER UNLOCK ("we", "us", "our") governing your use of the UTECH SERVER UNLOCK platform, including all services, tools, and features accessible through it.',
            },
            {
              sub: '1.2 Eligibility',
              text: 'You must be at least 18 years of age and have the legal authority to enter into binding contracts. By using this platform, you represent and warrant that you meet these requirements.',
            },
            {
              sub: '1.3 Amendments',
              text: 'We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms. We will notify registered users of material changes via email.',
            },
          ],
        },
        {
          icon: Globe,
          title: '2. Service Description',
          items: [
            {
              sub: '2.1 Platform Purpose',
              text: 'UTECH SERVER UNLOCK provides a professional carrier unlock server platform allowing mobile device technicians, resellers, and authorized service providers to submit IMEI-based carrier unlock requests for supported devices.',
            },
            {
              sub: '2.2 SIP File Service',
              text: 'Certain devices require SIP (Session Initiation Protocol) bypass files to complete the unlock process. These files are sold separately and are specific to individual IMEI numbers and device configurations.',
            },
            {
              sub: '2.3 Service Availability',
              text: 'We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance, force majeure events, or third-party carrier changes may affect service availability. We are not liable for losses arising from temporary service interruptions.',
            },
            {
              sub: '2.4 Processing Times',
              text: 'Estimated processing times are provided as guidance only and are not contractual commitments. Processing times may vary based on carrier response times, device model, and server load.',
            },
          ],
        },
        {
          icon: AlertTriangle,
          title: '3. Permitted & Prohibited Use',
          items: [
            {
              sub: '3.1 Permitted Use',
              text: 'You may use UTECH SERVER UNLOCK only for lawful purposes. Permitted uses include: submitting unlock requests for devices that you legally own or have written authorization from the owner to unlock; reselling unlock services to end users as a licensed technician or service provider.',
            },
            {
              sub: '3.2 Prohibited Activities',
              text: 'You must not: submit unlock requests for stolen, lost, or blacklisted devices; use the platform in connection with any fraudulent, illegal, or unauthorized activity; attempt to reverse-engineer, scrape, or exploit the platform; share account credentials with unauthorized parties; submit false device or carrier information; circumvent credit systems or payment obligations.',
            },
            {
              sub: '3.3 Compliance',
              text: 'You are solely responsible for ensuring that your use of this service complies with all applicable laws and regulations in your jurisdiction, including but not limited to the DMCA (USA), the Computer Misuse Act (UK), and equivalent legislation in your country.',
            },
          ],
        },
        {
          icon: CreditCard,
          title: '4. Credits, Payments & Refunds',
          items: [
            {
              sub: '4.1 Credit System',
              text: 'The platform operates on a prepaid credit system. Credits are consumed per unlock request processed. Credit balances are non-transferable between accounts and have no cash value.',
            },
            {
              sub: '4.2 SIP File Purchases',
              text: 'Purchases of SIP bypass files are processed via Binance Pay (Binance ID: 490759406). All prices are displayed prior to purchase. By completing a payment, you confirm your agreement with the purchase amount and terms.',
            },
            {
              sub: '4.3 Refund Policy',
              text: 'SIP file purchases are non-refundable once delivered. Refunds may be considered at our sole discretion in cases where: (a) the service was not delivered due to a technical error on our part; or (b) the purchased file is demonstrably incompatible with the stated device through no fault of the user.',
            },
            {
              sub: '4.4 Chargebacks',
              text: 'Initiating an unauthorized chargeback or payment dispute may result in immediate account suspension and permanent ban from the platform. We cooperate with payment processors and law enforcement in investigating fraudulent chargebacks.',
            },
          ],
        },
        {
          icon: Ban,
          title: '5. Account Suspension & Termination',
          items: [
            {
              sub: '5.1 Grounds for Suspension',
              text: 'We reserve the right to suspend or terminate your account immediately and without notice if we determine that you have violated these Terms, engaged in fraudulent activity, or pose a security risk to the platform or other users.',
            },
            {
              sub: '5.2 Effect of Termination',
              text: 'Upon termination, your access to the platform will cease immediately. Unused credits may be forfeited. We reserve the right to retain data as required by law or legitimate business interest.',
            },
            {
              sub: '5.3 User-Initiated Termination',
              text: 'You may close your account at any time by contacting support. Account closure does not entitle you to a refund of unused credits unless otherwise required by applicable law.',
            },
          ],
        },
        {
          icon: RefreshCw,
          title: '6. Intellectual Property',
          items: [
            {
              sub: '6.1 Platform Ownership',
              text: 'All content, trademarks, logos, software, databases, and proprietary systems on UTECH SERVER UNLOCK are owned by or licensed to us. No rights are granted to you except as expressly stated in these Terms.',
            },
            {
              sub: '6.2 License Grant',
              text: 'We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the platform solely for the purposes described in these Terms and in accordance with them.',
            },
          ],
        },
        {
          icon: Scale,
          title: '7. Limitation of Liability & Disclaimers',
          items: [
            {
              sub: '7.1 As-Is Service',
              text: 'THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
            },
            {
              sub: '7.2 Limitation of Liability',
              text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, UTECH SERVER UNLOCK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
            },
            {
              sub: '7.3 Device Responsibility',
              text: 'You accept full responsibility for any device submitted for unlock. We are not responsible for any damage, malfunction, or voiding of warranty that may occur during or after the unlock process.',
            },
          ],
        },
        {
          icon: MessageSquare,
          title: '8. Governing Law & Disputes',
          items: [
            {
              sub: '8.1 Governing Law',
              text: 'These Terms shall be governed by and construed in accordance with applicable international commercial law and the laws of the jurisdiction in which UTECH SERVER UNLOCK is registered, without regard to conflict of law principles.',
            },
            {
              sub: '8.2 Dispute Resolution',
              text: 'Any disputes arising from these Terms or your use of the platform shall first be attempted to be resolved through good-faith negotiation. Failing that, disputes shall be resolved by binding arbitration.',
            },
            {
              sub: '8.3 Contact',
              text: 'For any questions regarding these Terms, contact us at: legal@utechserverunlock.com. We aim to respond to all legal inquiries within 10 business days.',
            },
          ],
        },
      ].map(({ icon: Icon, title, items }) => (
        <Card key={title} className="border-border bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {items.map(({ sub, text }) => (
              <div key={sub}>
                <p className="text-sm font-semibold text-foreground mb-1">{sub}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-5 border-border bg-card/50">
        <h3 className="font-semibold text-foreground mb-2">Questions About These Terms?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          If you have questions or concerns about our Terms and Conditions, please contact our legal team:
        </p>
        <div className="flex flex-col gap-1.5 text-sm font-mono text-muted-foreground">
          <span>Email: legal@utechserverunlock.com</span>
          <span>Response time: Within 10 business days</span>
          <span>Company: UTECH SERVER UNLOCK</span>
        </div>
      </Card>
    </div>
  );
}
