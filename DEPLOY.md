# My CodePen 배포 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: `my-codepen`)
4. 데이터베이스 비밀번호 설정 (안전한 곳에 저장)
5. Region 선택 (Northeast Asia - Tokyo 권장)
6. "Create new project" 클릭

### 1.2 Authentication 설정
1. 좌측 메뉴에서 **Authentication** > **Providers** 클릭
2. **Email** 활성화 확인 (기본 활성화됨)
3. **Settings** > **Auth Settings**에서:
   - "Enable email confirmations" 체크 해제 (개인용이므로 이메일 인증 불필요)
   - "Enable manual linking" 체크 (선택)
4. **Save** 클릭

### 1.3 사용자 계정 생성
1. **Authentication** > **Users** 클릭
2. **Add user** > **Create new user** 클릭
3. 본인 이메일과 비밀번호 입력
4. "Auto confirm user" 체크
5. **Create user** 클릭

### 1.4 데이터베이스 스키마 설정
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사하여 붙여넣기
4. **Run** 클릭
5. 성공 메시지 확인

### 1.5 API 키 확인
1. 좌측 메뉴에서 **Project Settings** (톱니바퀴 아이콘) 클릭
2. **API** 메뉴 클릭
3. 다음 값들을 복사해 둠:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIs...` (긴 문자열)

---

## 2. 로컬 개발 환경 설정

### 2.1 환경변수 설정
```bash
# 프로젝트 폴더로 이동
cd my-codepen

# .env.local 파일 생성
cp .env.local.example .env.local
```

`.env.local` 파일 수정:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 2.2 의존성 설치 및 개발 서버 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 테스트

---

## 3. Vercel 배포

### 3.1 GitHub 저장소 생성
1. [GitHub](https://github.com) 접속
2. **New repository** 클릭
3. 저장소 이름 입력 (예: `my-codepen`)
4. Private 선택 (권장)
5. **Create repository** 클릭

### 3.2 코드 푸시
```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/my-codepen.git
git branch -M main
git push -u origin main
```

### 3.3 Vercel 배포
1. [Vercel](https://vercel.com) 접속 후 로그인
2. **Add New...** > **Project** 클릭
3. GitHub 저장소 연결 (Import Git Repository)
4. `my-codepen` 저장소 선택
5. **Environment Variables** 섹션에서:
   - `NEXT_PUBLIC_SUPABASE_URL` 추가
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
6. **Deploy** 클릭
7. 배포 완료 후 URL 확인 (예: `https://my-codepen.vercel.app`)

### 3.4 Supabase URL 허용 설정
1. Supabase 대시보드로 이동
2. **Authentication** > **URL Configuration** 클릭
3. **Site URL**에 Vercel 배포 URL 입력
4. **Redirect URLs**에도 Vercel URL 추가 (예: `https://my-codepen.vercel.app/**`)
5. **Save** 클릭

---

## 4. 사용 방법

### 4.1 로그인
1. 배포된 URL 접속
2. Supabase에서 생성한 이메일/비밀번호로 로그인

### 4.2 문서 작성
1. 에디터에서 제목 입력
2. HTML 코드 작성 (우측에 실시간 미리보기)
3. **저장** 버튼 클릭 (또는 Ctrl+S)

### 4.3 게시
1. **게시** 버튼 클릭
2. 공개 URL 확인 및 복사
3. 링크 공유

---

## 5. 보안 설명

### 5.1 iframe sandbox 설정
미리보기와 공개 페이지에서 사용하는 iframe은 다음과 같이 제한됩니다:

```html
<iframe sandbox="allow-forms allow-popups" srcDoc="...">
```

- **allow-scripts 미포함**: JavaScript 실행 완전 차단
- **allow-same-origin 미포함**: 부모 페이지 접근 불가
- **allow-forms**: 폼 제출 허용 (필요시)
- **allow-popups**: 새 창 열기 허용 (링크 클릭)

이 설정으로 XSS 공격, 악성 스크립트 실행, 쿠키 탈취 등을 방지합니다.

### 5.2 CSP (Content Security Policy)
`next.config.js`에서 CSP 헤더 설정:

- `default-src 'self'`: 기본적으로 같은 출처만 허용
- `script-src 'self'`: 스크립트는 같은 출처만
- `style-src 'self' 'unsafe-inline' https:`: 인라인 스타일, 외부 CSS 허용
- `img-src 'self' https: data:`: 외부 이미지 허용
- `frame-src 'self' blob:`: iframe은 같은 출처와 blob만

### 5.3 RLS (Row Level Security)
Supabase RLS로 데이터 접근 제어:

- `pages` 테이블: 오직 소유자(owner)만 CRUD 가능
- `public_pages` 뷰: 게시된 페이지만 익명 사용자가 읽기 가능
- 민감한 정보(owner_id, created_at)는 공개 뷰에서 제외

---

## 6. 문제 해결

### Q: 로그인이 안 됩니다
- Supabase에서 사용자가 올바르게 생성되었는지 확인
- 이메일 확인이 필요한 경우 비활성화 필요

### Q: 페이지 저장이 안 됩니다
- Supabase SQL이 정상 실행되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### Q: 공개 페이지가 안 보입니다
- `is_published`가 true인지 확인
- `public_pages` 뷰에 대한 권한 설정 확인

### Q: 환경변수 오류
- `.env.local` 파일이 존재하는지 확인
- 환경변수 값에 따옴표가 없는지 확인
- Vercel에 환경변수가 올바르게 설정되었는지 확인

---

## 7. 프로젝트 구조

```
my-codepen/
├── app/
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈 (리다이렉트)
│   ├── login/
│   │   └── page.tsx         # 로그인 페이지
│   ├── editor/
│   │   └── page.tsx         # 에디터 페이지
│   ├── list/
│   │   └── page.tsx         # 문서 목록 페이지
│   └── p/
│       └── [slug]/
│           └── page.tsx     # 공개 페이지
├── components/
│   ├── PreviewFrame.tsx     # iframe 미리보기 컴포넌트
│   └── Toast.tsx            # 토스트 알림 컴포넌트
├── lib/
│   ├── types.ts             # TypeScript 타입 정의
│   ├── slugify.ts           # slug 생성 유틸리티
│   └── supabase/
│       ├── client.ts        # 브라우저용 Supabase 클라이언트
│       ├── server.ts        # 서버용 Supabase 클라이언트
│       └── middleware.ts    # 인증 미들웨어
├── supabase/
│   └── schema.sql           # 데이터베이스 스키마
├── middleware.ts            # Next.js 미들웨어
├── next.config.js           # Next.js 설정
├── tailwind.config.ts       # Tailwind CSS 설정
├── package.json             # 의존성 목록
└── DEPLOY.md                # 이 문서
```
