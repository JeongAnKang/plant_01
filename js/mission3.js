// ==========================================
// 미션 3 (식물의 숨) 통합 스크립트
// ==========================================

// ------------------------------------------
// 💡 0. 공통 드래그 앤 드롭 이벤트 함수
// ------------------------------------------
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text/plain");
    if (!data) return;
    const el = document.getElementById(data);
    if (!el) return;

    const targetDz = ev.target.closest('.dropzone') || ev.target.closest('.badge-pool');
    
    if (targetDz) {
        if (targetDz.classList.contains('dropzone') && targetDz.children.length > 0) {
            document.getElementById('badge-pool').appendChild(targetDz.children[0]);
        }
        targetDz.appendChild(el);
    }
}

// ------------------------------------------
// 💡 1. 화면(Step) 자유 이동 및 상태 저장 로직
// ------------------------------------------
function goM3Step(step) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`stage3-step${i}`);
    if (el) el.style.display = 'none';
  }
  
  const target = document.getElementById(`stage3-step${step}`);
  if (target) target.style.display = 'block';

  if (typeof getProgress === 'function' && typeof saveProgress === 'function') {
      let p = getProgress();
      if ((p.m3MaxStep || 1) < step) { 
          p.m3MaxStep = step; 
          saveProgress(p); 
      }
      
      const maxAllowed = p.m3MaxStep || 1;
      
      for(let i=1; i<=5; i++) {
          let dot = document.getElementById(`m3-dot-${i}`);
          if (!dot) continue;
          
          dot.classList.remove('active', 'completed');
          
          if (i === step) dot.classList.add('active');
          else if (i <= maxAllowed) dot.classList.add('completed');

          if (i <= maxAllowed) {
              dot.style.opacity = '1';
              dot.style.cursor = 'pointer';
              dot.onclick = () => { goM3Step(i); };
          } else {
              dot.style.opacity = '0.5';
              dot.style.cursor = 'not-allowed';
              dot.onclick = () => { alert("이전 단계를 먼저 완료해야 접근할 수 있습니다!"); };
          }
      }
  }
}

// ------------------------------------------
// 💡 2. Step 1 퀴즈 로직
// ------------------------------------------
function selectQ2(answer) {
    document.getElementById('m3-q2-ans').value = answer;
    const btnYes = document.getElementById('btn-q2-yes');
    const btnNo = document.getElementById('btn-q2-no');
    
    if (answer === '예') {
        btnYes.style.background = '#2e7d32'; btnYes.style.color = '#fff';
        btnNo.style.background = '#cfd8dc'; btnNo.style.color = '#333';
    } else {
        btnNo.style.background = '#2e7d32'; btnNo.style.color = '#fff';
        btnYes.style.background = '#cfd8dc'; btnYes.style.color = '#333';
    }
}

function checkM3Step1() {
  const q1In = document.getElementById('m3-q1-in').value.replace(/\s+/g, '');
  const q1Out = document.getElementById('m3-q1-out').value.replace(/\s+/g, '');
  const q2 = document.getElementById('m3-q2-ans').value;
  const q3 = document.getElementById('m3-q3').value.replace(/\s+/g, '');
  
  const msg = document.getElementById('m3-s1-msg');
  const btnNext = document.getElementById('btn-go-step2');
  
  // Q1, Q2, Q3 정답 여부 체크
  const isQ1 = (q1In.includes('산소') && (q1Out.includes('이산화탄소') || q1Out.includes('이산화')));
  const isQ2 = (q2 === '예');
  const isQ3 = (q3.includes('에너지'));

  if (!q2) { 
      msg.style.color = '#e65100'; 
      msg.innerText = "⚠️ Q2 버튼(예/아니오)을 선택해 주세요!"; 
      return; 
  }

  // 모두 맞추면 모달을 염
  if (isQ1 && isQ2 && isQ3) {
      msg.style.color = '#2e7d32'; 
      msg.innerHTML = "✅ 훌륭합니다!<br>생물은 모두 살아가기 위해 호흡을 합니다.";
      openRespirationModal();
  } else {
      msg.style.color = '#c62828';
      let errorMsg = "❌ 틀린 곳이 있습니다.<br>";
      if (!isQ1) errorMsg += "- Q1: 마시는 건 산O, 내쉬는 건 이OO탄O<br>";
      if (!isQ2) errorMsg += "- Q2: 식물도 생물이므로 숨을 쉽니다!<br>";
      if (!isQ3) errorMsg += "- Q3: 생물은 살아갈 '에너지'가 필요함<br>";
      msg.innerHTML = errorMsg;
      btnNext.style.display = "none";
  }
}

