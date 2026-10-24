import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { execSync } from "child_process";

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
    id: "scene-1",
    // Scene 1: Warm greeting
    text: "أهلاً وسهلاً بكم، تحية إعزاز وتقدير لعملائنا الكرام، شركاء الثقة والصحة في معامل رامي مختار RT.",
  },
  {
    id: "scene-2",
    // Scene 2: 21st Anniversary
    text: "بمناسبة مرور واحد وعشرين عاماً على إنشاء معامل رامي مختار، نحتفل معكم بعيد ميلادنا الحادي والعشرين.",
  },
  {
    id: "scene-3",
    // Scene 3: Discount offer (Requested: ونقدم لعملائنا الكرام خصم...)
    text: "ونقدم لعملائنا الكرام خصم يصل إلى تسعين بالمئة على جميع التحاليل والفحوصات الطبية، هدية خاصة وحصرية لفترة محدودة!",
  },
  {
    id: "scene-4",
    // Scene 4: Lab & Accuracy
    text: "نضمن لكم أعلى معايير الجودة والدقة الطبية بأحدث أجهزة التحاليل مع فريق طبي متكامل وخدمة سحب منزلي مريحة.",
  },
  {
    id: "scene-5",
    // Scene 5: Contact, clear pronunciation for second phone 01100046841, and ending: معامل رامي مختار تتمنى لكم
    text: "للتواصل والحجز والاستفسار اتصلوا بنا الآن على: 01100874444، أو: صفر، أحد عشر، ثلاثة أصفار، ستة وأربعون، ثمانمائة وواحد وأربعون.. معامل رامي مختار تتمنى لكم دوام الصحة والعافية.",
  },
];

async function main() {
  const outDir = path.resolve(process.cwd(), "public/assets/audio");
  fs.mkdirSync(outDir, { recursive: true });

  console.log("Generating audio for updated scenes...");
  const durations: number[] = [];

  for (const scene of scenesData) {
    const filePath = path.join(outDir, `${scene.id}.wav`);
    console.log(`Generating TTS for ${scene.id}...`);

    let attempts = 0;
    let success = false;
    while (attempts < 3 && !success) {
      attempts++;
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
          success = true;
        }
      } catch (e: any) {
        console.warn(`Attempt ${attempts} failed for ${scene.id}: ${e?.message}`);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }

    // Probe duration using ffprobe
    const durStr = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    )
      .toString()
      .trim();
    const dur = parseFloat(durStr);
    durations.push(dur);
    console.log(`${scene.id} duration: ${dur.toFixed(2)}s`);

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("Concatenating into full_voice.wav...");
  // Use ffmpeg concat filter to merge scene-1 to scene-5 cleanly
  const filterInputs = scenesData.map((_, i) => `[${i}:a]`).join("");
  const inputArgs = scenesData.map((s) => `-i "${path.join(outDir, s.id + ".wav")}"`).join(" ");
  const fullVoicePath = path.join(outDir, "full_voice.wav");

  execSync(
    `ffmpeg -y ${inputArgs} -filter_complex "${filterInputs}concat=n=${scenesData.length}:v=0:a=1[out]" -map "[out]" "${fullVoicePath}"`,
    { stdio: "inherit" }
  );

  const fullDurStr = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullVoicePath}"`
  )
    .toString()
    .trim();
  const totalVoiceDuration = parseFloat(fullDurStr);
  console.log(`full_voice.wav created! Total duration: ${totalVoiceDuration.toFixed(2)}s`);

  // Output scene durations summary for updating defaultScenes.ts
  fs.writeFileSync(
    path.join(process.cwd(), "scripts/durations.json"),
    JSON.stringify({ durations, totalVoiceDuration }, null, 2)
  );
  console.log("Durations saved to scripts/durations.json");
}

main().catch((err) => {
  console.error("Error generating updated audio:", err);
  process.exit(1);
});
