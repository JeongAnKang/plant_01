// ==========================================
// mission1.js (미션 1: 생태계 관리)
// ==========================================

let m1RecoveryTriggered = false;

function checkM1Quiz() {
  const dropzone = document.getElementById('m1-dropzone');
  const msg = document.getElementById('m1-quiz-msg');
  const items = dropzone.querySelectorAll('.m3-badge');
  
  if (items.length === 0) {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 뱃지를 아래 제출칸에 드래그해주세요!";
    return;
  }
  
  if (items.length > 1) {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 정답 뱃지 1개만 올려주세요!";
    return;
  }
  
  if (items[0].id === 'm1-opt-1') { 
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 생태계의 기초는 '생산자'입니다.";
    
    setTimeout(() => {
      document.getElementById('m1-quiz-modal').style.display = 'none';
      document.getElementById('m1-step1-box').style.display = 'none';
      document.getElementById('m1-main-content').style.display = 'block';
      
      let p = getProgress();
      p.m1MaxStep = 2; 
      saveProgress(p);
    }, 1200);
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 아쉽네요. 식물처럼 스스로 양분을 만드는 생물의 역할은 무엇일까요?";
  }
}

function checkSliderRecovery(val) {
  if (val == 100 && !m1RecoveryTriggered) {
    m1RecoveryTriggered = true;
    setTimeout(() => {
      document.getElementById('m1-recovery-modal').style.display = 'flex';
    }, 800);
  } else if (val < 100) {
    m1RecoveryTriggered = false;
  }
}

function checkRecoveryQuiz(answer, btnElem) {
  const msg = document.getElementById('m1-recovery-msg');
  const nextBtn = document.getElementById('btn-go-mission2');
  
  if (answer === '생태계 평형') {
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 생물 종과 개체수가 안정적으로 유지되는 것을 뜻합니다.";
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
      handleMissionUnlock(2, 'Mission 2. 식물의 밥', '이제 식물이 어떻게 스스로 양분을 만드는지 알아볼 차례입니다!', () => {
         location.href = 'mission2.html';
      });
    };
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 아쉽네요. 안정적으로 균형을 이룬다는 의미를 가진 단어입니다.";
  }
}

function updateStage1(plantVal) {
  const p = parseInt(plantVal);
  const valPlant = document.getElementById('val-plant');
  if(!valPlant) return;
  
  valPlant.innerText = `${p}%`;
  const herbVal = Math.max(0, Math.round(p * 0.95));
  let carnVal = 0;
  if (herbVal > 50) carnVal = Math.round(herbVal * 0.9);
  else if (herbVal > 20) carnVal = Math.round(herbVal * 0.6);
  else carnVal = 0;

  document.getElementById('bar-plant').style.width = `${p}%`;
  document.getElementById('status-plant-text').innerText = p > 60 ? `풍부 (${p}%)` : (p > 15 ? `부족 (${p}%)` : `전멸 위기 (${p}%)`);
  document.getElementById('svg-plant').style.filter = `grayscale(${100 - p}%)`;
  document.getElementById('svg-plant').style.transform = `scale(${0.4 + (p / 100) * 0.6})`;

  document.getElementById('bar-herb').style.width = `${herbVal}%`;
  document.getElementById('status-herb-text').innerText = herbVal > 60 ? `정상 (${herbVal}%)` : (herbVal > 15 ? `굶주림 (${herbVal}%)` : `멸종 (${herbVal}%)`);
  document.getElementById('svg-herb').style.filter = `grayscale(${100 - herbVal}%)`;
  document.getElementById('svg-herb').style.transform = `scale(${0.4 + (herbVal / 100) * 0.6})`;
  document.getElementById('svg-herb').style.opacity = herbVal === 0 ? 0.25 : (0.4 + (herbVal / 100) * 0.6);

  document.getElementById('bar-carn').style.width = `${carnVal}%`;
  document.getElementById('status-carn-text').innerText = carnVal > 60 ? `안정 (${carnVal}%)` : (carnVal > 10 ? `개체수 급감 (${carnVal}%)` : `절멸 (${carnVal}%)`);
  document.getElementById('svg-carn').style.filter = `grayscale(${100 - carnVal}%)`;
  document.getElementById('svg-carn').style.transform = `scale(${0.4 + (carnVal / 100) * 0.6})`;
  document.getElementById('svg-carn').style.opacity = carnVal === 0 ? 0.2 : (0.4 + (carnVal / 100) * 0.6);

  const ecoBox = document.getElementById('status-eco');
  if (p > 70) {
    ecoBox.style.background = "#0f9d58";
    ecoBox.innerHTML = `[대기 상태] 산소(O₂): 21% | CO₂: 0.04%<br>[생태계 평형] 1차 생산자의 유기물 합성으로 초식·육식 동물이 최적 균형을 유지합니다.`;
  } else if (p > 30) {
    ecoBox.style.background = "#e65100";
    ecoBox.innerHTML = `<span class="alert-tag">경고: 1차 먹이사슬 균열</span><br>[초식동물 피해] 식물 부족으로 토끼의 사망률이 급증합니다.`;
  } else {
    ecoBox.style.background = "#b71c1c";
    ecoBox.innerHTML = `<span class="alert-tag">대재앙: 영양 피라미드 완전 붕괴</span><br>[전면 멸종] 식물 전멸 → 육식동물 최종 멸종(0%)`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
    let p = getProgress();
    if(document.getElementById('val-plant')) updateStage1(100); 
    if (p.m1MaxStep >= 2 && document.getElementById('m1-quiz-modal')) {
        document.getElementById('m1-quiz-modal').style.display = 'none';
        document.getElementById('m1-step1-box').style.display = 'none';
        document.getElementById('m1-main-content').style.display = 'block';
    }
});