// ------------------------------------------
// 💡 Step 1: 세포 소기관(호흡) 퀴즈 모달 로직
// ------------------------------------------
function openRespirationModal() {
    document.getElementById('respiration-modal').style.display = 'flex';
    document.getElementById('btn-close-resp').style.display = 'none';
    document.getElementById('resp-modal-msg').innerText = '';
    
    const btns = document.querySelectorAll('.org-btn');
    btns.forEach(btn => {
        btn.style.background = '#cfd8dc';
        btn.style.color = '#333';
        btn.disabled = false; 
    });
}

function checkCellOrganelle(btn, answer) {
    const msg = document.getElementById('resp-modal-msg');
    const closeBtn = document.getElementById('btn-close-resp');
    const allBtns = document.querySelectorAll('.org-btn');
    
    allBtns.forEach(b => {
        if(!b.disabled) {
            b.style.background = '#cfd8dc';
            b.style.color = '#333';
        }
    });

    if (answer === '마이토콘드리아') {
        btn.style.background = '#2e7d32'; 
        btn.style.color = '#fff';
        msg.style.color = '#2e7d32';
        msg.innerText = "✅ 정답입니다! 마이토콘드리아는 생명 활동에 필요한 에너지를 만드는 공장입니다.";
        
        allBtns.forEach(b => b.disabled = true);
        btn.disabled = false; 
        
        closeBtn.style.display = 'inline-flex';
    } else {
        btn.style.background = '#e65100'; 
        btn.style.color = '#fff';
        msg.style.color = '#c62828';
        msg.innerText = `❌ ${answer}은(는) 에너지를 만드는 곳이 아닙니다. 다시 골라보세요!`;
        closeBtn.style.display = 'none';
    }
}

function closeRespirationModal() {
    document.getElementById('respiration-modal').style.display = 'none';
    
    // 모달을 성공적으로 닫으면, Step 1 화면 하단에 Step 2로 가는 버튼 활성화
    const btnNext = document.getElementById('btn-go-step2');
    if (btnNext) {
        btnNext.style.display = "inline-flex"; 
        btnNext.onclick = () => goM3Step(2);
    }
}

// ------------------------------------------
// 💡 3. Step 2 로직
// ------------------------------------------
function dropM3S2(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text/plain");
    if (!data) return;
    const el = document.getElementById(data);
    if (!el) return;

    const targetDz = ev.target.closest('.m3s2-dz') || ev.target.closest('#m3s2-badge-pool');
    if (targetDz) {
        if (targetDz.classList.contains('m3s2-dz') && targetDz.children.length > 0) {
            document.getElementById('m3s2-badge-pool').appendChild(targetDz.children[0]);
        }
        targetDz.appendChild(el);
    }
}

