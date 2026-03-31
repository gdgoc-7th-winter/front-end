export type TeamRecruitCategory = "ALL" | "CLUB" | "ACADEMY" | "STUDY" | "PROJECT" | "ETC";
export type TeamRecruitStatus = "OPEN" | "CLOSED";
export type TeamRecruitCampus = "SEOUL" | "GLOBAL";
export type TeamRecruitQuestionType = "SHORT_TEXT" | "LONG_TEXT" | "RADIO" | "CHECKBOX";

export interface TeamRecruitAuthor {
  name: string;
  department: string;
  role: string;
  profileImageUrl?: string;
}

export interface TeamRecruitSummary {
  postId: number;
  category: Exclude<TeamRecruitCategory, "ALL">;
  recruitStartDate: string;
  recruitEndDate: string;
  status: TeamRecruitStatus;
  title: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  scrapCount: number;
  thumbnailLabel?: string;
  author: TeamRecruitAuthor;
}

export interface TeamRecruitComment {
  commentId: number;
  author: TeamRecruitAuthor;
  createdAt: string;
  content: string;
  likeCount: number;
  liked?: boolean;
  parentCommentId?: number | null;
}

export interface TeamRecruitQuestionOption {
  id: string;
  label: string;
}

export interface TeamRecruitQuestion {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  type: TeamRecruitQuestionType;
  maxLength?: number;
  options?: TeamRecruitQuestionOption[];
}

export interface TeamRecruitPostDetail extends TeamRecruitSummary {
  content: string;
  applicationEnabled: boolean;
  applicationTitle: string;
  applicationDescription: string;
  questions: TeamRecruitQuestion[];
  comments: TeamRecruitComment[];
}

export interface TeamRecruitApplicant {
  applicantId: number;
  name: string;
  campus: TeamRecruitCampus;
  department: string;
  submittedAt: string;
  answers: Record<string, string | string[]>;
}

export const TEAM_RECRUIT_CATEGORY_OPTIONS: Array<{
  label: string;
  value: TeamRecruitCategory;
}> = [
  { label: "전체", value: "ALL" },
  { label: "동아리", value: "CLUB" },
  { label: "학회", value: "ACADEMY" },
  { label: "스터디", value: "STUDY" },
  { label: "프로젝트", value: "PROJECT" },
  { label: "기타", value: "ETC" },
];

export const TEAM_RECRUIT_SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "조회수순", value: "views" },
  { label: "좋아요순", value: "likes" },
] as const;

