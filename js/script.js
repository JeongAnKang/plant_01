// ==========================================
// 1. 앱 진행도 관리 (LocalStorage)
// ==========================================
function getProgress() {
  return JSON.parse(localStorage.getItem('plantVitalProgress')) || {
    maxMission: 1, m1MaxStep: 1, m2MaxStep: 1, m3MaxStep: 1
  };
}

function saveProgress(p) {
  localStorage.setItem('plantVitalProgress', JSON.stringify(p));
  renderNav();
}

function resetAllProgress() {
  if(confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (처음부터 다시 시작해야 합니다.)")) {
    localStorage.removeItem('plantVitalProgress');
    alert("모든 미션과 스텝이 초기화되었습니다.");
    location.href = 'index.html';
  }
}

function renderNav() {
  const p = getProgress();
  const navLinks = document.querySelectorAll('#stage-nav .nav-btn');
  const files = ['mission1.html', 'mission2.html', 'mission3.html', 'mission4.html', 'mission5.html'];
  const mNames = ["M1 식물의 밥", "M2 최적 조건", "M3 식물의 숨", "M4 햇빛 금고 ","M5 히든 프로젝트"];
  
  navLinks.forEach((link, idx) => {
    const mNum = idx + 1;
    link.classList.remove('disabled');
    link.onclick = null;
    
    if (mNum <= p.maxMission) {
      link.innerText = mNames[idx];
      link.href = files[idx];
    } else {
      link.classList.add('disabled');
      link.innerText = `🔒 ${mNames[idx]}`;
      link.removeAttribute('href');
      link.onclick = (e) => { e.preventDefault(); alert("이전 미션을 완료해야 잠금이 해제됩니다!"); };
    }
    
    if(location.pathname.includes(files[idx])) link.classList.add('active');
    else link.classList.remove('active');
  });
}

function showUnlockPopup(title, msg, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 400px; text-align: center; border: 4px solid #fbc02d; background: #fffde7;">
      <h2 style="color: #f57f17; margin-top:0; font-size: 1.8rem;">🔓 잠금 해제!</h2>
      <h3 style="color: #2e7d32; margin-top: 10px; font-size: 1.2rem;">${title}</h3>
      <p style="font-size:0.95rem; color:#546e7a; margin-bottom: 20px;">${msg}</p>
      <button class="btn-action" style="width:100%; font-size:1.05rem;" id="btn-unlock-confirm">확인 및 이동 ➔</button>
    </div>
  `;
  document.body.appendChild(overlay);
  launchConfetti();
  document.getElementById('btn-unlock-confirm').onclick = () => {
    overlay.remove();
    if(callback) callback();
  };
}

function handleStepUnlock(mNum, targetStep, title, msg, proceedCallback) {
  let p = getProgress();
  let currentMax = p[`m${mNum}MaxStep`] || 1;
  if (targetStep > currentMax) {
     p[`m${mNum}MaxStep`] = targetStep;
     saveProgress(p);
     showUnlockPopup(title, msg, proceedCallback);
  } else {
     proceedCallback();
  }
}

function handleMissionUnlock(targetMission, title, msg, proceedCallback) {
  let p = getProgress();
  if (targetMission > p.maxMission) {
     p.maxMission = targetMission;
     saveProgress(p);
     showUnlockPopup(title, msg, proceedCallback);
  } else {
     proceedCallback();
  }
}

function updateStepUI(missionStr, totalSteps, currentStep) {
  const mNum = parseInt(missionStr.replace('m', ''));
  const p = getProgress();
  const maxAllowed = p[`m${mNum}MaxStep`] || 1;

  for(let i=1; i<=totalSteps; i++) {
    let dot = document.getElementById(`${missionStr}-dot-${i}`);
    if (!dot) continue;
    dot.classList.remove('active', 'completed');
    
    if (i < currentStep) dot.classList.add('completed');
    else if (i === currentStep) dot.classList.add('active');

    if (i <= maxAllowed) {
        dot.style.opacity = '1';
        dot.style.cursor = 'pointer';
        dot.onclick = () => {
            if (mNum === 2) jumpToM2Step(i);
            else if (mNum === 3) goM3Step(i);
        };
    } else {
        dot.style.opacity = '0.4';
        dot.style.cursor = 'not-allowed';
        dot.onclick = () => { alert("이전 단계를 완료해야 접근할 수 있습니다!"); };
    }
  }
}

// ==========================================
// 2. 공통 유틸리티 (SVG 및 파티클)
// ==========================================
const fallbackSVG = {
  plantcell: `<svg viewBox="0 0 400 300" style="width: 100%; height: auto; display: block; min-height: 250px; background: #e8f5e9;"><rect width="400" height="300" fill="#e8f5e9"/><text x="200" y="150" text-anchor="middle" fill="#78909c" font-size="16">PlantCell.png 이미지 영역</text></svg>`,
  M3_s02: `<svg viewBox="0 0 400 300" style="width:100%; height:100%; background:#f1f8e9;"><rect width="100%" height="100%" fill="#f1f8e9"/><text x="200" y="150" text-anchor="middle" fill="#2e7d32" font-size="16" font-weight="bold">M3_s02_light.png 이미지 (빛과 광합성)</text></svg>`,
  M3_s03: `<svg viewBox="0 0 400 300" style="width:100%; height:100%; background:#e3f2fd;"><rect width="100%" height="100%" fill="#e3f2fd"/><text x="200" y="150" text-anchor="middle" fill="#1565c0" font-size="16" font-weight="bold">M3_s03_CO2.png 이미지 (CO2와 광합성)</text></svg>`,
  M3_s04: `<svg viewBox="0 0 400 300" style="width:100%; height:100%; background:#fff3e0;"><rect width="100%" height="100%" fill="#fff3e0"/><text x="200" y="150" text-anchor="middle" fill="#e65100" font-size="16" font-weight="bold">M3_s04_temp.png 이미지 (온도와 광합성)</text></svg>`
};

const fallbackLettuce = {
  pale: `<svg viewBox="0 0 100 100" style="width:100%; height:100%; border-radius:8px; border:2px solid #a5d6a7; background:#f1f8e9;"><path d="M50 15 Q80 15 85 50 Q80 85 50 85 Q20 85 15 50 Q20 15 50 15 Z" fill="#dcedc8" stroke="#81c784" stroke-width="2"/><text x="50" y="55" font-size="14" font-weight="bold" text-anchor="middle" fill="#78909c">탈색 잎</text></svg>`,
  blue: `<svg viewBox="0 0 100 100" style="width:100%; height:100%; border-radius:8px; border:2px solid #311b92; background:#ede7f6;"><path d="M50 15 Q80 15 85 50 Q80 85 50 85 Q20 85 15 50 Q20 15 50 15 Z" fill="#311b92" stroke="#1a237e" stroke-width="2"/><text x="50" y="55" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff">청람색</text></svg>`,
  yellow: `<svg viewBox="0 0 100 100" style="width:100%; height:100%; border-radius:8px; border:2px solid #ffca28; background:#fff8e1;"><path d="M50 15 Q80 15 85 50 Q80 85 50 85 Q20 85 15 50 Q20 15 50 15 Z" fill="#ffca28" stroke="#f57f17" stroke-width="2"/><text x="50" y="55" font-size="14" font-weight="bold" text-anchor="middle" fill="#5d4037">황갈색</text></svg>`
};

