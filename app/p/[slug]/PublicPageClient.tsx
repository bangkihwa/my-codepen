'use client'

import { useEffect, useRef } from 'react'

interface PublicPageClientProps {
  title: string
  htmlContent: string
}

export default function PublicPageClient({ title, htmlContent }: PublicPageClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Blob URL을 사용하여 완전한 HTML 페이지 렌더링
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [htmlContent])

  return (
    <div style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        title={title}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}
