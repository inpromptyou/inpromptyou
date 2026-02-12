import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PublicListingPage from "@/components/PublicListingPage";

export default function PublicTestsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <PublicListingPage
          title="Assessments"
          subtitle="Professional AI prompting assessments — test your skills and prove your abilities"
          listingType="test"
          emptyIcon="📋"
          emptyTitle="No assessments available yet"
          emptySubtitle="Check back soon — new assessments are being added regularly"
        />
      </main>
      <Footer />
    </>
  );
}
