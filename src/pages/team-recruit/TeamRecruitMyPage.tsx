import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TEAM_RECRUIT_APPLICANTS, TEAM_RECRUIT_DETAIL, getRecruitCampusLabel } from "../../mock/teamRecruit";

export function TeamRecruitMyPage() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<"ALL" | "SEOUL" | "GLOBAL">("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("전체 학과");
  const [selectedApplicantId, setSelectedApplicantId] = useState<number>(TEAM_RECRUIT_APPLICANTS[0]?.applicantId ?? 0);

  const applicants = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return TEAM_RECRUIT_APPLICANTS.filter((applicant) => {
      const matchesKeyword = normalizedKeyword
        ? [applicant.name, applicant.department].some((value) => value.toLowerCase().includes(normalizedKeyword))
        : true;
      const matchesCampus = selectedCampus === "ALL" ? true : applicant.campus === selectedCampus;
      const matchesDepartment = selectedDepartment === "전체 학과" ? true : applicant.department === selectedDepartment;

      return matchesKeyword && matchesCampus && matchesDepartment;
    });
  }, [keyword, selectedCampus, selectedDepartment]);

  const selectedApplicant =
    applicants.find((applicant) => applicant.applicantId === selectedApplicantId) ??
    TEAM_RECRUIT_APPLICANTS.find((applicant) => applicant.applicantId === selectedApplicantId) ??
    applicants[0] ??
    null;

  return (
    <section className="grid gap-8 pt-2 md:gap-10">
      <article className="rounded-[32px] bg-white">
        <header className="border-b border-[#f8fafc] px-6 py-8 md:px-10">
          <p className="text-xs leading-4 text-[#90a1b9]">26.02.24 · 팀원 모집 게시판</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[#475569]">
            <span>동아리</span>
            <span>|</span>
            <span>{TEAM_RECRUIT_DETAIL.recruitStartDate.replaceAll("-", ".")} - {TEAM_RECRUIT_DETAIL.recruitEndDate.replaceAll("-", ".")}</span>
          </div>
          <span className="mt-4 inline-flex rounded-[4px] bg-[#65c18b] px-4 py-1.5 text-xs font-semibold text-[#f7faff]">D-7</span>
          <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] text-[#0f172b]">{TEAM_RECRUIT_DETAIL.title}</h1>
        </header>

        <div className="grid gap-8 px-6 py-8 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex h-12 flex-1 items-center rounded-[4px] border border-[#dee2e6] bg-[#fefeff] px-[13px]">
              <Search className="mr-3 h-4 w-4 shrink-0 text-[#1b1c1d]" strokeWidth={2} />
              <input
                className="w-full bg-transparent text-[14.4px] font-semibold tracking-[-0.03em] text-[#1b1c1d] outline-none placeholder:text-[#ced4da]"
                placeholder="이름, 학과를 입력하여 지원자를 검색하세요"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <button
              className="h-12 min-w-28 rounded-[4px] border border-[#87bcf5] bg-[#87bcf5] px-6 text-sm font-semibold tracking-[-0.03em] text-[#f7faff]"
              type="button"
              onClick={() => setKeyword(searchInput)}
            >
              검색
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-[#dee2e6] pb-[13px] text-sm">
            <button className="font-semibold text-[#1b1c1d]" type="button">
              • 최신순
            </button>
            <button className="font-semibold text-[#adb5bd]" type="button">
              • 이름순
            </button>
          </div>

          <div className="grid gap-4">
            <h2 className="text-xl font-bold text-[#1d293d]">
              지원자 <span className="text-[var(--color-primary-main)]">{applicants.length}</span>
            </h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <label className="relative">
                <select
                  className="h-10 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none md:w-[200px]"
                  value={selectedCampus}
                  onChange={(event) => setSelectedCampus(event.target.value as "ALL" | "SEOUL" | "GLOBAL")}
                >
                  <option value="ALL">전체 캠퍼스</option>
                  <option value="SEOUL">서울 캠퍼스</option>
                  <option value="GLOBAL">글로벌 캠퍼스</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">▾</span>
              </label>

              <label className="relative">
                <select
                  className="h-10 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none md:w-[200px]"
                  value={selectedDepartment}
                  onChange={(event) => setSelectedDepartment(event.target.value)}
                >
                  <option value="전체 학과">전체 학과</option>
                  <option value="영어통번역학과">영어통번역학과</option>
                  <option value="컴퓨터공학부">컴퓨터공학부</option>
                  <option value="정보통신공학과">정보통신공학과</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">▾</span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-base font-semibold text-black">
                    <th className="border-b border-[#ced4da] px-4 py-3">이름</th>
                    <th className="border-b border-[#ced4da] px-4 py-3">캠퍼스</th>
                    <th className="border-b border-[#ced4da] px-4 py-3">학과</th>
                    <th className="border-b border-[#ced4da] px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant) => (
                    <tr key={applicant.applicantId} className="text-base text-black">
                      <td className="px-4 py-3 font-semibold">{applicant.name}</td>
                      <td className="px-4 py-3 font-semibold">{getRecruitCampusLabel(applicant.campus)}</td>
                      <td className="px-4 py-3 font-semibold">{applicant.department}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-[4px] bg-[#87bcf5] px-4 py-2 text-sm font-medium text-[#f7faff]"
                          type="button"
                          onClick={() => setSelectedApplicantId(applicant.applicantId)}
                        >
                          지원서 열람하기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedApplicant ? (
              <div className="rounded-[16px] border border-[#dbeafe] bg-[#f8fbff] p-6">
                <h3 className="text-xl font-bold text-[#0f172a]">{selectedApplicant.name} 지원서</h3>
                <p className="mt-1 text-sm text-[#64748b]">
                  제출일{" "}
                  {new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
                    new Date(selectedApplicant.submittedAt),
                  )}
                </p>

                <div className="mt-6 grid gap-4">
                  {TEAM_RECRUIT_DETAIL.questions.map((question) => {
                    const answer = selectedApplicant.answers[question.id];
                    const answerText = Array.isArray(answer) ? answer.join(", ") : (answer ?? "미응답");

                    return (
                      <div key={question.id} className="rounded-[12px] bg-white px-5 py-4">
                        <p className="text-sm font-semibold text-[#94a3b8]">{question.title}</p>
                        <p className="mt-2 text-base leading-7 text-[#1e293b]">{answerText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}
