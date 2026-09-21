// ==========================================
// 공통 앱 진행도 관리 (LocalStorage)
// ==========================================
function getProgress() {
  return JSON.parse(localStorage.getItem('plantVitalProgress')) || {
    isStarted: false, 
    maxMission: 0,    
    m1MaxStep: 1, 
    m2MaxStep: 1, 
    m3MaxStep: 1, 
    m4MaxStep: 1, 
    m5MaxStep: 1,
    rewards: []        
  };
}

function saveProgress(p) {
  localStorage.setItem('plantVitalProgress', JSON.stringify(p));
  renderNav();
  if (typeof renderRewards === 'function') renderRewards();
}

function startResearch() {
  let p = getProgress();
  p.isStarted = true;
  p.maxMission = 1; 
  saveProgress(p);
  launchConfetti();
}

function resetAllProgress() {
  if(confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (처음 화면으로 돌아가며 획득한 보상도 초기화됩니다.)")) {
    localStorage.removeItem('plantVitalProgress');
    alert("모든 데이터가 초기화되었습니다.");
    location.href = 'index.html';
  }
}

function renderNav() {
  const p = getProgress();
  const overlay = document.getElementById('start-overlay');
  if(overlay) overlay.style.display = p.isStarted ? 'none' : 'flex';

  const navLinks = document.querySelectorAll('#stage-nav .nav-btn');
  if(!navLinks.length) return;

  const files = ['mission1.html', 'mission2.html', 'mission3.html', 'mission4.html', 'mission5.html'];
  const mNames = ["M1 식물의 밥", "M2 최적 조건", "M3 식물의 숨", "M4 햇빛 금고 ","M5 히든 프로젝트"];
  
  navLinks.forEach((link, idx) => {
    const mNum = idx + 1;
    link.classList.remove('disabled');
    link.onclick = null;
    
    if (p.isStarted && mNum <= p.maxMission) {
      link.innerText = mNames[idx];
      link.href = files[idx];
    } else {
      link.classList.add('disabled');
      link.innerText = `🔒 ${mNames[idx]}`;
      link.removeAttribute('href');
      link.onclick = (e) => { 
        e.preventDefault(); 
        alert(p.isStarted ? "이전 미션을 완료해야 잠금이 해제됩니다!" : "🚀 연구 시작 버튼을 먼저 눌러주세요!"); 
      };
    }
    
    if(location.pathname.includes(files[idx])) link.classList.add('active');
    else link.classList.remove('active');
  });
}

// 💡 수정됨: 15개 -> 20개 렌더링 한도 증가
function renderRewards() {
  const p = getProgress();
  const rewardArea = document.getElementById('reward-area');
  const countSpan = document.getElementById('reward-count');
  const btnClaim = document.getElementById('btn-claim-reward');
  if(!rewardArea || !countSpan) return;

  const earned = Math.max(0, p.m1MaxStep - 1) 
               + Math.max(0, p.m2MaxStep - 1) 
               + Math.max(0, p.m3MaxStep - 1) 
               + Math.max(0, p.m4MaxStep - 1) 
               + Math.max(0, p.m5MaxStep - 1)
               + (p.maxMission > 1 ? 1 : 0) 
               + (p.maxMission > 2 ? 1 : 0) 
               + (p.maxMission > 3 ? 1 : 0) 
               + (p.maxMission > 4 ? 1 : 0);
               
  const available = earned - p.rewards.length;
  countSpan.innerText = Math.max(0, available);

  // 최대 보상 한도를 20으로 변경
  if (available > 0 && p.rewards.length < 20) {
      btnClaim.style.background = '#f57f17';
      btnClaim.style.color = '#fff';
      btnClaim.style.cursor = 'pointer';
      btnClaim.disabled = false;
  } else {
      btnClaim.style.background = '#cfd8dc';
      btnClaim.style.color = '#78909c';
      btnClaim.style.cursor = 'not-allowed';
      btnClaim.disabled = true;
  }

  rewardArea.innerHTML = '';
  // 슬롯 생성 횟수를 20으로 변경
  for(let i = 0; i < 20; i++) {
      const slot = document.createElement('div');
      slot.className = 'reward-slot';
      if (i < p.rewards.length) {
          const img = document.createElement('img');
          img.className = 'reward-item';
          img.src = `images/reward${p.rewards[i]}.png`;
          img.onerror = function() { this.style.display='none'; };
          slot.appendChild(img);
      }
      rewardArea.appendChild(slot);
  }
}

// 💡 수정됨: 15개 -> 20개 획득 한도 증가
function claimReward() {
  let p = getProgress();
  const earned = Math.max(0, p.m1MaxStep - 1) + Math.max(0, p.m2MaxStep - 1) + Math.max(0, p.m3MaxStep - 1) + Math.max(0, p.m4MaxStep - 1) + Math.max(0, p.m5MaxStep - 1) + (p.maxMission > 1 ? 1 : 0) + (p.maxMission > 2 ? 1 : 0) + (p.maxMission > 3 ? 1 : 0) + (p.maxMission > 4 ? 1 : 0);
  const available = earned - p.rewards.length;

  // 최대 보상 한도를 20으로 변경
  if (available > 0 && p.rewards.length < 20) {
      const randomNum = Math.floor(Math.random() * 26) + 1; // 1~26 사이 랜덤 보상 이미지 번호
      const formattedNum = String(randomNum).padStart(2, '0');
      p.rewards.push(formattedNum);
      saveProgress(p);
      launchConfetti();
  } else if (p.rewards.length >= 20) {
      alert("🎉 20개의 햇빛(보상)을 모두 모았습니다! 대단해요!");
  }
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
  if (targetStep > (p[`m${mNum}MaxStep`] || 1)) {
     p[`m${mNum}MaxStep`] = targetStep;
     saveProgress(p);
     showUnlockPopup(title, msg, proceedCallback);
  } else { proceedCallback(); }
}

