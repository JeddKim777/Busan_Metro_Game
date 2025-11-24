// ====================================================================
// 부산 지하철 노선도 채우기 게임 - game.js (최종 로직)
// ====================================================================

// --- 1. 게임 데이터 (노선별 역 순서) ---

const lineData = {
    "lines": [
        {"line_id": "line_1", "name": "1호선", "color": "#ff0000"},
        {"line_id": "line_2", "name": "2호선", "color": "#009933"},
        {"line_id": "line_3", "name": "3호선", "color": "#ff9900"},
        {"line_id": "line_4", "name": "4호선", "color": "#0000ff"},
        {"line_id": "line_k", "name": "동해선", "color": "#009d91"},
        {"line_id": "line_bgl", "name": "부산김해경전철", "color": "#9966cc"}
    ],
    "routes": {
        // 1호선 (40개 역)
        "line_1": [
            "다대포해수욕장", "다대포항", "낫개", "신장림", "장림", "동매", "신평", "하단", "당리", "사하", "괴정", "대티", 
            "서대신", "동대신", "토성", "자갈치", "남포", "중앙", "부산역", "초량", "좌천", "범일", "범내골", "서면", 
            "부전", "양정", "시청", "연산", "교대", "동래", "명륜", "온천장", "부산대", "장전", "구서", "두실", "남산", 
            "범어사", "노포" // 총 39개 역 (다대포, 노포는 종점 표시를 위해 보통 포함)
        ],
        // 2호선 (40개 역)
        "line_2": [
            "장산", "중동", "해운대", "동백", "벡스코", "센텀시티", "민락", "수영", "광안", "금련산", "남천", "경성대·부경대", 
            "대연", "못골", "지게골", "문현", "국제금융센터·부산은행", "서면", "부암", "가야", "동의대", "개금", "냉정", 
            "주례", "감전", "사상", "덕포", "모라", "구남", "구명", "덕천", "수정", "화명", "율리", "금곡", "호포", 
            "증산", "부산대양산캠퍼스", "남양산", "양산" // 총 40개 역
        ],
        // 3호선 (17개 역)
        "line_3": [
            "수영", "망미", "배산", "물만골", "연산", "거제", "종합운동장", "사직", "미남", "만덕", "남산정", "숙등", 
            "덕천", "구포", "강서구청", "체육공원", "대저"
        ],
        // 4호선 (14개 역)
        "line_4": [
            "미남", "동래", "낙민", "충렬사", "명장", "서동", "금사", "반여농산물시장", "석대", "영산대", "고촌", "안평"
        ],
        // 동해선 (20개 역 - 부전 ~ 태화강 기준)
        "line_k": [
            "부전", "거제해맞이", "거제", "교대", "동래", "안락", "재송", "센텀", "벡스코", "신해운대", "송정", "오시리아", 
            "기장", "일광", "좌천", "월내", "원자력의학원", "남창", "서생", "태화강" 
        ],
        // 부산김해경전철 (21개 역)
        "line_bgl": [
            "사상", "괘법르네시떼", "서부산유통지구", "공항", "대저", "평강", "대사", "불암", "김해대학", "지내", 
            "김해시청", "부원", "봉황", "수로왕릉", "박물관", "연지공원", "장신대", "가야대"
        ]
    }
};


// --- 2. 전역 변수 및 상태 관리 ---

let currentLineId;
let currentRoute;         // 현재 노선의 전체 역 이름 배열
let currentStationIndex;  // 플레이어가 맞춰야 할 다음 역의 인덱스
let score = 0;
let streak = 0;           // 연속 정답 횟수
let gameStarted = false;


// --- 3. DOM 요소 캐싱 ---

const $scoreValue = document.getElementById('score-value');
const $streakValue = document.getElementById('streak-value');
const $lineDisplay = document.getElementById('line-display');
const $currentProgress = document.getElementById('current-progress');
const $stationInput = document.getElementById('station-input');
const $message = document.getElementById('message');
const $startButton = document.getElementById('start-button');
const $resetButton = document.getElementById('reset-button');
const $checkButton = document.getElementById('check-button');


// --- 4. 헬퍼 함수 ---

// 입력값을 표준화 (띄어쓰기, 하이픈 제거)하여 비교 정확도를 높임
function normalizeInput(input) {
    return input.trim()
                .replace(/ /g, '')      // 띄어쓰기 제거
                .replace(/-/g, '')      // 하이픈 제거 (예: 경성대-부경대)
                .replace(/·/g, '')      // 가운뎃점 제거 (예: 경성대·부경대)
                .toLowerCase();
}

// 다음 문제 (다음 노선) 선택
function getNextLine() {
    const lineIds = Object.keys(lineData.routes);
    if (lineIds.length === 0) return null;
    
    // 무작위로 하나의 노선 선택 (단, 이전 노선과 겹치지 않게 시도)
    let nextLineId;
    let attempts = 0;
    do {
        const randomIndex = Math.floor(Math.random() * lineIds.length);
        nextLineId = lineIds[randomIndex];
        attempts++;
    } while (nextLineId === currentLineId && lineIds.length > 1 && attempts < 10); // 최대 10번 시도

    return nextLineId;
}

