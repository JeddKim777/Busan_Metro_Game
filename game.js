// ====================================================
// game.js: 부산 지하철 게임 (데이터 내장 & 노선 뱃지 포함)
// ====================================================

// --- 환경 설정 ---
const LINE_COLORS = {
    "1호선": "#FF7C00",      // 주황색
    "2호선": "#00A950",      // 녹색
    "3호선": "#F2B900",      // 황토색
    "4호선": "#00A0E9",      // 하늘색
    "부산김해경전철": "#800080", // 💜 보라색으로 수정
    "동해선": "#004987"      // 진한 파란색
};

// --- 게임 상태 변수 ---
let score = 0;
let round = 0;
let targetStations = 0; 
let guessedStations = new Set(); 
let allStationNames = []; 
let gameStarted = false;

// Leaflet 지도 객체
let map; 

// --- 역 데이터 (JSON 파일 대신 직접 삽입) ---
const stationData = [
  /*1호선 시작*/
  { "line": "1호선", "name": "다대포해수욕장", "lat": 35.048226, "lon": 128.965616 },
  { "line": "1호선", "name": "다대포항", "lat": 35.06015, "lon": 128.97531 },
  { "line": "1호선", "name": "낫개", "lat": 35.06821, "lon": 128.97746 },
  { "line": "1호선", "name": "신장림", "lat": 35.07638, "lon": 128.97652 },
  { "line": "1호선", "name": "장림", "lat": 35.08204, "lon": 128.97733 },
  { "line": "1호선", "name": "동매", "lat": 35.0899, "lon": 128.9742 },
  { "line": "1호선", "name": "신평", "lat": 35.095179, "lon": 128.960564 },
  { "line": "1호선", "name": "하단", "lat": 35.10618, "lon": 128.966803 },
  { "line": "1호선", "name": "당리", "lat": 35.103532, "lon": 128.973846 },
  { "line": "1호선", "name": "사하", "lat": 35.099847, "lon": 128.9831 },
  { "line": "1호선", "name": "괴정", "lat": 35.099816, "lon": 128.992144 },
  { "line": "1호선", "name": "대티", "lat": 35.103126, "lon": 128.999936 },
  { "line": "1호선", "name": "서대신", "lat": 35.110937, "lon": 129.012178 },
  { "line": "1호선", "name": "동대신", "lat": 35.110452, "lon": 129.017684 },
  { "line": "1호선", "name": "토성", "lat": 35.100727, "lon": 129.019776 },
  { "line": "1호선", "name": "자갈치", "lat": 35.097372, "lon": 129.02667 },
  { "line": "1호선", "name": "남포", "lat": 35.097953, "lon": 129.034869 },
  { "line": "1호선", "name": "중앙", "lat": 35.103837, "lon": 129.036371 },
  { "line": "1호선", "name": "부산", "lat": 35.115224, "lon": 129.0397 },
  { "line": "1호선", "name": "초량", "lat": 35.121168, "lon": 129.043039 },
  { "line": "1호선", "name": "부산진", "lat": 35.127787, "lon": 129.047894 },
  { "line": "1호선", "name": "좌천", "lat": 35.134361, "lon": 129.054455 },
  { "line": "1호선", "name": "범일", "lat": 35.140952, "lon": 129.059352 },
  { "line": "1호선", "name": "범내골", "lat": 35.1474, "lon": 129.059261 },
  { "line": "1호선", "name": "서면", "lat": 35.158282, "lon": 129.059556 },
  { "line": "1호선", "name": "부전", "lat": 35.162587, "lon": 129.062952 },
  { "line": "1호선", "name": "양정", "lat": 35.173122, "lon": 129.071366 },
  { "line": "1호선", "name": "시청", "lat": 35.179837, "lon": 129.076642 },
  { "line": "1호선", "name": "연산", "lat": 35.186168, "lon": 129.081534 },
  { "line": "1호선", "name": "교대", "lat": 35.19605, "lon": 129.080035 },
  { "line": "1호선", "name": "동래", "lat": 35.205641, "lon": 129.078506 },
  { "line": "1호선", "name": "명륜", "lat": 35.212551, "lon": 129.079659 },
  { "line": "1호선", "name": "온천장", "lat": 35.220249, "lon": 129.086437 },
  { "line": "1호선", "name": "부산대", "lat": 35.229609, "lon": 129.089358 },
  { "line": "1호선", "name": "장전", "lat": 35.238091, "lon": 129.088111 },
  { "line": "1호선", "name": "구서", "lat": 35.247407, "lon": 129.091327 },
  { "line": "1호선", "name": "두실", "lat": 35.256959, "lon": 129.091386 },
  { "line": "1호선", "name": "남산", "lat": 35.265404, "lon": 129.092496 },
  { "line": "1호선", "name": "범어사", "lat": 35.273105, "lon": 129.092679 },
  { "line": "1호선", "name": "노포", "lat": 35.284687, "lon": 129.094967 },
  /* 2호선 시작 */
  { "line": "2호선", "name": "장산", "lat": 35.1764, "lon": 129.1843 },
  { "line": "2호선", "name": "중동", "lat": 35.1728, "lon": 129.1752 },
  { "line": "2호선", "name": "해운대", "lat": 35.1633, "lon": 129.1678 },
  { "line": "2호선", "name": "동백", "lat": 35.1585, "lon": 129.1555 },
  { "line": "2호선", "name": "벡스코", "lat": 35.1717, "lon": 129.1624 }, 
  { "line": "2호선", "name": "센텀시티", "lat": 35.1691, "lon": 129.1332 },
  { "line": "2호선", "name": "민락", "lat": 35.1723, "lon": 129.1245 },
  { "line": "2호선", "name": "수영", "lat": 35.1737, "lon": 129.1171 }, 
  { "line": "2호선", "name": "광안", "lat": 35.1663, "lon": 129.1158 },
  { "line": "2호선", "name": "금련산", "lat": 35.1584, "lon": 129.1102 },
  { "line": "2호선", "name": "남천", "lat": 35.1495, "lon": 129.1027 },
  { "line": "2호선", "name": "경성대.부경대", "lat": 35.1436, "lon": 129.0963 },
  { "line": "2호선", "name": "대연", "lat": 35.1362, "lon": 129.0883 },
  { "line": "2호선", "name": "못골", "lat": 35.1299, "lon": 129.0815 },
  { "line": "2호선", "name": "지게골", "lat": 35.1234, "lon": 129.0745 },
  { "line": "2호선", "name": "문현", "lat": 35.1166, "lon": 129.0683 },
  { "line": "2호선", "name": "국제금융센터.부산은행", "lat": 35.1121, "lon": 129.0617 },
  { "line": "2호선", "name": "전포", "lat": 35.1420, "lon": 129.0594 },
  { "line": "2호선", "name": "서면", "lat": 35.158282, "lon": 129.059556 }, 
  { "line": "2호선", "name": "부암", "lat": 35.1633, "lon": 129.0538 },
  { "line": "2호선", "name": "가야", "lat": 35.1712, "lon": 129.0468 },
  { "line": "2호선", "name": "동의대", "lat": 35.1798, "lon": 129.0379 },
  { "line": "2호선", "name": "개금", "lat": 35.1882, "lon": 129.0298 },
  { "line": "2호선", "name": "냉정", "lat": 35.1950, "lon": 129.0234 },
  { "line": "2호선", "name": "주례", "lat": 35.2045, "lon": 129.0141 },
  { "line": "2호선", "name": "감전", "lat": 35.2135, "lon": 129.0068 },
  { "line": "2호선", "name": "사상", "lat": 35.1539, "lon": 128.9951 }, 
  { "line": "2호선", "name": "덕포", "lat": 35.1566, "lon": 128.9859 },
  { "line": "2호선", "name": "모덕", "lat": 35.1678, "lon": 128.9788 },
  { "line": "2호선", "name": "모라", "lat": 35.1802, "lon": 128.9733 },
  { "line": "2호선", "name": "구남", "lat": 35.1911, "lon": 128.9744 },
  { "line": "2호선", "name": "구명", "lat": 35.2015, "lon": 128.9792 },
  { "line": "2호선", "name": "덕천", "lat": 35.2078, "lon": 128.9806 }, 
  { "line": "2호선", "name": "수정", "lat": 35.2177, "lon": 128.9845 },
  { "line": "2호선", "name": "화명", "lat": 35.2289, "lon": 128.9958 },
  { "line": "2호선", "name": "율리", "lat": 35.2393, "lon": 129.0063 },
  { "line": "2호선", "name": "동원", "lat": 35.2533, "lon": 129.0147 },
  { "line": "2호선", "name": "금곡", "lat": 35.2638, "lon": 129.0183 },
  { "line": "2호선", "name": "호포", "lat": 35.2759, "lon": 129.0041 },
  { "line": "2호선", "name": "증산", "lat": 35.2890, "lon": 128.9858 },
  { "line": "2호선", "name": "부산대양산캠퍼스", "lat": 35.2952, "lon": 128.9754 },
  { "line": "2호선", "name": "남양산", "lat": 35.3052, "lon": 128.9649 },
  { "line": "2호선", "name": "양산", "lat": 35.3168, "lon": 128.9554 },
  /* 3호선 시작 */
  { "line": "3호선", "name": "수영", "lat": 35.1737, "lon": 129.1171 }, 
  { "line": "3호선", "name": "망미", "lat": 35.1843, "lon": 129.1232 },
  { "line": "3호선", "name": "배산", "lat": 35.1873, "lon": 129.1165 },
  { "line": "3호선", "name": "물만골", "lat": 35.1895, "lon": 129.1022 },
  { "line": "3호선", "name": "연산", "lat": 35.186168, "lon": 129.081534 }, 
  { "line": "3호선", "name": "거제", "lat": 35.1956, "lon": 129.0792 },
  { "line": "3호선", "name": "종합운동장", "lat": 35.2046, "lon": 129.0768 },
  { "line": "3호선", "name": "사직", "lat": 35.2125, "lon": 129.0734 },
  { "line": "3호선", "name": "미남", "lat": 35.2210, "lon": 129.0664 }, 
  { "line": "3호선", "name": "만덕", "lat": 35.2345, "lon": 129.0526 },
  { "line": "3호선", "name": "남산정", "lat": 35.2355, "lon": 129.0371 },
  { "line": "3호선", "name": "숙등", "lat": 35.2267, "lon": 129.0062 },
  { "line": "3호선", "name": "덕천", "lat": 35.2078, "lon": 128.9806 }, 
  { "line": "3호선", "name": "구포", "lat": 35.2044, "lon": 128.9804 },
  { "line": "3호선", "name": "강서구청", "lat": 35.2084, "lon": 128.9701 },
  { "line": "3호선", "name": "체육공원", "lat": 35.2155, "lon": 128.9696 },
  { "line": "3호선", "name": "대저", "lat": 35.2281, "lon": 128.9666 }, 
  /*4호선 시작*/
  { "line": "4호선", "name": "미남", "lat": 35.2210, "lon": 129.0664 }, 
  { "line": "4호선", "name": "동래", "lat": 35.205641, "lon": 129.078506 }, 
  { "line": "4호선", "name": "수안", "lat": 35.2045, "lon": 129.0837 },
  { "line": "4호선", "name": "낙민", "lat": 35.2055, "lon": 129.0906 },
  { "line": "4호선", "name": "충렬사", "lat": 35.2044, "lon": 129.0982 },
  { "line": "4호선", "name": "명장", "lat": 35.2104, "lon": 129.1084 },
  { "line": "4호선", "name": "서동", "lat": 35.2109, "lon": 129.1206 },
  { "line": "4호선", "name": "금사", "lat": 35.2106, "lon": 129.1303 },
  { "line": "4호선", "name": "반여농산물시장", "lat": 35.2117, "lon": 129.1413 },
  { "line": "4호선", "name": "석대", "lat": 35.2078, "lon": 129.1519 },
  { "line": "4호선", "name": "영산대", "lat": 35.2023, "lon": 129.1678 },
  { "line": "4호선", "name": "동부산대학", "lat": 35.2027, "lon": 129.1768 },
  { "line": "4호선", "name": "고촌", "lat": 35.2020, "lon": 129.1867 },
  { "line": "4호선", "name": "안평", "lat": 35.2064, "lon": 129.1925 },
  /* 경전철 시작*/
  { "line": "부산김해경전철", "name": "사상", "lat": 35.1539, "lon": 128.9951 }, 
  { "line": "부산김해경전철", "name": "괘법르네시떼", "lat": 35.1633, "lon": 128.9959 },
  { "line": "부산김해경전철", "name": "서부산유통지구", "lat": 35.1760, "lon": 128.9904 },
  { "line": "부산김해경전철", "name": "공항", "lat": 35.1855, "lon": 128.9880 },
  { "line": "부산김해경전철", "name": "덕두", "lat": 35.1956, "lon": 128.9823 },
  { "line": "부산김해경전철", "name": "등구", "lat": 35.2059, "lon": 128.9774 },
  { "line": "부산김해경전철", "name": "대저", "lat": 35.2281, "lon": 128.9666 }, 
  { "line": "부산김해경전철", "name": "평강", "lat": 35.2305, "lon": 128.9567 },
  { "line": "부산김해경전철", "name": "대사", "lat": 35.2343, "lon": 128.9482 },
  { "line": "부산김해경전철", "name": "불암", "lat": 35.2359, "lon": 128.9328 },
  { "line": "부산김해경전철", "name": "지내", "lat": 35.2370, "lon": 128.9103 },
  { "line": "부산김해경전철", "name": "김해대학", "lat": 35.2335, "lon": 128.9248 },
  { "line": "부산김해경전철", "name": "인제대", "lat": 35.2458, "lon": 128.9048 },
  { "line": "부산김해경전철", "name": "김해시청", "lat": 35.2329, "lon": 128.8872 },
  { "line": "부산김해경전철", "name": "부원", "lat": 35.2319, "lon": 128.8809 },
  { "line": "부산김해경전철", "name": "수로왕릉", "lat": 35.2344, "lon": 128.8752 },
  { "line": "부산김해경전철", "name": "박물관", "lat": 35.2319, "lon": 128.8705 },
  { "line": "부산김해경전철", "name": "연지공원", "lat": 35.2343, "lon": 128.8601 },
  { "line": "부산김해경전철", "name": "장신대", "lat": 35.2386, "lon": 128.8471 },
  { "line": "부산김해경전철", "name": "가야대", "lat": 35.2415, "lon": 128.8359 },
  /* 동해선 시작*/
  { "line": "동해선", "name": "부전", "lat": 35.162587, "lon": 129.062952 }, 
  { "line": "동해선", "name": "거제해맞이", "lat": 35.1822, "lon": 129.0692 },
  { "line": "동해선", "name": "거제", "lat": 35.1956, "lon": 129.0792 }, 
  { "line": "동해선", "name": "교대", "lat": 35.19605, "lon": 129.080035 }, 
  { "line": "동해선", "name": "동래", "lat": 35.205641, "lon": 129.078506 }, 
  { "line": "동해선", "name": "안락", "lat": 35.2087, "lon": 129.1026 },
  { "line": "동해선", "name": "재송", "lat": 35.1912, "lon": 129.1175 },
  { "line": "동해선", "name": "센텀", "lat": 35.1856, "lon": 129.1418 },
  { "line": "동해선", "name": "벡스코", "lat": 35.1717, "lon": 129.1624 }, 
  { "line": "동해선", "name": "신해운대", "lat": 35.1729, "lon": 129.1834 },
  { "line": "동해선", "name": "송정", "lat": 35.1839, "lon": 129.2135 },
  { "line": "동해선", "name": "기장", "lat": 35.2443, "lon": 129.2163 },
  { "line": "동해선", "name": "오시리아", "lat": 35.2155, "lon": 129.2173 },
  { "line": "동해선", "name": "일광", "lat": 35.2678, "lon": 129.2312 },
  { "line": "동해선", "name": "좌천", "lat": 35.3129, "lon": 129.2818 },
  { "line": "동해선", "name": "월내", "lat": 35.3400, "lon": 129.3090 },
  { "line": "동해선", "name": "서생", "lat": 35.3787, "lon": 129.3276 },
  { "line": "동해선", "name": "남창", "lat": 35.4053, "lon": 129.3283 },
  { "line": "동해선", "name": "망양", "lat": 35.4377, "lon": 129.3364 },
  { "line": "동해선", "name": "덕하", "lat": 35.4925, "lon": 129.3332 },
  { "line": "동해선", "name": "개운포", "lat": 35.5036, "lon": 129.3403 },
  { "line": "동해선", "name": "태화강", "lat": 35.5393, "lon": 129.3512 }
];


