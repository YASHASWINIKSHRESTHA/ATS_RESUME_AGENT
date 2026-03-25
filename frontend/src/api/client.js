import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * Submit resume + JD for analysis.
 * @param {Object} params
 * @param {File|null}   params.resumeFile
 * @param {string|null} params.resumeText
 * @param {string}      params.jdInput
 * @param {Function}    params.onProgress  – called with 0–100
 */
export async function analyzeResume({ resumeFile, resumeText, jdInput, onProgress }) {
  const formData = new FormData()

  if (resumeFile) {
    formData.append('resume_file', resumeFile)
  } else if (resumeText) {
    formData.append('resume_text', resumeText)
  }

  formData.append('jd_input', jdInput)

  const response = await axios.post(`${BASE_URL}/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
    timeout: 300_000, // 5 minutes
  })

  return response.data
}

/**
 * Save a LaTeX string to the server and return download URL.
 */
export async function saveLatex(latexContent) {
  const formData = new FormData()
  formData.append('latex_content', latexContent)
  const res = await axios.post(`${BASE_URL}/save-latex`, formData)
  return res.data.download_url
}

/**
 * Compile LaTeX → PDF via the backend and return a Blob.
 * The backend tries: pdflatex → YtoTech cloud → reportlab fallback.
 * @param {string} latexContent  – the full .tex source
 * @returns {Promise<Blob>}
 */
export async function compilePdf(latexContent) {
  const formData = new FormData()
  formData.append('latex_content', latexContent)
  const res = await axios.post(`${BASE_URL}/compile-pdf`, formData, {
    responseType: 'blob',
    timeout: 120_000, // 2 minutes (cloud compile can be slow)
  })
  return res.data
}

/**
 * Health check
 */
export async function checkHealth() {
  const res = await axios.get(`${BASE_URL}/health`, { timeout: 5000 })
  return res.data
}
