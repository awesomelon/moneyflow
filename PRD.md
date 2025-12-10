# 📱 Mobile-First 가계부 (MoneyFlow) PRD

## 1\. 프로젝트 개요

- **프로젝트명:** MoneyFlow (가칭)
- **목표:** 모바일 환경에 최적화된 UI/UX를 제공하여, 사용자가 언제 어디서든 수입/지출을 기록하고 카드 할부 이자를 포함한 정확한 지출 흐름을 파악하는 웹앱 구축.
- **타겟 디바이스:** 모바일 웹 (Mobile Web) 중심 (PC에서는 모바일 뷰 형태로 중앙 정렬 권장).

## 2\. 기술 스택 (Tech Stack)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (모바일 반응형 최적화)
- **Database:** SQLite (로컬 파일 기반)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (v5) - Google Provider
- **State Management:** React Context API 또는 Zustand (필요 시)

---

## 3\. 정보 구조 및 워크플로우 (User Flow)

### 3.1 인증 흐름

1.  **Splash / Login:** 비로그인 상태 접근 시 로그인 페이지로 리다이렉트.
    - `[Google 계정으로 시작하기]` 버튼 단일 제공.
2.  **Auth Check:** 로그인 성공 시 DB에 유저 정보가 없으면 자동 생성(SignUp), 있으면 세션 생성(SignIn).
3.  **Logout:** 설정 메뉴 등에서 로그아웃 시 로그인 페이지로 이동.

### 3.2 메인 네비게이션 (Bottom Tab)

- **홈 (Dashboard):** 당월 요약 및 통계.
- **내역 (History):** 일자별 수입/지출 리스트.
- **등록 (+) :** 하단 중앙 FAB(Floating Action Button)로 모달 호출.
- **설정 (Settings):** 로그아웃 및 데이터 관리.

---

## 4\. 상세 기능 명세 (Functional Specs)

### 4.1 메인 대시보드 (Home)

- **기간 설정:**
  - 기본값: 현재 년/월 (예: `2024년 5월`).
  - 기능: 이전 달(`<`), 다음 달(`>`) 이동 버튼.
- **자산 현황 카드:**
  1.  **이번 달 총 수입:** 선택된 월의 `type='INCOME'` 합계.
  2.  **이번 달 총 지출:** 선택된 월의 `type='EXPENSE'` 합계 (할부의 경우 총 납부액 기준).
  3.  **현재 잔액:** 계산 로직 적용.
      - _공식:_ `(전월까지의 누적 잔액) + (이번 달 총 수입) - (이번 달 총 지출)`
      - _구현 팁:_ 전체 기간의 (수입 - 지출)을 계산하여 보여주는 것이 가장 정확함.
- **지출 통계 (Chart):**
  - 도넛 차트 등을 활용하여 카테고리별 지출 비중 시각화.
  - 하단에 금액이 큰 순서대로 카테고리 리스트 나열.

### 4.2 수입/지출 등록 및 수정 (Transaction Form)

- **진입:** 메인 FAB 버튼 또는 리스트 아이템 클릭(수정).
- **입력 폼 구성:**
  1.  **구분 (Type):** 수입 / 지출 (Toggle/Tab).
  2.  **일자 (Date):** Date Picker (Default: 오늘).
  3.  **금액 (Amount):** 숫자 키패드, 3자리 콤마 자동 적용.
  4.  **분류 (Category):**
      - _지출:_ 생활비, 가족비, 휴가비, 유흥비, 정기결제비, 교통비, 기타.
      - _수입:_ 월급, 용돈, 기타 (수입 카테고리는 확장 가능).
  5.  **내용 (Description):** 한 줄 텍스트 (예: 점심 식사).
  6.  **결제 수단 (Method):** 카드 / 현금 (Radio Button, **지출 선택 시에만 노출**).
  7.  **할부 설정 (Installment):** (**'지출' + '카드'** 선택 시에만 노출).
      - Select Box: 일시불(기본), 2개월 \~ 12개월.
      - 할부 선택 시 아래 **4.3의 로직**으로 계산된 '예상 할부 수수료'를 UI에 미리 표시해주면 좋음.
  8.  **비고 (Note):** 상세 메모 (Textarea).

### 4.3 카드 할부 계산 로직 (Core Logic)

할부 개월 수 선택 시 수수료를 계산하여 지출 금액에 포함하거나 별도 저장합니다.