function showFallback(imgEl, type) { imgEl.outerHTML = fallbackSVG[type]; }

function launchConfetti() {
  const canvasConf = document.getElementById('confetti-canvas');
  if(!canvasConf) return;
  const ctxConf = canvasConf.getContext('2d');
  canvasConf.width = window.innerWidth;
  canvasConf.height = window.innerHeight;
  let confettiPieces = [];
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
  for (let i = 0; i < 90; i++) {
    confettiPieces.push({ x: canvasConf.width / 2, y: canvasConf.height / 2, w: Math.random() * 8 + 4, h: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)], vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.7) * 16, gravity: 0.35, rotation: Math.random() * 360, spin: (Math.random() - 0.5) * 10 });
  }
  function renderConfetti() {
    ctxConf.clearRect(0, 0, canvasConf.width, canvasConf.height);
    let alive = false;
    confettiPieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rotation += p.spin;
      if (p.y < canvasConf.height) { alive = true; ctxConf.save(); ctxConf.translate(p.x, p.y); ctxConf.rotate((p.rotation * Math.PI) / 180); ctxConf.fillStyle = p.color; ctxConf.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctxConf.restore(); }
    });
    if (alive) requestAnimationFrame(renderConfetti);
    else ctxConf.clearRect(0, 0, canvasConf.width, canvasConf.height);
  }
  renderConfetti();
}

function launchMasterConfetti() {
  const canvasConf = document.getElementById('confetti-canvas');
  if(!canvasConf) return;
  const ctxConf = canvasConf.getContext('2d');
  canvasConf.width = window.innerWidth;
  canvasConf.height = window.innerHeight;
  let confettiPieces = [];
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
  let isGenerating = true;
  setTimeout(() => { isGenerating = false; }, 5000);
  function addPieces() {
     if (isGenerating && confettiPieces.length < 200) {
         for(let i=0; i<5; i++) {
             confettiPieces.push({ x: canvasConf.width / 2, y: canvasConf.height / 2, w: Math.random() * 8 + 4, h: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)], vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.7) * 16 - 5, gravity: 0.35, rotation: Math.random() * 360, spin: (Math.random() - 0.5) * 10 });
         }
     }
  }
  function renderConfetti() {
    addPieces();
    ctxConf.clearRect(0, 0, canvasConf.width, canvasConf.height);
    let alive = false;
    confettiPieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rotation += p.spin;
      if (p.y < canvasConf.height) { alive = true; ctxConf.save(); ctxConf.translate(p.x, p.y); ctxConf.rotate((p.rotation * Math.PI) / 180); ctxConf.fillStyle = p.color; ctxConf.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctxConf.restore(); }
    });
    if (alive || isGenerating) requestAnimationFrame(renderConfetti);
    else ctxConf.clearRect(0, 0, canvasConf.width, canvasConf.height);
  }
  renderConfetti();
}

function setupTouchDragAndDrop() {
  const draggables = document.querySelectorAll('.badge, .m3-badge');
  let ghost = null;
  let draggedItem = null;

  draggables.forEach(item => {
    item.style.touchAction = 'none';
    item.addEventListener('touchstart', function(e) {
      this.isDragging = false;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      draggedItem = this;

      ghost = this.cloneNode(true);
      ghost.removeAttribute('id');
      ghost.style.position = 'fixed';
      ghost.style.zIndex = '10000';
      ghost.style.opacity = '0.8';
      ghost.style.pointerEvents = 'none';
      ghost.style.margin = '0'; 
      
      const rect = this.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const offsetY = e.touches[0].clientY - rect.top;
      ghost.dataset.offsetX = offsetX;
      ghost.dataset.offsetY = offsetY;

      ghost.style.left = (e.touches[0].clientX - offsetX) + 'px';
      ghost.style.top = (e.touches[0].clientY - offsetY) + 'px';
      document.body.appendChild(ghost);
      this.style.opacity = '0.4';
    }, {passive: false});

    item.addEventListener('touchmove', function(e) {
      if (!ghost) return;
      const dx = e.touches[0].clientX - this.startX;
      const dy = e.touches[0].clientY - this.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { this.isDragging = true; }

      if (this.isDragging) {
          e.preventDefault();
          const offsetX = parseFloat(ghost.dataset.offsetX);
          const offsetY = parseFloat(ghost.dataset.offsetY);
          ghost.style.left = (e.touches[0].clientX - offsetX) + 'px';
          ghost.style.top = (e.touches[0].clientY - offsetY) + 'px';

          document.querySelectorAll('.drag-over, .drag-over-m3').forEach(el => el.classList.remove('drag-over', 'drag-over-m3'));
          
          const dropTarget = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
          if (dropTarget) {
              const m2Zone = dropTarget.closest('#factory-dropzone, #source-badges');
              if (m2Zone && this.classList.contains('badge')) m2Zone.classList.add('drag-over');

              const m3Zone = dropTarget.closest('.m3-dropzone, .m3-badge-pool, #m1-dropzone, #m1-pool');
              if (m3Zone && this.classList.contains('m3-badge')) m3Zone.classList.add('drag-over-m3');
          }
      }
    }, {passive: false});

    item.addEventListener('touchend', function(e) {
      if (ghost) { ghost.remove(); ghost = null; }
      this.style.opacity = '1';

      document.querySelectorAll('.drag-over, .drag-over-m3').forEach(el => el.classList.remove('drag-over', 'drag-over-m3'));

      if (this.isDragging) {
          e.preventDefault();
          const touch = e.changedTouches[0];
          const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

          if (dropTarget) {
              if (this.classList.contains('badge')) {
                  const targetZone = dropTarget.closest('#factory-dropzone, #source-badges');
                  if (targetZone) {
                      if (targetZone.id === 'factory-dropzone') document.getElementById('factory-items').appendChild(this);
                      else targetZone.appendChild(this);
                  }
              } 
              else if (this.classList.contains('m3-badge')) {
                  const targetZone = dropTarget.closest('.m3-dropzone, .m3-badge-pool, #m1-dropzone, #m1-pool');
                  if (targetZone) { targetZone.appendChild(this); }
              }
          }
      }
      setTimeout(() => { this.isDragging = false; }, 50);
      draggedItem = null;
    });
  });
}

