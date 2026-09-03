"use client";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Flame,
  Heart,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";

type Mode = "adult" | "child";
type Language =
  "thai" | "spanish" | "english" | "french" | "german" | "finnish";
type Question = {
  word: string;
  latin: string;
  swedish: string;
  choices: string[];
  listen?: boolean;
};

const languages: {
  id: Language;
  flag: string;
  name: string;
  native: string;
  color: string;
  voice: string;
}[] = [
  {
    id: "thai",
    flag: "🇹🇭",
    name: "Thailändska",
    native: "ภาษาไทย",
    color: "#e45c55",
    voice: "th-TH",
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    name: "Spanska",
    native: "Español",
    color: "#e9a518",
    voice: "es-ES",
  },
  {
    id: "english",
    flag: "🇬🇧",
    name: "Engelska",
    native: "English",
    color: "#466bc7",
    voice: "en-GB",
  },
  {
    id: "french",
    flag: "🇫🇷",
    name: "Franska",
    native: "Français",
    color: "#6752bd",
    voice: "fr-FR",
  },
  {
    id: "german",
    flag: "🇩🇪",
    name: "Tyska",
    native: "Deutsch",
    color: "#3d7864",
    voice: "de-DE",
  },
  {
    id: "finnish",
    flag: "🇫🇮",
    name: "Finska",
    native: "Suomi",
    color: "#368ac7",
    voice: "fi-FI",
  },
];
const thaiQuestions: Question[] = [
  {
    word: "สวัสดี",
    latin: "sà-wàt-dii",
    swedish: "Hej",
    choices: ["Tack", "Hej", "God natt"],
  },
  {
    word: "ขอบคุณ",
    latin: "khàawp-khun",
    swedish: "Tack",
    choices: ["Ursäkta", "Tack", "Ja"],
    listen: true,
  },
  {
    word: "ใช่",
    latin: "châi",
    swedish: "Ja",
    choices: ["Nej", "Kanske", "Ja"],
  },
  {
    word: "ไม่",
    latin: "mâi",
    swedish: "Nej / inte",
    choices: ["Ja", "Nej / inte", "Bra"],
    listen: true,
  },
  {
    word: "ลาก่อน",
    latin: "laa-gàawn",
    swedish: "Hej då",
    choices: ["Hej då", "Välkommen", "God morgon"],
  },
  {
    word: "ขอโทษ",
    latin: "khǎaw-thôot",
    swedish: "Ursäkta",
    choices: ["Tack", "Ursäkta", "Varsågod"],
    listen: true,
  },
];
const sample: Record<Exclude<Language, "thai">, Question> = {
  spanish: {
    word: "Hola",
    latin: "oh-la",
    swedish: "Hej",
    choices: ["Hej", "Tack", "God natt"],
  },
  english: {
    word: "Hello",
    latin: "he-lo",
    swedish: "Hej",
    choices: ["God natt", "Hej", "Tack"],
  },
  french: {
    word: "Bonjour",
    latin: "bån-sjor",
    swedish: "Hej",
    choices: ["Hej", "Hej då", "Tack"],
  },
  german: {
    word: "Hallo",
    latin: "ha-lo",
    swedish: "Hej",
    choices: ["Tack", "Ursäkta", "Hej"],
  },
  finnish: {
    word: "Hei",
    latin: "hej",
    swedish: "Hej",
    choices: ["Hej", "Tack", "Ja"],
  },
};
const lessonNames = [
  { icon: "👋", title: "Hälsa", open: true },
  { icon: "🍽️", title: "Mat & café", open: true },
  { icon: "🚕", title: "På väg", open: false },
  { icon: "💬", title: "Småprat", open: false },
];

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [matching, setMatching] = useState(false);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [xp, setXp] = useState(120);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lang = languages.find((l) => l.id === language);
  const questions =
    language === "thai"
      ? thaiQuestions
      : language
        ? [sample[language as Exclude<Language, "thai">]]
        : [];
  const q = questions[step];

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang?.voice ?? "th-TH";
    utterance.rate = 0.78;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) =>
        v.lang
          .toLowerCase()
          .startsWith((lang?.voice ?? "th").slice(0, 2).toLowerCase()),
      );
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };
  const playFeedbackSound = (correct: boolean) => {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const notes = correct
      ? mode === "child"
        ? [523.25, 659.25, 783.99]
        : [523.25, 659.25]
      : [220, 196];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = correct ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(correct ? 0.12 : 0.055, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });

    window.setTimeout(() => void context.close(), 650);
  };
  const start = () => {
    setPlaying(true);
    setStep(0);
    setSelected(null);
    setChecked(false);
    setDone(false);
    setScore(0);
    setMatching(false);
    setPickedWord(null);
    setMatched([]);
  };
  const check = () => {
    if (selected === null) return;
    const correct = Boolean(q && q.choices[selected] === q.swedish);
    setChecked(true);
    playFeedbackSound(correct);
    if (correct) setScore((v) => v + 1);
  };
  const next = () => {
    if (step === questions.length - 1 && language === "thai") {
      setMatching(true);
    } else if (step === questions.length - 1) {
      setXp((v) => v + Math.max(score, 1) * 10);
      setDone(true);
    } else {
      setStep((v) => v + 1);
      setSelected(null);
      setChecked(false);
    }
  };
  const chooseMeaning = (meaning: string) => {
    if (!pickedWord) return;
    const pair = thaiQuestions.find((item) => item.word === pickedWord);
    const correct = pair?.swedish === meaning;
    playFeedbackSound(correct);
    if (correct) setMatched((v) => [...v, pickedWord]);
    setPickedWord(null);
  };

  if (!language)
    return (
      <main className="language-page">
        <header className="wide-head">
          <div className="brand">
            <span>🌍</span> LingoLoop
          </div>
          <span className="from-swedish">Från svenska</span>
        </header>
        <section className="language-picker">
          <p className="eyebrow">Börja din språkresa</p>
          <h1>Vad vill du lära dig?</h1>
          <p className="intro">Välj ett språk för att se din första kurs.</p>
          <div className="language-grid">
            {languages.map((item) => (
              <button
                key={item.id}
                className={`language-card ${item.id === "thai" ? "featured" : ""}`}
                style={
                  { "--language-color": item.color } as React.CSSProperties
                }
                onClick={() => setLanguage(item.id)}
              >
                <span className="language-flag">{item.flag}</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.native}</small>
                </span>
                <b>→</b>
                {item.id === "thai" && <em>6 övningar + ljud</em>}
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  if (!mode)
    return (
      <main className="mode-page">
        <button className="back-link" onClick={() => setLanguage(null)}>
          <ArrowLeft /> Byt språk
        </button>
        <div className="brand">
          <span>🌍</span> LingoLoop
        </div>
        <section className="mode-card">
          <div className="thai-sun">{lang?.flag}</div>
          <p className="eyebrow">Svenska → {lang?.name.toLowerCase()}</p>
          <h1>Vem ska lära sig?</h1>
          <p className="intro">Samma språk, anpassat på två olika sätt.</p>
          <div className="mode-grid">
            <button className="mode adult" onClick={() => setMode("adult")}>
              <span className="mode-icon">🧑</span>
              <strong>Vuxen</strong>
              <small>Praktiska situationer och tydliga förklaringar</small>
              <b>→</b>
            </button>
            <button className="mode child" onClick={() => setMode("child")}>
              <span className="mode-icon">🧒</span>
              <strong>Barn</strong>
              <small>Kortare, lekfulla övningar och belöningar</small>
              <b>→</b>
            </button>
          </div>
        </section>
      </main>
    );

  if (playing && matching)
    return (
      <main className={`lesson-page ${mode}`}>
        <header className="lesson-head">
          <button className="icon-button" onClick={() => setPlaying(false)} aria-label="Stäng lektion"><ArrowLeft /></button>
          <div className="progress"><span style={{ width: "100%" }} /></div>
          <span className="heart"><Heart fill="currentColor" /> 5</span>
          <button
            className="sound-toggle"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? "Stäng av effektljud" : "Slå på effektljud"}
          >
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </button>
        </header>
        <section className="quiz-card match-card">
          <p className="step">Para ihop · bonusövning</p>
          <h1>Matcha orden med rätt betydelse</h1>
          <p className="listen-help">Välj först ett thailändskt ord och sedan den svenska betydelsen.</p>
          <div className="match-grid">
            <div>{thaiQuestions.slice(0, 3).map((item) => (
              <button key={item.word} disabled={matched.includes(item.word)} className={pickedWord === item.word ? "selected" : matched.includes(item.word) ? "matched" : ""} onClick={() => { setPickedWord(item.word); speak(item.word); }}>
                {item.word}{matched.includes(item.word) && <Check />}
              </button>
            ))}</div>
            <div>{["Tack", "Ja", "Hej"].map((item) => (
              <button key={item} disabled={thaiQuestions.slice(0, 3).some((question) => question.swedish === item && matched.includes(question.word))} onClick={() => chooseMeaning(item)}>{item}</button>
            ))}</div>
          </div>
          <button className="primary" disabled={matched.length < 3} onClick={() => { setMatching(false); setXp((value) => value + Math.max(score, 1) * 10 + 10); setDone(true); }}>Slutför lektionen</button>
        </section>
      </main>
    );

  if (playing && q)
    return (
      <main className={`lesson-page ${mode}`}>
        <header className="lesson-head">
          <button
            className="icon-button"
            onClick={() => setPlaying(false)}
            aria-label="Stäng lektion"
          >
            <ArrowLeft />
          </button>
          <div className="progress">
            <span
              style={{
                width: `${done ? 100 : ((step + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
          <span className="heart">
            <Heart fill="currentColor" /> 5
          </span>
          <button
            className="sound-toggle"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? "Stäng av effektljud" : "Slå på effektljud"}
            title={soundEnabled ? "Effektljud på" : "Effektljud av"}
          >
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </button>
        </header>
        {done ? (
          <section className="complete-card">
            <div className="complete-icon">🏆</div>
            <p className="eyebrow">Lektionen klar</p>
            <h1>Snyggt jobbat!</h1>
            <p>
              Du fick {score} av {questions.length} rätt och har övat på
              användbara hälsningsord.
            </p>
            <div className="reward">
              <Star fill="currentColor" /> +{Math.max(score, 1) * 10} XP
            </div>
            <button className="primary" onClick={() => setPlaying(false)}>
              Fortsätt
            </button>
            <button className="retry" onClick={start}>
              <RotateCcw /> Öva igen
            </button>
          </section>
        ) : (
          <section className="quiz-card">
            <p className="step">
              {q.listen ? "Lyssna och välj" : "Översätt"} · {step + 1} av{" "}
              {questions.length}
            </p>
            <button
              className={`sound ${q.listen ? "sound-large" : ""}`}
              aria-label={`Spela upp ${q.word}`}
              onClick={() => speak(q.word)}
            >
              <Volume2 />
            </button>
            {!q.listen && (
              <>
                <div className="thai-word">{q.word}</div>
                <div className="latin">{q.latin}</div>
              </>
            )}
            {q.listen && (
              <p className="listen-help">
                Tryck på högtalaren och välj vad du hör
              </p>
            )}
            <h1>Vad betyder ordet?</h1>
            <div className="choices">
              {q.choices.map((answer, index) => {
                const right = checked && answer === q.swedish;
                const wrong = checked && selected === index && !right;
                return (
                  <button
                    key={answer}
                    disabled={checked}
                    onClick={() => setSelected(index)}
                    className={`${selected === index ? "selected" : ""} ${right ? "right" : ""} ${wrong ? "wrong" : ""}`}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {answer}
                    {right && <Check />}
                  </button>
                );
              })}
            </div>
            {checked && (
              <div
                className={`answer-feedback ${q.choices[selected ?? -1] === q.swedish ? "correct" : "incorrect"}`}
              >
                <strong>
                  {q.choices[selected ?? -1] === q.swedish
                    ? "Rätt! +10 XP"
                    : "Nästan!"}
                </strong>
                <span>
                  {q.word} betyder “{q.swedish}”.
                </span>
                {q.choices[selected ?? -1] === q.swedish && mode === "child" && (
                  <div className="reward-sparkles" aria-hidden="true">
                    ★ ✨ ★
                  </div>
                )}
                <button
                  className="tiny-sound"
                  onClick={() => speak(q.word)}
                  aria-label="Lyssna igen"
                >
                  <Volume2 /> Lyssna igen
                </button>
              </div>
            )}
            <button
              className="primary"
              disabled={selected === null}
              onClick={checked ? next : check}
            >
              {checked
                ? step === questions.length - 1
                  ? "Se resultat"
                  : "Nästa"
                : "Kontrollera"}
            </button>
          </section>
        )}
      </main>
    );

  return (
    <main className={`dashboard ${mode}`}>
      <header className="topbar">
        <div className="brand">
          <span>🌍</span> LingoLoop
        </div>
        <div className="top-actions">
          <button className="switch-mode" onClick={() => setMode(null)}>
            {mode === "adult" ? "🧑 Vuxen" : "🧒 Barn"}
          </button>
          <button
            className="switch-mode"
            onClick={() => {
              setMode(null);
              setLanguage(null);
            }}
          >
            {lang?.flag} {lang?.name}
          </button>
        </div>
      </header>
      <section className="welcome">
        <div>
          <p>{language === "thai" ? "สวัสดี" : q?.word}! 👋</p>
          <h1>
            {mode === "adult"
              ? `Dags för dagens ${lang?.name.toLowerCase()}`
              : "Nu lär vi oss tillsammans!"}
          </h1>
        </div>
        <div className="stats">
          <span>
            <Flame /> 3 dagar
          </span>
          <span>
            <Star /> {xp} XP
          </span>
        </div>
      </section>
      <section className="daily">
        <div>
          <small>Dagens mål</small>
          <strong>1 av 2 lektioner</strong>
        </div>
        <div className="daily-bar">
          <span />
        </div>
        <b>50%</b>
      </section>
      <section className="path">
        <div className="section-title">
          <div>
            <p>Nivå 1 · {lang?.flag}</p>
            <h2>Kom igång</h2>
          </div>
          <span>2 / 4</span>
        </div>
        <div className="lesson-list">
          {lessonNames.map((lesson, index) => (
            <button
              key={lesson.title}
              disabled={!lesson.open}
              onClick={start}
              className={`lesson-item ${index === 0 ? "current" : ""}`}
            >
              <span className="lesson-icon">{lesson.icon}</span>
              <span className="lesson-copy">
                <strong>{lesson.title}</strong>
                <small>
                  {lesson.open
                    ? index === 0
                      ? language === "thai"
                        ? "6 övningar · ljud"
                        : "1 övning · ljud"
                      : "5 min"
                    : "Låst"}
                </small>
              </span>
              <span className="lesson-state">
                {index === 0 ? "Starta" : lesson.open ? "Öva" : "🔒"}
              </span>
            </button>
          ))}
        </div>
      </section>
      <nav className="bottom-nav">
        <button className="active">
          ⌂<span>Hem</span>
        </button>
        <button>
          ◎<span>Öva</span>
        </button>
        <button>
          ♛<span>Topplista</span>
        </button>
        <button>
          ●<span>Profil</span>
        </button>
      </nav>
    </main>
  );
}
