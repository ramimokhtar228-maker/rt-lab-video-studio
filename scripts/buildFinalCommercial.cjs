const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== Starting RT LAB Final Commercial Re-Rendering ===");

const scenes = [
  {
    id: "scene1",
    img: "public/assets/aistudio/IMG_20261024_095029_246_b7abdac4.jpg",
    dur: 11.88,
    badge: "معامل رامي مختار RT الطبية",
    title: "تحية تقدير وإعزاز لعملائنا الكرام",
    sub: "أنتم شركاء النجاح والصحة.. نسعد دائماً برعايتكم وخدمتكم الطبية",
    boxColor: "#4c0519@0.88",
    zoom: "min(zoom+0.0004,1.10)",
  },
  {
    id: "scene2",
    img: "public/assets/aistudio/IMG_20261024_094906_069_9b5d947e.jpg",
    dur: 13.00,
    badge: "2005 - 2026 • 21 عاماً من التميز والريادة",
    title: "بمناسبة مرور 21 عاماً على إنشاء معامل RT",
    sub: "تحتفل معامل رامي مختار بعيد ميلادها الحادي والعشرين معكم",
    boxColor: "#3b0717@0.88",
    zoom: "min(zoom+0.0003,1.10)",
  },
  {
    id: "scene3",
    img: "public/assets/aistudio/IMG_20261024_095022_303_91099514.jpg",
    dur: 14.08,
    badge: "هدية عيد الميلاد الـ 21 • خصم حتى 90%",
    title: "خصم يصل إلى 90% على جميع التحاليل الطبية",
    sub: "ونقدم لعملائنا الكرام خصم يصل إلى 90% على كافة التحاليل والفحوصات",
    boxColor: "#500724@0.88",
    zoom: "min(zoom+0.0004,1.10)",
  },
  {
    id: "scene4",
    img: "public/assets/aistudio/IMG_20261024_095029_576_cbc318b7.jpg",
    dur: 13.96,
    badge: "أدق نتائج مخبرية • أجهزة أوتوماتيكية متطورة",
    title: "أحدث التقنيات وأدق النتائج المخبرية",
    sub: "أعلى معايير الجودة الطبية وفريق متكامل وسحب منزلي مريح",
    boxColor: "#0f172a@0.88",
    zoom: "min(zoom+0.0003,1.10)",
  },
  {
    id: "scene5",
    img: "public/assets/aistudio/IMG_20261024_095022_746_25e09e09.jpg",
    dur: 27.60,
    badge: "فريق طبي استشاري • سحب منزلي مجاني فوري",
    title: "نخبة من الأطباء والاستشاريين في خدمتكم دائماً",
    sub: "للحجز: 01100874444 - 01100046841 • معامل رامي مختار تتمنى لكم دوام الصحة",
    boxColor: "#1e1b4b@0.88",
    zoom: "min(zoom+0.0002,1.08)",
  },
];

const tmpDir = "/tmp/rt_clips";
fs.mkdirSync(tmpDir, { recursive: true });

const fontPath = path.resolve("fonts/Cairo.ttf");

// Render each clip with zoompan + text overlays
scenes.forEach((sc, idx) => {
  const outClip = path.join(tmpDir, `${sc.id}.mp4`);
  console.log(`Rendering clip ${idx + 1}/5: ${sc.id} (duration ${sc.dur}s)...`);

  const fps = 25;
  const frames = Math.round(sc.dur * fps);

  // Filter chain
  const vf = [
    `scale=1920:1080:force_original_aspect_ratio=increase`,
    `crop=1920:1080`,
    `zoompan=z='${sc.zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=${fps}`,
    // Top header translucent dark bar
    `drawbox=x=0:y=0:w=1280:h=85:color=black@0.65:t=fill`,
    // Top glowing accent line
    `drawbox=x=0:y=83:w=1280:h=3:color=#f43f5e@0.9:t=fill`,
    // Top brand title
    `drawtext=fontfile=${fontPath}:text_shaping=1:text='معامل رامي مختار RT للتحاليل الطبية':fontcolor=white:fontsize=28:x=1280-text_w-60:y=24`,
    // Top anniversary badge
    `drawtext=fontfile=${fontPath}:text_shaping=1:text='★ 21st Anniversary ★ 2005 - 2026':fontcolor=#fbbf24:fontsize=22:x=60:y=28`,
    // Lower third card
    `drawbox=x=70:y=525:w=1140:h=150:color=${sc.boxColor}:t=fill`,
    // Lower third border accent
    `drawbox=x=70:y=525:w=1140:h=150:color=#fb7185@0.4:t=2`,
    // Scene badge pill
    `drawbox=x=1280-70-420:y=490:w=420:h=42:color=#e11d48:t=fill`,
    `drawtext=fontfile=${fontPath}:text_shaping=1:text='${sc.badge}':fontcolor=white:fontsize=18:x=1280-70-420+(420-text_w)/2:y=500`,
    // Scene title
    `drawtext=fontfile=${fontPath}:text_shaping=1:text='${sc.title}':fontcolor=white:fontsize=36:x=(1280-text_w)/2:y=545`,
    // Scene subtitle
    `drawtext=fontfile=${fontPath}:text_shaping=1:text='${sc.sub}':fontcolor=#fed7aa:fontsize=22:x=(1280-text_w)/2:y=610`
  ].join(",");

  const cmd = `ffmpeg -y -loop 1 -i "${sc.img}" -vf "${vf}" -t ${sc.dur} -c:v libx264 -pix_fmt yuv420p -r ${fps} "${outClip}"`;
  execSync(cmd, { stdio: "inherit" });
});

console.log("All individual clips rendered. Concatenating with concat filter...");

// Create concat list
const listFile = path.join(tmpDir, "clips.txt");
const listContent = scenes.map(sc => `file '${path.join(tmpDir, sc.id + ".mp4")}'`).join("\n");
fs.writeFileSync(listFile, listContent);

const concatenatedVideo = path.join(tmpDir, "visuals_full.mp4");
execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${concatenatedVideo}"`, { stdio: "inherit" });

console.log("Merging visuals with master soundtrack...");
const finalOutput = path.resolve("public/assets/video/rt_lab_21st_anniversary_promo.mp4");
fs.mkdirSync(path.dirname(finalOutput), { recursive: true });

const soundtrack = path.resolve("public/assets/audio/rt_lab_master_soundtrack.mp3");

execSync(
  `ffmpeg -y -i "${concatenatedVideo}" -i "${soundtrack}" -c:v copy -c:a aac -ar 44100 -b:a 192k -movflags +faststart -shortest "${finalOutput}"`,
  { stdio: "inherit" }
);

console.log(`=== Done! Final Promo Video written to: ${finalOutput} ===`);
