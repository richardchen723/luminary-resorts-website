/**
 * Hardcoded image categorization for gallery
 * This file maps image URLs to their categories.
 * Images are categorized manually to ensure accuracy.
 * 
 * Last updated: 2026-02-13T13:59:48.633Z
 */

export interface ImageCategoryMapping {
  url: string
  category: "exterior" | "interior" | "nature" | "details"
  cabinSlug: string
  index?: number
}

/**
 * Hardcoded image category mappings
 * Format: { url: string, category: "exterior" | "interior" | "nature" | "details", cabinSlug: string }
 */
export const IMAGE_CATEGORY_MAP: ImageCategoryMapping[] = [
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-r1eAkm56YTq--s--jiMNVsSJmRb-1OxZ9lTQIoM9pfY50-696db360b4346", category: "interior", cabinSlug: "dew", index: 1 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-R7e0JvqVXgRSmPltBmidMyQlEZOKG59LmlIdEjdsQp0-696db35fb3b17", category: "interior", cabinSlug: "dew", index: 5 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-spttxHJEgNajVF2TyWHOgZU6qqQW73zcmPDcZeW0Wl8-696dac93a64e7", category: "interior", cabinSlug: "dew", index: 6 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-GkWvW7cB1CAbfQSNnbAw0keqa7lAVH--1V9k3ZCJ342w-696dac97b9b44", category: "interior", cabinSlug: "dew", index: 8 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341---X2SNe0ohPNM7N--dnEAflUJj0l-oin8H1-hWrVF-6lA-696dac8db70e9", category: "exterior", cabinSlug: "dew", index: 11 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-ykgu--wn3WewI5OnTHD7GQMlGva2gJ3KG4OJ-ddX--5n4-696dac8cbf6b3", category: "exterior", cabinSlug: "dew", index: 12 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-jykmD--FLkS2bvN2l-bEcGyjHA8F238a3DlTJKjKILq8-696dac8bb9f99", category: "exterior", cabinSlug: "dew", index: 13 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-rHTBjW1bT43lJ6QaQamSHygtvEtiHLlIrNOtt45hEZY-696dac8aad4e5", category: "nature", cabinSlug: "dew", index: 14 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-LBUiR1hGzf80Qa1zLgEymS3WmmQEoydlSu6LVup-NFk-696dac898f963", category: "nature", cabinSlug: "dew", index: 15 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-0JLeL8sw7H9Gw3DRvs7yxLuTvFDkY4lPkS9dWBy5BgE-696dac98cc3be", category: "exterior", cabinSlug: "dew", index: 17 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-03rj8itLlSqC92PecwNTquE7oH2WQmVBqFsmnwiqxkk-696daca11f0a2", category: "exterior", cabinSlug: "dew", index: 18 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-78tZKmv-2aKzIyvT6G7EkoxOABhVFwwXvF49GHgaL4M-696dac737d95d", category: "interior", cabinSlug: "sol", index: 0 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-53tpfWAiv4BAaywMipGyG2ye12YirDvdabAJ5jPkPwI-696dac746577c", category: "exterior", cabinSlug: "sol", index: 1 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-OTjK8V8aZht0DIqbGFFRytSQwWZxMQ8n--qM7qQ1XzNc-696dac6ad1085", category: "interior", cabinSlug: "sol", index: 2 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-FlwH-42rB0Hw82zSKzvXzT-pBF6hiMf1ZADVKYCBGpI-696dac6eb5430", category: "exterior", cabinSlug: "sol", index: 3 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-HA9Lnt5Qnz3k37jJbeMSxzJoW5sbcLDZodP8jvF6Poo-696db35ecf293", category: "exterior", cabinSlug: "sol", index: 4 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-KrSrCzlROo09X90rLrAp8ZZoxBizupXSwamOpfS-GyA-696dac6fad5c3", category: "interior", cabinSlug: "sol", index: 5 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-tdw-Oodl97NpQYBNhvVhgn4J67TeTrPx1NpqH2VjGfo-696dba6d8431f", category: "details", cabinSlug: "sol", index: 9 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-znKOlONVuTrjJWlZfoFsXxUDlx--ykzcJ3WmqWphPQcY-696dac66818be", category: "interior", cabinSlug: "sol", index: 10 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-Z7uXH8NsXXXAriZEJuvQdGwUGaDV7k54OuC1i7fE5aA-696dac6578103", category: "details", cabinSlug: "sol", index: 11 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-OwXIcexEx8kJ6r3VsvRbpppK--slriAhAReDUDClVmEQ-696dac64866b0", category: "interior", cabinSlug: "sol", index: 12 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-uuQUJrew7DVj658dnAzonYFmjChyL8jAlNdWlHnjuE8-696dac63470bc", category: "details", cabinSlug: "sol", index: 13 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-2K4YiwJh0jA402dzHRjLPCoCQMk62pSAuR-sJK6kswM-696dacee2ec84", category: "interior", cabinSlug: "mist", index: 0 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-mWHogWSHFLa9Y86Kjq0OsBpH628QNZgq10Ejrp01-34-696daceaab918", category: "interior", cabinSlug: "mist", index: 1 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-5KL2nMay7areRmTQU7SEiNrJoJ8YOSmrYCK7Ax4Wm4E-696dacecee4d3", category: "interior", cabinSlug: "mist", index: 3 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-18vJX2v--QHmQsxYpKIjAbT-wA3xYjO-NlbhtF4hOSPM-696dace995860", category: "nature", cabinSlug: "mist", index: 4 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-rE6Iho3kLavF9nKoeAcorAKnodIoI4q2wkp7OWeHuIo-696dace5054b4", category: "interior", cabinSlug: "mist", index: 5 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-WBnH07uRriYTH2Nbqp3NPlFZ8vy2PHZqiM0Q3IUyawE-696dace3e7ef7", category: "exterior", cabinSlug: "mist", index: 6 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339---2rK2tYiqZ4KoblEFGl0g90o--FZY1ZZRqnbiF0KnPKg-696dace2c2512", category: "details", cabinSlug: "mist", index: 7 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-pfArvMq381gVslDbSlePQnha8T0kyNvHGKaI791RqQs-696dacc3974e9", category: "nature", cabinSlug: "moss", index: 0 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-airlDsrgY9aLyhu3dSNa72geBOsQcX75s9NuMYkAd44-696dacc27a890", category: "interior", cabinSlug: "moss", index: 1 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-qZPot-P9rrUWKHob50HDnGT3e0xhzS9qpcRycNulLzo-696dacc17802e", category: "exterior", cabinSlug: "moss", index: 2 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338---R20zpnhYaKfRPldViD8sL-yeZHGWI9TYx7M7yeOIMw-696dacc03b567", category: "exterior", cabinSlug: "moss", index: 3 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-HWBmgjjjggDXRqP5ImMIRSEPOEVAHj5oMVXW2eEdM-o-696dacbf2e280", category: "details", cabinSlug: "moss", index: 4 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-ErHxrdVEIX57XpaFLp0Za8APQdmbw3KylwqM0TWrSQ0-696dac798d0cc", category: "details", cabinSlug: "dew", index: 27 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-TPHUMcZGsAYyWK--6DgMYCjn9bomuAoYZMIolWptoeMY-696dac755ce57", category: "nature", cabinSlug: "dew", index: 43 },
  { url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472340-aLuNb-MslMtaQoTBPKogckszsdgt3n4miTvkdRy3QHM-696dac4fa8725", category: "details", cabinSlug: "sol", index: 39 },
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