function allowDrop(ev) { ev.preventDefault(); if(ev.currentTarget && ev.currentTarget.classList) ev.currentTarget.classList.add('drag-over'); }
function dragLeave(ev) { if(ev.currentTarget && ev.currentTarget.classList) ev.currentTarget.classList.remove('drag-over'); }
function drag(ev) { ev.dataTransfer.setData("text/plain", ev.target.id); }
function drop(ev) {
  ev.preventDefault();
  if(ev.currentTarget && ev.currentTarget.classList) ev.currentTarget.classList.remove('drag-over');
  let data = ev.dataTransfer.getData("text/plain") || ev.dataTransfer.getData("text");
  if (!data) return;
  const el = document.getElementById(data);
  if (el) {
    if (ev.currentTarget.id === 'factory-dropzone') document.getElementById('factory-items').appendChild(el);
    else if (ev.currentTarget.id === 'source-badges') ev.currentTarget.appendChild(el);
    el.setAttribute('data-dropped', 'true');
    setTimeout(() => el.removeAttribute('data-dropped'), 300);
  }
}

// ==========================================
// 3. 미션 5 (M5) 스크립트 [복원됨]
// ==========================================

function checkM5Quiz() {
  const dropzone = document.getElementById('m5-dropzone');
  const msg = document.getElementById('m5-quiz-msg');
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
  
  if (items[0].id === 'm5-opt-1') { 
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 생태계의 기초는 '생산자'입니다.";
    
    setTimeout(() => {
      document.getElementById('m5-quiz-modal').style.display = 'none';
      document.getElementById('m5-step1-box').style.display = 'none';
      document.getElementById('m5-main-content').style.display = 'block';
      
      let p = getProgress();
      p.m5MaxStep = 2; // 슬라이더 조작 파트 해제
      saveProgress(p);
    }, 1200);
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 아쉽네요. 식물처럼 스스로 양분을 만드는 생물의 역할은 무엇일까요?";
  }
}

let m5RecoveryTriggered = false;
function checkSliderRecovery(val) {
  if (val == 100 && !m5RecoveryTriggered) {
    m5RecoveryTriggered = true;
    setTimeout(() => {
      document.getElementById('m5-recovery-modal').style.display = 'flex';
    }, 800);
  } else if (val < 100) {
    m5RecoveryTriggered = false;
  }
}

function checkRecoveryQuiz(answer, btnElem) {
  const msg = document.getElementById('m5-recovery-msg');
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

// ==========================================
// 4. 미션 1 (M1) 스크립트
// ==========================================
let selectedLeft = null;
let selectedRight = null;
let matchedPairsCount = 0;

function jumpToM1Step(step) {
  for(let i=1; i<=5; i++) {
    let el = document.getElementById(`stage1-step${i}`);
    if(el) el.style.display = (i === step) ? 'block' : 'none';
  }
  updateStepUI('m1', 5, step);
  if(step===2) setTimeout(redrawLines, 100);
}

function selectMatchItem(elem, side) {
  if (elem.classList.contains('matched')) return;
  const msg = document.getElementById('matching-error-msg');
  msg.innerText = "좌우 항목을 터치하여 알맞은 짝을 연결해보세요.";
  msg.style.color = '#546e7a';
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
}

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
      msg.innerText = "✅ 정답입니다! 모든 소기관과 기능이 알맞게 연결되었습니다.";
      msg.style.color = '#2e7d32';
      const btn = document.getElementById('btn-go-step3-from-matching');
      btn.style.display = 'inline-block';
      btn.onclick = () => {
         handleStepUnlock(1, 3, 'Step 3. 원료 투입', '이제 엽록체 공장에 원료를 투입할 수 있습니다.', () => jumpToM1Step(3));
      };
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
  const container = document.getElementById('matching-quiz');
  const svg = document.getElementById('matching-lines');
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

const itemData = {
  '물': { title: '💧 물 (Water)', desc: '뿌리에서 흡수되어 물관을 타고 잎으로 이동하는 광합성의 핵심 원료입니다. 반 헬몬트는 버드나무 실험을 통해 식물의 질량 증가가 단순히 흙의 감소만으로 설명되지 않으며 물이 중요하다고 생각했습니다.', img: 'photo_water.png' },
  '이산화탄소': { title: '💨 이산화탄소 (CO₂)', desc: '잎의 기공을 통해 공기 중에서 흡수되는 광합성의 원료 기체입니다. 세네비에의 실험(1782)을 통해 식물이 CO₂가 있는 환경에서만 산소를 방출함이 증명되었습니다.' },
  '빛에너지': { title: '☀️ 빛에너지 (Light Energy)', desc: '태양으로부터 오는 에너지로, 물과 이산화탄소를 결합시키는 원동력입니다. 잉엔하우스(1779)는 빛이 비칠 때만 식물이 산소를 발생시킴을 밝혔습니다.', img: 'photo_light_gs.png' },
  '산소': { title: '🫧 산소 (Oxygen)', desc: '광합성의 결과물로 만들어져 기공을 통해 대기 중으로 배출되는 기체입니다. 식물 자신의 호흡에도 사용됩니다.', img: 'photo_O2.png' },
  '녹말': { title: '🥔 녹말 (Starch)', desc: '광합성으로 처음 만들어진 포도당이 수많은 사슬로 연결되어 엽록체에 임시로 저장되는 형태(다당류)입니다.' },
  '질소': { title: '🧪 질소 (Nitrogen)', desc: '뿌리를 통해 무기 이온 형태로 흡수되며 단백질과 핵산을 만드는 데 필수적입니다. 광합성 반응 자체의 직접적인 원료는 아닙니다.' },
  '포도당': { title: '🍬 포도당 (Glucose)', desc: '엽록체에서 광합성 반응을 통해 가장 먼저 합성되는 단맛이 나는 유기 양분입니다. 광합성으로 만들어진 유기 양분을 포도당으로 단순화하여 나타냅니다.' },
  '단백질': { title: '🥚 단백질 (Protein)', desc: '포도당과 뿌리에서 흡수한 질소가 결합하여 합성되는 물질로, 식물의 몸체를 구성하고 효소를 만듭니다.' },
  '지방': { title: '🧈 지방 (Fat)', desc: '포도당이 변환되어 주로 씨앗(땅콩, 깨 등)에 저장되는 고효율 에너지 물질입니다.' },
  '흙': { title: '🪴 흙 (Soil)', desc: '식물을 지지하고 수분과 무기물을 제공하는 터전이지만, 흙 자체가 식물의 밥(광합성 원료)은 아닙니다.' },
  '화학에너지': { title: '🔋 화학에너지 (Chemical Energy)', desc: '흡수한 빛에너지가 유기물(포도당)의 결합 속에 저장된 형태의 에너지입니다.' },
  '전기에너지': { title: '⚡ 전기에너지 (Electrical Energy)', desc: '인간이 만들어 쓰는 에너지 형태로, 식물의 자연적인 광합성에는 사용되지 않습니다.' }
};

function checkM1Step1() {
  const q1 = document.getElementById('m1-s1-q1').value.replace(/\s+/g, '');
  const q2 = document.getElementById('m1-s1-q2').value.replace(/\s+/g, '');
  const msg = document.getElementById('m1-s1-msg');
  const btnNext = document.getElementById('btn-go-step2');

  const isQ1Correct = q1.includes('양분') && (q1.includes('스스로') || q1.includes('자신이') || q1.includes('식물이') || q1.includes('만든') || q1.includes('만들어'));
  const isQ2Correct = q2.includes('광합성');

  if (isQ1Correct && isQ2Correct) {
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 식물은 광합성을 통해 스스로 양분을 만들어 살아갑니다.";
    btnNext.style.display = "inline-flex"; 
    btnNext.onclick = () => {
       handleStepUnlock(1, 2, 'Step 2. 세포 구조', '식물 세포의 구조와 기능을 매칭해보세요.', () => jumpToM2Step(2));
    };
  } else {
    msg.style.color = '#c62828';
    msg.innerText = '❌ 오답이 있습니다. 다시 생각해 보세요. (질문1 힌트: "000 00 00을 먹고 산다", 질문2 힌트: 광합성)';
    btnNext.style.display = "none";
  }
}

function handleBadgeClick(id, text) {
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
    if (el && el.parentElement.id === 'factory-items') { btnMove.innerText = "⬆️ 보관함으로 다시 빼기"; btnMove.style.background = "#f57f17"; } 
    else { btnMove.innerText = "⬇️ 엽록체 공장으로 투입하기"; btnMove.style.background = "#2e7d32"; }
    btnMove.style.display = 'inline-flex';
  }
  document.getElementById('exp-modal').style.display = 'flex';
}

