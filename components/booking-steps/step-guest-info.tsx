"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { HostawayGuestInfo } from "@/types/hostaway"

interface StepGuestInfoProps {
  guestInfo: Partial<HostawayGuestInfo>
  onUpdate: (guestInfo: Partial<HostawayGuestInfo>) => void
}

export function StepGuestInfo({ guestInfo, onUpdate }: StepGuestInfoProps) {
  // Format phone number for display (US format: (XXX) XXX-XXXX)
  const formatPhoneDisplay = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")
    
    // Limit to 10 digits for US/Canada format
    const limitedDigits = digits.slice(0, 10)
    
    if (limitedDigits.length === 0) return ""
    if (limitedDigits.length <= 3) return `(${limitedDigits}`
    if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`
    }
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
  }

  // Extract phone digits from existing phone value (might have country code prefix)
  const getInitialPhoneDisplay = (phone: string): string => {
    if (!phone) return ""
    // Remove country code prefix if present (e.g., +1, +44)
    const digits = phone.replace(/\D/g, "")
    // For US/Canada, take last 10 digits; for others, take all digits
    const phoneDigits = digits.length > 10 && digits.startsWith("1") ? digits.slice(1) : digits.slice(-10)
    return formatPhoneDisplay(phoneDigits)
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
    
    // For US/Canada, ensure 10 digits
    if (countryCode === "US" || countryCode === "CA") {
      const phoneDigits = digits.slice(0, 10)
      return phoneDigits ? `${prefix}${phoneDigits}` : ""
    }
    
    // For other countries, add prefix with digits
    return digits ? `${prefix}${digits}` : ""
  }

  const [formData, setFormData] = useState<Partial<HostawayGuestInfo>>({
    firstName: guestInfo.firstName || "",
    lastName: guestInfo.lastName || "",
    email: guestInfo.email || "",
    phone: getInitialPhoneDisplay(guestInfo.phone || ""),
    countryCode: guestInfo.countryCode || "US",
    address: guestInfo.address || "",
    city: guestInfo.city || "",
    state: guestInfo.state || "",
    zipCode: guestInfo.zipCode || "",
    specialRequests: guestInfo.specialRequests || "",
  })

  // Update parent with phone formatted for API (with country code)
  const updateParent = (updates: Partial<HostawayGuestInfo>) => {
    const phoneDigits = getPhoneDigits(updates.phone !== undefined ? updates.phone : formData.phone || "")
    const countryCode = updates.countryCode || formData.countryCode || "US"
    const phoneForAPI = formatPhoneForAPI(phoneDigits, countryCode)
    
    onUpdate({
      ...updates,
      phone: phoneForAPI, // Always send phone with country code to parent
    })
  }

  const handleChange = (field: keyof HostawayGuestInfo, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    updateParent(updated)
  }

  const handlePhoneChange = (value: string) => {
    // Format for display: (XXX) XXX-XXXX (no country code prefix)
    const formatted = formatPhoneDisplay(value)
    const updated = { ...formData, phone: formatted }
    setFormData(updated)
    updateParent(updated)
  }
  
  const handleCountryCodeChange = (value: string) => {
    const updated = { ...formData, countryCode: value }
    setFormData(updated)
    updateParent(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Guest Information</h2>
        <p className="text-muted-foreground">Please provide your contact information.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <div className="flex gap-2 mt-1">
                <select
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={(e) => handleCountryCodeChange(e.target.value)}
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
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                  className="flex-1"
                  placeholder={formData.countryCode === "US" || formData.countryCode === "CA" ? "(555) 123-4567" : "Phone number"}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Any special requests or notes for your stay..."
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
