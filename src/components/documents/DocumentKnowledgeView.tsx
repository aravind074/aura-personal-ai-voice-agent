import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Layers,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  FileCheck2,
  Trash2,
  Check,
  FolderOpen
} from 'lucide-react';
import { DocumentItem } from '../../types/index.js';

interface DocumentKnowledgeViewProps {
  documents: DocumentItem[];
  onUploadDocument: (doc: { name: string; content: string; type: string }) => void;
  onTriggerVoice: (cmd: string) => void;
}

export const DocumentKnowledgeView: React.FC<DocumentKnowledgeViewProps> = ({
  documents,
  onUploadDocument,
  onTriggerVoice,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadType, setUploadType] = useState('pdf');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSimulatedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const q = searchQuery.toLowerCase();
    const hits: any[] = [];
    documents.forEach((d) => {
      d.chunks?.forEach((c) => {
        if (c.text.toLowerCase().includes(q) || q.split(' ').some((w) => w.length > 3 && c.text.toLowerCase().includes(w))) {
          hits.push({
            docName: d.name,
            section: c.pageOrSection,
            snippet: c.text,
          });
        }
      });
    });
    setSearchResults(hits);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    setUploadType(ext);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadContent(text || '');
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    onUploadDocument({
      name: uploadName.trim(),
      content: uploadContent.trim() || 'Uploaded document text and research specifications.',
      type: uploadType,
    });

    setUploadName('');
    setUploadContent('');
    setShowUploadForm(false);
  };

  const getDocIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      default:
        return <FileCode className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Knowledge Base & RAG Index</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Uploaded PDFs, CSVs, and documents are chunked and indexed for instant AI semantic retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerVoice('Summarize my project report')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-300 cursor-pointer transition-colors"
          >
            "Summarize report"
          </button>
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Semantic Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <form onSubmit={handleSimulatedSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all document chunks (e.g. methodology, revenue, safety)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors"
          >
            Search Chunks
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults !== null && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Found {searchResults.length} matching semantic chunks</span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
            {searchResults.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-cyan-300 mb-1">
                  <span>{r.docName}</span>
                  <span className="text-slate-500 text-[10px]">{r.section}</span>
                </div>
                <p className="text-slate-300">{r.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Library and Chunk Inspector */}
      {documents.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No documents uploaded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload your PDFs, Word documents, spreadsheets, or notes to build a real semantic knowledge index for Aura.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Document List */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Uploaded Files ({documents.length})
            </h2>
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/60 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex-shrink-0">
                        {getDocIcon(doc.type)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{doc.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {doc.chunkCount} semantic chunks • {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Chunk & Summary Inspector */}
          <div className="md:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
            {selectedDoc ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedDoc.name}</h3>
                    <p className="text-xs text-slate-400">
                      Uploaded on {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onTriggerVoice(`Summarize ${selectedDoc.name}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/30 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Aura to Summarize</span>
                  </button>
                </div>

                {selectedDoc.summary && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      AI Executive Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedDoc.summary}</p>
                  </div>
                )}

                {/* Chunks List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Indexed Vector Chunks ({selectedDoc.chunks?.length || 0})
                  </h4>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {selectedDoc.chunks?.map((chunk, idx) => (
                      <div
                        key={chunk.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mb-1">
                          <span>Chunk #{idx + 1}</span>
                          <span>{chunk.pageOrSection}</span>
                        </div>
                        <p className="text-slate-300 font-normal leading-relaxed">{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">Select a document to inspect chunks</div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal with File Picker */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Upload Knowledge Document</h2>
            <p className="text-xs text-slate-400 mb-4">
              Select a local file or paste document text. Aura will extract, chunk, and index the content for AI RAG retrieval.
            </p>

            {/* Quick File Select Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 mb-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/60 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
            >
              <FolderOpen className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
              <p className="text-xs font-semibold text-slate-300">Click to choose a file from device</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports .pdf, .docx, .txt, .csv, .md, .xlsx</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv,.md,.xlsx,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. AI_Ethics_Guidelines_2026.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="md">Markdown (.md)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Content (Raw Text / Paragraphs)
                </label>
                <textarea
                  rows={4}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste or review text contents here. Paragraphs separated by blank lines will be indexed as separate chunks."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Process & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
