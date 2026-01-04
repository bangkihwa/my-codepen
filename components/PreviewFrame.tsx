'use client'

import { useEffect, useRef, useState } from 'react'

interface PreviewFrameProps {
  htmlContent: string
  className?: string
}

export default function PreviewFrame({ htmlContent, className = '' }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [debouncedHtml, setDebouncedHtml] = useState(htmlContent)
  const prevUrlRef = useRef<string | null>(null)

  // 디바운스: 타이핑 멈춘 후 300ms 후에 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlContent)
    }, 300)

    return () => clearTimeout(timer)
  }, [htmlContent])

  // 완전한 HTML 문서가 아닌 경우에만 기본 래퍼 추가
  const hasDoctype = /<!DOCTYPE/i.test(debouncedHtml)
  const hasHtmlTag = /<html/i.test(debouncedHtml)

  let fullHtml = debouncedHtml

  if (!hasDoctype && !hasHtmlTag) {
    fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${debouncedHtml}
</body>
</html>`
  }

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !fullHtml) return

    // 이전 URL 해제
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
    }

    // blob URL을 사용하여 CSP 우회
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    prevUrlRef.current = url
    iframe.src = url

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
        prevUrlRef.current = null
      }
    }
  }, [fullHtml])

  return (
    <iframe
      ref={iframeRef}
      className={`w-full h-full border-0 bg-white ${className}`}
      title="Preview"
    />
  )
}
