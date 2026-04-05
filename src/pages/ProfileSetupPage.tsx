
import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Check, Crown, Eye, EyeOff, Info, Search, X } from "lucide-react";
import { changePassword, connectSocialLogin } from "../api/auth";
import type { SocialAuthProvider } from "../api/auth";
import { searchDepartmentNames } from "../api/departments";
import { uploadProfileImage } from "../api/files";
import { MyPageShell } from "../components/MyPageShell";
import { getCurrentUser, ProfileRequestError, submitProfileSetup, updateMyProfile } from "../api/profile";
import type { CurrentUserResponse } from "../api/profile";
import type { ProfileSetupRequest, ProfileTechStack, ProfileTrack } from "../types/profile";

const DEFAULT_PROFILE_IMAGE = "/default_profile.png";

const trackOptions: Array<{ label: string; value: ProfileTrack }> = [
  { label: "백엔드", value: "BACKEND" },
  { label: "프론트엔드", value: "FRONTEND" },
  { label: "AI", value: "AI" },
  { label: "디자인", value: "DESIGN" },
];

const techStackOptions: ProfileTechStack[] = ["JAVA", "SPRING_BOOT", "REACT", "PYTHON", "DJANGO", "MYSQL", "AWS", "DOCKER"];
interface ProfileFormValues {
  nickname: string;
  studentId: string;
  department: string;
  departmentId: number;
  profilePicture: string;
  trackNames: ProfileTrack[];
  techStacks: ProfileTechStack[];
  introduction: string;
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

function normalizeProfilePicturePayload(value?: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue || normalizedValue === DEFAULT_PROFILE_IMAGE) {
    return "";
  }

