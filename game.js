// ====================================================================
// 부산 지하철 노선도 채우기 게임 
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
        // 1호선
        "line_1": [
            "다대포해수욕장", "다대포항", "낫개", "신장림", "장림", "동매", "신평", "하단", "당리", "사하", "괴정", "대티", 
            "서대신", "동대신", "토성", "자갈치", "남포", "중앙", "부산역", "초량", "부산진", "좌천", "범일", "범내골", "서면", 
            "부전", "양정", "시청", "연산", "교대", "동래", "명륜", "온천장", "부산대", "장전", "구서", "두실", "남산", 
            "범어사", "노포"
        ],
        // 2호선 
        "line_2": [
            "장산", "중동", "해운대", "동백", "벡스코", "센텀시티", "민락", "수영", "광안", "금련산", "남천", "경성대부경대", 
            "대연", "못골", "지게골", "문현", "국제금융센터부산은행", "전포", "서면", "부암", "가야", "동의대", "개금", 
            "냉정", "주례", "감전", "사상", "덕포", "모덕", "모라", "구남", "구명", "덕천", "수정", "화명", "율리", "동원", 
            "금곡", "호포", "증산", "부산대양산캠퍼스", "남양산", "양산"
        ],
        // 3호선
        "line_3": [
            "수영", "망미", "배산", "물만골", "연산", "거제", "종합운동장", "사직", "미남", "만덕", "남산정", "숙등", 
            "덕천", "구포", "강서구청", "체육공원", "대저"
        ],
        // 4호선
        "line_4": [
            "미남", "동래", "수안", "낙민", "충렬사", "명장", "서동", "금사", "반여농산물시장", "석대", "영산대", "윗반송", "고촌", "안평"
        ],
        // 동해선
        "line_k": [
            "부전", "거제해맞이", "거제", "교대", "동래", "안락", "부산원동", "재송", "센텀", "벡스코", 
            "신해운대", "송정", "오시리아", "기장", "일광", "좌천", "월내", "고리", "서생", "남창", "망양", "덕하", "개운포", "태화강" 
        ],
        // 부산김해경전철
        "line_bgl": [
            "사상", "괘법르네시떼", "서부산유통지구", "공항", "덕두", "등구", "대저", "평강", "대사", 
            "불암", "지내", "김해대학", "인제대", "김해시청", "부원", "봉황", 
            "수로왕릉", "박물관", "연지공원", "장신대", "가야대"
        ]
    }
};


// --- 2. 전역 변수 및 상태 관리 ---

let currentLineId;
let currentRoute;         
let guessedStations;      
let totalStations;        
let score = 0;
let gameStarted = false;


// --- 3. DOM 요소 캐싱 ---

const $scoreValue = document.getElementById('score-value');
const $lineDisplay = document.getElementById('line-display');
const $currentProgress = document.getElementById('current-progress');
const $stationInput = document.getElementById('station-input');
const $message = document.getElementById('message');
const $startButton = document.getElementById('start-button');
const $resetButton = document.getElementById('reset-button');
const $checkButton = document.getElementById('check-button');


// --- 4. 헬퍼 함수 ---

// 입력값을 표준화 
function normalizeInput(input) {
    return input.trim()
                .replace(/ /g, '')
                .replace(/-/g, '')
                .replace(/·/g, '')
                .toLowerCase();
}

// 다음 문제 (다음 노선) 선택
function getNextLine() {
    const lineIds = Object.keys(lineData.routes);
    if (lineIds.length === 0) return null;
    
    let nextLineId;
    let attempts = 0;
    do {
        const randomIndex = Math.floor(Math.random() * lineIds.length);
        nextLineId = lineIds[randomIndex];
        attempts++;
    } while (nextLineId === currentLineId && lineIds.length > 1 && attempts < 10); 

    return nextLineId;
}

