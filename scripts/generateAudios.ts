import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const scenesData = [
  {
    id: "scene-4",
    text: "نضمن لكم أعلى معايير الجودة والدقة الطبية بأحدث أجهزة التحاليل مع فريق طبي متكامل وخدمة سحب منزلي مريحة.",
  },
  {
    id: "scene-5",
    text: "للتواصل والحجز والاستفسار اتصلوا بنا الآن على 01100874444 أو 01100046841.. معامل آر تي تتمنى لكم دوام الصحة والعافية.",
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateRemaining() {
  const outDir = path.resolve(process.cwd(), "public/assets/audio");
  fs.mkdirSync(outDir, { recursive: true });

  for (const scene of scenesData) {
    const filePath = path.join(outDir, `${scene.id}.wav`);
    if (fs.existsSync(filePath)) {
      console.log(`${scene.id}.wav already exists, skipping.`);
      continue;
    }

    console.log(`Generating audio for ${scene.id}...`);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: scene.text,
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
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        const buffer = Buffer.from(audioBase64, "base64");
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved ${filePath} (${buffer.length} bytes)`);
      }
    } catch (e: any) {
      console.error(`Error generating ${scene.id}:`, e?.message || e);
    }

    console.log("Waiting 25 seconds before next request...");
    await sleep(25000);
  }
}

generateRemaining().then(() => console.log("Done generating remaining scene audios."));
