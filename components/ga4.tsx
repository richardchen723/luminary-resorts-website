"use client"

import Script from "next/script"

interface GA4Props {
  measurementId?: string
}

export function GA4({ measurementId }: GA4Props) {
  // Get measurement ID from environment variable, prop, or use default
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VVQZVV2FTS'

  return (
    <>
      {/* Google tag (gtag.js) - Load lazily to improve initial page performance */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga4-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
