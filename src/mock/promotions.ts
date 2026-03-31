export type PromotionCategory = "ALL" | "CLUB" | "EVENT" | "PROJECT" | "CONTEST" | "ETC";

export interface PromotionAuthor {
  name: string;
  department: string;
  role: string;
  profileImageUrl?: string;
}

export interface PromotionPost {
  postId: number;
  category: Exclude<PromotionCategory, "ALL">;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  scrapCount: number;
  thumbnailUrl?: string;
  author: PromotionAuthor;
}

export const PROMOTION_CATEGORY_OPTIONS: Array<{ label: string; value: PromotionCategory }> = [
  { label: "전체", value: "ALL" },
  { label: "동아리", value: "CLUB" },
  { label: "행사", value: "EVENT" },
  { label: "프로젝트", value: "PROJECT" },
  { label: "대회", value: "CONTEST" },
  { label: "기타", value: "ETC" },
];

export const PROMOTION_SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "조회수순", value: "views" },
  { label: "좋아요순", value: "likes" },
] as const;

export const PROMOTION_POSTS: PromotionPost[] = [
  {
    postId: 1,
    category: "PROJECT",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    excerpt:
      "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다. 우선 가장 중요했던 건 기초 CS 지식과...",
    content: `
      <p>안녕하세요! 비전공자로서 개발자의 꿈을 키운지 딱 6개월 만에 목표하던 기업 중 한 곳에 최종 합격하게 되어 그 과정을 공유하고자 합니다. 저와 같은 고민을 하시는 분들께 조금이나마 도움이 되었으면 좋겠습니다.</p>
      <h3>1. 베이스 다지기 (1~2개월 차)</h3>
      <p>처음에는 무엇부터 시작해야 할지 몰라 무작정 CS 기초와 JavaScript 기본 문법에 집중했습니다. 특히 클로저, 프로토타입 같은 핵심 개념을 완벽히 이해할 때까지 반복 학습했습니다.</p>
      <img src="/default_profile.png" alt="sample" />
      <h3>2. 프로젝트와 협업 (3~5개월 차)</h3>
      <p>이론만으로는 한계가 있다고 느껴 팀 프로젝트를 시작했습니다. DevCampus에서 마음이 맞는 팀원들을 만나 3개월간 매일 10시간씩 몰입했습니다. 기술적인 성장도 컸지만, Git을 통한 협업과 코드 리뷰의 중요성을 뼈저리게 느낀 시기였습니다.</p>
      <pre><code>const handleAuthentication = async (user) => {\n  try {\n    const response = await api.login(user);\n    if (response.status === 200) {\n      saveToken(response.data.accessToken);\n      return true;\n    }\n  } catch (error) {\n    console.error("Auth Failed:", error);\n  }\n};</code></pre>
      <p>포기하지 않고 끝까지 완주하는 것이 가장 중요합니다. 여러분도 하실 수 있습니다!</p>
    `,
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    createdAt: "2026-02-24T10:00:00+09:00",
    likeCount: 128,
    commentCount: 42,
    viewCount: 1248,
    scrapCount: 812,
    author: {
      name: "한국외대 지킴이",
      department: "영어통번역학과",
      role: "백엔드",
      profileImageUrl: "/default_profile.png",
    },
  },
  {
    postId: 2,
    category: "EVENT",
    title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
    excerpt: "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 제가 작성한 코드와 시간 복잡도 분석 내용을 공유합니다.",
    content: `
      <p>코딩테스트 준비를 하다 보면 DFS와 BFS 선택이 중요한 순간이 자주 옵니다. 이 글에서는 네트워크 문제를 예시로 어떤 기준으로 풀이 전략을 정했는지 정리했습니다.</p>
      <p>문제를 작은 연결 요소 관점으로 나누면 구현이 훨씬 단순해집니다. 방문 처리와 탐색 순서를 어떻게 가져갈지에 집중해 보세요.</p>
    `,
    tags: ["코테", "프로그래머스", "DFS", "BFS"],
    createdAt: "2026-02-24T14:20:00+09:00",
    likeCount: 82,
    commentCount: 24,
    viewCount: 1204,
    scrapCount: 512,
    author: {
      name: "코테라도 만점 받고 싶어요",
      department: "컴퓨터공학과",
      role: "프론트엔드",
      profileImageUrl: "/default_profile.png",
    },
  },
  {
    postId: 3,
    category: "CLUB",
    title: "외대생 개발 연합 동아리 신입 멤버 모집",
    excerpt: "학기 중 함께 사이드 프로젝트와 세미나를 운영할 신입 멤버를 모집합니다.",
    content: `
      <p>한 학기 동안 함께 프로젝트를 만들고, 기술 세미나를 운영할 동아리 멤버를 모집합니다.</p>
      <p>개발 경험이 많지 않아도 괜찮습니다. 서로 배우고 만드는 문화에 관심 있다면 누구든 환영입니다.</p>
    `,
    tags: ["동아리", "프로젝트", "세미나"],
    createdAt: "2026-03-01T09:00:00+09:00",
    likeCount: 65,
    commentCount: 17,
    viewCount: 856,
    scrapCount: 283,
    author: {
      name: "외대생 메이커",
      department: "정보통신공학과",
      role: "프론트엔드",
      profileImageUrl: "/default_profile.png",
    },
  },
];

export function getPromotionCategoryLabel(category: PromotionCategory) {
  return PROMOTION_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "기타";
}
