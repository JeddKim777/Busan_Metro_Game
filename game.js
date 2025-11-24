// ====================================================================
// 부산 지하철 노선도 채우기 게임 - game.js (최종 완성본 - 노선 선택 기능 추가)
// ====================================================================

// --- 1. 게임 데이터 (노선별 역 순서 및 환승 정보) ---

const lineData = {
    // ⭐️ 사용자 지정 최종 색상 반영 (2호선 유효 색상으로 수정) ⭐️
    "lines": [
        {"line_id": "line_1", "name": "1호선", "color": "#F06A00"}, 
        {"line_id": "line_2", "name": "2호선", "color": "#48B41B"}, 
        {"line_id": "line_3", "name": "3호선", "color": "#BB8C00"}, 
        {"line_id": "line_4", "name": "4호선", "color": "#217DCB"}, 
        {"line_id": "line_bgl", "name": "부산김해경전철", "color": "#875CAC"}, 
        {"line_id": "line_k", "name": "동해선", "color": "#0054A6"}
    ],
    "routes": {
        // 1호선 (40개 역)
        "line_1": [
            "다대포해수욕장", "다대포항", "낫개", "신장림", "장림", "동매", "신평", "하단", "당리", "사하", "괴정", "대티", 
            "서대신", "동대신", "토성", "자갈치", "남포", "중앙", "부산역", "초량", "부산진", "좌천", "범일", "범내골", "서면", 
            "부전", "양정", "시청", "연산", "교대", "동래", "명륜", "온천장", "부산대", "장전", "구서", "두실", "남산", 
            "범어사", "노포"
        ],
        // 2호선 (43개 역)
        "line_2": [
            "장산", "중동", "해운대", "동백", "벡스코", "센텀시티", "민락", "수영", "광안", "금련산", "남천", "경성대부경대", 
            "대연", "못골", "지게골", "문현", "국제금융센터부산은행", "전포", "서면", "부암", "가야", "동의대", "개금", 
            "냉정", "주례", "감전", "사상", "덕포", "모덕", "모라", "구남", "구명", "덕천", "수정", "화명", "율리", "동원", 
            "금곡", "호포", "증산", "부산대양산캠퍼스", "남양산", "양산"
        ],
        // 3호선 (17개 역)
        "line_3": [
            "수영", "망미", "배산", "물만골", "연산", "거제", "종합운동장", "사직", "미남", "만덕", "남산정", "숙등", 
            "덕천", "구포", "강서구청", "체육공원", "대저"
        ],
        // 4호선 (14개 역)
        "line_4": [
            "미남", "동래", "수안", "낙민", "충렬사", "명장", "서동", "금사", "반여농산물시장", "석대", "영산대", "윗반송", "고촌", "안평"
        ],
        // 동해선 (24개 역)
        "line_k": [
            "부전", "거제해맞이", "거제", "교대", "동래", "안락", "부산원동", "재송", "센텀", "벡스코", 
            "신해운대", "송정", "오시리아", "기장", "일광", "좌천", "월내", "고리", "서생", "남창", "망양", "덕하", "개운포", "태화강" 
        ],
        // 부산김해경전철 (21개 역)
        "line_bgl": [
            "사상", "괘법르네시떼", "서부산유통지구", "공항", "덕두", "등구", "대저", "평강", "대사", 
            "불암", "지내", "김해대학", "인제대", "김해시청", "부원", "봉황", 
            "수로왕릉", "박물관", "연지공원", "장신대", "가야대"
        ]
    },
    // 환승역 데이터
    "transferStations": {
        "서면": ["line_1", "line_2"],
        "연산": ["line_1", "line_3"],
        "수영": ["line_2", "line_3"],
        "덕천": ["line_2", "line_3"],
        "사상": ["line_2", "line_bgl"],
        "대저": ["line_3", "line_bgl"],
        "미남": ["line_3", "line_4"],
        "동래": ["line_1", "line_4", "line_k"], 
        "교대": ["line_1", "line_k"],
        "부전": ["line_1", "line_k"],
        "벡스코": ["line_2", "line_k"],
        "거제": ["line_3", "line_k"],
        "센텀": ["line_2", "line_k"]
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
const $lineSelect = document.getElementById('line-select');
const $lineColorKey = document.getElementById('line-color-key');


// --- 4. 초기화 및 UI 생성 함수 ---

// 노선 선택 드롭다운 및 색상표를 채웁니다.
function populateLineSelectors() {
    // 1. 드롭다운 옵션 채우기
    lineData.lines.forEach(line => {
        const option = document.createElement('option');
        option.value = line.line_id;
        option.textContent = `${line.name} (총 ${lineData.routes[line.line_id].length}개 역)`;
        $lineSelect.appendChild(option);
    });

    // 2. 노선 색상표 채우기
    let keyHtml = '<strong>🌈 노선 색상표</strong><br>';
    lineData.lines.forEach(line => {
        keyHtml += `
            <div class="line-item">
                <span class="line-dot" style="background-color: ${line.color};"></span>
                ${line.name}
            </div>
        `;
    });
    $lineColorKey.innerHTML = keyHtml;
}


// --- 5. 헬퍼 함수 ---

// 입력값을 표준화 (띄어쓰기, 특수문자 제거)
function normalizeInput(input) {
    return input.trim()
                .replace(/ /g, '')
                .replace(/-/g, '')
                .replace(/·/g, '')
                .toLowerCase();
}

// 노선 ID를 색상 코드로 변환
const getLineColor = (lineId) => {
    const info = lineData.lines.find(l => l.line_id === lineId);
    return info ? info.color : '#aaaaaa'; 
};

/**
 * 진행 상황을 시각적으로 표시하고, 환승역일 경우 색상을 분할하여 표시합니다.
 */
function updateProgressDisplay() {
    let display = "";
    const totalGuessed = guessedStations.size;
    const lineInfo = lineData.lines.find(l => l.line_id === currentLineId);
    
    
    for (let i = 0; i < currentRoute.length; i++) {
        let stationName = currentRoute[i];
        
        let stationHtml;
        if (guessedStations.has(stationName)) {
            
            // ⭐️ 환승역 처리 로직 시작 ⭐️
            const transferInfo = lineData.transferStations[stationName];
            
            if (transferInfo) {
                let allLineIds = new Set([currentLineId, ...transferInfo]);
                
                // lineData.lines의 순서대로 환승 노선 ID를 정렬합니다.
                const sortedLineIds = lineData.lines
                    .map(line => line.line_id)
                    .filter(lineId => allLineIds.has(lineId));

                // 각 노선 색상별로 분할된 HTML 조각을 만듦
                const colorBlocks = sortedLineIds.map(lineId => {
                    const color = getLineColor(lineId);
                    const widthPercentage = (100 / sortedLineIds.length).toFixed(1) + '%'; 
                    return `<span style="display: inline-block; background-color: ${color}; width: ${widthPercentage}; height: 100%; float: left;"></span>`;
                }).join('');
                
                // 역 이름을 담는 컨테이너
                stationHtml = `
                    <span class="station-name correct transfer-station" style="background-color: transparent; position: relative; overflow: hidden; color: white; font-weight: bold;">
                        <span class="color-split-background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; display: flex;">
                            ${colorBlocks}
                        </span>
                        <span class="station-text" style="position: relative; z-index: 2;">${stationName}</span>
                    </span>
                `;

            } else {
                // 일반역 (단일 색상)
                stationHtml = `<span class="station-name correct" style="background-color: ${lineInfo.color};">${stationName}</span>`;
            }
            // ⭐️ 환승역 처리 로직 끝 ⭐️

        } else {
            // 미정답 역
            stationHtml = `<span class="station-name placeholder">${'•'.repeat(stationName.length)}</span>`; 
        }

        display += `<span class="station-wrapper">${stationHtml}</span>`;
        
        // 연결선
        if (i < currentRoute.length - 1) {
            display += `<span class="connector" style="background-color: ${lineInfo.color};"></span>`; 
        }
    }
    
    // 남은 역 정보 표시
    const remaining = totalStations - totalGuessed;
    display += `<br><br>남은 역: ${remaining}개 / 총 ${totalStations}개`;
    
    $currentProgress.innerHTML = display;
}


// --- 6. 게임 로직 함수 ---

// 게임 시작 (사용자가 선택한 노선으로 시작)
function startGame() {
    const selectedLineId = $lineSelect.value;
    if (!selectedLineId) {
        $message.textContent = "노선을 먼저 선택해주세요.";
        return;
    }
    
    gameStarted = true;
    score = 0;
    $scoreValue.textContent = score;
    
    // UI 상태 변경
    $lineSelect.disabled = true;
    $startButton.disabled = true;
    $resetButton.style.display = 'inline-block';
    
    $stationInput.disabled = false;
    $checkButton.disabled = false;
    $stationInput.focus();
    
    $message.textContent = "게임 시작! 노선도에 채울 역 이름을 자유롭게 입력하세요.";

    startLine(selectedLineId);
}

// 선택된 노선으로 라운드 시작
function startLine(lineId) {
    currentLineId = lineId;
    currentRoute = lineData.routes[currentLineId];
    totalStations = currentRoute.length;
    guessedStations = new Set(); 

    const lineInfo = lineData.lines.find(l => l.line_id === currentLineId);
    $lineDisplay.innerHTML = `<span style="color: ${lineInfo.color};">${lineInfo.name}</span> 노선 채우기 (총 ${totalStations}개 역)`;
    
    $stationInput.value = "";
    updateProgressDisplay();
}


// 정답 확인 (자유 입력 로직)
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
            const lineName = lineData.lines.find(l => l.line_id === currentLineId).name;
            $message.innerHTML = `<span style="color: blue; font-weight: bold;">🎉 축하합니다! ${lineName} 노선 완주! (보너스 +50점)</span>`;
            score += 50;
            $scoreValue.textContent = score;
            
            // 완주 후 게임 종료 상태로 전환
            endGame();
        }
    } else {
        // --- 오답 처리 ---
        $message.innerHTML = `<span style="color: #dc3545; font-weight: bold;">❌ 틀렸습니다! '${input}'는 노선에 없거나 오타입니다.</span>`;
        
        $stationInput.value = "";
        $stationInput.focus();
    }
}

