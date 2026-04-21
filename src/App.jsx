import React, { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

/* ==========================================================================
 * 셀바이저(Sellvisor) 가맹점주 APP v1.3 Mock
 * 기준 문서:
 *   - sellvisor-common.md v0.5
 *   - sellvisor_app_integrated.md v1.3
 *   - sellvisor_fr_admin_policy.md v0.7
 *
 * 핵심 반영 사항:
 *   - 바텀탭 5탭 (홈·매출·운영·직원관리·전체), STAFF는 4탭 (매출 비노출)
 *   - v1.3 라벨 치환 (배정업무·매장 점검·본사 점검 요청·방문 점검·교육·매뉴얼·매장소식)
 *   - 직영점 배지 + 본사 직원 겸직 배지 (AppBar)
 *   - PG MID/TID 조회 (FR 어드민 등록, APP 조회만)
 *   - 공동구매 조건부 노출 (tenant.partner_integration_enabled)
 *   - 연동 상태값 7종 (CONNECTED / PENDING / AUTH_FAILED / DATA_DELAYED / DISCONNECTED / NOT_CONFIGURED / NEGOTIATING)
 *   - TDS 색상 토큰 (Common §5 기준)
 *   - "실시간"·"현재" 표현 금지 → "N분 전 기준" / "D+1 기준" 명시
 * ========================================================================== */

/* ── 색상 토큰 (Common §5) ─────────────────────────────────────────── */
const C = {
  blue:        "#1B64DA",
  blueSoft:    "#EBF2FF",
  blueHover:   "#1550B8",
  green:       "#0BB77C",
  greenSoft:   "#E6F9F2",
  red:         "#F03B3B",
  redSoft:     "#FEF0F0",
  orange:      "#F5812A",
  orangeSoft:  "#FEF4EB",
  purple:      "#7B5CF0",
  purpleSoft:  "#F2EFFE",
  bg:          "#F6F8FB",
  white:       "#FFFFFF",
  border:      "#E3E8F0",
  borderLight: "#F0F4F9",
  text:        "#1A2236",
  textSub:     "#5E6F8A",
  textMuted:   "#97A3B6",
};

/* ── 타이포그래피 ─────────────────────────────────────────────────── */
const T = {
  xs:   "11px",
  sm:   "12px",
  base: "13px",
  md:   "14px",
  lg:   "16px",
  xl:   "18px",
  xxl:  "22px",
  xxxl: "28px",
};

const FONT_STACK =
  "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

/* ── 아이콘 (Common §7 — 단색 SVG, 이모지 금지) ─────────────────────── */
const Icon = {
  home: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  ),
  chart: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
  briefcase: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  ),
  users: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  grid: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  bell: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  arrowLeft: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  chevronLeft: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  check: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke={p.color || "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  wifi: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  clock: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  building: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  userBadge: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  chat: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  ),
  clipboard: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  ),
  star: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill={p.fill || "none"} stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  mail: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  ),
  book: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" /><path d="M4 19.5a2.5 2.5 0 0 0 2.5 2.5H20v-5H6.5A2.5 2.5 0 0 0 4 19.5Z" />
    </svg>
  ),
  settings: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  plug: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 1 1-12 0V8ZM12 18v4" />
    </svg>
  ),
  shopping: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  logout: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  camera: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  alert: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" />
    </svg>
  ),
  play: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill={p.color || "currentColor"} stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  fileText: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  lock: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  refresh: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  trending: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  send: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  sparkle: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  ),
  x: (p = {}) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke={p.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

/* ── 역할·매장 정의 ───────────────────────────────────────────────── */
const ROLE_LABEL = {
  STORE_OWNER:   "점주",
  STORE_MANAGER: "매니저",
  STORE_STAFF:   "직원",
};

const STORE_TYPE_LABEL = {
  FRANCHISE_STORE: "가맹점",
  DIRECT_STORE:    "직영점",
};

/* ── 바텀탭 구성 (v1.3) ───────────────────────────────────────────── */
const TABS_OWNER_MANAGER = [
  { key: "home",   label: "홈",     icon: Icon.home },
  { key: "sales",  label: "매출",   icon: Icon.chart },
  { key: "ops",    label: "운영",   icon: Icon.briefcase },
  { key: "staff",  label: "직원관리", icon: Icon.users },
  { key: "more",   label: "전체",   icon: Icon.grid },
];

const TABS_STAFF = [
  { key: "home",  label: "홈",     icon: Icon.home },
  { key: "ops",   label: "운영",   icon: Icon.briefcase },
  { key: "staff", label: "직원관리", icon: Icon.users },
  { key: "more",  label: "전체",   icon: Icon.grid },
];

/* ── 연동 상태값 (Common §10-5 — 7종) ──────────────────────────────── */
const INTEGRATION_STATUS = {
  CONNECTED:      { label: "연동 완료",      color: C.green,     bg: C.greenSoft  },
  PENDING:        { label: "연동 중",        color: C.orange,    bg: C.orangeSoft },
  AUTH_FAILED:    { label: "계정 확인 필요", color: C.red,       bg: C.redSoft    },
  DATA_DELAYED:   { label: "데이터 지연",    color: C.orange,    bg: C.orangeSoft },
  DISCONNECTED:   { label: "미연동",         color: C.textMuted, bg: C.borderLight },
  NOT_CONFIGURED: { label: "설정 필요",      color: C.textMuted, bg: C.borderLight },
  NEGOTIATING:    { label: "준비 중",        color: C.purple,    bg: C.purpleSoft },
};

/* ==========================================================================
 * Mock Data — 인프라 §8 데모 시드 정책 + Common §16 기준
 *   테넌트: 브릿지커피 (BRIDGE), 카페, 40매장 (가맹 38 + 직영 2)
 *   요금제: STANDARD · 로열티 3.5% · 매장당 월 구독료 15,000원
 *   매장:   강남점 (서울 강남 4개 매장 중 1개, "평균 상위" 포지션)
 *           월 매출 2,800만~3,500만 · 일 평균 95만~120만 (Common §16-3 평균 매장)
 *   기간:   base-date = 2026-04-19 (분기 자동 재생성 상대날짜)
 *   담당 SV: sv1@bridge.demo (매장 10~15개 담당 중 1개)
 *   계정 컨벤션 (BC §6-3): {store_code}@bridge.demo / demo1234
 * ========================================================================== */

/* 데모 환경 플래그 (인프라 §7-3 · NEXT_PUBLIC_APP_ENV) */
const APP_ENV = "demo";            // "production" | "demo" | "staging" | "dev"
const LAST_SEED_DATE = "2026-04-01 03:12";  // 최근 분기 자동 재생성 시각

/* 테넌트 (브릿지커피) */
const TENANT = {
  code:     "BRIDGE",
  name:     "브릿지커피",
  industry: "카페",
  plan:     "STANDARD",
  royaltyRate: 0.035,
  partnerIntegrationEnabled: true,  // 공동구매 노출 (Common §16 · APP-Q신규1 C안)
};

/* 매장 (강남점) */
const STORE = {
  id:         "st-bridge-gangnam-01",
  name:       "브릿지커피 강남점",
  type:       "FRANCHISE_STORE",           // Common §14-2 store_type enum
  region:     "서울 강남구 테헤란로",
  openedAt:   "2023-08-17",                 // 32개월차 — 안정 운영
  svName:     "박슈퍼",                     // sv1@bridge.demo 담당
  wifiSsid:   "BRIDGE_GANGNAM_5G",
  wifiBssid:  "a4:2b:8c:d1:0f:3e",
};

/* 현재 로그인 세션 (역할 전환 가능) */
const DEMO_USER_OWNER = {
  userId:      "u-bridge-gangnam-owner",
  name:        "김강남",
  email:       "gangnam@bridge.demo",
  phone:       "010-1234-5678",
  role:        "STORE_OWNER",
  orderPermission: false,
  storeId:     STORE.id,
  storeName:   STORE.name,
  storeType:   STORE.type,
  hqSuffix:    null,                        // 가맹점 OWNER — 본사 겸직 금지 (Common §3-1-1)
  hqDomains:   null,
  multipleStores: null,                     // 가맹점 OWNER는 단일 매장 (겸직 금지)
  phoneVerifiedAt: "2026-01-15T09:20:00Z",
};

const DEMO_USER_MANAGER = {
  userId:      "u-bridge-gangnam-mgr",
  name:        "이관리",
  email:       "gangnam.mgr@bridge.demo",
  phone:       "010-2345-6789",
  role:        "STORE_MANAGER",
  orderPermission: false,
  storeId:     STORE.id,
  storeName:   STORE.name,
  storeType:   STORE.type,
  hqSuffix:    null,
  multipleStores: null,
  phoneVerifiedAt: "2026-02-02T10:15:00Z",
};

const DEMO_USER_STAFF = {
  userId:      "u-bridge-gangnam-stf",
  name:        "박직원",
  email:       "gangnam.stf@bridge.demo",
  phone:       "010-3456-7890",
  role:        "STORE_STAFF",
  orderPermission: false,
  storeId:     STORE.id,
  storeName:   STORE.name,
  storeType:   STORE.type,
  hqSuffix:    null,
  multipleStores: null,
  phoneVerifiedAt: "2026-03-10T14:40:00Z",
};

/* 테넌트 플래그 (공동구매 조건부 노출 — TENANT 참조 alias) */
const TENANT_FLAGS = {
  partnerIntegrationEnabled: TENANT.partnerIntegrationEnabled,
};

/* 매장소식 (v1.3 라벨 — v1.2 공지사항) */
const NOTICES = [
  { id: "N-001", cat: "URGENT",  title: "금주 위생 점검 일정 안내",         body: "4/21(화) 오후 2시 본사 SV 방문 예정입니다.", dt: "2026-04-18 10:22", targetAll: false, read: false },
  { id: "N-002", cat: "EVENT",   title: "봄맞이 신메뉴 출시 프로모션",      body: "4/20부터 전국 매장 봄 한정 라떼 3종 판매 시작.", dt: "2026-04-17 09:10", targetAll: true, read: false },
  { id: "N-003", cat: "POLICY",  title: "배달 수수료 변경 안내",             body: "5월 1일부터 쿠팡이츠 수수료 정책 변경됩니다.", dt: "2026-04-15 15:30", targetAll: true, read: true },
  { id: "N-004", cat: "GENERAL", title: "4월 매뉴얼 업데이트",               body: "라떼아트 가이드 v2.1이 업로드되었습니다.",  dt: "2026-04-12 11:00", targetAll: true, read: true },
  { id: "N-005", cat: "GENERAL", title: "근태 관리 사용법 안내",             body: "Wi-Fi 출퇴근 체크 기능 상세 사용법 업데이트.", dt: "2026-04-10 13:45", targetAll: true, read: true },
];

const NOTICE_META = {
  URGENT:  { label: "긴급",     color: C.red,    bg: C.redSoft    },
  POLICY:  { label: "정책",     color: C.purple, bg: C.purpleSoft },
  EVENT:   { label: "이벤트",   color: C.orange, bg: C.orangeSoft },
  GENERAL: { label: "일반",     color: C.blue,   bg: C.blueSoft   },
};

/* 매출 KPI & 채널별 — 브릿지커피 강남점 (평균 상위 포지션)
   월 매출 ~3,200만 / 일 평균 ~105만 (Common §16-3 평균 구간 2,000~4,000만)
   카페 브랜드 특성: POS 78% + 매장 배달 3사 합계 22% (맘스버거와 달리 배달 비중 낮음) */
const DAILY_SALES_BASE = [
  { d: "월", v: 1060000 }, { d: "화", v:  980000 }, { d: "수", v: 1020000 },
  { d: "목", v: 1150000 }, { d: "금", v: 1340000 }, { d: "토", v: 1480000 }, { d: "일", v: 1250000 },
];

/* 주간 매출 8주치 — 봄(4월) 성수기 진입 추세, 이번주 소폭 상승 */
const WEEKLY_SALES = [
  { w: "W-7", v: 7120000 }, { w: "W-6", v: 7350000 }, { w: "W-5", v: 7280000 },
  { w: "W-4", v: 7560000 }, { w: "W-3", v: 7740000 }, { w: "W-2", v: 7620000 },
  { w: "W-1", v: 7890000 }, { w: "이번주", v: 8280000 },
];

/* 채널별 매출 (이번주) — 카페 브랜드 현실성: POS 중심 + 배달 소량
   합계 8,280,000 (WEEKLY_SALES 이번주와 일치) */
const SALES_CHANNELS = [
  { ch: "POS",        v: 6450000, ratio: 77.9, cancel:  5, fee:       0, payout: 6450000, status: "CONNECTED",    realtime: true  },
  { ch: "배달의민족", v:  920000, ratio: 11.1, cancel:  3, fee:   82800, payout:  837200, status: "CONNECTED",    realtime: false },
  { ch: "쿠팡이츠",   v:  530000, ratio:  6.4, cancel:  2, fee:   58300, payout:  471700, status: "DATA_DELAYED", realtime: false },
  { ch: "요기요",     v:  230000, ratio:  2.8, cancel:  1, fee:   25300, payout:  204700, status: "CONNECTED",    realtime: false },
  { ch: "땡겨요",     v:  150000, ratio:  1.8, cancel:  0, fee:   13500, payout:  136500, status: "AUTH_FAILED",  realtime: false },
];

/* 타 매장 비교 (OWNER 전용) — 본사 평균 / 지역 평균 (Common §16-3 카페 평균 구간) */
const STORE_COMPARE = {
  ourSales:        8280000,    // 이번주 우리 매장
  brandAvg:        7450000,    // 브릿지커피 40매장 평균
  regionOtherAvg:  6920000,    // 서울 강남구 지역 외 카페 평균
  brandSource:     "2025년 기준 | 공정거래위원회 정보공개서 (연 1회 갱신)",
  regionSource:    "2026년 3월 기준 | 소상공인진흥공단 제공 (월 1회 갱신)",
};

/* 배정업무 (v1.3 라벨 — business_tickets) */
const TICKETS = [
  { id: "TKT-2026-001", title: "에스프레소 머신 압력 이상 점검", category: "장비", priority: "HIGH",   status: "OPEN",        assignee: "u-bridge-gangnam-owner", due: "2026-04-20", createdAt: "2026-04-18 09:15" },
  { id: "TKT-2026-002", title: "신메뉴 봄 라떼 교육 이수",        category: "교육", priority: "NORMAL", status: "IN_PROGRESS", assignee: "u-bridge-gangnam-mgr",   due: "2026-04-22", createdAt: "2026-04-17 14:30" },
  { id: "TKT-2026-003", title: "위생 체크리스트 응답 제출",       category: "위생", priority: "NORMAL", status: "IN_PROGRESS", assignee: "u-bridge-gangnam-owner", due: "2026-04-21", createdAt: "2026-04-17 11:00" },
  { id: "TKT-2025-099", title: "4월 POP 게시물 교체",               category: "마케팅", priority: "LOW",  status: "RESOLVED",    assignee: "u-bridge-gangnam-mgr",   due: "2026-04-15", createdAt: "2026-04-10 10:00" },
  { id: "TKT-2025-098", title: "3월 재고 실사 점검",                category: "재고", priority: "LOW",  status: "CLOSED",      assignee: "u-bridge-gangnam-owner", due: "2026-03-28", createdAt: "2026-03-20 09:00" },
];

const TICKET_STATUS = {
  OPEN:        { label: "접수",   color: C.blue,      bg: C.blueSoft    },
  IN_PROGRESS: { label: "처리중", color: C.orange,    bg: C.orangeSoft  },
  RESOLVED:    { label: "해결",   color: C.green,     bg: C.greenSoft   },
  CLOSED:      { label: "종료",   color: C.textMuted, bg: C.borderLight },
};

const TICKET_PRIORITY = {
  HIGH:   { label: "긴급", color: C.red    },
  NORMAL: { label: "보통", color: C.orange },
  LOW:    { label: "낮음", color: C.textMuted },
};

/* 매장 점검 (v1.3 라벨 — QSC) · 담당 SV: 박슈퍼(sv1), 김수퍼(sv2) */
const QSC_RESULTS = [
  { id: "QS-017", type: "ONSITE_CHECKLIST", score: 95, grade: "A", sv: "박슈퍼", dt: "2026-04-14", action: "에스프레소 머신 청소 주기 단축 권장" },
  { id: "QS-016", type: "REMOTE_CHECKLIST", score: 83, grade: "B", sv: null,     dt: "2026-04-13", action: null },
  { id: "QS-015", type: "ONSITE_CHECKLIST", score: 88, grade: "B", sv: "박슈퍼", dt: "2026-04-10", action: null },
  { id: "QS-014", type: "REMOTE_CHECKLIST", score: 91, grade: "A", sv: null,     dt: "2026-04-03", action: null },
  { id: "QS-013", type: "ONSITE_CHECKLIST", score: 78, grade: "C", sv: "김수퍼", dt: "2026-03-20", action: "음료 제조 시 온도 관리 주의" },
];

/* 본사 점검 요청 (v1.3 라벨 — 비대면 체크리스트) */
const REMOTE_REQUESTS = [
  {
    id: "RC-045",
    title: "월간 위생 점검 (2026년 4월)",
    issuer: "본사 박슈퍼",
    issuedAt: "2026-04-15",
    dueDate: "2026-04-20",
    itemCount: 12,
    estimatedMin: 15,
    status: "PENDING",
  },
];

const REMOTE_HISTORY = [
  { id: "RC-042", title: "월간 위생 점검 (2026년 3월)", score: 92, grade: "B", submittedAt: "2026-03-19" },
  { id: "RC-038", title: "분기 재고 실사 (2026 Q1)",    score: null, grade: null, submittedAt: "2026-03-05" },
];

/* 방문 점검 (v1.3 신규 — 대면 체크리스트) */
const VISIT_INSPECTIONS = [
  { id: "VI-017", dt: "2026-04-14", sv: "박슈퍼", q: 38, s: 29, c: 28, total: 95, grade: "A",
    improvements: ["에스프레소 머신 청소 주기 단축 권장"], reportStatus: "NONE" },
  { id: "VI-015", dt: "2026-03-17", sv: "박슈퍼", q: 34, s: 28, c: 26, total: 88, grade: "B",
    improvements: [], reportStatus: "CLOSED" },
  { id: "VI-013", dt: "2026-02-12", sv: "김수퍼", q: 36, s: 29, c: 26, total: 91, grade: "A",
    improvements: [], reportStatus: "CLOSED" },
];

const GRADE_COLOR = {
  A: { color: C.green,   bg: C.greenSoft  },
  B: { color: C.blue,    bg: C.blueSoft   },
  C: { color: C.orange,  bg: C.orangeSoft },
  D: { color: C.red,     bg: C.redSoft    },
};

/* 교육·매뉴얼 (v1.3 라벨 — 교육 콘텐츠 + 레시피 통합) */
const EDU_CONTENTS = [
  {
    id: "ED-021", type: "VIDEO", title: "봄 한정 라떼 제조법", cat: "레시피",
    url: "#", completed: false, deadline: "2026-04-25",
    duration: "8분 42초", views: 127, instructor: "본사 R&D팀 · 김수현",
    summary: "봄 시즌 신메뉴 3종(벚꽃라떼·딸기라떼·한라봉라떼) 제조 방법 및 플레이팅 가이드",
    chapters: [
      "00:00 인트로 — 봄 시즌 메뉴 컨셉",
      "01:15 벚꽃라떼 제조 (핵심: 시럽 12g · 우유 온도 65℃)",
      "03:40 딸기라떼 제조 (핵심: 생딸기 퓨레 20g · 토핑)",
      "06:20 한라봉라떼 제조 (핵심: 한라봉청 15g · 가니쉬)",
      "08:00 품질 기준 · 실수 방지 체크리스트",
    ],
  },
  {
    id: "ED-020", type: "DOC", title: "4월 위생 매뉴얼 v2.1", cat: "위생",
    url: "#", completed: true, deadline: null,
    pages: 18, updatedAt: "2026-04-05",
    summary: "매장 청소 주기표, 장비별 세척 방법, 식자재 온도 관리 기준 (v2.0 대비 냉장고 온도 기준 2℃ 상향)",
    sections: [
      "1장. 개장·마감 체크리스트 (12항목)",
      "2장. 에스프레소 머신 세척 (일간·주간·월간)",
      "3장. 냉장·냉동고 온도 관리 (1℃~4℃ / -18℃ 이하)",
      "4장. 식자재 유통기한 관리",
      "5장. 직원 위생 규칙",
      "부록. 위생 사고 대응 매뉴얼",
    ],
  },
  {
    id: "ED-019", type: "EXAM", title: "식품위생법 기본 이해 (4월)", cat: "위생",
    url: "#", completed: false, deadline: "2026-04-30",
    questions: 10, passingScore: 70, attempts: 0, maxAttempts: 3,
    summary: "식약처 고시 기반 월간 의무 교육 · 통과 시 교육이수증 자동 발급",
    topics: [
      "식품위생법 제3조 (식품·식품첨가물의 기준)",
      "HACCP 관리기준 기본 개념",
      "식중독 예방 5대 수칙",
      "영업자의 준수사항",
      "위반 시 행정처분 기준",
    ],
  },
  {
    id: "ED-018", type: "RECIPE", title: "에스프레소 추출 표준 레시피", cat: "레시피",
    url: "#", completed: true, deadline: null,
    summary: "브릿지커피 기본 에스프레소 추출 표준값",
    recipe: [
      { step: "원두량",      value: "18g ± 0.5g" },
      { step: "추출 시간",   value: "25~30초" },
      { step: "추출량",      value: "36ml ± 2ml" },
      { step: "물 온도",     value: "93~95℃" },
      { step: "분쇄도",      value: "중세 (세팅값 3.5)" },
      { step: "탬핑 압력",   value: "약 15kg" },
    ],
  },
  {
    id: "ED-017", type: "VIDEO", title: "신규 매니저 온보딩", cat: "접객",
    url: "#", completed: true, deadline: null,
    duration: "22분 10초", views: 45, instructor: "본사 운영팀 · 이성훈",
    summary: "신규 매니저 3주 온보딩 프로그램 가이드",
    chapters: [
      "00:00 브릿지커피 브랜드 가치와 운영 철학",
      "04:30 매장 오픈·마감 업무 흐름",
      "10:15 팀원 스케줄·근태 관리",
      "15:40 발주·재고 관리 원칙 (P3 상세 별도)",
      "19:20 고객 컴플레인 3단계 대응법",
    ],
  },
  {
    id: "ED-016", type: "DOC", title: "장비 유지보수 가이드", cat: "장비",
    url: "#", completed: true, deadline: null,
    pages: 12, updatedAt: "2026-03-22",
    summary: "에스프레소 머신·그라인더·제빙기 등 주요 장비 정기 점검 가이드",
    sections: [
      "1장. 에스프레소 머신 일일 체크 (5분)",
      "2장. 그라인더 분쇄도 유지",
      "3장. 제빙기 주간 세척",
      "4장. 냉장·냉동고 코일 청소 (월간)",
      "5장. 이상 징후 발견 시 본사 연락처",
    ],
  },
];

/* 상품별 매출 데이터 (이번주 기준) */
const PRODUCT_SALES = [
  { id: "P-001", name: "아이스 아메리카노",  category: "커피",   price: 4500,  qty: 412, sales: 1854000, growth:  +8.2 },
  { id: "P-002", name: "아메리카노 (HOT)",   category: "커피",   price: 4500,  qty: 287, sales: 1291500, growth:  -3.1 },
  { id: "P-003", name: "카페라떼",           category: "커피",   price: 5000,  qty: 198, sales:  990000, growth:  +2.4 },
  { id: "P-004", name: "바닐라라떼",         category: "커피",   price: 5500,  qty: 142, sales:  781000, growth: +11.7 },
  { id: "P-005", name: "봄 한정 벚꽃라떼",   category: "시즌",   price: 6500,  qty: 124, sales:  806000, growth: null,  isNew: true },
  { id: "P-006", name: "카푸치노",           category: "커피",   price: 5000,  qty:  87, sales:  435000, growth:  -5.2 },
  { id: "P-007", name: "딸기라떼",           category: "시즌",   price: 6500,  qty:  78, sales:  507000, growth: null,  isNew: true },
  { id: "P-008", name: "카라멜마끼아또",     category: "커피",   price: 5800,  qty:  65, sales:  377000, growth:  +1.8 },
  { id: "P-009", name: "에스프레소",         category: "커피",   price: 3500,  qty:  42, sales:  147000, growth:  +0.5 },
  { id: "P-010", name: "크루아상",           category: "베이커리", price: 4200, qty:  98, sales:  411600, growth:  +5.1 },
  { id: "P-011", name: "치즈케이크",         category: "베이커리", price: 6500, qty:  58, sales:  377000, growth:  +2.9 },
  { id: "P-012", name: "샌드위치(햄치즈)",    category: "푸드",   price: 6800,  qty:  64, sales:  435200, growth:  -1.4 },
];

const PRODUCT_CATEGORIES = ["전체", "커피", "시즌", "베이커리", "푸드"];

/* 일간 매출 — 최근 14일치 (일탭용) */
const DAILY_SALES_14 = [
  { date: "04-06", dow: "월", v: 1045000 }, { date: "04-07", dow: "화", v:  982000 },
  { date: "04-08", dow: "수", v: 1028000 }, { date: "04-09", dow: "목", v: 1156000 },
  { date: "04-10", dow: "금", v: 1342000 }, { date: "04-11", dow: "토", v: 1489000 },
  { date: "04-12", dow: "일", v: 1248000 }, { date: "04-13", dow: "월", v: 1067000 },
  { date: "04-14", dow: "화", v: 1015000 }, { date: "04-15", dow: "수", v: 1098000 },
  { date: "04-16", dow: "목", v: 1187000 }, { date: "04-17", dow: "금", v: 1398000 },
  { date: "04-18", dow: "토", v: 1524000 }, { date: "04-19", dow: "일", v: 1295000 },
];

/* 월간 매출 — 최근 12개월 (월탭용) */
const MONTHLY_SALES_12 = [
  { month: "2025-05", v: 27800000 }, { month: "2025-06", v: 29500000 },
  { month: "2025-07", v: 34200000 }, { month: "2025-08", v: 35800000 },
  { month: "2025-09", v: 30400000 }, { month: "2025-10", v: 28900000 },
  { month: "2025-11", v: 27100000 }, { month: "2025-12", v: 25600000 },
  { month: "2026-01", v: 26800000 }, { month: "2026-02", v: 28400000 },
  { month: "2026-03", v: 30200000 }, { month: "2026-04", v: 21600000 },
];

/* 월 요약 (이번 달) */
const MONTH_SUMMARY = {
  period: "2026-04-01 ~ 2026-04-19 (19일 경과)",
  totalSales: 21600000,
  prevMonthSameDay: 19800000,     // 3월 1~19일
  growthPct: +9.1,
  totalOrders: 4521,
  avgTicket: 4776,
  bestDay: { date: "2026-04-18(토)", sales: 1524000 },
  worstDay: { date: "2026-04-14(화)", sales: 1015000 },
};

/* AI 챗봇 추천 질문 + 응답 시나리오 */
const CHATBOT_SUGGESTED = [
  "이번 주 매출이 지난 주 대비 어때요?",
  "오늘 근태 현황 알려주세요",
  "위생 매뉴얼 v2.1 요약해 주세요",
  "배달앱 연동 상태 확인해 주세요",
  "배정된 업무 중 우선순위가 높은 것은?",
];

const CHATBOT_RESPONSES = [
  {
    keywords: ["매출", "이번 주", "지난 주"],
    answer:
      "이번 주 누적 매출은 828만원으로 지난 주 789만원 대비 +4.9% 증가했습니다.\n" +
      "• POS: 645만원 (77.9%)\n" +
      "• 배달 3사: 183만원 (22.1%)\n" +
      "금·토 매출이 평일 대비 +30% 높아 봄 시즌 효과가 나타나고 있습니다.",
  },
  {
    keywords: ["근태", "오늘"],
    answer:
      "2026-04-19 기준 근태 현황입니다.\n" +
      "• 출근 완료: 김강남(08:55) · 이관리(09:02) · 정서연(08:48)\n" +
      "• 지각: 박직원(09:18)\n" +
      "• 결근: 최지훈\n" +
      "최지훈님 연락이 확인되지 않은 경우 직원관리 > 근태 현황에서 수동 처리해 주세요.",
  },
  {
    keywords: ["위생", "매뉴얼"],
    answer:
      "4월 위생 매뉴얼 v2.1 (18페이지, 2026-04-05 개정)의 핵심 변경사항입니다.\n" +
      "1. 냉장고 온도 기준 2℃ 상향 (4℃ 이하 → 3℃ 이하)\n" +
      "2. 에스프레소 머신 일간 세척 체크리스트 추가\n" +
      "3. 식자재 선입선출(FIFO) 라벨링 의무화\n" +
      "전체 내용은 운영 > 교육·매뉴얼 > ED-020에서 확인할 수 있습니다.",
  },
  {
    keywords: ["배달", "연동"],
    answer:
      "배달앱 연동 상태입니다.\n" +
      "• 배달의민족: 연동 완료 (06:15 동기화)\n" +
      "• 쿠팡이츠: 데이터 지연 중 (어제 06:00 이후 미수신)\n" +
      "• 요기요: 연동 완료 (06:12 동기화)\n" +
      "• 땡겨요: 계정 확인 필요 (4/15 이후 인증 실패)\n\n" +
      "땡겨요는 전체 > 연동 설정에서 재연동이 필요합니다.",
  },
  {
    keywords: ["배정", "업무", "우선"],
    answer:
      "현재 진행 중인 배정업무 3건 중 우선순위 순서입니다.\n" +
      "1. TKT-2026-001 · 긴급 · 마감 04-20 (내일)\n" +
      "   → 에스프레소 머신 압력 이상 점검\n" +
      "2. TKT-2026-003 · 보통 · 마감 04-21\n" +
      "   → 위생 체크리스트 응답 제출\n" +
      "3. TKT-2026-002 · 보통 · 마감 04-22\n" +
      "   → 신메뉴 봄 라떼 교육 이수\n\n" +
      "1번은 긴급 우선순위이므로 오늘 중 처리하시길 권장합니다.",
  },
];

const CHATBOT_DEFAULT_ANSWER =
  "말씀하신 내용은 아직 학습 데이터에 포함되어 있지 않습니다.\n" +
  "아래 추천 질문을 선택하시거나, 더 자세한 문의는 전체 탭의 '1:1 문의'를 이용해 주세요.";

/* 알림 센터 데이터 — 최근 알림 7종 (알림 벨 클릭 시 표시) */
const NOTIFICATIONS = [
  {
    id: "NT-007", cat: "TICKET", iconType: "clipboard", iconColor: "orange",
    title: "배정업무 신규 1건",
    body: "에스프레소 머신 압력 이상 점검 · 마감 04-20",
    time: "2시간 전", dt: "2026-04-19 12:15",
    targetScreen: "ops-tickets", read: false,
  },
  {
    id: "NT-006", cat: "INTEGRATION", iconType: "alert", iconColor: "red",
    title: "땡겨요 연동 인증 실패",
    body: "4/15 이후 데이터 수신 중단. 재연동이 필요합니다.",
    time: "4시간 전", dt: "2026-04-19 10:20",
    targetScreen: "more-integration", read: false,
  },
  {
    id: "NT-005", cat: "QSC", iconType: "star", iconColor: "green",
    title: "매장 점검 결과 A등급",
    body: "방문 점검 95점 · 박슈퍼",
    time: "어제", dt: "2026-04-18 17:42",
    targetScreen: "ops-qsc", read: false,
  },
  {
    id: "NT-004", cat: "ATTENDANCE", iconType: "alert", iconColor: "orange",
    title: "직원 결근 알림",
    body: "최지훈 · 2026-04-19 출근 미체크",
    time: "오늘 09:30", dt: "2026-04-19 09:30",
    targetScreen: "staff-board", read: true,
  },
  {
    id: "NT-003", cat: "VOC", iconType: "mail", iconColor: "blue",
    title: "1:1 문의 답변 도착",
    body: "VOC-2026-015 · 배달앱 리뷰 답변 정책 문의",
    time: "3일 전", dt: "2026-04-17 14:20",
    targetScreen: "more-voc", read: true,
  },
  {
    id: "NT-002", cat: "REMOTE", iconType: "clipboard", iconColor: "purple",
    title: "본사 점검 요청 수신",
    body: "월간 위생 점검 (2026년 4월) · 마감 04-20",
    time: "4일 전", dt: "2026-04-15 10:00",
    targetScreen: "ops-remote", read: true,
  },
  {
    id: "NT-001", cat: "NOTICE", iconType: "bell", iconColor: "textSub",
    title: "매장소식 · 금주 위생 점검 일정",
    body: "4/21(화) 오후 2시 본사 SV 방문 예정",
    time: "4일 전", dt: "2026-04-15 09:00",
    targetScreen: "notice-list", read: true,
  },
];

/* 매출 코칭 메시지 — 대시보드 상단 인사이트 카드용
   실제 운영에서는 매장 데이터 기반 규칙·AI로 생성 · 데모에서는 하드코딩 */
const SALES_COACHING = [
  {
    id: "SC-001", type: "GOOD",
    title: "주말 매출이 성장세에 있어요",
    body:
      "이번 주 토요일 매출(148만원)이 지난 4주 토요일 평균 대비 +18% 높았습니다. " +
      "봄 시즌 신메뉴 3종이 주말 객단가를 견인하고 있어요.",
    action: "상품별 매출에서 벚꽃라떼 판매 추이를 확인해 보세요",
    actionTarget: "product",
  },
  {
    id: "SC-002", type: "WARN",
    title: "화요일 매출이 낮습니다",
    body:
      "최근 3주 연속 화요일 매출이 평균 대비 -12% 낮게 나타났습니다. " +
      "주변 오피스의 정기 회의 일정과 겹치는지 확인이 필요해요.",
    action: "화요일 오후 타임세일 프로모션을 고려해 보세요",
    actionTarget: null,
  },
  {
    id: "SC-003", type: "TIP",
    title: "객단가를 올릴 기회가 있어요",
    body:
      "현재 평균 객단가 4,800원은 브릿지커피 전체 평균 5,200원보다 낮습니다. " +
      "크루아상·치즈케이크 같은 사이드 메뉴의 교차 판매(cross-selling)를 시도해 보세요.",
    action: "직원 교육: 사이드 메뉴 추천 멘트 매뉴얼",
    actionTarget: null,
  },
  {
    id: "SC-004", type: "INFO",
    title: "배달앱 비중이 카페 평균보다 낮아요",
    body:
      "매장 배달 비중 22%는 카페 업종 평균(30%) 대비 낮은 편이에요. " +
      "배달 메뉴 사진 개선이나 리뷰 이벤트를 통해 배달 채널을 키워볼 수 있습니다.",
    action: "쿠팡이츠는 현재 데이터 지연 상태 — 재연동 권장",
    actionTarget: null,
  },
];

const EDU_TYPE_META = {
  VIDEO:  { label: "영상",   color: C.blue,   icon: Icon.play },
  DOC:    { label: "문서",   color: C.purple, icon: Icon.fileText },
  EXAM:   { label: "시험",   color: C.orange, icon: Icon.clipboard },
  RECIPE: { label: "레시피", color: C.green,  icon: Icon.book },
};

/* 근태 — 강남점 팀 (OWNER 1 + MANAGER 1 + STAFF 3) */
const ATTENDANCE_TODAY = [
  { userId: "u-bridge-gangnam-owner", name: "김강남", role: "STORE_OWNER",   checkIn: "08:55", checkOut: null,    status: "NORMAL" },
  { userId: "u-bridge-gangnam-mgr",   name: "이관리", role: "STORE_MANAGER", checkIn: "09:02", checkOut: null,    status: "NORMAL" },
  { userId: "u-bridge-gangnam-stf",   name: "박직원", role: "STORE_STAFF",   checkIn: "09:18", checkOut: null,    status: "LATE"   },
  { userId: "u-bridge-gangnam-s2",    name: "최지훈", role: "STORE_STAFF",   checkIn: null,    checkOut: null,    status: "ABSENT" },
  { userId: "u-bridge-gangnam-s3",    name: "정서연", role: "STORE_STAFF",   checkIn: "08:48", checkOut: "17:01", status: "DONE"   },
];

/* 내 근태 이력 — 최근 30일 (달력 뷰용) */
const MY_ATTENDANCE_HISTORY = [
  { date: "2026-04-19", checkIn: "08:55", checkOut: null,    status: "IN_PROGRESS" },
  { date: "2026-04-18", checkIn: "08:55", checkOut: "18:05", status: "NORMAL" },
  { date: "2026-04-17", checkIn: "09:01", checkOut: "18:05", status: "NORMAL" },
  { date: "2026-04-16", checkIn: "08:52", checkOut: "18:12", status: "NORMAL" },
  { date: "2026-04-15", checkIn: "09:12", checkOut: "18:03", status: "LATE" },
  { date: "2026-04-14", checkIn: "08:58", checkOut: "18:10", status: "NORMAL" },
  { date: "2026-04-13", checkIn: "—",     checkOut: "—",     status: "OFF" },
  { date: "2026-04-12", checkIn: "08:50", checkOut: "18:00", status: "NORMAL" },
  { date: "2026-04-11", checkIn: "08:45", checkOut: "17:58", status: "NORMAL" },
  { date: "2026-04-10", checkIn: "09:05", checkOut: "18:15", status: "NORMAL" },
  { date: "2026-04-09", checkIn: "09:15", checkOut: "18:02", status: "LATE" },
  { date: "2026-04-08", checkIn: "08:52", checkOut: "18:08", status: "NORMAL" },
  { date: "2026-04-07", checkIn: "08:57", checkOut: "18:00", status: "NORMAL" },
  { date: "2026-04-06", checkIn: "—",     checkOut: "—",     status: "OFF" },
  { date: "2026-04-05", checkIn: "08:50", checkOut: "18:05", status: "NORMAL" },
  { date: "2026-04-04", checkIn: "08:48", checkOut: "18:10", status: "NORMAL" },
  { date: "2026-04-03", checkIn: "08:55", checkOut: "18:03", status: "NORMAL" },
  { date: "2026-04-02", checkIn: "08:58", checkOut: "18:00", status: "NORMAL" },
  { date: "2026-04-01", checkIn: "08:50", checkOut: "18:06", status: "NORMAL" },
  { date: "2026-03-31", checkIn: "09:02", checkOut: "18:02", status: "NORMAL" },
  { date: "2026-03-30", checkIn: "—",     checkOut: "—",     status: "OFF" },
  { date: "2026-03-29", checkIn: "—",     checkOut: "—",     status: "OFF" },
  { date: "2026-03-28", checkIn: "—",     checkOut: "—",     status: "ABSENT" },
  { date: "2026-03-27", checkIn: "09:20", checkOut: "18:05", status: "LATE" },
  { date: "2026-03-26", checkIn: "08:55", checkOut: "18:00", status: "NORMAL" },
  { date: "2026-03-25", checkIn: "08:52", checkOut: "18:08", status: "NORMAL" },
  { date: "2026-03-24", checkIn: "08:50", checkOut: "18:05", status: "NORMAL" },
  { date: "2026-03-23", checkIn: "09:00", checkOut: "18:02", status: "NORMAL" },
  { date: "2026-03-22", checkIn: "—",     checkOut: "—",     status: "OFF" },
  { date: "2026-03-21", checkIn: "08:58", checkOut: "17:55", status: "EARLY_OUT" },
];

/* Wi-Fi 등록 — 강남점 */
const STORE_WIFI_LIST = [
  { id: "wf-1", ssid: "BRIDGE_GANGNAM_5G",    bssid: "a4:**:**:**:**:3e", label: "매장 메인 Wi-Fi", active: true },
  { id: "wf-2", ssid: "BRIDGE_GANGNAM_STAFF", bssid: "a4:**:**:**:**:4a", label: "직원용 Wi-Fi",    active: true },
];

/* 연동 — 배달앱 (가맹점 OWNER가 APP에서 직접 등록) */
const DELIVERY_APPS = [
  { id: "da-1", name: "배달의민족", status: "CONNECTED",    lastSync: "2026-04-19 06:15", accountMasked: "gangn****@bridge.demo" },
  { id: "da-2", name: "쿠팡이츠",   status: "DATA_DELAYED", lastSync: "2026-04-18 06:00", accountMasked: "gangn****@bridge.demo" },
  { id: "da-3", name: "요기요",     status: "CONNECTED",    lastSync: "2026-04-19 06:12", accountMasked: "gangn****@bridge.demo" },
  { id: "da-4", name: "땡겨요",     status: "AUTH_FAILED",  lastSync: "2026-04-15 06:05", accountMasked: "gangn****@bridge.demo" },
];

/* 연동 — VAN·여신·PG (APP 조회만) */
const VAN_INFO = [
  { id: "van-1", name: "VAN사", vendor: "KSNET",      tid: "12****78", status: "CONNECTED" },
];

const CREDIT_ASSOC = [
  { id: "ca-1", name: "여신금융협회", accountMasked: "mega****", status: "CONNECTED" },
];

const PG_INFO = {
  vendor: "KCP",
  mid: "xxxx**1234",
  status: "CONNECTED",
  tids: [
    { id: "T0001", type: "POS",            label: "카운터 1번",     active: true  },
    { id: "T0002", type: "KIOSK",          label: "입구 키오스크",   active: true  },
    { id: "T0003", type: "KIOSK",          label: "2층 키오스크",    active: true  },
    { id: "T0004", type: "SELF_CHECKOUT",  label: "셀프결제단말",    active: false },
  ],
};

/* 직원 목록 (매장관리) — 강남점 팀 5명 */
const STORE_MEMBERS = [
  { userId: "u-bridge-gangnam-owner", name: "김강남", role: "STORE_OWNER",   phone: "010-1234-5678", status: "ACTIVE",  orderPermission: false },
  { userId: "u-bridge-gangnam-mgr",   name: "이관리", role: "STORE_MANAGER", phone: "010-2345-6789", status: "ACTIVE",  orderPermission: false },
  { userId: "u-bridge-gangnam-stf",   name: "박직원", role: "STORE_STAFF",   phone: "010-3456-7890", status: "ACTIVE",  orderPermission: false },
  { userId: "u-bridge-gangnam-s2",    name: "최지훈", role: "STORE_STAFF",   phone: "010-4567-8901", status: "INVITED", orderPermission: false },
  { userId: "u-bridge-gangnam-s3",    name: "정서연", role: "STORE_STAFF",   phone: "010-5678-9012", status: "ACTIVE",  orderPermission: false },
];

/* 1:1 문의 */
const VOC_HISTORY = [
  { id: "VOC-2026-015", type: "배달", subject: "배달앱 리뷰 답변 정책 문의",   status: "ANSWERED", createdAt: "2026-04-16", answeredAt: "2026-04-17" },
  { id: "VOC-2026-012", type: "운영", subject: "POS 영수증 프린터 교체",      status: "IN_PROGRESS", createdAt: "2026-04-10", answeredAt: null },
  { id: "VOC-2026-008", type: "교육", subject: "신규 직원 교육 이수 처리",    status: "CLOSED",   createdAt: "2026-04-02", answeredAt: "2026-04-03" },
];

const VOC_STATUS_META = {
  NEW:         { label: "접수",     color: C.blue,    bg: C.blueSoft    },
  IN_PROGRESS: { label: "처리중",   color: C.orange,  bg: C.orangeSoft  },
  ANSWERED:    { label: "답변완료", color: C.green,   bg: C.greenSoft   },
  CLOSED:      { label: "종료",     color: C.textMuted, bg: C.borderLight },
};

/* 알림 설정 */
const NOTIFICATION_SETTINGS_INITIAL = {
  ops: {
    enabled: true,
    items: [
      { key: "C01",       label: "매장 점검 결과 통보", on: true },
      { key: "C02",       label: "매장 점검 미이행 경고", on: true },
      { key: "C03",       label: "교육 이수 마감 임박", on: true },
      { key: "C04",       label: "교육 미이수 마감 초과", on: true },
      { key: "C05",       label: "매뉴얼·레시피 업데이트", on: true },
      { key: "C-INQ",     label: "1:1 문의 답변 수신", on: true },
      { key: "C-TKT-NEW", label: "배정업무 상태 변경 알림", on: true },
      { key: "C-QSC-REQ", label: "본사 점검 요청 수신", on: true },
    ],
  },
  att: {
    enabled: true,
    items: [
      { key: "C-ATT-01", label: "출근 체크 완료 확인", on: true },
      { key: "C-ATT-02", label: "퇴근 체크 완료 확인", on: true },
      { key: "C10",      label: "지각 발생 알림 (매니저)", on: false },
      { key: "C11",      label: "결근 발생 알림", on: true },
      { key: "C12",      label: "초과근무 발생 알림 (매니저)", on: false },
    ],
  },
  order: {
    enabled: false,
    items: [
      { key: "C07",   label: "배송 출발 알림 (P3)", on: false },
      { key: "C08",   label: "배송 완료 알림 (P3)", on: false },
      { key: "C09",   label: "배송 지연 경고 (P3)", on: false },
      { key: "C-CLM", label: "반품·클레임 처리 결과 (P3)", on: false },
    ],
  },
};

/* ==========================================================================
 * 공통 UI 컴포넌트
 * ========================================================================== */

const Badge = ({ label, color, bg, size = "sm" }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: size === "sm" ? "2px 8px" : "4px 10px",
    borderRadius: 99, fontSize: size === "sm" ? T.xs : T.sm,
    fontWeight: 500, color, background: bg, lineHeight: 1.4,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 12,
    border: `1px solid ${C.border}`,
    padding: 16, cursor: onClick ? "pointer" : "default",
    transition: "box-shadow 0.15s",
    ...style,
  }}>
    {children}
  </div>
);

