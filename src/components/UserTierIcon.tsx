type Tier =
  | "우드"
  | "브론즈"
  | "실버"
  | "골드"
  | "플래티넘"
  | "에메랄드"
  | "루비"
  | "다이아"
  | "더미";

const tierImageMap: Record<Tier, string> = {
  우드: "/badge/boo_wood.png",
  브론즈: "/badge/boo_bronze.png",
  실버: "/badge/boo_sliver.png",
  골드: "/badge/boo_gold.png",
  플래티넘: "/badge/boo_platinum.png",
  에메랄드: "/badge/boo_emerald.png",
  루비: "/badge/boo_ruby.png",
  다이아: "/badge/boo_dia.png",
  더미: "/badge/boo_dummy.png",
};

type UserTierIconProps = {
  tier: Tier;
  className?: string;
};

export function UserTierIcon({ tier, className = "inline-block h-[13px] w-3 align-[-2px]" }: UserTierIconProps) {
  return <img src={tierImageMap[tier]} alt={`${tier} badge`} className={className} />;
}

