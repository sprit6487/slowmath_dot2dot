import { useState, useCallback, useRef } from 'react';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import GameView from './components/GameView';
import ResultOverlay from './components/ResultOverlay';
import Toast from './components/Toast';
import { generatePuzzle, DOT_COUNTS } from './utils/puzzle';

export default function App() {
  const [view, setView] = useState('login');
  const [selectedGrid, setSelectedGrid] = useState(3);
  const [selectedDots, setSelectedDots] = useState(3);
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [maxTurns, setMaxTurns] = useState(-1);
  const [puzzle, setPuzzle] = useState(null);
  const [questionEdges, setQuestionEdges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [resultActive, setResultActive] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Use ref for streak so callbacks get latest value
  const streakRef = useRef(0);
  streakRef.current = streak;

  const handleLogin = useCallback(() => {
    setView('home');
  }, []);

  const handleLogout = useCallback(() => {
    setView('login');
  }, []);

  const handleGridChange = useCallback((size) => {
    setSelectedGrid(size);
    setSelectedDots(DOT_COUNTS[size][0]);
    if (size === 2) setMaxTurns(-1);
  }, []);

  const handleStart = useCallback(() => {
    const p = generatePuzzle(selectedGrid, selectedDots, allowDiagonal, maxTurns);
    setPuzzle(p);
    setQuestionEdges(p.edges);
    setResultActive(false);
    setView('game');
  }, [selectedGrid, selectedDots, allowDiagonal, maxTurns]);

  const handleHome = useCallback(() => {
    setView('home');
    setResultActive(false);
  }, []);

  const handleResult = useCallback((success) => {
    if (success) {
      const newStreak = streakRef.current + 1;
      setStreak(newStreak);
    } else {
      setStreak(0);
    }
    setResultSuccess(success);
    setResultActive(true);
  }, []);

  const handleRetry = useCallback(() => {
    setResultActive(false);
    // Force re-render of GameView by setting same puzzle again with new ref
    setPuzzle((prev) => ({ ...prev }));
  }, []);

  const handleNext = useCallback(() => {
    setResultActive(false);
    const p = generatePuzzle(selectedGrid, selectedDots, allowDiagonal, maxTurns);
    setPuzzle(p);
    setQuestionEdges(p.edges);
  }, [selectedGrid, selectedDots, allowDiagonal, maxTurns]);

  const handleShare = useCallback(() => {
    const title = document.title;
    const url = window.location.href;
    const text = title + ' - 따라서 점을 이어 보세요!';
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setToastMsg('링크가 복사되었습니다!');
      });
    } else {
      prompt('링크를 복사하세요:', url);
    }
  }, []);

  const handleToastDone = useCallback(() => {
    setToastMsg('');
  }, []);

  return (
    <div className="app">
      {view === 'login' && (
        <LoginView onLogin={handleLogin} />
      )}
      {view === 'home' && (
        <HomeView
          selectedGrid={selectedGrid}
          selectedDots={selectedDots}
          allowDiagonal={allowDiagonal}
          maxTurns={maxTurns}
          onGridChange={handleGridChange}
          onDotsChange={setSelectedDots}
          onDiagonalChange={setAllowDiagonal}
          onTurnsChange={setMaxTurns}
          onStart={handleStart}
          onLogout={handleLogout}
          onShare={handleShare}
        />
      )}
      {view === 'game' && puzzle && (
        <GameView
          puzzle={puzzle}
          gridSize={selectedGrid}
          selectedDots={selectedDots}
          allowDiagonal={allowDiagonal}
          questionEdges={questionEdges}
          streak={streak}
          onHome={handleHome}
          onResult={handleResult}
        />
      )}
      <ResultOverlay
        active={resultActive}
        success={resultSuccess}
        streak={streak}
        onRetry={handleRetry}
        onNext={handleNext}
      />
      <Toast message={toastMsg} onDone={handleToastDone} />
    </div>
  );
}
