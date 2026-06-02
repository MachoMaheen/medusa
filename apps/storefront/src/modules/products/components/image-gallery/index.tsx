import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

/**
 * Wave 2.8 — PDP image gallery.
 *
 * Each frame:
 *   - bg-ui-bg-base (#ffffff) white card surface
 *   - border-ui-border-base, rounded-xl (12px) — Happilee large-card radius
 *   - shadow-hap-sm — floating-card token from skill
 *   - Aspect ratio kept (29/34) so vertical product photography is uncropped.
 */
type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex flex-col gap-lg" data-testid="product-image-gallery">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-base border border-ui-border-base rounded-xl shadow-hap-sm"
          id={image.id}
        >
          {!!image.url && (
            <Image
              src={image.url}
              priority={index <= 2}
              className="absolute inset-0"
              alt={`Product image ${index + 1}`}
              fill
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ImageGallery