export const TEAM_RECRUIT_POSTS: TeamRecruitSummary[] = [
  {
    postId: 1,
    category: "CLUB",
    recruitStartDate: "2026-03-18",
    recruitEndDate: "2026-03-31",
    status: "OPEN",
    title: "Google Developer Groups on Campus Member 모집",
    excerpt: "GDGoC 7기 멤버를 모집합니다. 개발로 함께 성장하고 싶은 분들을 기다리고 있어요.",
    tags: ["서류전형", "비전공자", "네트워킹"],
    createdAt: "2026-02-24T10:00:00+09:00",
    likeCount: 128,
    commentCount: 42,
    viewCount: 1248,
    scrapCount: 812,
    thumbnailLabel: "지원 폼",
    author: {
      name: "한국외대 지킴이",
      department: "영어통번역학과",
      role: "백엔드",
      profileImageUrl: "/default_profile.png",
    },
  },
  {
    postId: 2,
    category: "ACADEMY",
    recruitStartDate: "2026-03-18",
    recruitEndDate: "2026-03-31",
    status: "CLOSED",
    title: "코딩테스트 연합반 5기 리크루팅",
    excerpt: "프로그래머스, 백준 중심으로 함께 코딩 테스트를 준비할 분을 찾고 있습니다.",
    tags: ["알고리즘", "프로그래머스", "BFS"],
    createdAt: "2026-02-24T10:00:00+09:00",
    likeCount: 84,
    commentCount: 19,
    viewCount: 972,
    scrapCount: 365,
    thumbnailLabel: "알고리즘",
    author: {
      name: "코테라도 만점 받고 싶어요",
      department: "컴퓨터공학과",
      role: "프론트엔드",
      profileImageUrl: "/default_profile.png",
    },
  },
  {
    postId: 3,
    category: "STUDY",
    recruitStartDate: "2026-03-21",
    recruitEndDate: "2026-04-04",
    status: "OPEN",
    title: "비전공자 취업 스터디 함께할 분 모집",
    excerpt: "이력서 리뷰, 모의면접, CS 학습을 함께 진행할 취업 스터디 팀원을 구합니다.",
    tags: ["취업스터디", "CS", "모의면접"],
    createdAt: "2026-02-26T09:30:00+09:00",
    likeCount: 61,
    commentCount: 14,
    viewCount: 851,
    scrapCount: 227,
    thumbnailLabel: "스터디",
    author: {
      name: "바이브코딩 물러가라",
      department: "컴퓨터공학과",
      role: "DevOps",
      profileImageUrl: "/default_profile.png",
    },
  },
  {
    postId: 4,
    category: "PROJECT",
    recruitStartDate: "2026-03-20",
    recruitEndDate: "2026-04-10",
    status: "OPEN",
    title: "교내 행사 통합 관리 플랫폼 사이드 프로젝트",
    excerpt: "기획자, 디자이너, 프론트엔드 개발자를 모집합니다. 실제 배포까지 같이 가요.",
    tags: ["React", "Spring", "Figma"],
    createdAt: "2026-02-28T14:15:00+09:00",
    likeCount: 93,
    commentCount: 27,
    viewCount: 1132,
    scrapCount: 401,
    thumbnailLabel: "프로젝트",
    author: {
      name: "프로덕트메이커",
      department: "정보통신공학과",
      role: "기획",
      profileImageUrl: "/default_profile.png",
    },
  },
];

export const TEAM_RECRUIT_DETAIL: TeamRecruitPostDetail = {
  ...TEAM_RECRUIT_POSTS[0],
  content: `
    <p>안녕하세요. GDGoC HUFS 7기 운영진입니다. 이번 기수에서는 실전 프로젝트 경험과 커뮤니티 활동을 함께 경험할 멤버를 모집합니다.</p>
    <h3>이런 분을 찾고 있어요</h3>
    <p>개발 실력보다도 꾸준히 배우고, 팀원과 소통하며, 함께 만드는 과정을 즐길 수 있는 분을 우선으로 보고 있습니다.</p>
    <h3>활동 방식</h3>
    <p>정기 세션, 파트별 스터디, 해커톤 준비, 프로젝트 빌드업을 중심으로 운영됩니다. 온보딩 자료와 멘토링도 함께 제공할 예정입니다.</p>
  `,
  applicationEnabled: true,
  applicationTitle: "Google Developer Groups on Campus Member 모집 신청서",
  applicationDescription: "한국외대 GDGoC 7기 멤버 지원서 폼입니다.",
  questions: [
    {
      id: "name",
      title: "이름",
      required: true,
      type: "SHORT_TEXT",
      maxLength: 20,
    },
    {
      id: "campus",
      title: "캠퍼스",
      required: true,
      type: "RADIO",
      options: [
        { id: "seooul", label: "서울 캠퍼스" },
        { id: "global", label: "글로벌 캠퍼스" },
      ],
    },
    {
      id: "department",
      title: "학과",
      required: true,
      type: "SHORT_TEXT",
      maxLength: 30,
    },
    {
      id: "motivation",
      title: "GDGoC에 지원하게 된 계기는 무엇인가요?",
      required: true,
      type: "LONG_TEXT",
      maxLength: 100,
    },
    {
      id: "part",
      title: "지원하시는 파트를 선택해주세요.",
      description: "한 가지 파트만 선택할 수 있어요.",
      required: true,
      type: "RADIO",
      options: [
        { id: "frontend", label: "프론트엔드" },
        { id: "backend", label: "백엔드" },
        { id: "planning", label: "기획" },
        { id: "design", label: "디자인" },
      ],
    },
    {
      id: "interest",
      title: "관심있는 분야를 모두 선택해주세요.",
      required: false,
      type: "CHECKBOX",
      options: [
        { id: "react", label: "React" },
        { id: "java", label: "Java" },
        { id: "networking", label: "네트워킹" },
      ],
    },
  ],
  comments: [
    {
      commentId: 1,
      author: {
        name: "코테라도 만점 받고 싶어요",
        department: "컴퓨터공학과",
        role: "프론트엔드",
        profileImageUrl: "/default_profile.png",
      },
      createdAt: "2026-03-24T10:20:00+09:00",
      content:
        "정말 정성스러운 후기 감사합니다! 저도 비전공자라 고민이 많았는데 갈피를 잡는 데 큰 도움이 됐어요.",
      likeCount: 12,
      liked: true,
      parentCommentId: null,
    },
    {
      commentId: 2,
      author: {
        name: "한국외대 지킴이",
        department: "영어통번역학과",
        role: "백엔드",
        profileImageUrl: "/default_profile.png",
      },
      createdAt: "2026-03-24T10:25:00+09:00",
      content: "궁금한 부분 있으시면 편하게 댓글 남겨주세요 :)",
      likeCount: 2,
      liked: false,
      parentCommentId: 1,
    },
    {
      commentId: 3,
      author: {
        name: "바이브코딩 물러가라",
        department: "컴퓨터공학과",
        role: "DevOps",
        profileImageUrl: "/default_profile.png",
      },
      createdAt: "2026-03-24T11:10:00+09:00",
      content: "스크랩 해두고 지원 준비해보려 합니다. 합격자 발표 일정도 공개되나요?",
      likeCount: 5,
      liked: false,
      parentCommentId: null,
    },
  ],
};

