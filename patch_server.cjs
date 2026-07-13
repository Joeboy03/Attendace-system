const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const aiImport = 'import { GoogleGenAI } from "@google/genai";\n';
content = aiImport + content;

const aiRoute = `
  app.post("/api/ai/predict", async (req, res) => {
    try {
      const { attendanceHistory, studentInfo } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
         return res.json({ prediction: "AI predictions are disabled (API key missing). Please contact the administrator to enable." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Calculate some summary stats for the AI to understand better
      const totalClasses = attendanceHistory.length;
      let prompt = \`You are an AI academic advisor for a student at the University of Benin.
Student Name: \${studentInfo.full_name || 'Student'}
Level: \${studentInfo.level || 'N/A'}
Department: \${studentInfo.department || 'N/A'}

The student has a record of \${totalClasses} recent attendance events.
Here is the raw attendance data: \${JSON.stringify(attendanceHistory.slice(0, 10))}

Provide a very short (2-3 sentences max) encouraging insight, prediction about their academic trajectory, or piece of advice based on this attendance data. Use an academic, motivating, and personalized tone. Do not use markdown formatting.\`;

      if (totalClasses === 0) {
        prompt = \`You are an AI academic advisor for a student at the University of Benin. Name: \${studentInfo.full_name}. They have not attended any classes yet. Give them a 2-sentence encouraging welcome message to start attending classes regularly to build a good academic standing.\`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      res.json({ prediction: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });
`;

content = content.replace(
  '  // --- API Routes ---',
  '  // --- API Routes ---\n' + aiRoute
);

fs.writeFileSync('server.ts', content);
