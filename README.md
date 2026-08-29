# dongsoo-eunji.github.io

## 베스트 사진 이벤트

`/wedding/`과 `/wedding/m/`은 공통 `PhotoEvent` 컴포넌트를 사용합니다. 접수는
2026-10-04 14:30 KST부터 20:00 KST 직전까지, 결과 발표는 22:00 KST부터이며
절대시각으로 판정해 실행 환경의 timezone에 영향을 받지 않습니다.

정적 프런트엔드는 `https://api.hided.net/wedding/photo-event` API를 사용합니다.
사진은 이름·연락처와 함께 비공개 후보로 저장되고, 공개 결과에는 관리자가 선정한
세 장만 포함됩니다. 운영 당일에는
`https://api.hided.net/wedding/admin/`에서 기존 관리키로 로그인한 뒤 후보를 원하는
순서대로 세 장 선택해 저장합니다. API 환경 변수, 백업, 이미지 처리와 endpoint
세부사항은 서버의 `/home/letrhee/docker_compose_script/wedding_api/README.md`를
참고하세요.

시간 경계 테스트는 `pnpm photo-event:test`로 실행합니다.