// 진행 상황을 시각적으로 표시
function updateProgressDisplay() {
    let display = "";
    const totalGuessed = guessedStations.size;
    const lineInfo = lineData.lines.find(l => l.line_id === currentLineId);
    
    for (let i = 0; i < currentRoute.length; i++) {
        let stationName = currentRoute[i];
        
        // 1. 역 이름 블록
        let stationHtml;
        if (guessedStations.has(stationName)) {
            stationHtml = `<span class="station-name correct" style="background-color: ${lineInfo.color};">${stationName}</span>`;
        } else {
            stationHtml = `<span class="station-name placeholder">${'•'.repeat(stationName.length)}</span>`; 
        }

        display += `<span class="station-wrapper">${stationHtml}</span>`;
        
        // 2. 연결선
        if (i < currentRoute.length - 1) {
            display += `<span class="connector" style="background-color: ${lineInfo.color};"></span>`; 
        }
    }
    
    // 남은 역 정보 표시
    const remaining = totalStations - totalGuessed;
    display += `<br><br>남은 역: ${remaining}개 / 총 ${totalStations}개`;
    
    $currentProgress.innerHTML = display;
}


// --- 5. 게임 로직 함수 ---

// 게임 시작
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    score = 0;
    $scoreValue.textContent = score;
    $startButton.style.display = 'none';
    $resetButton.style.display = 'inline-block';
    
    $stationInput.disabled = false;
    $checkButton.disabled = false;
    $stationInput.focus();
    
    $message.textContent = "게임을 시작합니다! 노선도에 채울 역 이름을 자유롭게 입력하세요.";

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
    totalStations = currentRoute.length;
    guessedStations = new Set(); 

    const lineInfo = lineData.lines.find(l => l.line_id === currentLineId);
    $lineDisplay.innerHTML = `<span style="color: ${lineInfo.color};">${lineInfo.name}</span> 노선 채우기 (총 ${totalStations}개 역)`;
    
    $stationInput.value = "";
    updateProgressDisplay();
}

// 정답 확인 (자유 입력)
function checkAnswer() {
    if (!gameStarted) return;
    
    const input = $stationInput.value.trim();
    if (input === "") return;

    const normalizedInput = normalizeInput(input);
    
    const correctStation = currentRoute.find(station => normalizeInput(station) === normalizedInput);
    
    if (correctStation) {
        if (guessedStations.has(correctStation)) {
             $message.innerHTML = `<span style="color: orange;">이미 맞춘 역입니다: ${correctStation}</span>`;
             $stationInput.value = "";
             $stationInput.focus();
             return;
        }
        
        // --- 정답 처리 ---
        score += 10; 
        $scoreValue.textContent = score;
        
        guessedStations.add(correctStation); 
        
        $message.innerHTML = `<span style="color: green; font-weight: bold;">✅ 정답! ${correctStation} 역을 채웠습니다.</span>`;
        
        $stationInput.value = "";
        $stationInput.focus();
        
        updateProgressDisplay();
        
        if (guessedStations.size === totalStations) {
            // 노선 완료!
            $message.innerHTML = `<span style="color: blue; font-weight: bold;">🎉 축하합니다! ${lineData.lines.find(l => l.line_id === currentLineId).name} 노선 완주! (보너스 +50점)</span>`;
            score += 50;
            $scoreValue.textContent = score;
            
            $stationInput.disabled = true;
            $checkButton.disabled = true;
            
            setTimeout(() => {
                $stationInput.disabled = false;
                $checkButton.disabled = false;
                $stationInput.focus();
                startNextLine();
            }, 3000); 
        }
    } else {
        // --- 오답 처리 ---
        $message.innerHTML = `<span style="color: #dc3545; font-weight: bold;">❌ 틀렸습니다! '${input}'는 노선에 없거나 오타입니다.</span>`;
        
        $stationInput.value = "";
        $stationInput.focus();
    }
}

// 게임 리셋
function resetGame() {
    gameStarted = false;
    score = 0;
    $scoreValue.textContent = 0;
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
    $startButton.addEventListener('click', startGame);
    $resetButton.addEventListener('click', resetGame);
    $checkButton.addEventListener('click', checkAnswer);

    $stationInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            checkAnswer();
        }
    });

    resetGame();
};

