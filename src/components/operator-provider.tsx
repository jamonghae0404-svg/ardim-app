"use client";

import { createContext, useContext, useState, useEffect } from "react";
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

// ── Provider ─────────────────────────────────────────
export function OperatorProvider({ children }: { children: React.ReactNode }) {
  /**
   * isConfirmed: 매 접속/새로고침마다 false로 시작.
   * 사용자가 확인 버튼을 눌러야만 true가 되고 앱이 열림.
   * localStorage에 이름이 저장되어 있어도 자동 통과하지 않음.
   */
  const [isConfirmed,  setIsConfirmed]  = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [inputValue,   setInputValue]   = useState("");
  const [error,        setError]        = useState("");

  // 이전에 저장된 이름을 입력창에 pre-fill (자동 로그인 X)
  useEffect(() => {
    const saved = localStorage.getItem(OPERATOR_KEY);
    if (saved) setInputValue(saved);
  }, []);

  const handleConfirm = () => {
    const name = inputValue.trim();
    if (!name) {
      setError("담당자 이름을 입력해 주세요.");
      return;
    }
    // 이름 저장 (다음 접속 시 pre-fill용)
    localStorage.setItem(OPERATOR_KEY, name);
    setOperatorName(name);
    setIsConfirmed(true);
    setError("");
  };

  // 담당자 전환: 확인 상태만 초기화, localStorage는 pre-fill용으로 유지
  const clearOperator = () => {
    setIsConfirmed(false);
    setOperatorName("");
  };

  // ── 확인 전 → 로그인/확인 화면 ──────────────────────
  if (!isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 p-8 w-full max-w-sm border border-gray-100">

          {/* 로고 */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-300/50 mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">스마트 출석부</h1>
            <p className="text-sm text-gray-400 mt-1">아르딤 복지관</p>
          </div>

          {/* 입력 폼 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                담당자 이름 확인
              </label>
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  placeholder="예) 홍길동"
                  autoFocus
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/60 transition-all bg-gray-50/40 placeholder:text-gray-300"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1.5 pl-1">{error}</p>
              )}
              {/* pre-fill 안내 */}
              {inputValue && (
                <p className="text-[11px] text-blue-400 mt-1.5 pl-1">
                  이전에 사용한 이름입니다. 확인 후 입장하세요.
                </p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200/50"
            >
              확인하고 입장하기
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
            담당자 이름별로 명단과 출석 기록이<br />
            별도로 저장·관리됩니다.
          </p>
        </div>
      </div>
    );
  }

  // ── 확인 완료 → 앱 렌더 ──────────────────────────────
  return (
    <OperatorContext.Provider value={{ operatorName, clearOperator }}>
      {children}
    </OperatorContext.Provider>
  );
}
