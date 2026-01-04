'use client'

import { useEffect, useRef, memo } from 'react'

interface PreviewFrameProps {
  htmlContent: string
  className?: string
}

function PreviewFrameInner({ htmlContent, className = '' }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const prevHtmlRef = useRef<string>('')
  const prevUrlRef = useRef<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 완전한 HTML 문서가 아닌 경우에만 기본 래퍼 추가
  const getFullHtml = (html: string) => {
    const hasDoctype = /<!DOCTYPE/i.test(html)
    const hasHtmlTag = /<html/i.test(html)

    if (!hasDoctype && !hasHtmlTag) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${html}
</body>
</html>`
    }
    return html
  }

  useEffect(() => {
    // 디바운스 처리
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const fullHtml = getFullHtml(htmlContent)

      // HTML이 실제로 변경된 경우에만 업데이트
      if (fullHtml === prevHtmlRef.current) return
      prevHtmlRef.current = fullHtml

      // 이전 URL 해제
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
      }

      // blob URL을 사용
      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url
      iframe.src = url
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [htmlContent])

  // 컴포넌트 언마운트 시 URL 정리
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
      }
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      className={`w-full h-full border-0 bg-white ${className}`}
      title="Preview"
    />
  )
}

// memo로 감싸서 불필요한 리렌더링 방지
const PreviewFrame = memo(PreviewFrameInner, (prevProps, nextProps) => {
  // htmlContent가 같으면 리렌더링하지 않음
  return prevProps.htmlContent === nextProps.htmlContent
})

export default PreviewFrame