const KpiCard = ({ label, value, unit = "", sub, color = C.blue, compact = false }) => (
  <div style={{
    background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: compact ? 12 : 14, flex: 1, minWidth: 0,
  }}>
    <div style={{ fontSize: T.xs, color: C.textSub, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexWrap: "wrap" }}>
      <span style={{ fontSize: compact ? T.xl : T.xxl, fontWeight: 600, color, lineHeight: 1.2 }}>{value}</span>
      {unit && <span style={{ fontSize: T.sm, color: C.textSub }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ title, right, noMargin = false }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10, marginTop: noMargin ? 0 : 20,
  }}>
    <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{title}</span>
    {right}
  </div>
);

const EmptyState = ({ title, description, icon }) => (
  <div style={{
    textAlign: "center", padding: "40px 16px", color: C.textSub,
  }}>
    {icon && <div style={{ marginBottom: 12, color: C.textMuted, display: "flex", justifyContent: "center" }}>{icon}</div>}
    <div style={{ fontSize: T.md, fontWeight: 500, color: C.text, marginBottom: 4 }}>{title}</div>
    {description && <div style={{ fontSize: T.sm }}>{description}</div>}
  </div>
);

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 99,
    border: `1px solid ${active ? C.blue : C.border}`,
    background: active ? C.blueSoft : C.white,
    color: active ? C.blue : C.textSub,
    fontSize: T.sm, fontWeight: active ? 600 : 400,
    cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
  }}>
    {label}
  </button>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{
    display: "flex", borderBottom: `1px solid ${C.border}`,
    marginBottom: 14, overflowX: "auto",
  }}>
    {tabs.map(tab => (
      <button key={tab.key} onClick={() => onChange(tab.key)} style={{
        padding: "10px 14px", border: "none", background: "none",
        fontSize: T.md, fontWeight: active === tab.key ? 600 : 400,
        color: active === tab.key ? C.blue : C.textSub,
        borderBottom: active === tab.key ? `2px solid ${C.blue}` : "2px solid transparent",
        cursor: "pointer", whiteSpace: "nowrap",
      }}>
        {tab.label}
      </button>
    ))}
  </div>
);

const PrimaryButton = ({ children, onClick, disabled, variant = "primary", fullWidth = false, style = {} }) => {
  const variantStyle = {
    primary:   { bg: C.blue,   color: C.white,  bgHover: C.blueHover },
    success:   { bg: C.green,  color: C.white },
    danger:    { bg: C.red,    color: C.white },
    ghost:     { bg: "transparent", color: C.blue, border: `1px solid ${C.blue}` },
    secondary: { bg: C.white,  color: C.text, border: `1px solid ${C.border}` },
  }[variant];

  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 18px", borderRadius: 10,
      background: disabled ? C.borderLight : variantStyle.bg,
      color: disabled ? C.textMuted : variantStyle.color,
      border: variantStyle.border || "none",
      fontSize: T.md, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      width: fullWidth ? "100%" : "auto",
      fontFamily: FONT_STACK,
      ...style,
    }}>
      {children}
    </button>
  );
};

/* 데이터 기준 시각 안내 (실시간·현재 금지 정책) */
const DataNotice = ({ children }) => (
  <div style={{
    fontSize: T.xs, color: C.textMuted, marginTop: 6,
    display: "flex", alignItems: "center", gap: 4,
  }}>
    <Icon.clock size={12} />
    <span>{children}</span>
  </div>
);

/* ==========================================================================
 * AppBar & BottomTabBar
 * ========================================================================== */

const AppBar = ({ title, onBack, rightAction, user }) => {
  const isDirectStore = user.storeType === "DIRECT_STORE";
  const isDualRole = !!user.hqSuffix;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 10,
      background: C.white, borderBottom: `1px solid ${C.border}`,
      minHeight: 52, display: "flex", alignItems: "center",
      padding: "8px 12px", gap: 8,
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 6, color: C.text, display: "flex",
        }}>
          <Icon.arrowLeft />
        </button>
      ) : <div style={{ width: 8 }} />}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: T.md, fontWeight: 600, color: C.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {title}
        </div>
        {!onBack && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
            {isDirectStore && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: T.xs, color: C.purple, background: C.purpleSoft,
                padding: "1px 6px", borderRadius: 6, fontWeight: 500,
              }}>
                <Icon.building size={10} color={C.purple} />
                직영점
              </span>
            )}
            {isDualRole && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: T.xs, color: C.orange, background: C.orangeSoft,
                padding: "1px 6px", borderRadius: 6, fontWeight: 500,
              }}>
                <Icon.userBadge size={10} color={C.orange} />
                본사 직원 겸직
              </span>
            )}
          </div>
        )}
      </div>

      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};

