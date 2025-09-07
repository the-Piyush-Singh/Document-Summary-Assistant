____________________________________________________________________________________________________________________
|                                                                                                                   |
|                                                                                                                   |
|                The app is live at: [https://document-summary-assistant-adfc.onrender.com]                         |
|                                                                                                                   |
|__________________________________________________________________________________________________________________ |


# Document Summary Assistant

An AI-powered web application that allows users to upload **PDFs** or **image files** (scanned documents), extract text, and generate **smart summaries** using the Gemini API.  

---

##  Features
- **Document Upload**
  - Upload PDFs or image files (drag-and-drop or file picker).
- **Text Extraction**
  - PDF parsing with `pdfjs-dist`.
  - OCR for scanned images using `Tesseract.js`.
- **Summary Generation**
  - Smart summaries generated via **Gemini API**.
  - Options for summary length (short, medium, long).
  - Highlights key points and main ideas.
- **UI/UX**
  - Simple, responsive interface.
  - Loading indicators & error handling.
- **Deployment**
  - Hosted on [Render].

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **APIs/Libraries:** 
  - Gemini API (for summaries)  
  - pdfjs-dist (PDF parsing)  
  - Tesseract.js (OCR for images)  
  - Axios (API requests)  

---
🌍 Deployment

The app is live at: [https://document-summary-assistant-adfc.onrender.com]

📖 API Endpoints

POST /api/summarize
Request:

{
  "text": "Document text here",
  "length": "short | medium | long"
}


Response:

{
  "summary": "Generated summary text"
}

---

The goal was to build a simple yet powerful document summarization tool. I started by enabling document uploads with
support for PDFs and image files.
For text extraction, I used pdfjs-dist to parse PDF files and Tesseract.js for OCR on scanned images. Once text was extracted, 
I integrated the Gemini API to generate summaries.
The app provides options for summary length (short, medium, long), ensuring flexibility depending on user needs.

For the frontend, I built a React application with a clean, responsive UI that supports drag-and-drop uploads, 
displays extracted text, and shows summaries in real time. Loading states and error handling were added for better UX.
A minimal Express backend was created to securely handle API requests to Gemini. The app is hosted on [Netlify/Vercel/Render] for easy access.

The focus was on clarity, modular code structure, and user experience within the time limit. Overall, 
the project demonstrates the use of OCR, PDF parsing, and AI summarization in a cohesive solution.



