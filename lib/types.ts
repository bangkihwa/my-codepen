export interface Page {
  id: string
  owner_id: string
  title: string
  slug: string
  html_content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PublicPage {
  slug: string
  title: string
  html_content: string
  updated_at: string
}

export type PageInsert = Omit<Page, 'id' | 'created_at' | 'updated_at'>
export type PageUpdate = Partial<Omit<Page, 'id' | 'owner_id' | 'created_at'>>