function showInfoModal(title, text) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-img-container').style.display = 'none';
  document.getElementById('modal-desc').innerText = '';
  document.getElementById('modal-exp').innerHTML = text;
  const btnMove = document.getElementById('btn-move-factory');
  if(btnMove) btnMove.style.display = 'none'; 
  document.getElementById('exp-modal').style.display = 'flex';
}

function moveBadgeToFactory() {
  if (!currentActiveBadgeId) return;
  const el = document.getElementById(currentActiveBadgeId);
  if (el) {
    if (el.parentElement.id === 'factory-items') document.getElementById('source-badges').appendChild(el);
    else document.getElementById('factory-items').appendChild(el);
  }
  closeModal();
}
 
function closeModal() { 
  document.getElementById('exp-modal').style.display = 'none'; 
  currentActiveBadgeId = null; 
  const btnMove = document.getElementById('btn-move-factory');
  if(btnMove) btnMove.style.display = 'inline-flex';
}

function runFactory() {
  const factory = document.getElementById('factory-items');
  const items = factory.querySelectorAll('.badge');
  const msg = document.getElementById('msg-factory');
  
  if(items.length !== 3) { msg.style.color = '#c62828'; msg.innerText = "⚠️ 원료 2가지와 에너지 1가지, 정확히 3가지를 넣으세요."; return; }
  let hasWater = false, hasCO2 = false, hasLight = false;
  items.forEach(item => { if(item.id === 'b-water') hasWater = true; if(item.id === 'b-co2') hasCO2 = true; if(item.id === 'b-light') hasLight = true; });

  if(hasWater && hasCO2 && hasLight) {
    msg.style.color = '#2e7d32'; msg.innerText = "✅ 정확합니다! 엽록체 합성 공장을 가동합니다.";
    setTimeout(() => {
      document.getElementById('quiz-modal').style.display = 'flex';
      document.getElementById('quiz-msg-1').innerText = ""; document.getElementById('quiz-msg-2').innerText = "";
      document.getElementById('quiz-q2-area').style.display = 'none'; document.getElementById('btn-start-fusion').style.display = 'none';
      q1Step = 0;
      document.querySelectorAll('#quiz-q1-area .btn-action').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
    }, 800);
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 조합 오류! 광합성에 꼭 필요한 원료 2가지와 에너지 1가지를 고르세요!";
  }
}

let q1Step = 0;
function checkQuiz(qNum, answer, btnElem) {
  if (qNum === 1) {
    const msgEl = document.getElementById('quiz-msg-1');
    if (q1Step === 0) {
      if (answer === '뿌리') {
        msgEl.style.color = '#2e7d32'; msgEl.innerText = "✅ 첫 번째 정답! '뿌리'에서 흡수되어... 다음은 어디를 타고 잎으로 갈까요?";
        q1Step = 1; if(btnElem) { btnElem.style.opacity = '0.5'; btnElem.style.pointerEvents = 'none'; }
      } else {
        msgEl.style.color = '#c62828'; msgEl.innerText = "❌ 아쉽네요. 물을 식물 체내로 가장 먼저 빨아들이는 곳을 고르세요.";
      }
    } else if (q1Step === 1) {
      if (answer === '물관') {
        msgEl.style.color = '#2e7d32'; msgEl.innerText = "✅ 완벽합니다! '물관'을 타고 잎으로 이동합니다.";
        q1Step = 2; if(btnElem) { btnElem.style.opacity = '0.5'; btnElem.style.pointerEvents = 'none'; }
        document.getElementById('quiz-q2-area').style.display = 'block';
      } else {
        msgEl.style.color = '#c62828'; msgEl.innerText = "❌ 아쉽네요. 뿌리에서 흡수한 물이 올라가는 전용 통로를 고르세요.";
      }
    }
  } else if (qNum === 2) {
    const msgEl = document.getElementById('quiz-msg-2');
    if (answer === '기공') {
      msgEl.style.color = '#2e7d32'; msgEl.innerText = "✅ 맞습니다! 이산화탄소는 잎 뒷면의 '기공'으로 들어옵니다.";
      document.getElementById('btn-start-fusion').style.display = 'block';
    } else {
      msgEl.style.color = '#c62828'; msgEl.innerText = "❌ 아쉽네요. 기체가 드나드는 잎의 작은 구멍을 고르세요.";
    }
  }
}

function startFusionAfterQuiz() {
  document.getElementById('quiz-modal').style.display = 'none';
  launchConfetti();
  openStage2ImageModal(2);
}

let currentStage2Step = 1;
function openStage2ImageModal(stepNum) {
  currentStage2Step = stepNum || 1;
  renderStage2Step();
  document.getElementById('stage2-image-modal').style.display = 'flex';
}
function closeStage2ImageModal() { document.getElementById('stage2-image-modal').style.display = 'none'; }

