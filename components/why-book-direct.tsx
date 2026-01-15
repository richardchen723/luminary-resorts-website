import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Heart, Shield, Clock } from "lucide-react"

export function WhyBookDirect() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Why Book Direct</h2>
            <p className="text-lg text-muted-foreground">
              When you book directly with us, you get the best experience, pricing, and support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-3">Best Price Guarantee</h3>
                <p className="text-muted-foreground">
                  Book directly and save. No third-party fees or commissions. We guarantee the best available rate when you book through our website.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-3">Personalized Service</h3>
                <p className="text-muted-foreground">
                  Direct communication with our team means personalized attention, special requests, and support throughout your stay. We're here to make your experience perfect.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-3">Flexible Policies</h3>
                <p className="text-muted-foreground">
                  Better cancellation policies and flexibility when you book direct. We work with you to accommodate changes and special circumstances.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-3">Direct Support</h3>
                <p className="text-muted-foreground">
                  24/7 guest support when you book direct. Need something during your stay? Contact us directly—no middleman, no delays.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