// 💡 이미 완료한 단계(Step) 클릭 및 이동 허용 함수
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
            if (mNum === 2 && typeof goCustomM2Step === 'function') goCustomM2Step(i);
            else if (mNum === 3 && typeof goM3Step === 'function') goM3Step(i);
        };
    } else {
        dot.style.opacity = '0.5';
        dot.style.cursor = 'not-allowed';
        dot.onclick = () => { alert("이전 단계를 먼저 완료해야 접근할 수 있습니다!"); };
    }
  }
}

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
  const draggables = document.querySelectorAll('.badge, .m2-badge, .m3-badge');
  let ghost = null; let draggedItem = null;

  draggables.forEach(item => {
    item.style.touchAction = 'none';
    item.addEventListener('touchstart', function(e) {
      this.isDragging = false; this.startX = e.touches[0].clientX; this.startY = e.touches[0].clientY; draggedItem = this;
      ghost = this.cloneNode(true); ghost.removeAttribute('id');
      ghost.style.position = 'fixed'; ghost.style.zIndex = '10000'; ghost.style.opacity = '0.8'; ghost.style.pointerEvents = 'none'; ghost.style.margin = '0'; 
      const rect = this.getBoundingClientRect(); const offsetX = e.touches[0].clientX - rect.left; const offsetY = e.touches[0].clientY - rect.top;
      ghost.dataset.offsetX = offsetX; ghost.dataset.offsetY = offsetY;
      ghost.style.left = (e.touches[0].clientX - offsetX) + 'px'; ghost.style.top = (e.touches[0].clientY - offsetY) + 'px';
      document.body.appendChild(ghost); this.style.opacity = '0.4';
    }, {passive: false});

    item.addEventListener('touchmove', function(e) {
      if (!ghost) return;
      const dx = e.touches[0].clientX - this.startX; const dy = e.touches[0].clientY - this.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { this.isDragging = true; }
      if (this.isDragging) {
          e.preventDefault();
          const offsetX = parseFloat(ghost.dataset.offsetX); const offsetY = parseFloat(ghost.dataset.offsetY);
          ghost.style.left = (e.touches[0].clientX - offsetX) + 'px'; ghost.style.top = (e.touches[0].clientY - offsetY) + 'px';
          document.querySelectorAll('.drag-over, .drag-over-m2, .drag-over-m3').forEach(el => el.classList.remove('drag-over', 'drag-over-m2', 'drag-over-m3'));
          const dropTarget = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
          if (dropTarget) {
              const m1Zone = dropTarget.closest('#factory-dropzone, #source-badges'); if (m1Zone && this.classList.contains('badge')) m1Zone.classList.add('drag-over');
              const m2Zone = dropTarget.closest('.m2-dropzone, .m2-badge-pool'); if (m2Zone && this.classList.contains('m2-badge')) m2Zone.classList.add('drag-over-m2');
              const m3Zone = dropTarget.closest('.m3-dropzone, .m3-badge-pool, #m1-dropzone, #m1-pool'); if (m3Zone && this.classList.contains('m3-badge')) m3Zone.classList.add('drag-over-m3');
          }
      }
    }, {passive: false});

    item.addEventListener('touchend', function(e) {
      if (ghost) { ghost.remove(); ghost = null; }
      this.style.opacity = '1';
      document.querySelectorAll('.drag-over, .drag-over-m2, .drag-over-m3').forEach(el => el.classList.remove('drag-over', 'drag-over-m2', 'drag-over-m3'));
      if (this.isDragging) {
          e.preventDefault();
          const touch = e.changedTouches[0]; const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
          if (dropTarget) {
              if (this.classList.contains('badge')) { const targetZone = dropTarget.closest('#factory-dropzone, #source-badges'); if (targetZone) { if (targetZone.id === 'factory-dropzone') document.getElementById('factory-items').appendChild(this); else targetZone.appendChild(this); } } 
              else if (this.classList.contains('m2-badge')) { const targetZone = dropTarget.closest('.m2-dropzone, .m2-badge-pool'); if (targetZone) { targetZone.appendChild(this); } }
              else if (this.classList.contains('m3-badge')) { const targetZone = dropTarget.closest('.m3-dropzone, .m3-badge-pool, #m1-dropzone, #m1-pool'); if (targetZone) { targetZone.appendChild(this); } }
          }
      }
      setTimeout(() => { this.isDragging = false; }, 50); draggedItem = null;
    });
  });
}

window.onload = function() { 
  renderNav();
  if (typeof renderRewards === 'function') renderRewards();
  setupTouchDragAndDrop(); 

  let p = getProgress();
  if (location.pathname.includes('mission1.html')) {
     if(document.getElementById('val-plant')) updateStage1(100); 
  } else if (location.pathname.includes('mission2.html')) {
     if(typeof goCustomM2Step === 'function') goCustomM2Step(p.m2MaxStep || 1); 
  } else if (location.pathname.includes('mission3.html')) {
     if(typeof goM3Step === 'function') goM3Step(p.m3MaxStep || 1);
  }
};