// 진행 상황을 시각적으로 표시
function updateProgressDisplay() {
    let display = "";
    
    for (let i = 0; i < currentRoute.length; i++) {
        let stationName = currentRoute[i];
        
        if (i < currentStationIndex) {
            // 이미 맞춘 역
            display += `<span class="correct">${stationName}</span>`;
        } else if (i === currentStationIndex) {
            // 맞춰야 할 다음 역 (빨간색으로 강조)
            display += `<span class="next-station">???</span>`;
        } else {
            // 아직 맞추지 않은 역
            display += `<span class="placeholder">${'•'.repeat(stationName.length)}</span>`; 
        }
        
        // 연결선
        if (i < currentRoute.length - 1) {
            display += " &mdash; "; 
        }
    }
    $currentProgress.innerHTML = display;
}


// --- 5. 게임 로직 함수 ---

// 게임 시작
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    score = 0;
    streak = 0;
    $scoreValue.textContent = score;
    $streakValue.textContent = streak;
    $startButton.style.display = 'none';
    $resetButton.style.display = 'inline-block';
    
    // 입력/확인 활성화
    $stationInput.disabled = false;
    $checkButton.disabled = false;
    $stationInput.focus();
    
    $message.textContent = "게임을 시작합니다! 다음 역 이름을 입력하세요.";

    startNextLine();
}

// 다음 노선으로 이동 (새로운 라운드)
function startNextLine() {
    currentLineId = getNextLine();
    if (!currentLineId) {
        $message.textContent = "오류: 노선 데이터가 없습니다.";
        return;
    }
    
    currentRoute = lineData.routes[currentLineId];
    currentStationIndex = 0;

    const lineInfo = lineData.lines.find(l => l.line_id === currentLineId);
    $lineDisplay.innerHTML = `<span style="color: ${lineInfo.color};">${lineInfo.name}</span> 노선`;
    
    // 게임 시작 시 처음 역을 미리 표시하고 다음 역부터 맞추도록 설정
    currentStationIndex = 1; // 첫 역은 힌트로 제시
    $stationInput.value = "";
    $message.innerHTML = `현재 노선의 시작 역은 <span class="correct">${currentRoute[0]}</span>입니다. 다음 역을 입력하세요.`;
    updateProgressDisplay();
}

// 정답 확인
function checkAnswer() {
    if (!gameStarted || currentStationIndex >= currentRoute.length) return;
    
    const input = $stationInput.value;
    if (input.trim() === "") return;

    const correctStation = currentRoute[currentStationIndex];
    
    // 정답 체크 (표준화된 문자열로 비교)
    if (normalizeInput(input) === normalizeInput(correctStation)) {
        // --- 정답 처리 ---
        score += 10 + streak; // 연속 정답 시 보너스 점수
        streak++;
        $scoreValue.textContent = score;
        $streakValue.textContent = streak;
        
        $message.innerHTML = `<span class="correct">✅ 정답! ${correctStation}</span>`;
        
        currentStationIndex++;
        
        $stationInput.value = "";
        $stationInput.focus();
        
        if (currentStationIndex >= currentRoute.length) {
            // 노선 완료!
            $message.innerHTML = `<span class="correct">🎉 축하합니다! ${lineData.lines.find(l => l.line_id === currentLineId).name} 노선 완주! (보너스 +50점)</span>`;
            score += 50;
            $scoreValue.textContent = score;
            streak = 0;
            $streakValue.textContent = streak;
            setTimeout(startNextLine, 3000); // 3초 후 다음 노선 시작
        } else {
            updateProgressDisplay();
        }
    } else {
        // --- 오답 처리 ---
        streak = 0;
        $streakValue.textContent = streak;

        // 정답을 보여주고, 해당 노선 초기화
        $message.innerHTML = `❌ 틀렸습니다! 정답은 <span class="missed">${correctStation}</span>였습니다.`;
        
        // 입력창 비활성화 및 다음 라운드 준비
        $stationInput.disabled = true;
        $checkButton.disabled = true;

        // 3초 후 다음 노선 시작 (새로운 문제)
        setTimeout(() => {
            $stationInput.value = "";
            $stationInput.disabled = false;
            $checkButton.disabled = false;
            $stationInput.focus();
            $message.textContent = "새로운 노선을 시작합니다. 화이팅!";
            startNextLine();
        }, 3000);
    }
}

// 게임 리셋
function resetGame() {
    gameStarted = false;
    score = 0;
    streak = 0;
    $scoreValue.textContent = 0;
    $streakValue.textContent = 0;
    $lineDisplay.textContent = "";
    $currentProgress.textContent = "";
    $stationInput.value = "";
    $stationInput.disabled = true;
    $checkButton.disabled = true;

    $message.textContent = "시작 버튼을 눌러 새로운 게임을 시작하세요.";
    $startButton.style.display = 'inline-block';
    $resetButton.style.display = 'none';
}


// --- 6. 이벤트 리스너 ---

window.onload = () => {
    // 버튼 이벤트 연결
    $startButton.addEventListener('click', startGame);
    $resetButton.addEventListener('click', resetGame);
    $checkButton.addEventListener('click', checkAnswer);

    // Enter 키로 정답 확인
    $stationInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // 기본 폼 제출 방지
            checkAnswer();
        }
    });

    // 초기 상태 설정
    resetGame();
};