// ----------------------------------------------------
// 2. 지도 그리기 및 게임 로직
// ----------------------------------------------------

/**
 * 전체 역 정보를 기반으로 노선 폴리라인과 마커를 지도에 그립니다.
 */
function drawInitialMap(stations) {
    if (typeof map === 'undefined' || map === null) {
        console.error("Leaflet map 객체를 찾을 수 없어 지도를 그릴 수 없습니다.");
        return;
    }

    const lines = stations.reduce((acc, station) => {
        if (!acc[station.line]) { acc[station.line] = []; }
        acc[station.line].push([station.lat, station.lon, station.name]); 
        return acc;
    }, {});

    for (const lineName in lines) {
        const lineStations = lines[lineName];
        const color = LINE_COLORS[lineName] || '#000000'; 

        // 1) 노선(Polyline) 그리기 (초기에는 투명도 0으로 숨김)
        const latLngs = lineStations.map(station => [station[0], station[1]]); 

        L.polyline(latLngs, {
            color: color, 
            weight: 5,
            opacity: 0,      
            lineName: lineName 
        }).addTo(map)
        .bindTooltip(lineName, {permanent: false, direction: "top"}); 

        // 2) 역 마커(CircleMarker) 그리기 (초기에는 투명하게 숨김)
        lineStations.forEach(station => {
            const [lat, lon, name] = station;
            
            const marker = L.circleMarker([lat, lon], {
                radius: 4, 
                fillColor: color,
                color: '#fff', 
                weight: 1.5,
                opacity: 0,       
                fillOpacity: 0,   
                lineName: lineName,
                stationName: name 
            }).addTo(map)
              .bindPopup(`<b>${name}역</b><br>${lineName}`); 
            
            // stationData에 마커 객체 저장 (나중에 표시할 때 사용)
            station.marker = marker; 
        });
    }
}

