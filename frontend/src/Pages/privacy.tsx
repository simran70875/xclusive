import SectionHeading from "../components/SectionHeading";

const PolicyPage = () => {
    return (
        <div className="container-padding section-space text-gray-800">
            <SectionHeading heading="Privacy Policy" />

            <div className="space-y-8 leading-relaxed text-sm md:text-base">


                {/* NEW Privacy Policy Section */}
                <section>


                    <h3 className="font-semibold mt-4">1. Information We Collect</h3>
                    <p className="app-text-normal">
                        We collect and process the following types of personal data when you use our website or engage with our services:
                    </p>
                    <ul className="list-disc ml-6 app-text-normal">
                        <li>Business Information: Company name, business address, industry type, and company registration number.</li>
                        <li>Contact Details: Names, job titles, email addresses, telephone numbers of business representatives.</li>
                        <li>Account and Order Information: Purchase history, invoices, delivery addresses, payment details.</li>
                        <li>Website Usage Data: IP address, browser type, operating system, pages visited, time spent on site, and referral sources (collected through cookies and analytics tools).</li>
                    </ul>

                    <h3 className="font-semibold mt-4">2. How We Use Your Data</h3>
                    <p className="app-text-normal">
                        We use your personal data for the following purposes:
                    </p>
                    <ul className="list-disc ml-6 app-text-normal">
                        <li>To process and fulfil orders for PPE and office supplies.</li>
                        <li>To communicate with you regarding your orders, account, or customer service enquiries.</li>
                        <li>To send marketing communications related to our products, promotions, and company updates (where you have given consent).</li>
                        <li>To improve our website, products, and services through data analysis and feedback.</li>
                        <li>To comply with legal and regulatory obligations.</li>
                    </ul>

                    <h3 className="font-semibold mt-4">3. Legal Basis for Processing</h3>
                    <p className="app-text-normal">
                        Worksafety processes your personal data based on the following legal grounds:
                    </p>
                    <ul className="list-disc ml-6 app-text-normal">
                        <li>Performance of a contract (processing orders and providing services).</li>
                        <li>Legitimate interests (improving services and communications).</li>
                        <li>Consent (marketing communications and promotional emails).</li>
                        <li>Compliance with legal obligations.</li>
                    </ul>

                    <h3 className="font-semibold mt-4">4. Data Sharing and Disclosure</h3>
                    <p className="app-text-normal">
                        We may share your data with:

                    </p>
                    <ul className="list-disc ml-6 app-text-normal">
                        <li>Trusted third-party service providers who support our business operations (e.g., delivery partners, payment processors, IT service providers).</li>
                        <li>Regulatory or law enforcement authorities if required by law or to protect our legal rights.</li>
                        <li>Other parties only with your explicit consent.</li>
                    </ul>
                    <p className="app-text-normal">We do not sell your personal data to third parties.</p>

                    <h3 className="font-semibold mt-4">5. Data Security</h3>
                    <p className="app-text-normal">
                        We implement appropriate technical and organisational measures to safeguard your personal data against unauthorised access, loss, or misuse. Access to personal data is limited to authorised personnel only.
                    </p>

                    <h3 className="font-semibold mt-4">6. Data Retention</h3>
                    <p className="app-text-normal">
                        We retain your personal data for as long as necessary to fulfil the purposes outlined in this Privacy Policy, including legal, accounting, or reporting requirements. Typically, this means retaining data for a minimum of 6 years following your last interaction with us.
                    </p>

                    <h3 className="font-semibold mt-4">7. Your Rights</h3>
                    <p className="app-text-normal">
                        Under the UK GDPR, you have the right to:
                    </p>
                    <ul className="list-disc ml-6 app-text-normal">
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate data.</li>
                        <li>Request deletion of your data where applicable.</li>
                        <li>Object to or restrict certain data processing.</li>
                        <li>Request data portability.</li>
                        <li>Withdraw consent at any time for marketing communications.</li>
                        <li>Lodge a complaint with the UK Information Commissioner’s Office (ICO) if you believe your data is not being handled properly.</li>
                    </ul>
                    <p className="app-text-normal">
                        To exercise your rights, please contact us at:<br />
                        Email: <a className="text-blue-600 underline" href="mailto:hello@worksafety.co.uk">hello@worksafety.co.uk</a>
                    </p>

                    <h3 className="font-semibold mt-4">8. Cookies and Tracking</h3>
                    <p className="app-text-normal">
                        Our website uses cookies and similar tracking technologies to enhance user experience and analyse website traffic. You can manage your cookie preferences through your browser settings.
                    </p>

                    <h3 className="font-semibold mt-4">9. Changes to this Privacy Policy</h3>
                    <p className="app-text-normal">
                        Worksafety may update this Privacy Policy periodically. We recommend reviewing it regularly. Updates will be posted on this page with an updated effective date.
                    </p>

                    <h3 className="font-semibold mt-4">10. Contact Us</h3>
                    <p className="app-text-normal">
                        If you have any questions or concerns about this Privacy Policy or our data practices, please get in touch:<br />
                        Worksafety<br />
                        Email: <a className="text-blue-600 underline" href="mailto:hello@worksafety.co.uk">hello@worksafety.co.uk</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PolicyPage;
