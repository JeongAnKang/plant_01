// ------------------------------------------
// 💡 Mission 1 PC 환경 드래그 앤 드롭 함수
// ------------------------------------------
window.allowDrop = function(ev) {
  ev.preventDefault();
  if (ev.currentTarget) ev.currentTarget.classList.add('drag-over');
};
window.dragLeave = function(ev) {
  if (ev.currentTarget) ev.currentTarget.classList.remove('drag-over');
};
window.drag = function(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
};
window.drop = function(ev) {
  ev.preventDefault();
  if (ev.currentTarget) ev.currentTarget.classList.remove('drag-over');
  var data = ev.dataTransfer.getData("text/plain");
  if (!data) return;
  var el = document.getElementById(data);
  if (el && el.classList.contains('badge')) {
      if (ev.currentTarget.id === 'factory-dropzone') {
          document.getElementById('factory-items').appendChild(el);
      } else {
          ev.currentTarget.appendChild(el);
      }
  }
};

// ==========================================
// 💡 미션 2 (최적 조건) 통합 스크립트
// ==========================================

window.goCustomM2Step = function(step) {
  var allSteps = document.querySelectorAll('.m2-step-container');
  allSteps.forEach(function(el) { el.classList.remove('active'); });
  
  var targetStep = document.getElementById('m2-step' + step);
  if (targetStep) targetStep.classList.add('active');
  
  if(typeof window.getProgress === 'function' && typeof window.saveProgress === 'function') {
      var p = window.getProgress();
      if(p.m2MaxStep < step) { 
          p.m2MaxStep = step; 
          window.saveProgress(p); 
      }
  }

  if (typeof window.updateStepUI === 'function') {
      window.updateStepUI('m2', 5, step);
  }

  // 스텝별 초기 렌더링
  if(step === 2 && typeof window.computeRate === 'function') {
      window.drawSingleGraph('chart-light-only', 0, function(x){ return window.computeRate(x, 70, 25).rate; }, '빛의 세기 (상대값)', '#2e7d32');
  } else if(step === 3 && typeof window.computeRate === 'function') {
      window.drawSingleGraph('chart-co2-only', 0, function(x){ return window.computeRate(70, x, 25).rate; }, '이산화 탄소 농도 (상대값)', '#0277bd');
  } else if(step === 4 && typeof window.getTempRate !== 'undefined') {
      window.drawSingleGraph('chart-temp-only', 0, window.getTempRate, '온도(℃)', '#d84315');
  } else if(step === 5 && typeof window.updateSimulationCombined === 'function') {
      var sl = document.getElementById('slider-light');
      var sc = document.getElementById('slider-co2');
      var st = document.getElementById('slider-temp');
      if(sl) sl.value = 20; 
      if(sc) sc.value = 20; 
      if(st) st.value = 20;
      window.updateSimulationCombined();
  }
};

window.addEventListener('DOMContentLoaded', function() { 
  if(typeof window.getProgress === 'function') {
      window.goCustomM2Step(window.getProgress().m2MaxStep || 1);
  } else {
      window.goCustomM2Step(1); 
  }
});

// ------------------------------------------
// M2 드래그 앤 드롭 함수
// ------------------------------------------
window.allowDropM2 = function(ev) { 
    ev.preventDefault(); 
    if(ev.currentTarget) ev.currentTarget.classList.add('drag-over-m2'); 
};
window.dragLeaveM2 = function(ev) { 
    if(ev.currentTarget) ev.currentTarget.classList.remove('drag-over-m2'); 
};
window.dragM2 = function(ev) { 
    ev.dataTransfer.setData("text/plain", ev.target.id); 
};
window.dropM2 = function(ev) {
    ev.preventDefault();
    if(ev.currentTarget) ev.currentTarget.classList.remove('drag-over-m2');
    var data = ev.dataTransfer.getData("text/plain");
    if (!data) return;
    var el = document.getElementById(data);
    if (el && el.classList.contains('m2-badge')) {
        if (ev.currentTarget.classList.contains('m2-dropzone') || ev.currentTarget.classList.contains('m2-badge-pool')) {
            ev.currentTarget.appendChild(el);
        }
    }
};