function renderStage2Step() {
  const titleEl = document.getElementById('step-modal-title');
  const frameEl = document.getElementById('step-image-frame');
  const descEl = document.getElementById('step-image-desc');
  const progressEl = document.getElementById('step-progress-text');
  const btnNext = document.getElementById('btn-next-step');
  const btnPrev = document.getElementById('btn-prev-step');

  if (currentStage2Step === 1) {
    titleEl.innerHTML = "🔬 현미경 관찰: 검정말 잎세포 속 엽록체";
    frameEl.innerHTML = `<img src="chloroplast.png" alt="엽록체" style="width:100%; max-height:420px; object-fit:contain;">`;
    descEl.innerHTML = `<strong>[현미경 관찰 결과]</strong> 식물 잎세포 속에는 녹색 알갱이인 <strong>엽록체</strong>가 분포합니다. 엽록체 안에 초록색을 띠는 색소인 <strong>엽록소</strong>가 있으며, 엽록소는 광합성에 필요한 빛에너지를 흡수합니다.`;
    progressEl.innerText = "탐구 1단계: 엽록체 확인 완료";
    btnNext.style.display = "inline-block"; btnNext.innerText = "원료 준비하기 ➔"; 
    btnNext.onclick = () => {
        closeStage2ImageModal();
        jumpToM1Step(3);
    };
    btnPrev.style.display = "none";
  } else {
    titleEl.innerHTML = "⚙️ 광합성 공장 모식도 (Photosynthesis)";
    frameEl.innerHTML = `<img src="photosynthesis_gs1.png" alt="광합성 모식도" style="width:100%; max-height:500px; object-fit:contain;" onerror="showFallback(this, 'photosynthesis')">`;
    descEl.innerHTML = `<strong>[광합성 메커니즘 분석]</strong> 뿌리에서 온 물, 기공으로 들어온 이산화 탄소, 빛에너지가 엽록체에 모여 포도당과 산소를 만듭니다.`;
    progressEl.innerText = "탐구 2단계: 광합성 메커니즘 확인 완료";
    
    btnNext.style.display = "inline-block"; btnNext.innerText = "확인"; btnNext.style.background = "#f57f17";
    btnNext.onclick = function() {
      closeStage2ImageModal();
      handleStepUnlock(1, 4, 'Step 4. 기체 확인', '이제 광합성에 필요한 물질을 센서로 확인해볼 수 있습니다.', () => jumpToM2Step(4));
    };
    btnPrev.style.display = "none";
  }
}

let exp1AnimFrame;
function runSensorExp() {
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
}

function checkExp1() {
  const rawVal = document.getElementById('exp1-conclusion').value.trim();
  const msg = document.getElementById('exp1-msg'); const btnNext = document.getElementById('btn-go-step5');
  if (!rawVal) { msg.style.color = '#c62828'; msg.innerText = "❌ 결론을 입력해 주세요."; btnNext.style.display = "none"; return; }

  let parsedVal = rawVal.replace(/이산화\s*탄소/g, 'C').replace(/co2/gi, 'C');
  parsedVal = parsedVal.replace(/산소/g, 'O').replace(/o2/gi, 'O');
  const decMatch = parsedVal.match(/(감소|줄어|소모|흡수)/); const incMatch = parsedVal.match(/(증가|늘어|발생|방출)/);
  const idxC = parsedVal.indexOf('C'); const idxO = parsedVal.indexOf('O');

  if (idxC !== -1 && idxO !== -1 && decMatch && incMatch) {
      const idxDec = decMatch.index; const idxInc = incMatch.index;
      const distC_Dec = Math.abs(idxC - idxDec); const distO_Dec = Math.abs(idxO - idxDec);
      const distC_Inc = Math.abs(idxC - idxInc); const distO_Inc = Math.abs(idxO - idxInc);
      
      if (distC_Dec <= distO_Dec && distO_Inc <= distC_Inc) {
          msg.style.color = '#2e7d32'; msg.innerText = "✅ 정답입니다! 식물이 광합성 과정에서 이산화 탄소를 흡수하기 때문에 이산화탄소는 감소하고, 산소를 방출하기 때문에 산소는 증가함을 잘 분석했습니다.";
          btnNext.style.display = "inline-block";
          btnNext.onclick = () => { handleStepUnlock(1, 5, 'Step 5. 양분 확인', '아이오딘 반응을 통해 광합성 산물을 확인해봅시다.', () => jumpToM2Step(5)); };
      } else if (distO_Dec < distC_Dec && distC_Inc < distO_Inc) {
          msg.style.color = '#c62828'; msg.innerText = "❌ 기체의 변화가 잘못 연결되었습니다. 다시 맞춰보세요!"; btnNext.style.display = "none";
      } else {
          msg.style.color = '#c62828'; msg.innerText = "⚠️ 판별 불가! 문장을 더 명확하게 다시 작성해 주세요."; btnNext.style.display = "none";
      }
  } else {
      msg.style.color = '#c62828'; msg.innerText = "❌ 핵심 단어가 부족합니다. (이산화탄소, 산소, 흡수/방출/증가/감소 등 모두 포함)"; btnNext.style.display = "none";
  }
}

function revealLeaf(type, elem) {
  if(type === 'light') elem.innerHTML = `<img src="lettuce_light_after.jpg" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:2px solid #311b92;" onerror="this.outerHTML=fallbackLettuce.blue" alt="청람색 변색">`;
  else elem.innerHTML = `<img src="lettuce_dark_after.jpg" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:2px solid #ffca28;" onerror="this.outerHTML=fallbackLettuce.yellow" alt="황갈색">`;
}

function checkExp2() {
  const val = document.getElementById('exp2-conclusion').value.trim(); const msg = document.getElementById('exp2-msg');
  if (!val) { msg.style.color = '#c62828'; msg.innerText = "❌ 결론을 입력해 주세요."; return; }
  const hasPhoto = val.includes('광합성'); const hasStarch = val.includes('녹말'); const hasColor = val.includes('청람');
  
  if (hasPhoto && hasStarch && hasColor) {
      msg.style.color = '#2e7d32'; msg.innerText = "✅ 정확합니다! 빛을 받아 광합성을 하고, 만들어진 양분이 녹말 형태로 저장되어 아이오딘 용액과 반응하여 청람색이 나타난 것입니다.";
      document.getElementById('stage2-final-btns').style.display = "block";
  } else {
      msg.style.color = '#c62828';
      let hints = []; if (!hasPhoto) hints.push("'광합성'"); if (!hasStarch) hints.push("'녹말'"); if (!hasColor) hints.push("'청람색'");
      msg.innerText = `❌ 필수 핵심어(${hints.join(', ')})가 빠져 있습니다. 다시 적어보세요!`;
  }
}

function checkPhotoAll() {
  const q1 = document.getElementById('pa-q1').value.replace(/\s+/g, '');
  const q2 = document.getElementById('pa-q2').value.replace(/\s+/g, '');
  const q3 = document.getElementById('pa-q3').value.replace(/\s+/g, '');
  const q4 = document.getElementById('pa-q4').value.replace(/\s+/g, '');
  const q5 = document.getElementById('pa-q5').value.replace(/\s+/g, '');
  const q6 = document.getElementById('pa-q6').value.replace(/\s+/g, '');
  const q7 = document.getElementById('pa-q7').value.replace(/\s+/g, '');
  const q8 = document.getElementById('pa-q8').value.replace(/\s+/g, '');
  const q9 = document.getElementById('pa-q9').value.replace(/\s+/g, '');
  const msg = document.getElementById('pa-msg');
  const btnNext = document.getElementById('btn-pa-next');

  const isQ1Q2 = (q1 === '물' && q2 === '이산화탄소') || (q1 === '이산화탄소' && q2 === '물');
  const isQ3 = q3 === '엽록체';
  const isQ4 = q4 === '빛' || q4 === '빛에너지';
  const isQ5Q6 = (q5 === '산소' && q6 === '포도당') || (q5 === '포도당' && q6 === '산소');
  const isQ7 = q7 === '포도당';
  const isQ8 = q8 === '녹말';
  const isQ9 = q9 === '엽록체';

  if (isQ1Q2 && isQ3 && isQ4 && isQ5Q6 && isQ7 && isQ8 && isQ9) {
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 완벽합니다! 광합성 공장의 원리를 모두 이해하셨습니다.";
    btnNext.style.display = "inline-block";
    btnNext.onclick = () => {
       handleMissionUnlock(1, 'Mission 2. 최적 조건', '다음 미션 잠금이 해제되었습니다!', () => location.href = 'mission2.html');
    };
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 틀린 곳이 있습니다. (힌트: 물, 이산화탄소, 엽록체, 빛에너지, 산소, 포도당, 녹말)";
    btnNext.style.display = "none";
  }
}