/**
 * 게임을 시작하고 목표 역을 설정합니다.
 */
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    score = 0;
    round = 0;
    guessedStations.clear();
    allStationNames = stationData.map(s => s.name); 

    // UI 요소 활성화 및 비활성화
    const btnStart = document.getElementById('btn-start');
    const btnEndGame = document.getElementById('btn-end-game'); // 새로 추가
    const inputStation = document.getElementById('input-station');
    const btnSubmit = document.getElementById('btn-submit');
    const statusMessage = document.getElementById('status-message');

    if (btnStart) btnStart.style.display = 'none'; 
    if (btnEndGame) btnEndGame.style.display = 'block'; // 게임 시작 시 종료 버튼 보이기
    
    if (inputStation) {
        inputStation.disabled = false;
        inputStation.focus();
    }
    if (btnSubmit) btnSubmit.disabled = false;
    if (statusMessage) statusMessage.textContent = "게임을 시작합니다. 역 이름을 입력해 주세요!";
    
    // 첫 라운드 시작
    startNewRound();
}

/**
 * 다음 라운드를 시작합니다.
 */
function startNewRound() {
    round++;
    document.getElementById('round-display').textContent = round;
    document.getElementById('score-display').textContent = score;

    // 중복 역을 제거한 실제 역 개수를 계산합니다.
    const uniqueStations = new Set(stationData.map(s => s.name));
    targetStations = uniqueStations.size; 
    document.getElementById('total-stations').textContent = targetStations;
    
    updateGuessedListDisplay();
}

