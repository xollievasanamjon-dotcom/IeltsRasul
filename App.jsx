import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarCheck, PenLine, Timer, Clapperboard, Plus, Settings, Sun, Moon,
  ArrowUpRight, Check, AlertTriangle, Sparkles, Play, Pause, RotateCcw,
  Bookmark, Search, X, ChevronDown, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import {
  ENGNOVATE_LINKS, EXTRA_PRACTICE_LINKS, ERROR_TYPES, BEAST_28_DAYS,
  TASK2_TYPES, TASK1_TYPES, STARTER_FRAMES, GRAMMAR_WEAPONS, WRITING_CHECKLIST,
  SKILL_PLAYBOOKS, INTERESTS, MEDIA_DB
} from './data/ieltsData';
import {
  analyzeEssayLocally, playTimerChime, gradeWithGemini
} from './utils/geminiExaminer';

const STORAGE_KEY = 'ielts_rasul_pwa_v1';

const DEFAULT_STATE = {
  theme: 'dark',
  apiKey: '',
  targetBand: 7.0,
  scores: { listening: 6.5, reading: 6.5, writing: 5.5, speaking: 7.0 },
  history: [{ date: 'Старт', overall: 6.5, l: 6.5, r: 6.5, w: 5.5, s: 7.0, note: 'Стартовая база' }],
  completedDays: [],
  selectedDay: 1,
  errorLog: {
    'Writing: Клише / бедная грамматика': 2,
    'Reading: T/F/NG & Y/N/NG': 1
  },
  writingDraft: '',
  writingChecklist: {},
  savedMedia: []
};

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      scores: { ...DEFAULT_STATE.scores, ...(parsed.scores || {}) },
      errorLog: parsed.errorLog || DEFAULT_STATE.errorLog,
      history: Array.isArray(parsed.history) && parsed.history.length ? parsed.history : DEFAULT_STATE.history
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function roundBand(v) {
  return Math.round(v * 2) / 2;
}