// ==========================================
// 5. 미션 2 (M2) 스크립트
// ==========================================
function allowDropM2(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over-m2'); }
function dragLeaveM2(ev) { ev.currentTarget.classList.remove('drag-over-m2'); }
function dragM2(ev) { ev.dataTransfer.setData("text/plain", ev.target.id); }
function dropM2(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.remove('drag-over-m2');
  const data = ev.dataTransfer.getData("text/plain");
  const el = document.getElementById(data);
  if (el && el.classList.contains('m2-badge')) {
    if (ev.currentTarget.classList.contains('m2-dropzone') || ev.currentTarget.classList.contains('m2-badge-pool')) ev.currentTarget.appendChild(el);
  }
}

function checkM2Vars(stepNum, expectedVar1, expectedVar2Arr, expectedVar3) {
  const v1 = Array.from(document.getElementById(`m2-s${stepNum}-var1`).children).map(e => e.dataset.val);
  const v2 = Array.from(document.getElementById(`m2-s${stepNum}-var2`).children).map(e => e.dataset.val);
  const v3 = Array.from(document.getElementById(`m2-s${stepNum}-var3`).children).map(e => e.dataset.val);

  if (v1.length !== 1 || v3.length !== 1 || v2.length !== 4) return {ok: false, msg: "❌ 빈칸에 알맞은 뱃지를 모두 채워주세요. (조작 1개, 통제 4개, 종속 1개)"};
  if (v1[0] !== expectedVar1) return {ok: false, msg: "❌ '다르게 할 조건(조작 변인)'이 틀렸습니다."};
  if (v3[0] !== expectedVar3) return {ok: false, msg: "❌ '측정할 것(종속 변인)'이 틀렸습니다."};
  
  const isAllControlsPresent = expectedVar2Arr.every(val => v2.includes(val));
  if (!isAllControlsPresent) return {ok: false, msg: "❌ '같게 할 조건(통제 변인)'에 나머지 4가지 환경 요인이 모두 들어가야 합니다."};
  return {ok: true, msg: ""};
}

function goM2Step(step) {
  document.querySelectorAll('.m2-step-container').forEach(el => el.classList.remove('active'));
  const targetStep = document.getElementById(`m2-step${step}`);
  if(targetStep) targetStep.classList.add('active');
  
  updateStepUI('m2', 5, step);
  if(step === 2) drawSingleGraph('chart-light-only', 0, (x)=>computeRate(x, 70, 25).rate, '빛의 세기 (상대값)', '#2e7d32');
  if(step === 3) drawSingleGraph('chart-co2-only', 0, (x)=>computeRate(70, x, 25).rate, '이산화 탄소 농도 (상대값)', '#0277bd');
  if(step === 4) drawSingleGraph('chart-temp-only', 0, getTempRate, '온도(℃)', '#d84315');
  if(step === 5) {
     document.getElementById('slider-light').value = 20; document.getElementById('slider-co2').value = 20; document.getElementById('slider-temp').value = 20;
     updateSimulationCombined();
  }
}

function checkM2Step1Eq() {
  const eq1 = document.getElementById('m2-eq-in-1').value.trim().replace(/\s+/g, '');
  const eq2 = document.getElementById('m2-eq-in-2').value.trim().replace(/\s+/g, '');
  const en = document.getElementById('m2-eq-energy').value.trim().replace(/\s+/g, '');
  const out1 = document.getElementById('m2-eq-out-1').value.trim().replace(/\s+/g, '');
  const out2 = document.getElementById('m2-eq-out-2').value.trim().replace(/\s+/g, '');
  const msg = document.getElementById('m2-eq-msg');
  
  const inCorrect = (eq1 === '물' && eq2.includes('이산화탄소')) || (eq2 === '물' && eq1.includes('이산화탄소'));
  const enCorrect = (en === '빛' || en === '빛에너지');
  const outCorrect = (out1 === '포도당' && out2 === '산소') || (out2 === '포도당' && out1 === '산소');
  
  if(inCorrect && enCorrect && outCorrect) {
    msg.style.color = '#2e7d32'; msg.innerText = "✅ 광합성 식 완성! 이제 환경 요인 3가지를 예측해 보세요.";
    document.getElementById('m2-factors-area').style.display = 'block';
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 식의 일부가 틀렸습니다. 다시 확인해 보세요.";
  }
}

function checkM2Step1Factors() {
  const f1 = document.getElementById('m2-fac-1').value.trim();
  const f2 = document.getElementById('m2-fac-2').value.trim();
  const f3 = document.getElementById('m2-fac-3').value.trim();
  const msg = document.getElementById('m2-fac-msg');
  
  const combined = f1 + f2 + f3;
  const hasLight = combined.includes('빛');
  const hasCO2 = combined.includes('이산화탄소') || combined.includes('이산화 탄소');
  const hasTemp = combined.includes('온도');
  
  if(hasLight && hasCO2 && hasTemp) {
    msg.style.color = '#2e7d32'; msg.innerText = "✅ 정확합니다! 탐구 스텝이 열립니다.";
    const btnNext = document.getElementById('btn-m2-next1');
    btnNext.style.display = 'inline-block';
    btnNext.onclick = () => { handleStepUnlock(2, 2, 'Step 2. 빛의 세기', '빛의 세기가 광합성에 미치는 영향을 알아보세요.', () => goM3Step(2)); };
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 3가지 핵심 요인(빛, 이산화탄소, 온도)을 정확히 적어주세요.";
  }
}

function computeRate(L, C, T) {
  const effectiveLight = (L / (L + 15)) * 40; const effectiveCO2 = (C / (C + 20)) * 40;
  const tempRate = getTempRate(T);
  const rate = Math.round( Math.min(effectiveLight, effectiveCO2) * (tempRate / 30) );
  return { rate: Math.max(0, rate) };
}

function createSpline(xs, ys) {
    let n = xs.length; let m = new Float32Array(n); let secants = new Float32Array(n-1);
    for(let i=0; i<n-1; i++) secants[i] = (ys[i+1] - ys[i]) / (xs[i+1] - xs[i]);
    for(let i=1; i<n-1; i++) {
        if (secants[i-1]*secants[i] <= 0) m[i] = 0;
        else m[i] = 2 / (1/secants[i-1] + 1/secants[i]);
    }
    m[0] = secants[0]; m[n-1] = secants[n-2];
    for(let i=0; i<n-1; i++) { if (secants[i] === 0) { m[i] = 0; m[i+1] = 0; } }
    
    return function(x) {
        if (x <= xs[0]) return ys[0]; if (x > xs[n-1]) return 0;
        let i = 0; while(x >= xs[i+1]) i++;
        let t = (x - xs[i]) / (xs[i+1] - xs[i]); let t2 = t*t; let t3 = t2*t;
        let h00 = 2*t3 - 3*t2 + 1; let h10 = t3 - 2*t2 + t; let h01 = -2*t3 + 3*t2; let h11 = t3 - t2;
        let dx = xs[i+1] - xs[i];
        let val = h00*ys[i] + h10*dx*m[i] + h01*ys[i+1] + h11*dx*m[i+1];
        return Math.max(0, val);
    }
}
 
const tempXs = [0, 5, 10, 15, 20, 25, 30, 33, 35, 36,    37,  38, 39, 40, 42, 45, 50, 55, 60];
const tempYs = [2, 3,  5,  8, 13, 21, 28, 30, 30.8, 31.2, 30.8, 30, 25, 16, 8, 3, 2.0, 1.4, 1.1];
const getTempRate = createSpline(tempXs, tempYs);

function drawSingleGraph(canvasId, currentX, rateFunc, xLabel, strokeColor) {
  const cv = document.getElementById(canvasId); if (!cv) return;
  const ctx = cv.getContext('2d'); const w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  
  const padL = 35, padR = 15, padT = 20, padB = 25;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const maxX = (xLabel.includes('온도')) ? 60 : 100;
  const maxY = 45;

  ctx.beginPath(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1.5;
  ctx.moveTo(padL, padT - 10); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR + 10, h - padB); ctx.stroke();
  
  ctx.fillStyle = '#546e7a'; ctx.font = 'bold 11px sans-serif';
  ctx.fillText('광합성량', 5, 12);
  ctx.fillText(xLabel, w / 2 - 20, h - 5);
  ctx.fillText('0', padL - 12, h - padB + 10);

  ctx.beginPath(); ctx.moveTo(padL - 3, padT - 5); ctx.lineTo(padL, padT - 12); ctx.lineTo(padL + 3, padT - 5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w - padR + 5, h - padB - 3); ctx.lineTo(w - padR + 12, h - padB); ctx.lineTo(w - padR + 5, h - padB + 3); ctx.fill();

  ctx.beginPath(); ctx.strokeStyle = strokeColor; ctx.lineWidth = 3;
  for (let px = 0; px <= plotW; px++) {
    const dataX = (px / plotW) * maxX;
    const dataY = rateFunc(dataX);
    const py = (h - padB) - (dataY / maxY) * plotH;
    if (px === 0) ctx.moveTo(padL + px, py); else ctx.lineTo(padL + px, py);
  }
  ctx.stroke();
  
  const currentXNum = parseFloat(currentX);
  const curPx = padL + (currentXNum / maxX) * plotW;
  const curPy = (h - padB) - (rateFunc(currentXNum) / maxY) * plotH;
  
  ctx.beginPath(); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1;
  ctx.moveTo(curPx, h - padB); ctx.lineTo(curPx, curPy); ctx.moveTo(padL, curPy); ctx.lineTo(curPx, curPy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.fillStyle = '#e53935'; ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2); ctx.fill();
}

function runM2Exp2() {
  const res = checkM2Vars(2, 'light', ['co2', 'temp', 'plant', 'soil'], 'photo');
  const msg = document.getElementById('m2-s2-var-msg');
  if(!res.ok) { msg.style.color = '#c62828'; msg.innerText = res.msg; return; }
  
  msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 조건 설계 완료! 아래에서 결과를 확인하세요.";
  document.getElementById('m2-s2-result-area').style.display = 'block';
}

function checkM2Conclusion2() {
  const c1 = document.getElementById('m2-s2-con1').value.trim();
  const c2 = document.getElementById('m2-s2-con2').value.trim();
  const msg = document.getElementById('m2-s2-con-msg');
  
  const isC1 = c1.includes('강해') || c1.includes('세') || c1.includes('증가') || c1.includes('높아');
  const hasIncrease = c2.includes('증가') || c2.includes('많아');
  const hasPlateau = c2.includes('일정') || c2.includes('더 이상') || c2.includes('포화') || c2.includes('유지');
  
  if(isC1 && hasIncrease && hasPlateau) {
    msg.style.color = '#2e7d32'; 
    msg.innerHTML = "✅ 정확합니다!<br>빛의 세기가 충분해지면 그 외의 다른 요인(CO₂ 농도, 온도 등)이 광합성을 제한하므로, 빛을 더 강하게 해도 광합성량은 거의 증가하지 않습니다.";
    showResultImage('M2_s02_light.png', '빛의 세기가 강할수록 광합성량이 증가하다가, 일정 세기 이상에서는 더 이상 증가하지 않고 일정해집니다.', 'M2_s02');
    
    const btnNext = document.getElementById('btn-m2-next2');
    btnNext.style.display = 'inline-block';
    btnNext.onclick = () => { handleStepUnlock(2, 3, 'Step 3. 이산화 탄소', '이산화 탄소가 광합성에 미치는 영향을 알아보세요.', () => goM2Step(3)); };
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 결론이 적절하지 않습니다. 증가하다가 어떻게 되는지 명확히 적어주세요. (예: 증가하다가 일정 세기 이상이면 일정하다)";
  }
}

function runM2Exp3() {
  const res = checkM2Vars(3, 'co2', ['light', 'temp', 'plant', 'soil'], 'photo');
  const msg = document.getElementById('m2-s3-var-msg');
  if(!res.ok) { msg.style.color = '#c62828'; msg.innerText = res.msg; return; }
  
  msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 조건 설계 완료! 아래에서 결과를 확인하세요.";
  document.getElementById('m2-s3-result-area').style.display = 'block';
}

function checkM2Conclusion3() {
  const c1 = document.getElementById('m2-s3-con1').value.trim();
  const c2 = document.getElementById('m2-s3-con2').value.trim();
  const msg = document.getElementById('m2-s3-con-msg');
  
  const isC1 = c1.includes('강해') || c1.includes('세') || c1.includes('증가') || c1.includes('높아') || c1.includes('진해') || c1.includes('많아');
  const hasIncrease = c2.includes('증가') || c2.includes('많아');
  const hasPlateau = c2.includes('일정') || c2.includes('더 이상') || c2.includes('포화') || c2.includes('유지');
  
  if(isC1 && hasIncrease && hasPlateau) {
    msg.style.color = '#2e7d32'; 
    msg.innerHTML = "✅ 정확합니다!<br>이산화 탄소가 충분해지면 그 외의 다른 요인(빛의 세기, 온도 등)이 광합성을 제한하므로, 농도를 더 높여도 광합성량은 거의 증가하지 않습니다.";
    showResultImage('M2_s03_CO2.png', '이산화 탄소 농도가 높아질수록 광합성량이 증가하다가, 일정 농도 이상에서는 더 이상 증가하지 않고 일정해집니다.', 'M2_s03');

    const btnNext = document.getElementById('btn-m2-next3');
    btnNext.style.display = 'inline-block';
    btnNext.onclick = () => { handleStepUnlock(2, 4, 'Step 4. 온도 탐구', '온도가 광합성에 미치는 영향을 알아보세요.', () => goM2Step(4)); };
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 결론이 적절하지 않습니다. 증가하다가 어떻게 되는지 명확히 적어주세요. (예: 증가하다가 일정 농도 이상이면 일정하다)";
  }
}

function runM2Exp4() {
  const res = checkM2Vars(4, 'temp', ['light', 'co2', 'plant', 'soil'], 'photo');
  const msg = document.getElementById('m2-s4-var-msg');
  if(!res.ok) { msg.style.color = '#c62828'; msg.innerText = res.msg; return; }

  msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 조건 설계 완료! 아래에서 결과를 확인하세요.";
  document.getElementById('m2-s4-result-area').style.display = 'block';
}

function checkM2Conclusion4() {
  const c1 = document.getElementById('m2-s4-con1').value.trim();
  const c2 = document.getElementById('m2-s4-con2').value.trim();
  const msg = document.getElementById('m2-s4-con-msg');
  
  const isC1 = c1.includes('높아') || c1.includes('올라가') || c1.includes('증가');
  const isC2 = c2.includes('증가') || c2.includes('많아');
  const c2Clean = c2.replace(/\s+/g, '');
  const hasDecrease = c2Clean.includes('감소') || c2Clean.includes('떨어') || c2Clean.includes('줄어');
  
  if(isC1 && isC2 && hasDecrease) {
    msg.style.color = '#2e7d32'; 
    msg.innerHTML = "✅ 정확합니다.<br>온도가 적정 범위까지 높아지면 광합성과 관련된 효소의 작용이 활발해져 광합성량이 증가합니다. 그러나 적정 범위를 크게 넘으면 효소의 기능이 떨어지고 식물의 생리 작용이 저해되어 광합성량이 감소합니다.";
    showResultImage('M2_s04_temp.png', '온도가 높아질수록 광합성량이 증가하다가, 특정 온도 범위를 넘으면 급격히 감소합니다.', 'M2_s04');

    const btnNext = document.getElementById('btn-m2-next4');
    btnNext.style.display = 'inline-block';
    btnNext.onclick = () => { handleStepUnlock(2, 5, 'Step 5. 최적 조건 찾기', '모든 요인을 조절해 광합성 마스터에 도전하세요!', () => goM2Step(5)); };
  } else {
    msg.style.color = '#c62828'; msg.innerText = "❌ 결론이 적절하지 않습니다. 증가하다가 적정 온도를 넘으면 어떻게 되는지 함께 묘사하세요. (예: 증가하다가 급격히 감소한다)";
  }
}

function showResultImage(imgName, desc, fallbackType) {
  document.getElementById('result-modal-title').innerHTML = "📈 실험 결과 확인";
  document.getElementById('result-image-frame').innerHTML = `<img src="${imgName}" alt="결과 그래프" style="width:100%; max-height:350px; object-fit:contain;" onerror="showFallback(this, '${fallbackType}')">`;
  document.getElementById('result-image-desc').innerHTML = desc;
  document.getElementById('result-image-modal').style.display = 'flex';
}

let masterAchieved = false;
function updateSimulationCombined() {
  const curL = parseInt(document.getElementById('slider-light').value);
  const curC = parseInt(document.getElementById('slider-co2').value);
  const curT = parseInt(document.getElementById('slider-temp').value);
  document.getElementById('val-light').innerText = curL;
  document.getElementById('val-co2').innerText = curC;
  document.getElementById('val-temp').innerText = curT;
  
  const res = computeRate(curL, curC, curT);
  document.getElementById('status-photo').innerHTML = `현재 분당 산소 방출 기포 수: <strong>${res.rate}개</strong>`;
  
  drawSingleGraph('chart-light', curL, (x)=>computeRate(x, curC, curT).rate, '빛의 세기 (상대값)', '#2e7d32');
  drawSingleGraph('chart-co2', curC, (x)=>computeRate(curL, x, curT).rate, 'CO₂ 농도 (상대값)', '#0277bd');
  drawSingleGraph('chart-temp', curT, (x)=>computeRate(curL, curC, x).rate, '온도(℃)', '#d84315');

  if (!masterAchieved && res.rate >= 33) {
     masterAchieved = true;
     setTimeout(() => { document.getElementById('conan-modal').style.display = 'flex'; }, 800);
  }
}

function checkConanQuiz() {
  const q1 = document.getElementById('conan-q1').value.replace(/\s+/g, '');
  const q2 = document.getElementById('conan-q2').value.replace(/\s+/g, '');
  const q3 = document.getElementById('conan-q3').value.replace(/\s+/g, '');
  const q4 = document.getElementById('conan-q4').value.replace(/\s+/g, '');
  const msg = document.getElementById('conan-msg');

  if (q1 === '김' && q2 === '미역' && q3 === '다시마' && q4 === '남세균') {
    msg.style.color = '#2e7d32';
    msg.innerText = "✅ 정답입니다! 다양한 생물이 광합성을 하네요.";
    setTimeout(() => {
        document.getElementById('conan-modal').style.display = 'none';
        handleMissionUnlock(2, "Mission 3 식물의 숨", "이제 식물의 호흡을 알아볼 수 있습니다!", () => {
             document.getElementById('master-modal').style.display = 'flex';
             launchMasterConfetti();
        });
    }, 1000);
  } else {
    msg.style.color = '#c62828';
    msg.innerText = "❌ 오답이 있습니다. 초성 힌트(ㄱ, ㅁㅇ, ㄷㅅㅁ, ㄴㅅㄱ)를 잘 확인해 보세요!";
  }
}

// 앱 초기화 및 화면 로드 로직
window.onload = function() { 
  renderNav();
  setupTouchDragAndDrop(); 

  let p = getProgress();
  
  if (location.pathname.includes('mission1.html')) {
     if(document.getElementById('val-plant')) updateStage1(100); 
     if (p.m1MaxStep >= 2) {
         document.getElementById('m1-quiz-modal').style.display = 'none';
         document.getElementById('m1-step1-box').style.display = 'none';
         document.getElementById('m1-main-content').style.display = 'block';
     }
  } else if (location.pathname.includes('mission2.html')) {
     jumpToM2Step(1); 
  } else if (location.pathname.includes('mission3.html')) {
     goM3Step(1);
  }
};