const BottomTabBar = ({ tabs, activeTab, onTabChange }) => (
  <div style={{
    position: "sticky", bottom: 0, zIndex: 10,
    background: C.white, borderTop: `1px solid ${C.border}`,
    display: "flex", minHeight: 56,
    paddingBottom: "env(safe-area-inset-bottom)",
  }}>
    {tabs.map(tab => {
      const active = tab.key === activeTab;
      return (
        <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: 6,
          color: active ? C.blue : C.textMuted,
          fontFamily: FONT_STACK,
        }}>
          <tab.icon size={22} color={active ? C.blue : C.textMuted} />
          <span style={{
            fontSize: T.xs, marginTop: 3, fontWeight: active ? 600 : 400,
          }}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

/* 플로팅 챗봇 (P1 버튼만, AI 기능 P2) */
const FloatingChatbot = ({ onClick }) => (
  <button onClick={onClick} style={{
    position: "fixed", right: "max(14px, calc((100vw - 448px) / 2 + 14px))",
    bottom: 72, zIndex: 20,
    width: 52, height: 52, borderRadius: 26,
    background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 100%)`,
    border: "none", cursor: "pointer",
    boxShadow: "0 4px 14px rgba(27, 100, 218, 0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.white,
  }}>
    <Icon.sparkle size={22} color={C.white} />
  </button>
);

/* AI 챗봇 오버레이 */
const ChatbotOverlay = ({ onClose, user, initialQuery }) => {
  const [messages, setMessages] = useState([
    {
      id: "m-init", role: "bot", time: nowString().slice(11),
      text:
        `안녕하세요, ${user.name}님! 👋\n` +
        `브릿지커피 강남점 운영을 도와드리는 AI 어시스턴트예요.\n\n` +
        `매출·근태·연동·업무 등 매장 운영에 대해 궁금한 것을 물어보세요.`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const initialQueryHandled = useRef(false);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // initialQuery가 있으면 자동 전송 (1회만)
  useEffect(() => {
    if (initialQuery && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      // 마운트 직후 상태 업데이트 충돌 방지를 위해 micro delay
      setTimeout(() => sendMessage(initialQuery), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const findResponse = (question) => {
    const q = question.toLowerCase();
    for (const resp of CHATBOT_RESPONSES) {
      const matchedKeywords = resp.keywords.filter(k => q.includes(k.toLowerCase()));
      if (matchedKeywords.length >= Math.min(2, resp.keywords.length)) {
        return resp.answer;
      }
    }
    // 1개 키워드만 매칭되어도 관련있으면 반환
    for (const resp of CHATBOT_RESPONSES) {
      if (resp.keywords.some(k => q.includes(k.toLowerCase()))) {
        return resp.answer;
      }
    }
    return CHATBOT_DEFAULT_ANSWER;
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = {
      id: `m-${Date.now()}`,
      role: "user",
      time: nowString().slice(11),
      text: text.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 0.8초 후 봇 응답 (타이핑 시뮬레이션)
    setTimeout(() => {
      const answer = findResponse(text);
      const botMsg = {
        id: `m-${Date.now()}-bot`,
        role: "bot",
        time: nowString().slice(11),
        text: answer,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleSend = () => sendMessage(inputValue);
  const handleSuggestion = (q) => sendMessage(q);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, width: "100%", maxWidth: 448,
        height: "90vh", borderRadius: "16px 16px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* 헤더 */}
        <div style={{
          padding: "14px 16px", background: C.white,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.sparkle size={18} color={C.white} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.md, fontWeight: 700, color: C.text }}>AI 어시스턴트</div>
            <div style={{ fontSize: T.xs, color: C.green, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
              온라인
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 6, color: C.textSub,
          }}>
            <Icon.x />
          </button>
        </div>

        {/* 메시지 리스트 */}
        <div ref={scrollRef} style={{
          flex: 1, overflow: "auto", padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon.sparkle size={14} color={C.white} />
              </div>
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                padding: "10px 14px", borderRadius: "12px 12px 12px 4px",
                display: "flex", gap: 4,
              }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.15} />
                <TypingDot delay={0.3} />
              </div>
            </div>
          )}
        </div>

        {/* 추천 질문 (초기 메시지만 있을 때 표시) */}
        {messages.length <= 1 && !isTyping && (
          <div style={{
            padding: "0 16px 10px", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ fontSize: T.xs, color: C.textMuted, marginBottom: 4 }}>
              💡 이런 것을 물어볼 수 있어요
            </div>
            {CHATBOT_SUGGESTED.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(q)}
                style={{
                  background: C.white, border: `1px solid ${C.border}`,
                  padding: "10px 12px", borderRadius: 8,
                  fontSize: T.sm, color: C.text, textAlign: "left",
                  cursor: "pointer", fontFamily: FONT_STACK,
                  lineHeight: 1.4,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력 바 */}
        <div style={{
          padding: "10px 12px 14px", background: C.white,
          borderTop: `1px solid ${C.border}`, flexShrink: 0,
          display: "flex", alignItems: "flex-end", gap: 8,
        }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요"
            rows={1}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 20,
              border: `1px solid ${C.border}`, fontSize: T.sm,
              color: C.text, background: C.bg, outline: "none",
              fontFamily: FONT_STACK, resize: "none", maxHeight: 80,
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            style={{
              width: 40, height: 40, borderRadius: 20,
              background: inputValue.trim() && !isTyping ? C.blue : C.borderLight,
              border: "none",
              cursor: inputValue.trim() && !isTyping ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.send size={16} color={inputValue.trim() && !isTyping ? C.white : C.textMuted} />
          </button>
        </div>

        {/* 면책 문구 */}
        <div style={{
          padding: "0 16px 10px", fontSize: 10, color: C.textMuted,
          textAlign: "center", background: C.white, flexShrink: 0,
        }}>
          AI 답변은 참고용입니다 · 중요한 의사결정은 1:1 문의를 이용해 주세요
        </div>
      </div>
    </div>
  );
};

/* 챗봇 말풍선 */
const ChatMessage = ({ message }) => {
  const isBot = message.role === "bot";
  return (
    <div style={{
      display: "flex", gap: 8,
      flexDirection: isBot ? "row" : "row-reverse",
      alignItems: "flex-end",
    }}>
      {isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon.sparkle size={14} color={C.white} />
        </div>
      )}
      <div style={{
        maxWidth: "80%",
        padding: "10px 14px", borderRadius: isBot ? "12px 12px 12px 4px" : "12px 12px 4px 12px",
        background: isBot ? C.white : C.blue,
        color: isBot ? C.text : C.white,
        border: isBot ? `1px solid ${C.border}` : "none",
        fontSize: T.sm, lineHeight: 1.55, whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {message.text}
        <div style={{
          fontSize: 10, color: isBot ? C.textMuted : "rgba(255,255,255,0.75)",
          marginTop: 6, textAlign: isBot ? "left" : "right",
        }}>
          {message.time}
        </div>
      </div>
    </div>
  );
};

/* 타이핑 인디케이터 도트 */
const TypingDot = ({ delay }) => (
  <span style={{
    display: "inline-block", width: 6, height: 6, borderRadius: 3,
    background: C.textMuted,
    animation: `typingBounce 1.2s ${delay}s infinite ease-in-out`,
  }} />
);

/* 알림 센터 오버레이 (알림 벨 클릭) */
const NotificationCenter = ({ notifications, onClose, onMarkRead, onMarkAllRead, onNavigateTo }) => {
  const [filter, setFilter] = useState("ALL");  // ALL / UNREAD

  const displayed = filter === "UNREAD"
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconMap = {
    clipboard: Icon.clipboard, star: Icon.star, mail: Icon.mail,
    alert: Icon.alert, bell: Icon.bell,
  };
  const colorMap = {
    blue: C.blue, green: C.green, orange: C.orange, red: C.red,
    purple: C.purple, textSub: C.textSub,
  };

  const handleItemClick = (n) => {
    onMarkRead(n.id);
    if (n.targetScreen) {
      onNavigateTo(n.targetScreen);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, width: "100%", maxWidth: 448,
        height: "85vh", borderRadius: "16px 16px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* 헤더 */}
        <div style={{
          padding: "14px 16px", background: C.white,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: C.blueSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.bell size={18} color={C.blue} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.md, fontWeight: 700, color: C.text }}>알림</div>
            <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 1 }}>
              {unreadCount > 0 ? `읽지 않음 ${unreadCount}건` : "모든 알림을 확인했어요"}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 6, color: C.textSub,
          }}>
            <Icon.x />
          </button>
        </div>

        {/* 필터 + 모두 읽음 */}
        <div style={{
          padding: "10px 16px", background: C.white,
          borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <FilterChip label={`전체 ${notifications.length}`} active={filter === "ALL"} onClick={() => setFilter("ALL")} />
          <FilterChip label={`읽지 않음 ${unreadCount}`} active={filter === "UNREAD"} onClick={() => setFilter("UNREAD")} />
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                marginLeft: "auto", background: "none", border: "none",
                fontSize: T.xs, color: C.blue, fontWeight: 500, cursor: "pointer",
                padding: "4px 2px",
              }}
            >모두 읽음</button>
          )}
        </div>

        {/* 알림 목록 */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {displayed.length === 0 ? (
            <div style={{ padding: "40px 14px" }}>
              <EmptyState
                title={filter === "UNREAD" ? "읽지 않은 알림이 없어요" : "알림이 없어요"}
                description="새 알림이 오면 여기에 표시됩니다."
                icon={<Icon.bell size={32} color={C.textMuted} />}
              />
            </div>
          ) : (
            displayed.map(n => {
              const IconCmp = iconMap[n.iconType] || Icon.bell;
              const color = colorMap[n.iconColor] || C.textSub;
              return (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    width: "100%", background: n.read ? "transparent" : C.blueSoft,
                    border: "none", borderBottom: `1px solid ${C.borderLight}`,
                    padding: "12px 16px", cursor: "pointer", textAlign: "left",
                    display: "flex", gap: 10, alignItems: "flex-start",
                    fontFamily: FONT_STACK,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: `${color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <IconCmp size={14} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{
                        fontSize: T.sm, fontWeight: n.read ? 500 : 700,
                        color: C.text,
                      }}>{n.title}</span>
                      {!n.read && (
                        <span style={{
                          width: 6, height: 6, borderRadius: 3,
                          background: C.red, flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: T.xs, color: C.textSub, lineHeight: 1.5 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                      {n.time}
                    </div>
                  </div>
                  {n.targetScreen && (
                    <Icon.chevronRight size={14} color={C.textMuted} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
 * 화면: APP-HOME-001 홈 대시보드
 * ========================================================================== */

const HomeScreen = ({ user, onNavigate, wifiState, attendanceState, onCheckIn, onCheckOut, elapsedMin, notices }) => {
  const canSeeSales = user.role === "STORE_OWNER" || user.role === "STORE_MANAGER";
  const canSeeCompare = user.role === "STORE_OWNER";
  const partnerEnabled = TENANT_FLAGS.partnerIntegrationEnabled;
  const unreadNotices = notices.filter(n => !n.read).length;

  // 매장소식 배너 인덱스
  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setBannerIdx(i => (i + 1) % 3), 4500);
    return () => clearInterval(iv);
  }, []);
  const featuredNotices = notices.slice(0, 3);

  return (
    <div style={{ padding: 14 }}>
      {/* ① 매장소식 슬라이드 배너 */}
      <Card
        onClick={() => onNavigate("notice-list")}
        style={{
          padding: 0, overflow: "hidden",
          background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueHover} 100%)`,
          border: "none", color: C.white,
        }}
      >
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Badge
              label={NOTICE_META[featuredNotices[bannerIdx].cat].label}
              color={C.white}
              bg="rgba(255,255,255,0.22)"
            />
            <span style={{ fontSize: T.xs, opacity: 0.85 }}>매장소식</span>
            {unreadNotices > 0 && (
              <span style={{
                marginLeft: "auto", fontSize: T.xs, fontWeight: 600,
                background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 99,
              }}>
                {unreadNotices}건 안읽음
              </span>
            )}
          </div>
          <div style={{ fontSize: T.lg, fontWeight: 600, marginBottom: 4, lineHeight: 1.35 }}>
            {featuredNotices[bannerIdx].title}
          </div>
          <div style={{ fontSize: T.sm, opacity: 0.85, lineHeight: 1.4 }}>
            {featuredNotices[bannerIdx].body}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {featuredNotices.map((_, i) => (
              <div key={i} style={{
                width: i === bannerIdx ? 16 : 6, height: 3,
                borderRadius: 2, background: i === bannerIdx ? C.white : "rgba(255,255,255,0.4)",
                transition: "width 0.3s",
              }} />
            ))}
          </div>
        </div>
      </Card>

      {/* ② 출퇴근 퀵카드 */}
      <div style={{ marginTop: 14 }}>
        <AttendanceQuickCard
          wifiState={wifiState}
          attendanceState={attendanceState}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
          elapsedMin={elapsedMin}
          onSetupWifi={() => onNavigate("staff-settings")}
        />
      </div>

      {/* ③ 매출 KPI 카드 5종 (OWNER·MANAGER) */}
      {canSeeSales && (
        <>
          <SectionHeader title="매출 현황" right={
            <button onClick={() => onNavigate("sales")} style={{
              background: "none", border: "none", fontSize: T.sm, color: C.blue,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
            }}>
              매출 탭 <Icon.chevronRight size={14} color={C.blue} />
            </button>
          } />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <KpiCard
              label="어제 매출"
              value={(5320000 / 10000).toFixed(0)}
              unit="만원"
              sub="전주 동일요일 ▲ 4.2%"
              color={C.blue}
              compact
            />
            <KpiCard
              label="이번달 누적"
              value={(178400000 / 100000000).toFixed(2)}
              unit="억"
              sub="전월 동기 ▲ 8.7%"
              color={C.green}
              compact
            />
            {canSeeCompare && (
              <KpiCard
                label="타 매장 비교"
                value="▲ 11.5%"
                sub="브랜드 평균 대비"
                color={C.green}
                compact
              />
            )}
            <KpiCard
              label="최근 매장 점검"
              value="B"
              unit={`· 87점`}
              sub="2026-04-14 방문 점검"
              color={C.blue}
              compact
            />
          </div>

          {/* 연동 상태 미니 */}
          <Card style={{ marginTop: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: T.sm, color: C.textSub }}>연동 상태</span>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge {...INTEGRATION_STATUS.CONNECTED} />
                <span style={{ fontSize: T.xs, color: C.textMuted }}>POS · 4개 채널 중 3건 정상</span>
              </div>
            </div>
          </Card>
          <DataNotice>2026-04-19 06:15 기준 (D+1 · POS 실시간)</DataNotice>
        </>
      )}

      {/* ④ 배정업무 요약 (OWNER·MANAGER) */}
      {canSeeSales && (
        <>
          <SectionHeader title="배정업무" right={
            <button onClick={() => onNavigate("ops-tickets")} style={{
              background: "none", border: "none", fontSize: T.sm, color: C.blue,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
            }}>
              전체 보기 <Icon.chevronRight size={14} color={C.blue} />
            </button>
          } />
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <div style={{ textAlign: "center", padding: "6px 4px" }}>
                <div style={{ fontSize: T.xxl, fontWeight: 700, color: C.blue }}>2</div>
                <div style={{ fontSize: T.xs, color: C.textSub }}>처리 필요</div>
              </div>
              <div style={{ textAlign: "center", padding: "6px 4px", borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: T.xxl, fontWeight: 700, color: C.orange }}>1</div>
                <div style={{ fontSize: T.xs, color: C.textSub }}>처리중</div>
              </div>
              <div style={{ textAlign: "center", padding: "6px 4px" }}>
                <div style={{ fontSize: T.xxl, fontWeight: 700, color: C.green }}>3</div>
                <div style={{ fontSize: T.xs, color: C.textSub }}>이번주 완료</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ⑤ 광고 배너 (공동구매 — 조건부) */}
      {partnerEnabled && (
        <div
          onClick={() => onNavigate("gdm")}
          style={{
            marginTop: 14, padding: 14, borderRadius: 12, cursor: "pointer",
            background: `linear-gradient(135deg, ${C.purple} 0%, ${C.orange} 100%)`,
            color: C.white,
          }}
        >
          <div style={{ fontSize: T.xs, opacity: 0.88, marginBottom: 4 }}>공동구매 이벤트</div>
          <div style={{ fontSize: T.md, fontWeight: 600, marginBottom: 4 }}>이번주 원두·우유 특가!</div>
          <div style={{ fontSize: T.sm, opacity: 0.88 }}>제휴 공동구매로 원가 최대 18% 절감</div>
        </div>
      )}

      {/* ⑥ 알림 미리보기 */}
      <SectionHeader title="최근 알림" right={
        <span style={{ fontSize: T.xs, color: C.textMuted }}>최근 7일</span>
      } />
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <NotificationItem
            icon={<Icon.clipboard size={16} color={C.orange} />}
            title="배정업무 신규 1건"
            body="에스프레소 머신 압력 이상 점검"
            time="2시간 전"
          />
          <NotificationItem
            icon={<Icon.star size={16} color={C.green} fill={C.green} />}
            title="매장 점검 결과 A등급"
            body="방문 점검 95점 · 박슈퍼"
            time="어제"
          />
          <NotificationItem
            icon={<Icon.mail size={16} color={C.blue} />}
            title="1:1 문의 답변 도착"
            body="VOC-2026-015 배달앱 리뷰 답변"
            time="3일 전"
          />
        </div>
      </Card>
    </div>
  );
};

/* 출퇴근 퀵카드 */
const AttendanceQuickCard = ({ wifiState, attendanceState, onCheckIn, onCheckOut, elapsedMin, onSetupWifi }) => {
  const renderButton = () => {
    if (wifiState === "NOT_REGISTERED") {
      return (
        <PrimaryButton variant="ghost" onClick={onSetupWifi} fullWidth>
          Wi-Fi 설정 필요
        </PrimaryButton>
      );
    }
    if (wifiState !== "CONNECTED_STORE") {
      return (
        <PrimaryButton variant="secondary" disabled fullWidth>
          매장 Wi-Fi 연결 후 체크 가능
        </PrimaryButton>
      );
    }
    if (attendanceState === "NOT_CHECKED_IN") {
      return (
        <PrimaryButton variant="primary" onClick={onCheckIn} fullWidth>
          출근하기
        </PrimaryButton>
      );
    }
    if (attendanceState === "WORKING") {
      return (
        <PrimaryButton variant="success" onClick={onCheckOut} fullWidth>
          퇴근하기 · 근무 {Math.floor(elapsedMin / 60)}시간 {elapsedMin % 60}분
        </PrimaryButton>
      );
    }
    return (
      <PrimaryButton variant="secondary" disabled fullWidth>
        오늘 근무 완료
      </PrimaryButton>
    );
  };

  const wifiMeta = {
    CONNECTED_STORE:    { label: "매장 Wi-Fi 연결됨",    color: C.green,     icon: Icon.wifi },
    CONNECTED_OTHER:    { label: "타 Wi-Fi 연결됨",      color: C.orange,    icon: Icon.wifi },
    NOT_CONNECTED:      { label: "Wi-Fi 미연결",          color: C.textMuted, icon: Icon.wifi },
    NOT_REGISTERED:     { label: "매장 Wi-Fi 미등록",     color: C.red,       icon: Icon.wifi },
  }[wifiState];

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <wifiMeta.icon size={16} color={wifiMeta.color} />
          <span style={{ fontSize: T.sm, color: wifiMeta.color, fontWeight: 500 }}>{wifiMeta.label}</span>
        </div>
        <span style={{ fontSize: T.xs, color: C.textMuted }}>
          {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 현장 기준
        </span>
      </div>
      {renderButton()}
    </Card>
  );
};

const NotificationItem = ({ icon, title, body, time }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: C.borderLight,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>{title}</div>
      <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 1 }}>{body}</div>
    </div>
    <span style={{ fontSize: T.xs, color: C.textMuted, whiteSpace: "nowrap" }}>{time}</span>
  </div>
);

/* ==========================================================================
 * 화면: APP-HOME-002 매장소식 목록·상세
 * ========================================================================== */

const NoticeListScreen = ({ notices, onSelect }) => {
  const [filter, setFilter] = useState("ALL");
  const filtered = notices.filter(n => {
    if (filter === "ALL") return true;
    if (filter === "MY")  return !n.targetAll;
    return true;
  });

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        <FilterChip label="전체" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <FilterChip label="우리 매장" active={filter === "MY"} onClick={() => setFilter("MY")} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(n => {
          const meta = NOTICE_META[n.cat];
          return (
            <Card key={n.id} onClick={() => onSelect(n)}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                {!n.read && <span style={{
                  width: 6, height: 6, borderRadius: 3, background: C.red,
                }} />}
                {!n.targetAll && <Badge label="우리 매장" color={C.purple} bg={C.purpleSoft} />}
                <span style={{ marginLeft: "auto", fontSize: T.xs, color: C.textMuted }}>{n.dt}</span>
              </div>
              <div style={{ fontSize: T.md, fontWeight: n.read ? 400 : 600, color: C.text, marginBottom: 3 }}>
                {n.title}
              </div>
              <div style={{ fontSize: T.sm, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                {n.body}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const NoticeDetailScreen = ({ notice }) => {
  const meta = NOTICE_META[notice.cat];
  return (
    <div style={{ padding: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Badge label={meta.label} color={meta.color} bg={meta.bg} size="md" />
          <span style={{ fontSize: T.xs, color: C.textMuted }}>{notice.dt}</span>
        </div>
        <div style={{ fontSize: T.xl, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.35 }}>
          {notice.title}
        </div>
        <div style={{
          fontSize: T.md, color: C.text, lineHeight: 1.65,
          paddingTop: 12, borderTop: `1px solid ${C.border}`,
          whiteSpace: "pre-wrap",
        }}>
          {notice.body}
          {"\n\n"}자세한 사항은 본사 담당자에게 문의 바랍니다.
        </div>
      </Card>
    </div>
  );
};

/* ==========================================================================
 * 화면: APP-SALES-001~004 매출 탭
 * ========================================================================== */

const SalesScreen = ({ user, onNavigate, onAskAI }) => {
  const [period, setPeriod] = useState("week");
  const canSeeFee = user.role === "STORE_OWNER";
  const canSeeCompare = user.role === "STORE_OWNER";

  const [subTab, setSubTab] = useState("dashboard");

  return (
    <div style={{ padding: 14 }}>
      <TabBar
        tabs={[
          { key: "dashboard", label: "대시보드" },
          { key: "channel",   label: "채널별"   },
          { key: "product",   label: "상품별"   },
          ...(canSeeCompare ? [{ key: "compare", label: "타 매장 비교" }] : []),
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "dashboard" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <FilterChip label="일" active={period === "day"}   onClick={() => setPeriod("day")} />
            <FilterChip label="주" active={period === "week"}  onClick={() => setPeriod("week")} />
            <FilterChip label="월" active={period === "month"} onClick={() => setPeriod("month")} />
          </div>

          {period === "day" && <DailySalesDashboard onTabMove={setSubTab} onAskAI={onAskAI} />}
          {period === "week" && <WeeklySalesDashboard onTabMove={setSubTab} onAskAI={onAskAI} />}
          {period === "month" && <MonthlySalesDashboard onTabMove={setSubTab} onAskAI={onAskAI} />}
        </>
      )}

      {subTab === "channel" && <ChannelSales canSeeFee={canSeeFee} />}
      {subTab === "product" && <ProductSales />}
      {subTab === "compare" && canSeeCompare && <StoreCompare />}
    </div>
  );
};

/* 일간 매출 대시보드 */
const DailySalesDashboard = ({ onTabMove, onAskAI }) => {
  const today = DAILY_SALES_14[DAILY_SALES_14.length - 1];
  const yesterday = DAILY_SALES_14[DAILY_SALES_14.length - 2];
  const growthVsYest = Math.round(((today.v - yesterday.v) / yesterday.v) * 1000) / 10;
  const growthColor = growthVsYest >= 0 ? C.green : C.red;

  // 일간 코칭 — 시간대·어제비교 관점 (INFO + WARN)
  const dailyCoachings = [SALES_COACHING[1], SALES_COACHING[3]];

  return (
    <>
      <SalesCoachingSection
        coachings={dailyCoachings}
        onAction={(target) => onTabMove && onTabMove(target)}
        onAskAI={(title) => onAskAI && onAskAI(`${title}에 대해 자세히 설명해 주세요`)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <KpiCard label="오늘 매출"   value={Math.round(today.v / 10000).toString()} unit="만원" color={C.blue}   compact
          sub={<span style={{ color: growthColor, fontWeight: 600 }}>
            {growthVsYest >= 0 ? "+" : ""}{growthVsYest}% vs 어제
          </span>} />
        <KpiCard label="주문 건수"    value="268"                color={C.green}  compact />
        <KpiCard label="평균 객단가"  value="4,832" unit="원"    color={C.orange} compact />
      </div>

      <Card style={{ marginTop: 14 }}>
        <SectionHeader title="일별 매출 추이 (최근 14일)" noMargin />
        <div style={{ height: 180, marginTop: 4 }}>
          <ResponsiveContainer>
            <BarChart data={DAILY_SALES_14}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.textSub }} />
              <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
              <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} labelFormatter={l => `${l} ${DAILY_SALES_14.find(x => x.date === l)?.dow || ""}`} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {DAILY_SALES_14.map((entry, i) => (
                  <Cell key={i} fill={entry.dow === "토" || entry.dow === "일" ? C.orange : C.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: T.xs, color: C.textSub, justifyContent: "center" }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, background: C.blue, borderRadius: 2, marginRight: 4 }}></span>평일</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, background: C.orange, borderRadius: 2, marginRight: 4 }}></span>주말</span>
        </div>
        <DataNotice>2026-04-19 06:15 기준 (D+1)</DataNotice>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <SectionHeader title="시간대별 매출 (오늘)" noMargin />
        <div style={{ height: 160, marginTop: 4 }}>
          <ResponsiveContainer>
            <LineChart data={HOURLY_SALES}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: C.textSub }} />
              <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickFormatter={v => `${(v / 1000).toFixed(0)}천`} />
              <Tooltip formatter={v => `${v.toLocaleString()}원`} />
              <Line type="monotone" dataKey="v" stroke={C.purple} strokeWidth={2.4} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
};

/* 주간 매출 대시보드 */
const WeeklySalesDashboard = ({ onTabMove, onAskAI }) => {
  // 주간 코칭 — 성장세/객단가/배달비중 (GOOD + TIP + INFO)
  const weeklyCoachings = [SALES_COACHING[0], SALES_COACHING[2], SALES_COACHING[3]];
  return (
    <>
      <SalesCoachingSection
        coachings={weeklyCoachings}
        onAction={(target) => onTabMove && onTabMove(target)}
        onAskAI={(title) => onAskAI && onAskAI(`${title}에 대해 자세히 설명해 주세요`)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
      <KpiCard label="이번 주 매출" value="828"   unit="만원" color={C.blue}   compact
        sub={<span style={{ color: C.green, fontWeight: 600 }}>+4.9% vs 지난주</span>} />
      <KpiCard label="주문 건수"    value="1,725"              color={C.green}  compact />
      <KpiCard label="평균 객단가"  value="4,800" unit="원"    color={C.orange} compact />
    </div>

    <Card style={{ marginTop: 14 }}>
      <SectionHeader title="주간 매출 추이 (최근 8주)" noMargin />
      <div style={{ height: 180, marginTop: 4 }}>
        <ResponsiveContainer>
          <BarChart data={WEEKLY_SALES}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="w" tick={{ fontSize: 11, fill: C.textSub }} />
            <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {WEEKLY_SALES.map((entry, i) => (
                <Cell key={i} fill={i === WEEKLY_SALES.length - 1 ? C.blue : C.blueSoft} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataNotice>2026-04-19 06:15 기준 (주간 시작 월요일 · D+1)</DataNotice>
    </Card>

    <Card style={{ marginTop: 14 }}>
      <SectionHeader title="요일별 패턴 (이번 주)" noMargin />
      <div style={{ height: 140, marginTop: 4 }}>
        <ResponsiveContainer>
          <LineChart data={DAILY_SALES_BASE}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.textSub }} />
            <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} />
            <Line type="monotone" dataKey="v" stroke={C.green} strokeWidth={2.4} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </>
  );
};

/* 월간 매출 대시보드 */
const MonthlySalesDashboard = ({ onTabMove, onAskAI }) => {
  // 월간 코칭 — 시즌/성장/하이라이트 (GOOD + WARN)
  const monthlyCoachings = [SALES_COACHING[0], SALES_COACHING[1], SALES_COACHING[3]];
  return (
    <>
    <SalesCoachingSection
      coachings={monthlyCoachings}
      onAction={(target) => onTabMove && onTabMove(target)}
      onAskAI={(title) => onAskAI && onAskAI(`${title}에 대해 자세히 설명해 주세요`)}
    />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      <KpiCard label="이번 달 누적" value={Math.round(MONTH_SUMMARY.totalSales / 10000).toString()} unit="만원" color={C.blue} compact
        sub={<span style={{ color: C.green, fontWeight: 600 }}>+{MONTH_SUMMARY.growthPct}% vs 3월 동일 기간</span>} />
      <KpiCard label="주문 건수" value={MONTH_SUMMARY.totalOrders.toLocaleString()} color={C.green} compact
        sub={<span style={{ color: C.textMuted }}>{MONTH_SUMMARY.period.split("(")[1]?.replace(")", "") || ""}</span>} />
    </div>

    <Card style={{ marginTop: 14 }}>
      <SectionHeader title="월별 매출 추이 (최근 12개월)" noMargin />
      <div style={{ height: 200, marginTop: 4 }}>
        <ResponsiveContainer>
          <BarChart data={MONTHLY_SALES_12}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.textSub }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickFormatter={v => `${(v / 10000000).toFixed(0)}천만`} />
            <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {MONTHLY_SALES_12.map((entry, i) => {
                const isCurrent = i === MONTHLY_SALES_12.length - 1;
                const isSummer  = ["2025-07", "2025-08"].includes(entry.month);
                return (
                  <Cell key={i} fill={isCurrent ? C.blue : isSummer ? C.orange : C.blueSoft} />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: T.xs, color: C.textSub, justifyContent: "center" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: C.blue, borderRadius: 2, marginRight: 4 }}></span>이번 달 (진행중)</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: C.orange, borderRadius: 2, marginRight: 4 }}></span>성수기(7·8월)</span>
      </div>
      <DataNotice>2026-04-19 06:15 기준 (진행 중 월 포함)</DataNotice>
    </Card>

    <Card style={{ marginTop: 14 }}>
      <SectionHeader title="이번 달 하이라이트" noMargin />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        <HighlightRow
          label="최고 매출일"
          value={`${Math.round(MONTH_SUMMARY.bestDay.sales / 10000)}만원`}
          sub={MONTH_SUMMARY.bestDay.date}
          color={C.green}
          icon={<Icon.star size={14} color={C.green} />}
        />
        <HighlightRow
          label="최저 매출일"
          value={`${Math.round(MONTH_SUMMARY.worstDay.sales / 10000)}만원`}
          sub={MONTH_SUMMARY.worstDay.date}
          color={C.red}
          icon={<Icon.alert size={14} color={C.red} />}
        />
        <HighlightRow
          label="평균 일매출"
          value={`${Math.round(MONTH_SUMMARY.totalSales / 19 / 10000)}만원`}
          sub={`${MONTH_SUMMARY.totalOrders.toLocaleString()}건 / 19일`}
          color={C.blue}
          icon={<Icon.trending size={14} color={C.blue} />}
        />
      </div>
    </Card>
  </>
  );
};

const HighlightRow = ({ label, value, sub, color, icon }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
    borderBottom: `1px solid ${C.borderLight}`,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 16, background: `${color}15`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: T.sm, color: C.text, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 1 }}>{sub}</div>
    </div>
    <div style={{ fontSize: T.md, fontWeight: 700, color }}>{value}</div>
  </div>
);

/* 매출 코칭 섹션 — 대시보드 상단의 AI 인사이트 카드 */
const COACHING_META = {
  GOOD: { label: "좋은 흐름",  color: C.green,  bg: C.greenSoft,  iconType: "trending" },
  WARN: { label: "주의 필요",  color: C.orange, bg: C.orangeSoft, iconType: "alert"    },
  TIP:  { label: "개선 팁",    color: C.purple, bg: C.purpleSoft, iconType: "sparkle"  },
  INFO: { label: "참고 정보",  color: C.blue,   bg: C.blueSoft,   iconType: "chart"    },
};

const SalesCoachingSection = ({ coachings, onAction, onAskAI }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = coachings[activeIdx];
  const meta = COACHING_META[active.type];
  const IconCmp = {
    trending: Icon.trending, alert: Icon.alert,
    sparkle:  Icon.sparkle,  chart: Icon.chart,
  }[meta.iconType] || Icon.sparkle;

  return (
    <Card style={{
      marginBottom: 14, background: meta.bg,
      border: `1px solid ${meta.color}33`,
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 15,
          background: meta.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IconCmp size={15} color={C.white} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, letterSpacing: 0.3 }}>
              AI 코칭
            </span>
            <Badge label={meta.label} color={meta.color} bg={C.white} />
          </div>
          <div style={{ fontSize: T.md, fontWeight: 700, color: C.text, marginTop: 3, lineHeight: 1.35 }}>
            {active.title}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{
        fontSize: T.sm, color: C.text, lineHeight: 1.6,
        background: C.white, padding: "10px 12px", borderRadius: 8,
      }}>
        {active.body}
      </div>

      {/* 액션 */}
      {active.action && (
        <div style={{
          marginTop: 8, padding: "8px 12px", background: C.white,
          borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
          border: `1px dashed ${meta.color}66`,
        }}>
          <Icon.sparkle size={12} color={meta.color} />
          <span style={{ flex: 1, fontSize: T.xs, color: C.text, lineHeight: 1.5 }}>
            {active.action}
          </span>
          {active.actionTarget && onAction && (
            <button
              onClick={() => onAction(active.actionTarget)}
              style={{
                background: meta.color, color: C.white, border: "none",
                padding: "4px 10px", borderRadius: 4, fontSize: T.xs,
                fontWeight: 600, cursor: "pointer",
              }}
            >이동</button>
          )}
        </div>
      )}

      {/* 페이지네이션 + AI에게 묻기 */}
      <div style={{
        display: "flex", alignItems: "center", marginTop: 10, gap: 6,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {coachings.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: i === activeIdx ? 18 : 6, height: 6, borderRadius: 3,
                background: i === activeIdx ? meta.color : `${meta.color}44`,
                border: "none", cursor: "pointer",
                transition: "width 0.2s",
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: T.xs, color: C.textMuted, marginLeft: 4 }}>
          {activeIdx + 1} / {coachings.length}
        </span>
        <div style={{ flex: 1 }} />
        {onAskAI && (
          <button
            onClick={() => onAskAI(active.title)}
            style={{
              background: "none", border: `1px solid ${meta.color}66`,
              padding: "5px 10px", borderRadius: 14,
              fontSize: T.xs, fontWeight: 500, color: meta.color,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            <Icon.sparkle size={11} color={meta.color} />
            <span>AI에게 묻기</span>
          </button>
        )}
      </div>
    </Card>
  );
};

/* 시간대별 매출 (일 탭용) */
const HOURLY_SALES = [
  { hour: "07시", v:  45000 }, { hour: "08시", v:  92000 }, { hour: "09시", v: 128000 },
  { hour: "10시", v:  98000 }, { hour: "11시", v: 118000 }, { hour: "12시", v: 165000 },
  { hour: "13시", v: 142000 }, { hour: "14시", v: 102000 }, { hour: "15시", v:  88000 },
  { hour: "16시", v:  74000 }, { hour: "17시", v:  65000 }, { hour: "18시", v:  78000 },
];

const ChannelSales = ({ canSeeFee }) => {
  const total = SALES_CHANNELS.reduce((a, c) => a + c.v, 0);
  return (
    <>
      <Card>
        <SectionHeader title="채널별 매출 비중" noMargin />
        <div style={{ height: 180 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={SALES_CHANNELS} dataKey="v" nameKey="ch" cx="50%" cy="50%" outerRadius={60} innerRadius={32}>
                {SALES_CHANNELS.map((_, i) => {
                  const colors = [C.blue, C.green, C.orange, C.purple, C.red];
                  return <Cell key={i} fill={colors[i % colors.length]} />;
                })}
              </Pie>
              <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {SALES_CHANNELS.map(c => {
          const stat = INTEGRATION_STATUS[c.status];
          return (
            <Card key={c.ch}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{c.ch}</span>
                  <Badge label={stat.label} color={stat.color} bg={stat.bg} />
                  {c.realtime && <Badge label="실시간 연동" color={C.green} bg={C.greenSoft} />}
                  {!c.realtime && <Badge label="D+1" color={C.textMuted} bg={C.borderLight} />}
                </div>
                <span style={{ fontSize: T.xs, color: C.textMuted }}>{c.ratio}%</span>
              </div>
              {c.status === "AUTH_FAILED" && (
                <div style={{
                  padding: "8px 10px", background: C.redSoft, borderRadius: 8,
                  fontSize: T.xs, color: C.red, marginBottom: 8,
                }}>
                  {c.ch} 계정 연동을 확인해 주세요. 본사에 재등록 요청하세요.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: canSeeFee ? "1fr 1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
                <MiniStat label="매출액" value={`${(c.v / 10000).toFixed(0)}만`} />
                <MiniStat label="취소"   value={`${c.cancel}건`} />
                {canSeeFee && <MiniStat label="수수료"    value={`${(c.fee / 10000).toFixed(1)}만`} color={C.red} />}
                {canSeeFee && <MiniStat label="정산 예정" value={`${(c.payout / 10000).toFixed(0)}만`} color={C.green} />}
              </div>
            </Card>
          );
        })}
      </div>
      <DataNotice>POS는 실시간, 배달앱은 D+1 기준 · 최근 동기화 2026-04-19 06:15</DataNotice>
    </>
  );
};

const MiniStat = ({ label, value, color = C.text }) => (
  <div>
    <div style={{ fontSize: T.xs, color: C.textMuted }}>{label}</div>
    <div style={{ fontSize: T.sm, fontWeight: 600, color }}>{value}</div>
  </div>
);

const ProductSales = () => {
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState("sales");  // sales / qty / growth

  const filtered = cat === "전체" ? PRODUCT_SALES : PRODUCT_SALES.filter(p => p.category === cat);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "sales")  return b.sales - a.sales;
    if (sort === "qty")    return b.qty - a.qty;
    if (sort === "growth") return (b.growth ?? -999) - (a.growth ?? -999);
    return 0;
  });

  const totalSales = filtered.reduce((a, p) => a + p.sales, 0);
  const totalQty   = filtered.reduce((a, p) => a + p.qty, 0);
  const categoryBreakdown = PRODUCT_CATEGORIES.slice(1).map(c => {
    const items = PRODUCT_SALES.filter(p => p.category === c);
    const sum = items.reduce((a, p) => a + p.sales, 0);
    return { name: c, value: sum, count: items.length };
  }).filter(c => c.value > 0);

  const CAT_COLORS = {
    "커피": C.blue, "시즌": C.orange, "베이커리": C.purple, "푸드": C.green,
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        <KpiCard label="상품 수"      value={filtered.length}                    color={C.text}   compact />
        <KpiCard label="판매량"        value={totalQty.toLocaleString()}           color={C.green}  compact />
        <KpiCard label="총 매출"       value={Math.round(totalSales / 10000).toString()} unit="만원" color={C.blue} compact />
      </div>

      {/* 카테고리별 매출 비중 */}
      <Card>
        <SectionHeader title="카테고리별 매출 비중" noMargin />
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10 }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={CAT_COLORS[entry.name] || C.textMuted} />
                  ))}
                </Pie>
                <Tooltip formatter={v => `${(v / 10000).toFixed(0)}만원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {categoryBreakdown.map(c => {
              const pct = ((c.value / totalSales) * 100).toFixed(1);
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: T.sm }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[c.name] }} />
                  <span style={{ flex: 1, color: C.text }}>{c.name}</span>
                  <span style={{ color: C.textSub, fontSize: T.xs }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <SectionHeader title="상품별 판매 현황" />

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
        {PRODUCT_CATEGORIES.map(c => (
          <FilterChip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      {/* 정렬 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, fontSize: T.xs, color: C.textSub }}>
        <span style={{ marginRight: 4, alignSelf: "center" }}>정렬:</span>
        <FilterChip label="매출순"   active={sort === "sales"}  onClick={() => setSort("sales")} />
        <FilterChip label="판매량순" active={sort === "qty"}    onClick={() => setSort("qty")} />
        <FilterChip label="성장률순" active={sort === "growth"} onClick={() => setSort("growth")} />
      </div>

      {/* 상품 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((p, i) => (
          <Card key={p.id} style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                background: i < 3 ? C.orange : C.borderLight,
                color: i < 3 ? C.white : C.textSub,
                fontSize: T.xs, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: T.sm, fontWeight: 600, color: C.text }}>{p.name}</span>
                  {p.isNew && <Badge label="NEW" color={C.orange} bg={C.orangeSoft} />}
                </div>
                <div style={{ fontSize: T.xs, color: C.textMuted }}>
                  {p.category} · {p.price.toLocaleString()}원 · {p.qty}개
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: T.sm, fontWeight: 700, color: C.text }}>
                  {Math.round(p.sales / 10000)}만
                </div>
                {p.growth !== null ? (
                  <div style={{
                    fontSize: T.xs, fontWeight: 600,
                    color: p.growth >= 0 ? C.green : C.red, marginTop: 1,
                  }}>
                    {p.growth >= 0 ? "+" : ""}{p.growth}%
                  </div>
                ) : (
                  <div style={{ fontSize: T.xs, color: C.purple, marginTop: 1 }}>신규</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataNotice>2026-04-19 06:15 기준 · 이번 주 합산 (POS 상품 단위)</DataNotice>
    </>
  );
};

const StoreCompare = () => {
  const ourVsBrand = ((STORE_COMPARE.ourSales - STORE_COMPARE.brandAvg) / STORE_COMPARE.brandAvg * 100).toFixed(1);
  const ourVsRegion = ((STORE_COMPARE.ourSales - STORE_COMPARE.regionOtherAvg) / STORE_COMPARE.regionOtherAvg * 100).toFixed(1);

  return (
    <>
      <Card>
        <SectionHeader title="3중 비교 지표" noMargin />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <CompareRow
            label="① 우리 매장 실매출"
            value={`${(STORE_COMPARE.ourSales / 10000).toLocaleString()}만원`}
            color={C.blue}
            emphasis
          />
          <CompareRow
            label="② 동일 브랜드 평균"
            value={`${(STORE_COMPARE.brandAvg / 10000).toLocaleString()}만원`}
            diff={`▲ ${ourVsBrand}%`}
            diffColor={C.green}
            source={STORE_COMPARE.brandSource}
          />
          <CompareRow
            label="③ 지역 동업종 평균"
            value={`${(STORE_COMPARE.regionOtherAvg / 10000).toLocaleString()}만원`}
            diff={`▲ ${ourVsRegion}%`}
            diffColor={C.green}
            source={STORE_COMPARE.regionSource}
          />
        </div>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <SectionHeader title="매출 포지셔닝" noMargin />
        <div style={{ marginTop: 10 }}>
          <PositionBar ourSales={STORE_COMPARE.ourSales} brandAvg={STORE_COMPARE.brandAvg} regionOther={STORE_COMPARE.regionOtherAvg} />
        </div>
      </Card>
    </>
  );
};

const CompareRow = ({ label, value, diff, diffColor, source, color, emphasis }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: T.sm, color: C.textSub, fontWeight: emphasis ? 600 : 400 }}>{label}</span>
      <div>
        <span style={{ fontSize: emphasis ? T.lg : T.md, fontWeight: emphasis ? 700 : 600, color: color || C.text }}>{value}</span>
        {diff && <span style={{ fontSize: T.sm, color: diffColor, marginLeft: 6 }}>{diff}</span>}
      </div>
    </div>
    {source && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{source}</div>}
  </div>
);

const PositionBar = ({ ourSales, brandAvg, regionOther }) => {
  const max = Math.max(ourSales, brandAvg, regionOther) * 1.1;
  return (
    <>
      <BarRow label="우리 매장" value={ourSales} max={max} color={C.blue} />
      <BarRow label="브랜드 평균" value={brandAvg} max={max} color={C.green} />
      <BarRow label="지역 동업종" value={regionOther} max={max} color={C.orange} />
    </>
  );
};

const BarRow = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: T.sm, color: C.textSub }}>{label}</span>
      <span style={{ fontSize: T.sm, fontWeight: 600, color }}>{(value / 10000).toLocaleString()}만원</span>
    </div>
    <div style={{ height: 8, borderRadius: 4, background: C.borderLight, overflow: "hidden" }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: "100%", background: color, transition: "width 0.4s",
      }} />
    </div>
  </div>
);

/* ==========================================================================
 * 화면: APP-OPS 운영 탭 (허브 + 5개 화면)
 * ========================================================================== */

const OpsHubScreen = ({ user, onNavigate }) => {
  const canSeeQsc = user.role === "STORE_OWNER" || user.role === "STORE_MANAGER";

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <OpsHubCard
          icon={<Icon.clipboard size={22} color={C.blue} />}
          title="배정업무"
          subtitle="처리 필요 2건 · 처리중 1건"
          onClick={() => onNavigate("ops-tickets")}
        />
        {canSeeQsc && (
          <OpsHubCard
            icon={<Icon.star size={22} color={C.green} fill={C.green} />}
            title="매장 점검"
            subtitle="이번달 평균 87점 (B등급)"
            onClick={() => onNavigate("ops-qsc")}
          />
        )}
        <OpsHubCard
          icon={<Icon.check size={22} color={C.orange} />}
          title="본사 점검 요청"
          subtitle={`요청 ${REMOTE_REQUESTS.length}건 · 마감 D-2`}
          onClick={() => onNavigate("ops-remote")}
          badge={REMOTE_REQUESTS.length > 0 ? "NEW" : null}
        />
        {canSeeQsc && (
          <OpsHubCard
            icon={<Icon.camera size={22} color={C.purple} />}
            title="방문 점검"
            subtitle="최근 방문: 2026-04-14"
            onClick={() => onNavigate("ops-visit")}
          />
        )}
        <OpsHubCard
          icon={<Icon.book size={22} color={C.blue} />}
          title="교육·매뉴얼"
          subtitle="미이수 1건 · 신규 2건"
          onClick={() => onNavigate("ops-edu")}
          badge={"2"}
        />
      </div>
    </div>
  );
};

const OpsHubCard = ({ icon, title, subtitle, onClick, badge }) => (
  <Card onClick={onClick} style={{ padding: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: C.borderLight,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: C.white, background: C.red,
              padding: "1px 6px", borderRadius: 99,
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: T.sm, color: C.textSub }}>{subtitle}</div>
      </div>
      <Icon.chevronRight color={C.textMuted} />
    </div>
  </Card>
);

/* APP-OPS-001 배정업무 (v1.3 라벨) */
const TICKET_CATEGORIES = ["장비", "위생", "교육", "마케팅", "재고", "기타"];
const TICKET_PRIORITIES_ENUM = [
  { key: "HIGH",   label: "긴급" },
  { key: "NORMAL", label: "보통" },
  { key: "LOW",    label: "낮음" },
];

const TicketsScreen = ({ user }) => {
  const [status, setStatus] = useState("ALL");
  const [tickets, setTickets] = useState(TICKETS);
  const [completingTicket, setCompletingTicket] = useState(null);
  const [completionNote, setCompletionNote] = useState("");

  // 업무 생성 state (점주·매니저만)
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle]       = useState("");
  const [newCategory, setNewCategory] = useState("장비");
  const [newPriority, setNewPriority] = useState("NORMAL");
  const [newAssignee, setNewAssignee] = useState(user.userId);
  const [newDue, setNewDue]           = useState("");
  const [newDesc, setNewDesc]         = useState("");

  // 배정 가능 대상 산출 (본인 + 하위 권한자)
  // OWNER: 본인 + MANAGER + STAFF
  // MANAGER: 본인 + STAFF
  // STAFF: 생성 불가 (UI 숨김)
  const assignableMembers = STORE_MEMBERS.filter(m => {
    if (m.status !== "ACTIVE" && m.status !== "INVITED") return false;
    if (user.role === "STORE_OWNER") {
      return true;  // OWNER는 모두 배정 가능
    }
    if (user.role === "STORE_MANAGER") {
      return m.userId === user.userId || m.role === "STORE_STAFF";
    }
    return false;
  });

  const canCreate = user.role === "STORE_OWNER" || user.role === "STORE_MANAGER";

  const filtered = tickets.filter(t => {
    if (status === "ALL")    return true;
    if (status === "ACTIVE") return t.status === "OPEN" || t.status === "IN_PROGRESS";
    if (status === "DONE")   return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  // 역할별 접근 필터 (STAFF는 본인 배정만)
  const visible = user.role === "STORE_STAFF"
    ? filtered.filter(t => t.assignee === user.userId)
    : filtered;

  const handleStart = (ticketId) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: "IN_PROGRESS" } : t
    ));
  };

  const handleCompleteSubmit = () => {
    if (!completingTicket) return;
    setTickets(prev => prev.map(t =>
      t.id === completingTicket.id ? { ...t, status: "RESOLVED", completionNote } : t
    ));
    setCompletingTicket(null);
    setCompletionNote("");
  };

  const openCreate = () => {
    setNewTitle("");
    setNewCategory("장비");
    setNewPriority("NORMAL");
    setNewAssignee(user.userId);
    // 기본 마감일: 오늘 + 3일
    const due = new Date();
    due.setDate(due.getDate() + 3);
    setNewDue(due.toISOString().slice(0, 10));
    setNewDesc("");
    setShowCreate(true);
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      alert("업무 제목을 입력해 주세요.");
      return;
    }
    if (!newDue) {
      alert("마감일을 선택해 주세요.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (newDue < today) {
      alert("마감일은 오늘 이후로 설정해 주세요.");
      return;
    }
    const year = new Date().getFullYear();
    const nextNum = (tickets.filter(t => t.id.startsWith(`TKT-${year}`)).length + 1)
      .toString().padStart(3, "0");
    const newTicket = {
      id:          `TKT-${year}-${nextNum}`,
      title:       newTitle.trim(),
      category:    newCategory,
      priority:    newPriority,
      status:      "OPEN",
      assignee:    newAssignee,
      due:         newDue,
      createdAt:   nowString(),
      description: newDesc.trim() || null,
      createdBy:   user.userId,
    };
    setTickets(prev => [newTicket, ...prev]);
    setShowCreate(false);
    const assigneeName = STORE_MEMBERS.find(m => m.userId === newAssignee)?.name || "—";
    alert(`업무가 생성되었습니다.\n${newTicket.id} · ${assigneeName}님에게 배정`);
  };

  return (
    <div style={{ padding: 14 }}>
      {canCreate && (
        <PrimaryButton variant="primary" fullWidth onClick={openCreate} style={{ marginBottom: 12 }}>
          + 새 업무 배정
        </PrimaryButton>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        <FilterChip label="전체"    active={status === "ALL"}    onClick={() => setStatus("ALL")} />
        <FilterChip label="진행 중" active={status === "ACTIVE"} onClick={() => setStatus("ACTIVE")} />
        <FilterChip label="완료"    active={status === "DONE"}   onClick={() => setStatus("DONE")} />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="배정된 업무가 없습니다" icon={<Icon.clipboard size={32} color={C.textMuted} />} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.map(t => {
            const st = TICKET_STATUS[t.status];
            const pr = TICKET_PRIORITY[t.priority];
            const isOverdue = (t.status === "OPEN" || t.status === "IN_PROGRESS") &&
              new Date(t.due) < new Date("2026-04-19");
            return (
              <Card key={t.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                  <Badge label={pr.label} color={pr.color} bg={C.white} />
                  <span style={{ fontSize: T.xs, color: C.textMuted, marginLeft: "auto" }}>{t.id}</span>
                </div>
                <div style={{ fontSize: T.md, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  {t.title}
                </div>
                <div style={{
                  display: "flex", gap: 12, fontSize: T.xs, color: C.textSub,
                  paddingTop: 8, borderTop: `1px solid ${C.borderLight}`,
                }}>
                  <span>카테고리: {t.category}</span>
                  <span>담당: {STORE_MEMBERS.find(m => m.userId === t.assignee)?.name || "—"}</span>
                  <span style={{ color: isOverdue ? C.red : C.textSub, fontWeight: isOverdue ? 600 : 400 }}>
                    마감 {t.due}{isOverdue ? " (SLA 초과)" : ""}
                  </span>
                </div>
                {t.completionNote && (
                  <div style={{
                    marginTop: 8, padding: 8, background: C.greenSoft, borderRadius: 6,
                    fontSize: T.xs, color: C.green, lineHeight: 1.5,
                  }}>
                    <strong>완료 보고:</strong> {t.completionNote}
                  </div>
                )}
                {(t.status === "OPEN" || t.status === "IN_PROGRESS") && user.role !== "STORE_STAFF" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {t.status === "OPEN" && (
                      <PrimaryButton
                        variant="ghost"
                        style={{ padding: "6px 12px", fontSize: T.sm }}
                        onClick={() => handleStart(t.id)}
                      >처리 시작</PrimaryButton>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <PrimaryButton
                        variant="success"
                        style={{ padding: "6px 12px", fontSize: T.sm }}
                        onClick={() => { setCompletingTicket(t); setCompletionNote(""); }}
                      >완료 보고</PrimaryButton>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {completingTicket && (
        <BottomSheet title="완료 보고" onClose={() => setCompletingTicket(null)}>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: T.sm, color: C.text, fontWeight: 500, marginBottom: 4 }}>
              {completingTicket.title}
            </div>
            <div style={{ fontSize: T.xs, color: C.textMuted, marginBottom: 14 }}>
              {completingTicket.id}
            </div>
            <InputField
              label="처리 내용 (필수)"
              value={completionNote}
              onChange={setCompletionNote}
              placeholder="어떻게 처리했는지 간단히 작성해 주세요"
              type="textarea"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <PrimaryButton variant="ghost" onClick={() => setCompletingTicket(null)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="success"
                disabled={!completionNote.trim()}
                onClick={handleCompleteSubmit}
                style={{ flex: 2 }}
              >
                완료 보고 제출
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}

      {showCreate && (
        <BottomSheet title="새 업무 배정" onClose={() => setShowCreate(false)}>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InputField
              label="업무 제목 (필수)"
              value={newTitle}
              onChange={setNewTitle}
              placeholder="예: 에스프레소 머신 청소"
            />
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>카테고리</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TICKET_CATEGORIES.map(c => (
                  <FilterChip key={c} label={c} active={newCategory === c} onClick={() => setNewCategory(c)} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>우선순위</label>
              <div style={{ display: "flex", gap: 6 }}>
                {TICKET_PRIORITIES_ENUM.map(p => (
                  <FilterChip key={p.key} label={p.label} active={newPriority === p.key} onClick={() => setNewPriority(p.key)} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>
                담당자 ({user.role === "STORE_OWNER" ? "본인 + 매니저 + 직원" : "본인 + 직원"})
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {assignableMembers.map(m => {
                  const isSelf = m.userId === user.userId;
                  return (
                    <button
                      key={m.userId}
                      onClick={() => setNewAssignee(m.userId)}
                      style={{
                        padding: "10px 12px", borderRadius: 8,
                        border: `1px solid ${newAssignee === m.userId ? C.blue : C.border}`,
                        background: newAssignee === m.userId ? C.blueSoft : C.white,
                        cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: newAssignee === m.userId ? C.blue : C.borderLight,
                        color: newAssignee === m.userId ? C.white : C.textSub,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: T.xs, fontWeight: 600,
                      }}>{m.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>
                          {m.name}{isSelf && " (본인)"}
                        </div>
                        <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 1 }}>
                          {ROLE_LABEL[m.role]} · {m.status === "INVITED" ? "초대 중" : "활성"}
                        </div>
                      </div>
                      {newAssignee === m.userId && (
                        <Icon.check size={16} color={C.blue} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>마감일 (필수)</label>
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${C.border}`, fontSize: T.md,
                  color: C.text, background: C.white, outline: "none",
                  fontFamily: FONT_STACK, boxSizing: "border-box",
                }}
              />
            </div>
            <InputField
              label="상세 설명 (선택)"
              value={newDesc}
              onChange={setNewDesc}
              placeholder="업무에 필요한 추가 설명을 입력하세요"
              type="textarea"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!newTitle.trim() || !newDue}
                onClick={handleCreate}
                style={{ flex: 2 }}
              >
                업무 배정
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

/* APP-OPS-002 매장 점검 (v1.3 라벨) */
const QscScreen = () => {
  const latest = QSC_RESULTS[0];
  const thisMonthAvg = Math.round(
    QSC_RESULTS.filter(r => r.dt.startsWith("2026-04")).reduce((a, b) => a + b.score, 0) /
    QSC_RESULTS.filter(r => r.dt.startsWith("2026-04")).length
  );
  const gMeta = GRADE_COLOR[latest.grade];

  return (
    <div style={{ padding: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: gMeta.bg, color: gMeta.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: T.xxxl, fontWeight: 700,
          }}>
            {latest.grade}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.xs, color: C.textSub, marginBottom: 2 }}>이번달 평균</div>
            <div style={{ fontSize: T.xxl, fontWeight: 700, color: C.text }}>
              {thisMonthAvg}<span style={{ fontSize: T.md, fontWeight: 400, color: C.textSub }}> 점</span>
            </div>
            <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>
              최근 {QSC_RESULTS.length}회 점검 기준
            </div>
          </div>
        </div>
      </Card>

      <SectionHeader title="점검 이력" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {QSC_RESULTS.map(r => {
          const gm = GRADE_COLOR[r.grade];
          const typeMeta = r.type === "ONSITE_CHECKLIST"
            ? { label: "방문 점검", color: C.purple, bg: C.purpleSoft }
            : { label: "본사 점검 요청", color: C.blue, bg: C.blueSoft };
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Badge label={typeMeta.label} color={typeMeta.color} bg={typeMeta.bg} />
                <span style={{ fontSize: T.xs, color: C.textMuted, marginLeft: "auto" }}>{r.dt}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: gm.bg, color: gm.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: T.md, fontWeight: 700,
                }}>
                  {r.grade}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: T.lg, fontWeight: 600, color: C.text }}>{r.score}점</div>
                  {r.sv && <div style={{ fontSize: T.xs, color: C.textSub }}>점검자: {r.sv}</div>}
                </div>
              </div>
              {r.action && (
                <div style={{
                  marginTop: 8, padding: "6px 10px", background: C.orangeSoft,
                  borderRadius: 6, fontSize: T.xs, color: C.orange,
                }}>
                  개선 요구: {r.action}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* APP-OPS-003 본사 점검 요청 */
/* APP-OPS-003 본사 점검 요청 (비대면 체크리스트) — 작성 플로우 구현 */
const REMOTE_CHECKLIST_ITEMS = [
  { id: "RCI-01", category: "위생", label: "조리 도구 소독 상태", requirePhoto: true },
  { id: "RCI-02", category: "위생", label: "냉장·냉동고 온도 기록",  requirePhoto: true },
  { id: "RCI-03", category: "위생", label: "손 세정제·위생용품 비치", requirePhoto: false },
  { id: "RCI-04", category: "위생", label: "주방 바닥·배수구 청결", requirePhoto: true },
  { id: "RCI-05", category: "안전", label: "소화기 유효기한 확인",   requirePhoto: false },
  { id: "RCI-06", category: "안전", label: "비상 출입구 관리",       requirePhoto: false },
  { id: "RCI-07", category: "운영", label: "영업 시간 게시물 부착",   requirePhoto: false },
  { id: "RCI-08", category: "운영", label: "메뉴판 최신 버전 비치",   requirePhoto: true },
  { id: "RCI-09", category: "운영", label: "유니폼 착용 상태",       requirePhoto: false },
  { id: "RCI-10", category: "장비", label: "POS 단말기 정상 작동",   requirePhoto: false },
  { id: "RCI-11", category: "장비", label: "에스프레소 머신 청소",   requirePhoto: true },
  { id: "RCI-12", category: "장비", label: "제빙기 내부 청결",       requirePhoto: false },
];

const RemoteRequestScreen = () => {
  const [requests, setRequests]   = useState(REMOTE_REQUESTS);
  const [history, setHistory]     = useState(REMOTE_HISTORY);
  const [activeRequest, setActiveRequest] = useState(null);  // 작성 중인 요청
  const [submittedResult, setSubmittedResult] = useState(null);  // 제출 완료 화면용

  const handleSubmit = (requestId, answers) => {
    // 제출 처리: 요청 목록에서 제거 → 이력 최상단에 추가
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const passCount = answers.filter(a => a.pass).length;
    const failCount = answers.filter(a => a.pass === false).length;
    const photoCount = answers.filter(a => a.photoAttached).length;
    const memoCount = answers.filter(a => a.memo && a.memo.trim()).length;
    const score = Math.round((passCount / answers.length) * 100);
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
    const submittedAt = nowString();

    const historyItem = {
      id: req.id, title: req.title, score, grade,
      submittedAt: submittedAt.slice(0, 10),
    };

    setRequests(prev => prev.filter(r => r.id !== requestId));
    setHistory(prev => [historyItem, ...prev]);
    setActiveRequest(null);
    setSubmittedResult({
      request: req,
      answers,
      passCount, failCount, photoCount, memoCount,
      score, grade, submittedAt,
      totalItems: answers.length,
    });
  };

  if (activeRequest) {
    return (
      <RemoteChecklistForm
        request={activeRequest}
        onCancel={() => setActiveRequest(null)}
        onSubmit={handleSubmit}
      />
    );
  }

  if (submittedResult) {
    return (
      <RemoteSubmissionComplete
        result={submittedResult}
        onClose={() => setSubmittedResult(null)}
      />
    );
  }

  return (
    <div style={{ padding: 14 }}>
      <SectionHeader title={`요청 대기 ${requests.length}건`} noMargin />
      {requests.length === 0 ? (
        <div style={{ marginTop: 10 }}>
          <EmptyState
            title="진행 중인 요청이 없습니다"
            description="본사에서 새 점검 요청을 보내면 여기에 표시됩니다."
            icon={<Icon.clipboard size={40} color={C.textMuted} />}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {requests.map(r => (
            <Card key={r.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Badge label="요청 대기" color={C.orange} bg={C.orangeSoft} />
                <Badge label="D-2" color={C.red} bg={C.redSoft} />
              </div>
              <div style={{ fontSize: T.md, fontWeight: 600, color: C.text, marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: T.xs, color: C.textSub, lineHeight: 1.7 }}>
                발행: {r.issuer} · {r.issuedAt}<br />
                마감: {r.dueDate}<br />
                항목: {r.itemCount}개 · 예상 소요 {r.estimatedMin}분
              </div>
              <div style={{ marginTop: 12 }}>
                <PrimaryButton variant="primary" fullWidth onClick={() => setActiveRequest(r)}>
                  작성 시작
                </PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionHeader title="제출 이력" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map(h => (
          <Card key={h.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{h.title}</div>
                <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>제출일 {h.submittedAt}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {h.score !== null ? (
                  <>
                    <div style={{ fontSize: T.lg, fontWeight: 700, color: C.blue }}>{h.score}</div>
                    <div style={{ fontSize: T.xs, color: C.textSub }}>{h.grade}등급</div>
                  </>
                ) : (
                  <Badge label="완료" color={C.green} bg={C.greenSoft} />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* 본사 점검 요청 — 체크리스트 작성 폼 */
const RemoteChecklistForm = ({ request, onCancel, onSubmit }) => {
  const [answers, setAnswers] = useState(
    REMOTE_CHECKLIST_ITEMS.map(i => ({
      itemId: i.id, pass: null, memo: "", photoAttached: false,
    }))
  );
  const [memoExpanded, setMemoExpanded] = useState({});

  const setAnswer = (itemId, patch) => {
    setAnswers(prev => prev.map(a => a.itemId === itemId ? { ...a, ...patch } : a));
  };

  const answered = answers.filter(a => a.pass !== null).length;
  const total    = REMOTE_CHECKLIST_ITEMS.length;
  const pct      = Math.round((answered / total) * 100);
  const canSubmit = answered === total;

  const handleSubmitClick = () => {
    if (!canSubmit) {
      alert(`아직 ${total - answered}개 항목이 남았습니다.`);
      return;
    }
    const required = REMOTE_CHECKLIST_ITEMS.filter(i => i.requirePhoto);
    const missingPhoto = required.filter(i => {
      const a = answers.find(x => x.itemId === i.id);
      return a && a.pass === true && !a.photoAttached;
    });
    if (missingPhoto.length > 0) {
      const ok = window.confirm(
        `사진 첨부가 필요한 항목 ${missingPhoto.length}개가 사진 없이 작성되었습니다.\n그대로 제출할까요?`
      );
      if (!ok) return;
    }
    onSubmit(request.id, answers);
  };

  return (
    <div style={{ padding: 14, paddingBottom: 100 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Badge label="작성 중" color={C.orange} bg={C.orangeSoft} />
          <Badge label={`마감 ${request.dueDate}`} color={C.red} bg={C.redSoft} />
        </div>
        <div style={{ fontSize: T.md, fontWeight: 600 }}>{request.title}</div>
        <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 4 }}>
          발행 {request.issuer} · 총 {total}개 항목
        </div>

        {/* 진행률 바 */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.xs, color: C.textSub, marginBottom: 6 }}>
            <span>진행률</span>
            <span style={{ fontWeight: 600, color: C.blue }}>{answered}/{total} ({pct}%)</span>
          </div>
          <div style={{ height: 6, background: C.borderLight, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: C.blue, transition: "width 0.3s" }} />
          </div>
        </div>
      </Card>

      <SectionHeader title="점검 항목" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REMOTE_CHECKLIST_ITEMS.map((item, idx) => {
          const a = answers.find(x => x.itemId === item.id);
          const memoOpen = memoExpanded[item.id];
          return (
            <Card key={item.id}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: a.pass !== null ? C.green : C.borderLight,
                  color: C.white, fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                    <Badge label={item.category} color={C.textSub} bg={C.bg} />
                    {item.requirePhoto && <Badge label="사진" color={C.purple} bg={C.purpleSoft} />}
                  </div>
                  <div style={{ fontSize: T.sm, color: C.text, fontWeight: 500, lineHeight: 1.4 }}>
                    {item.label}
                  </div>

                  {/* PASS / FAIL 선택 */}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <button
                      onClick={() => setAnswer(item.id, { pass: true })}
                      style={{
                        flex: 1, padding: "8px 10px", fontSize: T.sm, fontWeight: 600,
                        borderRadius: 6, cursor: "pointer",
                        border: `1px solid ${a.pass === true ? C.green : C.border}`,
                        background: a.pass === true ? C.green : C.white,
                        color:      a.pass === true ? C.white : C.textSub,
                      }}
                    >적합</button>
                    <button
                      onClick={() => setAnswer(item.id, { pass: false })}
                      style={{
                        flex: 1, padding: "8px 10px", fontSize: T.sm, fontWeight: 600,
                        borderRadius: 6, cursor: "pointer",
                        border: `1px solid ${a.pass === false ? C.red : C.border}`,
                        background: a.pass === false ? C.red : C.white,
                        color:      a.pass === false ? C.white : C.textSub,
                      }}
                    >부적합</button>
                  </div>

                  {/* 사진 + 메모 */}
                  {a.pass !== null && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => setAnswer(item.id, { photoAttached: !a.photoAttached })}
                        style={{
                          padding: "6px 10px", fontSize: T.xs, fontWeight: 500,
                          borderRadius: 5, cursor: "pointer",
                          border: `1px solid ${a.photoAttached ? C.blue : C.border}`,
                          background: a.photoAttached ? C.blueSoft : C.white,
                          color:      a.photoAttached ? C.blue : C.textSub,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <Icon.camera size={12} />
                        {a.photoAttached ? "사진 1장" : "사진 첨부"}
                      </button>
                      <button
                        onClick={() => setMemoExpanded(prev => ({ ...prev, [item.id]: !memoOpen }))}
                        style={{
                          padding: "6px 10px", fontSize: T.xs, fontWeight: 500,
                          borderRadius: 5, cursor: "pointer",
                          border: `1px solid ${a.memo ? C.blue : C.border}`,
                          background: a.memo ? C.blueSoft : C.white,
                          color:      a.memo ? C.blue : C.textSub,
                        }}
                      >
                        {a.memo ? "메모 있음" : "메모 추가"}
                      </button>
                    </div>
                  )}

                  {memoOpen && (
                    <textarea
                      value={a.memo}
                      onChange={(e) => setAnswer(item.id, { memo: e.target.value })}
                      placeholder="메모를 입력하세요"
                      style={{
                        width: "100%", marginTop: 8, padding: 8,
                        fontSize: T.sm, border: `1px solid ${C.border}`,
                        borderRadius: 6, minHeight: 56, resize: "vertical",
                        fontFamily: FONT_STACK, boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 하단 고정 액션 바 */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 448, background: C.white,
        padding: "10px 14px 14px", borderTop: `1px solid ${C.border}`,
        display: "flex", gap: 8, boxSizing: "border-box",
      }}>
        <PrimaryButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>취소</PrimaryButton>
        <PrimaryButton
          variant={canSubmit ? "success" : "primary"}
          disabled={!canSubmit}
          onClick={handleSubmitClick}
          style={{ flex: 2 }}
        >
          {canSubmit ? "제출하기" : `${total - answered}개 남음`}
        </PrimaryButton>
      </div>
    </div>
  );
};

/* 본사 점검 요청 — 제출 완료 화면 */
const RemoteSubmissionComplete = ({ result, onClose }) => {
  const g = GRADE_COLOR[result.grade];
  const hasFail = result.failCount > 0;
  return (
    <div style={{ padding: 14 }}>
      <Card style={{ textAlign: "center", padding: "24px 16px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: C.greenSoft,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Icon.check size={36} color={C.green} />
        </div>
        <div style={{ fontSize: T.xl, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          제출이 완료되었습니다
        </div>
        <div style={{ fontSize: T.sm, color: C.textSub, lineHeight: 1.5 }}>
          {result.request.title}<br/>
          <span style={{ color: C.textMuted, fontSize: T.xs }}>제출 {result.submittedAt}</span>
        </div>

        {/* 점수 + 등급 */}
        <div style={{ marginTop: 20, padding: 16, background: g.bg, borderRadius: 12 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: g.color, lineHeight: 1 }}>
            {result.score}
          </div>
          <div style={{ fontSize: T.sm, color: g.color, fontWeight: 600, marginTop: 4 }}>
            {result.grade}등급 (잠정)
          </div>
          <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            본사 SV 확인 후 최종 점수가 확정됩니다.<br/>
            영업일 기준 1~2일 내 완료됩니다.
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <SectionHeader title="제출 내역 요약" noMargin />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <StatBox label="총 항목"    value={result.totalItems} color={C.blue} />
          <StatBox label="적합"       value={result.passCount}   color={C.green} />
          <StatBox label="부적합"     value={result.failCount}   color={hasFail ? C.red : C.textMuted} />
          <StatBox label="사진 첨부" value={result.photoCount}   color={C.purple} />
        </div>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <SectionHeader title="다음 프로세스" noMargin />
        <ProcessStep
          step={1} done={true}
          title="점검 제출 완료"
          desc={`${result.submittedAt} · 인박스에 자동 적재되었습니다.`}
        />
        <ProcessStep
          step={2} done={false}
          title="본사 SV 확인 중"
          desc="담당 SV(박슈퍼)가 응답 내용과 사진을 검토합니다. 영업일 1~2일 소요."
        />
        <ProcessStep
          step={3} done={false}
          title="최종 점수·피드백"
          desc="본사 확정 점수와 개선 요구 항목이 '배정업무'로 자동 생성됩니다."
          last={true}
        />
      </Card>

      {hasFail && (
        <Card style={{ marginTop: 10, background: C.orangeSoft, borderColor: C.orange }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Icon.clipboard color={C.orange} size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.sm, fontWeight: 600, color: C.orange }}>
                부적합 항목 {result.failCount}건
              </div>
              <div style={{ fontSize: T.xs, color: C.orange, marginTop: 4, lineHeight: 1.5 }}>
                본사 검토 후 개선 요구 항목이 배정업무로 자동 생성될 수 있습니다.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <PrimaryButton variant="ghost" onClick={onClose} style={{ flex: 1 }}>
          목록으로
        </PrimaryButton>
        <PrimaryButton
          variant="primary"
          onClick={() => {
            alert(
              `제출 내역을 PDF로 다운로드합니다.\n` +
              `${result.request.title} · ${result.submittedAt}\n` +
              `(데모 환경이므로 실제 다운로드는 진행되지 않습니다)`
            );
          }}
          style={{ flex: 1 }}
        >
          제출 내역 저장
        </PrimaryButton>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div style={{
    padding: 12, background: C.bg, borderRadius: 8, textAlign: "center",
  }}>
    <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 4 }}>{label}</div>
  </div>
);

const ProcessStep = ({ step, done, title, desc, last }) => (
  <div style={{ display: "flex", gap: 12, position: "relative", paddingBottom: last ? 0 : 16 }}>
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 13,
        background: done ? C.green : C.borderLight,
        color: done ? C.white : C.textMuted,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: T.xs, fontWeight: 700,
        border: done ? "none" : `2px solid ${C.border}`,
      }}>
        {done ? <Icon.check size={14} color={C.white} /> : step}
      </div>
      {!last && (
        <div style={{
          position: "absolute", left: 12, top: 28, bottom: -16, width: 2,
          background: done ? C.green : C.borderLight,
        }} />
      )}
    </div>
    <div style={{ flex: 1, paddingTop: 1 }}>
      <div style={{ fontSize: T.sm, fontWeight: 600, color: done ? C.text : C.textSub }}>
        {title}
      </div>
      <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 3, lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  </div>
);

/* APP-OPS-004 방문 점검 (v1.3 신규) */
const VisitInspectionScreen = () => (
  <div style={{ padding: 14 }}>
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon.camera color={C.purple} />
        <div>
          <div style={{ fontSize: T.xs, color: C.textSub }}>최근 방문</div>
          <div style={{ fontSize: T.lg, fontWeight: 600, color: C.text }}>{VISIT_INSPECTIONS[0].dt}</div>
        </div>
      </div>
    </Card>

    <SectionHeader title="방문 점검 이력" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {VISIT_INSPECTIONS.map(v => {
        const gm = GRADE_COLOR[v.grade];
        return (
          <Card key={v.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 22,
                background: gm.bg, color: gm.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: T.lg, fontWeight: 700,
              }}>
                {v.grade}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{v.total}점</div>
                <div style={{ fontSize: T.xs, color: C.textSub }}>{v.dt} · {v.sv}</div>
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6,
              paddingTop: 10, borderTop: `1px solid ${C.borderLight}`,
            }}>
              <QscScoreCell label="Q (품질)"   value={v.q} max={40} />
              <QscScoreCell label="S (서비스)" value={v.s} max={30} />
              <QscScoreCell label="C (청결)"   value={v.c} max={30} />
            </div>

            {v.improvements.length > 0 && (
              <>
                <div style={{
                  marginTop: 10, padding: "8px 10px", background: C.orangeSoft,
                  borderRadius: 6, fontSize: T.xs, color: C.orange,
                }}>
                  개선 사항: {v.improvements.join(", ")}
                </div>
                {v.reportStatus === "NONE" && (
                  <div style={{ marginTop: 8 }}>
                    <PrimaryButton variant="ghost" fullWidth style={{ fontSize: T.sm, padding: "8px 14px" }}>
                      조치 완료 보고
                    </PrimaryButton>
                  </div>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  </div>
);

const QscScoreCell = ({ label, value, max }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: T.xs, color: C.textMuted }}>{label}</div>
    <div style={{ fontSize: T.sm, fontWeight: 600, color: C.text }}>
      {value}<span style={{ color: C.textMuted }}>/{max}</span>
    </div>
  </div>
);

/* APP-OPS-005 교육·매뉴얼 (v1.3 라벨) */
const EducationScreen = ({ user }) => {
  const [cat, setCat] = useState("ALL");
  const [contents, setContents] = useState(EDU_CONTENTS);
  const [selectedEdu, setSelectedEdu] = useState(null);
  const cats = ["ALL", "위생", "장비", "접객", "레시피"];

  const filtered = cat === "ALL" ? contents : contents.filter(c => c.cat === cat);
  const canSeeCompletion = user.role !== "STORE_STAFF";

  const markCompleted = (id) => {
    setContents(prev => prev.map(e => e.id === id ? { ...e, completed: true } : e));
    setSelectedEdu(prev => prev && prev.id === id ? { ...prev, completed: true } : prev);
  };

  if (selectedEdu) {
    return (
      <EducationDetail
        edu={selectedEdu}
        onBack={() => setSelectedEdu(null)}
        onComplete={markCompleted}
      />
    );
  }

  return (
    <div style={{ padding: 14 }}>
      {canSeeCompletion && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
          <KpiCard label="전체" value={contents.length} color={C.text} compact />
          <KpiCard label="이수" value={contents.filter(e => e.completed).length} color={C.green} compact />
          <KpiCard label="미이수" value={contents.filter(e => !e.completed).length} color={C.orange} compact />
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
        {cats.map(c => (
          <FilterChip key={c} label={c === "ALL" ? "전체" : c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(e => {
          const tm = EDU_TYPE_META[e.type];
          const Ic = tm.icon;
          return (
            <Card key={e.id} onClick={() => setSelectedEdu(e)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${tm.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic size={16} color={tm.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <Badge label={tm.label} color={tm.color} bg={`${tm.color}15`} />
                    <span style={{ fontSize: T.xs, color: C.textMuted }}>{e.cat}</span>
                  </div>
                  <div style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{e.title}</div>
                  {e.deadline && !e.completed && (
                    <div style={{ fontSize: T.xs, color: C.orange, marginTop: 3 }}>
                      마감 {e.deadline}
                    </div>
                  )}
                </div>
                {e.completed ? (
                  <Badge label="이수" color={C.green} bg={C.greenSoft} />
                ) : (
                  <Icon.chevronRight color={C.textMuted} />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* 교육 콘텐츠 상세 화면 */
const EducationDetail = ({ edu, onBack, onComplete }) => {
  const tm = EDU_TYPE_META[edu.type];
  const Ic = tm.icon;

  return (
    <div style={{ padding: 14, paddingBottom: 100 }}>
      {/* 헤더 카드 */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Badge label={tm.label} color={tm.color} bg={`${tm.color}15`} />
          <Badge label={edu.cat} color={C.textSub} bg={C.borderLight} />
          {edu.completed ? (
            <Badge label="이수 완료" color={C.green} bg={C.greenSoft} />
          ) : edu.deadline ? (
            <Badge label={`마감 ${edu.deadline}`} color={C.orange} bg={C.orangeSoft} />
          ) : null}
        </div>
        <div style={{ fontSize: T.xl, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>
          {edu.title}
        </div>
        <div style={{ fontSize: T.sm, color: C.textSub, marginTop: 8, lineHeight: 1.5 }}>
          {edu.summary}
        </div>
      </Card>

      {/* 타입별 상세 */}
      {edu.type === "VIDEO" && (
        <>
          {/* 영상 플레이어 Placeholder */}
          <div style={{
            marginTop: 10, aspectRatio: "16 / 9", borderRadius: 10,
            background: `linear-gradient(135deg, ${C.text} 0%, #2d3a54 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic size={24} color={C.text} />
            </div>
            <div style={{
              position: "absolute", bottom: 10, right: 12,
              background: "rgba(0,0,0,0.6)", color: C.white,
              padding: "4px 8px", borderRadius: 4, fontSize: T.xs, fontWeight: 500,
            }}>
              {edu.duration}
            </div>
          </div>

          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="영상 정보" noMargin />
            <MetaRow label="강사"       value={edu.instructor} />
            <MetaRow label="재생 시간"  value={edu.duration} />
            <MetaRow label="조회 수"    value={`${edu.views}회`} />
          </Card>

          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="목차" noMargin />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {edu.chapters.map((ch, i) => (
                <div key={i} style={{
                  padding: "8px 10px", background: C.bg, borderRadius: 6,
                  fontSize: T.sm, color: C.text, lineHeight: 1.5,
                  borderLeft: `3px solid ${tm.color}`,
                }}>
                  {ch}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {edu.type === "DOC" && (
        <>
          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="문서 정보" noMargin />
            <MetaRow label="페이지"   value={`${edu.pages}페이지`} />
            <MetaRow label="최종 개정" value={edu.updatedAt} />
          </Card>

          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="목차" noMargin />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {edu.sections.map((s, i) => (
                <div key={i} style={{
                  padding: "10px 12px", background: C.bg, borderRadius: 6,
                  fontSize: T.sm, color: C.text,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon.fileText size={14} color={tm.color} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ marginTop: 10 }}>
            <PrimaryButton
              variant="primary" fullWidth
              onClick={() => alert(`${edu.title} 문서를 열람합니다.\n(데모 환경이므로 실제 PDF 뷰어는 열리지 않습니다)`)}
            >
              문서 열람하기
            </PrimaryButton>
          </div>
        </>
      )}

      {edu.type === "EXAM" && (
        <>
          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="시험 정보" noMargin />
            <MetaRow label="문항 수"       value={`${edu.questions}문항`} />
            <MetaRow label="통과 점수"     value={`${edu.passingScore}점 이상`} />
            <MetaRow label="응시 횟수"     value={`${edu.attempts}/${edu.maxAttempts}회`} />
          </Card>

          <Card style={{ marginTop: 10 }}>
            <SectionHeader title="출제 범위" noMargin />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {edu.topics.map((t, i) => (
                <div key={i} style={{
                  padding: "8px 10px", background: C.orangeSoft, borderRadius: 6,
                  fontSize: T.sm, color: C.text,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 10,
                    background: C.orange, color: C.white,
                    fontSize: 11, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {edu.type === "RECIPE" && edu.recipe && (
        <Card style={{ marginTop: 10 }}>
          <SectionHeader title="표준 레시피" noMargin />
          <div style={{
            marginTop: 6, borderRadius: 8, overflow: "hidden",
            border: `1px solid ${C.borderLight}`,
          }}>
            {edu.recipe.map((r, i) => (
              <div key={i} style={{
                display: "flex", padding: "12px 14px",
                background: i % 2 === 0 ? C.white : C.bg,
                borderBottom: i < edu.recipe.length - 1 ? `1px solid ${C.borderLight}` : "none",
              }}>
                <span style={{ flex: "0 0 110px", fontSize: T.sm, color: C.textSub, fontWeight: 500 }}>
                  {r.step}
                </span>
                <span style={{ flex: 1, fontSize: T.sm, color: C.text, fontWeight: 600, fontFamily: "monospace" }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 하단 고정 액션 바 */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 448, background: C.white,
        padding: "10px 14px 14px", borderTop: `1px solid ${C.border}`,
        display: "flex", gap: 8, boxSizing: "border-box",
      }}>
        <PrimaryButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
          목록으로
        </PrimaryButton>
        {edu.completed ? (
          <PrimaryButton variant="success" disabled={true} style={{ flex: 2 }}>
            이수 완료
          </PrimaryButton>
        ) : edu.type === "EXAM" ? (
          <PrimaryButton
            variant="primary"
            onClick={() => {
              if (window.confirm(`${edu.questions}문항 시험을 시작하시겠어요?\n(데모 환경이므로 자동으로 통과 처리됩니다)`)) {
                onComplete(edu.id);
                alert(`시험 통과! 이수증이 발급되었습니다.`);
              }
            }}
            style={{ flex: 2 }}
          >
            시험 응시
          </PrimaryButton>
        ) : (
          <PrimaryButton
            variant="primary"
            onClick={() => onComplete(edu.id)}
            style={{ flex: 2 }}
          >
            이수 완료 처리
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", padding: "10px 0",
    borderBottom: `1px solid ${C.borderLight}`,
  }}>
    <span style={{ fontSize: T.sm, color: C.textSub }}>{label}</span>
    <span style={{ fontSize: T.sm, color: C.text, fontWeight: 500 }}>{value}</span>
  </div>
);

/* ==========================================================================
 * 화면: APP-STAFF 직원관리 탭 (4개 화면)
 * ========================================================================== */

const StaffScreen = ({ user, onNavigate, wifiState, attendanceState, onCheckIn, onCheckOut, elapsedMin }) => {
  const canSeeDashboard = user.role === "STORE_OWNER" || user.role === "STORE_MANAGER";
  const [subTab, setSubTab] = useState("check");

  const tabs = [
    { key: "check", label: "출퇴근 체크" },
    ...(canSeeDashboard ? [{ key: "board", label: "근태 현황" }] : []),
    { key: "mine", label: "내 이력" },
    ...(user.role === "STORE_OWNER" ? [{ key: "settings", label: "설정" }] : []),
  ];

  return (
    <div style={{ padding: 14 }}>
      <TabBar tabs={tabs} active={subTab} onChange={setSubTab} />
      {subTab === "check"    && <CheckInScreen wifiState={wifiState} attendanceState={attendanceState} onCheckIn={onCheckIn} onCheckOut={onCheckOut} elapsedMin={elapsedMin} onSetupWifi={() => setSubTab("settings")} />}
      {subTab === "board"    && canSeeDashboard && <AttendanceBoardScreen />}
      {subTab === "mine"     && <MyAttendanceScreen user={user} />}
      {subTab === "settings" && user.role === "STORE_OWNER" && <StaffSettingsScreen onNavigate={onNavigate} />}
    </div>
  );
};

/* APP-STAFF-001 출퇴근 체크 (메인) */
const CheckInScreen = ({ wifiState, attendanceState, onCheckIn, onCheckOut, elapsedMin, onSetupWifi }) => (
  <>
    <AttendanceQuickCard
      wifiState={wifiState}
      attendanceState={attendanceState}
      onCheckIn={onCheckIn}
      onCheckOut={onCheckOut}
      elapsedMin={elapsedMin}
      onSetupWifi={onSetupWifi}
    />

    <SectionHeader title="오늘 내 기록" />
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: T.xs, color: C.textMuted, marginBottom: 4 }}>출근</div>
          <div style={{ fontSize: T.xl, fontWeight: 700, color: attendanceState !== "NOT_CHECKED_IN" ? C.green : C.textMuted }}>
            {attendanceState !== "NOT_CHECKED_IN" ? "08:55" : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: T.xs, color: C.textMuted, marginBottom: 4 }}>퇴근</div>
          <div style={{ fontSize: T.xl, fontWeight: 700, color: attendanceState === "DONE" ? C.blue : C.textMuted }}>
            {attendanceState === "DONE" ? "18:05" : "—"}
          </div>
        </div>
      </div>
      {attendanceState === "WORKING" && (
        <div style={{
          marginTop: 10, padding: "8px 10px", background: C.blueSoft,
          borderRadius: 8, fontSize: T.sm, color: C.blue, textAlign: "center",
        }}>
          근무 중 · {Math.floor(elapsedMin / 60)}시간 {elapsedMin % 60}분 경과
        </div>
      )}
    </Card>

    <div style={{
      marginTop: 14, padding: 12, background: C.blueSoft, borderRadius: 10,
      fontSize: T.xs, color: C.blue, lineHeight: 1.5,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>근태 체크 안내</div>
      매장 Wi-Fi 연결 시에만 출퇴근 체크가 가능합니다. 지각 기준은 설정된 출근 시각 +10분입니다.
      기록은 3년간 보존됩니다 (노동법 기준).
    </div>
  </>
);

/* APP-STAFF-002 근태 현황 대시보드 */
const AttendanceBoardScreen = () => {
  const statusMeta = {
    NORMAL: { label: "정상",   color: C.green,     bg: C.greenSoft  },
    LATE:   { label: "지각",   color: C.orange,    bg: C.orangeSoft },
    ABSENT: { label: "결근",   color: C.red,       bg: C.redSoft    },
    DONE:   { label: "퇴근",   color: C.blue,      bg: C.blueSoft   },
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        <KpiCard label="정상"   value={ATTENDANCE_TODAY.filter(a => a.status === "NORMAL" || a.status === "DONE").length} color={C.green} compact />
        <KpiCard label="지각"   value={ATTENDANCE_TODAY.filter(a => a.status === "LATE").length}   color={C.orange} compact />
        <KpiCard label="결근"   value={ATTENDANCE_TODAY.filter(a => a.status === "ABSENT").length} color={C.red}    compact />
        <KpiCard label="퇴근"   value={ATTENDANCE_TODAY.filter(a => a.status === "DONE").length}   color={C.blue}   compact />
      </div>

      <SectionHeader title="오늘 근태" noMargin />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ATTENDANCE_TODAY.map(a => {
          const sm = statusMeta[a.status];
          return (
            <Card key={a.userId} style={{ padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: C.blueSoft, color: C.blue,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: T.sm, fontWeight: 600,
                }}>
                  {a.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{a.name}</span>
                    <span style={{ fontSize: T.xs, color: C.textMuted }}>{ROLE_LABEL[a.role]}</span>
                  </div>
                  <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 1 }}>
                    {a.checkIn ? `출근 ${a.checkIn}` : "출근 미체크"}{a.checkOut ? ` · 퇴근 ${a.checkOut}` : ""}
                  </div>
                </div>
                <Badge label={sm.label} color={sm.color} bg={sm.bg} />
              </div>
            </Card>
          );
        })}
      </div>
      <DataNotice>2026-04-19 기준 · 지각 기준: 09:10 이후</DataNotice>
    </>
  );
};

/* APP-STAFF-003 내 근태 이력 */
const MyAttendanceScreen = ({ user }) => {
  const [viewMode, setViewMode] = useState("calendar");  // calendar / list
  const [selectedDate, setSelectedDate] = useState(null);

  // 현재 달(2026-04) 기준 — 데모 고정
  const year = 2026;
  const month = 4;  // 1-indexed
  const [viewMonth, setViewMonth] = useState({ year, month });

  const totalDays = MY_ATTENDANCE_HISTORY.filter(a => a.status !== "OFF").length;
  const lateCount = MY_ATTENDANCE_HISTORY.filter(a => a.status === "LATE").length;
  const absentCount = MY_ATTENDANCE_HISTORY.filter(a => a.status === "ABSENT").length;

  const statusMeta = {
    NORMAL:      { label: "정상",  color: C.green,     bg: C.greenSoft  },
    LATE:        { label: "지각",  color: C.orange,    bg: C.orangeSoft },
    ABSENT:      { label: "결근",  color: C.red,       bg: C.redSoft    },
    EARLY_OUT:   { label: "조퇴",  color: C.orange,    bg: C.orangeSoft },
    OFF:         { label: "휴무",  color: C.textMuted, bg: C.borderLight },
    IN_PROGRESS: { label: "근무중", color: C.blue,     bg: C.blueSoft   },
  };

  // 달력 데이터: 해당 월의 1일부터 마지막 날까지
  const daysInMonth = new Date(viewMonth.year, viewMonth.month, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month - 1, 1).getDay();  // 0=일

  const calendarCells = [];
  // 앞 빈 셀 (일요일 시작)
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }
  // 일자별 셀
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewMonth.year}-${viewMonth.month.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    const record = MY_ATTENDANCE_HISTORY.find(a => a.date === dateStr);
    const dayOfWeek = new Date(viewMonth.year, viewMonth.month - 1, d).getDay();
    calendarCells.push({
      day: d, dateStr, record, dayOfWeek,
      isToday: dateStr === "2026-04-19",
      isFuture: new Date(dateStr) > new Date("2026-04-19"),
      key: dateStr,
    });
  }

  const goPrevMonth = () => {
    if (viewMonth.month === 1) setViewMonth({ year: viewMonth.year - 1, month: 12 });
    else setViewMonth({ year: viewMonth.year, month: viewMonth.month - 1 });
  };
  const goNextMonth = () => {
    if (viewMonth.year === 2026 && viewMonth.month === 4) return;  // 미래 이동 차단
    if (viewMonth.month === 12) setViewMonth({ year: viewMonth.year + 1, month: 1 });
    else setViewMonth({ year: viewMonth.year, month: viewMonth.month + 1 });
  };

  const selectedRecord = selectedDate ? MY_ATTENDANCE_HISTORY.find(a => a.date === selectedDate) : null;

  const dowLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <MonthStat label="근무일"  value={totalDays}   color={C.blue} />
          <MonthStat label="지각"    value={lateCount}   color={C.orange} />
          <MonthStat label="결근"    value={absentCount} color={C.red} />
        </div>
      </Card>

      {/* 뷰 모드 전환 */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 10 }}>
        <FilterChip label="달력 보기"   active={viewMode === "calendar"} onClick={() => setViewMode("calendar")} />
        <FilterChip label="목록 보기" active={viewMode === "list"}     onClick={() => setViewMode("list")} />
      </div>

      {viewMode === "calendar" && (
        <Card>
          {/* 월 네비 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={goPrevMonth} style={{
              background: "none", border: "none", cursor: "pointer", padding: 6,
              color: C.textSub,
            }}>
              <Icon.chevronLeft />
            </button>
            <div style={{ fontSize: T.md, fontWeight: 700, color: C.text }}>
              {viewMonth.year}년 {viewMonth.month}월
            </div>
            <button onClick={goNextMonth} disabled={viewMonth.year === 2026 && viewMonth.month === 4}
              style={{
                background: "none", border: "none",
                cursor: viewMonth.year === 2026 && viewMonth.month === 4 ? "not-allowed" : "pointer",
                padding: 6, opacity: viewMonth.year === 2026 && viewMonth.month === 4 ? 0.3 : 1,
                color: C.textSub,
              }}>
              <Icon.chevronRight />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
            {dowLabels.map((d, i) => (
              <div key={d} style={{
                textAlign: "center", fontSize: T.xs, fontWeight: 600,
                color: i === 0 ? C.red : i === 6 ? C.blue : C.textSub,
                padding: "6px 0",
              }}>{d}</div>
            ))}
          </div>

          {/* 달력 셀 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {calendarCells.map(cell => {
              if (cell.empty) return <div key={cell.key} />;
              const rec = cell.record;
              const sm = rec ? statusMeta[rec.status] : null;
              const dayColor = cell.dayOfWeek === 0 ? C.red : cell.dayOfWeek === 6 ? C.blue : C.text;

              return (
                <button
                  key={cell.key}
                  onClick={() => !cell.isFuture && setSelectedDate(cell.dateStr)}
                  disabled={cell.isFuture}
                  style={{
                    aspectRatio: "1",
                    background: cell.isToday ? C.blueSoft : "transparent",
                    border: cell.isToday ? `2px solid ${C.blue}` : `1px solid ${C.borderLight}`,
                    borderRadius: 6, cursor: cell.isFuture ? "default" : "pointer",
                    opacity: cell.isFuture ? 0.3 : 1,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: 2, position: "relative",
                  }}
                >
                  <div style={{
                    fontSize: T.xs, fontWeight: cell.isToday ? 700 : 500,
                    color: cell.isToday ? C.blue : dayColor,
                  }}>
                    {cell.day}
                  </div>
                  {rec && (
                    <div style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: sm.color, marginTop: 3,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div style={{
            display: "flex", gap: 10, marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${C.borderLight}`, flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {["NORMAL", "LATE", "ABSENT", "OFF", "IN_PROGRESS"].map(k => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: T.xs, color: C.textSub }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: statusMeta[k].color }} />
                <span>{statusMeta[k].label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewMode === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MY_ATTENDANCE_HISTORY.map(a => {
            const sm = statusMeta[a.status];
            return (
              <Card key={a.date} style={{ padding: 12 }} onClick={() => setSelectedDate(a.date)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>{a.date}</div>
                    <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 1 }}>
                      {a.checkIn} ~ {a.checkOut}
                    </div>
                  </div>
                  <Badge label={sm.label} color={sm.color} bg={sm.bg} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DataNotice>이력은 노동법에 따라 3년간 보존됩니다.</DataNotice>

      {/* 날짜별 상세 BottomSheet */}
      {selectedDate && selectedRecord && (
        <BottomSheet title={`${selectedDate} 근태 상세`} onClose={() => setSelectedDate(null)}>
          <div style={{ padding: 14 }}>
            <div style={{
              padding: 14, background: statusMeta[selectedRecord.status].bg,
              borderRadius: 10, textAlign: "center", marginBottom: 14,
            }}>
              <div style={{
                fontSize: T.xl, fontWeight: 700,
                color: statusMeta[selectedRecord.status].color, marginBottom: 4,
              }}>
                {statusMeta[selectedRecord.status].label}
              </div>
              <div style={{ fontSize: T.xs, color: C.textSub }}>
                {selectedDate} ({dowLabels[new Date(selectedDate).getDay()]}요일)
              </div>
            </div>

            {selectedRecord.status !== "OFF" && selectedRecord.status !== "ABSENT" && (
              <>
                <MetaRow label="출근 시각" value={selectedRecord.checkIn || "—"} />
                <MetaRow label="퇴근 시각" value={selectedRecord.checkOut || "근무 중"} />
                {selectedRecord.checkIn && selectedRecord.checkOut && selectedRecord.checkOut !== "—" && (
                  <MetaRow label="근무 시간" value={
                    (() => {
                      const [inH, inM] = selectedRecord.checkIn.split(":").map(Number);
                      const [outH, outM] = selectedRecord.checkOut.split(":").map(Number);
                      const mins = (outH * 60 + outM) - (inH * 60 + inM);
                      return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
                    })()
                  } />
                )}
                {selectedRecord.status === "LATE" && (
                  <div style={{
                    marginTop: 10, padding: 10, background: C.orangeSoft, borderRadius: 6,
                    fontSize: T.xs, color: C.orange, lineHeight: 1.5,
                  }}>
                    지각 기준 09:10 이후 출근. 3회 누적 시 본사 알림이 발송됩니다.
                  </div>
                )}
              </>
            )}
            {selectedRecord.status === "ABSENT" && (
              <div style={{
                padding: 12, background: C.redSoft, borderRadius: 6,
                fontSize: T.sm, color: C.red, lineHeight: 1.5,
              }}>
                결근 처리된 날입니다. 사유 입력이 필요하면 점주 또는 매니저에게 문의해 주세요.
              </div>
            )}
            {selectedRecord.status === "OFF" && (
              <div style={{
                padding: 12, background: C.bg, borderRadius: 6,
                fontSize: T.sm, color: C.textSub, lineHeight: 1.5, textAlign: "center",
              }}>
                휴무일입니다.
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <PrimaryButton variant="ghost" fullWidth onClick={() => setSelectedDate(null)}>
                닫기
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
};

const MonthStat = ({ label, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: T.xs, color: C.textMuted, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: T.xxl, fontWeight: 700, color }}>{value}</div>
  </div>
);

/* APP-STAFF-004 직원관리 설정 (OWNER 전용) */
const StaffSettingsScreen = ({ onNavigate }) => {
  const [wifis, setWifis] = useState(STORE_WIFI_LIST);
  const [ownerAttendance, setOwnerAttendance] = useState(true);
  const [members, setMembers] = useState(STORE_MEMBERS);

  // 직원 초대 모달 (직원관리 설정에서도 직접 초대 가능)
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName]   = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("STORE_STAFF");

  const openInvite = () => {
    setInviteName(""); setInvitePhone(""); setInviteEmail(""); setInviteRole("STORE_STAFF");
    setShowInvite(true);
  };

  const handleInvite = () => {
    if (!inviteName.trim() || !invitePhone.trim() || !inviteEmail.trim()) {
      alert("이름, 휴대폰, 이메일을 모두 입력해 주세요.");
      return;
    }
    if (!/^[0-9-]+$/.test(invitePhone) || invitePhone.length < 10) {
      alert("휴대폰 번호 형식을 확인해 주세요.");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(inviteEmail)) {
      alert("이메일 형식을 확인해 주세요.");
      return;
    }
    if (members.some(m => m.phone === invitePhone)) {
      alert("이미 같은 휴대폰 번호로 등록된 팀원이 있습니다.");
      return;
    }
    const newMember = {
      userId:          `u-invited-${Date.now()}`,
      name:            inviteName.trim(),
      role:            inviteRole,
      phone:           invitePhone.trim(),
      email:           inviteEmail.trim(),
      status:          "INVITED",
      orderPermission: false,
    };
    setMembers(prev => [...prev, newMember]);
    setShowInvite(false);
    alert(`${newMember.name}님에게 초대 링크를 발송했습니다.\n${newMember.email}`);
  };

  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const invitedCount = members.filter(m => m.status === "INVITED").length;

  return (
    <div style={{ padding: 14 }}>
      {/* 팀 요약 + 초대 버튼 */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 20,
            background: C.blueSoft, color: C.blue,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.users size={20} color={C.blue} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>우리 매장 팀</div>
            <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 2 }}>
              활성 {activeCount}명 {invitedCount > 0 && `· 초대 중 ${invitedCount}명`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <PrimaryButton variant="primary" style={{ flex: 1 }} onClick={openInvite}>
            + 직원 초대
          </PrimaryButton>
          <PrimaryButton variant="ghost" style={{ flex: 1 }} onClick={() => onNavigate && onNavigate("more-team")}>
            전체 관리
          </PrimaryButton>
        </div>
      </Card>

      <SectionHeader title="매장 Wi-Fi 출퇴근" right={
        <button
          onClick={() => alert("Wi-Fi 추가 화면을 엽니다.\n(데모 환경이므로 실제 Wi-Fi 스캔은 되지 않습니다)")}
          style={{
            background: "none", border: "none", fontSize: T.sm, color: C.blue,
            cursor: "pointer", fontWeight: 500,
          }}>+ 추가</button>
      } />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {wifis.map(w => (
          <Card key={w.id} style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon.wifi color={w.active ? C.green : C.textMuted} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>{w.label}</div>
                <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 1, fontFamily: "monospace" }}>
                  SSID: {w.ssid} · {w.bssid}
                </div>
              </div>
              <Toggle value={w.active} onChange={() => {
                setWifis(prev => prev.map(x => x.id === w.id ? { ...x, active: !x.active } : x));
              }} />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 6 }}>
        최대 10개 · BSSID는 보안상 마스킹되어 표시됩니다.
      </div>

      <SectionHeader title="출퇴근 체크 적용" />
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>점주 출퇴근 체크</div>
            <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 2 }}>
              가맹점 점주만 ON/OFF 변경 가능합니다. 직영점 점주는 항상 ON입니다.
            </div>
          </div>
          <Toggle value={ownerAttendance} onChange={setOwnerAttendance} />
        </div>
      </Card>

      {/* 초대 BottomSheet */}
      {showInvite && (
        <BottomSheet onClose={() => setShowInvite(false)} title="직원 초대">
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InputField
              label="이름 (필수)" placeholder="홍길동"
              value={inviteName} onChange={setInviteName}
            />
            <InputField
              label="휴대폰 (필수)" placeholder="010-0000-0000"
              value={invitePhone} onChange={setInvitePhone}
            />
            <InputField
              label="이메일 (필수)" type="email" placeholder="example@email.com"
              value={inviteEmail} onChange={setInviteEmail}
            />
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>역할</label>
              <div style={{ display: "flex", gap: 6 }}>
                <FilterChip label="직원"   active={inviteRole === "STORE_STAFF"}   onClick={() => setInviteRole("STORE_STAFF")} />
                <FilterChip label="매니저" active={inviteRole === "STORE_MANAGER"} onClick={() => setInviteRole("STORE_MANAGER")} />
              </div>
            </div>
            <div style={{
              padding: 10, background: C.blueSoft, borderRadius: 8,
              fontSize: T.xs, color: C.blue, lineHeight: 1.5,
            }}>
              초대받은 분은 앱 최초 실행 시 휴대폰 본인인증을 1회 완료해야 계정이 활성화됩니다.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setShowInvite(false)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!inviteName.trim() || !invitePhone.trim() || !inviteEmail.trim()}
                onClick={handleInvite}
                style={{ flex: 2 }}
              >
                초대 링크 발송
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
    background: value ? C.blue : C.border, position: "relative",
    transition: "all 0.2s", flexShrink: 0,
  }}>
    <div style={{
      position: "absolute", top: 2, left: value ? 22 : 2,
      width: 20, height: 20, borderRadius: 10, background: C.white,
      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </button>
);

/* ==========================================================================
 * 화면: APP-MORE 전체 탭
 * ========================================================================== */

const MoreScreen = ({ user, onNavigate, onChangeRole, onLogout }) => {
  const partnerEnabled = TENANT_FLAGS.partnerIntegrationEnabled;
  const isOwner = user.role === "STORE_OWNER";
  const canVoc = user.role === "STORE_OWNER" || user.role === "STORE_MANAGER";

  return (
    <div style={{ padding: 14 }}>
      {/* 프로필 간단 카드 */}
      <Card onClick={() => onNavigate("more-profile")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24,
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueHover} 100%)`,
            color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: T.lg, fontWeight: 600,
          }}>
            {user.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{user.name}</div>
            <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 2 }}>
              {ROLE_LABEL[user.role]} · {user.storeName}
            </div>
            {user.hqSuffix && (
              <div style={{ marginTop: 4 }}>
                <Badge label="본사 직원 겸직" color={C.orange} bg={C.orangeSoft} />
              </div>
            )}
          </div>
          <Icon.chevronRight color={C.textMuted} />
        </div>
      </Card>

      {/* 데모 역할 전환 (목업 전용) */}
      <div style={{
        marginTop: 12, padding: 10, background: C.orangeSoft,
        borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
        fontSize: T.xs, color: C.orange,
      }}>
        <Icon.alert size={14} color={C.orange} />
        <span style={{ flex: 1 }}>[목업 전용] 역할 전환으로 UI 확인</span>
        <select
          value={user.role}
          onChange={(e) => onChangeRole(e.target.value)}
          style={{
            padding: "3px 6px", fontSize: T.xs, borderRadius: 4,
            border: `1px solid ${C.orange}`, background: C.white, color: C.text,
          }}
        >
          <option value="STORE_OWNER">점주 (OWNER)</option>
          <option value="STORE_MANAGER">매니저 (MANAGER)</option>
          <option value="STORE_STAFF">직원 (STAFF)</option>
        </select>
      </div>

      <SectionHeader title="매장 관리" />
      <MenuGroup>
        {isOwner && <MenuItem icon={<Icon.users size={18} color={C.blue} />} label="직원관리 설정" sub="직원 초대·역할 변경" onClick={() => onNavigate("more-team")} />}
        {canVoc && <MenuItem icon={<Icon.mail size={18} color={C.green} />} label="1:1 문의" sub="본사에 문의 접수·답변 확인" onClick={() => onNavigate("more-voc")} />}
        {isOwner && <MenuItem icon={<Icon.plug size={18} color={C.orange} />} label="연동 설정" sub="배달앱·VAN·PG 조회" onClick={() => onNavigate("more-integration")} />}
      </MenuGroup>

      {partnerEnabled && (
        <>
          <SectionHeader title="부가 서비스" />
          <MenuGroup>
            <MenuItem icon={<Icon.shopping size={18} color={C.purple} />} label="공동구매" sub="원두·부자재 특가 구매" onClick={() => onNavigate("gdm")} />
          </MenuGroup>
        </>
      )}

      <SectionHeader title="설정" />
      <MenuGroup>
        <MenuItem icon={<Icon.bell color={C.blue} />} label="알림 설정" sub="푸시 알림 ON/OFF" onClick={() => onNavigate("more-notification")} />
        <MenuItem icon={<Icon.settings color={C.textSub} />} label="프로필" sub="비밀번호·내 정보" onClick={() => onNavigate("more-profile")} />
      </MenuGroup>

      <div style={{ marginTop: 24 }}>
        <PrimaryButton variant="secondary" onClick={onLogout} fullWidth
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon.logout /> 로그아웃
        </PrimaryButton>
      </div>

      <div style={{ marginTop: 16, fontSize: T.xs, color: C.textMuted, textAlign: "center" }}>
        셀바이저(Sellvisor) v1.3.0 · 브릿지코드
      </div>
    </div>
  );
};

const MenuGroup = ({ children }) => (
  <Card style={{ padding: 0, overflow: "hidden" }}>
    {children}
  </Card>
);

const MenuItem = ({ icon, label, sub, onClick, right }) => (
  <div onClick={onClick} style={{
    padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
    cursor: onClick ? "pointer" : "default",
    borderBottom: `1px solid ${C.borderLight}`,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, background: C.borderLight,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{label}</div>
      {sub && <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 1 }}>{sub}</div>}
    </div>
    {right || <Icon.chevronRight color={C.textMuted} />}
  </div>
);

/* 팀 관리 (직원 초대·역할 변경) */
const TeamSettingsScreen = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState(STORE_MEMBERS);
  const [removeTarget, setRemoveTarget] = useState(null);

  // 초대 폼 state
  const [inviteName, setInviteName]   = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("STORE_STAFF");

  const openInvite = () => {
    setInviteName("");
    setInvitePhone("");
    setInviteEmail("");
    setInviteRole("STORE_STAFF");
    setShowInvite(true);
  };

  const handleInvite = () => {
    if (!inviteName.trim() || !invitePhone.trim() || !inviteEmail.trim()) {
      alert("이름, 휴대폰, 이메일을 모두 입력해 주세요.");
      return;
    }
    if (!/^[0-9-]+$/.test(invitePhone) || invitePhone.length < 10) {
      alert("휴대폰 번호 형식을 확인해 주세요.");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(inviteEmail)) {
      alert("이메일 형식을 확인해 주세요.");
      return;
    }
    if (members.some(m => m.phone === invitePhone)) {
      alert("이미 같은 휴대폰 번호로 등록된 팀원이 있습니다.");
      return;
    }
    const newMember = {
      userId:          `u-invited-${Date.now()}`,
      name:            inviteName.trim(),
      role:            inviteRole,
      phone:           invitePhone.trim(),
      email:           inviteEmail.trim(),
      status:          "INVITED",
      orderPermission: false,
    };
    setMembers(prev => [...prev, newMember]);
    setShowInvite(false);
    alert(
      `${newMember.name}님에게 초대 링크를 발송했습니다.\n` +
      `이메일: ${newMember.email}\n` +
      `최초 실행 시 휴대폰 본인인증을 완료하면 계정이 활성화됩니다.`
    );
  };

  const handleRemove = () => {
    setMembers(prev => prev.filter(m => m.userId !== removeTarget.userId));
    setRemoveTarget(null);
  };

  return (
    <div style={{ padding: 14 }}>
      <PrimaryButton variant="primary" onClick={openInvite} fullWidth>
        + 직원 초대
      </PrimaryButton>

      <SectionHeader title={`직원 목록 (${members.length}명)`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {members.map(m => (
          <Card key={m.userId} style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: C.blueSoft, color: C.blue,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: T.sm, fontWeight: 600,
              }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{m.name}</span>
                  <Badge label={ROLE_LABEL[m.role]}
                    color={m.role === "STORE_OWNER" ? C.purple : m.role === "STORE_MANAGER" ? C.blue : C.textSub}
                    bg={m.role === "STORE_OWNER" ? C.purpleSoft : m.role === "STORE_MANAGER" ? C.blueSoft : C.borderLight}
                  />
                </div>
                <div style={{ fontSize: T.xs, color: C.textSub, marginTop: 2 }}>{m.phone}</div>
              </div>
              {m.status === "INVITED" ? (
                <Badge label="초대 중" color={C.orange} bg={C.orangeSoft} />
              ) : (
                <Badge label="활성" color={C.green} bg={C.greenSoft} />
              )}
            </div>
            {m.role !== "STORE_OWNER" && (
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                {m.status === "INVITED" && (
                  <PrimaryButton
                    variant="ghost"
                    style={{ fontSize: T.xs, padding: "6px 10px" }}
                    onClick={() => alert(`${m.name}님에게 초대 링크를 재발송했습니다.`)}
                  >초대 재발송</PrimaryButton>
                )}
                <PrimaryButton
                  variant="ghost"
                  style={{ fontSize: T.xs, padding: "6px 10px", color: C.red }}
                  onClick={() => setRemoveTarget(m)}
                >제외</PrimaryButton>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 초대 BottomSheet */}
      {showInvite && (
        <BottomSheet onClose={() => setShowInvite(false)} title="직원 초대">
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InputField
              label="이름 (필수)"
              placeholder="홍길동"
              value={inviteName}
              onChange={setInviteName}
            />
            <InputField
              label="휴대폰 (필수)"
              placeholder="010-0000-0000"
              value={invitePhone}
              onChange={setInvitePhone}
            />
            <InputField
              label="이메일 (필수)"
              type="email"
              placeholder="example@email.com"
              value={inviteEmail}
              onChange={setInviteEmail}
            />
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>역할</label>
              <div style={{ display: "flex", gap: 6 }}>
                <FilterChip label="직원"   active={inviteRole === "STORE_STAFF"}   onClick={() => setInviteRole("STORE_STAFF")} />
                <FilterChip label="매니저" active={inviteRole === "STORE_MANAGER"} onClick={() => setInviteRole("STORE_MANAGER")} />
              </div>
            </div>
            <div style={{
              padding: 10, background: C.blueSoft, borderRadius: 8,
              fontSize: T.xs, color: C.blue, lineHeight: 1.5,
            }}>
              초대받은 분은 앱 최초 실행 시 휴대폰 본인인증을 1회 완료해야 계정이 활성화됩니다.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setShowInvite(false)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!inviteName.trim() || !invitePhone.trim() || !inviteEmail.trim()}
                onClick={handleInvite}
                style={{ flex: 2 }}
              >
                초대 링크 발송
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* 제외 확인 */}
      {removeTarget && (
        <BottomSheet onClose={() => setRemoveTarget(null)} title="팀원 제외">
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: T.md, color: C.text, fontWeight: 600, marginBottom: 8 }}>
              {removeTarget.name}님을 팀에서 제외하시겠어요?
            </div>
            <div style={{ fontSize: T.sm, color: C.textSub, lineHeight: 1.6, marginBottom: 16 }}>
              제외 시 해당 팀원의 매장 접근이 즉시 차단됩니다.<br/>
              근태 이력 등 기록은 노동법에 따라 3년간 보존됩니다.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PrimaryButton variant="ghost" onClick={() => setRemoveTarget(null)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton variant="danger" onClick={handleRemove} style={{ flex: 2 }}>
                제외하기
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

const InputField = ({ label, placeholder, type = "text", value, onChange, rows = 3 }) => (
  <div>
    <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>{label}</label>
    {type === "textarea" ? (
      <textarea
        placeholder={placeholder} rows={rows}
        value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: `1px solid ${C.border}`, fontSize: T.md,
          color: C.text, background: C.white, outline: "none",
          fontFamily: FONT_STACK, boxSizing: "border-box", resize: "vertical",
          minHeight: rows * 22,
        }}
      />
    ) : (
      <input
        type={type} placeholder={placeholder}
        value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: `1px solid ${C.border}`, fontSize: T.md,
          color: C.text, background: C.white, outline: "none",
          fontFamily: FONT_STACK, boxSizing: "border-box",
        }}
      />
    )}
  </div>
);

const BottomSheet = ({ children, onClose, title }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: C.white, width: "100%", maxWidth: 448,
      borderRadius: "16px 16px 0 0", maxHeight: "85vh", overflow: "auto",
    }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
        <div style={{
          width: 36, height: 4, background: C.border, borderRadius: 2,
          margin: "0 auto 10px",
        }} />
        <div style={{ fontSize: T.md, fontWeight: 600, color: C.text, textAlign: "center" }}>{title}</div>
      </div>
      {children}
    </div>
  </div>
);

/* 1:1 문의 */
const VOC_TYPES = ["운영", "교육", "배달", "정산", "기타"];

const VocScreen = () => {
  const [showCompose, setShowCompose] = useState(false);
  const [history, setHistory] = useState(VOC_HISTORY);

  // 작성 폼 state
  const [vocType, setVocType]       = useState("운영");
  const [vocSubject, setVocSubject] = useState("");
  const [vocBody, setVocBody]       = useState("");
  const [photoCount, setPhotoCount] = useState(0);

  const openCompose = () => {
    setVocType("운영");
    setVocSubject("");
    setVocBody("");
    setPhotoCount(0);
    setShowCompose(true);
  };

  const handleSubmit = () => {
    if (!vocSubject.trim() || !vocBody.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    if (vocBody.length > 500) {
      alert("내용은 최대 500자까지 작성할 수 있습니다.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nextNum = (parseInt(history[0]?.id?.split("-").pop() || "0", 10) + 1)
      .toString().padStart(3, "0");
    const newVoc = {
      id:         `VOC-2026-${nextNum}`,
      type:       vocType,
      subject:    vocSubject.trim(),
      status:     "RECEIVED",
      createdAt:  today,
      answeredAt: null,
    };
    setHistory(prev => [newVoc, ...prev]);
    setShowCompose(false);
    alert(`문의가 접수되었습니다.\n접수번호: ${newVoc.id}\n답변은 영업일 기준 2일 이내에 드립니다.`);
  };

  return (
    <div style={{ padding: 14 }}>
      <PrimaryButton variant="primary" onClick={openCompose} fullWidth>
        + 문의 작성
      </PrimaryButton>

      <SectionHeader title={`내 문의 이력 (${history.length}건)`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map(v => {
          const sm = VOC_STATUS_META[v.status] || VOC_STATUS_META.IN_PROGRESS;
          return (
            <Card key={v.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Badge label={v.type} color={C.textSub} bg={C.borderLight} />
                <Badge label={sm.label} color={sm.color} bg={sm.bg} />
                <span style={{ fontSize: T.xs, color: C.textMuted, marginLeft: "auto" }}>{v.createdAt}</span>
              </div>
              <div style={{ fontSize: T.md, fontWeight: 500, color: C.text }}>{v.subject}</div>
              {v.answeredAt && (
                <div style={{ fontSize: T.xs, color: C.green, marginTop: 4 }}>
                  답변: {v.answeredAt}
                </div>
              )}
              <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 4 }}>{v.id}</div>
            </Card>
          );
        })}
      </div>

      {showCompose && (
        <BottomSheet onClose={() => setShowCompose(false)} title="1:1 문의 작성">
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>문의 유형</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {VOC_TYPES.map(t => (
                  <FilterChip key={t} label={t} active={vocType === t} onClick={() => setVocType(t)} />
                ))}
              </div>
            </div>
            <InputField
              label="제목 (필수)"
              placeholder="문의 제목을 입력하세요"
              value={vocSubject}
              onChange={setVocSubject}
            />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: T.xs, color: C.textSub }}>내용 (최대 500자)</label>
                <span style={{ fontSize: T.xs, color: vocBody.length > 500 ? C.red : C.textMuted }}>
                  {vocBody.length}/500
                </span>
              </div>
              <textarea
                placeholder="문의 내용을 상세히 작성해 주세요"
                rows={5}
                value={vocBody}
                onChange={(e) => setVocBody(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid ${C.border}`, fontSize: T.md,
                  color: C.text, background: C.white, outline: "none",
                  fontFamily: FONT_STACK, boxSizing: "border-box", resize: "vertical",
                }}
              />
            </div>
            <PrimaryButton
              variant="secondary"
              fullWidth
              onClick={() => setPhotoCount(Math.min(photoCount + 1, 3))}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Icon.camera /> 사진 첨부 ({photoCount}/3)
            </PrimaryButton>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setShowCompose(false)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!vocSubject.trim() || !vocBody.trim()}
                onClick={handleSubmit}
                style={{ flex: 2 }}
              >
                접수하기
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

/* 연동 설정 (OWNER 전용) */
const AVAILABLE_DELIVERY_PLATFORMS = [
  { name: "배달의민족", key: "BAEMIN" },
  { name: "쿠팡이츠",   key: "COUPANG_EATS" },
  { name: "요기요",     key: "YOGIYO" },
  { name: "땡겨요",     key: "TTANGYO" },
];

const IntegrationScreen = () => {
  const [subTab, setSubTab] = useState("delivery");

  // 배달앱 state (연동 목록)
  const [deliveryApps, setDeliveryApps] = useState(DELIVERY_APPS);

  // 재연동·해제·추가 모달 상태
  const [reconnectTarget, setReconnectTarget] = useState(null);  // {id, name}
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // 재연동 폼
  const [reconnectEmail, setReconnectEmail] = useState("");
  const [reconnectPassword, setReconnectPassword] = useState("");

  // 추가 폼
  const [addPlatform, setAddPlatform] = useState(null);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");

  const openReconnect = (app) => {
    setReconnectTarget(app);
    setReconnectEmail("");
    setReconnectPassword("");
  };

  const handleReconnect = () => {
    if (!reconnectEmail || !reconnectPassword) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setDeliveryApps(prev => prev.map(a =>
      a.id === reconnectTarget.id
        ? {
            ...a,
            status: "PENDING",
            accountMasked: maskEmail(reconnectEmail),
            lastSync: "연동 중...",
          }
        : a
    ));
    const id = reconnectTarget.id;
    setReconnectTarget(null);
    // 데모: 2초 후 CONNECTED로 전환 (실제로는 배달앱 OAuth 콜백)
    setTimeout(() => {
      setDeliveryApps(prev => prev.map(a =>
        a.id === id
          ? { ...a, status: "CONNECTED", lastSync: nowString() }
          : a
      ));
    }, 2000);
  };

  const handleDisconnect = () => {
    setDeliveryApps(prev => prev.map(a =>
      a.id === disconnectTarget.id
        ? { ...a, status: "DISCONNECTED", accountMasked: "—", lastSync: "—" }
        : a
    ));
    setDisconnectTarget(null);
  };

  const openAdd = () => {
    setAddPlatform(null);
    setAddEmail("");
    setAddPassword("");
    setShowAddSheet(true);
  };

  const handleAdd = () => {
    if (!addPlatform || !addEmail || !addPassword) {
      alert("플랫폼과 계정 정보를 모두 입력해 주세요.");
      return;
    }
    if (deliveryApps.some(a => a.name === addPlatform.name && a.status !== "DISCONNECTED")) {
      alert(`${addPlatform.name}은(는) 이미 연동되어 있습니다.`);
      return;
    }
    // 이미 DISCONNECTED로 있으면 재활성, 아니면 새로 추가
    const existing = deliveryApps.find(a => a.name === addPlatform.name);
    if (existing) {
      setDeliveryApps(prev => prev.map(a =>
        a.id === existing.id
          ? { ...a, status: "PENDING", accountMasked: maskEmail(addEmail), lastSync: "연동 중..." }
          : a
      ));
      const id = existing.id;
      setShowAddSheet(false);
      setTimeout(() => {
        setDeliveryApps(prev => prev.map(a =>
          a.id === id ? { ...a, status: "CONNECTED", lastSync: nowString() } : a
        ));
      }, 2000);
    } else {
      const newId = `da-${Date.now()}`;
      setDeliveryApps(prev => [
        ...prev,
        {
          id: newId, name: addPlatform.name, status: "PENDING",
          accountMasked: maskEmail(addEmail), lastSync: "연동 중...",
        },
      ]);
      setShowAddSheet(false);
      setTimeout(() => {
        setDeliveryApps(prev => prev.map(a =>
          a.id === newId ? { ...a, status: "CONNECTED", lastSync: nowString() } : a
        ));
      }, 2000);
    }
  };

  return (
    <div style={{ padding: 14 }}>
      <TabBar
        tabs={[
          { key: "delivery", label: "배달앱" },
          { key: "van",      label: "VAN·여신" },
          { key: "pg",       label: "PG사" },
          { key: "wifi",     label: "Wi-Fi" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {subTab === "delivery" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deliveryApps.map(da => {
              const stat = INTEGRATION_STATUS[da.status];
              const isDead = da.status === "DISCONNECTED";
              return (
                <Card key={da.id} style={isDead ? { opacity: 0.6 } : undefined}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{da.name}</span>
                    <Badge label={stat.label} color={stat.color} bg={stat.bg} />
                  </div>
                  <div style={{ fontSize: T.xs, color: C.textSub, fontFamily: "monospace" }}>
                    계정: {da.accountMasked}
                  </div>
                  <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>
                    최근 동기화: {da.lastSync}
                  </div>
                  {da.status === "AUTH_FAILED" && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <PrimaryButton
                        variant="danger"
                        style={{ fontSize: T.sm, padding: "8px 14px", flex: 2 }}
                        onClick={() => openReconnect(da)}
                      >재연동</PrimaryButton>
                      <PrimaryButton
                        variant="ghost"
                        style={{ fontSize: T.sm, padding: "8px 14px", flex: 1 }}
                        onClick={() => setDisconnectTarget(da)}
                      >해제</PrimaryButton>
                    </div>
                  )}
                  {da.status === "CONNECTED" && (
                    <div style={{ marginTop: 10 }}>
                      <PrimaryButton
                        variant="ghost"
                        style={{ fontSize: T.sm, padding: "6px 12px" }}
                        onClick={() => setDisconnectTarget(da)}
                      >연동 해제</PrimaryButton>
                    </div>
                  )}
                  {da.status === "DATA_DELAYED" && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <PrimaryButton
                        variant="ghost"
                        style={{ fontSize: T.sm, padding: "6px 12px" }}
                        onClick={() => openReconnect(da)}
                      >재연동</PrimaryButton>
                      <PrimaryButton
                        variant="ghost"
                        style={{ fontSize: T.sm, padding: "6px 12px" }}
                        onClick={() => setDisconnectTarget(da)}
                      >해제</PrimaryButton>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <PrimaryButton
            variant="primary" fullWidth
            style={{ marginTop: 14 }}
            onClick={openAdd}
          >+ 배달앱 추가</PrimaryButton>
        </>
      )}

      {subTab === "van" && (
        <>
          <InfoBanner>
            VAN·여신협회 계정은 본사(FR 어드민)에서 직접 관리합니다. 앱에서는 조회만 가능합니다.
          </InfoBanner>
          <SectionHeader title="VAN사" />
          {VAN_INFO.map(v => (
            <Card key={v.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{v.vendor}</span>
                <Badge label={INTEGRATION_STATUS[v.status].label} color={INTEGRATION_STATUS[v.status].color} bg={INTEGRATION_STATUS[v.status].bg} />
              </div>
              <div style={{ fontSize: T.xs, color: C.textSub, fontFamily: "monospace" }}>
                TID: {v.tid}
              </div>
            </Card>
          ))}

          <SectionHeader title="여신금융협회" />
          {CREDIT_ASSOC.map(c => (
            <Card key={c.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{c.name}</span>
                <Badge label={INTEGRATION_STATUS[c.status].label} color={INTEGRATION_STATUS[c.status].color} bg={INTEGRATION_STATUS[c.status].bg} />
              </div>
              <div style={{ fontSize: T.xs, color: C.textSub, fontFamily: "monospace" }}>
                계정: {c.accountMasked}
              </div>
            </Card>
          ))}
        </>
      )}

      {subTab === "pg" && (
        <>
          <InfoBanner>
            PG사 MID·TID는 본사(FR 어드민)에서 관리합니다. 앱에서는 마스킹 상태로 조회만 가능합니다.
          </InfoBanner>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: T.md, fontWeight: 600, color: C.text }}>{PG_INFO.vendor}</span>
              <Badge label={INTEGRATION_STATUS[PG_INFO.status].label} color={INTEGRATION_STATUS[PG_INFO.status].color} bg={INTEGRATION_STATUS[PG_INFO.status].bg} />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", padding: "10px 0",
              borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <span style={{ fontSize: T.sm, color: C.textSub }}>MID</span>
              <span style={{ fontSize: T.sm, color: C.text, fontFamily: "monospace" }}>{PG_INFO.mid}</span>
            </div>
          </Card>

          <SectionHeader title="디바이스별 TID" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PG_INFO.tids.map(t => (
              <Card key={t.id} style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: T.sm, color: C.text, fontFamily: "monospace", fontWeight: 600 }}>{t.id}</span>
                  <Badge label={t.type} color={C.purple} bg={C.purpleSoft} />
                  <span style={{ flex: 1, fontSize: T.sm, color: C.textSub }}>{t.label}</span>
                  {t.active ? (
                    <Badge label="활성" color={C.green} bg={C.greenSoft} />
                  ) : (
                    <Badge label="비활성" color={C.textMuted} bg={C.borderLight} />
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <PrimaryButton
              variant="ghost" fullWidth
              onClick={() => alert("본사에 TID/MID 변경 요청이 접수되었습니다.\n담당 SV가 영업일 기준 1~2일 내 연락드립니다.")}
            >
              본사에 변경 요청하기
            </PrimaryButton>
          </div>
        </>
      )}

      {subTab === "wifi" && <StaffSettingsScreen />}

      {/* 재연동 BottomSheet */}
      {reconnectTarget && (
        <BottomSheet onClose={() => setReconnectTarget(null)} title={`${reconnectTarget.name} 재연동`}>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoBanner>
              <span>
                {reconnectTarget.name} 점주 센터 계정으로 로그인해 주세요.<br/>
                입력한 정보는 암호화되어 저장됩니다.
              </span>
            </InfoBanner>
            <InputField
              label="점주 센터 이메일"
              placeholder="example@email.com"
              value={reconnectEmail}
              onChange={setReconnectEmail}
            />
            <InputField
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
              value={reconnectPassword}
              onChange={setReconnectPassword}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setReconnectTarget(null)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!reconnectEmail || !reconnectPassword}
                onClick={handleReconnect}
                style={{ flex: 2 }}
              >
                재연동 실행
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* 해제 확인 */}
      {disconnectTarget && (
        <BottomSheet onClose={() => setDisconnectTarget(null)} title="연동 해제">
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: T.md, color: C.text, fontWeight: 600, marginBottom: 8 }}>
              {disconnectTarget.name} 연동을 해제하시겠어요?
            </div>
            <div style={{ fontSize: T.sm, color: C.textSub, lineHeight: 1.6, marginBottom: 16 }}>
              해제 시 매출 자동 수집이 중단되며, 이후 매출은 앱에 표시되지 않습니다.<br/>
              언제든 다시 연동할 수 있습니다.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PrimaryButton variant="ghost" onClick={() => setDisconnectTarget(null)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton variant="danger" onClick={handleDisconnect} style={{ flex: 2 }}>
                해제하기
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* 추가 BottomSheet */}
      {showAddSheet && (
        <BottomSheet onClose={() => setShowAddSheet(false)} title="배달앱 추가">
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: T.xs, color: C.textSub, display: "block", marginBottom: 6 }}>
                플랫폼 선택
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AVAILABLE_DELIVERY_PLATFORMS.map(p => {
                  const active = deliveryApps.some(a => a.name === p.name && a.status !== "DISCONNECTED");
                  return (
                    <FilterChip
                      key={p.key}
                      label={active ? `${p.name} (연동됨)` : p.name}
                      active={addPlatform?.key === p.key}
                      onClick={() => !active && setAddPlatform(p)}
                    />
                  );
                })}
              </div>
            </div>
            {addPlatform && (
              <>
                <InputField
                  label={`${addPlatform.name} 점주 센터 이메일`}
                  placeholder="example@email.com"
                  value={addEmail}
                  onChange={setAddEmail}
                />
                <InputField
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호 입력"
                  value={addPassword}
                  onChange={setAddPassword}
                />
              </>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <PrimaryButton variant="ghost" onClick={() => setShowAddSheet(false)} style={{ flex: 1 }}>
                취소
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                disabled={!addPlatform || !addEmail || !addPassword}
                onClick={handleAdd}
                style={{ flex: 2 }}
              >
                연동하기
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

/* 유틸 */
const maskEmail = (email) => {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const shown = local.slice(0, Math.min(4, local.length));
  return `${shown}****@${domain}`;
};
const nowString = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const InfoBanner = ({ children }) => (
  <div style={{
    padding: 12, background: C.blueSoft, borderRadius: 8,
    fontSize: T.xs, color: C.blue, marginBottom: 12,
    display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5,
  }}>
    <Icon.lock size={14} color={C.blue} />
    <span>{children}</span>
  </div>
);

/* 공동구매 (조건부 노출 — SSO WebView Mock) */
const GdmScreen = () => (
  <div style={{ padding: 14 }}>
    <Card style={{
      padding: 20,
      background: `linear-gradient(135deg, ${C.purple} 0%, ${C.orange} 100%)`,
      color: C.white, border: "none",
    }}>
      <div style={{ fontSize: T.lg, fontWeight: 600 }}>공동구매 서비스</div>
      <div style={{ fontSize: T.sm, opacity: 0.9, marginTop: 4 }}>
        제휴 파트너를 통해 원두·부자재·포장재를 특가로 구매하세요
      </div>
    </Card>

    <SectionHeader title="이번주 특가" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <GdmProduct name="원두 드립 1kg" price="25,500" discount="-18%" />
      <GdmProduct name="테이크아웃 컵 500개" price="38,000" discount="-12%" />
      <GdmProduct name="빨대 500개" price="9,800" discount="-22%" />
      <GdmProduct name="우유 1L x 12개" price="32,400" discount="-9%" />
    </div>

    <div style={{ marginTop: 14 }}>
      <PrimaryButton variant="primary" fullWidth>
        공동구매 사이트 바로가기 (SSO)
      </PrimaryButton>
      <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 6, textAlign: "center" }}>
        브릿지 계정으로 자동 로그인됩니다 (WebView)
      </div>
    </div>
  </div>
);

const GdmProduct = ({ name, price, discount }) => (
  <Card style={{ padding: 12 }}>
    <div style={{
      height: 64, borderRadius: 6, background: C.borderLight,
      marginBottom: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon.shopping color={C.textMuted} />
    </div>
    <div style={{ fontSize: T.sm, color: C.text, marginBottom: 4, minHeight: 32, lineHeight: 1.35 }}>{name}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: T.xs, color: C.red, fontWeight: 600 }}>{discount}</span>
      <span style={{ fontSize: T.md, fontWeight: 700, color: C.text }}>{price}원</span>
    </div>
  </Card>
);

/* 알림 설정 */
const NotificationSettingsScreen = ({ settings, setSettings, onToast }) => {
  const toggleChannel = (ch) => {
    setSettings(s => ({ ...s, [ch]: { ...s[ch], enabled: !s[ch].enabled } }));
    onToast && onToast(`${CHANNEL_LABEL[ch]} 알림을 ${settings[ch].enabled ? "끔" : "켬"}으로 변경했습니다.`);
  };

  const toggleItem = (ch, key) => {
    setSettings(s => ({
      ...s,
      [ch]: {
        ...s[ch],
        items: s[ch].items.map(i => i.key === key ? { ...i, on: !i.on } : i),
      },
    }));
    onToast && onToast("알림 설정이 저장되었습니다.");
  };

  const resetAll = () => {
    if (!window.confirm("모든 알림 설정을 기본값으로 초기화할까요?")) return;
    setSettings(NOTIFICATION_SETTINGS_INITIAL);
    onToast && onToast("알림 설정을 기본값으로 초기화했습니다.");
  };

  return (
    <div style={{ padding: 14 }}>
      <div style={{
        padding: 12, background: C.blueSoft, borderRadius: 8,
        fontSize: T.xs, color: C.blue, lineHeight: 1.5, marginBottom: 14,
      }}>
        변경한 설정은 자동으로 저장됩니다. 채널 전체를 끄면 해당 채널의 모든 알림이 중지됩니다.
      </div>
      <NotifChannel name="운영관리" channel="ops"   settings={settings.ops}   onToggleChannel={toggleChannel} onToggleItem={toggleItem} />
      <NotifChannel name="근태"     channel="att"   settings={settings.att}   onToggleChannel={toggleChannel} onToggleItem={toggleItem} />
      <NotifChannel name="발주 (P3 · 준비 중)" channel="order" settings={settings.order} onToggleChannel={toggleChannel} onToggleItem={toggleItem} disabled />

      <PrimaryButton variant="ghost" fullWidth onClick={resetAll} style={{ marginTop: 16 }}>
        기본값으로 초기화
      </PrimaryButton>
    </div>
  );
};

const CHANNEL_LABEL = { ops: "운영관리", att: "근태", order: "발주" };

const NotifChannel = ({ name, channel, settings, onToggleChannel, onToggleItem, disabled }) => (
  <>
    <SectionHeader
      title={name}
      right={
        <Toggle value={settings.enabled && !disabled} onChange={() => !disabled && onToggleChannel(channel)} />
      }
    />
    <Card style={{ padding: 0, opacity: (!settings.enabled || disabled) ? 0.5 : 1, transition: "opacity 0.2s" }}>
      {settings.items.map((item, idx) => (
        <div key={item.key} style={{
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
          borderBottom: idx < settings.items.length - 1 ? `1px solid ${C.borderLight}` : "none",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.sm, fontWeight: 500, color: C.text }}>{item.label}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace", marginTop: 1 }}>{item.key}</div>
          </div>
          <Toggle
            value={item.on && settings.enabled && !disabled}
            onChange={() => settings.enabled && !disabled && onToggleItem(channel, item.key)}
          />
        </div>
      ))}
    </Card>
  </>
);

/* 프로필 */
const ProfileScreen = ({ user }) => {
  const [showPwChange, setShowPwChange] = useState(false);

  return (
    <div style={{ padding: 14 }}>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 16px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueHover} 100%)`,
            color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: T.xxl, fontWeight: 600, marginBottom: 10,
          }}>
            {user.name[0]}
          </div>
          <div style={{ fontSize: T.lg, fontWeight: 600, color: C.text }}>{user.name}</div>
          <div style={{ fontSize: T.sm, color: C.textSub, marginTop: 3 }}>{ROLE_LABEL[user.role]}</div>
        </div>

        <ProfileRow label="매장" value={user.storeName} />
        <ProfileRow
          label="매장 유형"
          value={
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon.building size={14} color={user.storeType === "DIRECT_STORE" ? C.purple : C.blue} />
              {STORE_TYPE_LABEL[user.storeType]}
            </div>
          }
        />
        <ProfileRow label="이메일" value={user.email} />
        <ProfileRow label="휴대폰" value={user.phone} />
      </Card>

      {/* 복수 역할 안내 (직영점 겸직자 전용) */}
      {user.hqSuffix && (
        <Card style={{ marginTop: 12, background: C.orangeSoft, border: `1px solid ${C.orange}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon.userBadge size={16} color={C.orange} />
            <span style={{ fontSize: T.sm, fontWeight: 600, color: C.orange }}>본사 직원 겸직 계정</span>
          </div>
          <ProfileRow label="FR 어드민 역할" value={user.hqSuffix} />
          <ProfileRow label="할당 도메인"    value={user.hqDomains.join(", ")} />
          <PrimaryButton variant="ghost" fullWidth style={{ marginTop: 10, fontSize: T.sm, padding: "8px 14px" }}>
            FR 어드민 바로가기
          </PrimaryButton>
        </Card>
      )}

      {/* 복수 매장 보유 시 전환 */}
      {user.multipleStores && user.multipleStores.length > 1 && (
        <>
          <SectionHeader title="담당 매장 전환" />
          <Card style={{ padding: 0 }}>
            {user.multipleStores.map((s, i) => (
              <div key={s.storeId} style={{
                padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
                borderBottom: i < user.multipleStores.length - 1 ? `1px solid ${C.borderLight}` : "none",
                cursor: "pointer",
              }}>
                <Icon.building size={16} color={C.purple} />
                <span style={{ flex: 1, fontSize: T.sm, color: C.text }}>{s.storeName}</span>
                {s.storeId === user.storeId && (
                  <Badge label="현재" color={C.blue} bg={C.blueSoft} />
                )}
              </div>
            ))}
          </Card>
        </>
      )}

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <PrimaryButton variant="secondary" fullWidth onClick={() => setShowPwChange(true)}>
          비밀번호 변경
        </PrimaryButton>
        {user.storeType === "FRANCHISE_STORE" && user.role === "STORE_OWNER" && (
          <div style={{
            padding: 12, background: C.purpleSoft, borderRadius: 8,
            fontSize: T.xs, color: C.purple, textAlign: "center",
          }}>
            가맹비·로열티 납부 내역은 P2 예정입니다.
          </div>
        )}
      </div>

      {showPwChange && (
        <BottomSheet onClose={() => setShowPwChange(false)} title="비밀번호 변경">
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <InputField label="현재 비밀번호" type="password" placeholder="••••••••" />
            <InputField label="새 비밀번호" type="password" placeholder="8자 이상" />
            <InputField label="새 비밀번호 확인" type="password" placeholder="••••••••" />
            <div style={{ fontSize: T.xs, color: C.textMuted, lineHeight: 1.6 }}>
              • 8자 이상, 영문·숫자·특수문자 2종 이상<br />
              • 직전 3회 사용 비밀번호는 재사용 불가
            </div>
            <PrimaryButton variant="primary" fullWidth onClick={() => setShowPwChange(false)}>
              변경
            </PrimaryButton>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: `1px solid ${C.borderLight}`,
  }}>
    <span style={{ fontSize: T.sm, color: C.textSub }}>{label}</span>
    <span style={{ fontSize: T.sm, color: C.text, fontWeight: 500 }}>{value}</span>
  </div>
);

/* ==========================================================================
 * 상단 라우팅 App
 * ========================================================================== */

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(DEMO_USER_OWNER);

  // 화면 스택 (탭 내부 depth)
  const [screenStack, setScreenStack] = useState([]);

  // 공지사항 읽음 상태 (P1 — 읽음 처리)
  const [noticesState, setNoticesState] = useState(NOTICES);
  const markNoticeRead = (id) => {
    setNoticesState(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // 알림 설정 (P1 — 화면 간 지속)
  const [notifSettings, setNotifSettings] = useState(NOTIFICATION_SETTINGS_INITIAL);

  // 토스트 메시지 (전역)
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // AI 챗봇 (P1 — 아이콘 클릭 시 BottomSheet)
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotInitialQuery, setChatbotInitialQuery] = useState(null);

  const openChatbotWith = (query) => {
    setChatbotInitialQuery(query);
    setChatbotOpen(true);
  };

  // 알림 센터 오버레이
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);
  const [notificationsState, setNotificationsState] = useState(NOTIFICATIONS);
  const markNotificationRead = (id) => {
    setNotificationsState(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllNotificationsRead = () => {
    setNotificationsState(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Wi-Fi & 근태 상태
  const [wifiState, setWifiState] = useState("CONNECTED_STORE");
  const [attendanceState, setAttendanceState] = useState("NOT_CHECKED_IN");
  const [elapsedMin, setElapsedMin] = useState(0);
  const checkinTimeRef = useRef(null);

  useEffect(() => {
    if (attendanceState !== "WORKING") return;
    const iv = setInterval(() => {
      if (checkinTimeRef.current) {
        setElapsedMin(Math.floor((Date.now() - checkinTimeRef.current) / 60000));
      }
    }, 30000);
    return () => clearInterval(iv);
  }, [attendanceState]);

  const handleCheckIn = () => {
    checkinTimeRef.current = Date.now();
    setElapsedMin(0);
    setAttendanceState("WORKING");
  };
  const handleCheckOut = () => setAttendanceState("DONE");

  // 역할 전환 (목업 전용)
  const handleChangeRole = (role) => {
    if (role === "STORE_OWNER")   setUser({ ...DEMO_USER_OWNER });
    if (role === "STORE_MANAGER") setUser({ ...DEMO_USER_MANAGER });
    if (role === "STORE_STAFF")   setUser({ ...DEMO_USER_STAFF });
    setScreenStack([]);
    setActiveTab("home");
  };

  const handleLogout = () => {
    alert("로그아웃 처리됩니다.\n(목업에서는 UI만 구현되어 있습니다.)");
  };

  // 선택된 공지 (매장소식 상세)
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 화면 이동
  const navigate = (screen) => {
    if (screen === "notice-list") {
      setScreenStack([...screenStack, { tab: "home", screen: "notice-list" }]);
    } else if (screen === "notice-detail") {
      setScreenStack([...screenStack, { tab: "home", screen: "notice-detail" }]);
    } else if (screen.startsWith("ops-")) {
      setScreenStack([...screenStack, { tab: "ops", screen }]);
    } else if (screen === "sales") {
      setActiveTab("sales");
    } else if (screen === "staff-settings") {
      setActiveTab("staff");
    } else if (screen.startsWith("more-") || screen === "gdm") {
      setScreenStack([...screenStack, { tab: "more", screen }]);
    }
  };

  const goBack = () => setScreenStack(screenStack.slice(0, -1));

  // 역할 기반 탭
  const tabs = user.role === "STORE_STAFF" ? TABS_STAFF : TABS_OWNER_MANAGER;

  // STAFF가 다른 탭 접근 방지
  useEffect(() => {
    if (user.role === "STORE_STAFF" && activeTab === "sales") {
      setActiveTab("home");
    }
  }, [user.role, activeTab]);

  // 현재 화면 결정
  const currentStack = screenStack[screenStack.length - 1];
  let content = null;
  let screenTitle = "";

  if (currentStack) {
    const s = currentStack.screen;
    if (s === "notice-list") {
      screenTitle = "매장소식";
      content = <NoticeListScreen notices={noticesState} onSelect={(n) => {
        markNoticeRead(n.id);
        setSelectedNotice(n);
        setScreenStack([...screenStack, { tab: "home", screen: "notice-detail" }]);
      }} />;
    } else if (s === "notice-detail" && selectedNotice) {
      screenTitle = "매장소식 상세";
      content = <NoticeDetailScreen notice={selectedNotice} />;
    } else if (s === "ops-tickets")  { screenTitle = "배정업무";       content = <TicketsScreen user={user} />; }
    else if (s === "ops-qsc")       { screenTitle = "매장 점검";       content = <QscScreen />; }
    else if (s === "ops-remote")    { screenTitle = "본사 점검 요청";  content = <RemoteRequestScreen />; }
    else if (s === "ops-visit")     { screenTitle = "방문 점검";       content = <VisitInspectionScreen />; }
    else if (s === "ops-edu")       { screenTitle = "교육·매뉴얼";     content = <EducationScreen user={user} />; }
    else if (s === "more-team")     { screenTitle = "직원관리 설정";   content = <TeamSettingsScreen />; }
    else if (s === "more-voc")      { screenTitle = "1:1 문의";         content = <VocScreen />; }
    else if (s === "more-integration") { screenTitle = "연동 설정";    content = <IntegrationScreen />; }
    else if (s === "more-notification"){ screenTitle = "알림 설정";    content = <NotificationSettingsScreen settings={notifSettings} setSettings={setNotifSettings} onToast={showToast} />; }
    else if (s === "more-profile")  { screenTitle = "프로필";          content = <ProfileScreen user={user} />; }
    else if (s === "gdm")           { screenTitle = "공동구매";        content = <GdmScreen />; }
  } else {
    // 탭 최상위
    if (activeTab === "home")  { screenTitle = user.storeName; content = <HomeScreen user={user} onNavigate={navigate} wifiState={wifiState} attendanceState={attendanceState} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} elapsedMin={elapsedMin} notices={noticesState} />; }
    if (activeTab === "sales") { screenTitle = "매출";        content = <SalesScreen user={user} onNavigate={navigate} onAskAI={openChatbotWith} />; }
    if (activeTab === "ops")   { screenTitle = "운영·관리";   content = <OpsHubScreen user={user} onNavigate={navigate} />; }
    if (activeTab === "staff") { screenTitle = "직원관리";    content = <StaffScreen user={user} onNavigate={navigate} wifiState={wifiState} attendanceState={attendanceState} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} elapsedMin={elapsedMin} />; }
    if (activeTab === "more")  { screenTitle = "전체";        content = <MoreScreen user={user} onNavigate={navigate} onChangeRole={handleChangeRole} onLogout={handleLogout} />; }
  }

  return (
    <div style={{
      width: "100%", maxWidth: 448, margin: "0 auto",
      background: C.bg, minHeight: "100vh",
      fontFamily: FONT_STACK, color: C.text,
      display: "flex", flexDirection: "column",
      position: "relative",
      boxShadow: "0 0 20px rgba(0,0,0,0.06)",
    }}>
      {/* 전역 키프레임 */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* 데모 환경 배너 (인프라 §7-3) — APP_ENV === "demo"일 때만 노출 */}
      {APP_ENV === "demo" && (
        <div style={{
          background: C.orangeSoft, color: C.orange,
          fontSize: 11, lineHeight: 1.4, fontWeight: 600,
          padding: "8px 14px",
          borderBottom: `1px solid ${C.borderLight}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            background: C.orange, color: C.white,
            fontSize: 10, fontWeight: 700, padding: "2px 6px",
            borderRadius: 3, letterSpacing: 0.5,
          }}>DEMO</span>
          <span style={{ flex: 1 }}>
            시뮬레이션 데이터 · 시드 재생성 {LAST_SEED_DATE}
          </span>
        </div>
      )}

      <AppBar
        title={screenTitle}
        onBack={currentStack ? goBack : null}
        user={user}
        rightAction={
          !currentStack && activeTab === "home" ? (
            <button
              onClick={() => setNotifCenterOpen(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 6, position: "relative", color: C.text,
              }}
            >
              <Icon.bell />
              {notificationsState.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 0,
                  minWidth: 16, height: 16, padding: "0 4px",
                  borderRadius: 8, background: C.red, color: C.white,
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxSizing: "border-box",
                }}>
                  {notificationsState.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ) : null
        }
      />

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 20 }}>
        {content}
      </div>

      <FloatingChatbot onClick={() => setChatbotOpen(true)} />

      {!currentStack && (
        <BottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(t) => { setActiveTab(t); setScreenStack([]); }}
        />
      )}

      {/* 전역 토스트 */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? C.red : C.text,
          color: C.white, fontSize: T.sm, fontWeight: 500,
          padding: "10px 16px", borderRadius: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 200, maxWidth: "calc(100% - 28px)",
          animation: "fadeIn 0.2s ease-out",
        }}>
          {toast.msg}
        </div>
      )}

      {/* AI 챗봇 오버레이 */}
      {chatbotOpen && (
        <ChatbotOverlay
          onClose={() => { setChatbotOpen(false); setChatbotInitialQuery(null); }}
          user={user}
          initialQuery={chatbotInitialQuery}
        />
      )}

      {/* 알림 센터 오버레이 */}
      {notifCenterOpen && (
        <NotificationCenter
          notifications={notificationsState}
          onClose={() => setNotifCenterOpen(false)}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
          onNavigateTo={(target) => {
            setNotifCenterOpen(false);
            if (target === "ops-tickets" || target === "ops-qsc" || target === "ops-remote") {
              setScreenStack([...screenStack, { tab: "ops", screen: target }]);
            } else if (target === "more-integration" || target === "more-voc") {
              setScreenStack([...screenStack, { tab: "more", screen: target }]);
            } else if (target === "notice-list") {
              setScreenStack([...screenStack, { tab: "home", screen: "notice-list" }]);
            } else if (target === "staff-board") {
              setActiveTab("staff");
              setScreenStack([]);
            }
          }}
        />
      )}
    </div>
  );
}