  return normalizedValue;
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

function mapTechStackLabel(stack: ProfileTechStack | string) {
  switch (stack) {
    case "SPRING_BOOT":
      return "SpringBoot";
    case "MYSQL":
      return "MySQL";
    default:
      return stack;
  }
}

function getProfileSummary(user: CurrentUserResponse) {
  if (user.isDummyProfile) {
    return "프로필 설정을 완료하면 임시 계정 상태가 해제됩니다.";
  }

  if (user.introduction?.trim()) {
    return user.introduction;
  }

  return "아직 등록된 자기소개가 없습니다.";
}

function normalizeTrack(track?: string | null): ProfileTrack | null {
  const normalizedTrack = track?.trim().toUpperCase();

  switch (normalizedTrack) {
    case "BACKEND":
    case "백엔드":
      return "BACKEND";
    case "FRONTEND":
    case "프론트엔드":
      return "FRONTEND";
    case "AI":
      return "AI";
    case "DESIGN":
    case "디자인":
      return "DESIGN";
    default:
      return null;
  }
}

function getCurrentTracks(profile: CurrentUserResponse | null) {
  if (!profile) {
    return ["BACKEND"] as ProfileTrack[];
  }

  const rawTracks = profile.trackNames?.length ? profile.trackNames : profile.track ? [profile.track] : [];
  const normalizedTracks = rawTracks
    .map((track) => normalizeTrack(track))
    .filter((track): track is ProfileTrack => track !== null);

  if (normalizedTracks.length) {
    return normalizedTracks;
  }

  return profile.isDummyProfile ? (["BACKEND"] as ProfileTrack[]) : [];
}

function getCurrentTechStacks(profile: CurrentUserResponse | null) {
  return ((profile?.techStackNames ?? profile?.techStacks) as ProfileTechStack[] | undefined) || [];
}

function getCurrentDepartmentName(profile: CurrentUserResponse | null) {
  return profile?.department?.trim() || profile?.departmentName?.trim() || "";
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

function TrackChip({
  track,
  isPrimary = false,
  onRemove,
}: {
  track: ProfileTrack;
  isPrimary?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="relative">
      {isPrimary ? (
        <div className="absolute -right-1 -top-2 z-10 flex size-6 items-center justify-center rounded-full bg-[#f4b000] shadow-[0_4px_10px_rgba(244,176,0,0.28)]">
          <Crown className="size-3.5 fill-white text-white" strokeWidth={2.2} />
        </div>
      ) : null}

      {onRemove ? (
        <button
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-semibold shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] ${
            isPrimary ? "bg-[#d8dde4] text-[#44566c]" : "bg-[#e6eaef] text-[#5b6b80]"
          }`}
          type="button"
          onClick={onRemove}
        >
          {mapTrackLabel(track)}
          <X className="size-3.5" />
        </button>
      ) : (
        <span
          className={`inline-flex rounded-lg px-4 py-2 text-[15px] font-semibold shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] ${
            isPrimary ? "bg-[#d8dde4] text-[#44566c]" : "bg-[#e6eaef] text-[#5b6b80]"
          }`}
        >
          {mapTrackLabel(track)}
        </span>
      )}
    </div>
  );
}

function SocialLoginRow({
  provider,
  iconSrc,
  label,
  isConnected = false,
  actionLabel,
  onAction,
  disabled = false,
}: {
  provider: string;
  iconSrc: string;
  label: string;
  isConnected?: boolean;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-[36px] w-[68px] items-center justify-center rounded-[4px]">
          <img className="h-full w-full object-contain" src={iconSrc} alt={`${provider} 로그인`} />
        </div>
        <span className={`text-[15px] leading-6 ${isConnected ? "text-[#1e293b]" : "text-[#94a3b8]"}`}>{label}</span>
      </div>

      <button
        className="min-w-20 rounded-[4px] border border-[var(--color-primary-main)] bg-[var(--color-primary-main)] px-4 py-1.5 text-sm font-medium text-[#f7faff] transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:cursor-not-allowed disabled:border-[var(--color-primary-main)] disabled:bg-[var(--color-primary-main)] disabled:opacity-70"
        type="button"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function PasswordRequirement({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[15px] leading-6 ${isValid ? "text-[#34a853]" : "text-[#ea4335]"}`}>
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
      <div className="flex max-h-[min(760px,calc(100vh-48px))] w-full max-w-[860px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
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
                className="rounded-lg bg-[#506987] px-5 py-3 text-[16px] font-medium text-white"
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
              className="mt-5 h-14 w-full rounded-lg border-[3px] border-[#111111] px-5 text-[20px] text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              type="text"
              placeholder="기술 스택을 검색해 주세요."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-lg border border-[#eef2f6] bg-white">
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

function TrackModal({
  isOpen,
  selectedTracks,
  searchValue,
  filteredTracks,
  onSearchChange,
  onToggleTrack,
  onClose,
}: {
  isOpen: boolean;
  selectedTracks: ProfileTrack[];
  searchValue: string;
  filteredTracks: Array<{ label: string; value: ProfileTrack }>;
  onSearchChange: (value: string) => void;
  onToggleTrack: (track: ProfileTrack) => void;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6">
      <div className="flex max-h-[min(760px,calc(100vh-48px))] w-full max-w-[720px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#e9eef5] px-8 py-6">
          <h3 className="text-[20px] font-semibold text-[#13304f]">트랙 선택</h3>
          <button className="rounded-full p-2 text-[#94a3b8] transition hover:bg-[#f8fafc]" type="button" onClick={onClose}>
            <X className="size-7" strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-8">
          <div className="text-[18px] font-semibold text-[#13304f]">트랙을 추가하고 순서를 정하세요.</div>

          <div className="mt-6 flex flex-wrap gap-3">
            {selectedTracks.length ? (
              selectedTracks.map((track) => (
                <button
                  key={track}
                  className="flex items-center gap-2 rounded-lg bg-[#506987] px-5 py-3 text-[16px] font-medium text-white"
                  type="button"
                  onClick={() => onToggleTrack(track)}
                >
                  {mapTrackLabel(track)}
                  <X className="size-4" strokeWidth={2} />
                </button>
              ))
            ) : (
              <div className="text-[15px] text-[#94a3b8]">아직 선택된 트랙이 없습니다.</div>
            )}
          </div>

          <div className="mt-12">
            <div className="text-[16px] font-semibold text-[#111827]">다른 트랙 선택</div>
            <input
              className="mt-5 h-14 w-full rounded-lg border-[3px] border-[#111111] px-5 text-[20px] text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              type="text"
              placeholder="트랙을 검색해 주세요."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-lg border border-[#eef2f6] bg-white">
              {filteredTracks.length ? (
                filteredTracks.map((track) => (
                  <button
                    key={track.value}
                    className={`flex w-full items-center justify-between border-b border-[#eef2f6] px-6 py-5 text-left text-[18px] text-[#0f172a] last:border-b-0 ${
                      selectedTracks.includes(track.value) ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                    }`}
                    type="button"
                    onClick={() => onToggleTrack(track.value)}
                  >
                    <span>{track.label}</span>
                    {selectedTracks.includes(track.value) ? <Check className="size-5 text-[var(--color-primary-main)]" strokeWidth={2.3} /> : null}
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
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [trackSearchValue, setTrackSearchValue] = useState("");
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
  const [isDepartmentInputFocused, setIsDepartmentInputFocused] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [pendingSocialProvider, setPendingSocialProvider] = useState<SocialAuthProvider | null>(null);
  const [departmentSearchKeyword, setDepartmentSearchKeyword] = useState("");
  const {
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      nickname: "",
      studentId: "",
      department: "",
      departmentId: 0,
      profilePicture: "",
      trackNames: ["BACKEND"],
      techStacks: [],
      introduction: "",
    },
  });

  useEffect(() => {
    register("trackNames", {
      validate: (value) => (value?.length ? true : "트랙을 선택해주세요."),
    });
    register("techStacks");
    register("departmentId");
  }, [register]);

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data;
      } catch (error) {
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
    mutationFn: (payload: ProfileSetupRequest) => {
      if (profile?.isDummyProfile) {
        return submitProfileSetup(payload);
      }

      return updateMyProfile(payload);
    },
    onSuccess: (result, variables) => {
      setSuccessMessage(result.message || "프로필 설정이 저장되었습니다.");
      setErrorMessage(null);
      setIsEditing(false);
      const nextProfile = {
        ...(profile ?? {}),
        nickname: variables.nickname,
        studentId: variables.studentId,
        departmentId: variables.departmentId,
        department: watchedDepartment.trim(),
        departmentName: watchedDepartment.trim(),
        profileImage: variables.profilePicture,
        profilePicture: variables.profilePicture,
        profileImgUrl: variables.profilePicture,
        trackNames: variables.trackNames,
        track: variables.trackNames[0],
        techStackNames: variables.techStackNames,
        techStacks: variables.techStackNames,
        introduction: variables.introduction,
        authority: "USER",
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
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      setErrorMessage(null);
      setSuccessMessage(result.message || "비밀번호가 변경되었습니다.");
      setIsPasswordEditing(false);
      resetPasswordForm();
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "비밀번호 변경 중 오류가 발생했습니다.");
    },
  });

  useEffect(() => {
    if (!currentUserQuery.isLoading && currentUserQuery.data === null) {
      window.location.replace("/login");
    }
  }, [currentUserQuery.data, currentUserQuery.isLoading]);

  const profile = profileOverride ?? currentUserQuery.data ?? null;

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      nickname: profile.nickname || "dummy",
      studentId: profile.studentId || "",
      departmentId: profile.departmentId || 0,
      department: getCurrentDepartmentName(profile),
      profilePicture: normalizeProfilePicturePayload(profile.profileImage || profile.profilePicture),
      trackNames: getCurrentTracks(profile),
      techStacks: getCurrentTechStacks(profile),
      introduction: profile.introduction || "",
    });
  }, [profile, reset]);

  const watchedProfilePicture = useWatch({ control, name: "profilePicture" });
  const handleSocialConnect = (provider: SocialAuthProvider) => {
    setPendingSocialProvider(provider);
    setErrorMessage(null);
    setSuccessMessage(null);
    connectSocialLogin(provider);
  };
  const watchedTrackNames = useWatch({ control, name: "trackNames" }) ?? [];
  const watchedTechStacks = useWatch({ control, name: "techStacks" }) ?? [];
  const watchedStudentId = useWatch({ control, name: "studentId" }) ?? "";
  const watchedDepartment = useWatch({ control, name: "department" }) ?? "";
  const watchedDepartmentId = useWatch({ control, name: "departmentId" }) ?? 0;
  const watchedIntroduction = useWatch({ control, name: "introduction" }) ?? "";

  const profileImage = resolveProfileImageUrl(watchedProfilePicture || profile?.profileImage || profile?.profilePicture);
  const filteredTrackOptions = trackOptions.filter((option) =>
    option.label.toLowerCase().includes(trackSearchValue.trim().toLowerCase()),
  );
  const filteredTechStackOptions = techStackOptions.filter((stack) =>
    mapTechStackLabel(stack).toLowerCase().includes(techStackSearchValue.trim().toLowerCase()),
  );
  const socialAccountByProvider = new Map((profile?.socialAccounts ?? []).map((account) => [account.provider, account]));
  const departmentSearchQuery = useQuery({
    queryKey: ["department-search", departmentSearchKeyword],
    queryFn: () => searchDepartmentNames(departmentSearchKeyword),
    enabled: isEditing && isDepartmentInputFocused && departmentSearchKeyword.length > 0,
    staleTime: 1000 * 60 * 10,
  });
  const departmentOptions = departmentSearchQuery.data ?? [];
  const shouldShowDepartmentSuggestions =
    isEditing &&
    isDepartmentInputFocused &&
    departmentSearchKeyword.length > 0 &&
    (departmentSearchQuery.isPending || departmentSearchQuery.isError || departmentOptions.length > 0);
  const newPasswordCategoryCount = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9\s]/].filter((pattern) => pattern.test(newPassword)).length;
  const passwordRequirements = [
    { label: "영문/숫자/특수문자 중, 2가지 이상 포함", isValid: newPasswordCategoryCount >= 2 },
    { label: "8자 이상 32자 이하 입력 (공백 제외)", isValid: /^\S{8,32}$/.test(newPassword) },
    { label: "연속 3자 이상 동일한 문자/숫자 제외", isValid: !/(.)\1\1/.test(newPassword) },
  ];
  const isCurrentPasswordEntered = currentPassword.trim().length > 0;
  const isNewPasswordValid = newPassword.length > 0 && passwordRequirements.every((requirement) => requirement.isValid);
  const isConfirmPasswordMatched = confirmNewPassword.length > 0 && confirmNewPassword === newPassword;
  const currentPasswordInputClassName =
    currentPassword.length === 0
      ? "border-[#d9e1ea] text-[#1e293b] focus:border-[#5E9CE6]"
      : isCurrentPasswordEntered
        ? "border-[#34a853] text-[#1e293b] focus:border-[#34a853]"
        : "border-[#ea4335] text-[#1e293b] focus:border-[#ea4335]";
  const newPasswordInputClassName =
    newPassword.length === 0
      ? "border-[#d9e1ea] text-[#1e293b] focus:border-[#5E9CE6]"
      : isNewPasswordValid
        ? "border-[#34a853] text-[#1e293b] focus:border-[#34a853]"
        : "border-[#ea4335] text-[#1e293b] focus:border-[#ea4335]";
  const confirmNewPasswordInputClassName =
    confirmNewPassword.length === 0
      ? "border-[#d9e1ea] text-[#1e293b] focus:border-[#5E9CE6]"
      : isConfirmPasswordMatched
        ? "border-[#34a853] text-[#1e293b] focus:border-[#34a853]"
        : "border-[#ea4335] text-[#1e293b] focus:border-[#ea4335]";
  const isPasswordFormValid = isCurrentPasswordEntered && passwordRequirements.every((requirement) => requirement.isValid) && isConfirmPasswordMatched;
  const isLoading = currentUserQuery.isLoading;
  const isSetupRequired = Boolean(profile?.isDummyProfile);
  const isSubmitting = profileSetupMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;
  const isProfileActionDisabled = isSubmitting || isUploadingProfileImage;
  const isPasswordActionDisabled = isChangingPassword || !isPasswordFormValid;
  const otherError =
    currentUserQuery.error instanceof ProfileRequestError &&
    currentUserQuery.error.status !== 401 &&
    currentUserQuery.error.status !== 403
      ? currentUserQuery.error.message
      : null;