/**
 * 입력된 역 이름을 확인하고 처리합니다.
 */
function checkGuess() {
    if (!gameStarted) return;

    const inputStation = document.getElementById('input-station');
    const statusMessage = document.getElementById('status-message');
    const input = inputStation.value.trim().replace('역', ''); 
    if (!input) return;

    // stationData 배열에 해당 역 이름이 포함되어 있는지 확인합니다.
    const isStationExist = allStationNames.includes(input);

    if (!isStationExist) {
        if (statusMessage) statusMessage.textContent = `'${input}'은(는) 부산 지하철 역 이름이 아닙니다. 다시 시도해 주세요.`;
        inputStation.value = '';
        return;
    }

    if (guessedStations.has(input)) {
        if (statusMessage) statusMessage.textContent = `'${input}'은(는) 이미 맞춘 역입니다.`;
        inputStation.value = '';
        return;
    }

    // 정답 처리
    if (statusMessage) statusMessage.textContent = `🎉 정답입니다! '${input}' 역을 찾았습니다.`;
    score++;
    guessedStations.add(input);
    inputStation.value = '';

    // 지도에 마커 표시
    stationData.filter(s => s.name === input)
        .forEach(matchedStation => {
            if (matchedStation.marker) {
                // 이미 맞춘 역은 투명도 1로 표시
                matchedStation.marker.setStyle({ opacity: 1, fillOpacity: 1 });
            }
        });
    
    updateGuessedListDisplay();

    // 게임 종료 조건 확인
    if (guessedStations.size === targetStations) {
        endGame(false); // 모든 역 맞춤
    }
}