window.checkM2Vars = function(stepNum, expectedVar1, expectedVar2Arr, expectedVar3) {
  var elV1 = document.getElementById('m2-s' + stepNum + '-var1');
  var elV2 = document.getElementById('m2-s' + stepNum + '-var2');
  var elV3 = document.getElementById('m2-s' + stepNum + '-var3');
  if (!elV1 || !elV2 || !elV3) return {ok: true, msg: ""}; 

  var v1 = Array.from(elV1.children).map(function(e){ return e.dataset.val; });
  var v2 = Array.from(elV2.children).map(function(e){ return e.dataset.val; });
  var v3 = Array.from(elV3.children).map(function(e){ return e.dataset.val; });

  if (v1.length !== 1 || v3.length !== 1 || v2.length !== 4) return {ok: false, msg: "❌ 빈칸에 알맞은 뱃지를 모두 채워주세요. (조작 1개, 통제 4개, 종속 1개)"};
  if (v1[0] !== expectedVar1) return {ok: false, msg: "❌ '다르게 할 조건(조작 변인)'이 틀렸습니다."};
  if (v3[0] !== expectedVar3) return {ok: false, msg: "❌ '측정할 것(종속 변인)'이 틀렸습니다."};
  
  var isAllControlsPresent = expectedVar2Arr.every(function(val){ return v2.indexOf(val) !== -1; });
  if (!isAllControlsPresent) return {ok: false, msg: "❌ '같게 할 조건(통제 변인)'에 나머지 4가지 환경 요인이 모두 들어가야 합니다."};
  return {ok: true, msg: ""};
};

// ------------------------------------------
// M2 Step 1 검증
// ------------------------------------------
window.checkM2Step1Eq = function() {
  var getVal = function(id) { var el = document.getElementById(id); return el ? el.value.trim().replace(/\s+/g, '') : ''; };
  var eq1 = getVal('m2-eq-in-1'); var eq2 = getVal('m2-eq-in-2');
  var en = getVal('m2-eq-energy'); var place = getVal('m2-eq-place');
  var out1 = getVal('m2-eq-out-1'); var out2 = getVal('m2-eq-out-2');
  var msg = document.getElementById('m2-eq-msg');
  
  var inCorrect = (eq1 === '물' && eq2 === '이산화탄소') || (eq1 === '이산화탄소' && eq2 === '물');
  var enCorrect = (en === '빛' || en === '빛에너지');
  var placeCorrect = (place === '엽록체');
  var outCorrect = (out1 === '포도당' && out2 === '산소') || (out1 === '산소' && out2 === '포도당') || (out1 === '녹말' && out2 === '산소') || (out1 === '산소' && out2 === '녹말');
  
  if(inCorrect && enCorrect && placeCorrect && outCorrect) {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 광합성 식 완성! 이제 아래 환경 요인 3가지를 예측해 보세요."; }
    var factorsArea = document.getElementById('m2-factors-area');
    if (factorsArea) factorsArea.style.display = 'block';
    ['m2-eq-in-1', 'm2-eq-in-2', 'm2-eq-energy', 'm2-eq-place', 'm2-eq-out-1', 'm2-eq-out-2'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.disabled = true;
    });
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 식의 일부가 틀렸거나 중복되었습니다. 다시 확인해 보세요."; }
  }
};

window.checkM2Step1Factors = function() {
  var getVal = function(id) { var el = document.getElementById(id); return el ? el.value.trim().replace(/\s+/g, '') : ''; };
  var f1 = getVal('m2-fac-1'); var f2 = getVal('m2-fac-2'); var f3 = getVal('m2-fac-3');
  var msg = document.getElementById('m2-fac-msg');
  
  var combined = f1 + f2 + f3;
  var hasLight = combined.indexOf('빛') !== -1;
  var hasCO2 = combined.indexOf('이산화탄소') !== -1;
  var hasTemp = combined.indexOf('온도') !== -1;
  
  if(hasLight && hasCO2 && hasTemp) {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 정확합니다! 탐구 스텝이 열립니다."; }
    var btnNext = document.getElementById('btn-m2-next1');
    if (btnNext) {
        btnNext.style.display = 'inline-block';
        if (typeof window.handleStepUnlock === 'function') {
            btnNext.onclick = function() { window.handleStepUnlock(2, 2, 'Step 2. 빛의 세기', '빛의 세기가 광합성에 미치는 영향을 알아보세요.', function(){ window.goCustomM2Step(2); }); };
        } else { btnNext.onclick = function() { window.goCustomM2Step(2); }; }
    } else { window.goCustomM2Step(2); }
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 오답입니다. 환경 요인 3가지(빛, 이산화 탄소, 온도)를 정확히 적어주세요."; }
  }
};

