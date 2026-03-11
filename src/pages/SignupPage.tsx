import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { sendEmailVerification, signUp, verifyEmailCode } from "../api/auth";

interface SignupFormValues {
  emailLocalPart: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  agreeAll: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

type SignupScreen = 1 | 2 | 3 | 4 | 5;

const EMAIL_DOMAIN = "@hufs.ac.kr";
const AUTH_CODE_LENGTH = 6;
const AUTH_CODE_INPUTS = Array.from({ length: AUTH_CODE_LENGTH }, (_, index) => index);
const STEP_TITLES = ["본인인증", "정보입력", "약관동의", "가입완료"] as const;
const DEFAULT_PROFILE_IMAGE = "/default_profile.png";
const SCREEN_TO_STEP: Record<SignupScreen, number> = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 4,
};
const STEP_TO_SCREEN: Record<number, SignupScreen> = {
  1: 1,
  2: 2,
  3: 4,
  4: 5,
};

const SCREEN_DESCRIPTION: Record<Exclude<SignupScreen, 5>, string> = {
  1: "HUFS 학교 이메일 인증을 통해 가입이 가능해요",
  2: "활동에 필요한 정보를 간단히 입력할게요",
  3: "활동에 필요한 정보를 간단히 입력할게요",
  4: "활동에 필요한 정보를 간단히 입력할게요",
};

function buildSchoolEmail(localPart: string) {
  return `${localPart.trim()}${EMAIL_DOMAIN}`;
}

function StepIndicator({
  currentScreen,
  onStepClick,
}: {
  currentScreen: SignupScreen;
  onStepClick: (step: number) => void;
}) {
  const activeStep = SCREEN_TO_STEP[currentScreen];

  return (
    <div className="mx-auto flex w-full max-w-[296px] items-start justify-between">
      {STEP_TITLES.map((title, index) => {
        const step = index + 1;
        const isActive = activeStep === step;
        const isCompleted = activeStep > step;
        const circleClassName = isActive || isCompleted ? "bg-[#5E9CE6] text-white" : "bg-[#dce5f0] text-[#93a6ba]";
        const lineClassName = activeStep > step ? "bg-[#5E9CE6]" : "bg-[#dce5f0]";
        const isClickable = isCompleted;

        return (
          <div key={title} className="relative flex w-[55px] flex-col items-center">
            {step < STEP_TITLES.length ? (
              <div className={`absolute left-[43px] top-[13px] h-[5px] w-[53px] rounded-full ${lineClassName}`} />
            ) : null}
            <button
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${circleClassName} ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
              type="button"
              onClick={() => {
                if (isClickable) {
                  onStepClick(step);
                }
              }}
              disabled={!isClickable}
            >
              {step}
            </button>
            <span className={`mt-3 text-xs ${isActive ? "text-[#5E9CE6]" : "text-[#93a6ba]"}`}>{title}</span>
          </div>
        );
      })}
    </div>
  );
}

function AuthCodeInput({
  values,
  disabled,
  inputRefs,
  onChange,
  onKeyDown,
}: {
  values: string[];
  disabled: boolean;
  inputRefs: RefObject<Array<HTMLInputElement | null>>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex w-full justify-between gap-[14px]">
      {AUTH_CODE_INPUTS.map((index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          className="h-12 w-[46px] rounded-xl border border-[#a8bfd9] bg-transparent text-center text-base font-semibold text-[#22324a] outline-none transition focus:border-[#5E9CE6]"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[index] ?? ""}
          disabled={disabled}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
        />
      ))}
    </div>
  );
}