- **구간별 연 이율(수수료율):**
  - **1 \~ 3개월:** 0% (무이자)
  - **4 \~ 5개월:** 연 12%
  - **6 \~ 9개월:** 연 15%
  - **10 \~ 12개월:** 연 19%
- **계산 공식:**
  > **총 할부 수수료** = `[할부원금 * 수수료율 * (할부 개월 수 + 1) / 2]` > _(주의: 수수료율은 연이율이므로 계산 시 `/ 12` 적용 필요)_ > _최종 저장 금액_ = `할부원금 + 총 할부 수수료`
- **예시 (100만원, 6개월 할부, 연 15%):**
  - 수수료 = `1,000,000 * (0.15 / 12) * (6 + 1) / 2` = `12,500 * 3.5` = `43,750원`
  - 1원 미만 절사.

### 4.4 데이터 조회 및 보안

- **Data Isolation:** 모든 쿼리(`findMany`, `create` 등)에는 반드시 `where: { userId: session.user.id }`가 포함되어야 함. 타인의 데이터 접근 불가.

---

## 5\. 데이터베이스 스키마 (Prisma Schema)

NextAuth 호환 및 가계부 요구사항을 완벽히 반영한 스키마입니다.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // 개발용 sqlite, 배포 시 postgresql 등으로 변경 가능
  url      = env("DATABASE_URL")
}

// --------------------------------------
// 1. NextAuth 필수 모델 (User, Account, Session)
// --------------------------------------
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // 가계부 데이터 관계 설정
  transactions  Transaction[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// --------------------------------------
// 2. 가계부 핵심 모델 (Transaction)
// --------------------------------------
model Transaction {
  id          Int      @id @default(autoincrement())

  // 어떤 유저의 데이터인지 식별 (필수)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  date        DateTime // 거래 일자
  type        String   // "INCOME" | "EXPENSE"
  category    String   // 생활비, 식비 등 (Enum 대신 String 권장 - 유연성 위함)

  amount      Int      // 최종 금액 (할부 시 원금)

  // 지출 상세 옵션
  method      String?  // "CASH" | "CARD"
  desc        String?  // 내용 (Short description)
  note        String?  // 비고 (Long description)

  // 할부 데이터
  isInstallment     Boolean @default(false)
  installmentMonths Int     @default(1) // 1 = 일시불
  installmentFee    Int     @default(0) // 계산된 총 이자 금액

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, date]) // 날짜별 조회 성능 최적화
}
```

---

## 6\. UI/UX 디자인 가이드

### 6.1 Layout & Style

- **Mobile Container:** PC 브라우저 접근 시 `max-width: 480px`, `margin: 0 auto`를 적용하여 모바일 앱처럼 보이게 처리.
- **Header:** 스크롤 시 상단 고정 (Sticky), 현재 월 표시.
- **Color System:**
  - **Primary:** Indigo-600 (브랜드 컬러)
  - **Income:** Emerald-500 (수입, 긍정)
  - **Expense:** Rose-500 (지출, 부정)
  - **Background:** Slate-50 (눈이 편안한 회색조)

### 6.2 Interaction

- **입력 폼:** 모바일 키보드가 올라올 때 UI가 깨지지 않도록 `Safe Area` 확보.
- **피드백:** 저장/삭제 성공 시 Toast Message ("저장되었습니다") 노출.
- **할부 선택 UX:** '카드' 라디오 버튼 선택 시 슬라이드 다운 애니메이션으로 '할부 개월 수' 셀렉트 박스 노출.

---

## 7\. 개발 체크리스트 (우선순위)

1.  **환경 설정:** Next.js 프로젝트 생성 및 Tailwind 설정.
2.  **DB 구축:** Prisma Schema 작성 및 `npx prisma db push`.
3.  **인증 구현:** Google Cloud Console 키 발급 및 NextAuth 연동 (`middleware` 설정 필수).
4.  **API 개발:** Transaction CRUD (Server Actions 권장).
    - _Tip:_ Create 액션 내부에서 할부 이자 계산 함수(`calculateInstallmentFee`) 호출.
5.  **UI 개발:**
    - 하단 네비게이션 및 레이아웃.
    - 메인 대시보드 (요약 로직 구현).
    - 입력 폼 (State 관리 및 유효성 검사).
6.  **테스트:** 할부 이자 계산 정확도 검증, 로그인 유저 간 데이터 분리 확인.
