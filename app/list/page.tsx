'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast, { useToast } from '@/components/Toast'
import type { Page } from '@/lib/types'

export default function ListPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { toast, showToast, hideToast } = useToast()

  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadPages = useCallback(async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      showToast('페이지 목록을 불러올 수 없습니다.', 'error')
      setLoading(false)
      return
    }

    setPages(data || [])
    setLoading(false)
  }, [supabase, showToast])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    showToast('URL이 복사되었습니다!', 'success')
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 페이지를 삭제하시겠습니까?`)) return

    const { error } = await supabase.from('pages').delete().eq('id', id)

    if (error) {
      showToast('삭제에 실패했습니다.', 'error')
      return
    }

    setPages(pages.filter((p) => p.id !== id))
    showToast('삭제되었습니다.', 'success')
  }

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* 헤더 */}
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">My CodePen</h1>
          <a
            href="/editor"
            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
          >
            + 새 문서
          </a>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* 컨텐츠 */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">내 문서 목록</h2>
          <div className="w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 또는 slug 검색..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-10">로딩 중...</div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {search ? '검색 결과가 없습니다.' : '아직 작성한 문서가 없습니다.'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    수정일
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={`/editor?slug=${page.slug}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {page.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm font-mono">
                      {page.slug}
                    </td>
                    <td className="px-4 py-3">
                      {page.is_published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          게시됨
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          초안
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {formatDate(page.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/editor?slug=${page.slug}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          편집
                        </a>
                        {page.is_published && (
                          <>
                            <a
                              href={`/p/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline text-sm"
                            >
                              보기
                            </a>
                            <button
                              onClick={() => handleCopyUrl(page.slug)}
                              className="text-gray-600 hover:underline text-sm"
                            >
                              URL 복사
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