/**
 * 맞춘 역 목록 UI를 업데이트합니다. (노선 뱃지 포함)
 */
function updateGuessedListDisplay() {
    const guessedList = document.getElementById('guessed-list');
    document.getElementById('guessed-count').textContent = guessedStations.size;
    
    if (guessedList) {
        guessedList.innerHTML = '';
        
        const sortedGuessedStations = [...guessedStations].sort();
        
        sortedGuessedStations.forEach(name => {
            const li = document.createElement('li');
            
            // 1. 해당 역의 모든 노선 정보를 찾습니다.
            const lines = stationData
                            .filter(s => s.name === name) 
                            .map(s => s.line);            
            
            const uniqueLines = [...new Set(lines)];

            // 2. 노선 아이콘 HTML 생성 (요청하신 대로 두 번째 이미지처럼 노선 뱃지 표시)
            let lineHtml = '';
            uniqueLines.forEach(lineName => {
                const color = LINE_COLORS[lineName] || '#000'; 
                
                // 뱃지 텍스트를 "1", "2", "경" 등으로 축약합니다.
                let badgeText = lineName;
                if (lineName.endsWith('호선')) {
                    badgeText = lineName.replace('호선', '');
                } else if (lineName === '부산김해경전철') {
                    badgeText = '경';
                } else if (lineName === '동해선') {
                    badgeText = '동';
                }
                
                // 인라인 스타일로 뱃지 스타일 적용
                lineHtml += `<span style="
                    display: inline-block;
                    width: 20px; 
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    border-radius: 50%; 
                    background-color: ${color}; 
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    margin-right: 5px;
                    vertical-align: middle;
                ">${badgeText}</span>`;
            });

            // 3. 최종 목록 항목에 삽입
            li.innerHTML = `${lineHtml} ${name}`;
            li.style.padding = '5px 0';
            li.style.borderBottom = '1px dotted #eee';
            
            guessedList.appendChild(li);
        });
    }
}

