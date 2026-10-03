# FLOW AI 캐릭터 및 영상만들기

2026년 10월 19일 오후 2시~4시 · 천안 공유오피스 드림캐쳐 · 강사 이은희

50분씩 2회 · 캐릭터 이미지 1장과 짧은 광고영상 1편 실습

공개 주소: https://hiya-flow01.vercel.app

정적 HTML 프로젝트 · Vercel Framework Preset: Other · Output Directory: .

admin.html은 localStorage 기반 목업이며 비밀번호 1234는 데모용.

청중 동기화: https://hiya-flow01.vercel.app/slides.html
강사 로그인: https://hiya-flow01.vercel.app/slides.html?admin
개별 열람: https://hiya-flow01.vercel.app/slides.html?view

Firebase Authentication에 등록한 강사 계정으로 로그인. 비밀번호는 소스에 저장하지 않음.
강사 제어 메뉴에서 청중 동기화 ON/OFF 전환. admin.html 목업과 별개 기능.

강사 제어: 청중 잠금 ON/OFF · PDF 허용 ON/OFF. 잠금 ON이면 강사 화면 추종, OFF이면 각자 이동.
PDF OFF: 사이트의 PDF 버튼과 P 단축키 비활성화. 브라우저 자체 인쇄·화면 캡처 방지 기능은 아님.
Firebase 설정이 비어 있거나 자리표시자이면 자유 열람. ?view는 설정과 관계없이 개별 열람.

## Firebase 콘솔 체크리스트

기존 hiya-flow01 프로젝트는 아래 기본 설정 완료. 새 프로젝트 사용 또는 연결 오류 시 확인용.

- [ ] 프로젝트 설정 → 내 앱 → 웹 앱(</>) 등록 또는 기존 앱 선택
- [ ] SDK 설정 구성 → firebase/firebase-config.js의 공개 설정과 일치 확인
- [ ] Realtime Database 생성 → 잠금 모드 → 데이터베이스 URL을 databaseURL에 입력
- [ ] Authentication → 로그인 방법 → 이메일/비밀번호 활성화
- [ ] Authentication → 사용자 → 강사 계정 추가 → UID 복사
- [ ] Realtime Database → 규칙 → firebase/database.rules.json 전체 붙여넣기 → 게시
- [ ] Realtime Database → 데이터 → admins → 복사한 UID → Boolean true 추가
- [ ] DECK_ID = hiya-flow01-20261019와 규칙의 강의 경로 일치 확인
- [ ] slides.html?admin 강사 로그인 → 일반 slides.html 청중 화면과 나란히 열기
- [ ] 강사 이동 후 청중 이동, 잠금 OFF 자유 이동, PDF OFF 버튼·P 차단 확인

admins는 데이터베이스 최상위 경로. 값은 문자열 "true"가 아닌 Boolean true.
슬라이드 수나 DECK_ID 변경 시 database.rules.json 검증 범위와 강의 경로도 수정.
설정 후 정적 파일을 HTTP 서버 또는 Vercel에서 열기. file://에서 모듈 스크립트 실행 제한 가능.

