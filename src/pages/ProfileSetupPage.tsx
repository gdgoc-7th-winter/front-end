import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Check, Eye, EyeOff, Info, Search, X } from "lucide-react";
import { MyPageShell } from "../components/MyPageShell";
import { getCurrentUser, isProfileSetupRequiredError, ProfileRequestError, submitProfileSetup } from "../api/profile";
import type { CurrentUserResponse } from "../api/profile";
import type { ProfileInterest, ProfileSetupRequest, ProfileTechStack, ProfileTrack } from "../types/profile";

const DEFAULT_PROFILE_IMAGE = "/default_profile.png";

const trackOptions: Array<{ label: string; value: ProfileTrack }> = [
  { label: "백엔드", value: "BACKEND" },
  { label: "프론트엔드", value: "FRONTEND" },
  { label: "AI", value: "AI" },
  { label: "디자인", value: "DESIGN" },
];

const techStackOptions: ProfileTechStack[] = ["JAVA", "SPRING", "JAVASCRIPT", "TYPESCRIPT", "REACT", "NODE", "PYTHON"];
const interestOptions: ProfileInterest[] = ["STUDY", "PROJECT", "NETWORKING", "CONTEST"];

const dummyProfile: CurrentUserResponse = {
  nickname: "dummy",
  profilePicture: DEFAULT_PROFILE_IMAGE,
  track: "BACKEND",
  techStacks: [],
  interests: [],
  isDummyProfile: true,
};

interface ProfileFormValues {
  nickname: string;
  studentId: string;
  department: string;
  profilePicture: string;
  track: ProfileTrack;
  techStacks: ProfileTechStack[];
  interests: ProfileInterest[];
}

function resolveProfileImageUrl(value?: string) {
  const normalizedValue = value?.trim();

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

function mapTrackLabel(track?: string) {
  switch (track) {
    case "BACKEND":
      return "백엔드";
    case "FRONTEND":
      return "프론트엔드";
    case "AI":
      return "AI";
    case "DESIGN":
      return "디자인";
    default:
      return track || "미설정";
  }
}

function mapInterestLabel(interest: ProfileInterest | string) {
  switch (interest) {
    case "STUDY":
      return "스터디";
    case "PROJECT":
      return "프로젝트";
    case "NETWORKING":
      return "네트워킹";
    case "CONTEST":
      return "대회";
    default:
      return interest;
  }
}

function mapTechStackLabel(stack: ProfileTechStack | string) {
  switch (stack) {
    case "SPRING":
      return "SpringBoot";
    default:
      return stack;
  }
}

function getProfileSummary(user: CurrentUserResponse) {
  if (user.isDummyProfile) {
    return "프로필 설정을 완료하면 임시 계정 상태가 해제됩니다.";
  }

  if (user.interests?.length) {
    return `${user.nickname || "사용자"}님은 ${user.interests.map(mapInterestLabel).join(", ")}에 관심이 있습니다.`;
  }

  return "아직 등록된 관심사가 없습니다.";
}

function ProfileField({ label, value, required = false }: { label: string; value: ReactNode; required?: boolean }) {
  return (
    <div className="grid gap-2 md:grid-cols-[128px_minmax(0,1fr)] md:items-start">
      <div className="text-[15px] font-medium leading-6 text-[#1e293b]">
        {label}
        {required ? <span className="ml-1 text-[#ea4335]">*</span> : null}
      </div>
      <div className="min-w-0 text-[15px] font-semibold leading-6 text-[#1e293b]">{value}</div>
    </div>
  );
}

function SocialLoginRow({
  badge,
  label,
  actionLabel,
  actionVariant = "outline",
}: {
  badge: string;
  label: string;
  actionLabel: string;
  actionVariant?: "outline" | "primary";
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-9 min-w-12 place-items-center rounded text-sm font-semibold ${
            badge === "GH"
              ? "bg-[#2c2c2c] text-white"
              : badge === "G"
                ? "border border-[#ededed] bg-[#f5f5f5] text-[#ea4335]"
                : badge === "K"
                  ? "bg-[#fee500] text-[#191919]"
                  : "bg-[#03c75a] text-white"
          }`}
        >
          {badge}
        </div>
        <span className={`text-[15px] leading-6 ${label === "연동되지 않음" ? "text-[#94a3b8]" : "text-[#1e293b]"}`}>{label}</span>
      </div>

      <button
        className={`rounded border px-4 py-1.5 text-sm ${
          actionVariant === "primary"
            ? "border-[var(--color-primary-main)] bg-[var(--color-primary-main)] text-[#f7faff]"
            : "border-[#dee2e6] bg-white text-[#1e293b]"
        }`}
        type="button"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function PasswordRequirement({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[15px] leading-6 ${isValid ? "text-[#64748b]" : "text-[#94a3b8]"}`}>
      <Check className="size-5 shrink-0" strokeWidth={2.2} />
      <span>{label}</span>
    </div>
  );
}

