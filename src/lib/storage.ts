// =====================================================
// 공유 저장소 타입 & 키
// admin / attendance 페이지가 동일한 키로 데이터를 공유합니다.
// =====================================================

/** 담당자 이름을 저장하는 전역 키 */
export const OPERATOR_KEY = "welfare-operator";

/**
 * 담당자 이름을 기반으로 개인화된 스토리지 키를 반환합니다.
 * 각 담당자의 데이터가 완전히 분리되어 저장됩니다.
 */
export function getStorageKeys(operator: string) {
  const prefix = `welfare-${operator}`;
  return {
    PROGRAMS:   `${prefix}-programs`,
    MEMBERS:    `${prefix}-members`,
    ATTENDANCE: `${prefix}-attendance`,
  } as const;
}

// ── 타입 ──────────────────────────────────────────────
export type AttendanceStatus = "present" | "absent" | "unset";

export interface Program {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  programId: string;
  programName: string;
  createdAt: string; // ISO: "2026-02-22"
}

// { [dateKey: "2026-02-22"]: { [memberId]: AttendanceStatus } }
export type AttendanceData = Record<string, Record<string, AttendanceStatus>>;

// ── 유틸 ──────────────────────────────────────────────
export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDateKR(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${y}. ${parseInt(m)}. ${parseInt(d)}.`;
}

export function calcStats(
  members: Member[],
  dayRecord: Record<string, AttendanceStatus> = {}
) {
  const present = members.filter((m) => dayRecord[m.id] === "present").length;
  const absent  = members.filter((m) => dayRecord[m.id] === "absent").length;
  const unset   = members.length - present - absent;
  const rate    = members.length > 0
    ? Math.round((present / members.length) * 100)
    : 0;
  return { total: members.length, present, absent, unset, rate };
}
