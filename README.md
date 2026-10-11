# aaiss0927.github.io

조현준 개인 포트폴리오 사이트. https://aaiss0927.github.io/

빌드 도구 없이 정적 파일만으로 구성되어 있고, `main` 브랜치 루트가 GitHub Pages로 그대로 서빙됩니다.

## 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 단일 페이지 (Hero · Projects · Awards & Publication · How I Work · Experience · Education & Skills · Writing · Contact) |
| `styles.css` | 스타일. 색은 전부 `:root` 변수, 다크 모드는 `prefers-color-scheme` + `data-theme` 속성 둘 다 지원 |
| `script.js` | 프로젝트 상세 펼침/접기, 현재 섹션 표시, 이메일 복사. JS가 꺼져 있어도 내용은 전부 보임 |
| `assets/` | 프로필 사진, 프로젝트 썸네일, OG 이미지 |
| `favicon.svg` | 탭 아이콘 (헤더의 HJ 마크와 동일) |
| `.nojekyll` | GitHub Pages의 Jekyll 처리 비활성화 |

외부 요청은 폰트(Pretendard Variable, JetBrains Mono)뿐입니다.

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000
```

`index.html`을 바로 열어도 동작합니다.

## 수정 방법

- 내용 수정: `index.html`의 해당 섹션 주석(`<!-- === 01 Projects -->` 등)을 찾아 편집
- 색·간격 조정: `styles.css` 상단의 `:root` 변수
- 커스텀 도메인 연결: 루트에 `CNAME` 파일을 추가하고 `index.html`의 `canonical` / `og:url` / `og:image` 절대 URL을 함께 바꿀 것
