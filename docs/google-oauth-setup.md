# 구글 드라이브 동기화 — OAuth 클라이언트 ID 발급(무료, 1회)

1. https://console.cloud.google.com → 새 프로젝트(예: "보통의 정원").
2. "API 및 서비스" → 라이브러리 → **Google Drive API** 사용 설정.
3. "API 및 서비스" → OAuth 동의 화면 → **External**, 앱 이름·이메일 입력.
   - 게시 상태 = **테스트**. 테스트 사용자에 **아내·본인 이메일** 추가(둘 → 구글 앱 심사 불필요).
   - 범위는 별도 추가 안 함(앱이 런타임에 drive.appdata만 요청).
4. "사용자 인증 정보" → 사용자 인증 정보 만들기 → **OAuth 클라이언트 ID** → 유형 **웹 애플리케이션**.
   - **승인된 JavaScript 원본**:
     - `https://rakonteto.github.io`
     - `http://localhost:5173`
   - 리디렉션 URI는 비워둠(토큰 모델은 불필요).
5. 발급된 클라이언트 ID를:
   - 로컬: `.env`에 `VITE_GOOGLE_CLIENT_ID=...`
   - 배포: GitHub repo → Settings → Secrets and variables → Actions → **Variables** 탭 → `VITE_GOOGLE_CLIENT_ID` 추가.
6. 재빌드/재배포 후 설정 화면에서 "구글로 로그인".