/**
 * 게임을 종료하고 결과를 표시합니다.
 * @param {boolean} forced - 사용자가 강제로 종료했는지 (종료 버튼을 눌렀는지) 여부
 */
function endGame(forced = false) { 
    gameStarted = false;

    const statusMessage = document.getElementById('status-message');
    const btnSubmit = document.getElementById('btn-submit');
    const inputStation = document.getElementById('input-station');
    const btnStart = document.getElementById('btn-start');
    const btnEndGame = document.getElementById('btn-end-game');
    
    // ⭐ 지도 완성 로직: 모든 노선과 역을 한 번에 표시
    if (map) {
         map.eachLayer(function (layer) {
            // 모든 역 마커 표시
            if (layer.options && layer.options.stationName) {
                layer.setStyle({ opacity: 1, fillOpacity: 1 });
            }
            // 모든 노선 폴리라인 표시
            if (layer instanceof L.Polyline) {
                 layer.setStyle({ opacity: 0.7 });
            }
        });
    }

    // UI 상태 업데이트
    if (btnEndGame) btnEndGame.style.display = 'none'; 
    if (btnStart) btnStart.style.display = 'block'; 
    
    if (forced) { // 강제 종료 시 메시지
        if (statusMessage) statusMessage.textContent = `게임을 중단했습니다. 정답 노선도를 확인하세요! (맞힌 역: ${guessedStations.size}/${targetStations}개)`;
    } else { // 모든 역을 맞췄을 때 메시지
        if (statusMessage) statusMessage.textContent = `🏆 게임 종료! 총 ${targetStations}개의 역을 모두 맞추셨습니다!`;
    }

    if (btnSubmit) btnSubmit.disabled = true;
    if (inputStation) inputStation.disabled = true;
}