  const onSubmit = async (form: ProfileFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (form.departmentId <= 0) {
      setErrorMessage("학과를 검색 결과에서 선택해주세요.");
      return;
    }

    const payload: ProfileSetupRequest = {
      nickname: form.nickname.trim(),
      studentId: form.studentId.trim(),
      departmentId: form.departmentId,
      profilePicture: normalizeProfilePicturePayload(form.profilePicture),
      trackNames: form.trackNames,
      techStackNames: form.techStacks,
      introduction: form.introduction.trim(),
    };

    await profileSetupMutation.mutateAsync(payload);
  };

  const validationMessage =
    errors.nickname?.message ||
    errors.studentId?.message ||
    errors.department?.message ||
    errors.departmentId?.message ||
    errors.profilePicture?.message ||
    errors.trackNames?.message ||
    errors.techStacks?.message ||
    errors.introduction?.message;

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsCurrentPasswordVisible(false);
    setIsNewPasswordVisible(false);
    setIsConfirmNewPasswordVisible(false);
  };

  const handlePasswordChange = async () => {
    if (isPasswordActionDisabled) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    await changePasswordMutation.mutateAsync({
      oldPassword: currentPassword,
      newPassword,
    });
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

  const toggleTrack = (track: ProfileTrack) => {
    const isSelected = watchedTrackNames.includes(track);

    if (isSelected) {
      setValue(
        "trackNames",
        watchedTrackNames.filter((item) => item !== track),
        { shouldValidate: true },
      );
      return;
    }

    setValue("trackNames", [...watchedTrackNames, track], { shouldValidate: true });
  };

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploadingProfileImage(true);

    try {
      const uploadedFile = await uploadProfileImage(file);
      setValue("profilePicture", uploadedFile.resolvedUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setSuccessMessage("프로필 사진이 업로드되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로필 사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = "";
    }
  };

  const departmentField = register("department", {
    required: "학과를 입력해주세요.",
    validate: () => {
      if (watchedDepartmentId > 0) {
        return true;
      }

      return "학과를 검색 결과에서 선택해주세요.";
    },
  });

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
                          disabled={isProfileActionDisabled}
                          onClick={() => {
                            setIsEditing(false);
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            if (profile) {
                              reset({
                                nickname: profile.nickname || "dummy",
                                studentId: profile.studentId || "",
                                departmentId: profile.departmentId || 0,
                                department: getCurrentDepartmentName(profile),
                                profilePicture: normalizeProfilePicturePayload(profile.profileImage || profile.profilePicture),
                                trackNames: getCurrentTracks(profile),
                                techStacks: getCurrentTechStacks(profile),
                                introduction: profile.introduction || "",
                              });
                            }
                          }}
                        >
                          취소
                        </button>
                        <button
                          className="rounded border border-[var(--color-primary-main)] bg-[var(--color-primary-main)] px-4 py-1.5 text-sm text-[#f7faff] disabled:opacity-70"
                          type="submit"
                          disabled={isProfileActionDisabled}
                        >
                          {isUploadingProfileImage ? "이미지 업로드 중..." : isSubmitting ? "저장 중..." : "저장"}
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
                          reset({
                            nickname: profile?.nickname || "dummy",
                            studentId: profile?.studentId || "",
                            departmentId: 0,
                            department: "",
                            profilePicture: normalizeProfilePicturePayload(profile?.profileImage || profile?.profilePicture),
                            trackNames: getCurrentTracks(profile),
                            techStacks: getCurrentTechStacks(profile),
                            introduction: profile?.introduction || "",
                          });
                          setDepartmentSearchKeyword("");
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
                            <label className="w-fit cursor-pointer rounded-[4px] border border-[var(--color-primary-main)] bg-[var(--color-primary-main)] px-4 py-1.5 text-sm text-[#f7faff]">
                              {isUploadingProfileImage ? "업로드 중..." : "이미지 업로드"}
                              <input
                                className="hidden"
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                disabled={isProfileActionDisabled}
                                onChange={handleProfileImageChange}
                              />
                            </label>
                            <button
                              className="w-fit rounded-[4px] border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                              type="button"
                              disabled={isProfileActionDisabled}
                              onClick={() =>
                                setValue("profilePicture", "", {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            >
                              삭제
                            </button>
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
                              className="h-10 min-w-0 flex-1 rounded-[4px] border border-[#dee2e6] px-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              disabled={isSubmitting}
                              {...register("nickname", {
                                required: "닉네임을 입력해주세요.",
                              })}
                            />
                            <button
                              className="h-10 shrink-0 rounded-[4px] bg-[var(--color-primary-main)] px-4 text-sm font-medium text-[#f7faff]"
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
                          <div className="-mt-2 -ml-5 flex w-full flex-col gap-2 pl-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap gap-2">
                                {watchedTrackNames.map((track, index) => (
                                  <TrackChip
                                    key={track}
                                    track={track}
                                    isPrimary={index === 0}
                                    onRemove={() => toggleTrack(track)}
                                  />
                                ))}
                              </div>
                              <button
                                className="shrink-0 rounded border border-[#dee2e6] px-4 py-1.5 text-sm text-[#1e293b]"
                                type="button"
                                onClick={() => {
                                  setIsTrackModalOpen(true);
                                  setTrackSearchValue("");
                                }}
                              >
                                + 추가
                              </button>
                            </div>
                            <div className="flex items-start gap-1 text-sm text-[#94a3b8]">
                              <Info className="mt-0.5 size-4" />
                              <span>가장 먼저 선택한 트랙이 대표 트랙으로 설정돼요.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="-mt-2.5 -ml-5 flex flex-wrap gap-2 pl-5">
                            {getCurrentTracks(profile).length ? (
                              getCurrentTracks(profile).map((track, index) => (
                                <TrackChip key={track} track={track} isPrimary={index === 0} />
                              ))
                            ) : (
                              <span className="text-[15px] font-semibold text-[#94a3b8]">미설정</span>
                            )}
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
                              className="h-10 w-full rounded-[4px] border border-[#dee2e6] pl-10 pr-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              disabled={isSubmitting}
                              autoComplete="off"
                              {...departmentField}
                              onFocus={() => setIsDepartmentInputFocused(true)}
                              onBlur={() => {
                                window.setTimeout(() => {
                                  setIsDepartmentInputFocused(false);
                                }, 100);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== "Enter") {
                                  return;
                                }

                                event.preventDefault();
                                const trimmedDepartment = watchedDepartment.trim();

                                if (!trimmedDepartment) {
                                  setDepartmentSearchKeyword("");
                                  return;
                                }

                                setDepartmentSearchKeyword(trimmedDepartment);
                              }}
                              onChange={(event) => {
                                departmentField.onChange(event);
                                setDepartmentSearchKeyword("");
                                setValue("departmentId", 0, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                            {shouldShowDepartmentSuggestions ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[8px] border border-[#dee2e6] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                                {departmentSearchQuery.isPending ? (
                                  <div className="px-4 py-3 text-sm text-[#64748b]">학과를 검색하는 중...</div>
                                ) : null}
                                {departmentSearchQuery.isError ? (
                                  <div className="px-4 py-3 text-sm text-red-600">학과 목록을 불러오지 못했습니다.</div>
                                ) : null}
                                {!departmentSearchQuery.isPending && !departmentSearchQuery.isError && departmentOptions.length
                                  ? departmentOptions.map((departmentOption) => (
                                      <button
                                        key={departmentOption.id}
                                        className="flex w-full items-center px-4 py-3 text-left text-sm text-[#1e293b] hover:bg-[#f8fafc]"
                                        type="button"
                                        onMouseDown={(event) => {
                                          event.preventDefault();
                                          setValue("department", departmentOption.name, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          });
                                          setValue("departmentId", departmentOption.id, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          });
                                          setIsDepartmentInputFocused(false);
                                        }}
                                      >
                                        <div className="flex min-w-0 flex-col">
                                          <span className="text-xs font-medium text-[#94a3b8]">{departmentOption.college}</span>
                                          <span className="truncate text-sm text-[#1e293b]">{departmentOption.name}</span>
                                        </div>
                                      </button>
                                    ))
                                  : null}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          getCurrentDepartmentName(profile) || "미설정"
                        )
                      }
                    />

                    <ProfileField
                      label="학번"
                      required
                      value={
                        isEditing ? (
                          <div className="w-full">
                            <input
                              className="h-10 w-full max-w-[220px] rounded-[4px] border border-[#dee2e6] px-4 text-sm text-[#1e293b] outline-none"
                              type="text"
                              inputMode="numeric"
                              maxLength={9}
                              disabled={isSubmitting}
                              value={watchedStudentId}
                              onChange={(event) => {
                                const nextStudentId = event.target.value.replace(/\D/g, "").slice(0, 9);
                                setValue("studentId", nextStudentId, { shouldValidate: true });
                              }}
                            />
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
                                    className="flex items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-[15px] font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
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
                            {(getCurrentTechStacks(profile).length ? getCurrentTechStacks(profile) : ["등록 전"]).map((stack) => (
                              <span
                                key={stack}
                                className="rounded-[8px] bg-white px-4 py-2 text-[15px] font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                              >
                                {mapTechStackLabel(stack)}
                              </span>
                            ))}
                          </div>
                        )
                      }
                    />

                    <ProfileField
                      label="자기소개"
                      value={
                        isEditing ? (
                          <div className="w-full">
                            <textarea
                              className="min-h-[72px] w-full rounded-[4px] border border-[#dee2e6] px-4 py-3 text-sm font-medium leading-6 text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
                              placeholder="자신을 소개하는 문장을 입력해주세요."
                              maxLength={100}
                              disabled={isSubmitting}
                              {...register("introduction")}
                            />
                            <div className="mt-2 text-right text-xs font-medium text-[#94a3b8]">{watchedIntroduction.length}/100</div>
                          </div>
                        ) : (
                          <div className="max-w-[680px] font-semibold leading-6 text-[#1e293b]">
                            {profile ? getProfileSummary(profile) : "아직 등록된 자기소개가 없습니다."}
                          </div>
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
                          className="w-fit rounded border border-[var(--color-primary-main)] bg-[var(--color-primary-main)] px-4 py-1.5 text-sm text-[#f7faff] disabled:opacity-70"
                          type="button"
                          disabled={isPasswordActionDisabled}
                          onClick={handlePasswordChange}
                        >
                          {isChangingPassword ? "저장 중..." : "저장"}
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
                    <div className="grid gap-5 rounded-[16px] border border-[#eef2f6] bg-[#fcfdff] p-5 md:ml-[128px] md:p-6">
                      <div className="grid gap-[10px]">
                        <label className="relative">
                          <input
                            className={`h-12 w-full rounded-[4px] border bg-white px-4 pr-12 text-[16px] outline-none placeholder:text-[#b6c0cc] ${currentPasswordInputClassName}`}
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
                            className={`h-12 w-full rounded-[4px] border bg-white px-4 pr-12 text-[16px] outline-none placeholder:text-[#b6c0cc] ${newPasswordInputClassName}`}
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
                            className={`h-12 w-full rounded-[4px] border bg-white px-4 pr-12 text-[16px] outline-none placeholder:text-[#b6c0cc] ${confirmNewPasswordInputClassName}`}
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

                      <div className="text-sm text-[#94a3b8]">현재 비밀번호 확인 후 새 비밀번호로 변경됩니다.</div>
                    </div>
                  ) : null}

                  <div className="text-[15px] font-medium leading-6 text-[#1e293b]">소셜 로그인 연동 관리</div>

                  <div className="grid gap-3">
                    <SocialLoginRow
                      provider="GitHub"
                      iconSrc="/social/github.png"
                      label={socialAccountByProvider.get("github")?.email || (socialAccountByProvider.has("github") ? "연동됨" : "연동되지 않음")}
                      isConnected={socialAccountByProvider.has("github")}
                      actionLabel={socialAccountByProvider.has("github") ? "연동됨" : "연동하기"}
                      disabled={pendingSocialProvider !== null || socialAccountByProvider.has("github")}
                      onAction={() => handleSocialConnect("github")}
                    />
                    <SocialLoginRow
                      provider="Google"
                      iconSrc="/social/google.png"
                      label={socialAccountByProvider.get("google")?.email || (socialAccountByProvider.has("google") ? "연동됨" : "연동되지 않음")}
                      isConnected={socialAccountByProvider.has("google")}
                      actionLabel={socialAccountByProvider.has("google") ? "연동됨" : "연동하기"}
                      disabled={pendingSocialProvider !== null || socialAccountByProvider.has("google")}
                      onAction={() => handleSocialConnect("google")}
                    />
                    <SocialLoginRow
                      provider="Kakao"
                      iconSrc="/social/kakao.png"
                      label={socialAccountByProvider.get("kakao")?.email || (socialAccountByProvider.has("kakao") ? "연동됨" : "연동되지 않음")}
                      isConnected={socialAccountByProvider.has("kakao")}
                      actionLabel={socialAccountByProvider.has("kakao") ? "연동됨" : "연동하기"}
                      disabled={pendingSocialProvider !== null || socialAccountByProvider.has("kakao")}
                      onAction={() => handleSocialConnect("kakao")}
                    />
                    <SocialLoginRow
                      provider="Naver"
                      iconSrc="/social/naver.png"
                      label={socialAccountByProvider.get("naver")?.email || (socialAccountByProvider.has("naver") ? "연동됨" : "연동되지 않음")}
                      isConnected={socialAccountByProvider.has("naver")}
                      actionLabel={socialAccountByProvider.has("naver") ? "연동됨" : "연동하기"}
                      disabled={pendingSocialProvider !== null || socialAccountByProvider.has("naver")}
                      onAction={() => handleSocialConnect("naver")}
                    />
                  </div>
                </div>
              </section>
            </div>
      </div>

      <TrackModal
        isOpen={isTrackModalOpen}
        selectedTracks={watchedTrackNames}
        searchValue={trackSearchValue}
        filteredTracks={filteredTrackOptions}
        onSearchChange={setTrackSearchValue}
        onToggleTrack={toggleTrack}
        onClose={() => {
          setIsTrackModalOpen(false);
          setTrackSearchValue("");
        }}
      />

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
