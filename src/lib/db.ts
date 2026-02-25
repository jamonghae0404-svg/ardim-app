// =====================================================
// Supabase DB 쿼리 모듈
// localStorage를 완전히 대체합니다.
// =====================================================

import { supabase } from "./supabase";
import type { Program, Member, AttendanceData } from "./storage";

// ── Programs ──────────────────────────────────────────

export async function fetchPrograms(operatorName: string): Promise<Program[]> {
  const { data } = await supabase
    .from("programs")
    .select("id, name")
    .eq("operator_name", operatorName)
    .order("created_at");
  return data ?? [];
}

export async function insertProgram(
  operatorName: string,
  name: string,
): Promise<Program | null> {
  const { data } = await supabase
    .from("programs")
    .insert({ operator_name: operatorName, name })
    .select("id, name")
    .single();
  return data ?? null;
}

export async function removeProgram(id: string): Promise<void> {
  await supabase.from("programs").delete().eq("id", id);
}

// ── Members ──────────────────────────────────────────

export async function fetchMembers(operatorName: string): Promise<Member[]> {
  const { data } = await supabase
    .from("members")
    .select("id, name, phone, program_id, program_name, created_at")
    .eq("operator_name", operatorName)
    .order("created_at");
  if (!data) return [];
  return data.map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone ?? "",
    programId: m.program_id,
    programName: m.program_name,
    createdAt: m.created_at,
  }));
}

export async function insertMember(
  operatorName: string,
  m: Omit<Member, "id">,
): Promise<Member | null> {
  const { data } = await supabase
    .from("members")
    .insert({
      operator_name: operatorName,
      name: m.name,
      phone: m.phone,
      program_id: m.programId,
      program_name: m.programName,
      created_at: m.createdAt,
    })
    .select("id, name, phone, program_id, program_name, created_at")
    .single();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone ?? "",
    programId: data.program_id,
    programName: data.program_name,
    createdAt: data.created_at,
  };
}

export async function patchMember(
  id: string,
  updates: {
    name?: string;
    phone?: string;
    programId?: string;
    programName?: string;
  },
): Promise<void> {
  const payload: Record<string, string> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.programId !== undefined) payload.program_id = updates.programId;
  if (updates.programName !== undefined)
    payload.program_name = updates.programName;
  await supabase.from("members").update(payload).eq("id", id);
}

export async function removeMember(id: string): Promise<void> {
  await supabase.from("members").delete().eq("id", id);
}

// ── Attendance ────────────────────────────────────────

export async function fetchAttendance(
  operatorName: string,
): Promise<AttendanceData> {
  const { data } = await supabase
    .from("attendance")
    .select("member_id, date, status")
    .eq("operator_name", operatorName);

  const result: AttendanceData = {};
  for (const row of data ?? []) {
    if (!result[row.date]) result[row.date] = {};
    result[row.date][row.member_id] = row.status as
      | "present"
      | "absent"
      | "unset";
  }
  return result;
}

// status === 'unset' → 행 삭제 / 그 외 → upsert
export async function saveAttendance(
  operatorName: string,
  memberId: string,
  date: string,
  status: "present" | "absent" | "unset",
): Promise<void> {
  if (status === "unset") {
    await supabase
      .from("attendance")
      .delete()
      .eq("member_id", memberId)
      .eq("date", date);
  } else {
    await supabase.from("attendance").upsert(
      { operator_name: operatorName, member_id: memberId, date, status },
      { onConflict: "member_id,date" },
    );
  }
}