// ------------------------------------------
// 🚨 공통 수학 연산 & 그래프 함수 (선생님 요청 데이터 반영)
// ------------------------------------------
window.createSpline = function(xs, ys) {
    var n = xs.length; var m = new Float32Array(n); var secants = new Float32Array(n-1);
    for(var i=0; i<n-1; i++) secants[i] = (ys[i+1] - ys[i]) / (xs[i+1] - xs[i]);
    for(var i=1; i<n-1; i++) {
        if (secants[i-1]*secants[i] <= 0) m[i] = 0;
        else m[i] = 2 / (1/secants[i-1] + 1/secants[i]);
    }
    m[0] = secants[0]; m[n-1] = secants[n-2];
    for(var i=0; i<n-1; i++) { if (secants[i] === 0) { m[i] = 0; m[i+1] = 0; } }
    
    return function(x) {
        if (x <= xs[0]) return ys[0]; if (x > xs[n-1]) return 0;
        var i = 0; while(x >= xs[i+1]) i++;
        var t = (x - xs[i]) / (xs[i+1] - xs[i]); var t2 = t*t; var t3 = t2*t;
        var h00 = 2*t3 - 3*t2 + 1; var h10 = t3 - 2*t2 + t; var h01 = -2*t3 + 3*t2; var h11 = t3 - t2;
        var dx = xs[i+1] - xs[i];
        var val = h00*ys[i] + h10*dx*m[i] + h01*ys[i+1] + h11*dx*m[i+1];
        return Math.max(0, val);
    }
};

// 👇 선생님께서 제공해주신 새 데이터로 업데이트 됨
window.tempXs = [0, 5, 10, 15, 20, 25, 30, 32, 34, 35, 36,   37,  38, 39, 40, 41, 42, 43, 45, 50, 55, 60];
window.tempYs = [0, 2,  5, 10, 16, 23, 31, 38, 42, 42.8, 44.5,   45,  44.5, 42.8, 41, 38, 28, 13, 3,  0,  0,  0];
window.getTempRate = window.createSpline(window.tempXs, window.tempYs);

window.computeRate = function(L, C, T) {
  var effectiveLight = (L / (L + 15)) * 40; 
  var effectiveCO2 = (C / (C + 20)) * 40;
  var tempRate = window.getTempRate(T);
  var rate = Math.round( Math.min(effectiveLight, effectiveCO2) * (tempRate / 30) );
  return { rate: Math.max(0, rate) || 0 };
};

window.drawSingleGraph = function(canvasId, currentX, rateFunc, xLabel, strokeColor) {
  try {
      var cv = document.getElementById(canvasId); 
      if (!cv) return;
      var ctx = cv.getContext('2d'); 
      var w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      
      var padL = 35, padR = 15, padT = 20, padB = 25;
      var plotW = w - padL - padR, plotH = h - padT - padB;
      var maxX = (xLabel && xLabel.indexOf('온도') !== -1) ? 60 : 100;
      var maxY = 45;

      ctx.beginPath(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1.5;
      ctx.moveTo(padL, padT - 10); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR + 10, h - padB); ctx.stroke();
      
      ctx.fillStyle = '#546e7a'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('광합성량', 5, 12);
      if(xLabel) ctx.fillText(xLabel, w / 2 - 20, h - 5);
      ctx.fillText('0', padL - 12, h - padB + 10);

      var currentXNum = parseFloat(currentX) || 0;
      var curPxOffset = (currentXNum / maxX) * plotW;

      ctx.beginPath(); ctx.strokeStyle = strokeColor || '#2e7d32'; ctx.lineWidth = 3;
      for (var px = 0; px <= plotW; px++) {
        if (px > curPxOffset) break; 
        var dataX = (px / plotW) * maxX;
        var dataY = rateFunc ? rateFunc(dataX) : 0;
        var py = (h - padB) - (dataY / maxY) * plotH;
        if (px === 0) ctx.moveTo(padL + px, py); 
        else ctx.lineTo(padL + px, py);
      }
      ctx.stroke();
      
      var curPx = padL + curPxOffset;
      var curPy = (h - padB) - ((rateFunc ? rateFunc(currentXNum) : 0) / maxY) * plotH;
      
      ctx.beginPath(); 
      if (ctx.setLineDash) ctx.setLineDash([4, 4]); 
      ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1;
      ctx.moveTo(curPx, h - padB); ctx.lineTo(curPx, curPy); 
      ctx.moveTo(padL, curPy); ctx.lineTo(curPx, curPy); 
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]); 
      
      ctx.beginPath(); ctx.fillStyle = '#e53935'; ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2); ctx.fill();
  } catch(e) {
      console.warn("그래프 그리기 실패:", canvasId, e);
  }
};