function TechStackModal({
  isOpen,
  selectedStacks,
  searchValue,
  filteredStacks,
  onSearchChange,
  onToggleStack,
  onClose,
}: {
  isOpen: boolean;
  selectedStacks: ProfileTechStack[];
  searchValue: string;
  filteredStacks: ProfileTechStack[];
  onSearchChange: (value: string) => void;
  onToggleStack: (stack: ProfileTechStack) => void;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6">
      <div className="flex max-h-[min(760px,calc(100vh-48px))] w-full max-w-[860px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#e9eef5] px-8 py-6">
          <h3 className="text-[20px] font-semibold text-[#13304f]">주요 기술</h3>
          <button className="rounded-full p-2 text-[#94a3b8] transition hover:bg-[#f8fafc]" type="button" onClick={onClose}>
            <X className="size-7" strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-8">
          <div className="text-[18px] font-semibold text-[#13304f]">자신 있는 기술을 최대 3개 선택하세요.</div>

          <div className="mt-6 flex flex-wrap gap-3">
            {selectedStacks.map((stack) => (
              <button
                key={stack}
                className="rounded-[16px] bg-[#506987] px-6 py-4 text-[16px] font-medium text-white"
                type="button"
                onClick={() => onToggleStack(stack)}
              >
                {mapTechStackLabel(stack)}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <div className="text-[16px] font-semibold text-[#111827]">그 밖의 기술 등록</div>
            <input
              className="mt-5 h-16 w-full rounded-[18px] border-[3px] border-[#111111] px-6 text-[22px] text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              type="text"
              placeholder="기술 스택을 검색해 주세요."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-[20px] border border-[#eef2f6] bg-white">
              {filteredStacks.length ? (
                filteredStacks.map((stack) => (
                  <button
                    key={stack}
                    className={`flex w-full items-center justify-between border-b border-[#eef2f6] px-6 py-5 text-left text-[18px] text-[#0f172a] last:border-b-0 ${
                      selectedStacks.includes(stack) ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                    }`}
                    type="button"
                    onClick={() => onToggleStack(stack)}
                  >
                    <span>{mapTechStackLabel(stack)}</span>
                    {selectedStacks.includes(stack) ? <Check className="size-5 text-[var(--color-primary-main)]" strokeWidth={2.3} /> : null}
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-[15px] text-[#94a3b8]">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSetupPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [techStackSearchValue, setTechStackSearchValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileOverride, setProfileOverride] = useState<CurrentUserResponse | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      nickname: "",
      studentId: "",
      department: "",
      profilePicture: DEFAULT_PROFILE_IMAGE,
      track: "BACKEND",
      techStacks: [],
      interests: [],
    },
  });

  useEffect(() => {
    register("track", { required: "트랙을 선택해주세요." });
    register("techStacks");
    register("interests");
  }, [register]);

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data;
      } catch (error) {
        if (isProfileSetupRequiredError(error)) {
          return dummyProfile;
        }

        if (error instanceof ProfileRequestError && (error.status === 401 || error.status === 403)) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const profileSetupMutation = useMutation({
    mutationFn: submitProfileSetup,
    onSuccess: (result, variables) => {
      setSuccessMessage(result.message || "프로필 설정이 저장되었습니다.");
      setErrorMessage(null);
      setIsEditing(false);
      const nextProfile = {
        ...(profile ?? {}),
        ...variables,
        isDummyProfile: false,
      };
      setProfileOverride(nextProfile);
      queryClient.setQueryData(["current-user"], nextProfile);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "프로필 설정 중 오류가 발생했습니다.");
    },
  });

  useEffect(() => {
    if (!currentUserQuery.isLoading && currentUserQuery.data === null) {
      window.location.replace("/login");
    }
  }, [currentUserQuery.data, currentUserQuery.isLoading]);

  const profile = useMemo(() => {
    if (profileOverride) {
      return profileOverride;
    }

    if (currentUserQuery.data) {
      return currentUserQuery.data;
    }

    return null;
  }, [currentUserQuery.data, profileOverride]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      nickname: profile.nickname || "dummy",
      studentId: profile.studentId || "",
      department: profile.department || "",
      profilePicture: resolveProfileImageUrl(profile.profilePicture),
      track: (profile.track as ProfileTrack | undefined) || "BACKEND",
      techStacks: (profile.techStacks as ProfileTechStack[] | undefined) || [],
      interests: (profile.interests as ProfileInterest[] | undefined) || [],
    });
  }, [profile, reset]);

  const watchedProfilePicture = watch("profilePicture");
  const watchedTrack = watch("track");
  const watchedTechStacks = watch("techStacks");
  const watchedInterests = watch("interests");
  const watchedStudentId = watch("studentId");

  const profileImage = resolveProfileImageUrl(watchedProfilePicture || profile?.profilePicture);
  const filteredTechStackOptions = techStackOptions.filter((stack) =>
    mapTechStackLabel(stack).toLowerCase().includes(techStackSearchValue.trim().toLowerCase()),
  );
  const newPasswordCategoryCount = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9\s]/].filter((pattern) => pattern.test(newPassword)).length;
  const passwordRequirements = [
    { label: "영문/숫자/특수문자 중, 2가지 이상 포함", isValid: newPasswordCategoryCount >= 2 },
    { label: "8자 이상 32자 이하 입력 (공백 제외)", isValid: /^\S{8,32}$/.test(newPassword) },
    { label: "연속 3자 이상 동일한 문자/숫자 제외", isValid: !/(.)\1\1/.test(newPassword) },
  ];
  const isCurrentPasswordEntered = currentPassword.trim().length > 0;
  const isConfirmPasswordMatched = confirmNewPassword.length > 0 && confirmNewPassword === newPassword;
  const isPasswordFormValid = isCurrentPasswordEntered && passwordRequirements.every((requirement) => requirement.isValid) && isConfirmPasswordMatched;
  const isLoading = currentUserQuery.isLoading;
  const isSetupRequired = Boolean(profile?.isDummyProfile);
  const isSubmitting = profileSetupMutation.isPending;
  const otherError =
    currentUserQuery.error instanceof ProfileRequestError &&
    !isProfileSetupRequiredError(currentUserQuery.error) &&
    currentUserQuery.error.status !== 401 &&
    currentUserQuery.error.status !== 403
      ? currentUserQuery.error.message
      : null;

  const onSubmit = async (form: ProfileFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: ProfileSetupRequest = {
      nickname: form.nickname.trim(),
      studentId: form.studentId.trim(),
      department: form.department.trim(),
      profilePicture: resolveProfileImageUrl(form.profilePicture),
      track: form.track,
      techStacks: form.techStacks,
      interests: form.interests,
    };

    await profileSetupMutation.mutateAsync(payload);
  };

  const validationMessage =
    errors.nickname?.message ||
    errors.studentId?.message ||
    errors.department?.message ||
    errors.profilePicture?.message ||
    errors.track?.message ||
    errors.techStacks?.message ||
    errors.interests?.message;

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsCurrentPasswordVisible(false);
    setIsNewPasswordVisible(false);
    setIsConfirmNewPasswordVisible(false);
  };

  const toggleTechStack = (stack: ProfileTechStack) => {
    const isSelected = watchedTechStacks.includes(stack);

    if (isSelected) {
      setValue(
        "techStacks",
        watchedTechStacks.filter((item) => item !== stack),
        { shouldValidate: true },
      );
      return;
    }

    if (watchedTechStacks.length >= 3) {
      setErrorMessage("기술 스택은 최대 3개까지 선택할 수 있습니다.");
      return;
    }

    setErrorMessage(null);
    setValue("techStacks", [...watchedTechStacks, stack], { shouldValidate: true });
  };

  return (
    <MyPageShell activeSection="profile">
      <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-black md:text-[32px]">프로필 설정</h1>

            {isLoading ? <p className="mt-4 text-sm text-[#94a3b8]">프로필 정보를 불러오는 중...</p> : null}
            {isSetupRequired ? (
              <p className="mt-4 text-sm text-[#589bea]">임시 계정 상태입니다. 프로필 설정을 완료하면 정상 계정으로 전환됩니다.</p>
            ) : null}
            {otherError ? <p className="mt-4 text-sm text-red-600">{otherError}</p> : null}
            {validationMessage ? <p className="mt-4 text-sm text-red-600">{validationMessage}</p> : null}
            {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
            {successMessage ? <p className="mt-4 text-sm text-green-600">{successMessage}</p> : null}

            <div className="mt-8 grid gap-7">
              <section className="rounded-2xl border border-[#dee2e6] bg-white px-6 py-7 md:px-9 md:py-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-[#1e293b]">내 프로필</h2>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setIsEditing(false);
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            if (profile) {
                              reset({
                                nickname: profile.nickname || "dummy",
                                studentId: profile.studentId || "",
                                department: profile.department || "",
                                profilePicture: resolveProfileImageUrl(profile.profilePicture),
                                track: (profile.track as ProfileTrack | undefined) || "BACKEND",
                                techStacks: (profile.techStacks as ProfileTechStack[] | undefined) || [],
                                interests: (profile.interests as ProfileInterest[] | undefined) || [],
                              });
                            }
                          }}
                        >
                          취소
                        </button>
                        <button
                          className="rounded border border-[var(--color-primary-main)] bg-[var(--color-primary-main)] px-4 py-1.5 text-sm text-[#f7faff] disabled:opacity-70"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "저장 중..." : "저장"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                      >
                        수정
                      </button>
                    )}
                  </div>

                  <div className="mt-7 grid gap-6">
                    <div className="grid gap-3 md:grid-cols-[128px_minmax(0,1fr)] md:items-center">
                      <div className="text-[15px] font-medium leading-6 text-[#1e293b]">프로필 사진</div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        <img className="size-24 rounded-full border border-[#e7ecf2] object-cover" src={profileImage} alt="프로필 사진" />
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            <button
                              className="w-fit rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                              type="button"
                              onClick={() => setValue("profilePicture", DEFAULT_PROFILE_IMAGE)}
                            >
                              삭제
                            </button>
                            <input
                              className="h-11 w-full max-w-[440px] rounded-lg border border-[#dee2e6] px-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              placeholder="https://example.com/profile.png"
                              disabled={isSubmitting}
                              {...register("profilePicture")}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <ProfileField
                      label="닉네임"
                      required
                      value={
                        isEditing ? (
                          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
                            <input
                              className="h-11 min-w-0 flex-1 rounded-lg border border-[#dee2e6] px-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              disabled={isSubmitting}
                              {...register("nickname", {
                                required: "닉네임을 입력해주세요.",
                              })}
                            />
                            <button
                              className="h-11 shrink-0 rounded-lg bg-[var(--color-primary-main)] px-4 text-sm font-medium text-[#f7faff]"
                              type="button"
                            >
                              중복 확인
                            </button>
                          </div>
                        ) : (
                          profile?.nickname || "dummy"
                        )
                      }
                    />

                    <ProfileField
                      label="트랙"
                      required
                      value={
                        isEditing ? (
                          <div className="flex w-full flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {trackOptions.map((option) => {
                                const isActive = watchedTrack === option.value;

                                if (!isActive) {
                                  return null;
                                }

                                return (
                                  <button
                                    key={option.value}
                                    className="flex items-center gap-2 rounded-lg bg-[#dee2e6] px-4 py-2 text-[15px] font-semibold text-[#475569]"
                                    type="button"
                                    onClick={() => setValue("track", "BACKEND", { shouldValidate: true })}
                                  >
                                    {option.label}
                                    <X className="size-3.5" />
                                  </button>
                                );
                              })}
                              <button className="rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]" type="button">
                                + 추가
                              </button>
                            </div>
                            <div className="flex items-start gap-1 text-sm text-[#94a3b8]">
                              <Info className="mt-0.5 size-4" />
                              <span>가장 먼저 선택한 트랙이 대표 트랙으로 설정돼요.</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {trackOptions.map((option) => {
                                const isActive = watchedTrack === option.value;

                                if (isActive) {
                                  return null;
                                }

                                return (
                                  <button
                                    key={option.value}
                                    className="rounded-lg bg-[#f8fafc] px-4 py-2 text-[15px] font-semibold text-[#475569]"
                                    type="button"
                                    onClick={() => setValue("track", option.value, { shouldValidate: true })}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-lg bg-[#dee2e6] px-4 py-2 text-[15px] font-semibold text-[#475569]">
                              {mapTrackLabel(profile?.track)}
                            </span>
                          </div>
                        )
                      }
                    />

                    <ProfileField
                      label="학과"
                      required
                      value={
                        isEditing ? (
                          <div className="relative w-full">
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
                            <input
                              className="h-11 w-full rounded-lg border border-[#dee2e6] pl-10 pr-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              disabled={isSubmitting}
                              {...register("department", {
                                required: "학과를 입력해주세요.",
                              })}
                            />
                          </div>
                        ) : (
                          profile?.department || "미설정"
                        )
                      }
                    />

                    <ProfileField
                      label="학번"
                      required
                      value={
                        isEditing ? (
                          <div className="flex items-center gap-3">
                            <input
                              className="h-11 w-16 rounded-lg border border-[#dee2e6] px-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              maxLength={2}
                              disabled={isSubmitting}
                              value={watchedStudentId.slice(0, 2)}
                              onChange={(event) => {
                                const nextYear = event.target.value.replace(/\D/g, "").slice(0, 2);
                                const rest = watchedStudentId.slice(2).replace(/\D/g, "");
                                setValue("studentId", `${nextYear}${rest}`, { shouldValidate: true });
                              }}
                            />
                            <span className="text-[15px] font-semibold text-[#1e293b]">학번</span>
                          </div>
                        ) : (
                          profile?.studentId || "미설정"
                        )
                      }
                    />

                    <ProfileField
                      label="기술 스택"
                      required
                      value={
                        isEditing ? (
                          <div className="flex w-full flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap gap-2">
                                {watchedTechStacks.map((stack) => (
                                  <button
                                    key={stack}
                                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[15px] font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                                    type="button"
                                    onClick={() =>
                                      setValue(
                                        "techStacks",
                                        watchedTechStacks.filter((item) => item !== stack),
                                        { shouldValidate: true },
                                      )
                                    }
                                  >
                                    {mapTechStackLabel(stack)}
                                    <X className="size-3.5" />
                                  </button>
                                ))}
                              </div>
                              <button
                                className="shrink-0 rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                                type="button"
                                onClick={() => {
                                  setIsTechStackModalOpen(true);
                                  setTechStackSearchValue("");
                                  setErrorMessage(null);
                                }}
                              >
                                + 추가
                              </button>
                            </div>
                            <div className="flex items-start gap-1 text-sm text-[#94a3b8]">
                              <Info className="mt-0.5 size-4" />
                              <span>최대 3개까지 선택할 수 있어요.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(profile?.techStacks?.length ? profile.techStacks : ["등록 전"]).map((stack) => (
                              <span
                                key={stack}
                                className="rounded-lg bg-white px-4 py-2 text-[15px] font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                              >
                                {mapTechStackLabel(stack)}
                              </span>
                            ))}
                          </div>
                        )
                      }
                    />

                    <ProfileField
                      label="관심사"
                      value={
                        isEditing ? (
                          <div className="flex w-full flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              {watchedInterests.map((interest) => (
                                <button
                                  key={interest}
                                  className="flex items-center gap-2 rounded-lg bg-[#dee2e6] px-4 py-2 text-[15px] font-semibold text-[#475569]"
                                  type="button"
                                  onClick={() =>
                                    setValue(
                                      "interests",
                                      watchedInterests.filter((item) => item !== interest),
                                      { shouldValidate: true },
                                    )
                                  }
                                >
                                  {mapInterestLabel(interest)}
                                  <X className="size-3.5" />
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {interestOptions
                                .filter((interest) => !watchedInterests.includes(interest))
                                .map((interest) => (
                                  <button
                                    key={interest}
                                    className="rounded-lg bg-[#f8fafc] px-4 py-2 text-[15px] font-semibold text-[#475569]"
                                    type="button"
                                    onClick={() => setValue("interests", [...watchedInterests, interest], { shouldValidate: true })}
                                  >
                                    {mapInterestLabel(interest)}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ) : profile?.interests?.length ? (
                          profile.interests.map(mapInterestLabel).join(", ")
                        ) : (
                          getProfileSummary(profile || dummyProfile)
                        )
                      }
                    />
                  </div>
                </form>
              </section>

              <section className="rounded-2xl border border-[#dee2e6] bg-white px-6 py-7 md:px-9 md:py-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-[#1e293b]">기본 정보</h2>
                </div>

                <div className="mt-7 grid gap-6">
                  <ProfileField label="학교 이메일" value={profile?.email || "미등록"} />

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <ProfileField label="비밀번호" value="**************" />
                    {isPasswordEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="w-fit rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                          type="button"
                          onClick={() => {
                            setIsPasswordEditing(false);
                            resetPasswordForm();
                          }}
                        >
                          취소
                        </button>
                        <button
                          className="w-fit rounded border border-[#d8dee6] bg-[#eef2f6] px-4 py-1.5 text-sm text-[#94a3b8] disabled:cursor-not-allowed"
                          type="button"
                          disabled={!isPasswordFormValid}
                          onClick={() => {
                            setSuccessMessage(null);
                            setErrorMessage("비밀번호 변경 API가 아직 연결되지 않았습니다.");
                          }}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-fit rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                        type="button"
                        onClick={() => {
                          setIsPasswordEditing(true);
                          resetPasswordForm();
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                      >
                        수정
                      </button>
                    )}
                  </div>

                  {isPasswordEditing ? (
                    <div className="grid gap-5 rounded-2xl border border-[#eef2f6] bg-[#fcfdff] p-5 md:ml-[128px] md:p-6">
                      <div className="grid gap-[10px]">
                        <label className="relative">
                          <input
                            className="h-14 w-full rounded-[20px] border border-[#d9e1ea] bg-white px-5 pr-14 text-[16px] text-[#1e293b] outline-none placeholder:text-[#b6c0cc]"
                            placeholder="현재 비밀번호"
                            type={isCurrentPasswordVisible ? "text" : "password"}
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                          />
                          <button
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#475569]"
                            type="button"
                            onClick={() => setIsCurrentPasswordVisible((previous) => !previous)}
                          >
                            {isCurrentPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </label>
                        <PasswordRequirement label="확인을 위해 현재 비밀번호를 다시 입력해 주세요." isValid={isCurrentPasswordEntered} />
                      </div>

                      <div className="grid gap-[10px]">
                        <label className="relative">
                          <input
                            className="h-14 w-full rounded-[20px] border border-[#d9e1ea] bg-white px-5 pr-14 text-[16px] text-[#1e293b] outline-none placeholder:text-[#b6c0cc]"
                            placeholder="새 비밀번호"
                            type={isNewPasswordVisible ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                          />
                          <button
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#475569]"
                            type="button"
                            onClick={() => setIsNewPasswordVisible((previous) => !previous)}
                          >
                            {isNewPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </label>

                        <div className="grid gap-2">
                          {passwordRequirements.map((requirement) => (
                            <PasswordRequirement key={requirement.label} label={requirement.label} isValid={requirement.isValid} />
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-[10px]">
                        <label className="relative">
                          <input
                            className="h-14 w-full rounded-[20px] border border-[#d9e1ea] bg-white px-5 pr-14 text-[16px] text-[#1e293b] outline-none placeholder:text-[#b6c0cc]"
                            placeholder="새 비밀번호 확인"
                            type={isConfirmNewPasswordVisible ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(event) => setConfirmNewPassword(event.target.value)}
                          />
                          <button
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#475569]"
                            type="button"
                            onClick={() => setIsConfirmNewPasswordVisible((previous) => !previous)}
                          >
                            {isConfirmNewPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </label>
                        <PasswordRequirement label="확인을 위해 새 비밀번호를 다시 입력해 주세요." isValid={isConfirmPasswordMatched} />
                      </div>

                      <div className="text-sm text-[#94a3b8]">비밀번호 변경 저장은 API 연동 후 활성화됩니다.</div>
                    </div>
                  ) : null}

                  <div className="text-[15px] font-medium leading-6 text-[#1e293b]">소셜 로그인 연동 관리</div>

                  <div className="grid gap-3">
                    <SocialLoginRow badge="GH" label={profile?.email || "미등록"} actionLabel="연동 해제하기" />
                    <SocialLoginRow badge="G" label={profile?.email || "미등록"} actionLabel="연동 해제하기" />
                    <SocialLoginRow badge="K" label="연동되지 않음" actionLabel="연동하기" actionVariant="primary" />
                    <SocialLoginRow badge="N" label="연동되지 않음" actionLabel="연동하기" actionVariant="primary" />
                  </div>
                </div>
              </section>
            </div>
      </div>

      <TechStackModal
        isOpen={isTechStackModalOpen}
        selectedStacks={watchedTechStacks}
        searchValue={techStackSearchValue}
        filteredStacks={filteredTechStackOptions}
        onSearchChange={setTechStackSearchValue}
        onToggleStack={toggleTechStack}
        onClose={() => {
          setIsTechStackModalOpen(false);
          setTechStackSearchValue("");
        }}
      />
    </MyPageShell>
  );
}