function checkM3Step2() {
    const dzList = [
        { id: 'dz-r1', expected: '저장' },
        { id: 'dz-r2', expected: '방출' },
        { id: 'dz-r3', expected: 'M3_s02_r3_glucose' },
        { id: 'dz-r4', expected: 'M3_s02_r4_CO2' },
        { id: 'dz-r5', expected: '미토콘드리아' },
        { id: 'dz-r6', expected: '엽록체' }
    ];

    let allBadgesMatch = true;
    dzList.forEach(item => {
        const dz = document.getElementById(item.id);
        const child = dz ? dz.children[0] : null;
        if (!child || child.getAttribute('data-ans') !== item.expected) {
            allBadgesMatch = false;
        }
    });

    const q1 = document.getElementById('m3-s2-q1').value;
    const q2 = document.getElementById('m3-s2-q2').value;
    const isSelectMatch = (q1 === '저장' && q2 === '생산');

    const msg = document.getElementById('m3-s2-msg');
    const btnNext = document.getElementById('btn-go-step3');

    if (allBadgesMatch && isSelectMatch) {
        msg.style.color = '#2e7d32';
        msg.innerText = "✅ 완벽합니다! 모식도와 에너지 흐름이 정확히 완성되었습니다.";
        if(btnNext) {
            btnNext.style.display = 'inline-block';
            btnNext.onclick = () => goM3Step(3);
        }
    } else {
        msg.style.color = '#c62828';
        if (!allBadgesMatch) {
            msg.innerText = "❌ 잘못 배치된 뱃지가 있습니다. 네모 칸을 다시 확인해 보세요.";
        } else if (!isSelectMatch) {
            msg.innerText = "❌ 아래 '관계 정리하기'의 선택칸이 틀렸습니다. 다시 확인해 보세요.";
        }
        if(btnNext) btnNext.style.display = 'none';
    }
}

// ------------------------------------------
// 💡 Step 3 로직
// ------------------------------------------
let isDay = true;
function toggleDayNight() {
    isDay = !isDay;
    const bg = document.getElementById('dn-bg');
    const icon = document.getElementById('dn-icon');
    const text = document.getElementById('dn-text');
    const status = document.getElementById('dn-status-photo');
    const gasIn = document.getElementById('dn-gas-in');
    const gasOut = document.getElementById('dn-gas-out');
    const imgObj = document.getElementById('dn-image'); 

    if (isDay) {
        bg.className = 'day-night-container dn-day';
        icon.innerText = '☀️'; text.innerText = '낮으로 설정됨';
        status.innerText = '광합성량 > 호흡량';
        gasIn.innerText = '↓ 이산화 탄소 흡수 (대량)';
        gasOut.innerText = '↑ 산소 방출 (대량)';
        
        if (imgObj) {
            imgObj.src = 'images/M3_s03_mn_184_1.png';
            imgObj.style.borderColor = '#90caf9';
        }
    } else {
        bg.className = 'day-night-container dn-night';
        icon.innerText = '🌙'; text.innerText = '밤으로 설정됨';
        status.innerText = '광합성 안함 (호흡만 일어남)';
        gasIn.innerText = '↓ 산소 흡수';
        gasOut.innerText = '↑ 이산화 탄소 방출';
        
        if (imgObj) {
            imgObj.src = 'images/M3_s03_mn_184_2.png';
            imgObj.style.borderColor = '#546e7a';
        }
    }
}

function checkM3Step3() {
    const q1 = document.getElementById('m3-s3-q1').value;
    const q2 = document.getElementById('m3-s3-q2').value;
    const q3 = document.getElementById('m3-s3-q3').value;
    const q4 = document.getElementById('m3-s3-q4').value;
    const q5 = document.getElementById('m3-s3-q5').value;
    const q6 = document.getElementById('m3-s3-q6').value;
    
    const msg = document.getElementById('m3-s3-msg');
    const btnNext = document.getElementById('btn-go-step4');

    const isDayCorrect = (q1 === '>') && (q2 === '이산화 탄소') && (q3 === '산소');
    const isNightCorrect = (q4 === '<') && (q5 === '산소') && (q6 === '이산화 탄소');

    if (isDayCorrect && isNightCorrect) {
        msg.style.color = '#2e7d32'; msg.innerText = "✅ 정답입니다! 낮과 밤의 기체 출입 차이를 완벽히 이해했습니다.";
        btnNext.style.display = "inline-flex"; 
        btnNext.onclick = () => goM3Step(4);
    } else {
        msg.style.color = '#c62828'; msg.innerText = "❌ 틀린 부분이 있습니다. 토글 스위치를 눌러 화면의 힌트를 다시 관찰하세요!";
        btnNext.style.display = "none";
    }
}