window.showResultImage = function(imgName, desc, fallbackType) {
  var tEl = document.getElementById('result-modal-title');
  var fEl = document.getElementById('result-image-frame');
  var dEl = document.getElementById('result-image-desc');
  var mEl = document.getElementById('result-image-modal');
  if(tEl) tEl.innerHTML = "📈 실험 결과 확인";
  if(fEl) fEl.innerHTML = '<img src="images/' + imgName + '" alt="결과 그래프" style="width:100%; max-height:350px; object-fit:contain;">';
  if(dEl) dEl.innerHTML = desc;
  if(mEl) mEl.style.display = 'flex';
};

window.validateSlider70 = function(stepSelector) {
    var slider = document.querySelector(stepSelector + ' input[type="range"]');
    if (!slider) return true; 
    var maxVal = parseFloat(slider.max) || 100;
    var curVal = parseFloat(slider.value) || 0;
    return (curVal / maxVal) >= 0.7; 
};

// ------------------------------------------
// M2 Step 2~4 (각 요인별 실험 + 결론)
// ------------------------------------------
window.runM2Exp2 = function() {
  var res = window.checkM2Vars(2, 'light', ['co2', 'temp', 'plant', 'soil'], 'photo');
  var msg = document.getElementById('m2-s2-var-msg');
  if(!res.ok) { if(msg) { msg.style.color = '#c62828'; msg.innerText = res.msg; } return; }
  if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 설계 완료! 슬라이더를 70% 이상 충분히 조작하며 광합성량을 확인하세요."; }
  var resArea = document.getElementById('m2-s2-result-area');
  if(resArea) resArea.style.display = 'block';
};

window.checkM2Conclusion2 = function() {
  if (!window.validateSlider70('#m2-step2')) { alert("⚠️ 슬라이더를 70% 이상 충분히 이동시킨 뒤 결론을 확인해주세요!"); return; }
  var c1El = document.getElementById('m2-s2-con1'); var c2El = document.getElementById('m2-s2-con2');
  var msg = document.getElementById('m2-s2-con-msg');
  var c1 = c1El ? c1El.value.trim() : ''; var c2 = c2El ? c2El.value.trim() : '';
  
  var isC1 = c1.indexOf('강해') !== -1 || c1.indexOf('세') !== -1 || c1.indexOf('증가') !== -1 || c1.indexOf('높아') !== -1;
  var hasIncrease = c2.indexOf('증가') !== -1 || c2.indexOf('많아') !== -1;
  var hasPlateau = c2.indexOf('일정') !== -1 || c2.indexOf('더 이상') !== -1 || c2.indexOf('포화') !== -1 || c2.indexOf('유지') !== -1;
  
  if(isC1 && hasIncrease && hasPlateau) {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerHTML = "✅ 정확합니다!<br>빛의 세기가 충분해지면 그 외의 다른 요인이 제한하므로 일정해집니다."; }
    window.showResultImage('M2_s02_light.png', '빛의 세기가 강할수록 광합성량이 증가하다가 일정해집니다.', 'M2_s02');
    var btnNext = document.getElementById('btn-m2-next2');
    if(btnNext) {
        btnNext.style.display = 'inline-block';
        if(typeof window.handleStepUnlock === 'function') {
            btnNext.onclick = function() { window.handleStepUnlock(3, 3, 'Step 3. 이산화 탄소', '이산화 탄소의 영향을 알아보세요.', function(){ window.goCustomM2Step(3); }); };
        } else { btnNext.onclick = function(){ window.goCustomM2Step(3); }; }
    }
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 증가하다가 어떻게 되는지 명확히 적어주세요. (예: 증가하다가 일정 세기 이상이면 일정하다)"; }
  }
};

window.runM2Exp3 = function() {
  var res = window.checkM2Vars(3, 'co2', ['light', 'temp', 'plant', 'soil'], 'photo');
  var msg = document.getElementById('m2-s3-var-msg');
  if(!res.ok) { if(msg) { msg.style.color = '#c62828'; msg.innerText = res.msg; } return; }
  if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 설계 완료! 슬라이더를 조작해 변화를 확인하세요."; }
  var resArea = document.getElementById('m2-s3-result-area');
  if(resArea) resArea.style.display = 'block';
};

