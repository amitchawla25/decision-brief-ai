'use client';

  import { useState, FormEvent, useRef, useEffect } from 'react';
  import { extractTextFromFile, formatFileSize, isValidFileType } from '@/lib/documentParser';
  import { parseBrief } from '@/lib/briefParser';
  import BriefSection from '@/components/BriefSection';
  import FeedbackButton from '@/components/FeedbackButton';
  import { SAMPLE_TRANSCRIPT, SAMPLE_BRIEF, SAMPLE_LENS } from '@/lib/sampleBrief';
  import Link from 'next/link';

  function cleanMarkdown(text: string) {
    return text
      .replace(/\*\*/g, '')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^- \s*/gm, '')
      .replace(/\*\s*/gm, '');
  }

  type ExecLens = 'Product' | 'Revenue' | 'Ops' | 'Customer' | 'Risk';

  type QAItem = {
    role: 'user' | 'assistant';
    content: string;
  };

  type SavedBrief = {
    id: string;
    title: string;
    content: string;
    brief: string;
    lens: ExecLens;
    qa: QAItem[];
    timestamp: number;
  };

  export default function AppPage() {
    const [content, setContent] = useState('');
    const [lens, setLens] = useState<ExecLens>('Product');
    const [brief, setBrief] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // UI state
    const [showInputPanel, setShowInputPanel] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([]);

    // File upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isParsingFile, setIsParsingFile] = useState(false);
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Follow-up state
    const [question, setQuestion] = useState('');
    const [qa, setQa] = useState<QAItem[]>([]);
    const [isFollowupLoading, setIsFollowupLoading] = useState(false);
    const qaEndRef = useRef<HTMLDivElement>(null);

    // Share state
    const [isSharing, setIsSharing] = useState(false);
    const [shareMsg, setShareMsg] = useState('');

    // Load saved briefs from localStorage on mount
    useEffect(() => {
      const saved = localStorage.getItem('savedBriefs');
      if (saved) {
        try {
          setSavedBriefs(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved briefs:', e);
        }
      }
    }, []);

    // Auto-scroll to latest Q&A
    useEffect(() => {
      qaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [qa]);

    // Deep link from the landing page ("See a sample brief") loads the demo.
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('sample') === '1') {
        loadSample();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show a fully-formed brief instantly, with no API call, so a first-time
    // visitor sees real output before doing any work of their own.
    function loadSample() {
      setErrorMsg('');
      setQa([]);
      setContent(SAMPLE_TRANSCRIPT);
      setLens(SAMPLE_LENS);
      setBrief(SAMPLE_BRIEF);
      setShowInputPanel(false);
    }

    // Save brief to localStorage. Takes the text explicitly because the `brief`
    // state variable is still the previous value when this runs right after
    // generation.
    function saveBriefToHistory(sourceContent: string, briefText: string) {
      const title =
        sourceContent.slice(0, 60) + (sourceContent.length > 60 ? '...' : '');
      const newBrief: SavedBrief = {
        id: Date.now().toString(),
        title,
        content: sourceContent,
        brief: briefText,
        lens,
        qa: [],
        timestamp: Date.now(),
      };

      const updated = [newBrief, ...savedBriefs].slice(0, 20); // Keep last 20
      setSavedBriefs(updated);
      localStorage.setItem('savedBriefs', JSON.stringify(updated));
    }

    // Load a saved brief
    function loadBrief(saved: SavedBrief) {
      setContent(saved.content);
      setBrief(saved.brief);
      setLens(saved.lens);
      setQa(saved.qa);
      setShowInputPanel(false);
      setShowHistory(false);
    }

    // Delete a saved brief
    function deleteBrief(id: string) {
      const updated = savedBriefs.filter(b => b.id !== id);
      setSavedBriefs(updated);
      localStorage.setItem('savedBriefs', JSON.stringify(updated));
    }

    // Clear all history
    function clearHistory() {
      if (confirm('Are you sure you want to clear all saved briefs?')) {
        setSavedBriefs([]);
        localStorage.removeItem('savedBriefs');
      }
    }

    async function handleFileUpload(file: File) {
      setFileError('');

      if (!isValidFileType(file)) {
        setFileError('Please upload a PDF, DOCX, or TXT file.');
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError('File is too large. Maximum size is 10MB.');
        return;
      }

      setIsParsingFile(true);
      setUploadedFile(file);

      try {
        const extractedText = await extractTextFromFile(file);
        setContent(extractedText);
        setFileError('');
      } catch (error) {
        console.error('Error parsing file:', error);
        setFileError('Failed to parse document. Please try again.');
        setUploadedFile(null);
      } finally {
        setIsParsingFile(false);
      }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    }

    function handleRemoveFile() {
      setUploadedFile(null);
      setContent('');
      setFileError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();

      const trimmed = content.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setErrorMsg('');
      setBrief('');
      setQa([]);
      setShowInputPanel(false);

      try {
        const res = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ content: trimmed, lens }),
});

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setErrorMsg(data?.error || 'Error generating brief');
          setIsLoading(false);
          return;
        }

        const generatedBrief = data?.brief || '';

        if (!generatedBrief) {
          setErrorMsg('The AI returned an empty brief. Please try again.');
          return;
        }

        setBrief(generatedBrief);
        saveBriefToHistory(trimmed, generatedBrief);
      } catch (err) {
        setErrorMsg('Network error');
      } finally {
        setIsLoading(false);
      }
    }

    async function handleFollowup() {
      if (!question.trim() || !brief || !content) return;

      setIsFollowupLoading(true);

      try {
        const res = await fetch('/api/followup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-app-token': process.env.NEXT_PUBLIC_APP_TOKEN as string,
  },
  body: JSON.stringify({
    notes: content,
    summary: brief,
    question,
    history: qa,
  }),
});
        const data = await res.json().catch(() => null);

        if (data?.error) {
          setQa([...qa, { role: 'user', content: question }, { role: 'assistant', content: data.error }]);
        } else {
          setQa([
            ...qa,
            { role: 'user', content: question },
            { role: 'assistant', content: data.answer },
          ]);
        }

        setQuestion('');
      } catch (err) {
        setQa([
          ...qa,
          { role: 'user', content: question },
          { role: 'assistant', content: 'Network error' },
        ]);
      } finally {
        setIsFollowupLoading(false);
      }
    }

    function handleNewBrief() {
      setBrief('');
      setQa([]);
      setContent('');
      setUploadedFile(null);
      setErrorMsg('');
      setShareMsg('');
      setShowInputPanel(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    // Persist the current brief server-side and copy a public link to it.
    async function handleShare() {
      if (!brief || isSharing) return;

      setIsSharing(true);
      setShareMsg('');

      try {
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, lens }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.id) {
          setShareMsg(
            data?.error || 'Could not create a share link. Please try again.'
          );
          return;
        }

        const url = `${window.location.origin}/b/${data.id}`;
        try {
          await navigator.clipboard.writeText(url);
          setShareMsg('Link copied — anyone with it can view this brief.');
        } catch {
          // Clipboard can be blocked; still surface the URL so it's usable.
          setShareMsg(`Public link (anyone with it can view): ${url}`);
        }
      } catch {
        setShareMsg('Network error creating share link.');
      } finally {
        setIsSharing(false);
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
              Decision Brief AI
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History ({savedBriefs.length})
              </button>
              {brief && (
                <button
                  onClick={handleNewBrief}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + New Brief
                </button>
              )}
              <Link 
                href="/" 
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>
        </header>

        {/* History Sidebar */}
        {showHistory && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowHistory(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Saved Briefs</h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {savedBriefs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm">No saved briefs yet</p>
                </div>
              ) : (
                <>
                  <div className="p-4 space-y-2">
                    {savedBriefs.map((saved) => (
                      <div
                        key={saved.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer group"
                      >
                        <div onClick={() => loadBrief(saved)}>
                          <p className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">
                            {saved.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {new Date(saved.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {saved.lens}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBrief(saved.id);
                          }}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
                    <button
                      onClick={clearHistory}
                      className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Clear All History
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Input Panel */}
          {showInputPanel ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Generate Decision Brief</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Paste your meeting transcript, PRD, or strategy doc to extract clear decisions and next actions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Analysis Lens
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={lens}
                    onChange={(e) => setLens(e.target.value as ExecLens)}
                    disabled={isLoading || isParsingFile}
                  >
                    <option value="Product">Product - Features, roadmap, user experience</option>
                    <option value="Revenue">Revenue - Growth, monetization, sales</option>
                    <option value="Ops">Ops - Efficiency, processes, resources</option>
                    <option value="Customer">Customer - Satisfaction, retention, feedback</option>
                    <option value="Risk">Risk - Security, compliance, threats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Document (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        disabled={isLoading || isParsingFile}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg 
  hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 
  3m3-3v12" />
                        </svg>
                        {isParsingFile ? 'Processing...' : 'Choose File'}
                      </span>
                    </label>

                    {uploadedFile && (
                      <div className="flex-1 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 
  5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-slate-700 truncate font-medium">
                            {uploadedFile.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({formatFileSize(uploadedFile.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="ml-3 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  {fileError && <p className="text-sm text-red-600 mt-2">{fileError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Paste Content
                  </label>
                  <textarea
                    className="w-full h-48 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 
  focus:border-transparent resize-none"
                    placeholder="Paste your meeting transcript (Zoom, Meet, Teams), PRD, strategy memo, or Slack thread here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading || isParsingFile}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Tip: The more context you provide, the better the decision analysis.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
                  <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={loadSample}
                    disabled={isLoading || isParsingFile}
                    className="px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ✨ Try a sample
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors shadow-lg hover:shadow-xl"
                    disabled={isLoading || isParsingFile || !content.trim()}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 
  7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Decision Brief →'
                    )}
                  </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowInputPanel(true)}
              className="w-full mb-8 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-400
  hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              📄 Edit input or create new brief
            </button>
          )}

          {/* Error banner. Lives outside the input panel because the panel is
              collapsed on submit, which would otherwise hide the reason the
              brief never appeared. */}
          {errorMsg && !isLoading && (
            <div
              role="alert"
              className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6"
            >
              <p className="text-sm font-semibold text-red-800 mb-1">
                Couldn&apos;t generate your brief
              </p>
              <p className="text-sm text-red-700">{errorMsg}</p>
              <button
                onClick={() => setShowInputPanel(true)}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
              >
                Edit input and try again
              </button>
            </div>
          )}

          {/* Output Section */}
          {!brief && !isLoading && !showInputPanel && !errorMsg && (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-slate-500 text-lg font-medium mb-2">No brief generated yet</p>
              <button
                onClick={() => setShowInputPanel(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first brief →
              </button>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 mb-1">
                    Analyzing through {lens} lens...
                  </p>
                  <p className="text-sm text-slate-600">
                    Extracting decisions, options, and recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && brief && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">Decision Brief</h2>
                  <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                    {lens} Lens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {isSharing ? 'Creating link…' : 'Share'}
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => navigator.clipboard.writeText(brief)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy All
                  </button>
                </div>
              </div>

              {shareMsg && (
                <div className="mb-4 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 break-words">
                  {shareMsg}
                </div>
              )}

              <div className="space-y-4">
                {parseBrief(brief).map((section, index) => (
                  <BriefSection 
                    key={section.id} 
                    section={section} 
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {brief && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Follow-up Discussion</h3>

              {/* Q&A Thread */}
              {qa.length > 0 && (
                <div className="space-y-3 mb-4">
                  {qa.map((entry, i) => (
                    <div
                      key={i}
                      className={`rounded-xl shadow-sm border p-5 ${
                        entry.role === 'user'
                          ? 'bg-white border-slate-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          entry.role === 'user' 
                            ? 'bg-slate-100' 
                            : 'bg-blue-100'
                        }`}>
                          {entry.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {entry.role === 'user' ? 'You' : 'Decision Analyst'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {cleanMarkdown(entry.content)}
                      </p>
                    </div>
                  ))}
                  <div ref={qaEndRef} />
                </div>
              )}

              {/* Input at Bottom */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 
  focus:border-transparent"
                    placeholder="Ask a follow-up question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFollowup()}
                    disabled={isFollowupLoading}
                  />
                  <button
                    onClick={handleFollowup}
                    className="px-6 py-3 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    disabled={isFollowupLoading || !question.trim()}
                  >
                    {isFollowupLoading ? 'Thinking...' : 'Ask'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ask about risks, decision makers, timelines, or clarify any section
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Feedback Button */}
        <FeedbackButton />
      </div>
    );
  }
