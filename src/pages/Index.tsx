import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MenuSection from "@/components/MenuSection";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import LocationSection from "@/components/LocationSection";
import ReservationSection from "@/components/ReservationSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <MenuSection />
      <GallerySection />
      <ServicesSection />
      <ReviewsSection />
      <ReservationSection />
      <LocationSection />
      <Footer />
    </main>
  );
};

export default Index;
