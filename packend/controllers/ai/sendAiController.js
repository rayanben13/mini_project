import { openrouter } from '../../config/ai.js';
import prisma from '../../lib/prisma.js';
import { downloadPDF } from '../../service/downloadPDFsaveRam.js';
import { extractText } from '../../config/pdf-parse.js';

const userFileCache = new Map();

export const sendMessageToAi = async (req, res) => {
  try {
    const userId = req.user.id_user;
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    const { message } = req.body;
    let history = [];
    if (req.body.history) {
      try {
        history = typeof req.body.history === 'string' ? JSON.parse(req.body.history) : req.body.history;
      } catch (e) {
        history = [];
      }
    }

    let lang = req.query.lang || 'en';
    const id_file = req.params.id_file ? Number(req.params.id_file) : null;
    const file_upload = req.file;

    // Normalizing the language query
    const normalized = String(lang).toLowerCase().trim();
    if (normalized === 'eng' || normalized === 'english' || normalized === 'en') {
      lang = 'en';
    } else if (normalized === 'fr' || normalized === 'french') {
      lang = 'fr';
    } else if (normalized === 'arbic' || normalized === 'arabic' || normalized === 'ar') {
      lang = 'ar';
    }

    const langChoices = ['en', 'ar', 'fr'];

    if (!langChoices.includes(lang)) {
      return res.status(400).json({ error: 'Invalid language choice' });
    }

    let text = '';
    const cachedData = userFileCache.get(userId);

    if (id_file) {
      if (cachedData && cachedData.id_file === id_file) {
        text = cachedData.text;
      } else {
        const fileExist = await prisma.files.findUnique({
          where: {
            id_file,
            status: 'accepted',
            file_reports: { none: { status: 'reviewed' } },
          },
        });
        if (!fileExist) {
          return res.status(404).json({ error: 'File not found or not processed' });
        }
        const buffer = await downloadPDF(fileExist.file_path);
        text = await extractText(buffer);
        userFileCache.set(userId, { text, id_file });
      }
    } else if (file_upload && file_upload.buffer.length > 0) {
      text = await extractText(file_upload.buffer);
      userFileCache.set(userId, { text, id_file: null });
    } else {
      if (cachedData && cachedData.text) {
        text = cachedData.text;
      } else {
        return res.status(400).json({ error: 'Please provide an id_file or upload a file first.' });
      }
    }

    const apiMessages = [
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
-Never use tables in any format (neither HTML <table> nor Markdown tables using | --- |). Use only paragraphs or bullet points.
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
    ];

    if (history && history.length > 0) {
      history.forEach((h) => {
        if (h.role === 'user' || h.role === 'ai' || h.role === 'assistant') {
          apiMessages.push({
            role: h.role === 'ai' ? 'assistant' : h.role,
            content: h.content,
          });
        }
      });
    }

    apiMessages.push({
      role: 'user',
      content: message,
    });

    // 3. AI request
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: 'openai/gpt-oss-120b:free',
        stream: true,
        messages: apiMessages,
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

export const activateLibraryDocument = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const id_file = req.params.id_file ? Number(req.params.id_file) : null;

    if (!id_file) {
      return res.status(400).json({ error: 'id_file parameter is required' });
    }

    const fileExist = await prisma.files.findUnique({
      where: {
        id_file,
        status: 'accepted',
        file_reports: { none: { status: 'reviewed' } },
      },
    });

    if (!fileExist) {
      return res.status(404).json({ error: 'File not found or not processed' });
    }

    const buffer = await downloadPDF(fileExist.file_path);
    const text = await extractText(buffer);
    userFileCache.set(userId, { text, id_file });

    return res.status(200).json({
      success: true,
      message: 'Document activated successfully in AI context',
      id_file,
      title: fileExist.title,
    });
  } catch (error) {
    console.error('activateLibraryDocument error:', error);
    return res.status(500).json({ error: 'Server error while activating document' });
  }
};

export const activateLocalDocument = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const file_upload = req.file;

    if (!file_upload || file_upload.buffer.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractText(file_upload.buffer);
    userFileCache.set(userId, { text, id_file: null });

    return res.status(200).json({
      success: true,
      message: 'Local document activated successfully in AI context',
    });
  } catch (error) {
    console.error('activateLocalDocument error:', error);
    return res.status(500).json({ error: 'Server error while parsing and activating local document' });
  }
};