window.checkM2Conclusion3 = function() {
  if (!window.validateSlider70('#m2-step3')) { alert("⚠️ 슬라이더를 70% 이상 충분히 이동시킨 뒤 결론을 확인해주세요!"); return; }
  var c1El = document.getElementById('m2-s3-con1'); var c2El = document.getElementById('m2-s3-con2');
  var msg = document.getElementById('m2-s3-con-msg');
  var c1 = c1El ? c1El.value.trim() : ''; var c2 = c2El ? c2El.value.trim() : '';
  
  var isC1 = c1.indexOf('강해') !== -1 || c1.indexOf('세') !== -1 || c1.indexOf('증가') !== -1 || c1.indexOf('높아') !== -1 || c1.indexOf('진해') !== -1;
  var hasIncrease = c2.indexOf('증가') !== -1 || c2.indexOf('많아') !== -1;
  var hasPlateau = c2.indexOf('일정') !== -1 || c2.indexOf('더 이상') !== -1 || c2.indexOf('포화') !== -1 || c2.indexOf('유지') !== -1;
  
  if(isC1 && hasIncrease && hasPlateau) {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerHTML = "✅ 정확합니다!<br>이산화 탄소가 충분해지면 일정해집니다."; }
    window.showResultImage('M2_s03_CO2.png', '이산화 탄소 농도가 높아질수록 증가하다가 일정해집니다.', 'M2_s03');
    var btnNext = document.getElementById('btn-m2-next3');
    if(btnNext) {
        btnNext.style.display = 'inline-block';
        if(typeof window.handleStepUnlock === 'function') {
            btnNext.onclick = function() { window.handleStepUnlock(4, 4, 'Step 4. 온도', '온도의 영향을 알아보세요.', function(){ window.goCustomM2Step(4); }); };
        } else { btnNext.onclick = function(){ window.goCustomM2Step(4); }; }
    }
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 증가하다가 어떻게 되는지 명확히 적어주세요."; }
  }
};

window.runM2Exp4 = function() {
  var res = window.checkM2Vars(4, 'temp', ['light', 'co2', 'plant', 'soil'], 'photo');
  var msg = document.getElementById('m2-s4-var-msg');
  if(!res.ok) { if(msg) { msg.style.color = '#c62828'; msg.innerText = res.msg; } return; }
  if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 실험 설계 완료! 슬라이더를 조작해 변화를 확인하세요."; }
  var resArea = document.getElementById('m2-s4-result-area');
  if(resArea) resArea.style.display = 'block';
};

window.checkM2Conclusion4 = function() {
  if (!window.validateSlider70('#m2-step4')) { alert("⚠️ 슬라이더를 70% 이상 충분히 이동시킨 뒤 결론을 확인해주세요!"); return; }
  var c1El = document.getElementById('m2-s4-con1'); var c2El = document.getElementById('m2-s4-con2');
  var msg = document.getElementById('m2-s4-con-msg');
  var c1 = c1El ? c1El.value.trim() : ''; var c2 = c2El ? c2El.value.trim() : '';
  
  var isC1 = c1.indexOf('높아') !== -1 || c1.indexOf('올라가') !== -1 || c1.indexOf('증가') !== -1;
  var c2Clean = c2.replace(/\s+/g, '');
  var isC2 = c2Clean.indexOf('증가') !== -1 || c2Clean.indexOf('많아') !== -1;
  var hasDecrease = c2Clean.indexOf('감소') !== -1 || c2Clean.indexOf('떨어') !== -1 || c2Clean.indexOf('줄어') !== -1;
  
  if(isC1 && isC2 && hasDecrease) {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerHTML = "✅ 정확합니다.<br>적정 온도를 넘으면 효소 저해로 감소합니다."; }
    window.showResultImage('M2_s04_temp.png', '온도가 높아지다 최적 온도를 넘으면 감소합니다.', 'M2_s04');
    var btnNext = document.getElementById('btn-m2-next4');
    if(btnNext) {
        btnNext.style.display = 'inline-block';
        if(typeof window.handleStepUnlock === 'function') {
            btnNext.onclick = function() { window.handleStepUnlock(5, 5, 'Step 5. 최적 조건 찾기', '최적 조건을 찾아보세요!', function(){ window.goCustomM2Step(5); }); };
        } else { btnNext.onclick = function(){ window.goCustomM2Step(5); }; }
    }
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 증가하다가 적정 온도를 넘으면 급격히 감소한다고 적어주세요."; }
  }
};

// ------------------------------------------
// M2 Step 5 (최종 시뮬레이션 및 마스터)
// ------------------------------------------
window.masterAchieved = false;

