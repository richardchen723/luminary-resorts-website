import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="font-serif text-6xl mb-4">404</h1>
        <h2 className="font-serif text-3xl mb-4">Cabin Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The cabin you're looking for doesn't exist. Please check the URL or return to the
          homepage.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
      <Footer />
    </div>
  )
}

