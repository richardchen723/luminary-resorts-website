"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns"

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cabinName: string
  checkIn: string
  checkOut: string
  guests: string
  pets: string
  infants: string
  onSubmit: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    message: string
  }) => Promise<void>
}

export function InquiryModal({
  open,
  onOpenChange,
  cabinName,
  checkIn,
  checkOut,
  guests,
  pets,
  infants,
  onSubmit,
}: InquiryModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "US",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Format phone number for display (US format: (XXX) XXX-XXXX)
  const formatPhoneDisplay = (value: string): string => {
    const digits = value.replace(/\D/g, "")
    const limitedDigits = digits.slice(0, 10)
    
    if (limitedDigits.length === 0) return ""
    if (limitedDigits.length <= 3) return `(${limitedDigits}`
    if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`
    }
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
  }

  // Get phone number digits only (for API submission)
  const getPhoneDigits = (value: string): string => {
    return value.replace(/\D/g, "").slice(0, 10)
  }

  // Format phone number with country code for API submission
  const formatPhoneForAPI = (digits: string, countryCode: string): string => {
    const countryPrefixes: Record<string, string> = {
      US: "+1",
      CA: "+1",
      GB: "+44",
      AU: "+61",
      DE: "+49",
      FR: "+33",
      IT: "+39",
      ES: "+34",
      NL: "+31",
      BE: "+32",
      CH: "+41",
      AT: "+43",
      SE: "+46",
      NO: "+47",
      DK: "+45",
      FI: "+358",
      PL: "+48",
      CZ: "+420",
      IE: "+353",
      PT: "+351",
      GR: "+30",
      RU: "+7",
      JP: "+81",
      CN: "+86",
      KR: "+82",
      IN: "+91",
      BR: "+55",
      MX: "+52",
      AR: "+54",
      CL: "+56",
      CO: "+57",
      PE: "+51",
      ZA: "+27",
      NZ: "+64",
      SG: "+65",
      MY: "+60",
      TH: "+66",
      ID: "+62",
      PH: "+63",
      VN: "+84",
      AE: "+971",
      SA: "+966",
      IL: "+972",
      TR: "+90",
      EG: "+20",
    }
    
    const prefix = countryPrefixes[countryCode] || "+1"
    
    if (countryCode === "US" || countryCode === "CA") {
      const phoneDigits = digits.slice(0, 10)
      return phoneDigits ? `${prefix}${phoneDigits}` : ""
    }
    
    return digits ? `${prefix}${digits}` : ""
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneDisplay(value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Validate dates are present and valid
    if (!checkIn || !checkOut || !isValidCheckIn || !isValidCheckOut) {
      setError("Please select valid check-in and check-out dates")
      setIsSubmitting(false)
      return
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message || !formData.message.trim()) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const phoneDigits = getPhoneDigits(formData.phone)
      if (!phoneDigits || (formData.countryCode === "US" && phoneDigits.length !== 10)) {
        setError("Please enter a valid phone number")
        setIsSubmitting(false)
        return
      }

      const phoneForAPI = formatPhoneForAPI(phoneDigits, formData.countryCode)

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/inquiry-modal.tsx:196',message:'Modal onSubmit - message being sent',data:{message:formData.message,messageLength:formData.message.length,messageTrimmed:formData.message.trim(),messageTrimmedLength:formData.message.trim().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      await onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: phoneForAPI,
        countryCode: formData.countryCode,
        message: formData.message.trim(),
      })

      setSuccess(true)
      // Close modal after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
        // Reset form after modal closes
        setTimeout(() => {
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            countryCode: "US",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            message: "",
          })
          setSuccess(false)
          setError(null)
        }, 300)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to send inquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      // Reset form after modal closes
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "US",
          message: "",
        })
        setSuccess(false)
        setError(null)
      }, 300)
    }
  }

  // Safely parse and format dates
  const checkInDate = checkIn ? parseISO(checkIn) : null
  const checkOutDate = checkOut ? parseISO(checkOut) : null
  
  const isValidCheckIn = !!checkInDate && isValid(checkInDate)
  const isValidCheckOut = !!checkOutDate && isValid(checkOutDate)
  
  const formattedCheckIn = isValidCheckIn ? format(checkInDate, "EEEE, MMMM d, yyyy") : ""
  const formattedCheckOut = isValidCheckOut ? format(checkOutDate, "EEEE, MMMM d, yyyy") : ""
  const nights = isValidCheckIn && isValidCheckOut
    ? differenceInCalendarDays(checkOutDate, checkInDate)
    : 0

  const guestInfo = []
  if (guests && guests !== "0") {
    guestInfo.push(`${guests} ${guests === "1" ? "guest" : "guests"}`)
  }
  if (pets && pets !== "0") {
    guestInfo.push(`${pets} ${pets === "1" ? "pet" : "pets"}`)
  }
  if (infants && infants !== "0") {
    guestInfo.push(`${infants} ${infants === "1" ? "infant" : "infants"}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Inquiry for {cabinName}</DialogTitle>
          <DialogDescription>
            We'll get back to you soon about your inquiry for these dates.
          </DialogDescription>
        </DialogHeader>

        {/* Booking Summary */}
        {isValidCheckIn && isValidCheckOut && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Check-in:</span>
              <span className="text-sm font-medium">{formattedCheckIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Check-out:</span>
              <span className="text-sm font-medium">{formattedCheckOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="text-sm font-medium">{nights} {nights === 1 ? "night" : "nights"}</span>
            </div>
            {guestInfo.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Guests:</span>
                <span className="text-sm font-medium">{guestInfo.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Inquiry Sent Successfully!</h3>
              <p className="text-muted-foreground">
                We've received your inquiry and will get back to you soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inquiry-firstName">First Name *</Label>
                <Input
                  id="inquiry-firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inquiry-lastName">Last Name *</Label>
                <Input
                  id="inquiry-lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inquiry-email">Email *</Label>
                <Input
                  id="inquiry-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inquiry-phone">Phone *</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="inquiry-countryCode"
                    value={formData.countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    disabled={isSubmitting}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  >
                    <option value="US">🇺🇸 +1</option>
                    <option value="CA">🇨🇦 +1</option>
                    <option value="GB">🇬🇧 +44</option>
                    <option value="AU">🇦🇺 +61</option>
                    <option value="DE">🇩🇪 +49</option>
                    <option value="FR">🇫🇷 +33</option>
                    <option value="IT">🇮🇹 +39</option>
                    <option value="ES">🇪🇸 +34</option>
                    <option value="NL">🇳🇱 +31</option>
                    <option value="BE">🇧🇪 +32</option>
                    <option value="CH">🇨🇭 +41</option>
                    <option value="AT">🇦🇹 +43</option>
                    <option value="SE">🇸🇪 +46</option>
                    <option value="NO">🇳🇴 +47</option>
                    <option value="DK">🇩🇰 +45</option>
                    <option value="FI">🇫🇮 +358</option>
                    <option value="PL">🇵🇱 +48</option>
                    <option value="CZ">🇨🇿 +420</option>
                    <option value="IE">🇮🇪 +353</option>
                    <option value="PT">🇵🇹 +351</option>
                    <option value="GR">🇬🇷 +30</option>
                    <option value="RU">🇷🇺 +7</option>
                    <option value="JP">🇯🇵 +81</option>
                    <option value="CN">🇨🇳 +86</option>
                    <option value="KR">🇰🇷 +82</option>
                    <option value="IN">🇮🇳 +91</option>
                    <option value="BR">🇧🇷 +55</option>
                    <option value="MX">🇲🇽 +52</option>
                    <option value="AR">🇦🇷 +54</option>
                    <option value="CL">🇨🇱 +56</option>
                    <option value="CO">🇨🇴 +57</option>
                    <option value="PE">🇵🇪 +51</option>
                    <option value="ZA">🇿🇦 +27</option>
                    <option value="NZ">🇳🇿 +64</option>
                    <option value="SG">🇸🇬 +65</option>
                    <option value="MY">🇲🇾 +60</option>
                    <option value="TH">🇹🇭 +66</option>
                    <option value="ID">🇮🇩 +62</option>
                    <option value="PH">🇵🇭 +63</option>
                    <option value="VN">🇻🇳 +84</option>
                    <option value="AE">🇦🇪 +971</option>
                    <option value="SA">🇸🇦 +966</option>
                    <option value="IL">🇮🇱 +972</option>
                    <option value="TR">🇹🇷 +90</option>
                    <option value="EG">🇪🇬 +20</option>
                  </select>
                  <Input
                    id="inquiry-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex-1"
                    placeholder={formData.countryCode === "US" || formData.countryCode === "CA" ? "(555) 123-4567" : "Phone number"}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="inquiry-message">Message *</Label>
              <Textarea
                id="inquiry-message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                required
                disabled={isSubmitting}
                className="mt-1"
                rows={4}
                placeholder="Please tell us about your inquiry..."
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Inquiry"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
