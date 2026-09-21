// ==========================================
// 미션 1 (식물의 밥) 통합 스크립트
// ==========================================

// ------------------------------------------
// 💡 1. 화면(Step) 자유 이동 및 상태 저장 로직
// ------------------------------------------
window.goCustomStep = function(step) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`stage2-step${i}`);
    if (el) el.style.display = 'none';
  }
  
  const target = document.getElementById(`stage2-step${step}`);
  if (target) target.style.display = 'block';

  if (typeof window.getProgress === 'function' && typeof window.saveProgress === 'function') {
      let p = window.getProgress();
      
      if ((p.m1MaxStep || 1) < step) { 
          p.m1MaxStep = step; 
          window.saveProgress(p); 
      }
      
      const maxAllowed = p.m1MaxStep || 1;
      
      for(let i=1; i<=5; i++) {
          let dot = document.getElementById(`m1-dot-${i}`);
          if (!dot) continue;
          
          dot.classList.remove('active', 'completed');
          
          if (i === step) {
              dot.classList.add('active');
          } else if (i <= maxAllowed) {
              dot.classList.add('completed');
          }

          if (i <= maxAllowed) {
              dot.style.opacity = '1';
              dot.style.cursor = 'pointer';
              dot.onclick = () => { window.goCustomStep(i); };
          } else {
              dot.style.opacity = '0.5';
              dot.style.cursor = 'not-allowed';
              dot.onclick = () => { alert("이전 단계를 먼저 완료해야 접근할 수 있습니다!"); };
          }
      }
  }
};

window.addEventListener('DOMContentLoaded', () => { 
  window.goCustomStep(1); 
});

// ------------------------------------------
// 💡 2. Step 3 (합성공장) 드래그 앤 드롭
// ------------------------------------------
window.allowDrop = function(ev) {
  ev.preventDefault(); 
  ev.dataTransfer.dropEffect = "move";
};
window.dragLeave = function(ev) {};
window.drag = function(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.setData("text", ev.target.id); 
};
window.drop = function(ev) {
  ev.preventDefault(); 
  const data = ev.dataTransfer.getData("text/plain") || ev.dataTransfer.getData("text");
  if (!data) return;
  const el = document.getElementById(data);
  if (!el || !el.classList.contains('badge')) return;

  const dropTarget = ev.target.closest('#factory-dropzone') || ev.target.closest('#source-badges');

  if (dropTarget) {
      if (dropTarget.id === 'factory-dropzone') {
          const factoryItems = document.getElementById('factory-items');
          if (factoryItems) factoryItems.appendChild(el); 
          else dropTarget.appendChild(el); 
      } else if (dropTarget.id === 'source-badges') {
          dropTarget.appendChild(el); 
      }
  }
};

// ------------------------------------------
// 💡 3. Step 5 (광합성의 모든 것) 드래그 앤 드롭
// ------------------------------------------
window.allowDropM1 = function(ev) {
  ev.preventDefault();
  if(ev.currentTarget) ev.currentTarget.classList.add('drag-over-m1');
};
window.dragLeaveM1 = function(ev) {
  if(ev.currentTarget) ev.currentTarget.classList.remove('drag-over-m1');
};
window.dragM1 = function(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
};
window.dropM1 = function(ev) {
  ev.preventDefault();
  if(ev.currentTarget) ev.currentTarget.classList.remove('drag-over-m1');

  var data = ev.dataTransfer.getData("text/plain");
  if (!data) return;

  var el = document.getElementById(data);
  if (el && el.classList.contains('m1-badge')) {
      if (ev.currentTarget.classList.contains('m1-dropzone')) {
          if (ev.currentTarget.children.length > 0) {
              var existingBadge = ev.currentTarget.children[0];
              document.getElementById('m1-badge-pool').appendChild(existingBadge);
          }
          ev.currentTarget.appendChild(el);
      } 
      else if (ev.currentTarget.id === 'm1-badge-pool') {
          ev.currentTarget.appendChild(el);
      }
  }
};

