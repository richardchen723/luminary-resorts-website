"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"

interface MicrosoftClarityProps {
  projectId?: string
}

const INTERNAL_PATH_PREFIXES = ["/admin", "/admin-auth", "/tools"]

export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  const pathname = usePathname()
  const clarityProjectId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "xiveqva5rg"
  const isInternalPath = INTERNAL_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  if (!clarityProjectId || isInternalPath) {
    return null
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});
        `,
      }}
    />
  )
}
