// =====================================================
// 회원 명단 관리 파일
// 이 파일에서 실제 이용자 명단을 관리하세요.
// =====================================================

export type AttendanceStatus = "present" | "late" | "absent" | "unset";

export interface Member {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  memberId: string;
  name: string;
  time: string;        // 출석 시각, 미체크는 "-"
  status: AttendanceStatus;
}

// -----------------------------------------------
// ✏️ 여기에 실제 이용자 이름을 추가하세요.
// id는 중복 없는 고유값이어야 합니다 (숫자 또는 영문).
// -----------------------------------------------
export const MEMBERS: Member[] = [
  // 예시:
  // { id: "1", name: "홍길동" },
  // { id: "2", name: "김철수" },
  // { id: "3", name: "이영희" },
];

// 통계 계산 유틸
export function calcStats(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  return { total, present, late, absent, rate };
}
