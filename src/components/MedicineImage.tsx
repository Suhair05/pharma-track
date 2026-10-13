
import React, { useEffect, useState } from 'react';
import { ImageOff, Pill } from 'lucide-react';

interface MedicineImageProps {
  name: string;
  category: string;
  presentation: string;
  className?: string;
}

interface CommonsImage {
  title: string;
  imageinfo?: {
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    mime?: string;
  }[];
}

interface CommonsSearchResponse {
  query?: {
    pages?: Record<string, CommonsImage>;
  };
}

const IMAGE_CACHE = new Map<string, CommonsImage | null>();

// Generic fallback images for different medicine types.
const FALLBACK_IMAGES = {
  tablets:
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
  capsules:
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80',
  supplies:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
};

// Product-specific fallbacks for medicines that failed to load previously.
const PRODUCT_FALLBACKS: Record<string, string> = {
  ibuprofen: FALLBACK_IMAGES.tablets,
  zinc: FALLBACK_IMAGES.capsules,
  artemether: FALLBACK_IMAGES.tablets,
};

const getFallbackImage = (
  name: string,
  category: string,
  presentation: string,
): string => {
  const normalizedName = name.toLowerCase();
  const medicineDetails = `${category} ${presentation}`.toLowerCase();

  if (normalizedName.includes('ibuprofen')) {
    return PRODUCT_FALLBACKS.ibuprofen;
  }

  if (normalizedName.includes('zinc sulfate')) {
    return PRODUCT_FALLBACKS.zinc;
  }

  if (
    normalizedName.includes('artemether') ||
    normalizedName.includes('artemeter') ||
    normalizedName.includes('lumefantrine')
  ) {
    return PRODUCT_FALLBACKS.artemether;
  }

  if (/supply|equipment|dressing|protective/.test(medicineDetails)) {
    return FALLBACK_IMAGES.supplies;
  }

  if (/capsule/i.test(`${name} ${presentation}`)) {
    return FALLBACK_IMAGES.capsules;
  }

  return FALLBACK_IMAGES.tablets;
};

const searchMedicineImage = async (
  medicineName: string,
  category: string,
  presentation: string,
): Promise<CommonsImage | null> => {
  const correctedName = medicineName.replace(
    /\bartemeter\b/gi,
    'artemether',
  );

  const cleanedName = correctedName
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const queries = [
    correctedName,
    `${correctedName} medicine`,
    `${cleanedName} ${presentation}`,
    `${cleanedName} ${category}`,
  ].filter(
    (query, index, allQueries) =>
      query.trim() && allQueries.indexOf(query) === index,
  );

  for (const searchQuery of queries) {
    const cacheKey = searchQuery.toLowerCase();

    if (IMAGE_CACHE.has(cacheKey)) {
      const cachedImage = IMAGE_CACHE.get(cacheKey);

      if (cachedImage) {
        return cachedImage;
      }

      continue;
    }

    try {
      const parameters = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: searchQuery,
        gsrnamespace: '6',
        gsrlimit: '10',
        prop: 'imageinfo',
        iiprop: 'url|mime',
        iiurlwidth: '900',
        format: 'json',
        origin: '*',
      });

      const response = await fetch(
        `https://commons.wikimedia.org/w/api.php?${parameters}`,
      );

      if (!response.ok) {
        IMAGE_CACHE.set(cacheKey, null);
        continue;
      }

      const data =
        (await response.json()) as CommonsSearchResponse;

      const pages = Object.values(data.query?.pages ?? {});

      const matchingImage = pages.find((page) => {
        const imageInfo = page.imageinfo?.[0];

        return (
          Boolean(imageInfo?.thumburl ?? imageInfo?.url) &&
          /^image\/(jpeg|png|webp|gif)$/i.test(
            imageInfo?.mime ?? '',
          )
        );
      });

      const result = matchingImage ?? null;
      IMAGE_CACHE.set(cacheKey, result);

      if (result) {
        return result;
      }
    } catch {
      // Continue to the next search query.
      IMAGE_CACHE.set(cacheKey, null);
    }
  }

  return null;
};

export const MedicineImage: React.FC<MedicineImageProps> = ({
  name,
  category,
  presentation,
  className = '',
}) => {
  const [image, setImage] = useState<CommonsImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchImageFailed, setSearchImageFailed] = useState(false);
  const [fallbackImageFailed, setFallbackImageFailed] = useState(false);

  useEffect(() => {
    let active = true;

    setImage(null);
    setLoading(true);
    setSearchImageFailed(false);
    setFallbackImageFailed(false);

    searchMedicineImage(name, category, presentation)
      .then((result) => {
        if (active) {
          setImage(result);
        }
      })
      .catch(() => {
        if (active) {
          setImage(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [name, category, presentation]);

  const imageInfo = image?.imageinfo?.[0];
  const searchedImageUrl = imageInfo?.thumburl ?? imageInfo?.url;

  const fallbackImageUrl = getFallbackImage(
    name,
    category,
    presentation,
  );

  const usingSearchImage = Boolean(
    searchedImageUrl && !searchImageFailed,
  );

  const imageUrl = usingSearchImage
    ? searchedImageUrl
    : !fallbackImageFailed
      ? fallbackImageUrl
      : undefined;

  const handleImageError = () => {
    if (usingSearchImage) {
      setSearchImageFailed(true);
    } else {
      setFallbackImageFailed(true);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-linear-to-br from-teal-50 via-sky-50 to-slate-100 ${className}`}
    >
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`Illustrative image for ${name}`}
          loading="lazy"
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          {loading ? (
            <Pill
              aria-hidden="true"
              className="h-12 w-12 animate-pulse"
              strokeWidth={1.25}
            />
          ) : (
            <ImageOff
              aria-hidden="true"
              className="h-12 w-12"
              strokeWidth={1.25}
            />
          )}

          {!loading && (
            <span className="text-xs">Image unavailable</span>
          )}
        </div>
      )}

      <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
        Illustrative image
      </span>

      {usingSearchImage &&
        imageInfo?.descriptionurl &&
        !searchImageFailed && (
          <a
            href={imageInfo.descriptionurl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm"
          >
            Image source
          </a>
        )}
    </div>
  );
};