// 노선 완주 시 게임 종료
function endGame() {
    gameStarted = false;
    $stationInput.disabled = true;
    $checkButton.disabled = true;
    $lineSelect.disabled = false;
    $startButton.disabled = true; // 완주 후에는 '새 게임'만 가능하도록
    $lineDisplay.textContent = "노선을 완주하셨습니다! 새로운 노선을 선택해 주세요.";
}


// 게임 리셋 (노선 선택 상태로 돌아감)
function resetGame() {
    gameStarted = false;
    score = 0;
    $scoreValue.textContent = 0;
    
    // UI 초기 상태로 복구
    $lineSelect.disabled = false;
    $startButton.disabled = true;
    $resetButton.style.display = 'none';
    $lineSelect.value = "";
    
    $lineDisplay.textContent = "원하는 노선을 선택하고 '시작' 버튼을 눌러주세요.";
    $currentProgress.textContent = "";
    $stationInput.value = "";
    $stationInput.disabled = true;
    $checkButton.disabled = true;

    $message.textContent = "새로운 게임을 시작하려면 노선을 선택하세요.";
}


// --- 7. 이벤트 리스너 ---

window.onload = () => {
    populateLineSelectors(); // 페이지 로드 시 노선 정보 채우기

    $startButton.addEventListener('click', startGame);
    $resetButton.addEventListener('click', resetGame);
    $checkButton.addEventListener('click', checkAnswer);

    // Enter 키로 정답 확인 기능
    $stationInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            checkAnswer();
        }
    });

    // 노선 선택 시 시작 버튼 활성화
    $lineSelect.addEventListener('change', () => {
        if ($lineSelect.value && !gameStarted) {
            $startButton.disabled = false;
            $message.textContent = `선택하신 노선으로 시작 버튼을 눌러주세요.`;
        } else if (!gameStarted) {
            $startButton.disabled = true;
            $message.textContent = `새로운 게임을 시작하려면 노선을 선택하세요.`;
        }
        
        // 새로운 노선을 선택하면 진행 중인 게임은 리셋
        if (gameStarted) {
            resetGame();
        }
    });

    resetGame(); // 초기 상태로 설정
};