// ----------------------------------------------------
// 3. 프로그램 실행 및 이벤트 리스너 설정
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM이 로드된 후 map 객체를 전역 변수 window.map에서 가져옴
    map = window.map; 

    // 2. 초기화 및 마커 그리기
    if (typeof map !== 'undefined' && map !== null) {
        drawInitialMap(stationData);
    } else {
        console.error("Leaflet map 객체를 찾을 수 없어 지도를 그릴 수 없습니다. index.html의 스크립트를 확인하세요.");
    }
    
    // 3. 이벤트 리스너 연결
    const localBtnStart = document.getElementById('btn-start');
    const localBtnEndGame = document.getElementById('btn-end-game'); // 새로 추가된 버튼
    const localBtnSubmit = document.getElementById('btn-submit');
    const localInputStation = document.getElementById('input-station');
    
    if (localBtnStart) {
        localBtnStart.addEventListener('click', startGame);
    }
    
    if (localBtnEndGame) {
        // 게임 종료 버튼 클릭 시 true 플래그와 함께 endGame 호출
        localBtnEndGame.addEventListener('click', () => endGame(true)); 
    }

    if (localBtnSubmit) {
        localBtnSubmit.addEventListener('click', checkGuess);
    }
    if (localInputStation) {
        localInputStation.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && gameStarted) {
                checkGuess();
            }
        });
    }

    // 초기 상태 업데이트 (총 역 개수)
    const uniqueStations = new Set(stationData.map(s => s.name));
    document.getElementById('total-stations').textContent = uniqueStations.size;
});