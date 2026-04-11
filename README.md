# front-end

이 프로젝트는 확장성과 유지보수성을 고려하여 구성된 React 기반 프론트엔드 애플리케이션입니다.  
빠른 개발 환경, 일관된 스타일링, 안정적인 상태 관리, 그리고 타입 안정성을 중심으로 설계되었습니다.

---

# 사이트 구조 

<img width="2398" height="2005" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/e158eb90-151b-4daa-8675-daf0fb3de7c7" />


## 메인 페이지
<img width="1898" height="737" alt="image" src="https://github.com/user-attachments/assets/273f7d4c-303c-4aa3-8b29-a4ebfc430fe7" />

현재 임시 ui 페이지입니다


## 로그인 페이지
<img width="1912" height="792" alt="image" src="https://github.com/user-attachments/assets/557b9138-8264-4c4b-87a0-55e90557ac7e" />

여기서 hufs.ac.kr 이메일 로그인을 하거나 

미리 소셜로그인을 연결한 경우, 소셜로그인으로 로그인 가능합니다.


## 회원가입 페이지
<img width="1903" height="893" alt="image" src="https://github.com/user-attachments/assets/c5d5c2c9-a97c-4b88-b4b7-5aa56dae846c" />

만약 회원가입하지 않은 경우, 각 순서에 따라 회원가입을 진행합니다.


## 마이 페이지
<img width="1908" height="903" alt="image" src="https://github.com/user-attachments/assets/cce5e19a-8a90-4c0a-92f3-76f82777f9fa" />
현재 회원 정보를 확인하거나, 수정하거나, 탈퇴하거나, 소셜 로그인 연동 등을 진행할 수 있습니다.


## 게시판 페이지
### 자유/정보 게시판
<img width="1905" height="893" alt="image" src="https://github.com/user-attachments/assets/41b0b2dc-859c-4215-92cf-8fa895f03b6c" />

주제와 상관없이 자유롭게 작성 가능한 페이지입니다. 
로그인 된 상태여야 글들을 볼 수 있습니다.

### 코딩테스트 게시판, 팀원 모집 게시판

현재 작업 중입니다.

### 강의/수업 게시판
<img width="1912" height="907" alt="image" src="https://github.com/user-attachments/assets/8aa95327-40d6-426a-9cd3-a8afee469c5e" />

특정 과를 선택하여 해당 과의 수업 후기 혹은 궁금한 점을 작성할 수 있습니다.

### 동아리/행사/홍보 게시판
<img width="1903" height="865" alt="image" src="https://github.com/user-attachments/assets/35e36d1b-b28d-4d26-9949-a53e2ae1c863" />

각종 행사와 관련하여 보거나 홍보를 위해 생긴 게시판입니다.


## 📦 기술 스택 요약

- Vite (React) (7.3.1)
- TypeScript (5.9.3)
- Tailwind CSS (4.2.1)
- TanStack Query (5.90.21)
- React Router DOM (7.13.0)
- Zustand (5.0.11)
- React Hook Form (7.71.2)
- Axios (1.13.5)

---


### Vite (React) (7.3.1)

Vite는 빠른 개발 서버 구동과 뛰어난 HMR(Hot Module Replacement) 성능을 제공합니다.  
불필요한 번들링 과정을 줄여 개발 경험(DX)을 향상시키고, 경량화된 빌드 결과물을 생성할 수 있어 생산성과 성능을 동시에 확보할 수 있습니다.

React는 컴포넌트 기반 구조를 통해 UI를 재사용 가능하게 설계할 수 있으며, 복잡한 인터페이스를 구조적으로 관리할 수 있는 기반을 제공합니다.

---


### TypeScript (5.9.3)

TypeScript를 도입하여 정적 타입 기반 개발 환경을 구축했습니다.  
API 응답 구조와 컴포넌트 props를 명확하게 정의함으로써 런타임 에러를 줄이고 유지보수성을 높입니다.  
규모가 확장되더라도 안전하게 리팩토링할 수 있는 기반을 제공합니다.

---


### Tailwind CSS (4.2.1)

Tailwind는 유틸리티 퍼스트 CSS 프레임워크로, 빠른 UI 개발과 일관된 디자인 시스템 유지를 가능하게 합니다.  
별도의 CSS 파일 관리 부담을 줄이고, 클래스 기반 스타일링으로 컴포넌트 단위 개발에 최적화되어 있습니다.

---


### TanStack Query (5.90.21)

TanStack Query는 서버 상태를 효율적으로 관리하기 위한 라이브러리입니다.  
데이터 캐싱, 자동 리패칭, 로딩/에러 상태 관리 등을 통해 비동기 데이터 처리를 단순화합니다.  
네트워크 요청을 체계적으로 관리함으로써 사용자 경험을 향상시킵니다.

---


### React Router DOM (7.13.0)

React Router DOM을 사용하여 SPA 환경에서 URL 기반 라우팅을 구현합니다.  
페이지 전환, 동적 라우팅, 인증 기반 접근 제어 등을 유연하게 구성할 수 있습니다.

---


### Zustand (5.0.11)

Zustand는 가볍고 직관적인 전역 상태 관리 라이브러리입니다.  
복잡한 보일러플레이트 없이 간단한 전역 상태를 관리할 수 있으며, UI 상태와 서버 상태를 명확히 분리하는 데 적합합니다.

---


### React Hook Form (7.71.2)

React Hook Form은 성능 중심의 폼 상태 관리 라이브러리입니다.  
불필요한 리렌더링을 최소화하며, 유효성 검사 로직을 효율적으로 구성할 수 있습니다.  
복잡한 입력 폼을 구조적으로 관리하기 위해 도입했습니다.

---


### Axios (1.13.5)

Axios는 HTTP 요청을 보다 구조적으로 관리하기 위해 사용합니다.  
인터셉터를 통해 토큰 처리, 공통 에러 핸들링, 요청/응답 로깅 등을 중앙 집중적으로 관리할 수 있습니다.

---

## 🏗️ 개발 원칙(추후 변동)

- 서버 상태와 클라이언트 상태를 명확히 분리
- UI와 데이터 로직 분리
- 타입 기반 안전한 개발 환경 유지

- 확장 가능한 상태 관리 구조
- 안전한 타입 기반 개발
- 유지보수성을 고려한 아키텍처 설계