export const TEAM_RECRUIT_APPLICANTS: TeamRecruitApplicant[] = [
  {
    applicantId: 1,
    name: "강낭콩",
    campus: "GLOBAL",
    department: "컴퓨터공학부",
    submittedAt: "2026-03-25T09:30:00+09:00",
    answers: {
      name: "강낭콩",
      campus: "글로벌 캠퍼스",
      department: "컴퓨터공학부",
      motivation: "실제 프로젝트 경험을 쌓고, 학기 중에도 꾸준히 성장할 수 있는 커뮤니티를 찾고 있었어요.",
      part: "백엔드",
      interest: ["Java", "네트워킹"],
    },
  },
  {
    applicantId: 2,
    name: "윤채린",
    campus: "SEOUL",
    department: "영어통번역학과",
    submittedAt: "2026-03-25T10:20:00+09:00",
    answers: {
      name: "윤채린",
      campus: "서울 캠퍼스",
      department: "영어통번역학과",
      motivation: "개발 커뮤니티에서 동기부여를 받고 싶고, 협업 경험을 넓히고 싶습니다.",
      part: "프론트엔드",
      interest: ["React"],
    },
  },
  {
    applicantId: 3,
    name: "박도윤",
    campus: "GLOBAL",
    department: "정보통신공학과",
    submittedAt: "2026-03-25T11:45:00+09:00",
    answers: {
      name: "박도윤",
      campus: "글로벌 캠퍼스",
      department: "정보통신공학과",
      motivation: "파트별 스터디와 멘토링 구조가 좋아 보여 지원했습니다.",
      part: "기획",
      interest: ["네트워킹", "React"],
    },
  },
];

export function getRecruitCategoryLabel(category: TeamRecruitCategory) {
  return TEAM_RECRUIT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "기타";
}

export function getRecruitStatusLabel(status: TeamRecruitStatus) {
  return status === "OPEN" ? "모집 중" : "모집 마감";
}

export function getRecruitCampusLabel(campus: TeamRecruitCampus) {
  return campus === "SEOUL" ? "서울 캠퍼스" : "글로벌 캠퍼스";
}
