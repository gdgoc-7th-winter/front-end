import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TEAM_RECRUIT_DETAIL, type TeamRecruitQuestion } from "../../mock/teamRecruit";

type ApplyFormValues = Record<string, string | string[]>;

function FieldCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-[8px] border border-[#87bcf5] bg-white p-9">
      <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1e293b]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TeamRecruitApplyPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, watch, control } = useForm<ApplyFormValues>({
    defaultValues: {
      name: "여채현",
      department: "영어통번역학과",
      motivation: "안녕하세요, 저는 스프링부트 개발자를 희망합니다. 특히 종합설계를 듣지 않고 프로젝트에 집중하는 학생입니다!",
      interest: ["react"],
    },
  });

  const motivationValue = useWatch({ control, name: "motivation" });
  const motivationLength = String(motivationValue ?? "").length;

  const onSubmit = handleSubmit(() => {
    navigate("/team-recruit/my-page");
  });

  return (
    <section className="grid gap-6 pt-2 md:gap-8">
      <div className="rounded-[8px] border border-[#87bcf5] border-t-4 bg-white p-9">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#0f172a] md:text-[32px]">{TEAM_RECRUIT_DETAIL.applicationTitle}</h1>
        <p className="mt-2 text-base text-[#475569]">{TEAM_RECRUIT_DETAIL.applicationDescription}</p>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        {TEAM_RECRUIT_DETAIL.questions.map((question) => (
          <FieldCard key={question.id} title={`${question.required ? "* " : ""}${question.title}`}>
            <QuestionField question={question} register={register} watch={watch} motivationLength={motivationLength} />
          </FieldCard>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-[8px] bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8]"
            type="button"
            onClick={() => setSaved(true)}
          >
            임시저장
          </button>
          <button className="rounded-[8px] bg-[var(--color-primary-main)] px-9 py-3 text-base font-semibold text-[#f7faff]" type="submit">
            제출하기
          </button>
        </div>
        {saved ? <p className="text-right text-sm text-[#64748b]">임시저장된 내용은 이 페이지를 새로고침하면 사라집니다.</p> : null}
      </form>
    </section>
  );
}

function QuestionField({
  question,
  register,
  watch,
  motivationLength,
}: {
  question: TeamRecruitQuestion;
  register: ReturnType<typeof useForm<ApplyFormValues>>["register"];
  watch: ReturnType<typeof useForm<ApplyFormValues>>["watch"];
  motivationLength: number;
}) {
  if (question.type === "SHORT_TEXT") {
    return <input className="h-12 w-full rounded-[8px] border border-[#dee2e6] px-4 text-base text-[#1e293b] outline-none" {...register(question.id)} />;
  }

  if (question.type === "LONG_TEXT") {
    return (
      <div className="grid gap-2">
        <textarea
          className="min-h-28 w-full resize-none rounded-[8px] border border-[#dee2e6] px-4 py-3 text-base text-[#1e293b] outline-none"
          {...register(question.id)}
        />
        <p className="text-right text-sm text-[#94a3b8]">{motivationLength}/{question.maxLength ?? 100}</p>
      </div>
    );
  }

  if (question.type === "RADIO") {
    return (
      <div className="grid gap-3">
        {question.description ? <p className="text-sm text-[#94a3b8]">{question.description}</p> : null}
        {question.options?.map((option) => (
          <label key={option.id} className="flex items-center gap-3 text-base text-[#475569]">
            <input type="radio" value={option.id} {...register(question.id)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  const currentValues = watch(question.id);
  const checkedValues = Array.isArray(currentValues) ? currentValues : [];

  return (
    <div className="grid gap-3">
      {question.options?.map((option) => (
        <label key={option.id} className="flex items-center gap-3 text-base text-[#475569]">
          <input type="checkbox" value={option.id} defaultChecked={checkedValues.includes(option.id)} {...register(question.id)} />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