// ------------------------------------------
// 💡 4. 모달창 팝업 공통 처리 (Step 2~4 사용)
// ------------------------------------------
let currentActiveBadgeId = null;

window.showInfoModal = function(title, text) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-exp').innerHTML = text;
  document.getElementById('modal-img-container').style.display = 'none';
  document.getElementById('modal-desc').innerText = '';
  const btnMove = document.getElementById('btn-move-factory');
  if (btnMove) btnMove.style.display = 'none'; 
  document.getElementById('exp-modal').style.display = 'flex';
};

window.closeModal = function() { 
  document.getElementById('exp-modal').style.display = 'none'; 
  currentActiveBadgeId = null;
  const btnMove = document.getElementById('btn-move-factory');
  if (btnMove) btnMove.style.display = 'inline-flex';
};

// ------------------------------------------
// 기존 퀴즈 및 미션 진행 로직
// ------------------------------------------
window.checkM2Step1 = function() {
  const q1 = document.getElementById('m2-s1-q1').value.replace(/\s+/g, '');
  const q2 = document.getElementById('m2-s1-q2').value.replace(/\s+/g, '');
  const msg = document.getElementById('m2-s1-msg');
  const btnNext = document.getElementById('btn-go-step2');

  
 const isQ1Correct = 
   (q1.includes('양분') && (q1.includes('스스로') || q1.includes('자신이') || q1.includes('식물이') || q1.includes('만든') || q1.includes('만들어'))) 
  || (q1.includes('이산화탄소') && q1.includes('물') && (q1.includes('빛') || q1.includes('햇빛')));
  const isQ2Correct = q2.includes('광합성');

  if (isQ1Correct && isQ2Correct) {
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 식물은 광합성을 통해 스스로 양분을 만들어 살아갑니다.";
    btnNext.style.display = "inline-flex"; 
    btnNext.onclick = () => window.goCustomStep(2);
  } else {
    msg.style.color = '#c62828';
    msg.innerText = '❌ 오답이 있습니다. 다시 생각해 보세요. (질문1 힌트: "000 00 00을 먹고 산다", 질문2 힌트: 광합성)';
    btnNext.style.display = "none";
  }
};

let selectedLeft = null; let selectedRight = null; let matchedPairsCount = 0;

window.selectMatchItem = function(elem, side) {
  if (elem.classList.contains('matched')) return;
  const msg = document.getElementById('matching-error-msg');
  msg.innerText = "좌우 항목을 터치하여 알맞은 짝을 연결해보세요."; msg.style.color = '#546e7a';
  document.querySelectorAll('.match-item').forEach(el => el.classList.remove('error'));

  if (side === 'left') {
    if (selectedLeft === elem) { elem.classList.remove('selected'); selectedLeft = null; return; }
    if (selectedLeft) selectedLeft.classList.remove('selected');
    selectedLeft = elem; elem.classList.add('selected');
  } else {
    if (selectedRight === elem) { elem.classList.remove('selected'); selectedRight = null; return; }
    if (selectedRight) selectedRight.classList.remove('selected');
    selectedRight = elem; elem.classList.add('selected');
  }
  if (selectedLeft && selectedRight) checkMatch();
};

function checkMatch() {
  const idLeft = selectedLeft.dataset.id;
  const idRight = selectedRight.dataset.id;
  const msg = document.getElementById('matching-error-msg');

  if (idLeft === idRight) {
    selectedLeft.classList.remove('selected'); selectedRight.classList.remove('selected');
    selectedLeft.classList.add('matched'); selectedRight.classList.add('matched');
    drawMatchingLine(selectedLeft, selectedRight, '#4caf50');
    matchedPairsCount++;
    selectedLeft = null; selectedRight = null;
    
    if (matchedPairsCount === 5) {
      msg.innerText = "✅ 정답입니다! 모든 소기관과 기능이 알맞게 연결되었습니다."; msg.style.color = '#2e7d32';
      const btn = document.getElementById('btn-go-step3-from-matching');
      btn.style.display = 'inline-block';
      btn.onclick = () => { if (typeof window.showChloroplastModal === 'function') window.showChloroplastModal(); };
    } else {
      msg.innerText = "✅ 맞았습니다! 나머지 항목도 연결해보세요."; msg.style.color = '#2e7d32';
    }
  } else {
    selectedLeft.classList.add('error'); selectedRight.classList.add('error');
    msg.innerText = "❌ 오답입니다. 다시 올바른 기능을 찾아 연결하세요."; msg.style.color = '#c62828';
    setTimeout(() => {
      if(selectedLeft) selectedLeft.classList.remove('selected', 'error');
      if(selectedRight) selectedRight.classList.remove('selected', 'error');
      selectedLeft = null; selectedRight = null;
    }, 600);
  }
}