window.updateSimulationCombined = function() {
  try {
      var sl = document.getElementById('slider-light');
      var sc = document.getElementById('slider-co2');
      var st = document.getElementById('slider-temp');
      
      var curL = sl ? (parseInt(sl.value) || 0) : 20;
      var curC = sc ? (parseInt(sc.value) || 0) : 20;
      var curT = st ? (parseInt(st.value) || 0) : 20;
      
      var vl = document.getElementById('val-light');
      var vc = document.getElementById('val-co2');
      var vt = document.getElementById('val-temp');
      if(vl) vl.innerText = curL; 
      if(vc) vc.innerText = curC; 
      if(vt) vt.innerText = curT;
      
      var res = window.computeRate(curL, curC, curT);
      var photoStatus = document.getElementById('status-photo');
      var isManipulatedEnough = ((curL/100) >= 0.7 || (curC/100) >= 0.7 || (curT/60) >= 0.7) || (res.rate >= 35);

      if (photoStatus) {
          if (res.rate >= 35 && isManipulatedEnough) {
              photoStatus.innerHTML = '현재 분당 산소 방출 기포 수: <strong>' + res.rate + '개</strong> <br><span style="color:#e65100; font-size:1.15rem;">🎉 최적 조건 도달! 🎉</span>';
              photoStatus.style.borderColor = '#ff9800';
              photoStatus.style.background = '#fff3e0';
              
              if (!window.masterAchieved) {
                 window.masterAchieved = true;
                 setTimeout(function() { 
                     var cm = document.getElementById('conan-modal');
                     if(cm) cm.style.display = 'flex'; 
                 }, 1000);
              }
          } else {
              photoStatus.innerHTML = '현재 분당 산소 방출 기포 수: <strong>' + res.rate + '개</strong>';
              photoStatus.style.borderColor = '#a5d6a7';
              photoStatus.style.background = '#e8f5e9';
          }
      }

      window.drawSingleGraph('chart-light', curL, function(x){ return window.computeRate(x, curC, curT).rate; }, '빛의 세기', '#2e7d32');
      window.drawSingleGraph('chart-co2', curC, function(x){ return window.computeRate(curL, x, curT).rate; }, 'CO₂ 농도', '#0277bd');
      window.drawSingleGraph('chart-temp', curT, function(x){ return window.computeRate(curL, curC, x).rate; }, '온도', '#d84315');

  } catch (error) {
      console.warn('시뮬레이션 업데이트 중 오류:', error);
  }
};

window.checkConanQuiz = function(btnElem) {
  var sl = document.getElementById('slider-light');
  var sc = document.getElementById('slider-co2');
  var st = document.getElementById('slider-temp');
  if (sl && sc && st) {
      var curL = parseInt(sl.value); var curC = parseInt(sc.value); var curT = parseInt(st.value);
      if (curL < 70 && curC < 70 && curT < 42) {
          alert("⚠️ 최소한 하나 이상의 요인 슬라이더를 70% 이상 움직여 최적 조건을 충분히 실험해보세요!");
          return;
      }
  }

  var getVal = function(id) { var el = document.getElementById(id); return el ? el.value.replace(/\s+/g, '') : ''; };
  var q1 = getVal('conan-q1'); var q2 = getVal('conan-q2'); var q3 = getVal('conan-q3'); var q4 = getVal('conan-q4');
  var msg = document.getElementById('conan-msg');

  if (q1 === '김' && q2 === '미역' && q3 === '다시마' && q4 === '남세균') {
    if(msg) { msg.style.color = '#2e7d32'; msg.innerText = "✅ 정답입니다! 마스터 승격 중..."; }
    if(btnElem) { btnElem.disabled = true; btnElem.style.background = "#90a4ae"; btnElem.style.cursor = "not-allowed"; }
    
    setTimeout(function() {
        var cm = document.getElementById('conan-modal'); var mm = document.getElementById('master-modal');
        if(cm) cm.style.display = 'none';
        if(mm) mm.style.display = 'flex';
        if(typeof window.launchMasterConfetti === 'function') window.launchMasterConfetti();
        if(typeof window.getProgress === 'function' && typeof window.saveProgress === 'function') {
            var p = window.getProgress();
            if(p.maxMission < 3) { p.maxMission = 3; window.saveProgress(p); }
        }
    }, 1200);
    
  } else {
    if(msg) { msg.style.color = '#c62828'; msg.innerText = "❌ 오답이 있습니다. 초성 힌트를 다시 확인해 보세요!"; }
  }
};