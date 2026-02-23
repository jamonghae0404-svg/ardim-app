"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import {
  Settings, Users, BookOpen, Plus, Trash2, Shield, AlertCircle, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getStorageKeys, getTodayKey, formatDateKR,
  type Program, type Member,
} from "@/lib/storage";
import { useOperator } from "@/components/operator-provider";

// ── 전화번호 자동 하이픈 ──────────────────────────────────
function formatPhone(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
}

// ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const { operatorName } = useOperator();

  // ── 상태 ────────────────────────────────────────────────
  const [programs,     setPrograms]     = useState<Program[]>([]);
  const [members,      setMembers]      = useState<Member[]>([]);
  const [isLoaded,     setIsLoaded]     = useState(false);

  // 프로그램 폼
  const [programInput, setProgramInput] = useState("");
  const [programError, setProgramError] = useState("");

  // 이용자 폼
  const [memberName,    setMemberName]    = useState("");
  const [memberPhone,   setMemberPhone]   = useState("");
  const [memberProgram, setMemberProgram] = useState("");
  const [memberDate,    setMemberDate]    = useState(getTodayKey());
  const [memberError,   setMemberError]   = useState("");

  // 테이블 필터
  const [filterProgram, setFilterProgram] = useState("all");

  // ── localStorage 로드 ────────────────────────────────────
  useEffect(() => {
    const KEYS = getStorageKeys(operatorName);
    try {
      const p = localStorage.getItem(KEYS.PROGRAMS);
      const m = localStorage.getItem(KEYS.MEMBERS);
      if (p) setPrograms(JSON.parse(p));
      if (m) setMembers(JSON.parse(m));
    } catch { /* 손상된 데이터 무시 */ }
    setIsLoaded(true);
  }, [operatorName]);

  // ── localStorage 저장 ────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(
      getStorageKeys(operatorName).PROGRAMS,
      JSON.stringify(programs)
    );
  }, [programs, isLoaded, operatorName]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(
      getStorageKeys(operatorName).MEMBERS,
      JSON.stringify(members)
    );
  }, [members, isLoaded, operatorName]);

  // ── 프로그램 추가 ─────────────────────────────────────────
  const addProgram = () => {
    const name = programInput.trim();
    if (!name) { setProgramError("프로그램명을 입력하세요."); return; }
    if (programs.some((p) => p.name === name)) {
      setProgramError("이미 존재하는 프로그램입니다."); return;
    }
    setPrograms((prev) => [...prev, { id: Date.now().toString(), name }]);
    setProgramInput("");
    setProgramError("");
  };

  const handleProgramKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addProgram();
  };

  // ── 프로그램 삭제 ─────────────────────────────────────────
  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  // ── 이용자 추가 ───────────────────────────────────────────
  const addMember = () => {
    const name = memberName.trim();
    if (!name)           { setMemberError("이용자 성함을 입력하세요."); return; }
    if (!memberProgram)  { setMemberError("프로그램을 선택하세요."); return; }
    if (!memberDate)     { setMemberError("등록일을 선택하세요."); return; }
    const program = programs.find((p) => p.id === memberProgram);
    if (!program) return;

    setMembers((prev) => [
      ...prev,
      {
        id:          Date.now().toString(),
        name,
        phone:       memberPhone,
        programId:   memberProgram,
        programName: program.name,
        createdAt:   memberDate,
      },
    ]);
    setMemberName("");
    setMemberPhone("");
    setMemberProgram("");
    setMemberDate(getTodayKey());
    setMemberError("");
  };

  // ── 이용자 삭제 ───────────────────────────────────────────
  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // ── 필터된 명단 ───────────────────────────────────────────
  const filteredMembers = filterProgram === "all"
    ? members
    : members.filter((m) => m.programId === filterProgram);

  // ── 렌더 ─────────────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 max-w-5xl mx-auto w-full">

      {/* 헤더 */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">관리자</h1>
        <p className="text-sm text-gray-400 mt-0.5">프로그램과 이용자 명단을 관리합니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-[11px] font-medium uppercase tracking-wide">프로그램</p>
              <p className="text-5xl font-bold mt-1">{programs.length}</p>
              <p className="text-blue-200 text-xs mt-2">개 등록됨</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-[11px] font-medium uppercase tracking-wide">이용자</p>
              <p className="text-5xl font-bold mt-1">{members.length}</p>
              <p className="text-gray-400 text-xs mt-2">명 등록됨</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 프로그램 관리 ── */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            프로그램 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="프로그램명 입력 (예: 난타교실, 컴퓨터교실)"
                value={programInput}
                onChange={(e) => { setProgramInput(e.target.value); setProgramError(""); }}
                onKeyDown={handleProgramKeyDown}
                className="h-10 rounded-xl border-gray-200 focus:border-blue-400"
              />
              {programError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {programError}
                </p>
              )}
            </div>
            <Button
              onClick={addProgram}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />추가
            </Button>
          </div>

          {programs.length === 0 ? (
            <div className="py-5 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
              등록된 프로그램이 없습니다. 위에서 추가해 주세요.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() => deleteProgram(p.id)}
                    className="text-blue-300 hover:text-red-400 transition-colors"
                    aria-label={`${p.name} 삭제`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 이용자 등록 ── */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            이용자 등록
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="이용자 성함 *"
              value={memberName}
              onChange={(e) => { setMemberName(e.target.value); setMemberError(""); }}
              className="h-10 rounded-xl border-gray-200 focus:border-blue-400"
            />
            <Input
              placeholder="전화번호 (선택)"
              value={memberPhone}
              onChange={(e) => setMemberPhone(formatPhone(e.target.value))}
              className="h-10 rounded-xl border-gray-200 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select
              value={memberProgram}
              onValueChange={(v) => { setMemberProgram(v); setMemberError(""); }}
            >
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:border-blue-400">
                <SelectValue placeholder="프로그램 선택 *" />
              </SelectTrigger>
              <SelectContent>
                {programs.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    먼저 프로그램을 추가해 주세요.
                  </div>
                ) : (
                  programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className="relative">
              <input
                type="date"
                value={memberDate}
                onChange={(e) => { setMemberDate(e.target.value); setMemberError(""); }}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
              />
              <span className="absolute -top-2 left-2.5 text-[10px] text-gray-400 bg-white px-1">
                등록일
              </span>
            </div>
          </div>

          {memberError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {memberError}
            </p>
          )}

          <Button
            onClick={addMember}
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            이용자 등록하기
          </Button>
        </CardContent>
      </Card>

      {/* ── 이용자 명단 테이블 ── */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              이용자 명단
              <span className="text-xs font-normal text-gray-400">
                ({filteredMembers.length}명
                {filterProgram !== "all" && " · 필터 적용 중"})
              </span>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="h-8 w-40 rounded-lg border-gray-200 text-xs">
                  <SelectValue placeholder="전체 프로그램" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 프로그램</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          {filteredMembers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              <p>
                {members.length === 0
                  ? "등록된 이용자가 없습니다."
                  : "선택한 프로그램에 이용자가 없습니다."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-500 w-10 text-center">#</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">성함</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">전화번호</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">프로그램</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">등록일</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((m, idx) => (
                    <TableRow key={m.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-xs text-gray-400 text-center">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                            {m.name[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{m.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {m.phone || <span className="text-gray-300">-</span>}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full">
                          {m.programName}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {formatDateKR(m.createdAt)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => deleteMember(m.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