function drawMatchingLine(el1, el2, color) {
  const container = document.getElementById('matching-quiz'); const svg = document.getElementById('matching-lines');
  if(!container || !svg) return;
  const rect1 = el1.getBoundingClientRect(); const rect2 = el2.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  const x1 = rect1.right - contRect.left; const y1 = rect1.top + (rect1.height / 2) - contRect.top;
  const x2 = rect2.left - contRect.left; const y2 = rect2.top + (rect2.height / 2) - contRect.top;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', color); line.setAttribute('stroke-width', '3'); line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);
}

function redrawLines() {
  const svg = document.getElementById('matching-lines');
  if(!svg) return;
  svg.innerHTML = '';
  document.querySelectorAll('.match-item.left-item.matched').forEach(leftEl => {
    const id = leftEl.dataset.id;
    const rightEl = document.querySelector(`.match-item.right-item.matched[data-id="${id}"]`);
    if(rightEl) drawMatchingLine(leftEl, rightEl, '#4caf50');
  });
}
window.addEventListener('resize', redrawLines);

window.showChloroplastModal = function() {
  const modal = document.getElementById('stage2-image-modal');
  modal.style.display = 'flex'; 
  document.getElementById('ch-q1').value = ''; document.getElementById('ch-q2').value = '';
  document.getElementById('ch-q1').disabled = false; document.getElementById('ch-q2').disabled = false;
  document.getElementById('ch-msg').innerText = '';
  document.getElementById('btn-ch-check').style.display = 'block';
  document.getElementById('btn-ch-next').style.display = 'none';
};

window.closeStage2ImageModal = function() {
  document.getElementById('stage2-image-modal').style.display = 'none';
};

window.checkChloroplastQuiz = function() {
  const ans1 = document.getElementById('ch-q1').value.replace(/\s/g, '');
  const ans2 = document.getElementById('ch-q2').value.replace(/\s/g, '');
  const msg = document.getElementById('ch-msg');

  if (ans1 === '엽록체' && ans2 === '엽록소') {
    msg.style.color = '#2e7d32'; msg.innerText = '🎉 정답입니다!';
    document.getElementById('ch-q1').disabled = true; document.getElementById('ch-q2').disabled = true;
    document.getElementById('btn-ch-check').style.display = 'none';
    const btnNext = document.getElementById('btn-ch-next');
    btnNext.style.display = 'block';
  } else {
    msg.style.color = '#d32f2f'; msg.innerText = '❌ 오답입니다. (힌트: 장소는 엽록O, 색소는 엽록O)';
  }
};

