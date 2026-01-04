'use client'

import { useEffect, useRef } from 'react'

interface PreviewFrameProps {
  htmlContent: string
  className?: string
}

export default function PreviewFrame({ htmlContent, className = '' }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 완전한 HTML 문서가 아닌 경우에만 기본 래퍼 추가
  const hasDoctype = /<!DOCTYPE/i.test(htmlContent)
  const hasHtmlTag = /<html/i.test(htmlContent)

  let fullHtml = htmlContent

  if (!hasDoctype && !hasHtmlTag) {
    fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${htmlContent}
</body>
</html>`
  }

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // blob URL을 사용하여 CSP 우회
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url

    return () => {
      URL.revokeObjectURL(url)
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
