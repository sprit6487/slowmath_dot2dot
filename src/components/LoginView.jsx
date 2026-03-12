import TurtleSvg from '../assets/TurtleSvg';

export default function LoginView({ onLogin }) {
  return (
    <div className="login-view">
      <div className="login-logo-area">
        <div style={{ display: 'inline-block', marginBottom: 12 }}>
          <TurtleSvg width={120} height={100} />
        </div>
        <h1>
          <span style={{ color: '#6BADE8' }}>느린</span>
          <span style={{ color: '#F0A050' }}>아이</span>{' '}
          <span style={{ color: '#4A4035' }}>점잇기</span>
        </h1>
        <p className="login-subtitle">따라서 점을 이어 보세요!</p>
      </div>
      <div className="login-buttons">
        <button className="login-btn kakao" onClick={() => onLogin('kakao')}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 1C4.477 1 0 4.477 0 8.667c0 2.7 1.753 5.072 4.393 6.413-.192.717-.694 2.6-.794 3.004-.124.497.182.49.383.356.158-.105 2.51-1.708 3.525-2.398.8.118 1.628.18 2.493.18 5.523 0 10-3.477 10-7.555C20 4.477 15.523 1 10 1z" fill="#191919" /></svg>
          카카오 로그인
        </button>
        <button className="login-btn naver" onClick={() => onLogin('naver')}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M13.57 10.684L6.066 0H0v20h6.43V9.316L13.934 20H20V0h-6.43v10.684z" fill="white" /></svg>
          네이버 로그인
        </button>
        <button className="login-btn google" onClick={() => onLogin('google')}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" /><path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" /><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" /><path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" /></svg>
          Google 로그인
        </button>
        <button className="login-btn facebook" onClick={() => onLogin('facebook')}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" fill="white" /></svg>
          Facebook 로그인
        </button>
      </div>
    </div>
  );
}
