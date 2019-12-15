<p align="center">
    <img src="/docs/images/MindWall-Logo.svg">
</p>

# 광신고 마음의담
**광신고 마음의담**은 2017년 광신고등학교 동아리 발표회 때 컴퓨터부 동아리 부스를 위해 제작한 디지털 소원걸이입니다. 친구들이 작성한 메시지의 내용을 [Google Cloud](https://cloud.google.com/)의 [Natural Language API](https://cloud.google.com/natural-language/)에 전송해 얻은 감정 결과를 바탕으로 긍정적인 내용은 파란색 말풍선으로, 부정적인 메시지는 빨간색 말풍선으로 표시하며, 글자수 대비 타이핑 시간이 길수록 말풍선을 크게 표시합니다. 또 [D3.js](https://github.com/d3/d3)의 Force Layout을 사용하여 말풍선이 중력장 위에 둥둥 떠다니고 이를 드래그할 수 있는 인터랙션 효과를 구현했습니다.
## 실행
`/google-cloud` 디렉토리에 `gcp-key.json` 파일을 위치시키고, `/config/default.json`에서 MongoDB URL을 자신의 환경에 알맞게 수정해야 합니다.
