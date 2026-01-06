# 🚀 Premium Blog Monitor

네이버 블로그 검색 API를 활용한 실시간 블로그 모니터링 웹 서비스입니다. 중복된 포스팅을 제거하고 최신순으로 정렬하여 사용자에게 제공합니다.

## ✨ 주요 기능
- **키워드 필터링**: 미리 정의된 키워드 또는 커스텀 키워드 선택 가능
- **중복 제거**: 동일한 URL 또는 제목을 가진 포스팅은 최신 항목만 유지
- **최신순 정렬**: 수집된 모든 블로그를 발행일 기준 내림차순 정렬
- **프리미엄 UI**: 다크 모드 기반의 글래스모피즘 디자인 및 부드러운 애니메이션

## 🛠 로컬 실행 방법
1. **의존성 설치**
   ```bash
   pip install -r requirements.txt
   ```
2. **API 키 설정**
   `.env` 파일에 네이버 API 권한 증명을 설정합니다. (이미 설정되어 있다면 생략)
   ```env
   NAVER_CLIENT_ID=여러분의_ID
   NAVER_CLIENT_SECRET=여러분의_SECRET
   ```
3. **서버 실행**
   ```bash
   python local_server.py
   ```
4. 브라우저에서 `http://localhost:8000` 접속

## ☁️ Vercel 배포 방법
1. Vercel에 새 프로젝트를 생성하고 이 저장소를 연결합니다.
2. **Environment Variables** 설정 섹션에서 다음 두 항목을 추가합니다:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
3. 배포가 완료되면 생성된 URL로 접속합니다.

## 📝 기술 스택
- **Frontend**: HTML5, Vanilla CSS, Javascript (ES6+)
- **Backend**: Python (Vercel Serverless Functions)
- **API**: Naver Search API (Blog)
