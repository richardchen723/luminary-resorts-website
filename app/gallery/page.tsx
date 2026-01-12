import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GalleryClient } from "@/components/gallery-client"
import { getGalleryImages } from "@/lib/gallery"

export default async function GalleryPage() {
  const { bannerImage, images } = await getGalleryImages()

  return (
    <div className="min-h-screen">
      <Header />
      <GalleryClient bannerImage={bannerImage} images={images} />
      <Footer />
    </div>
  )
}
