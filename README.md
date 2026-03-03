<h1 align="center">NestJS API Server (Portfolio Project)</h1>

<p align="center">
NestJS 기반 SNS형 API 서버 프로젝트<br/>
JWT 인증/인가 · 권한 검증 · 관계 모델링 · 테스트 전략 설계
</p>

<hr/>

<h2>1. Project Goal</h2>

<p>
이 프로젝트는 단순 CRUD 구현이 아닌 다음을 목표로 설계되었습니다.
</p>

<ul>
  <li>계층 분리 기반 아키텍처 구성</li>
  <li>인증/인가 책임 분리</li>
  <li>작성자 권한 검증 로직 명확화</li>
  <li>관계 데이터 모델링 설계 (Follow / Like)</li>
  <li>테스트 가능한 구조 설계</li>
  <li>Unit Test + Integration Test 이중 검증</li>
</ul>

<hr/>

<h2>2. Tech Stack</h2>

<table>
<tr><td><b>Framework</b></td><td>NestJS</td></tr>
<tr><td><b>Language</b></td><td>TypeScript</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL</td></tr>
<tr><td><b>ORM</b></td><td>TypeORM</td></tr>
<tr><td><b>Authentication</b></td><td>JWT + Passport Guard</td></tr>
<tr><td><b>Testing</b></td><td>Jest (Unit) / Supertest (E2E) / Postman</td></tr>
</table>

<hr/>

<h2>3. Core Features</h2>

<h3>User</h3>
<ul>
  <li>회원가입</li>
  <li>로그인 (JWT 발급)</li>
</ul>

<h3>Post</h3>
<ul>
  <li>게시글 생성 / 조회 / 수정 / 삭제</li>
  <li>작성자 권한 검증</li>
</ul>

<h3>Comment</h3>
<ul>
  <li>댓글 생성 / 수정 / 삭제</li>
  <li>작성자 검증</li>
</ul>

<h3>Like</h3>
<ul>
  <li>게시글 좋아요 / 취소</li>
  <li>중복 좋아요 방지 처리</li>
</ul>

<h3>Follow</h3>
<ul>
  <li>팔로우 / 언팔로우</li>
  <li>팔로워 / 팔로잉 목록 조회</li>
</ul>

<h3>Search</h3>
<ul>
  <li>유저 검색 (email, nickname)</li>
  <li>게시글 검색 (content)</li>
</ul>

<h3>Authentication / Authorization</h3>
<ul>
  <li>JWT 기반 접근 제어</li>
  <li>Guard를 통한 인증 처리</li>
  <li>Service 레벨에서 권한 검증 수행</li>
</ul>

<hr/>

<h2>4. Architecture Design</h2>

<h3>Layered Structure</h3>

<p><b>Controller</b><br/>
요청/응답 매핑 전담 (비즈니스 로직 배제)</p>

<p><b>Service</b><br/>
비즈니스 로직 집중<br/>
작성자 권한 검증 처리<br/>
예외 처리 전략 적용</p>

<p><b>Repository (TypeORM)</b><br/>
DB 접근 전담</p>

<p><b>Auth Module</b><br/>
JWT 발급<br/>
Guard 기반 인증 분리</p>

<h3>Design Principles</h3>

<ul>
  <li>Controller는 최대한 얇게 유지</li>
  <li>비즈니스 로직은 Service 계층에 집중</li>
  <li>권한 검증은 DB 조회 기반으로 명확히 처리</li>
  <li>예외는 HTTP Status 기준으로 분리 (401 / 403 / 404)</li>
  <li>테스트 가능성을 고려한 계층 설계</li>
</ul>

<hr/>

<h2>5. Test Strategy</h2>

<p>
Unit Test와 Integration Test를 분리하여 구성했습니다.<br/>
단순 동작 확인이 아니라 로직, 권한, 예외 흐름까지 검증하는 것을 목표로 합니다.
</p>

<h3>5-1. Unit Test (Service Layer)</h3>

<p>Jest 기반 단위 테스트</p>

<ul>
  <li>AuthService</li>
  <li>UserService</li>
  <li>PostService</li>
  <li>CommentService</li>
  <li>LikeService</li>
  <li>FollowService</li>
  <li>SearchService</li>
</ul>

<p><b>테스트 범위</b></p>

<ul>
  <li>비즈니스 로직 검증</li>
  <li>예외 처리 검증</li>
  <li>작성자 권한 검증</li>
  <li>Repository Mock 기반 격리 테스트</li>
</ul>

<p><b>설계 의도</b></p>

<ul>
  <li>DB 의존성 제거</li>
  <li>Service 로직 단위 완전 검증</li>
  <li>예외 흐름까지 테스트하여 방어적 설계</li>
</ul>

<h3>5-2. Integration Test (E2E)</h3>

<p>
Jest + Supertest 기반 통합 테스트<br/>
Controller → Service → Repository → DB 전체 흐름 검증
</p>

<ul>
  <li>정상 CRUD 동작</li>
  <li>401 인증 실패</li>
  <li>403 권한 위반</li>
  <li>404 삭제 후 접근 검증</li>
  <li>사용자 간 상호작용 시나리오</li>
</ul>

<h3>5-3. Postman Scenario Test</h3>

<p>
Collection Runner 기반 사용자 시나리오 테스트 구성
</p>

<ul>
  <li>동적 사용자 생성 (이메일 중복 방지)</li>
  <li>Environment 변수 기반 상태 공유</li>
  <li>전체 흐름 일괄 실행 가능</li>
</ul>

<hr/>

<h2>6. Key Implementation Points</h2>

<ul>
  <li>JWT Guard 기반 인증 책임 분리</li>
  <li>Service 레벨에서 작성자 권한 검증 처리</li>
  <li>관계 테이블(Follow, Like) 설계</li>
  <li>중복 데이터 방지 로직 구현</li>
  <li>Unit + E2E 테스트 이중 검증 구조</li>
  <li>테스트 가능성을 고려한 계층 분리 설계</li>
</ul>

<hr/>

<h2>7. How to Run</h2>

<pre>
npm install
npm run start:dev
</pre>

<p><b>Run E2E Test</b></p>

<pre>
npm run test:e2e
</pre>

<hr/>

<h2>8. Future Improvements</h2>

<ul>
  <li>ERD 다이어그램 정리</li>
  <li>모듈 구조 다이어그램 추가</li>
  <li>GitHub Actions CI 적용</li>
  <li>AWS 배포</li>
</ul>