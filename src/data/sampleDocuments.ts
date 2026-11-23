export interface SampleLegalDocument {
  id: string;
  title: string;
  documentName: string;
  category: string;
  description: string;
  rawText: string;
}

export const SAMPLE_LEGAL_DOCUMENTS: SampleLegalDocument[] = [
  {
    id: 'sample-emp-bond',
    title: 'Employment Offer & 3-Year Service Bond',
    documentName: 'TechNova_Employment_Offer_and_Bond_Agreement.pdf',
    category: 'Employment Contract (High Risk)',
    description: 'Contains a 36-month lock-in bond, Rs. 3.5L penalty, original certificate retention, 24-month post-termination non-compete, contradictory salary delay clauses, and Aadhaar/Bank PII.',
    rawText: `EMPLOYMENT AGREEMENT AND SERVICE BOND

This Employment Agreement ("Agreement") is entered into on 12th October 2026 at Bengaluru, Karnataka, BY AND BETWEEN:
TechNova Solutions Pvt. Ltd., having its registered office at Outer Ring Road, Bellandur, Bengaluru - 560103 ("Employer")
AND
Mr. Rohan Sharma, residing at Flat 402, Green Valley Apartments, Indiranagar, Bengaluru - 560038, Aadhaar No: 4829 6104 8392, Phone: +91 98450 12345, Email: rohan.sharma99@example.com ("Employee").

1. POSITION AND COMMENCEMENT
The Employee is appointed as Associate Software Engineer effective 1st November 2026. The Employee shall report to the Project Director.

2. COMPENSATION AND BANK DETAILS
The Employee shall receive an annual Cost to Company (CTC) of INR 6,50,000. Salary shall be credited by the 10th of every succeeding month to Account No: 50100482910482, IFSC: HDFC0001204. However, in Clause 9.2, it is stated that salary disbursements may be delayed up to 45 days depending on client invoice realization without any interest.

3. MANDATORY SERVICE BOND AND LIQUIDATED DAMAGES
The Employee agrees to serve the Employer for a minimum lock-in period of thirty-six (36) months from the date of joining. In the event the Employee resigns or leaves the organization before completing 36 months for any reason whatsoever (including medical emergencies), the Employee shall immediately pay a fixed sum of INR 3,50,000 (Rupees Three Lakhs Fifty Thousand Only) as liquidated damages, and the Employer shall retain original educational certificates until full settlement.

4. TERMINATION AND NOTICE PERIOD
The Employee must provide ninety (90) days prior written notice to resign AFTER completion of the 36-month lock-in period. Conversely, the Employer reserves the absolute right to terminate the Employee's services at any time with immediate effect and without notice or severance compensation if the management deems the Employee's performance "unsatisfactory" in its sole discretion.

5. NON-COMPETE AND RESTRAINT OF TRADE
Upon termination or resignation from employment, the Employee shall not, for a period of twenty-four (24) months, directly or indirectly join, advise, or be employed by any software development, IT consulting, or technology company anywhere in India or abroad.

6. INTELLECTUAL PROPERTY ASSIGNMENT
All inventions, source code, designs, and creative works conceived or developed by the Employee during the period of employment—whether during working hours or on personal time using personal equipment—shall be the exclusive property of the Employer.

7. GOVERNING LAW AND DISPUTE RESOLUTION
Any dispute arising under this Agreement shall be resolved by a sole arbitrator appointed unilaterally by the Managing Director of the Employer. The seat of arbitration shall be New Delhi, although the Employee is based in Bengaluru.`,
  },
  {
    id: 'sample-residential-lease',
    title: 'Residential Apartment Lease Agreement',
    documentName: 'Whitefield_Residential_Rental_Lease_2026.docx',
    category: 'Real Estate & Tenancy (Medium/High Risk)',
    description: 'Features an asymmetric 11-month lock-in binding only the tenant, arbitrary security deposit deduction clause, conflicting rent due dates, and unannounced landlord inspection rights.',
    rawText: `RESIDENTIAL RENTAL LEASE AGREEMENT

This Rental Agreement is made and executed at Bengaluru on this 1st day of October 2026, BETWEEN:
Mr. Suresh Gowda, residing at No. 14, Jayanagar 4th Block, Bengaluru - 560011, Phone: +91 99001 54321, PAN: ABCDE1234F ("Lessor / Landlord")
AND
Ms. Ananya Rao, Aadhaar No: 7391 2048 5512, Email: ananya.rao@example.org, residing at No. 88, Koramangala, Bengaluru ("Lessee / Tenant").

1. LEASE TERM AND COMMENCEMENT
The lease is granted for a period of eleven (11) months commencing from 1st October 2026 and ending on 31st August 2027.

2. MONTHLY RENT AND CONTRADICTORY DUE DATES
In Clause 2.1, the Lessee agrees to pay a monthly rent of INR 38,000 on or before the 5th day of every calendar month via NEFT to Bank Account: 004201508912, IFSC: ICIC0000042. However, Clause 8.4 states that if rent is not received by the 1st day of the month, a late penalty of INR 1,500 per day shall be levied immediately.

3. SECURITY DEPOSIT AND FORFEITURE
The Lessee has paid an interest-free security deposit of INR 3,00,000 (Rupees Three Lakhs Only). At the end of the tenancy, the Lessor may deduct any amount deemed appropriate in the Lessor's sole judgment for repainting, deep cleaning, and general wear and tear without providing third-party bills or receipts.

4. ONE-SIDED LOCK-IN AND TERMINATION
The Lessee is strictly bound by a lock-in period of 11 months. If the Lessee vacates before 11 months, the entire security deposit of INR 3,00,000 shall stand forfeited. However, the Lessor may ask the Lessee to vacate the premises at any time by giving just 7 days verbal or WhatsApp notice without stating any reason.

5. UNANNOUNCED ENTRY AND MAINTENANCE
The Lessor or his representatives shall retain a duplicate master key and may enter and inspect the residential premises at any hour of the day or night without prior notice to the Lessee. All major structural repairs including plumbing pipe bursts and external seepage shall be paid for exclusively by the Lessee.`,
  },
  {
    id: 'sample-saas-vendor',
    title: 'Software Development & Vendor MSA',
    documentName: 'CloudScale_Vendor_Master_Services_Agreement.pdf',
    category: 'Commercial Vendor Contract (Medium Risk)',
    description: 'Includes uncapped indemnification for indirect damages, missing SLA uptime credits, ambiguous acceptance criteria, and auto-renewal lock-in.',
    rawText: `MASTER SOFTWARE SERVICES AGREEMENT (MSA)

This Master Software Services Agreement ("MSA") is effective as of 15th September 2026 between:
Apex Retail Enterprises Ltd., Mumbai ("Client")
AND
CloudScale Analytics LLP, represented by Partner Vikram Desai, Phone: +91 98201 77889, Email: legal@cloudscale-example.in, IFSC: SBIN0004321 ("Vendor").

1. SCOPE OF DELIVERABLES AND ACCEPTANCE
The Vendor shall design, develop, and deploy the Enterprise Inventory Portal. All deliverables shall be subject to acceptance testing by the Client. The Client may reject any deliverable if it does not meet "industry expectations" in the Client's sole opinion, without specifying technical defect criteria or maximum review days.

2. PAYMENT TERMS
The Client shall pay a total contract fee of INR 18,00,000 across three milestones. Undisputed invoices shall be paid within 90 days of receipt. The Agreement does not specify any interest rate or remedy for late payments delayed beyond 90 days by the Client.

3. UNLIMITED INDEMNIFICATION AND LIABILITY
The Vendor agrees to indemnify, defend, and hold harmless the Client from any and all claims, losses, indirect damages, lost profits, and consequential damages of any kind without any monetary cap or limitation of liability whatsoever.

4. TERM AND AUTOMATIC RENEWAL
This Agreement shall automatically renew for successive twenty-four (24) month terms at the original fee rate unless the Vendor provides written notice of non-renewal exactly between 180 and 190 days prior to the expiration of the current term.

5. CONFIDENTIALITY
The Vendor shall keep all Client information strictly confidential in perpetuity and shall never disclose or use any general know-how gained during the project.`,
  },
];
