import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../api/auth";

interface LoginFormValues {
  email: string;
  password: string;
  keepLogin: boolean;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      keepLogin: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
  });
  const isLoggingIn = loginMutation.isPending;

  const onSubmit = async (form: LoginFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
      });

      setSuccessMessage(result.message || "로그인에 성공했습니다.");
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.";
      setErrorMessage(message);
    }
  };

  const validationMessage = errors.email?.message || errors.password?.message;

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-[#f7faff] px-4 py-10">
      <div className="w-full max-w-[360px]">
        <h1 className="mb-9 text-center text-3xl font-semibold text-[#0f172a]">HUFS.DEV</h1>

        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-3">
            <button className="h-10 rounded bg-[#2c2c2c] text-white" type="button" aria-label="GitHub 로그인">
              GH
            </button>
            <button className="h-10 rounded border border-[#ededed] bg-[#f5f5f5]" type="button" aria-label="Google 로그인">
              G
            </button>
            <button className="h-10 rounded bg-[#fee500] text-[#191919]" type="button" aria-label="Kakao 로그인">
              K
            </button>
            <button className="h-10 rounded bg-[#03c75a] text-white" type="button" aria-label="Naver 로그인">
              N
            </button>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <div className="h-px flex-1 bg-[#d7deea]" />
            <span className="text-base">또는</span>
            <div className="h-px flex-1 bg-[#d7deea]" />
          </div>

          <form className="grid gap-[5px]" onSubmit={handleSubmit(onSubmit)}>
            <input
              className="h-12 rounded-xl border border-[#94a3b8] bg-transparent px-4 text-base text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
              placeholder="아이디"
              type="email"
              disabled={isLoggingIn}
              {...register("email", {
                required: "이메일을 입력해주세요.",
                pattern: {
                  value: emailPattern,
                  message: "올바른 이메일 형식을 입력해주세요.",
                },
              })}
            />

            <div className="flex h-12 items-center justify-between rounded-xl border border-[#94a3b8] px-4">
              <input
                className="w-full bg-transparent text-base text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
                placeholder="비밀번호"
                type="password"
                disabled={isLoggingIn}
                {...register("password", {
                  required: "비밀번호를 입력해주세요.",
                })}
              />
            </div>

            <button
              className="h-12 rounded-xl bg-[var(--color-primary-main)] text-base font-medium text-[#f7faff] transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="flex items-center justify-between text-base text-[#475569]">
            <label className="flex items-center gap-2">
              <input
                className="size-3.5 rounded border border-[#94a3b8]"
                type="checkbox"
                disabled={isLoggingIn}
                {...register("keepLogin")}
              />
              로그인 유지
            </label>
            <button className="text-[#475569]" type="button">
              아이디/비밀번호 찾기
            </button>
          </div>

          {validationMessage ? <p className="text-sm text-red-600">{validationMessage}</p> : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
        </div>

        <div className="mt-10 flex items-center justify-center gap-10 text-base text-[#475569]">
          <span>계정이 없으신가요?</span>
          <Link className="underline" to="/signup">
            회원가입 하기
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-sm text-[#475569]">
          <button type="button">이용약관</button>
          <button className="font-semibold" type="button">
            개인정보처리방침
          </button>
          <button type="button">문의하기</button>
        </div>

        <div className="mt-8 text-center">
          <Link className="text-sm text-[#475569] underline-offset-2 hover:underline" to="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
