// App.jsx
import { useState, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import Tesseract from "tesseract.js";
import axios from "axios";
import "./App.css";

GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.7.107/build/pdf.worker.min.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState(null); 
  const [status, setStatus] = useState("idle"); // idle | extracting | summarizing | done | error
  const [ocrProgress, setOcrProgress] = useState(0);
  const [length, setLength] = useState("short");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  function humanStatus() {
    if (status === "idle") return "Ready";
    if (status === "extracting")
      return `Extracting text${ocrProgress ? ` — OCR ${ocrProgress}%` : "..."}`;
    if (status === "summarizing") return "Generating summary...";
    if (status === "done") return "Done";
    if (status === "error") return "Error";
    return "";
  }

  function handlePick(e) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setExtractedText("");
      setSummary(null);
      setError("");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setFile(f);
      setExtractedText("");
      setSummary(null);
      setError("");
    }
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  async function extractTextFromFile(f) {
    if (!f) throw new Error("No file provided");
    if (f.size > MAX_FILE_SIZE)
      throw new Error(`File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB)`);

    const name = f.name.toLowerCase();

    if (name.endsWith(".pdf")) {
      // PDF extraction
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items || [];

        // Group by approximate Y coordinate to preserve lines
        const lines = [];
        let currentY = null;
        let currentLine = [];
        for (const it of items) {
          const y = it.transform?.[5] ?? null;
          if (currentY === null) {
            currentY = y;
            currentLine.push(it.str);
          } else if (y !== null && Math.abs(y - currentY) > 5) {
            lines.push(currentLine.join(" "));
            currentLine = [it.str];
            currentY = y;
          } else {
            currentLine.push(it.str);
          }
        }
        if (currentLine.length) lines.push(currentLine.join(" "));
        const pageText = lines.join("\n");
        fullText += pageText + "\n\n";
      }
      return fullText.trim();
    } else {
      // Image OCR
      const { data } = await Tesseract.recognize(f, "eng", {
        logger: (m) => {
          if (
            m &&
            m.status === "recognizing text" &&
            typeof m.progress === "number"
          ) {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      return data.text.trim();
    }
  }

  async function onSummarizeClick() {
    setError("");
    setSummary(null);

    if (!file) {
      setError("Please choose a PDF or image file first.");
      return;
    }

    try {
      setStatus("extracting");
      setOcrProgress(0);
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length === 0) {
        throw new Error("No text could be extracted from the document.");
      }
      setExtractedText(text);

      setStatus("summarizing");
//      const endpoint = "http://localhost:3000/ai/get-review";

// const resp = await axios.post(
//   endpoint,
//   { text: text, length: length }, // ✅ make sure both keys are explicit
//   {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     timeout: 120000,
//   }
// );



      const endpoint = "/ai/get-review";

const resp = await axios.post(
  endpoint,
  { text, length },
  {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 120000,
  }
);


      
     // const resp = await axios.post(endpoint, payload, { timeout: 120000 });

      const data = resp.data;
      const out =
        typeof data === "string"
          ? { text: data, highlights: [] }
          : {
              text:
                data.text ??
                data.summary ??
                JSON.stringify(data),
              highlights: data.highlights ?? [],
            };

      setSummary(out);
      setStatus("done");
    } catch (err) {
      console.error("Summarize error:", err);

      // Prefer server error message
      const serverMsg =
        err?.response?.data?.error ??
        err?.response?.data ??
        (err?.response ? JSON.stringify(err.response.data) : null);

      const userMsg =
        typeof serverMsg === "string"
          ? serverMsg
          : err.message || "Something went wrong";

      setError(userMsg);
      setStatus("error");
    } finally {
      setOcrProgress(0);
    }
  }

  return (
    <div className="ds-app">
      <header className="ds-header">
        <div>
          <h1>Document Summary Assistant</h1>
          <p className="muted">
            Upload a PDF or scanned image → click Summarize to extract &
            summarize.
          </p>
        </div>
        <div className={`status-badge ${status}`}>{humanStatus()}</div>
      </header>

      <main className="ds-main">
        <section
          className="card upload-card"
          onDrop={handleDrop}
          onDragOver={onDragOver}
        >
          <div className="upload-top">
            <div
              className="drop-area"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handlePick}
                style={{ display: "none" }}
              />
              <div className="icon">📄</div>
              <div>
                <div className="drop-title">
                  {file ? file.name : "Click or drag & drop a file"}
                </div>
                <div className="muted small">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    : "PDF or image (jpg, png, tiff)"}
                </div>
              </div>
            </div>

            <div className="controls">
              <label className="select-wrap">
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </label>

              <button
                className="primary"
                onClick={onSummarizeClick}
                disabled={status === "extracting" || status === "summarizing"}
              >
                {status === "extracting"
                  ? "Extracting..."
                  : status === "summarizing"
                  ? "Summarizing..."
                  : "Summarize"}
              </button>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="extracted-preview">
            <h4>Extracted Text</h4>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={8}
              placeholder="Extracted text will appear here after extraction..."
            />
            <div className="hint muted">
              You can edit the extracted text before summarizing if needed.
            </div>
          </div>
        </section>

        <section className="card result-card">
          <h3>Summary</h3>

          {status === "idle" && (
            <div className="muted">
              No summary yet — choose a file and click Summarize.
            </div>
          )}

          {status === "extracting" && (
            <div className="muted">
              Extracting... {ocrProgress ? `OCR ${ocrProgress}%` : ""}
            </div>
          )}

          {status === "summarizing" && (
            <div className="muted">Generating summary…</div>
          )}

          {summary && (
            <div className="summary-block">
              <div className="summary-text">{summary.text}</div>

              {summary.highlights && summary.highlights.length ? (
                <>
                  <h5>Highlights</h5>
                  <ul>
                    {summary.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          )}

          {status === "done" && !summary && (
            <div className="muted">No summary produced.</div>
          )}
        </section>
      </main>

      <footer className="ds-footer">
        <small>
           @Created by Piyush Kumar as Unthinkable Assignment.....
        </small>
      </footer>
    </div>
  );
}
