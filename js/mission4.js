// =========================================
// Step 1. 낮/밤 인터랙션 스크립트
// =========================================
function setDayNight(time) {
    const btnDay = document.getElementById('btnDay');
    const btnNight = document.getElementById('btnNight');
    const animBox = document.getElementById('animationBox');

    if (time === 'day') {
        btnDay.classList.add('active');
        btnNight.classList.remove('active');
        animBox.style.backgroundColor = '#FFF9C4'; 
        animBox.innerHTML = `
            <div>💧물 + 💨이산화 탄소 + ☀️빛에너지</div>
            <div class="flow-arrow">⬇️ 광합성 ⬇️</div>
            <div><strong>🍇 포도당</strong> 생성!</div>
            <div class="flow-arrow">⬇️ 물에 녹지 않는 형태로 변환 ⬇️</div>
            <div><strong>🥔 녹말</strong> 형태로 <b>잎(엽록체)</b>에 임시 저장</div>
        `;
    } else {
        btnNight.classList.add('active');
        btnDay.classList.remove('active');
        animBox.style.backgroundColor = '#E8EAF6'; 
        animBox.innerHTML = `
            <div>잎에 저장되어 있던 <strong>🥔 녹말</strong></div>
            <div class="flow-arrow">⬇️ 밤이 되면 물에 잘 녹는 형태로 변환 ⬇️</div>
            <div><strong>🧊 설탕</strong>으로 변신!</div>
            <div class="flow-arrow">⬇️ 체관을 타고 이동 ⬇️</div>
            <div>줄기, 뿌리, 과일 등 <b>식물의 온몸으로 이동</b> 🚀</div>
        `;
    }
}

// =========================================
// Step 2. 탭 인터랙션 스크립트
// =========================================
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    
    tabcontent = document.getElementsByClassName("use-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    
    tablinks = document.getElementsByClassName("use-tabs")[0].getElementsByTagName("button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    document.getElementById(tabName).style.display = "block";
    setTimeout(() => {
        document.getElementById(tabName).classList.add("active");
    }, 10);
    evt.currentTarget.classList.add("active");
}

// =========================================
// Step 3. 짝맞추기 게임 스크립트
// =========================================
const answers = {
    '콩': '단백질',
    '포도': '포도당',
    '고구마': '녹말'
};

let selectedPlant = null;
let selectedPlantBtn = null;
let matchedCount = 0;

function selectItem(type, value, btnElement) {
    if (btnElement.classList.contains('matched')) return; 

    if (type === 'plant') {
        let plantBtns = document.getElementById('colPlants').getElementsByTagName('button');
        for (let b of plantBtns) {
            if (!b.classList.contains('matched')) {
                b.classList.remove('selected');
            }
        }
        selectedPlant = value;
        selectedPlantBtn = btnElement;
        btnElement.classList.add('selected');
    } 
    else if (type === 'nutrient') {
        if (!selectedPlant) {
            alert("먼저 왼쪽에서 식물을 선택해 주세요!");
            return;
        }

        if (answers[selectedPlant] === value) {
            selectedPlantBtn.classList.remove('selected');
            selectedPlantBtn.classList.add('matched');
            selectedPlantBtn.innerHTML += " ✔️";
            
            btnElement.classList.add('matched');
            btnElement.innerHTML += " ✔️";
            
            selectedPlant = null;
            selectedPlantBtn = null;
            matchedCount++;

            if (matchedCount === 3) {
                document.getElementById('successMsg').style.display = 'block';
            }
        } else {
            btnElement.classList.add('wrong');
            setTimeout(() => {
                btnElement.classList.remove('wrong');
            }, 400); 
        }
    }
}

// =========================================
//  페이지 로드 시 짝맞추기 버튼 무작위 섞기 (랜덤 배치)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const colPlants = document.getElementById('colPlants');
    const colNutrients = document.getElementById('colNutrients');
    
    // 부모 컨테이너 안의 자식 요소(버튼)들을 랜덤으로 섞는 함수
    function shuffleButtons(container) {
        if (!container) return;
        
        // 컨테이너 안의 버튼들을 배열로 변환
        const buttons = Array.from(container.children);
        
        // 배열 순서를 무작위로 섞음
        buttons.sort(() => Math.random() - 0.5);
        
        // 섞인 순서대로 컨테이너에 다시 추가 (위치가 재배치됨)
        buttons.forEach(btn => container.appendChild(btn));
    }

    // 왼쪽 식물 열과 오른쪽 영양소 열을 각각 섞어줍니다.
    shuffleButtons(colPlants);
    shuffleButtons(colNutrients);
});