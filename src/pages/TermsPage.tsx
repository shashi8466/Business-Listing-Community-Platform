import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - BusinessHub</title>
        <meta name="description" content="BusinessHub Terms of Service - Read our terms and conditions for using the platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 30, 2024</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using BusinessHub.com, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
                <p className="text-muted-foreground mb-4">
                  Permission is granted to temporarily access the materials on BusinessHub.com for personal, non-commercial transitory viewing only. This license does not include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Modifying or copying materials</li>
                  <li>Using materials for commercial purposes</li>
                  <li>Attempting to decompile or reverse engineer any software</li>
                  <li>Removing any copyright or proprietary notations</li>
                  <li>Transferring materials to another person</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Business Listings</h2>
                <p className="text-muted-foreground">
                  Business owners are responsible for the accuracy of their listing information. We reserve the right to remove or modify listings that violate our policies or contain false information. All listings are subject to review and approval.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Reviews and Content</h2>
                <p className="text-muted-foreground">
                  Users must submit honest and accurate reviews. We reserve the right to remove reviews that are fraudulent, abusive, or violate our community guidelines. By submitting content, you grant us a non-exclusive license to use, display, and distribute that content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Disclaimer</h2>
                <p className="text-muted-foreground">
                  The materials on BusinessHub.com are provided on an 'as is' basis. BusinessHub makes no warranties, expressed or implied, and hereby disclaims all other warranties including implied warranties of merchantability or fitness for a particular purpose.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitations</h2>
                <p className="text-muted-foreground">
                  In no event shall BusinessHub or its suppliers be liable for any damages arising out of the use or inability to use the materials on BusinessHub.com, even if BusinessHub has been notified of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Information</h2>
                <p className="text-muted-foreground">
                  Questions about the Terms of Service should be sent to us at legal@BusinessHub.com.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsPage;
