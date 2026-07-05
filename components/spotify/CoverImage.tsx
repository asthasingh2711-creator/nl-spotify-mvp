'use client'

import { useState } from 'react'
import { stockCover } from '@/lib/stock-images'

interface CoverImageProps {
  src?: string
  seed: string
  alt?: string
  className?: string
}

export function CoverImage({ src, seed, alt = '', className }: CoverImageProps) {
  const [failed, setFailed] = useState(false)
  const resolved = !src || failed || src.includes('placehold.co') ? stockCover(seed) : src

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