function formatSec(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const [data, setData] = useState(loadSavedState);
  const [tab, setTab] = useState('plan');
  const [toast, setToast] = useState('');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logForm, setLogForm] = useState({ l: 6.5, r: 6.5, w: 5.5, s: 7.0, note: '', errorTag: '' });
  const [keyInput, setKeyInput] = useState('');

  // Writing state
  const [wSub, setWSub] = useState('builder'); // builder | task1 | grammar | check
  const [t2Idx, setT2Idx] = useState(0);
  const [t1Idx, setT1Idx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiError, setAiError] = useState('');
  const editorRef = useRef(null);

  // Timers & L/R/S state
  const [timerMode, setTimerMode] = useState('reading'); // reading | writing | speaking
  const [timerPhase, setTimerPhase] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [playbookTab, setPlaybookTab] = useState('reading');
  const [speakingText, setSpeakingText] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState('');
  const [speakingLoading, setSpeakingLoading] = useState(false);

  // Media state
  const [mediaQuery, setMediaQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [mediaSkill, setMediaSkill] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2300);
  };

  const overall = useMemo(() => {
    const { listening, reading, writing, speaking } = data.scores;
    return roundBand((listening + reading + writing + speaking) / 4);
  }, [data.scores]);

  const weakest = useMemo(() => {
    return Object.entries(data.scores).sort((a, b) => a[1] - b[1])[0];
  }, [data.scores]);

  const isDark = data.theme === 'dark';
  const ui = isDark
    ? {
        bg: 'bg-[#0b0b0d] text-zinc-100',
        outer: 'bg-[#070709]',
        header: 'bg-[#0b0b0d]/95 border-[#202027]',
        card: 'bg-[#141418] border-[#26262f]',
        cardSub: 'bg-[#0e0e11] border-[#222229]',
        pill: 'bg-[#1c1c22] border-[#2a2a34] text-zinc-200',
        btnPrimary: 'bg-[#fafafa] text-[#09090b]',
        muted: 'text-zinc-400',
        dock: 'bg-[#141418] border-[#2c2c35]',
        navActive: 'bg-[#23232b] text-white',
        input: 'bg-[#0e0e11] border-[#2a2a34] text-zinc-100 placeholder-zinc-500'
      }
    : {
        bg: 'bg-[#f6f5f2] text-zinc-900',
        outer: 'bg-[#e7e5e0]',
        header: 'bg-[#f6f5f2]/95 border-[#e2e0d8]',
        card: 'bg-white border-[#e4e2da] shadow-sm',
        cardSub: 'bg-[#f7f6f2] border-[#e6e4dc]',
        pill: 'bg-[#efeee9] border-[#dedcd3] text-zinc-800',
        btnPrimary: 'bg-[#111113] text-white',
        muted: 'text-zinc-500',
        dock: 'bg-white border-[#dfddd4] shadow-xl',
        navActive: 'bg-[#111113] text-white',
        input: 'bg-[#f7f6f2] border-[#dcdad1] text-zinc-900 placeholder-zinc-400'
      };

  // Timer phases config
  const timerConfigs = {
    reading: {
      label: 'Reading Split (15 / 20 / 25)',
      phases: [
        { name: 'Passage 1', sec: 15 * 60 },
        { name: 'Passage 2', sec: 20 * 60 },
        { name: 'Passage 3', sec: 25 * 60 }
      ]
    },
    writing: {
      label: 'Writing (20 / 40)',
      phases: [
        { name: 'Task 1 (150+ слов)', sec: 20 * 60 },
        { name: 'Task 2 (250+ слов)', sec: 40 * 60 }
      ]
    },
    speaking: {
      label: 'Speaking Cue Card (1 + 2)',
      phases: [
        { name: 'Подготовка (заметки PPF)', sec: 60 },
        { name: 'Ответ вслух (2 минуты)', sec: 120 }
      ]
    }
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        playTimerChime();
        const phases = timerConfigs[timerMode].phases;
        if (timerPhase + 1 < phases.length) {
          const next = timerPhase + 1;
          setTimerPhase(next);
          notify(`Переход: ${phases[next].name}!`);
          return phases[next].sec;
        }
        setTimerRunning(false);
        notify('Время блока вышло!');
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerMode, timerPhase]);

  const selectTimerMode = (mode) => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerPhase(0);
    setSecondsLeft(timerConfigs[mode].phases[0].sec);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerPhase(0);
    setSecondsLeft(timerConfigs[timerMode].phases[0].sec);
  };

  // Local Essay Analysis
  const essayStats = useMemo(() => analyzeEssayLocally(data.writingDraft, 'task2'), [data.writingDraft]);

  const insertFrame = (frameText) => {
    const next = data.writingDraft
      ? `${data.writingDraft.trimEnd()}\n\n${frameText}`
      : frameText;
    setData((d) => ({ ...d, writingDraft: next }));
    notify('Рамка вставлена в редактор');
    if (editorRef.current) editorRef.current.focus();
  };

  const runGeminiWritingCheck = async () => {
    setAiError('');
    if (essayStats.words < 30) {
      notify('Напиши хотя бы 30 слов для проверки');
      return;
    }
    if (!data.apiKey) {
      setKeyInput('');
      setShowSettings(true);
      notify('Вставь бесплатный Gemini API ключ для живой проверки');
      return;
    }
    setAiLoading(true);
    try {
      const reply = await gradeWithGemini({
        apiKey: data.apiKey,
        text: data.writingDraft,
        mode: 'task2',
        prompt: TASK2_TYPES[t2Idx].prompt
      });
      setAiReport(reply);
    } catch (err) {
      setAiError(err.message === 'NO_KEY' ? 'Добавь Gemini API ключ в настройках.' : `Ошибка API: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const runGeminiSpeakingCheck = async () => {
    if (speakingText.trim().length < 20) {
      notify('Введи ответ Speaking (хотя бы 2–3 предложения)');
      return;
    }
    if (!data.apiKey) {
      setKeyInput('');
      setShowSettings(true);
      notify('Вставь бесплатный Gemini API ключ в настройках');
      return;
    }
    setSpeakingLoading(true);
    try {
      const reply = await gradeWithGemini({
        apiKey: data.apiKey,
        text: speakingText,
        mode: 'speaking',
        prompt: 'IELTS Speaking Part 2 / Part 3 response'
      });
      setSpeakingFeedback(reply);
    } catch (err) {
      setSpeakingFeedback(`Ошибка API: ${err.message}`);
    } finally {
      setSpeakingLoading(false);
    }
  };

  const toggleDayDone = (dayNum) => {
    setData((d) => {
      const exists = d.completedDays.includes(dayNum);
      const next = exists
        ? d.completedDays.filter((x) => x !== dayNum)
        : [...d.completedDays, dayNum];
      return { ...d, completedDays: next };
    });
  };

  const handleSaveMock = () => {
    const l = parseFloat(logForm.l);
    const r = parseFloat(logForm.r);
    const w = parseFloat(logForm.w);
    const s = parseFloat(logForm.s);
    const ov = roundBand((l + r + w + s) / 4);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}`;

    setData((d) => {
      const nextErrors = { ...d.errorLog };
      if (logForm.errorTag) {
        nextErrors[logForm.errorTag] = (nextErrors[logForm.errorTag] || 0) + 1;
      }
      return {
        ...d,
        scores: { listening: l, reading: r, writing: w, speaking: s },
        history: [...d.history, { date: dateStr, overall: ov, l, r, w, s, note: logForm.note.trim() }],
        errorLog: nextErrors
      };
    });
    setShowLogModal(false);
    notify(`Сохранено! Overall: ${ov.toFixed(1)}`);
  };

  const filteredMedia = useMemo(() => {
    const q = mediaQuery.toLowerCase().trim();
    return MEDIA_DB.filter((m) => {
      const okInt = !selectedInterests.length || selectedInterests.includes(m.cat);
      const okSkill =
        mediaSkill === 'all'
          ? true
          : mediaSkill === 'saved'
          ? data.savedMedia.includes(m.id)
          : m.skills.includes(mediaSkill);
      const okQ = !q || `${m.title} ${m.plat} ${m.why} ${m.take.join(' ')}`.toLowerCase().includes(q);
      return okInt && okSkill && okQ;
    });
  }, [mediaQuery, selectedInterests, mediaSkill, data.savedMedia]);

  const sortedErrors = useMemo(() => {
    return Object.entries(data.errorLog).sort((a, b) => b[1] - a[1]);
  }, [data.errorLog]);

  const activeDayObj = BEAST_28_DAYS[data.selectedDay - 1] || BEAST_28_DAYS[0];
  const bandOptions = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  const skillNames = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

  return (
    <div className={`min-h-screen w-full ${ui.outer} sm:py-4 flex justify-center`}>
      <div className={`w-full max-w-[430px] min-h-screen sm:min-h-[calc(100vh-32px)] sm:rounded-[34px] sm:border ${isDark ? 'sm:border-[#26262f]' : 'sm:border-[#d8d6ce]'} ${ui.bg} flex flex-col relative overflow-hidden shadow-2xl`}>

        {/* Header */}
        <header className={`sticky top-0 z-30 px-4 py-3 border-b ${ui.header} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${ui.btnPrimary} font-extrabold text-xs flex items-center justify-center tracking-tight`}>
              IR
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight leading-none">IELTS.RASUL</div>
              <div className={`text-[11px] ${ui.muted} mt-0.5`}>
                Beast 28d • Цель {data.targetBand.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setData((d) => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))}
              className={`w-8 h-8 rounded-full border ${ui.pill} flex items-center justify-center`}
              aria-label="Сменить тему"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setKeyInput(data.apiKey); setShowSettings(true); }}
              className={`w-8 h-8 rounded-full border ${ui.pill} flex items-center justify-center relative`}
              aria-label="Настройки API"
            >
              <Settings className="w-3.5 h-3.5" />
              {data.apiKey && <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />}
            </button>
            <button
              onClick={() => {
                setLogForm({
                  l: data.scores.listening,
                  r: data.scores.reading,
                  w: data.scores.writing,
                  s: data.scores.speaking,
                  note: '',
                  errorTag: ''
                });
                setShowLogModal(true);
              }}
              className={`px-2.5 py-1.5 rounded-full border ${ui.pill} text-xs font-bold flex items-center gap-1`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono">{overall.toFixed(1)}</span>
            </button>
          </div>
        </header>

        {/* Scroll Body */}
        <main className="flex-1 px-4 pt-4 pb-28 space-y-4 overflow-y-auto no-scrollbar">

          {/* ==================== TAB 1: 28-DAY PLAN & ERROR WALL ==================== */}
          {tab === 'plan' && (
            <div className="space-y-4">
              {/* Overview & Target */}
              <div className={`rounded-2xl border p-4 space-y-3.5 ${ui.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${ui.muted}`}>
                      28 дней • Режим зверя (4 ч/день)
                    </div>
                    <h1 className="text-lg font-extrabold tracking-tight mt-0.5">
                      {overall >= data.targetBand
                        ? `Цель Band ${data.targetBand.toFixed(1)} закрыта`
                        : `До Band ${data.targetBand.toFixed(1)} осталось +${(data.targetBand - overall).toFixed(1)}`}
                    </h1>
                    <p className={`text-xs ${ui.muted} mt-0.5`}>
                      Главный рычаг роста: <b className={isDark ? 'text-white' : 'text-zinc-900'}>{skillNames[weakest[0]]} ({weakest[1].toFixed(1)})</b>
                    </p>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl border ${ui.cardSub} text-center shrink-0`}>
                    <div className={`text-[10px] ${ui.muted}`}>Дней</div>
                    <div className="font-mono text-base font-extrabold text-emerald-400">{data.completedDays.length}/28</div>
                  </div>
                </div>

                {/* Target selector */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] ${ui.muted} mr-1`}>Цель:</span>
                  {[7.0, 7.5, 8.0, 8.5].map((b) => (
                    <button
                      key={b}
                      onClick={() => setData((d) => ({ ...d, targetBand: b }))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                        data.targetBand === b ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {b.toFixed(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(['listening', 'reading', 'writing', 'speaking']).map((k) => (
                    <div key={k} className={`rounded-xl border p-2 text-center ${ui.cardSub}`}>
                      <div className={`text-[10px] ${ui.muted} capitalize`}>{k.slice(0, 1).toUpperCase() + k.slice(1)}</div>
                      <div className={`font-mono text-base font-extrabold mt-0.5 ${
                        k === weakest[0] ? 'text-rose-400' : data.scores[k] >= data.targetBand ? 'text-emerald-400' : ''
                      }`}>
                        {data.scores[k].toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLogForm({
                      l: data.scores.listening,
                      r: data.scores.reading,
                      w: data.scores.writing,
                      s: data.scores.speaking,
                      note: '',
                      errorTag: ''
                    });
                    setShowLogModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${ui.btnPrimary}`}
                >
                  <Plus className="w-4 h-4" /> Записать результат мока + ошибку
                </button>
              </div>

              {/* 28-Day Interactive Grid */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Календарь 28 дней (4 недели)</h2>
                    <p className={`text-[11px] ${ui.muted}`}>Тапни на любой день, чтобы открыть точный план</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {BEAST_28_DAYS.map((d) => {
                    const done = data.completedDays.includes(d.day);
                    const selected = data.selectedDay === d.day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => setData((st) => ({ ...st, selectedDay: d.day }))}
                        className={`h-9 rounded-xl font-mono text-xs font-bold border transition flex items-center justify-center ${
                          done
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : selected
                            ? ui.btnPrimary
                            : ui.cardSub
                        }`}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : d.day}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Detail */}
                <div className={`rounded-xl border p-3.5 space-y-2.5 ${ui.cardSub}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{activeDayObj.tag}</span>
                      <h3 className="text-xs font-extrabold mt-0.5">{activeDayObj.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleDayDone(activeDayObj.day)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition shrink-0 ${
                        data.completedDays.includes(activeDayObj.day)
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                          : ui.btnPrimary
                      }`}
                    >
                      {data.completedDays.includes(activeDayObj.day) ? 'Выполнено ✓' : 'Закрыть день'}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeDayObj.blocks.map((b, i) => (
                      <div key={i} className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        • {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engnovate Practice Hub */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Практика на Engnovate</h2>
                    <p className={`text-[11px] ${ui.muted}`}>Реальные моки там → статистика здесь</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ENGNOVATE_LINKS.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-xl border p-3 flex items-center justify-between gap-2 ${ui.pill}`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className={`text-[10px] ${ui.muted} truncate`}>{item.sub}</div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 opacity-60 shrink-0" />
                    </a>
                  ))}
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {EXTRA_PRACTICE_LINKS.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${ui.cardSub}`}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              {/* Error Wall */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm font-bold">Error Wall (где сливаешь баллы)</h2>
                  </div>
                </div>
                {sortedErrors.length ? (
                  <div className="space-y-2">
                    {sortedErrors.slice(0, 5).map(([errName, count]) => (
                      <div key={errName} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${ui.cardSub}`}>
                        <span className="truncate pr-2 font-medium">{errName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-rose-400">×{count}</span>
                          <button
                            onClick={() =>
                              setData((d) => ({
                                ...d,
                                errorLog: { ...d.errorLog, [errName]: (d.errorLog[errName] || 0) + 1 }
                              }))
                            }
                            className={`w-6 h-6 rounded-md border text-xs font-bold ${ui.pill}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${ui.muted}`}>Пока пусто — отмечай ошибки при записи моков.</p>
                )}
              </div>

              {/* Score Progress Chart */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">График прогресса</h2>
                  <span className={`font-mono text-[11px] ${ui.muted}`}>{data.history.length} зап.</span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history.slice(-8)}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[4.5, 9]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#18181b' : '#ffffff',
                          borderColor: isDark ? '#27272a' : '#e4e4e7',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="overall" stroke="#34d399" strokeWidth={2} fill="#34d399" fillOpacity={0.14} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: INTERACTIVE WRITING LAB ==================== */}
          {tab === 'writing' && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Writing Lab • Band 7.0–8.5</span>
                  <h2 className="text-lg font-extrabold mt-0.5">Конструктор + Живой Детектор</h2>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'builder', label: 'Task 2' },
                    { id: 'task1', label: 'Task 1' },
                    { id: 'grammar', label: 'Грамм.' },
                    { id: 'check', label: 'Чек-лист' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setWSub(s.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                        wSub === s.id ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {wSub === 'builder' && (
                <div className="space-y-3">
                  {/* Type pills */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {TASK2_TYPES.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => setT2Idx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                          i === t2Idx ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>

                  {/* Prompt + Collapsible Sentence Blueprint */}
                  <div className={`rounded-2xl border p-4 space-y-2.5 ${ui.card}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${ui.muted}`}>
                      Схема по предложениям ({TASK2_TYPES[t2Idx].name})
                    </div>
                    <p className="text-xs italic leading-relaxed">"{TASK2_TYPES[t2Idx].prompt}"</p>
                    <details className={`rounded-xl border p-3 ${ui.cardSub}`}>
                      <summary className="flex items-center justify-between cursor-pointer text-xs font-bold">
                        <span>Открыть пошаговый план (S1–S12 + примеры 8.5)</span>
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      </summary>
                      <div className="mt-3 space-y-2">
                        {TASK2_TYPES[t2Idx].steps.map((st) => (
                          <div key={st.id} className={`p-2.5 rounded-lg border text-xs space-y-1 ${ui.card}`}>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{st.id}</span>
                              <span className={`text-[10px] font-semibold ${ui.muted}`}>{st.part}</span>
                              <span className="font-bold">{st.title}</span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${ui.muted}`}>{st.example}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>

                  {/* Interactive Editor + Frame Injector + Live Cliché Detector */}
                  <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">Пиши эссе здесь</span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={essayStats.words >= 250 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {essayStats.words}/250 слов
                        </span>
                        <span className={ui.muted}>• {essayStats.paragraphs} абз.</span>
                      </div>
                    </div>

                    {/* 1-Tap Frame Injector */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {STARTER_FRAMES.map((f) => (
                        <button
                          key={f.label}
                          onClick={() => insertFrame(f.text)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${ui.pill}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={editorRef}
                      rows={8}
                      value={data.writingDraft}
                      onChange={(e) => setData((d) => ({ ...d, writingDraft: e.target.value }))}
                      placeholder="Пиши свой Task 2 здесь — детектор клише и грамматики работает в реальном времени..."
                      className={`w-full rounded-xl border p-3 text-xs leading-relaxed focus:outline-none ${ui.input}`}
                    />

                    {/* Live Diagnostics */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasNounClause ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasNounClause ? '✓' : '○'} Noun Clause
                      </span>
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasInversion ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasInversion ? '✓' : '○'} Inversion
                      </span>
                      <span className={`px-2 py-1 rounded-md ${essayStats.hasConcession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                        {essayStats.hasConcession ? '✓' : '○'} Concession
                      </span>
                    </div>

                    {essayStats.clichésFound.length > 0 && (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Найдены клише (режут балл):
                        </div>
                        {essayStats.clichésFound.map((c) => (
                          <div key={c.bad} className="text-[11px] leading-snug">
                            <span className="text-rose-400 font-bold">"{c.bad}"</span> → <span className="text-emerald-400">{c.fix}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={runGeminiWritingCheck}
                      disabled={aiLoading}
                      className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${ui.btnPrimary} disabled:opacity-50`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiLoading
                        ? 'Gemini Examiner проверяет...'
                        : data.apiKey
                        ? 'Проверить через Gemini 2.5 Examiner'
                        : 'Подключить бесплатный Gemini API для проверки'}
                    </button>

                    {aiError && <div className="text-xs text-rose-400">{aiError}</div>}

                    {aiReport && (
                      <div className={`rounded-xl border p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${ui.cardSub}`}>
                        {aiReport}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {wSub === 'task1' && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {TASK1_TYPES.map((t, i) => (
                      <button
                        key={t.name}
                        onClick={() => setT1Idx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          i === t1Idx ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                    <h3 className="text-sm font-extrabold">{TASK1_TYPES[t1Idx].name} — Формула 8 предложений</h3>
                    <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${ui.cardSub}`}>
                      <div><b>P1 (1 предл.):</b> Перефраз условия ("The chart compares...").</div>
                      <div><b>P2 — Overview (2 предл., БЕЗ цифр!):</b> <i>"{TASK1_TYPES[t1Idx].overview}"</i></div>
                      <div><b>P3 & P4 (по 2–3 предл.):</b> Группируй по смыслу (лидеры vs отстающие, растущие vs падающие).</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Словарь Band 8</div>
                      {TASK1_TYPES[t1Idx].vocab.map((v) => (
                        <div key={v} className="text-xs">• {v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wSub === 'grammar' && (
                <div className="space-y-3">
                  {GRAMMAR_WEAPONS.map((g) => (
                    <div key={g.name} className={`rounded-2xl border p-4 space-y-2 ${ui.card}`}>
                      <h3 className="text-sm font-extrabold">{g.name}</h3>
                      <div className={`font-mono text-[11px] rounded-xl border px-3 py-2 ${ui.cardSub}`}>{g.formula}</div>
                      <div className="text-xs text-rose-400"><b>Band 6:</b> {g.bad}</div>
                      <div className="text-xs text-emerald-400"><b>Band 8:</b> {g.good}</div>
                    </div>
                  ))}
                </div>
              )}

              {wSub === 'check' && (
                <div className={`rounded-2xl border p-4 space-y-2.5 ${ui.card}`}>
                  <h3 className="text-sm font-bold">Чек-лист перед сдачей эссе</h3>
                  {WRITING_CHECKLIST.map((c) => {
                    const checked = !!data.writingChecklist[c.id];
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            writingChecklist: { ...d.writingChecklist, [c.id]: !checked }
                          }))
                        }
                        className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 ${ui.cardSub}`}
                      >
                        <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          checked ? 'bg-emerald-400 text-zinc-950' : 'border border-zinc-500'
                        }`}>
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className={`text-xs leading-relaxed ${checked ? 'line-through opacity-50' : ''}`}>
                          <b className="font-mono text-[10px] mr-1">[{c.crit}]</b> {c.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: EXAM TIMERS & L/R/S PLAYBOOK ==================== */}
          {tab === 'skills' && (
            <div className="space-y-4">
              {/* Exam Split Timers */}
              <div className={`rounded-2xl border p-4 space-y-3.5 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Экзаменационные таймеры</span>
                    <h2 className="text-sm font-extrabold mt-0.5">{timerConfigs[timerMode].label}</h2>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${ui.cardSub}`}>
                    {timerConfigs[timerMode].phases[timerPhase].name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'reading', label: 'Reading 15/20/25' },
                    { id: 'writing', label: 'Writing 20/40' },
                    { id: 'speaking', label: 'Speaking 1+2' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => selectTimerMode(m.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                        timerMode === m.id ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className={`rounded-2xl border py-6 text-center ${ui.cardSub}`}>
                  <div className="font-mono text-5xl font-extrabold tracking-tight">{formatSec(secondsLeft)}</div>
                  <div className={`text-[11px] ${ui.muted} mt-1.5`}>
                    Со звуковым сигналом при переходе между частями
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerRunning((r) => !r)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${ui.btnPrimary}`}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт таймера'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className={`px-4 py-3 rounded-xl border ${ui.pill}`}
                    aria-label="Сброс таймера"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* L/R/S Tactics */}
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['reading', 'listening', 'speaking']).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybookTab(s)}
                      className={`py-2 rounded-xl text-xs font-bold border capitalize ${
                        playbookTab === s ? ui.btnPrimary : ui.pill
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {SKILL_PLAYBOOKS[playbookTab].map((b) => (
                    <div key={b.title} className={`rounded-xl border p-3.5 space-y-2 ${ui.cardSub}`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{b.tag}</span>
                        <h3 className="text-xs font-extrabold mt-0.5">{b.title}</h3>
                      </div>
                      <div className="space-y-1.5">
                        {b.items.map((it, idx) => (
                          <div key={idx} className="text-xs leading-relaxed">• {it}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {playbookTab === 'speaking' && (
                  <div className={`rounded-xl border p-3.5 space-y-2.5 ${ui.cardSub}`}>
                    <div className="text-xs font-bold">Проверка ответа Speaking через Gemini</div>
                    <textarea
                      rows={3}
                      value={speakingText}
                      onChange={(e) => setSpeakingText(e.target.value)}
                      placeholder="Вставь или продиктуй свой ответ Part 2 / Part 3..."
                      className={`w-full rounded-xl border p-2.5 text-xs ${ui.input}`}
                    />
                    <button
                      onClick={runGeminiSpeakingCheck}
                      disabled={speakingLoading}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold ${ui.btnPrimary}`}
                    >
                      {speakingLoading ? 'Проверяю...' : 'Оценить и сделать натуральный Band 8'}
                    </button>
                    {speakingFeedback && (
                      <div className={`p-3 rounded-xl border text-xs whitespace-pre-wrap leading-relaxed ${ui.card}`}>
                        {speakingFeedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: 46+ MEDIA HUB ==================== */}
          {tab === 'media' && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 space-y-3 ${ui.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold">Медиатека ({MEDIA_DB.length} источников)</h2>
                    <p className={`text-xs ${ui.muted}`}>Netflix, HBO, аниме, кино, спорт, книги, эссе, YouTube</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold text-amber-400 ${ui.pill}`}>
                    ★ {data.savedMedia.length}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mediaQuery}
                    onChange={(e) => setMediaQuery(e.target.value)}
                    placeholder="Поиск (Netflix, Anime, Sapiens, Football...)"
                    className={`w-full rounded-xl border pl-8 pr-3 py-2 text-xs ${ui.input}`}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((it) => {
                    const on = selectedInterests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        onClick={() =>
                          setSelectedInterests((prev) =>
                            on ? prev.filter((x) => x !== it.id) : [...prev, it.id]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          on ? ui.btnPrimary : ui.pill
                        }`}
                      >
                        {it.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {[
                    { id: 'all', label: 'Всё' },
                    { id: 'listening', label: 'Listening' },
                    { id: 'reading', label: 'Reading' },
                    { id: 'writing', label: 'Writing идеи' },
                    { id: 'speaking', label: 'Speaking' },
                    { id: 'saved', label: '★ Сохранённые' }
                  ].map((sk) => (
                    <button
                      key={sk.id}
                      onClick={() => setMediaSkill(sk.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        mediaSkill === sk.id ? ui.btnPrimary : ui.cardSub
                      }`}
                    >
                      {sk.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredMedia.map((m) => {
                  const saved = data.savedMedia.includes(m.id);
                  return (
                    <div key={m.id} className={`rounded-2xl border p-4 space-y-2 ${ui.card}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ui.btnPrimary}`}>{m.plat}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">Band {m.band}</span>
                          </div>
                          <h3 className="text-sm font-bold mt-1">{m.title}</h3>
                        </div>
                        <button
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              savedMedia: saved
                                ? d.savedMedia.filter((x) => x !== m.id)
                                : [...d.savedMedia, m.id]
                            }))
                          }
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                            saved ? 'bg-amber-400/20 border-amber-400/40 text-amber-400' : ui.pill
                          }`}
                          aria-label="Сохранить"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={`text-xs leading-relaxed ${ui.muted}`}>{m.why}</p>
                      <div className={`rounded-xl border p-2.5 space-y-1 text-[11px] ${ui.cardSub}`}>
                        {m.take.map((t) => <div key={t}>• {t}</div>)}
                      </div>
                      {m.url && (
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-4">
                          Открыть <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Dock */}
        <nav className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] z-40 border rounded-2xl p-1.5 grid grid-cols-4 gap-1 ${ui.dock}`}>
          {[
            { id: 'plan', label: 'План 28д', Icon: CalendarCheck },
            { id: 'writing', label: 'Writing', Icon: PenLine },
            { id: 'skills', label: 'Таймеры', Icon: Timer },
            { id: 'media', label: 'Медиа', Icon: Clapperboard }
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition ${
                tab === id ? ui.navActive : ui.muted
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold mt-1">{label}</span>
            </button>
          ))}
        </nav>

        {/* Log Mock Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-4">
            <div className={`w-full max-w-[400px] rounded-3xl border p-5 space-y-4 ${ui.card}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Записать результат мока</h3>
                <button onClick={() => setShowLogModal(false)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ui.pill}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'l', label: 'Listening' },
                  { k: 'r', label: 'Reading' },
                  { k: 'w', label: 'Writing' },
                  { k: 's', label: 'Speaking' }
                ].map(({ k, label }) => (
                  <div key={k}>
                    <label className={`text-[11px] font-semibold ${ui.muted}`}>{label}</label>
                    <select
                      value={logForm[k]}
                      onChange={(e) => setLogForm((f) => ({ ...f, [k]: e.target.value }))}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs font-mono font-bold ${ui.input}`}
                    >
                      {bandOptions.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className={`text-[11px] font-semibold ${ui.muted}`}>Главная ошибка в этом моке (в Error Wall)</label>
                <select
                  value={logForm.errorTag}
                  onChange={(e) => setLogForm((f) => ({ ...f, errorTag: e.target.value }))}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
                >
                  <option value="">— Не указывать —</option>
                  {ERROR_TYPES.map((err) => <option key={err} value={err}>{err}</option>)}
                </select>
              </div>
              <input
                type="text"
                value={logForm.note}
                onChange={(e) => setLogForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Короткая заметка (необязательно)"
                className={`w-full rounded-xl border px-3 py-2 text-xs ${ui.input}`}
              />
              <button onClick={handleSaveMock} className={`w-full py-3 rounded-xl text-xs font-bold ${ui.btnPrimary}`}>
                Сохранить результат
              </button>
            </div>
          </div>
        )}

        {/* Settings / Gemini API Key Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-4">
            <div className={`w-full max-w-[400px] rounded-3xl border p-5 space-y-4 ${ui.card}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Живой Gemini API Examiner</h3>
                <button onClick={() => setShowSettings(false)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${ui.pill}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-xs leading-relaxed ${ui.muted}`}>
                Вставь бесплатный ключ с{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                  Google AI Studio
                </a>
                . Ключ хранится только в памяти твоего браузера и включает настоящую проверку Writing и Speaking через Gemini 2.5 Flash.
              </p>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full rounded-xl border px-3 py-2.5 text-xs font-mono ${ui.input}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setData((d) => ({ ...d, apiKey: keyInput.trim() }));
                    setShowSettings(false);
                    notify(keyInput.trim() ? 'Gemini API ключ сохранён!' : 'Ключ очищен');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${ui.btnPrimary}`}
                >
                  Сохранить ключ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-xl ${ui.btnPrimary}`}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