// ------------------------------------------
// 💡 Step 4 로직
// ------------------------------------------
let activeBadgeForTable = null;
function handleBadgeClick(id, name) {
    activeBadgeForTable = document.getElementById(id);
    document.getElementById('selected-badge-name').innerText = `[ ${name} ]`;
    document.getElementById('badge-modal').style.display = 'flex';
}

function closeBadgeModal() {
    document.getElementById('badge-modal').style.display = 'none';
    activeBadgeForTable = null;
}

function placeBadgeTarget(type) {
    if (!activeBadgeForTable) return;
    
    const ansKey = activeBadgeForTable.getAttribute('data-ans'); 
    const category = ansKey.split('-')[1]; 
    
    const targetDzId = `dz-${type === 'photo' ? 'p' : 'r'}-${category}`;
    const targetDz = document.getElementById(targetDzId);
    
    if (targetDz) {
        if (targetDz.children.length > 0) {
            document.getElementById('badge-pool').appendChild(targetDz.children[0]);
        }
        targetDz.appendChild(activeBadgeForTable);
    }
    closeBadgeModal();
}

function checkM3Step4() {
    const dropzones = document.querySelectorAll('.comp-table .dropzone');
    let allCorrect = true;
    let filledCount = 0;

    dropzones.forEach(dz => {
        if (dz.children.length > 0) filledCount++;
        const badge = dz.children[0];
        
        const expectedAns = dz.id.replace('dz-', '');
        if (!badge || badge.getAttribute('data-ans') !== expectedAns) {
            allCorrect = false;
        }
    });

    const msg = document.getElementById('m3-s4-msg');
    const btnNext = document.getElementById('btn-go-step5');

    if (filledCount < 12) {
        msg.style.color = '#e65100'; msg.innerText = "⚠️ 아직 모든 칸을 채우지 않았습니다. 뱃지를 모두 올려주세요!"; return;
    }

    if (allCorrect) {
        msg.style.color = '#2e7d32'; msg.innerText = "✅ 완벽합니다! 광합성과 호흡의 차이점을 완전히 마스터하셨네요!";
        btnNext.style.display = "inline-flex";
        
        btnNext.onclick = () => {
            if(typeof launchMasterConfetti === 'function') launchMasterConfetti();
            else if (typeof launchConfetti === 'function') launchConfetti();
            
            if(typeof getProgress === 'function' && typeof saveProgress === 'function') {
                let p = getProgress();
                p.m3MaxStep = 6;
                if(p.maxMission < 4) p.maxMission = 4; 
                saveProgress(p);
            }
            goM3Step(5);
        };
    } else {
        msg.style.color = '#c62828'; msg.innerText = "❌ 위치가 잘못된 뱃지가 있습니다. 다시 한번 꼼꼼히 확인해 보세요!";
        btnNext.style.display = "none";
    }
}

// ------------------------------------------
// 💡 페이지 초기화
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof getProgress === 'function') {
        let p = getProgress();
        if (p.maxMission < 3) p.maxMission = 3; 
        saveProgress(p);
    }
    goM3Step(1); 

    const allInputs = document.querySelectorAll('input[type="text"], textarea');
    allInputs.forEach(input => {
        input.setAttribute('autocomplete', 'off');   
        input.setAttribute('autocorrect', 'off');    
        input.setAttribute('autocapitalize', 'off'); 
        input.setAttribute('spellcheck', 'false');   
    });

    const badgePool = document.getElementById('badge-pool');
    if (badgePool) {
        const badges = Array.from(badgePool.querySelectorAll('.ans-badge'));
        badges.sort(() => Math.random() - 0.5);
        badges.forEach(badge => badgePool.appendChild(badge));
    }
});