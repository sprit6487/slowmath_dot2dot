export default function ResultOverlay({ active, success, streak, onRetry, onNext }) {
  return (
    <div className={`result-overlay${active ? ' active' : ''}`}>
      <div className="result-card">
        <div className="result-emoji">{success ? '\uD83C\uDF89' : '\uD83D\uDE05'}</div>
        <div className="result-text">{success ? '정답!' : '오답!'}</div>
        <div className="result-sub">
          {success
            ? `연속 ${streak}문제 정답!`
            : '선의 위치가 달라요. 다시 도전하세요!'}
        </div>
        <div className="result-actions">
          <button className="btn-retry" onClick={onRetry}>다시 하기</button>
          <button className="btn-next" onClick={onNext}>다음 문제</button>
        </div>
      </div>
    </div>
  );
}
