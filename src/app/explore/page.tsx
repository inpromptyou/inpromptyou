import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PublicListingPage from "@/components/PublicListingPage";

export default function ExplorePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <PublicListingPage
          title="Explore & Practice"
          subtitle="Fun and casual AI prompting challenges — sharpen your skills at your own pace"
          listingType="casual"
          emptyIcon="🎮"
          emptyTitle="No practice tests yet"
          emptySubtitle="Community challenges are coming soon — check back later!"
        />
      </main>
      <Footer />
    </>
  );
}
