import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

export async function generateSpeechAudio(text: string, voiceName: string = "Kore") {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash-lite-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text,
            speechMetadata: {
              style: "Warm, respectful, articulate, professional, celebratory Arabic medical announcer",
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  const audioBase64 = part?.inlineData?.data;
  const mimeType = part?.inlineData?.mimeType || "audio/wav";

  if (!audioBase64) {
    throw new Error("No audio returned from Gemini TTS.");
  }

  return { audioBase64, mimeType };
}

export async function polishAnnouncementScript(topicOrDraft: string, targetDuration: number = 30) {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `أنت خبير تسويق طبي وإعلانات فيديو لمعامل RT الطبية (RT LAB).
المطلوب صياغة نص إعلاني صوتي جذاب واحترافي باللغة العربية الفصحى المبسطة أو اللهجة المصرية المهذبة الراقية جداً.
البيانات الأساسية الإلزامية:
1. تحية كريمة لعملاء معامل RT.
2. الاحتفال بمرور 21 عاماً (واحد وعشرون عاماً) على تأسيس معامل RT.
3. هدية عيد الميلاد: خصم يصل إلى 90% على جميع التحاليل الطبية.
4. أرقام التواصل والحجز: 01100874444 و 01100046841.
المدة المستهدفة: حوالي ${targetDuration} ثانية.

أعطني النتيجة بتنسيق JSON حصراً:
{
  "title": "عنوان الإعلان",
  "fullScript": "النص الكامل المقروء بالصوت",
  "scenes": [
    {
      "id": 1,
      "title": "عنوان المشهد",
      "speech": "الجملة المقروءة في هذا المشهد",
      "displayHeadline": "المانشيت البصري المعروض على الشاشة",
      "displaySub": "نص فرعي توضيحي",
      "duration": 6
    }
  ],
  "callToAction": "نص الختام للحجز والتواصل"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: topicOrDraft ? `${prompt}\n\nملاحظات إضافية من المستخدم:\n${topicOrDraft}` : prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