function CheckboxRow({
  checked,
  label,
  actionLabel,
  onToggle,
}: {
  checked: boolean;
  label: string;
  actionLabel?: string;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex cursor-pointer items-center gap-[10px] text-sm text-[#5f7188]">
        <input
          className="peer sr-only"
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#a8bfd9] bg-white text-[10px] text-white peer-checked:border-[#5E9CE6] peer-checked:bg-[#5E9CE6]">
          {checked ? "✓" : ""}
        </span>
        <span>{label}</span>
      </label>
      {actionLabel ? (
        <button className="text-xs text-[#9aabbd]" type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<SignupScreen>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationTargetEmail, setVerificationTargetEmail] = useState<string | null>(null);
  const [isVerificationInputVisible, setIsVerificationInputVisible] = useState(false);
  const [authCodeDigits, setAuthCodeDigits] = useState<string[]>(Array.from({ length: AUTH_CODE_LENGTH }, () => ""));
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [nicknameCheckedValue, setNicknameCheckedValue] = useState("");
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>(DEFAULT_PROFILE_IMAGE);
  const authCodeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      emailLocalPart: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      agreeAll: false,
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  });

  const emailLocalPart = watch("emailLocalPart");
  const passwordValue = watch("password");
  const nicknameValue = watch("nickname");
  const agreeAll = watch("agreeAll");
  const agreeTerms = watch("agreeTerms");
  const agreePrivacy = watch("agreePrivacy");
  const agreeMarketing = watch("agreeMarketing");
  const schoolEmail = useMemo(() => buildSchoolEmail(emailLocalPart), [emailLocalPart]);

  useEffect(() => {
    const isEveryChecked = agreeTerms && agreePrivacy && agreeMarketing;
    if (agreeAll !== isEveryChecked) {
      setValue("agreeAll", isEveryChecked);
    }
  }, [agreeAll, agreeMarketing, agreePrivacy, agreeTerms, setValue]);

  useEffect(() => {
    if (!verificationTargetEmail) {
      return;
    }

    if (schoolEmail !== verificationTargetEmail) {
      setIsEmailVerified(false);
      setIsVerificationInputVisible(false);
      setAuthCodeDigits(Array.from({ length: AUTH_CODE_LENGTH }, () => ""));
      setVerificationTargetEmail(null);
    }
  }, [schoolEmail, verificationTargetEmail]);

  useEffect(() => {
    if (nicknameCheckedValue && nicknameCheckedValue !== nicknameValue.trim()) {
      setNicknameCheckedValue("");
    }
  }, [nicknameCheckedValue, nicknameValue]);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl && profilePreviewUrl !== DEFAULT_PROFILE_IMAGE) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

  const sendVerificationMutation = useMutation({
    mutationFn: sendEmailVerification,
  });
  const verifyCodeMutation = useMutation({
    mutationFn: verifyEmailCode,
  });
  const signUpMutation = useMutation({
    mutationFn: signUp,
  });

  const verificationCode = authCodeDigits.join("");
  const isSendingVerification = sendVerificationMutation.isPending;
  const isVerifyingCode = verifyCodeMutation.isPending;
  const isSigningUp = signUpMutation.isPending;
  const isNicknameChecked = nicknameCheckedValue.length > 0;

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const resetVerificationState = () => {
    setIsEmailVerified(false);
    setIsVerificationInputVisible(false);
    setVerificationTargetEmail(null);
    setAuthCodeDigits(Array.from({ length: AUTH_CODE_LENGTH }, () => ""));
  };

  const onToggleAllAgreements = (checked: boolean) => {
    setValue("agreeAll", checked);
    setValue("agreeTerms", checked);
    setValue("agreePrivacy", checked);
    setValue("agreeMarketing", checked);
  };

  const onChangeAuthCode = (index: number, rawValue: string) => {
    const nextValue = rawValue.replace(/\D/g, "");
    if (!nextValue) {
      setAuthCodeDigits((previous) => previous.map((digit, digitIndex) => (digitIndex === index ? "" : digit)));
      return;
    }

    const lastCharacter = nextValue.slice(-1);
    setAuthCodeDigits((previous) =>
      previous.map((digit, digitIndex) => (digitIndex === index ? lastCharacter : digit)),
    );

    if (index < AUTH_CODE_LENGTH - 1) {
      authCodeRefs.current[index + 1]?.focus();
    }
  };

  const onKeyDownAuthCode = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !authCodeDigits[index] && index > 0) {
      authCodeRefs.current[index - 1]?.focus();
    }
  };

  const onUploadProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      return;
    }

    if (profilePreviewUrl !== DEFAULT_PROFILE_IMAGE) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setProfilePreviewUrl(objectUrl);
  };

  const onClickSendVerification = async () => {
    clearMessages();

    const isEmailValid = await trigger("emailLocalPart");
    if (!isEmailValid) {
      return;
    }

    try {
      const response = await sendVerificationMutation.mutateAsync({ email: schoolEmail });
      setVerificationTargetEmail(schoolEmail);
      setIsEmailVerified(false);
      setIsVerificationInputVisible(true);
      setAuthCodeDigits(Array.from({ length: AUTH_CODE_LENGTH }, () => ""));
      setSuccessMessage(response.message || "인증번호가 전송되었습니다.");
      authCodeRefs.current[0]?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "이메일 인증 요청 중 오류가 발생했습니다.";
      setErrorMessage(message);
      resetVerificationState();
    }
  };

  const onClickVerifyCode = async () => {
    clearMessages();

    if (!verificationTargetEmail) {
      setErrorMessage("먼저 인증번호를 전송해주세요.");
      return;
    }

    if (verificationCode.length !== AUTH_CODE_LENGTH) {
      setErrorMessage("6자리 인증번호를 모두 입력해주세요.");
      return;
    }

    try {
      await verifyCodeMutation.mutateAsync({
        email: verificationTargetEmail,
        authCode: verificationCode,
      });
      setIsEmailVerified(true);
      setCurrentScreen(2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "인증번호 확인 중 오류가 발생했습니다.";
      setErrorMessage(message);
      resetVerificationState();
    }
  };

  const onClickNicknameCheck = async () => {
    clearMessages();

    const isNicknameValid = await trigger("nickname");
    if (!isNicknameValid) {
      return;
    }

    setNicknameCheckedValue(nicknameValue.trim());
    setSuccessMessage("사용 가능한 닉네임으로 확인되었습니다.");
  };

  const goToNextScreen = async () => {
    clearMessages();

    if (currentScreen === 1) {
      if (!isEmailVerified) {
        setErrorMessage("이메일 인증을 완료해주세요.");
        return;
      }
      setCurrentScreen(2);
      return;
    }

    if (currentScreen === 2) {
      const isValid = await trigger(["password", "confirmPassword"]);
      if (!isValid) {
        return;
      }
      setCurrentScreen(3);
      return;
    }

    if (currentScreen === 3) {
      const isValid = await trigger("nickname");
      if (!isValid) {
        return;
      }

      if (!isNicknameChecked) {
        setErrorMessage("닉네임 중복 확인을 완료해주세요.");
        return;
      }

      setCurrentScreen(4);
      return;
    }

    if (currentScreen === 4) {
      if (!agreeTerms || !agreePrivacy) {
        setErrorMessage("필수 약관에 동의해주세요.");
        return;
      }

      try {
        await signUpMutation.mutateAsync({
          email: schoolEmail,
          password: passwordValue,
        });
        setSuccessMessage("회원가입이 완료되었습니다.");
        setCurrentScreen(5);
      } catch (error) {
        const message = error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.";
        setErrorMessage(message);
      }
    }
  };

  const validationMessage =
    errors.emailLocalPart?.message ||
    errors.password?.message ||
    errors.confirmPassword?.message ||
    errors.nickname?.message;

  const onClickCompletedStep = (step: number) => {
    const nextScreen = STEP_TO_SCREEN[step];
    if (!nextScreen) {
      return;
    }

    clearMessages();
    setCurrentScreen(nextScreen);
  };

  const resetEntireFlow = () => {
    clearMessages();
    reset();
    resetVerificationState();
    setCurrentScreen(1);
    setNicknameCheckedValue("");
    if (profilePreviewUrl !== DEFAULT_PROFILE_IMAGE) {
      URL.revokeObjectURL(profilePreviewUrl);
    }
    setProfilePreviewUrl(DEFAULT_PROFILE_IMAGE);
  };

  const renderFormContent = () => {
    if (currentScreen === 1) {
      return (
        <>
          <div className="relative flex w-full gap-[5px]">
            <div className="flex h-12 flex-1 items-center rounded-xl border border-[#a8bfd9] bg-transparent px-4 text-sm text-[#23324c]">
              <input
                className="w-full bg-transparent text-sm text-[#23324c] outline-none placeholder:text-[#9ca9bb]"
                placeholder="학교 이메일"
                disabled={isSendingVerification || isVerifyingCode || isEmailVerified}
                {...register("emailLocalPart", {
                  required: "학교 이메일을 입력해주세요.",
                  validate: (value) => /^[A-Za-z0-9._%+-]+$/.test(value.trim()) || "이메일 아이디 형식이 올바르지 않습니다.",
                })}
              />
              <span className="ml-3 shrink-0 text-sm text-[#58697f]">{EMAIL_DOMAIN}</span>
            </div>
            <button
              className="h-12 shrink-0 rounded-xl bg-[#87BCF5] px-4 text-sm font-medium text-white disabled:opacity-70"
              type="button"
              onClick={onClickSendVerification}
              disabled={isSendingVerification || isVerifyingCode || isEmailVerified}
            >
              {isEmailVerified ? "인증완료" : isSendingVerification ? "전송 중" : "인증번호 전송"}
            </button>
          </div>

          {isVerificationInputVisible ? (
            <>
              <div className="mt-6 text-center text-sm text-[#8da0b6]">인증번호를 아래에 입력해주세요</div>

              <div className="mt-[14px]">
                <AuthCodeInput
                  values={authCodeDigits}
                  disabled={isVerifyingCode}
                  inputRefs={authCodeRefs}
                  onChange={onChangeAuthCode}
                  onKeyDown={onKeyDownAuthCode}
                />
              </div>

              <button
                className="mt-6 h-12 w-full rounded-xl bg-[#87BCF5] text-sm font-medium text-white transition hover:bg-[#6EAAF1] disabled:opacity-70"
                type="button"
                onClick={isEmailVerified ? goToNextScreen : onClickVerifyCode}
                disabled={isVerifyingCode}
              >
                {isEmailVerified ? "확인" : isVerifyingCode ? "확인 중" : "확인"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-[#5f7188]">
                <span>인증 메일을 받지 못했나요?</span>
                <button className="text-[#5E9CE6] underline" type="button" onClick={onClickSendVerification}>
                  인증번호 재전송
                </button>
              </div>
            </>
          ) : null}
        </>
      );
    }

    if (currentScreen === 2) {
      return (
        <>
          <div className="grid gap-[5px]">
            <label className="relative">
              <input
                className="h-12 w-full rounded-xl border border-[#a8bfd9] bg-transparent px-4 pr-12 text-sm text-[#23324c] outline-none placeholder:text-[#9ca9bb]"
                placeholder="비밀번호"
                type={isPasswordVisible ? "text" : "password"}
                {...register("password", {
                  required: "비밀번호를 입력해주세요.",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다.",
                  },
                })}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1f2c44]"
                type="button"
                onClick={() => setIsPasswordVisible((previous) => !previous)}
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            <label className="relative">
              <input
                className="h-12 w-full rounded-xl border border-[#a8bfd9] bg-transparent px-4 pr-12 text-sm text-[#23324c] outline-none placeholder:text-[#9ca9bb]"
                placeholder="비밀번호 확인"
                type={isConfirmPasswordVisible ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "비밀번호 확인을 입력해주세요.",
                  validate: (value) => value === passwordValue || "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
                })}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1f2c44]"
                type="button"
                onClick={() => setIsConfirmPasswordVisible((previous) => !previous)}
              >
                {isConfirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>
          </div>

          <button
            className="mt-[26px] h-12 w-full rounded-xl bg-[#87BCF5] text-sm font-medium text-white transition hover:bg-[#6EAAF1]"
            type="button"
            onClick={goToNextScreen}
          >
            다음
          </button>
        </>
      );
    }

    if (currentScreen === 3) {
      return (
        <>
          <div className="flex flex-col items-center">
            <button
              className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-[#1d2740] text-white"
              type="button"
              onClick={() => profileFileInputRef.current?.click()}
            >
              <img alt="프로필 미리보기" className="h-full w-full object-cover" src={profilePreviewUrl} />
            </button>
            <button className="mt-4 text-sm text-[#7f90a4]" type="button" onClick={() => profileFileInputRef.current?.click()}>
              프로필 사진
            </button>
            <input
              ref={profileFileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={onUploadProfileImage}
            />
          </div>

          <div className="mt-8 flex gap-[5px]">
            <input
              className="h-12 flex-1 rounded-xl border border-[#a8bfd9] bg-transparent px-4 text-sm text-[#23324c] outline-none placeholder:text-[#9ca9bb]"
              placeholder="닉네임"
              type="text"
              {...register("nickname", {
                required: "닉네임을 입력해주세요.",
                minLength: {
                  value: 2,
                  message: "닉네임은 2자 이상이어야 합니다.",
                },
              })}
            />
            <button
              className="h-12 shrink-0 rounded-xl bg-[#87BCF5] px-4 text-sm font-medium text-white disabled:opacity-70"
              type="button"
              onClick={onClickNicknameCheck}
            >
              중복 확인
            </button>
          </div>

          <button
            className="mt-[26px] h-12 w-full rounded-xl bg-[#87BCF5] text-sm font-medium text-white transition hover:bg-[#6EAAF1]"
            type="button"
            onClick={goToNextScreen}
          >
            다음
          </button>
        </>
      );
    }

    if (currentScreen === 4) {
      return (
        <>
          <div className="grid gap-[10px] text-sm text-[#5f7188]">
            <CheckboxRow checked={agreeAll} label="약관 전체 동의" onToggle={onToggleAllAgreements} />
            <CheckboxRow
              checked={agreeTerms}
              label="이용약관 동의 (필수)"
              actionLabel="보기"
              onToggle={(checked) => setValue("agreeTerms", checked)}
            />
            <CheckboxRow
              checked={agreePrivacy}
              label="개인정보처리방침 동의 (필수)"
              actionLabel="보기"
              onToggle={(checked) => setValue("agreePrivacy", checked)}
            />
            <CheckboxRow
              checked={agreeMarketing}
              label="이벤트 및 공지 수신 동의 (선택)"
              actionLabel="보기"
              onToggle={(checked) => setValue("agreeMarketing", checked)}
            />
          </div>

          <button
            className="mt-[29px] h-12 w-full rounded-xl bg-[#87BCF5] text-sm font-medium text-white transition hover:bg-[#6EAAF1] disabled:opacity-70"
            type="button"
            onClick={goToNextScreen}
            disabled={isSigningUp}
          >
            {isSigningUp ? "가입 중..." : "다음"}
          </button>
        </>
      );
    }

    return (
      <div className="pt-2">
        <button
          className="h-12 w-full rounded-xl bg-[#87BCF5] text-sm font-medium text-white transition hover:bg-[#6EAAF1]"
          type="button"
          onClick={() => navigate("/login")}
        >
          로그인
        </button>
      </div>
    );
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[360px] text-center">
        <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d2740]">HUFS.DEV</h1>
        <h2 className="mt-8 text-[18px] font-semibold tracking-[-0.03em] text-[#1d2740]">회원가입</h2>

        {currentScreen === 5 ? (
          <p className="mt-10 text-sm text-[#98a7b9]">이제 모든 준비를 마쳤어요! 환영합니다!</p>
        ) : (
          <p className="mt-8 text-sm text-[#98a7b9]">{SCREEN_DESCRIPTION[currentScreen]}</p>
        )}

        <div className="mt-5">
          <StepIndicator currentScreen={currentScreen} onStepClick={onClickCompletedStep} />
        </div>

        <div className={currentScreen === 5 ? "mt-14" : "mt-8"}>{renderFormContent()}</div>

        {validationMessage ? <p className="mt-4 text-left text-sm text-red-600">{validationMessage}</p> : null}
        {errorMessage ? <p className="mt-4 text-left text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="mt-4 text-left text-sm text-green-600">{successMessage}</p> : null}

        {currentScreen === 5 ? (
          <div className="mt-4 text-sm text-[#5f7188]">
            <button className="underline" type="button" onClick={resetEntireFlow}>
              다시 가입 흐름 보기
            </button>
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#5f7188]">
          <span>이미 계정이 있으신가요?</span>
          <Link className="underline" to="/login">
            로그인 하기
          </Link>
        </div>
      </div>
    </section>
  );
}
