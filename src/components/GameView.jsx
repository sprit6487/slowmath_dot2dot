import { useEffect, useRef, useState, useCallback } from 'react';
import { getDotPositions, edgeKey } from '../utils/puzzle';

function HomeIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-8 9 8M5 11v9a1 1 0 001 1h3m8 0h3a1 1 0 001-1v-9" />
    </svg>
  );
}

function setupCanvas(cvs) {
  const rect = cvs.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cvs.width = rect.width * dpr;
  cvs.height = rect.height * dpr;
  cvs.style.width = rect.width + 'px';
  cvs.style.height = rect.height + 'px';
  cvs.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBoard(cvs, edges, gridSize, puzzleDots) {
  const ctx = cvs.getContext('2d');
  const rect = cvs.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const positions = getDotPositions(w, h, gridSize);
  const dotRadius = Math.max(7, w * 0.04);
  const lineW = Math.max(3, w * 0.018);

  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  for (let e = 0; e < edges.length; e++) {
    const pa = positions[edges[e][0]];
    const pb = positions[edges[e][1]];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = '#4A4035';
    ctx.stroke();
  }

  const total = gridSize * gridSize;
  const puzzleDotSet = {};
  for (let d = 0; d < puzzleDots.length; d++) puzzleDotSet[puzzleDots[d]] = true;

  for (let i = 0; i < total; i++) {
    const p = positions[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = puzzleDotSet[i] ? '#4A4035' : '#D8D2CA';
    ctx.fill();
  }
}

function drawAnswerBoard(cvs, answerEdges, gridSize, puzzleDots, isDrawing, drawingPoints) {
  const ctx = cvs.getContext('2d');
  const rect = cvs.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const positions = getDotPositions(w, h, gridSize);
  const dotRadius = Math.max(7, w * 0.04);
  const lineW = Math.max(3, w * 0.018);

  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let e = 0; e < answerEdges.length; e++) {
    const pa = positions[answerEdges[e][0]];
    const pb = positions[answerEdges[e][1]];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = '#5BC886';
    ctx.stroke();
  }

  if (isDrawing && drawingPoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
    for (let s = 1; s < drawingPoints.length; s++) {
      ctx.lineTo(drawingPoints[s].x, drawingPoints[s].y);
    }
    ctx.strokeStyle = 'rgba(91,200,134,0.6)';
    ctx.lineWidth = Math.max(2.5, w * 0.015);
    ctx.stroke();
  }

  const total = gridSize * gridSize;
  const puzzleDotSet = {};
  for (let d = 0; d < puzzleDots.length; d++) puzzleDotSet[puzzleDots[d]] = true;
  const usedInEdges = {};
  for (let u = 0; u < answerEdges.length; u++) {
    usedInEdges[answerEdges[u][0]] = true;
    usedInEdges[answerEdges[u][1]] = true;
  }

  for (let i = 0; i < total; i++) {
    const p = positions[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = usedInEdges[i] ? '#5BC886' : '#D8D2CA';
    ctx.fill();
  }
}

export default function GameView({
  puzzle, gridSize, selectedDots, allowDiagonal,
  questionEdges, streak, onHome, onResult,
}) {
  const questionRef = useRef(null);
  const answerRef = useRef(null);
  const [answerEdges, setAnswerEdges] = useState([]);
  const [hint, setHint] = useState('점과 점 사이에 선을 그으세요');
  const [showClear, setShowClear] = useState(false);

  // Drawing state (refs for performance in event handlers)
  const isDrawingRef = useRef(false);
  const drawingPointsRef = useRef([]);
  const answerEdgesRef = useRef([]);
  const strokeEdgeCountsRef = useRef([]);

  // Sync answerEdgesRef with state
  useEffect(() => {
    answerEdgesRef.current = answerEdges;
  }, [answerEdges]);

  // Setup canvases and draw question
  useEffect(() => {
    if (!puzzle) return;
    const qCvs = questionRef.current;
    const aCvs = answerRef.current;
    if (!qCvs || !aCvs) return;

    const setup = () => {
      setupCanvas(qCvs);
      setupCanvas(aCvs);
      drawBoard(qCvs, questionEdges, gridSize, puzzle.dots);
      drawAnswerBoard(aCvs, [], gridSize, puzzle.dots, false, []);
    };

    requestAnimationFrame(setup);

    // Reset answer state
    setAnswerEdges([]);
    answerEdgesRef.current = [];
    strokeEdgeCountsRef.current = [];
    setHint('점과 점 사이에 선을 그으세요');
    setShowClear(false);
  }, [puzzle, questionEdges, gridSize]);

  const redrawAnswer = useCallback(() => {
    const aCvs = answerRef.current;
    if (!aCvs || !puzzle) return;
    drawAnswerBoard(aCvs, answerEdgesRef.current, gridSize, puzzle.dots, isDrawingRef.current, drawingPointsRef.current);
  }, [puzzle, gridSize]);

  // Touch/mouse event handlers
  useEffect(() => {
    const cvs = answerRef.current;
    if (!cvs || !puzzle) return;

    function getPos(e) {
      const rect = cvs.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      if (e.changedTouches && e.changedTouches.length > 0) {
        return { x: e.changedTouches[0].clientX - rect.left, y: e.changedTouches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function detectPassedDots(points) {
      if (!puzzle || points.length < 2) return [];
      const rect = cvs.getBoundingClientRect();
      const positions = getDotPositions(rect.width, rect.height, gridSize);
      const hitRadius = Math.max(20, rect.width * 0.12);
      const passed = [];

      for (let p = 0; p < points.length; p++) {
        const px = points[p].x;
        const py = points[p].y;
        for (let d = 0; d < puzzle.dots.length; d++) {
          const di = puzzle.dots[d];
          const dp = positions[di];
          const dx = px - dp.x;
          const dy = py - dp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < hitRadius) {
            if (passed.length === 0 || passed[passed.length - 1] !== di) {
              passed.push(di);
            }
            break;
          }
        }
      }
      return passed;
    }

    function checkAnswerNow(currentEdges) {
      if (currentEdges.length < questionEdges.length) {
        const remain = questionEdges.length - currentEdges.length;
        setHint(`선 ${remain}개 더 그으세요`);
        return;
      }
      const qSet = {};
      for (let i = 0; i < questionEdges.length; i++) {
        qSet[edgeKey(questionEdges[i][0], questionEdges[i][1])] = true;
      }
      let correct = 0;
      for (let j = 0; j < currentEdges.length; j++) {
        if (qSet[edgeKey(currentEdges[j][0], currentEdges[j][1])]) correct++;
      }
      if (currentEdges.length === questionEdges.length) {
        if (correct === questionEdges.length) {
          onResult(true);
        } else {
          onResult(false);
        }
      }
    }

    function onStart(e) {
      e.preventDefault();
      if (!puzzle) return;
      const pos = getPos(e);
      isDrawingRef.current = true;
      drawingPointsRef.current = [pos];
      redrawAnswer();
    }

    function onMove(e) {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      drawingPointsRef.current.push(pos);
      redrawAnswer();
    }

    function onEnd(e) {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      isDrawingRef.current = false;

      const passedDots = detectPassedDots(drawingPointsRef.current);
      let newEdgeCount = 0;
      const currentEdges = [...answerEdgesRef.current];

      for (let i = 0; i < passedDots.length - 1; i++) {
        const dotA = passedDots[i];
        const dotB = passedDots[i + 1];
        let exists = false;
        for (let j = 0; j < currentEdges.length; j++) {
          const a = currentEdges[j][0];
          const b = currentEdges[j][1];
          if ((a === dotA && b === dotB) || (a === dotB && b === dotA)) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          currentEdges.push([dotA, dotB]);
          newEdgeCount++;
        }
      }

      if (newEdgeCount > 0) {
        strokeEdgeCountsRef.current.push(newEdgeCount);
        setShowClear(true);
      }

      drawingPointsRef.current = [];
      answerEdgesRef.current = currentEdges;
      setAnswerEdges(currentEdges);
      redrawAnswer();
      checkAnswerNow(currentEdges);
    }

    function onCancel() {
      isDrawingRef.current = false;
      drawingPointsRef.current = [];
      redrawAnswer();
    }

    cvs.addEventListener('touchstart', onStart, { passive: false });
    cvs.addEventListener('touchmove', onMove, { passive: false });
    cvs.addEventListener('touchend', onEnd, { passive: false });
    cvs.addEventListener('touchcancel', onCancel);
    cvs.addEventListener('mousedown', onStart);
    cvs.addEventListener('mousemove', onMove);
    cvs.addEventListener('mouseup', onEnd);
    const onLeave = () => { if (isDrawingRef.current) onCancel(); };
    cvs.addEventListener('mouseleave', onLeave);

    return () => {
      cvs.removeEventListener('touchstart', onStart);
      cvs.removeEventListener('touchmove', onMove);
      cvs.removeEventListener('touchend', onEnd);
      cvs.removeEventListener('touchcancel', onCancel);
      cvs.removeEventListener('mousedown', onStart);
      cvs.removeEventListener('mousemove', onMove);
      cvs.removeEventListener('mouseup', onEnd);
      cvs.removeEventListener('mouseleave', onLeave);
    };
  }, [puzzle, gridSize, questionEdges, redrawAnswer, onResult]);

  const clearAll = useCallback(() => {
    setAnswerEdges([]);
    answerEdgesRef.current = [];
    strokeEdgeCountsRef.current = [];
    setShowClear(false);
    setHint('점과 점 사이에 선을 그으세요');
    const aCvs = answerRef.current;
    if (aCvs && puzzle) {
      drawAnswerBoard(aCvs, [], gridSize, puzzle.dots, false, []);
    }
  }, [puzzle, gridSize]);

  const badgeText = selectedDots + '개 점' + (allowDiagonal ? ' \u00b7 사선' : '');

  return (
    <div id="game-view" style={{ width: '100%' }}>
      <div className="game-nav">
        <button className="btn-back" onClick={onHome} title="홈">
          <HomeIcon />
        </button>
        <span className="nav-title">{gridSize}&times;{gridSize} 느린아이 점잇기</span>
        <span className="badge">{badgeText}</span>
      </div>
      <div className="game-boards" id="game-boards">
        <div className="board-wrapper">
          <div className="board-label">문제</div>
          <div className="board-container">
            <canvas ref={questionRef} />
          </div>
        </div>
        <div className="board-wrapper">
          <div className="board-label">나의 답</div>
          <div className="board-container">
            <canvas ref={answerRef} />
          </div>
        </div>
      </div>
      <p className="game-hint">{hint}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
        {showClear && (
          <button className="btn-clear" onClick={clearAll}>&#10005; 전체 지우기</button>
        )}
      </div>
    </div>
  );
}
