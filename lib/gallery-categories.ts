/**
 * Hardcoded image categorization for gallery
 * This file maps image URLs to their categories.
 * Images are categorized manually to ensure accuracy.
 * 
 * Last updated: 2026-01-12T03:33:07.504Z
 */

export interface ImageCategoryMapping {
  url: string
  category: "exterior" | "interior" | "nature" | "details"
  cabinSlug: string
}

/**
 * Hardcoded image category mappings
 * Format: { url: string, category: "exterior" | "interior" | "nature" | "details", cabinSlug: string }
 */
export const IMAGE_CATEGORY_MAP: ImageCategoryMapping[] = [
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-Vdbk--jmFihfujiTDSlsRxIYJ1PCZaHeIxgBkH7hW6sk-69645dbe7bf0c", category: "details", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/fa1f2d32-eb11-481c-80c7-0fcb28b35afe.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/81df38ed-21dc-415c-8f10-c6979ac1fe59.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-SvmsdLwInlEP--Hg2sAroVvAjvVHjCHtr3afEPFybM-0-69645db8cd497", category: "interior", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1586000198776188904/original/4d4892d9-0137-447e-89ed-ff5a2161a758.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-mClY-iZd1zJb8gNVhPryJyhUsCAKwB9-nTEx-zVMdqE-69645db31db29", category: "exterior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-b--Ke--GeqZ101Ap20hh0c1KgxDfUwho--Hqb0bhhqmQhM-69645dc354bb0", category: "exterior", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/d3b64f3a-4c2b-44ff-8838-4d5ea9c728f0.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-Ggf----dbCPj-lxdGstTpIpB9HB36cLRKxOxMYpBYEsCI-69645dc5ef27a", category: "nature", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-SO8iR7wNo-tNuaD4jMUyKc9f9mlOps3hskhEU9YFvcQ-696419ad4b435", category: "interior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab", category: "exterior", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/bfdeded2-ac3e-4ee7-8354-8640064841cc.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/83dc496b-dc94-4c44-8b56-9091f4a3113b.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-tYc2dQqNwRBIPWIcBvvuHOwwZFl4X3WiM4ZsS7--YHFk-69645d9f6132c", category: "details", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-RgiUbt8Txv--3yyCogTkA4y5nluqen4Y03fPtSch7Ayw-69645da3094b3", category: "exterior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-hR5KUkrirOYE2oPQwBdHHAKN437Ws6z0JiL--m0vZMzU-6964197f48d73", category: "details", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/be0e0195-cb53-44a6-84f0-c8e608491811.jpeg?aki_policy=xx_large", category: "nature", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341---h6HRH6IzztMGJyOB42TM9---9vLrYJh9Fg077iIRPOA-6964196aefb53", category: "nature", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/7dd4c75a-f44c-4b7d-8b1a-8026666dbafd.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-SDG3e1cLDzSgE3-075MTqktBzHPfPdGP4hrhrFPArJA-69641919ba8f5", category: "exterior", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/ce396d82-373a-4903-947d-bfdef846a39c.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/933ee2dc-c03a-444b-8d43-a73c02a27193.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/f513fa08-db62-4407-8885-cd17100d7112.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/dbd66193-9958-4690-be10-462419547396.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/d7e27300-609f-4249-89d9-0dc990842213.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/79cff0bc-68db-454c-905f-5db8fd3d0738.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-cIk6eH7UYtuIsYWd1PqXpMlDeNkrKUk--g9fiOohG5lo-69645d3c0fd78", category: "exterior", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/a7d96683-b21f-4b07-82a8-2f3b4e6157c0.jpeg?aki_policy=xx_large", category: "nature", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/66c7f831-0ff2-47ee-8a87-2004f4250f94.jpeg?aki_policy=xx_large", category: "nature", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/914f82ae-397a-4a91-ada2-ad199f810403.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-FvezH3JrFB9c-L5VchptYBx4uHixPErk4AdCjsGU--tc-696418da853d3", category: "details", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-aWSI4y8gOzVkrZbil--lXezkJYj--jEpx3S03UUuIjjsY-696418d1bc5f8", category: "details", cabinSlug: "sol" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/1cd41b53-2413-434f-bc20-d5a5991ca4aa.jpeg?aki_policy=xx_large", category: "nature", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-ns74bNy-jn0InnoC3H6r7vwO3mClR4X5cM0qO--iXkZA-696418d0a1fdd", category: "nature", cabinSlug: "sol" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-nTitRCBzdlcfJPZ--RUuc4Z--3QS9V--DDwdL0Vm0RcW2M-69641a10e1ed8", category: "nature", cabinSlug: "mist" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/ead73349-608f-4d1e-9b25-c7c90d5897fa.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "mist" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-Q5CtMQVDe1I5FAVqbhevPx-c0TPce9GYm7qXnsAH5Y8-696419fdd6513", category: "details", cabinSlug: "mist" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-dPjfpBphPoRuYDkXnuK4dd4MikhVmW6mSpSn9MkXgbc-696419ee91968", category: "exterior", cabinSlug: "mist" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/40fa9a6e-87f7-42b0-9a13-0de34e77dc6a.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "mist" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/b9b65b55-4e73-4612-9a3a-917915969195.jpeg?aki_policy=xx_large", category: "exterior", cabinSlug: "mist" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-nl1AP7QerBeCEZ8vU3p64a6XXTflnB0CTihrFokT0pc-69641967336ba", category: "nature", cabinSlug: "moss" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-veW5--dYnFy1b0WHdheK-yA93PSQSGe8STNAvX2HEo6E-69645d918fa1f", category: "details", cabinSlug: "moss" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-9IHPXhn0r1-cVdySkIjxZ--fT44orqy8Eoo96Cw1y-lU-69645d816a555", category: "interior", cabinSlug: "moss" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1588845522414320813/original/0c9ce1e6-da4c-4716-8721-e40179cd8efa.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "moss" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1588845522414320813/original/a0290f3f-2388-4bdc-a43d-545d4da1950c.jpeg?aki_policy=xx_large", category: "details", cabinSlug: "moss" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/07616e3e-3a3a-4ae6-a287-a80f6e5ea539.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "dew" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1586000198776188904/original/cc69e968-3d4b-4f15-a59e-543671e8b65f.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "dew" },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-afnockOZmVhWUscVAkS41CF55hdZ4gOCsRcCZILhu3Y-69641a17d2027", category: "interior", cabinSlug: "mist" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/6e9c67a9-69f4-492b-b6fc-7fe00733d931.jpeg?aki_policy=xx_large", category: "interior", cabinSlug: "mist" },
]

/**
 * Get category for an image URL
 */
export function getImageCategory(url: string): "exterior" | "interior" | "nature" | "details" | null {
  const mapping = IMAGE_CATEGORY_MAP.find((m) => m.url === url)
  return mapping?.category || null
}

/**
 * Get cabin slug for an image URL
 */
export function getImageCabinSlug(url: string): string | null {
  const mapping = IMAGE_CATEGORY_MAP.find((m) => m.url === url)
  return mapping?.cabinSlug || null
}
