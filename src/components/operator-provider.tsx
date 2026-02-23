"use client";

import { createContext, useContext, useState } from "react";
import { OPERATOR_KEY } from "@/lib/storage";
import { Building2, UserCircle2, ArrowRight } from "lucide-react";

// ── Context ──────────────────────────────────────────
interface OperatorContextValue {
  operatorName: string;
  clearOperator: () => void;
}

const OperatorContext = createContext<OperatorContextValue | null>(null);

export function useOperator(): OperatorContextValue {
  const ctx = useContext(OperatorContext);
  if (!ctx) throw new Error("useOperator must be used inside <OperatorProvider>");
  return ctx;
}

// ── 로그인 UI (같은 파일에 정의 — import 경로 오류 없음) ──
function OperatorLogin({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [inputValue, setInputValue] = useState("");
  const [error,      setError]      = useState("");

  const handleSubmit = () => {
    const name = inputValue.trim();
    if (!name) { setError("담당자 이름을 입력해 주세요."); return; }
    localStorage.setItem(OPERATOR_KEY, name);
    onConfirm(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 p-8 w-full max-w-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-300/50 mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">스마트 출석부</h1>
          <p className="text-sm text-gray-400 mt-1">아르딤 복지관</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">담당자 이름</label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="예) 홍길동"
                autoFocus
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/60 transition-all bg-gray-50/40 placeholder:text-gray-300"
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5 pl-1">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200/50"
          >
            확인하고 입장하기
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
          담당자 이름별로 명단과 출석 기록이<br />별도로 저장·관리됩니다.
        </p>
      </div>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────
export function OperatorProvider({ children }: { children: React.ReactNode }) {
  // 디버그: 컴포넌트가 실제로 클라이언트에서 실행되는지 확인
  if (typeof window !== "undefined") {
    window.alert("OperatorProvider 로드됨 — 클라이언트 정상 실행");
  }

  // 무조건 null 시작 / useEffect 없음 / localStorage 자동 읽기 없음
  const [operatorName, setOperatorName] = useState<string | null>(null);

  // operatorName이 null이면 무조건 로그인 화면만 출력
  if (!operatorName) {
    return (
      <div style={{ padding: "0", background: "white", zIndex: 9999, minHeight: "100vh" }}>
        <OperatorLogin onConfirm={(name) => setOperatorName(name)} />
      </div>
    );
  }

  // operatorName 있을 때만 children 렌더
  return (
    <OperatorContext.Provider value={{ operatorName, clearOperator: () => setOperatorName(null) }}>
      {children}
    </OperatorContext.Provider>
  );
}
