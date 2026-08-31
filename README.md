# dongsoo-eunji.github.io

## 베스트 사진 이벤트

`/wedding/`과 `/wedding/m/`은 공통 `PhotoEvent` 컴포넌트를 사용합니다. 접수는
페이지 공개 시점부터 2026-10-04 20:00 KST 직전까지, 결과 발표는 22:00 KST부터이며
절대시각으로 판정해 실행 환경의 timezone에 영향을 받지 않습니다.

정적 프런트엔드는 `https://api.hided.net/wedding/photo-event` API를 사용합니다.
업로드 형식은 JPEG, PNG, WebP, AVIF, HEIC/HEIF이며 한 번에 최대 5장,
사진당 최대 크기는 15MB입니다.
사진은 이름·연락처와 함께 비공개 후보로 저장되고, 공개 결과에는 관리자가 선정한
세 장만 포함됩니다. 운영 당일에는
`https://api.hided.net/wedding/admin/`에서 기존 관리키로 로그인한 뒤 후보를 원하는
순서대로 세 장 선택해 저장합니다. API 환경 변수, 백업, 이미지 처리와 endpoint
세부사항은 서버의 `/home/letrhee/docker_compose_script/wedding_api/README.md`를
참고하세요.

공개 방명록은 이름과 내용만 표시하며 작성 시각은 노출하지 않습니다. 작성 시각은
운영 기록을 위해 API 서버 DB와 인증된 관리자 화면에만 유지됩니다.

시간 경계 테스트는 `pnpm photo-event:test`로 실행합니다.

## 청첩장 잠금

`/wedding/`과 `/wedding/m/`은 2026-10-10 23:59 KST부터 비밀번호 입력 화면을
표시합니다. 현재 `.env`의 `see_passwd`에서 한 번 생성한 random salt와
PBKDF2-SHA256 결과만 코드에 포함하며 원문 비밀번호나 Actions secret은 사용하지
않습니다. 경계 및 해시 테스트는 `pnpm access:test`로 실행합니다.
