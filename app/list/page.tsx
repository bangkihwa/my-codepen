'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast, { useToast } from '@/components/Toast'
import type { Page } from '@/lib/types'

// 아이콘 컴포넌트들
const PlusIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
))
PlusIcon.displayName = 'PlusIcon'

const SearchIcon = memo(() => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
))
SearchIcon.displayName = 'SearchIcon'

const EditIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
))
EditIcon.displayName = 'EditIcon'

const EyeIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
))
EyeIcon.displayName = 'EyeIcon'

const CopyIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
))
CopyIcon.displayName = 'CopyIcon'

const TrashIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
))
TrashIcon.displayName = 'TrashIcon'

const LogoutIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
))
LogoutIcon.displayName = 'LogoutIcon'

const CodeIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
))
CodeIcon.displayName = 'CodeIcon'

const DocumentIcon = memo(() => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
))
DocumentIcon.displayName = 'DocumentIcon'

// 카드 컴포넌트
const PageCard = memo(({
  page,
  onCopyUrl,
  onDelete,
  formatDate
}: {
  page: Page
  onCopyUrl: (slug: string) => void
  onDelete: (id: string, title: string) => void
  formatDate: (date: string) => string
}) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
    {/* 카드 미리보기 영역 */}
    <div className="h-40 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <DocumentIcon />
          <p className="text-xs text-gray-400 mt-2 font-mono">{page.slug}</p>
        </div>
      </div>
      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
        <a
          href={`/editor?slug=${page.slug}`}
          className="p-3 bg-white rounded-full text-gray-700 hover:bg-indigo-500 hover:text-white transition-colors"
          title="편집"
        >
          <EditIcon />
        </a>
        {page.is_published && (
          <>
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-full text-gray-700 hover:bg-emerald-500 hover:text-white transition-colors"
              title="보기"
            >
              <EyeIcon />
            </a>
            <button
              onClick={() => onCopyUrl(page.slug)}
              className="p-3 bg-white rounded-full text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
              title="URL 복사"
            >
              <CopyIcon />
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(page.id, page.title)}
          className="p-3 bg-white rounded-full text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
          title="삭제"
        >
          <TrashIcon />
        </button>
      </div>
      {/* 상태 뱃지 */}
      <div className="absolute top-3 right-3">
        {page.is_published ? (
          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
            게시됨
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-400 text-white text-xs font-medium rounded-full shadow-sm">
            초안
          </span>
        )}
      </div>
    </div>
    {/* 카드 정보 */}
    <div className="p-4">
      <a
        href={`/editor?slug=${page.slug}`}
        className="block group-hover:text-indigo-600 transition-colors"
      >
        <h3 className="font-semibold text-gray-800 truncate text-lg">{page.title}</h3>
      </a>
      <p className="text-sm text-gray-400 mt-1">{formatDate(page.updated_at)}</p>
    </div>
  </div>
))
PageCard.displayName = 'PageCard'

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

  const handleCopyUrl = useCallback((slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    showToast('URL이 복사되었습니다!', 'success')
  }, [showToast])

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`"${title}" 페이지를 삭제하시겠습니까?`)) return

    const { error } = await supabase.from('pages').delete().eq('id', id)

    if (error) {
      showToast('삭제에 실패했습니다.', 'error')
      return
    }

    setPages(prev => prev.filter((p) => p.id !== id))
    showToast('삭제되었습니다.', 'success')
  }, [supabase, showToast])

  const filteredPages = useMemo(() =>
    pages.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    ), [pages, search])

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  const stats = useMemo(() => ({
    total: pages.length,
    published: pages.filter(p => p.is_published).length,
    draft: pages.filter(p => !p.is_published).length,
  }), [pages])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/editor" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                  <CodeIcon />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My CodePen
                </span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/editor"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              >
                <PlusIcon />
                새 문서
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <LogoutIcon />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 타이틀 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">내 프로젝트</h1>
          <p className="text-gray-500">코드를 작성하고 공유하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">전체 문서</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">게시됨</p>
            <p className="text-3xl font-bold text-emerald-500">{stats.published}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">초안</p>
            <p className="text-3xl font-bold text-gray-400">{stats.draft}</p>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="프로젝트 검색..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 프로젝트 그리드 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">로딩 중...</p>
            </div>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {search ? '검색 결과가 없습니다' : '아직 프로젝트가 없어요'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search ? '다른 검색어를 시도해보세요' : '첫 번째 프로젝트를 만들어보세요!'}
            </p>
            {!search && (
              <a
                href="/editor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <PlusIcon />
                새 프로젝트 시작하기
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
