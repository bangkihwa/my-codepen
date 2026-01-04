import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicPageClient from './PublicPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('public_pages')
    .select('title')
    .eq('slug', slug)
    .single()

  return {
    title: data?.title || 'Page Not Found',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('public_pages')
    .select('title, html_content')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    notFound()
  }

  return <PublicPageClient title={data.title} htmlContent={data.html_content} />
}