const itemData = {
  '물': { title: '💧 물 (Water)', desc: '뿌리에서 흡수되어 물관을 타고 잎으로 이동하는 광합성의 핵심 원료입니다.', img: 'images/photo_water.png' },
  '이산화탄소': { title: '💨 이산화탄소 (CO₂)', desc: '잎의 기공을 통해 공기 중에서 흡수되는 광합성의 원료 기체입니다.' },
  '빛에너지': { title: '☀️ 빛에너지 (Light Energy)', desc: '태양으로부터 오는 에너지로, 물과 이산화탄소를 결합시키는 원동력입니다.', img: 'images/photo_light_gs.png' },
  '산소': { title: '🫧 산소 (Oxygen)', desc: '광합성의 결과물로 만들어져 기공을 통해 대기 중으로 배출되는 기체입니다.', img: 'images/photo_O2.png' },
  '녹말': { title: '🥔 녹말 (Starch)', desc: '광합성으로 만들어진 포도당이 수많은 사슬로 연결되어 임시로 저장되는 형태입니다.' },
  '질소': { title: '🧪 질소 (Nitrogen)', desc: '뿌리를 통해 흡수되며 단백질을 만드는 데 필수적이나 광합성 직접 원료는 아닙니다.' },
  '포도당': { title: '🍬 포도당 (Glucose)', desc: '광합성 반응을 통해 가장 먼저 합성되는 유기 양분입니다.' },
  '단백질': { title: '🥚 단백질 (Protein)', desc: '단백질은 식물의 몸체를 구성하고 효소를 만듭니다.' },
  '지방': { title: '🧈 지방 (Fat)', desc: '씨앗에 저장되는 고효율 에너지 물질입니다.' },
  '흙': { title: '🪴 흙 (Soil)', desc: '식물에게 중요한 터전이지만, 흙 자체가 식물의 광합성 원료는 아닙니다.' },
  '화학에너지': { title: '🔋 화학에너지 (Chemical Energy)', desc: '유기물(포도당)의 결합 속에 저장된 형태의 에너지입니다.' },
  '전기에너지': { title: '⚡ 전기에너지 (Electrical Energy)', desc: '자연적인 식물의 광합성에는 사용되지 않습니다.' }
};

window.handleBadgeClick = function(id, text) {
  const el = document.getElementById(id);
  if (el && (el.isDragging || el.getAttribute('data-dropped') === 'true')) return;

  currentActiveBadgeId = id;
  const data = itemData[text] || { title: text, desc: '상세 설명이 없습니다.' };
  document.getElementById('modal-title').innerText = data.title;
  document.getElementById('modal-desc').innerText = '';
  document.getElementById('modal-exp').innerHTML = data.desc;
  
  const imgContainer = document.getElementById('modal-img-container');
  const imgEl = document.getElementById('modal-img');
  if (data.img) { imgEl.src = data.img; imgContainer.style.display = 'block'; } 
  else { imgEl.src = ''; imgContainer.style.display = 'none'; }

  const btnMove = document.getElementById('btn-move-factory');
  if(btnMove) {
    if (el && el.parentElement.id === 'factory-items') { 
        btnMove.innerText = "⬆️ 보관함으로 다시 빼기"; 
        btnMove.style.background = "#f57f17"; 
    } else { 
        btnMove.innerText = "⬇️ 엽록체 공장으로 투입하기"; 
        btnMove.style.background = "#2e7d32"; 
    }
    btnMove.style.display = 'inline-flex';
  }
  document.getElementById('exp-modal').style.display = 'flex';
};

window.moveBadgeToFactory = function() {
  if (!currentActiveBadgeId) return;
  const el = document.getElementById(currentActiveBadgeId);
  if (el) {
    if (el.parentElement.id === 'factory-items') document.getElementById('source-badges').appendChild(el);
    else document.getElementById('factory-items').appendChild(el);
  }
  window.closeModal(); 
};

