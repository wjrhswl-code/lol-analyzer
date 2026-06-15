# OP분석 — 롤 AI 전적 분석

챔피언 장인 1위와 내 플레이를 Claude AI가 비교 분석해주는 서비스.

## 기능
- Riot API 실시간 전적 조회
- 챔피언 장인(챌린저 1위) 기준 통계와 비교
- Claude AI 자동 분석: 잘한 점 / 부족한 점 / 티어 향상 조언
- 100점 만점 플레이 점수
- 챔피언별 통계 탭

## 로컬 실행

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 열어서 키 입력

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## Vercel 배포

1. GitHub에 push
2. vercel.com에서 import
3. Environment Variables에 아래 두 개 추가:
   - `RIOT_API_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy

## API 키 발급

- **Riot API Key**: https://developer.riotgames.com (24시간마다 재발급 필요)
- **Anthropic API Key**: https://console.anthropic.com
