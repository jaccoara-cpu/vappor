import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DecryptedText from '../components/DecryptedText';
import FaultyTerminal from '../components/FaultyTerminal';
import './Welcome.css';

// ============================================
// НАСТРОЙКИ АНИМАЦИИ РАСШИФРОВКИ
// ============================================

// Настройки для заголовка "VAPOR"
const TITLE_ANIMATION = {
  speed: 30,              // Скорость анимации (миллисекунды)
  maxIterations: 15,      // Количество итераций шифрования перед раскрытием каждой буквы
  sequential: true,       // true = буквы раскрываются по очереди, false = все сразу
  revealDirection: 'start', // Направление: 'center' (от центра), 'start' (слева), 'end' (справа)
  useOriginalCharsOnly: false, // false = использовать случайные символы для более яркого эффекта шифрования
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`€£¥§©®™°²³', // Расширенный набор символов
};

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleEnter = () => {
    navigate('/catalog');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-terminal-container">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.5}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#9333ea"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={0.6}
        />
      </div>
      <div className={`welcome-content ${isVisible ? 'fade-in' : ''}`}>
        <h1 className="welcome-title">
          <DecryptedText
            text="VAPOR"
            animateOn="view"
            speed={TITLE_ANIMATION.speed}
            maxIterations={TITLE_ANIMATION.maxIterations}
            sequential={TITLE_ANIMATION.sequential}
            revealDirection={TITLE_ANIMATION.revealDirection}
            className="revealed"
            encryptedClassName="encrypted"
            parentClassName="vapor-title-gradient"
            useOriginalCharsOnly={TITLE_ANIMATION.useOriginalCharsOnly}
            characters={TITLE_ANIMATION.characters}
          />
        </h1>
        <p className="welcome-subtitle">
          Премиум жидкости для парения
        </p>
        <button onClick={handleEnter} className="btn btn-primary welcome-button">
          Перейти в каталог
        </button>
      </div>
    </div>
  );
};

export default Welcome;

