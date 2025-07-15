
function searchFlight() {
  const input = document.getElementById("flightInput").value.trim();
  const routeInfo = document.getElementById("routeInfo");
  const notamOriginal = document.getElementById("notamOriginal");
  const notamTranslated = document.getElementById("notamTranslated");

  const routes = {
    "6001": ["RKSI", "VMMC"],
    "1373": ["RKSI", "RJBB"]
  };

  if (!routes[input]) {
    routeInfo.textContent = "알 수 없는 편명입니다.";
    notamOriginal.textContent = "";
    notamTranslated.textContent = "";
    return;
  }

  const [dep, arr] = routes[input];
  routeInfo.textContent = `출발지: ${dep}, 목적지: ${arr}`;

  // 실시간 API 연동 (모의)
  fetch(`https://notamapi.jejuair/api/mock?from=${dep}&to=${arr}`)
    .then(r => r.json())
    .then(data => {
      notamOriginal.textContent = data.original;
      notamTranslated.textContent = data.translated;
    })
    .catch(() => {
      notamOriginal.textContent = `[${dep}] 및 [${arr}] NOTAM을 불러오는 중 오류 발생`;
      notamTranslated.textContent = "";
    });
}

window.onload = () => {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  document.getElementById("timeDisplay").textContent = now;
};
