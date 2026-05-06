import { openrouter } from '../../config/ai.js';
import prisma from '../../lib/prisma.js';
import { downloadPDF } from '../../service/downloadPDFsaveRam.js';
import { extractText } from '../../config/pdf-parse.js';

export const sendMessageToAi = async (req, res) => {
  try {
    const { message } = req.body;
    const lang = req.query.lang || 'en';
    const id_file = Number(req.params.id_file);
    const file_upload = req.file;

    const langChoices = ['en', 'ar', 'fr'];

    if (!langChoices.includes(lang)) {
      return res.status(400).json({ error: 'Invalid language choice' });
    }

    if ((!file_upload && !id_file) || (file_upload && id_file)) {
      return res
        .status(400)
        .json({ error: 'Please provide an id_file or upload a file.' });
    }

    let buffer;

    // Check if the user uploaded a file directly (stored in RAM via multer)
    if (file_upload) {
      buffer = file_upload.buffer;
    } else if (id_file) {
      // Fallback: Fetch file path from database
      const fileExist = await prisma.files.findUnique({
        where: {
          id_file,
          status: 'accepted',
          file_reports: {
            none: { status: 'reviewed' },
          },
        },
      });

      if (!fileExist) {
        return res
          .status(404)
          .json({ error: 'File not found or not processed' });
      }

      // 1. Download PDF
      buffer = await downloadPDF(fileExist.file_path);
    } else {
      return res
        .status(400)
        .json({ error: 'Please provide an id_file or upload a file.' });
    }

    // 2. Extract text
    const text = await extractText(buffer);

    // 3. AI request
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-oss-120b:free',
        stream: true,
        messages: [
          {
            role: 'system',
            content: `
You are an AI assistant that answers questions based ONLY on the provided PDF content.

========================
OUTPUT RULES
========================
- Respond ONLY in MARKDOWN format
- No JSON
- No HTML
- Structured with headings and bullet points
-don't answer  outside the pdf content,if you don't know the answer say that you don't know the answer or that the answer is not in the pdf content
- NEVER use: tables, <table>, <tbody>, <tr>, <td>, <th>, <header>, <tfoot> - ONLY use headings, bold, and bullet points
========================
LANGUAGE ENFORCEMENT
========================
User language = ${lang}

RULES:
- If lang = "ar" → respond ONLY in Arabic (allow technical English terms like thread, mutex)
- If lang = "en" → respond ONLY in English
- If lang = "fr" → respond ONLY in French (allow technical English terms)

IMPORTANT:
- Do NOT mix languages
- Output must be consistent

========================
PDF CONTENT
========================
"""
${text}
"""
`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
    });

    // 4. Stream response
    let response = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) response += content;
    }

    // 5. LANGUAGE VALIDATION
    let isValid = true;

    if (lang === 'ar') {
      // Arabic check
      isValid = /[\u0600-\u06FF]/.test(response);
    }

    if (lang === 'en') {
      // Very rough English check (no Arabic characters)
      isValid = !/[\u0600-\u06FF]/.test(response);
    }

    if (lang === 'fr') {
      // French check (no Arabic, allow Latin)
      isValid = !/[\u0600-\u06FF]/.test(response);
    }

    // 6. AUTO FIX if invalid
    if (!isValid) {
      const fix = await openrouter.chat.send({
        chatRequest: {
          model: 'openai/gpt-oss-120b:free',
          stream: false,
          messages: [
            {
              role: 'system',
              content: `
Rewrite the following answer strictly in ${lang}.
- Keep Markdown format
- Do NOT change meaning
- Do NOT add extra information
- Ensure correct language only
`,
            },
            {
              role: 'user',
              content: response,
            },
          ],
        },
      });

      response = fix.choices[0]?.message?.content || response;
    }

    // 7. RETURN FINAL RESPONSE
    return res.status(200).json({
      message: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
