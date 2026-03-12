import { useEffect, useRef, useCallback } from 'react';
import TurtleSvg from '../assets/TurtleSvg';
import { GRID_OPTIONS, DOT_COUNTS } from '../utils/puzzle';

function ShareIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

function MiniGridCanvas({ size }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const pad = 24;
    const w = cvs.width;
    const step = (w - 2 * pad) / (size - 1);
    ctx.clearRect(0, 0, w, w);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        ctx.beginPath();
        ctx.arc(pad + c * step, pad + r * step, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#B8AD9E';
        ctx.fill();
      }
    }
  }, [size]);

  return <canvas ref={canvasRef} width={128} height={128} />;
}

export default function HomeView({
  selectedGrid, selectedDots, allowDiagonal, maxTurns,
  onGridChange, onDotsChange, onDiagonalChange, onTurnsChange,
  onStart, onLogout, onShare,
}) {
  const dotCounts = DOT_COUNTS[selectedGrid];

  const turnOptions = [
    { val: 1, label: '1번 이하' },
    { val: 2, label: '2번 이하' },
    { val: 3, label: '3번 이하' },
    { val: -1, label: '제한 없음' },
  ];

  const diagOptions = [
    { val: false, label: '사선 없이' },
    { val: true, label: '사선 포함' },
  ];

  return (
    <div id="home-view" style={{ position: 'relative', width: '100%' }}>
      <button className="btn-share-home" onClick={onShare} title="공유하기">
        <ShareIcon />
      </button>

      <div className="app-header">
        <TurtleSvg width={100} height={84} />
        <h1>
          <span style={{ color: '#6BADE8' }}>느린</span>
          <span style={{ color: '#F0A050' }}>아이</span>{' '}
          <span style={{ color: '#4A4035' }}>점잇기</span>
        </h1>
      </div>

      <p className="sec-label">격자 크기</p>
      <div className="grid-select">
        {GRID_OPTIONS.map((opt) => (
          <div
            key={opt.size}
            className={`grid-card${opt.size === selectedGrid ? ' selected' : ''}`}
            onClick={() => onGridChange(opt.size)}
          >
            <MiniGridCanvas size={opt.size} />
            <span className="g-name">{opt.label}</span>
          </div>
        ))}
      </div>

      <p className="sec-label">점 개수 (선분 수)</p>
      <div className="row-btns">
        {dotCounts.map((n) => (
          <button
            key={n}
            className={`seg-btn${n === selectedDots ? ' sel-green' : ''}`}
            onClick={() => onDotsChange(n)}
          >
            {n}개 점 ({n - 1}선)
          </button>
        ))}
      </div>

      {selectedGrid !== 2 && (
        <>
          <p className="sec-label">방향 전환</p>
          <div className="row-btns">
            {turnOptions.map((opt) => (
              <button
                key={opt.val}
                className={`seg-btn${maxTurns === opt.val ? ' sel-blue' : ''}`}
                onClick={() => onTurnsChange(opt.val)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="sec-label">사선(대각선)</p>
      <div className="row-btns">
        {diagOptions.map((opt) => (
          <button
            key={String(opt.val)}
            className={`seg-btn${allowDiagonal === opt.val ? ' sel-blue' : ''}`}
            onClick={() => onDiagonalChange(opt.val)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button className="start-btn" onClick={onStart}>시작하기</button>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="logout-btn" onClick={onLogout}>로그아웃</button>
      </div>
    </div>
  );
}
