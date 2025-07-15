
function searchFlight() {
  const flightInput = document.getElementById("flightInput").value.trim();
  const routeInfo = document.getElementById("routeInfo");
  const notamOriginal = document.getElementById("notamOriginal");
  const notamTranslated = document.getElementById("notamTranslated");

  if (!flightInput) {
    alert("편명을 입력하세요.");
    return;
  }

  const routes = {
    "6001": ["RKSI", "VMMC"],
    "1373": ["RKSI", "RJBB"]
  };

  if (!routes[flightInput]) {
    routeInfo.textContent = "알 수 없는 편명입니다.";
    notamOriginal.textContent = "";
    notamTranslated.textContent = "";
    return;
  }

  const [dep, arr] = routes[flightInput];
  routeInfo.textContent = `출발지: ${dep}, 목적지: ${arr}`;

  notamOriginal.textContent = `[${dep} FIR 및 공항]
- NOTAM 1: ...
- NOTAM 2: ...

[${arr} FIR 및 공항]
- NOTAM A: ...
- NOTAM B: ...`;
  notamTranslated.textContent = `[${dep} FIR 및 공항 해석]
- NOTAM 1: ...
- NOTAM 2: ...

[${arr} FIR 및 공항 해석]
- NOTAM A: ...
- NOTAM B: ...`;
}
