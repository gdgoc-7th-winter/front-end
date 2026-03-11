import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, ProfileRequestError, submitProfileSetup } from "../api/profile";
import type { KeyboardEvent } from "react";
import type { ProfileInterest, ProfileSetupRequest, ProfileTechStack, ProfileTrack } from "../types/profile";

interface ProfileSetupFormValues {
  nickname: string;
  studentId: string;
  department: string;
  profilePicture: string;
  track: ProfileTrack;
  techStacks: ProfileTechStack[];
  interests: ProfileInterest[];
}

const trackOptions: Array<{ label: string; value: ProfileTrack }> = [
  { label: "백엔드", value: "BACKEND" },
  { label: "프론트엔드", value: "FRONTEND" },
  { label: "AI", value: "AI" },
  { label: "디자인", value: "DESIGN" },
];

const DEFAULT_PROFILE_IMAGE = "/default_profile.png";

function resolveProfileImageUrl(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return DEFAULT_PROFILE_IMAGE;
  }

  try {
    new URL(normalizedValue);
    return normalizedValue;
  } catch {
    return DEFAULT_PROFILE_IMAGE;
  }
}

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [techStackInput, setTechStackInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileSetupFormValues>({
    defaultValues: {
      nickname: "",
      studentId: "",
      department: "",
      profilePicture: "",
      track: "BACKEND",
      techStacks: [],
      interests: [],
    },
  });

  const profileSetupMutation = useMutation({
    mutationFn: submitProfileSetup,
  });
  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    const currentUser = currentUserQuery.data?.data;
    if (!currentUser) {
      return;
    }

    if (currentUser.nickname) {
      setValue("nickname", currentUser.nickname);
    }

    if (currentUser.studentId) {
      setValue("studentId", currentUser.studentId);
    }

    if (currentUser.department) {
      setValue("department", currentUser.department);
    }

    setValue("profilePicture", resolveProfileImageUrl(currentUser.profilePicture ?? ""));
  }, [currentUserQuery.data, setValue]);

  useEffect(() => {
    if (!(currentUserQuery.error instanceof ProfileRequestError)) {
      return;
    }

    if (currentUserQuery.error.status === 401 || currentUserQuery.error.status === 403) {
      navigate("/login", { replace: true });
    }
  }, [currentUserQuery.error, navigate]);

  const isSubmitting = profileSetupMutation.isPending || currentUserQuery.isLoading;
  const watchedValues = watch();
  const requestPreview = useMemo<ProfileSetupRequest>(
    () => ({
      nickname: watchedValues.nickname || "string",
      studentId: watchedValues.studentId || "string",
      department: watchedValues.department || "string",
      profilePicture: resolveProfileImageUrl(watchedValues.profilePicture || ""),
      track: watchedValues.track || "BACKEND",
      techStacks: watchedValues.techStacks ?? [],
      interests: watchedValues.interests ?? [],
    }),
    [watchedValues],
  );

  const addArrayItem = <T extends string>(items: T[], input: string, onChange: (next: T[]) => void) => {
    const normalizedValue = input.trim().toUpperCase() as T;
    if (!normalizedValue) {
      return false;
    }

    if (items.includes(normalizedValue)) {
      return false;
    }

    onChange([...items, normalizedValue]);
    return true;
  };

  const removeArrayItem = <T extends string>(items: T[], target: T, onChange: (next: T[]) => void) => {
    onChange(items.filter((item) => item !== target));
  };

  const onSubmit = async (form: ProfileSetupFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await profileSetupMutation.mutateAsync({
        nickname: form.nickname.trim(),
        studentId: form.studentId.trim(),
        department: form.department.trim(),
        profilePicture: resolveProfileImageUrl(form.profilePicture),
        track: form.track,
        techStacks: form.techStacks,
        interests: form.interests,
      });

      setSuccessMessage(result.message || "프로필 설정이 완료되었습니다.");
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ProfileRequestError && (error.status === 401 || error.status === 403)) {
        navigate("/login", { replace: true });
        return;
      }

      const message = error instanceof Error ? error.message : "프로필 설정 중 오류가 발생했습니다.";
      setErrorMessage(message);
    }
  };

  const validationMessage =
    errors.nickname?.message ||
    errors.studentId?.message ||
    errors.department?.message ||
    errors.profilePicture?.message ||
    errors.track?.message ||
    errors.techStacks?.message ||
    errors.interests?.message;

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-[#0f1724]">HUFS.DEV</h1>
          <p className="mt-2 text-sm text-[#506178]">회원가입이 완료되었습니다. 프로필 정보를 이어서 입력해주세요.</p>
        </div>

        {currentUserQuery.isLoading ? (
          <div className="mb-4 rounded-2xl border border-[#d6e0ec] bg-white p-4 text-sm text-[#506178]">
            사용자 정보를 불러오는 중...
          </div>
        ) : null}

        <div className="mb-4 rounded-2xl border border-[#d6e0ec] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,36,0.06)]">
          <p className="text-sm font-semibold text-[#1e293b]">요청 바디 미리보기</p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f8fafc] p-3 text-xs leading-6 text-[#334155]">
            {JSON.stringify(requestPreview, null, 2)}
          </pre>
        </div>

        <form className="grid gap-2" onSubmit={handleSubmit(onSubmit)}>
          <input
            className="h-12 w-full rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
            placeholder="닉네임 예: string"
            type="text"
            disabled={isSubmitting}
            {...register("nickname", {
              required: "닉네임을 입력해주세요.",
            })}
          />

          <input
            className="h-12 w-full rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
            placeholder="학번 예: 202400000"
            type="text"
            disabled={isSubmitting}
            {...register("studentId", {
              required: "학번을 입력해주세요.",
            })}
          />

          <input
            className="h-12 w-full rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
            placeholder="학과 예: Computer Engineering"
            type="text"
            disabled={isSubmitting}
            {...register("department", {
              required: "학과를 입력해주세요.",
            })}
          />

          <input
            className="h-12 w-full rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
            placeholder="프로필 이미지 URL 예: https://example.com/profile.png"
            type="text"
            disabled={isSubmitting}
            {...register("profilePicture")}
          />

          <label className="mt-2 text-sm font-medium text-[#334155]" htmlFor="track">
            트랙
          </label>
          <select
            id="track"
            className="h-12 w-full rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none"
            disabled={isSubmitting}
            {...register("track", {
              required: "트랙을 선택해주세요.",
            })}
          >
            {trackOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.value})
              </option>
            ))}
          </select>

          <Controller
            name="techStacks"
            control={control}
            render={({ field }) => (
              <div className="mt-2 rounded-2xl border border-[#d6e0ec] bg-white p-4">
                <p className="text-sm font-medium text-[#334155]">기술 스택</p>
                <p className="mt-1 text-xs text-[#64748b]">예: JAVA, REACT, SPRING. Enter를 누르거나 추가 버튼으로 배열 항목을 넣습니다.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-11 flex-1 rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
                    type="text"
                    value={techStackInput}
                    placeholder="기술 스택 입력"
                    disabled={isSubmitting}
                    onChange={(event) => setTechStackInput(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key !== "Enter") {
                        return;
                      }

                      event.preventDefault();
                      if (addArrayItem(field.value, techStackInput, field.onChange)) {
                        setTechStackInput("");
                      }
                    }}
                  />
                  <button
                    className="h-11 rounded-xl bg-[#7faee0] px-4 text-sm font-medium text-white disabled:opacity-70"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (addArrayItem(field.value, techStackInput, field.onChange)) {
                        setTechStackInput("");
                      }
                    }}
                  >
                    추가
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.value.map((item) => (
                    <button
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-[#7faee0] bg-[#eef6ff] px-3 py-2 text-sm text-[#1d4f91]"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeArrayItem(field.value, item, field.onChange)}
                    >
                      {item}
                      <span className="text-xs text-[#5d88bc]">삭제</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <div className="mt-2 rounded-2xl border border-[#d6e0ec] bg-white p-4">
                <p className="text-sm font-medium text-[#334155]">관심사</p>
                <p className="mt-1 text-xs text-[#64748b]">예: STUDY, PROJECT, NETWORKING. 원하는 값만 직접 추가할 수 있습니다.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-11 flex-1 rounded-xl border border-[#9db2cc] bg-[#f1f5f9] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[#8da0b7]"
                    type="text"
                    value={interestInput}
                    placeholder="관심사 입력"
                    disabled={isSubmitting}
                    onChange={(event) => setInterestInput(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key !== "Enter") {
                        return;
                      }

                      event.preventDefault();
                      if (addArrayItem(field.value, interestInput, field.onChange)) {
                        setInterestInput("");
                      }
                    }}
                  />
                  <button
                    className="h-11 rounded-xl bg-[#7faee0] px-4 text-sm font-medium text-white disabled:opacity-70"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (addArrayItem(field.value, interestInput, field.onChange)) {
                        setInterestInput("");
                      }
                    }}
                  >
                    추가
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.value.map((item) => (
                    <button
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-[#7faee0] bg-[#eef6ff] px-3 py-2 text-sm text-[#1d4f91]"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeArrayItem(field.value, item, field.onChange)}
                    >
                      {item}
                      <span className="text-xs text-[#5d88bc]">삭제</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <button
            className="mt-3 h-12 w-full rounded-xl bg-[#7faee0] text-base font-medium text-white transition-colors hover:bg-[#6ea0d6] disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "프로필 설정 완료"}
          </button>
        </form>

        {validationMessage ? <p className="mt-3 text-sm text-red-600">{validationMessage}</p> : null}
        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="mt-3 text-sm text-green-600">{successMessage}</p> : null}

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#506178]">
          <span>이미 프로필을 설정하셨나요?</span>
          <Link className="underline" to="/login">
            로그인 하기
          </Link>
        </div>
      </div>
    </section>
  );
}
