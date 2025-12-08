import SectionHeading from "../components/SectionHeading";

// src/pages/Terms.tsx
const TermsPage = () => {
    return (
        <div className="container-padding section-space text-gray-800">
            <SectionHeading heading="Terms and Conditions" />

            <div className="space-y-8 leading-relaxed text-sm md:text-base">
                <section>
                    <h2 className="font-semibold text-lg mb-2">1. Acceptance of Orders</h2>
                    <p className="app-text-normal"><strong>1.1</strong> All orders are accepted solely at the discretion of Work Wear Company and are subject to these Terms and Conditions unless otherwise agreed in writing by both parties.</p>
                    <p className="app-text-normal"><strong>1.2</strong> We may collect your personal data from our customer database, previous enquiries, or reputable third-party sources. Your details may be used to inform you of products and services that may be of interest. If you wish to update your details or opt out of our marketing communications, please contact us:</p>
                    <p className="app-text-normal">
                        Work Wear Company<br />
                        {/* Unit Address (replace with correct address)<br /> */}
                        Email: <a className="text-blue-600 underline" href="mailto:hello@xclusivediamond.co.uk">hello@xclusivediamond.co.uk</a>
                    </p>
                    <p className="app-text-normal">
                        On occasion, we may share our customer list with carefully selected third parties for marketing purposes. If you would prefer not to receive such communications, please contact us using the details above.
                    </p>
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">2. Pricing and Payment Terms</h2>
                    {[
                        "2.1 For online orders, please select the desired product(s) and quantity and submit a Request for Quote. We will review your request and send you a detailed quotation with pricing and any applicable offers. Orders will only be processed once you have accepted our quotation.",
                        "2.2 For orders placed through our catalogue, please first request a copy of our latest catalogue to review our full product range. Once you have selected your desired products and quantities, please submit a Request for Quote. We will then provide you with a detailed quotation for your selected items.",
                        "2.3 Account customers placing orders via Email/phone call will have their orders processed automatically if stock is available. Confirmation calls will only be made for new customers or where confirmation of stock, payment, or delivery details is required.",
                        "2.4 Quotation prices are valid for 30 days from the date of quotation unless stated otherwise. After this period, prices may change and a new quotation should be requested.",
                        "2.5 We reserve the right to adjust prices at any time prior to delivery in response to market fluctuations or other factors beyond our control.",
                        "2.6 All prices are exclusive of VAT and delivery charges unless otherwise agreed in writing.",
                        "2.7 Full payment for orders, including any applicable VAT and delivery charges, must be received and cleared prior to order processing, unless credit terms have been agreed in advance and confirmed in writing.",
                        "2.8 For approved credit accounts, payment is due in full within 14 days of the invoice date. Late payments may result in the withdrawal of credit facilities and may incur interest at 3% above the current base rate of our bank, plus reasonable collection and legal costs.",
                        "2.9 Orders for customised products are binding and non-cancellable once approved artwork or specifications have been signed off."
                    ].map((item, index) => (
                        <p key={index} className="app-text-normal"><strong>{item.slice(0, 3)}</strong>{item.slice(3)}</p>
                    ))}
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">3. Delivery & Title of Goods</h2>
                    {[
                        "3.1 Delivery will be made to the address specified on your order or by collection from our premises once goods are ready. A signature will be required on delivery or collection.",
                        "3.2 Delivery dates are indicative only and Work Wear Company accepts no liability for delays beyond our control.",
                        "3.3 Risk transfers to the buyer upon delivery, including when goods are left unattended at the buyer’s request.",
                        "3.4 Ownership of goods passes only upon receipt of full payment, including any applicable VAT and delivery charges.",
                        "3.5 Until full payment is received, we reserve the right to repossess the goods if necessary.",
                        "3.6 For orders placed before 4:30 pm, we aim to deliver to UK mainland addresses the next working day. Orders placed on Fridays or before bank holidays will be delivered on the next available working day. Some products may have longer lead times, which will be communicated at the time of order.",
                        "3.7 Deliveries to Scottish Highlands, Northern Ireland, and offshore islands typically take 3-5 working days.",
                        "3.8 Delivery charges:\n• England, Wales, and most of Scotland: £6.95 (ex VAT) for orders under £200 (ex VAT). Free delivery on orders over £200 (ex VAT).\n• Scottish Highlands, Northern Ireland & offshore islands: £12.95 (ex VAT) for orders under £150 (ex VAT). Free delivery on orders over £150 (ex VAT).",
                        "3.9 Some products are dispatched directly from manufacturers/Warehouse who may not deliver outside of the UK mainland. Customers will be advised if this applies.",
                        "3.10 Delivery is to the ground floor front door only. At the driver’s discretion, additional assistance may be provided at the buyer’s risk.",
                        "3.11 We do not deliver to PO Box addresses."
                    ].map((item, index) => (
                        <p key={index} className="app-text-normal"><strong>{item.slice(0, 4)}</strong>{item.slice(4)}</p>
                    ))}
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">4. Returns & Cancellations</h2>
                    <p><strong>4.1</strong> Stocked products can be returned within 14 days of date of delivery, if approved for Return. Notify us via phone or email;<br />
                        Email: <a className="text-blue-600 underline" href="mailto:sales@workwearcompany.co.uk">sales@workwearcompany.co.uk</a></p>
                    {[
                        "4.2 Returned goods must be securely packaged and include original packaging where applicable. We reserve the right to refuse refunds for damaged goods unsuitable for resale.",
                        "4.3 Upon receipt of returned goods, we will offer a refund, credit, or exchange.",
                        "4.4 Non-stocked and personalised products are non-returnable once an order is confirmed.",
                        "4.5 Defective or faulty goods may be returned for exchange or replacement following inspection. Please contact us to obtain a returns number.",
                        "4.6 Product warranties exclude consumables and damage caused by misuse. Replacements or repairs will only be issued following inspection confirming a valid fault under warranty."
                    ].map((item, index) => (
                        <p key={index} className="app-text-normal"><strong>{item.slice(0, 4)}</strong>{item.slice(4)}</p>
                    ))}
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">5. Claims & Liability</h2>
                    {[
                        "5.1 Claims for defects or delivery discrepancies must be reported within 7 days of discovery and no later than 30 days from delivery.",
                        "5.2 We recommend inspecting goods immediately upon receipt. Damage or shortages must be reported within 3 days.",
                        "5.3 If goods are found defective, we will offer a repair, replacement, or refund at our discretion. We accept no liability for consequential loss, loss of profits, or administrative inconvenience beyond the remedies outlined here. This does not affect your statutory rights.",
                        "5.4 Goods are warranted against material and workmanship defects for 12 months from the invoice date unless otherwise stated.",
                        "5.5 Warranty exclusions include defects caused by fair wear and tear, external forces, incorrect installation or use, and unauthorised modification or repair. Warranties are non-transferable."
                    ].map((item, index) => (
                        <p key={index} className="app-text-normal"><strong>{item.slice(0, 4)}</strong>{item.slice(4)}</p>
                    ))}
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">6. Termination</h2>
                    <p className="app-text-normal">Work Wear Company reserves the right to suspend or cancel contracts and deliveries if the buyer fails to meet payment obligations or becomes insolvent. In such cases, all outstanding amounts become immediately due.</p>
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">7. Force Majeure</h2>
                    <p className="app-text-normal">We accept no liability for failure to deliver goods or delays caused by events beyond our control, including (but not limited to) natural disasters, strikes, or supply chain disruptions.</p>
                </section>

                <section>
                    <h2 className="font-semibold text-lg mb-2">8. General Provisions</h2>
                    <p className="app-text-normal">If any part of these terms is deemed invalid or unenforceable, the remaining terms shall remain valid and enforceable.</p>
                    <p className="app-text-normal">All contracts are governed by and interpreted in accordance with English law.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
