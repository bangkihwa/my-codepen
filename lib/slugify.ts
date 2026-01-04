/**
 * 제목을 URL-friendly slug로 변환
 * 규칙: 소문자, 공백은 -, 특수문자 제거
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/[\s_]+/g, '-') // 공백/언더스코어를 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-+|-+$/g, '') // 시작/끝 하이픈 제거
}

/**
 * slug 유효성 검사
 * 규칙: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * 중복 slug에 숫자 접미사 추가
 */
export function appendSuffix(slug: string, suffix: number): string {
  return `${slug}-${suffix}`
}