// ------------------------------------------
// 💡 Step 3 합성 공장 실행 및 스르륵 버튼 퀴즈 로직
// ------------------------------------------
window.runFactory = function() {
  const factory = document.getElementById('factory-items');
  const items = factory.querySelectorAll('.badge');
  const msg = document.getElementById('msg-factory');
  
  if(items.length !== 3) { msg.style.color = '#c62828'; msg.innerText = "⚠️ 원료 2가지와 에너지 1가지, 정확히 3가지를 넣으세요."; return; }
  
  let hasWater = false, hasCO2 = false, hasLight = false;
  items.forEach(item => { 
    if(item.id === 'm1-badge-1' || item.id === 'b-water') hasWater = true; 
    if(item.id === 'm1-badge-2' || item.id === 'b-co2') hasCO2 = true; 
    if(item.id === 'm1-badge-3' || item.id === 'b-light') hasLight = true; 
  });

  if(hasWater && hasCO2 && hasLight) {
    msg.style.color = '#2e7d32'; 
    msg.innerText = "✅ 정확합니다! 엽록체 합성 공장을 가동합니다.";
    
    // 모달창 대신 아래쪽 퀴즈 영역을 스르륵 엽니다.
    setTimeout(() => { 
      const quizSec = document.getElementById('step3-quiz-section');
      if(quizSec) {
        quizSec.classList.remove('summary-hidden');
        quizSec.classList.add('summary-visible');
        quizSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 800);
  } else {
    msg.style.color = '#c62828'; 
    msg.innerText = "❌ 조합 오류! 광합성에 꼭 필요한 원료 2가지와 에너지 1가지를 고르세요!";
  }
};

let q1Answers = [];
let q2Answer = "";

window.addQ1Word = function(word) {
  if (q1Answers.length < 2) {
    q1Answers.push(word);
    updateQ1UI();
  }
};
window.clearQ1 = function() { q1Answers = []; updateQ1UI(); };
function updateQ1UI() {
  document.getElementById('s3-q1-ans1').innerText = q1Answers[0] || "";
  document.getElementById('s3-q1-ans2').innerText = q1Answers[1] || "";
}

window.addQ2Word = function(word) { q2Answer = word; updateQ2UI(); };
window.clearQ2 = function() { q2Answer = ""; updateQ2UI(); };
function updateQ2UI() {
  document.getElementById('s3-q2-ans1').innerText = q2Answer;
}

window.checkStep3Quiz = function() {
  const msg = document.getElementById('s3-quiz-msg');
  if (q1Answers.length < 2 || !q2Answer) {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 모든 빈칸을 채워주세요.";
    return;
  }
  
  if (q1Answers[0] === '뿌리' && q1Answers[1] === '물관' && q2Answer === '기공') {
    msg.style.color = '#2e7d32';
    msg.innerText = "🎉 정답입니다! 아래에서 잎의 구조를 확인해볼까요?";
    document.getElementById('btn-check-s3').style.display = 'none'; 
    
    setTimeout(() => {
        const rewardSec = document.getElementById('step3-reward-section');
        rewardSec.classList.remove('summary-hidden');
        rewardSec.classList.add('summary-visible');
        rewardSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 오답입니다. 흡수되는 위치와 이동 경로를 다시 생각해 보세요!";
  }
};

window.goStep4WithConfetti = function() {
    if(typeof window.launchMasterConfetti === 'function') window.launchMasterConfetti();
    else if (typeof window.launchConfetti === 'function') window.launchConfetti();
    setTimeout(() => { window.goCustomStep(4); }, 1000); 
};

// ==========================================
// STEP 5: 1) 실험 설계 빈칸 채우기 로직
// ==========================================
let s5Ans1 = ""; // (1) 엽록소를 제거(탈색)
let s5Ans2 = ""; // (2) 녹말
let s5Ans3 = ""; // (3) 청람색

// 버튼을 누르면 순서대로 빈칸에 들어감
function addS5Word(word) {
    if (!s5Ans1) {
        s5Ans1 = word;
        document.getElementById('s5-q1-ans').innerText = word;
    } else if (!s5Ans2) {
        s5Ans2 = word;
        document.getElementById('s5-q2-ans').innerText = word;
    } else if (!s5Ans3) {
        s5Ans3 = word;
        document.getElementById('s5-q3-ans').innerText = word;
    }
    // 버튼 활성화 상태 체크
    updateS5ButtonState();
}

// 빈칸 터치 시 해당 칸 비우기
function clearS5Q(num) {
    if (num === 1) {
        s5Ans1 = "";
        document.getElementById('s5-q1-ans').innerText = "";
    } else if (num === 2) {
        s5Ans2 = "";
        document.getElementById('s5-q2-ans').innerText = "";
    } else if (num === 3) {
        s5Ans3 = "";
        document.getElementById('s5-q3-ans').innerText = "";
    }
    // 하나라도 지워지면 다시 버튼 비활성화
    updateS5ButtonState();
}

// 💡 버튼 활성화/비활성화를 관리하는 새로운 함수
function updateS5ButtonState() {
    const btn = document.getElementById('btn-s5-check');
    // 빈칸 3개가 모두 비어있지 않으면(채워졌으면) 버튼 활성화
    if (s5Ans1 !== "" && s5Ans2 !== "" && s5Ans3 !== "") {
        btn.disabled = false;
        btn.style.background = "#2e7d32"; // 초록색으로 변경
        btn.style.cursor = "pointer";
    } else {
        // 하나라도 비어있으면 버튼 비활성화
        btn.disabled = true;
        btn.style.background = "#b0bec5"; // 회색으로 변경
        btn.style.cursor = "not-allowed";
    }
}

// 실험 설계 정답 확인 및 파트 2(결과 및 해석) 표시
function checkStep5Part1() {
    const msg = document.getElementById('s5-part1-msg');
    
    // 정답 판별 조건
    if (s5Ans1 === "엽록소를 제거(탈색)" && s5Ans2 === "녹말" && s5Ans3 === "청람색") {
        msg.style.color = "#2e7d32";
        msg.innerText = "🎉 정답입니다! 아래로 스크롤하여 결과를 해석하세요.";
        
        // 정답을 맞추면 '결과 및 해석' 영역(part2)이 부드럽게 나타남
        const part2 = document.getElementById('step5-part2');
        part2.classList.remove('summary-hidden');
        part2.classList.add('summary-visible');
        
        // 자연스럽게 아래 결과 영역으로 스크롤 이동
        setTimeout(() => {
            part2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        
    } else {
        msg.style.color = "#c62828";
        msg.innerText = "❌ 순서와 단어가 모두 맞는지 다시 확인해보세요.";
        // 오답일 시 흔들림 애니메이션 효과
        msg.style.animation = "shake 0.3s";
        setTimeout(() => msg.style.animation = "", 300);
    }
}

// ------------------------------------------
// 💡 Step 4 & 5 로직 (실험 진행)
// ------------------------------------------
let exp1AnimFrame;
window.runSensorExp = function() {
  const cv = document.getElementById('sensor-chart'); const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height; let progress = 0; cancelAnimationFrame(exp1AnimFrame);
  function draw() {
    progress += 0.015; if (progress > 1) progress = 1;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2;
    ctx.moveTo(50, 20); ctx.lineTo(50, h - 30); ctx.lineTo(w - 20, h - 30); ctx.stroke();
    ctx.fillStyle = '#546e7a'; ctx.font = '12px sans-serif'; ctx.fillText('시간(상대값)', w / 2, h - 10); ctx.fillText('상대 농도', 5, 15);

    ctx.beginPath(); ctx.strokeStyle = '#1976d2'; ctx.lineWidth = 3; ctx.moveTo(50, h - 50);
    for(let i=0; i<=progress * (w - 70); i+=5) { let x = 50 + i; let t = i / (w - 70); let y = (h - 50) - (Math.sin(t * Math.PI / 2) * 90); ctx.lineTo(x, y); }
    ctx.stroke();
    
    ctx.beginPath(); ctx.strokeStyle = '#e65100'; ctx.lineWidth = 3; ctx.moveTo(50, h - 140);
    for(let i=0; i<=progress * (w - 70); i+=5) { let x = 50 + i; let t = i / (w - 70); let y = (h - 140) + (Math.sin(t * Math.PI / 2) * 90); ctx.lineTo(x, y); }
    ctx.stroke();

    if (progress > 0.05) {
        ctx.fillStyle = '#1976d2'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('산소(O₂) 농도 증가', w - 140, 50);
        ctx.fillStyle = '#e65100'; ctx.fillText('이산화 탄소(CO₂) 농도 감소', w - 170, h - 60);
    }
    if (progress < 1) exp1AnimFrame = requestAnimationFrame(draw);
  }
  draw();
};

window.checkExp1 = function() {
  const rawVal = document.getElementById('exp1-conclusion').value.trim();
  const msg = document.getElementById('exp1-msg'); const btnNext = document.getElementById('btn-go-step5');
  if (!rawVal) { msg.style.color = '#c62828'; msg.innerText = "❌ 결론을 입력해 주세요."; btnNext.style.display = "none"; return; }

  let parsedVal = rawVal.replace(/이산화\s*탄소/g, 'C').replace(/co2/gi, 'C');
  parsedVal = parsedVal.replace(/산소/g, 'O').replace(/o2/gi, 'O');
  const decMatch = parsedVal.match(/(감소|줄어|소모|흡수)/); const incMatch = parsedVal.match(/(증가|늘어|발생|방출|생성)/);
  const idxC = parsedVal.indexOf('C'); const idxO = parsedVal.indexOf('O');

  if (idxC !== -1 && idxO !== -1 && decMatch && incMatch) {
      const idxDec = decMatch.index; const idxInc = incMatch.index;
      const distC_Dec = Math.abs(idxC - idxDec); const distO_Dec = Math.abs(idxO - idxDec);
      const distC_Inc = Math.abs(idxC - idxInc); const distO_Inc = Math.abs(idxO - idxInc);
      
      if (distC_Dec <= distO_Dec && distO_Inc <= distC_Inc) {
          msg.style.color = '#2e7d32'; msg.innerText = "✅ 정답입니다! 식물이 이산화탄소를 흡수하여 농도가 감소하고, 산소를 방출하여 증가함을 잘 분석했습니다.";
          btnNext.style.display = "inline-block";
          btnNext.onclick = () => window.goCustomStep(5);
      } else if (distO_Dec < distC_Dec && distC_Inc < distO_Inc) {
          msg.style.color = '#c62828'; msg.innerText = "❌ 기체의 변화가 잘못 연결되었습니다. 다시 맞춰보세요!"; btnNext.style.display = "none";
      } else {
          msg.style.color = '#c62828'; msg.innerText = "⚠️ 판별 불가! 문장을 더 명확하게 다시 작성해 주세요."; btnNext.style.display = "none";
      }
  } else {
      msg.style.color = '#c62828'; msg.innerText = "❌ 핵심 단어가 부족합니다. (이산화탄소, 산소, 흡수/방출/증가/감소 포함)"; btnNext.style.display = "none";
  }
};

window.fallbackLettuce = {
  pale: `<div style="width:100%; height:100%; background:#dcedc8; display:flex; align-items:center; justify-content:center; color:#558b2f; font-weight:bold; border-radius:8px;">탈색 잎</div>`,
  blue: `<div style="width:100%; height:100%; background:#3f51b5; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; border-radius:8px;">청람색 잎</div>`,
  brown: `<div style="width:100%; height:100%; background:#ffe082; display:flex; align-items:center; justify-content:center; color:#d84315; font-weight:bold; border-radius:8px;">옅은 황갈색</div>`
};

window.revealLeaf = function(type, elem) {
  if(type === 'light') elem.innerHTML = `<img src="images/lettuce_light_after.jpg" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:2px solid #311b92;" onerror="this.outerHTML=window.fallbackLettuce.blue" alt="청람색 변색">`;
  else elem.innerHTML = `<img src="images/lettuce_dark_after.jpg" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:2px solid #ffca28;" onerror="this.outerHTML=window.fallbackLettuce.brown" alt="황갈색">`;
};

window.checkExp2 = function() {
  const val = document.getElementById('exp2-conclusion').value.trim(); const msg = document.getElementById('exp2-msg');
  if (!val) { msg.style.color = '#c62828'; msg.innerText = "❌ 결론을 입력해 주세요."; return; }
  const hasPhoto = val.includes('광합성'); const hasStarch = val.includes('녹말'); const hasColor = val.includes('청람');
  
  if (hasPhoto && hasStarch && hasColor) {
      msg.style.color = '#2e7d32'; msg.innerText = "✅ 정확합니다! 빛을 받아 광합성을 하고 만들어진 양분이 녹말 형태로 저장되어 아이오딘 용액과 반응해 청람색을 띱니다.";
      document.getElementById('stage2-final-btns').style.display = "block";
  } else {
      msg.style.color = '#c62828';
      let hints = []; if (!hasPhoto) hints.push("'광합성'"); if (!hasStarch) hints.push("'녹말'"); if (!hasColor) hints.push("'청람색'");
      msg.innerText = `❌ 필수 핵심어(${hints.join(', ')})가 빠져 있습니다. 다시 적어보세요!`;
  }
};

window.resetMission2 = function() { 
  window.goCustomStep(1); 
};

// ------------------------------------------
// 💡 [최종 11개 뱃지] 정리 박스 제어 및 셔플
// ------------------------------------------
window.showM1FinalSummary = function() {
  const summaryBox = document.getElementById('m1-final-summary');
  if (summaryBox) {
      if (!summaryBox.classList.contains('summary-visible')) {
          const pool = document.getElementById('m1-badge-pool');
          if (pool) {
              const badges = Array.from(pool.children);
              for (let i = badges.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  pool.appendChild(badges[j]);
              }
          }
      }

      summaryBox.classList.remove('summary-hidden');
      summaryBox.classList.add('summary-visible');
      
      setTimeout(() => { summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }
};

window.checkM1Summary = function() {
  var getDropVal = function(id) {
      var dropEl = document.getElementById(id);
      return (dropEl && dropEl.children.length > 0) ? dropEl.children[0].getAttribute('data-ans') : '';
  };

  var val1 = getDropVal('m1-drop-1'); var val2 = getDropVal('m1-drop-2');
  var val3 = getDropVal('m1-drop-3'); var val4 = getDropVal('m1-drop-4');
  var val5 = getDropVal('m1-drop-5'); var val6 = getDropVal('m1-drop-6');
  var val7 = getDropVal('m1-drop-7'); var val8 = getDropVal('m1-drop-8');
  var val9 = getDropVal('m1-drop-9'); var val10 = getDropVal('m1-drop-10');
  var val11 = getDropVal('m1-drop-11');

  var msg = document.getElementById('m1-summary-msg');

  var isCorrect1 = (val1 === '물관'); var isCorrect2 = (val2 === '물');
  var isCorrect3 = (val3 === '이산화탄소'); var isCorrect4 = (val4 === '엽록체');
  var isCorrect5 = (val5 === '엽록소'); var isCorrect6 = (val6 === '빛에너지');
  var isCorrect7_8 = (val7 === '포도당' && val8 === '산소') || (val7 === '산소' && val8 === '포도당');
  var isCorrect9 = (val9 === '포도당'); var isCorrect10 = (val10 === '녹말');
  var isCorrect11 = (val11 === '엽록체');

  if (isCorrect1 && isCorrect2 && isCorrect3 && isCorrect4 && isCorrect5 && isCorrect6 && isCorrect7_8 && isCorrect9 && isCorrect10 && isCorrect11) {
      if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "🎉 완벽합니다! 미션 클리어 판독 중..."; }
      
      setTimeout(function() {
          var clearModal = document.getElementById('mission-clear-modal');
          
          if(typeof window.launchMasterConfetti === 'function') window.launchMasterConfetti();
          else if (typeof window.launchConfetti === 'function') window.launchConfetti();
          
          if(typeof window.getProgress === 'function' && typeof window.saveProgress === 'function') {
              var p = window.getProgress(); p.m1MaxStep = 6;
              if(p.maxMission < 2) p.maxMission = 2; 
              window.saveProgress(p);
          }

          if (clearModal) clearModal.style.display = 'flex';
          else { alert("🎉 미션 클리어! Mission 2의 잠금이 해제되었습니다."); location.href = 'mission2.html'; }
      }, 1200);
  } else {
      if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 아직 빈칸이 있거나 함정 뱃지, 잘못 들어간 뱃지가 있습니다. 다시 확인해 보세요!"; }
  }
};

// 자동완성 끄기
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.setAttribute('autocomplete', 'off'); input.setAttribute('autocorrect', 'off');    
        input.setAttribute('autocapitalize', 'off'); input.setAttribute('spellcheck', 'false');   
    });
});