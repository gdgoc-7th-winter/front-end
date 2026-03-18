import { useState } from "react";
import { MyPageShell } from "../components/MyPageShell";

const settingTabs = ["알림 설정", "약관 동의", "회원 탈퇴"] as const;

export function MyAccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof settingTabs)[number]>("알림 설정");
  const [postCommentAlert, setPostCommentAlert] = useState(true);
  const [newsAlert, setNewsAlert] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const allChecked = agreeTerms && agreePrivacy && agreeMarketing;

  return (
    <MyPageShell activeSection="setting-account">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-black md:text-[32px]">계정 설정</h1>

      <div className="mt-8">
        <div className="flex gap-6 border-b border-[#e5e7eb] text-[14px] text-[#b0b8c5]">
          {settingTabs.map((tab) => (
            <button
              key={tab}
              className={`border-b-2 pb-3 transition ${
                activeTab === tab ? "border-black font-semibold text-[#111827]" : "border-transparent"
              }`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "알림 설정" ? (
          <div className="mt-8">
            <h2 className="text-[24px] font-semibold text-[#111827]">알림 설정</h2>
            <p className="mt-2 text-[12px] leading-6 text-[#94a3b8]">
              이메일 수신 여부를 설정할 수 있어요. 회원가입한 정보를 기준으로 선택한 알림이 계속 발송됩니다.
            </p>

            <div className="mt-6 grid gap-5">
              {[
                {
                  label: "게시판 댓글",
                  description: "작성한 게시글의 댓글, 대댓글이 등록될 때 알림을 받을 수 있어요.",
                  checked: postCommentAlert,
                  onChange: setPostCommentAlert,
                },
                {
                  label: "HUFS DEV 소식 및 홍보",
                  description: "유용한 정보를 알려주는 소식을 받을 수 있어요.",
                  checked: newsAlert,
                  onChange: setNewsAlert,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[#f6f9fe] px-6 py-5">
                  <div>
                    <div className="text-[18px] font-semibold text-[#334155]">{item.label}</div>
                    <p className="mt-2 text-[13px] text-[#94a3b8]">{item.description}</p>
                  </div>
                  <button
                    className={`relative h-7 w-14 rounded-full transition ${item.checked ? "bg-[#67a6ff]" : "bg-[#dce3eb]"}`}
                    type="button"
                    onClick={() => item.onChange(!item.checked)}
                  >
                    <span
                      className={`absolute top-1 size-5 rounded-full bg-white transition ${item.checked ? "left-8" : "left-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "약관 동의" ? (
          <div className="mt-8">
            <h2 className="text-[24px] font-semibold text-[#111827]">약관 동의</h2>
            <p className="mt-2 text-[12px] leading-6 text-[#94a3b8]">
              서비스 이용을 위해 필요한 약관에 동의하고, 이메일 수신 여부를 설정할 수 있어요.
            </p>

            <div className="mt-6 grid gap-3 text-[14px] text-[#475569]">
              {[
                {
                  label: "약관 전체 동의",
                  checked: allChecked,
                  onChange: (checked: boolean) => {
                    setAgreeTerms(checked);
                    setAgreePrivacy(checked);
                    setAgreeMarketing(checked);
                  },
                },
                { label: "이용약관 동의 (필수)", checked: agreeTerms, onChange: setAgreeTerms },
                { label: "개인정보처리방침 동의 (필수)", checked: agreePrivacy, onChange: setAgreePrivacy },
                { label: "이벤트 및 공지 수신 동의 (선택)", checked: agreeMarketing, onChange: setAgreeMarketing },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      className="size-4 rounded border border-[#cbd5e1]"
                      type="checkbox"
                      checked={item.checked}
                      onChange={(event) => item.onChange(event.target.checked)}
                    />
                    <span>{item.label}</span>
                  </label>
                  <button className="text-[12px] text-[#b0b8c5]" type="button">
                    보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "회원 탈퇴" ? (
          <div className="mt-8">
            <h2 className="text-[24px] font-semibold text-[#111827]">회원 탈퇴</h2>
            <p className="mt-2 text-[12px] leading-6 text-[#94a3b8]">
              계정 탈퇴하면 프로필 정보와 활동 기록이 삭제되고 삭제된 데이터는 복구할 수 없어요.
            </p>

            <div className="mt-8 rounded-2xl border border-[#f1d4d1] bg-[#fff8f7] px-6 py-5">
              <div className="text-[15px] leading-7 text-[#7c4b47]">
                탈퇴 전 반드시 확인해 주세요.
                <br />
                작성한 게시글 및 댓글, 지원 기록은 복구되지 않으며 일부 정보는 관련 법령에 따라 보관될 수 있습니다.
              </div>
              <button className="mt-6 rounded-xl bg-[#f04438] px-5 py-3 text-[14px] font-semibold text-white" type="button">
                회원 탈퇴 진행하기
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </MyPageShell>
  );
}
