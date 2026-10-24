import React, { useEffect, useRef } from "react";
import { VideoScene, AspectRatio } from "../types/scene";
import { studioAudio } from "../audio/audioEngine";

interface CanvasRendererProps {
  currentScene: VideoScene;
  sceneProgress: number; // 0.0 to 1.0
  totalProgress: number; // 0.0 to 1.0
  currentTime: number;
  totalDuration: number;
  aspectRatio: AspectRatio;
  isPlaying: boolean;
  isVoiceActive: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  currentScene,
  sceneProgress,
  currentTime,
  totalDuration,
  aspectRatio,
  isPlaying,
  isVoiceActive,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(32));

  // Canvas dimensions based on aspect ratio
  const getDimensions = () => {
    switch (aspectRatio) {
      case "9:16":
        return { width: 1080, height: 1920 };
      case "1:1":
        return { width: 1080, height: 1080 };
      case "16:9":
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const { width, height } = getDimensions();

  // Initialize celebratory particles
  useEffect(() => {
    const count = 45;
    const colors = ["#f43f5e", "#fb7185", "#facc15", "#38bdf8", "#ffffff", "#fed7aa"];
    const pts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 3,
        speedY: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 3,
      });
    }
    particlesRef.current = pts;
  }, [width, height]);

  // Preload images into cache
  useEffect(() => {
    const urls = [
      "./assets/aistudio/IMG_20261024_095029_246_b7abdac4.jpg",
      "./assets/aistudio/IMG_20261024_094906_069_9b5d947e.jpg",
      "./assets/aistudio/IMG_20261024_095022_303_91099514.jpg",
      "./assets/aistudio/IMG_20261024_095029_576_cbc318b7.jpg",
      "./assets/aistudio/IMG_20261024_095022_746_25e09e09.jpg",
      currentScene.imageSrc,
    ];

    urls.forEach((url) => {
      if (url && !imageCache.current.has(url)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          imageCache.current.set(url, img);
        };
      }
    });
  }, [currentScene.imageSrc]);

  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      // 1. Clear background
      ctx.clearRect(0, 0, width, height);

      // 2. Draw Luxurious Gradient Background (Burgundy RT LAB theme)
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      bgGrad.addColorStop(0, "#2a0815");
      bgGrad.addColorStop(0.5, "#14020a");
      bgGrad.addColorStop(1, "#090105");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle decorative medical hexagonal grid in the background
      ctx.save();
      ctx.strokeStyle = "rgba(244, 63, 94, 0.04)";
      ctx.lineWidth = 1.5;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Floating Celebratory Particles & Confetti
      ctx.save();
      particlesRef.current.forEach((p) => {
        if (isPlaying) {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotSpeed;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });
      ctx.restore();

      // 4. Header Bar: RT LAB Official Branding
      const isVertical = aspectRatio === "9:16";
      const headerY = isVertical ? 90 : 70;

      ctx.save();
      // Glowing top accent line
      const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
      lineGrad.addColorStop(0, "transparent");
      lineGrad.addColorStop(0.3, "#f43f5e");
      lineGrad.addColorStop(0.5, "#fbbf24");
      lineGrad.addColorStop(0.7, "#f43f5e");
      lineGrad.addColorStop(1, "transparent");
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, 0, width, 6);

      // RT LAB Flask Logo & Name
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${isVertical ? "38px" : "32px"} 'Cairo', sans-serif`;
      ctx.textAlign = "right";

      // Draw emblem badge on right
      const emblemX = width - (isVertical ? 60 : 80);
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(emblemX, headerY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Flask icon inside emblem
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 22px 'Cairo', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("RT", emblemX, headerY);

      // Brand Title Text
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 ${isVertical ? "32px" : "28px"} 'Cairo', sans-serif`;
      ctx.fillText("معامل RT للتحاليل الطبية", emblemX - 42, headerY - 5);

      ctx.fillStyle = "#fb7185";
      ctx.font = `600 ${isVertical ? "20px" : "18px"} 'Readex Pro', sans-serif`;
      ctx.fillText("RT Medical Laboratories • دقة وثقة", emblemX - 42, headerY + 22);

      // 21st Anniversary Badge on Left
      const badgeX = isVertical ? 60 : 80;
      ctx.textAlign = "left";
      ctx.fillStyle = "#fbbf24";
      ctx.font = `bold ${isVertical ? "26px" : "22px"} 'Cairo', sans-serif`;
      ctx.fillText("★ 21st ANNIVERSARY ★", badgeX, headerY - 4);

      ctx.fillStyle = "#fef08a";
      ctx.font = `600 ${isVertical ? "20px" : "16px"} 'Cairo', sans-serif`;
      ctx.fillText("21 عاماً من الريادة (2005 - 2026)", badgeX, headerY + 20);
      ctx.restore();

      // 5. Draw Scene Main Content & Visuals
      const img = imageCache.current.get(currentScene.imageSrc);

      if (isVertical) {
        // Vertical 9:16 layout (Reels / Shorts / Status)
        renderVerticalLayout(ctx, currentScene, img, width, height, sceneProgress, isVoiceActive);
      } else {
        // Landscape 16:9 or Square 1:1 layout
        renderLandscapeLayout(ctx, currentScene, img, width, height, sceneProgress, isVoiceActive, aspectRatio);
      }

      // 6. Subtitle / Karaoke Captions bar at bottom
      renderCaptionsBar(ctx, currentScene.narrationScript, width, height, isVertical, isVoiceActive, sceneProgress);

      // 7. Live Sound Visualizer at bottom border
      renderAudioWaveform(ctx, width, height);

      // 8. Progress Bar at bottom
      const progressPercent = (currentTime / totalDuration) || 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, height - 10, width, 10);
      const progGrad = ctx.createLinearGradient(0, 0, width, 0);
      progGrad.addColorStop(0, "#e11d48");
      progGrad.addColorStop(0.5, "#fbbf24");
      progGrad.addColorStop(1, "#38bdf8");
      ctx.fillStyle = progGrad;
      ctx.fillRect(0, height - 10, width * progressPercent, 10);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentScene, sceneProgress, currentTime, totalDuration, aspectRatio, isPlaying, isVoiceActive, width, height]);

  // Helper: Draw Landscape Layout (16:9 / 1:1)
  const renderLandscapeLayout = (
    ctx: CanvasRenderingContext2D,
    scene: VideoScene,
    img: HTMLImageElement | undefined,
    w: number,
    h: number,
    progress: number,
    isVoice: boolean,
    ratio: AspectRatio
  ) => {
    const isSquare = ratio === "1:1";
    const contentY = isSquare ? 160 : 180;
    const contentH = h - contentY - 140;

    // Split layout: Image on Left, Rich Text & Badges on Right (RTL)
    const imgColWidth = isSquare ? w * 0.45 : w * 0.44;
    const textColWidth = w - imgColWidth - (isSquare ? 120 : 160);
    const textX = w - (isSquare ? 60 : 80);

    // 1. Draw Image with Gentle Ken Burns Zoom & Rounded Card Frame
    const imgX = isSquare ? 50 : 70;
    const imgY = contentY + 20;
    const imgW = imgColWidth;
    const imgH = contentH - 40;

    ctx.save();
    // Glowing border for image
    ctx.shadowColor = scene.accentColor || "#f43f5e";
    ctx.shadowBlur = isVoice ? 35 : 20;
    ctx.fillStyle = "#1e1b4b";
    roundRect(ctx, imgX, imgY, imgW, imgH, 24);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clip image
    ctx.save();
    roundRect(ctx, imgX, imgY, imgW, imgH, 24);
    ctx.clip();

    if (img && img.complete) {
      // Zoom animation: 1.0 -> 1.08 over scene duration
      const zoom = 1.0 + progress * 0.08;
      const nw = imgW * zoom;
      const nh = imgH * zoom;
      const ox = (nw - imgW) / 2;
      const oy = (nh - imgH) / 2;

      ctx.drawImage(img, imgX - ox, imgY - oy, nw, nh);

      // Vignette overlay
      const imgGrad = ctx.createLinearGradient(imgX, imgY, imgX, imgY + imgH);
      imgGrad.addColorStop(0, "rgba(0,0,0,0.1)");
      imgGrad.addColorStop(0.7, "transparent");
      imgGrad.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = imgGrad;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    } else {
      // Placeholder while loading
      ctx.fillStyle = "#312e81";
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }
    ctx.restore();

    // Frame stroke
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 3;
    roundRect(ctx, imgX, imgY, imgW, imgH, 24);
    ctx.stroke();

    // 2. Big Animated Special Badges (like 90% Discount in Scene 3)
    if (scene.id === "scene-3") {
      drawDiscountBadge(ctx, imgX + imgW / 2, imgY + imgH / 2, progress, isVoice);
    }
    ctx.restore();

    // 2. Draw Text Content Column (Right Side - RTL)
    ctx.save();
    ctx.textAlign = "right";

    // Category / Milestone Tag
    const tagY = contentY + 50;
    const tagText = scene.badge || "معامل RT الطبية";
    ctx.font = "bold 20px 'Readex Pro', sans-serif";
    const tagMetrics = ctx.measureText(tagText);
    const tagW = tagMetrics.width + 36;
    const tagH = 40;

    ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 1.5;
    roundRect(ctx, textX - tagW, tagY - 28, tagW, tagH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fecdd3";
    ctx.fillText(tagText, textX - 18, tagY);

    // Headline with glowing gradient
    const headY = tagY + 70;
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${isSquare ? "42px" : "48px"} 'Cairo', sans-serif`;
    wrapText(ctx, scene.headline, textX, headY, textColWidth, isSquare ? 52 : 62);

    // Subheadline
    const subY = headY + (scene.headline.length > 30 ? 120 : 75);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = `500 ${isSquare ? "22px" : "24px"} 'Cairo', sans-serif`;
    wrapText(ctx, scene.subheadline, textX, subY, textColWidth, 36);

    // Special Features Box / Callouts
    const boxY = subY + 95;
    if (scene.id === "scene-5" || scene.callToActions?.phones) {
      drawContactCard(ctx, textX, boxY, textColWidth, scene.callToActions?.phones || ["01100874444", "01100046841"]);
    } else if (scene.id === "scene-2") {
      drawAnniversaryCard(ctx, textX, boxY, textColWidth);
    } else {
      drawFeatureHighlights(ctx, textX, boxY, textColWidth, scene.id);
    }

    ctx.restore();
  };

  // Helper: Draw Vertical Layout (9:16 Reels / Status)
  const renderVerticalLayout = (
    ctx: CanvasRenderingContext2D,
    scene: VideoScene,
    img: HTMLImageElement | undefined,
    w: number,
    h: number,
    progress: number,
    isVoice: boolean
  ) => {
    // 1. Image on Upper-Middle (Hero Focus)
    const imgW = w - 120;
    const imgH = h * 0.44;
    const imgX = 60;
    const imgY = 200;

    ctx.save();
    ctx.shadowColor = scene.accentColor || "#f43f5e";
    ctx.shadowBlur = isVoice ? 40 : 25;
    ctx.fillStyle = "#1e1b4b";
    roundRect(ctx, imgX, imgY, imgW, imgH, 32);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.save();
    roundRect(ctx, imgX, imgY, imgW, imgH, 32);
    ctx.clip();

    if (img && img.complete) {
      const zoom = 1.0 + progress * 0.08;
      const nw = imgW * zoom;
      const nh = imgH * zoom;
      const ox = (nw - imgW) / 2;
      const oy = (nh - imgH) / 2;
      ctx.drawImage(img, imgX - ox, imgY - oy, nw, nh);

      // Vignette
      const grad = ctx.createLinearGradient(imgX, imgY + imgH * 0.6, imgX, imgY + imgH);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4;
    roundRect(ctx, imgX, imgY, imgW, imgH, 32);
    ctx.stroke();

    if (scene.id === "scene-3") {
      drawDiscountBadge(ctx, imgX + imgW / 2, imgY + imgH / 2, progress, isVoice);
    }
    ctx.restore();

    // 2. Text on Lower Section
    ctx.save();
    ctx.textAlign = "right";
    const textX = w - 70;
    const textY = imgY + imgH + 60;

    // Badge
    const tagText = scene.badge || "معامل RT الطبية";
    ctx.font = "bold 24px 'Readex Pro', sans-serif";
    const tagW = ctx.measureText(tagText).width + 40;
    ctx.fillStyle = "rgba(225, 29, 72, 0.3)";
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 2;
    roundRect(ctx, textX - tagW, textY - 32, tagW, 46, 23);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fecdd3";
    ctx.fillText(tagText, textX - 20, textY);

    // Headline
    const headY = textY + 80;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px 'Cairo', sans-serif";
    wrapText(ctx, scene.headline, textX, headY, w - 140, 68);

    // Subheadline
    const subY = headY + 160;
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "500 30px 'Cairo', sans-serif";
    wrapText(ctx, scene.subheadline, textX, subY, w - 140, 44);

    // Quick Contact Info on vertical screen
    const cardY = subY + 120;
    if (scene.id === "scene-5" || scene.callToActions?.phones) {
      drawContactCard(ctx, textX, cardY, w - 140, scene.callToActions?.phones || ["01100874444", "01100046841"]);
    } else {
      drawFeatureHighlights(ctx, textX, cardY, w - 140, scene.id);
    }

    ctx.restore();
  };

  // Helper: Draw 90% Discount Badge
  const drawDiscountBadge = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    isVoice: boolean
  ) => {
    ctx.save();
    const pulse = 1.0 + Math.sin(progress * Math.PI * 4) * 0.05 + (isVoice ? 0.05 : 0);
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);

    // Glowing circle
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 40;
    const radGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 140);
    radGrad.addColorStop(0, "#fbbf24");
    radGrad.addColorStop(0.7, "#dc2626");
    radGrad.addColorStop(1, "#991b1b");
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 125, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Text: خصم يصل إلى 90%
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px 'Cairo', sans-serif";
    ctx.fillText("خصم يصل إلى", 0, -50);

    ctx.fillStyle = "#fef08a";
    ctx.font = "900 82px 'Cairo', sans-serif";
    ctx.fillText("90%", 0, 15);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Cairo', sans-serif";
    ctx.fillText("هدية عيد الميلاد", 0, 75);

    ctx.restore();
  };

  // Helper: Draw Contact Card with both phone numbers
  const drawContactCard = (
    ctx: CanvasRenderingContext2D,
    rightX: number,
    y: number,
    boxW: number,
    phones: string[]
  ) => {
    ctx.save();
    const boxH = 140;
    const startX = rightX - boxW;

    // Card background
    const cardGrad = ctx.createLinearGradient(startX, y, startX + boxW, y);
    cardGrad.addColorStop(0, "rgba(16, 185, 129, 0.2)");
    cardGrad.addColorStop(1, "rgba(6, 95, 70, 0.35)");
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    roundRect(ctx, startX, y, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    // Call icon & label
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "bold 22px 'Cairo', sans-serif";
    ctx.fillText("📞 أرقام الحجز والاستفسار وخدمة السحب المنزلي:", rightX - 25, y + 36);

    // Phones
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 32px 'Readex Pro', sans-serif";
    const phone1 = phones[0] || "01100874444";
    const phone2 = phones[1] || "01100046841";
    ctx.fillText(`${phone1}  •  ${phone2}`, rightX - 25, y + 84);

    ctx.fillStyle = "#a7f3d0";
    ctx.font = "600 18px 'Cairo', sans-serif";
    ctx.fillText("خدمة متواصلة على مدار الساعة • نتائج دقيقة وفورية", rightX - 25, y + 118);

    ctx.restore();
  };

  // Helper: Draw 21st Anniversary Milestone Card
  const drawAnniversaryCard = (
    ctx: CanvasRenderingContext2D,
    rightX: number,
    y: number,
    boxW: number
  ) => {
    ctx.save();
    const boxH = 135;
    const startX = rightX - boxW;

    const cardGrad = ctx.createLinearGradient(startX, y, startX + boxW, y);
    cardGrad.addColorStop(0, "rgba(234, 179, 8, 0.15)");
    cardGrad.addColorStop(1, "rgba(161, 98, 7, 0.3)");
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    roundRect(ctx, startX, y, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 22px 'Cairo', sans-serif";
    ctx.fillText("🏆 مسيرة 21 عاماً من الثقة والمصداقية (2005 - 2026)", rightX - 25, y + 36);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px 'Cairo', sans-serif";
    ctx.fillText("• معامل RT صرح طبي متكامل يخدم آلاف العملاء سنوياً", rightX - 25, y + 74);
    ctx.fillText("• اعتمادات دولية وأدق الأجهزة الطبية في مصر والشرق الأوسط", rightX - 25, y + 106);

    ctx.restore();
  };

  // Helper: Feature Highlights Card
  const drawFeatureHighlights = (
    ctx: CanvasRenderingContext2D,
    rightX: number,
    y: number,
    boxW: number,
    sceneId: string
  ) => {
    ctx.save();
    const boxH = 130;
    const startX = rightX - boxW;

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, startX, y, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 20px 'Cairo', sans-serif";

    if (sceneId === "scene-1") {
      ctx.fillText("✨ أهلاً بكم في عائلة معامل RT", rightX - 25, y + 36);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "500 19px 'Cairo', sans-serif";
      ctx.fillText("• صحتك هي رأس مالك.. وفحصك الدوري حماية لأسرتك", rightX - 25, y + 72);
      ctx.fillText("• بيئة مريحة وتعامل راقٍ بأعلى درجات الاهتمام الشخصي", rightX - 25, y + 104);
    } else {
      ctx.fillText("🔬 تقنيات معملية متطورة", rightX - 25, y + 36);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "500 19px 'Cairo', sans-serif";
      ctx.fillText("• سحب عينات دقيق وغير مؤلم لجميع الأعمار والأطفال", rightX - 25, y + 72);
      ctx.fillText("• تقارير طبية شاملة ومفصلة مع متابعة استشارية", rightX - 25, y + 104);
    }

    ctx.restore();
  };

  // Helper: Draw Captions with synchronized word-by-word highlight and large crystal-clear typography
  const renderCaptionsBar = (
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    isVertical: boolean,
    isVoice: boolean,
    progress: number
  ) => {
    if (!text) return;
    ctx.save();

    const barH = isVertical ? 150 : 115;
    const barY = h - barH - 24;
    const barW = w - (isVertical ? 40 : 100);
    const barX = (w - barW) / 2;

    // Glowing background box with luxury glassmorphism
    ctx.shadowColor = isVoice ? "rgba(244, 63, 94, 0.4)" : "transparent";
    ctx.shadowBlur = 25;
    const barGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    barGrad.addColorStop(0, "rgba(20, 2, 10, 0.94)");
    barGrad.addColorStop(1, "rgba(8, 1, 4, 0.98)");
    ctx.fillStyle = barGrad;
    ctx.strokeStyle = isVoice ? "#fbbf24" : "rgba(244, 63, 94, 0.4)";
    ctx.lineWidth = isVoice ? 3.5 : 2;
    roundRect(ctx, barX, barY, barW, barH, 24);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Badge: "صوت الإلقاء الرسمي • معامل RT"
    ctx.textAlign = "right";
    ctx.fillStyle = isVoice ? "#fbbf24" : "#fb7185";
    ctx.font = `bold ${isVertical ? "20px" : "18px"} 'Cairo', sans-serif`;
    ctx.fillText("🎙️ التعليق الصوتي الرسمي المباشر • معامل RT", barX + barW - 35, barY + 30);

    // Synchronized Karaoke Words
    const words = text.split(" ");
    const currentWordIndex = Math.min(
      words.length - 1,
      Math.floor(progress * (words.length + 1))
    );

    const fontSize = isVertical ? 38 : 34;
    ctx.font = `800 ${fontSize}px 'Cairo', sans-serif`;
    ctx.direction = "rtl";

    // Split words into lines that fit inside barW - 70
    const maxLineW = barW - 80;
    const lines: { text: string; words: { word: string; isSpoken: boolean }[] }[] = [];
    let currentLineWords: { word: string; isSpoken: boolean }[] = [];
    let currentLineStr = "";

    words.forEach((wrd, idx) => {
      const testStr = currentLineStr ? currentLineStr + " " + wrd : wrd;
      const testMetrics = ctx.measureText(testStr);

      if (testMetrics.width > maxLineW && currentLineWords.length > 0) {
        lines.push({ text: currentLineStr, words: currentLineWords });
        currentLineWords = [{ word: wrd, isSpoken: idx <= currentWordIndex }];
        currentLineStr = wrd;
      } else {
        currentLineWords.push({ word: wrd, isSpoken: idx <= currentWordIndex });
        currentLineStr = testStr;
      }
    });
    if (currentLineWords.length > 0) {
      lines.push({ text: currentLineStr, words: currentLineWords });
    }

    // Render lines (up to 2 lines)
    const lineHeight = fontSize + 10;
    const startY = barY + 70;

    lines.slice(0, 2).forEach((lineObj, lineIdx) => {
      const lineY = startY + lineIdx * lineHeight;
      const totalLineWidth = ctx.measureText(lineObj.text).width;
      let curX = (w + totalLineWidth) / 2; // RTL starting from right side of the centered block

      ctx.textAlign = "right";
      lineObj.words.forEach((item) => {
        const itemWidth = ctx.measureText(item.word + " ").width;

        if (item.isSpoken) {
          // Highlighted spoken word: glowing gold
          ctx.fillStyle = "#facc15";
          ctx.shadowColor = "#facc15";
          ctx.shadowBlur = 10;
        } else {
          // Upcoming word: crisp clean white
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 0;
        }

        ctx.fillText(item.word, curX, lineY);
        ctx.shadowBlur = 0;
        curX -= itemWidth;
      });
    });

    ctx.restore();
  };

  // Helper: Draw Live Audio Waveform at bottom edge
  const renderAudioWaveform = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    studioAudio.getFrequencyData(freqDataRef.current);
    const data = freqDataRef.current;

    ctx.save();
    const barCount = 32;
    const barW = (w / barCount) * 0.75;
    const gap = (w / barCount) * 0.25;

    for (let i = 0; i < barCount; i++) {
      const val = data[i] || 0;
      const barH = Math.max(3, (val / 255) * 45);
      const x = i * (barW + gap) + gap / 2;
      const y = h - 14 - barH;

      ctx.fillStyle = val > 120 ? "#fb7185" : "rgba(244, 63, 94, 0.4)";
      ctx.fillRect(x, y, barW, barH);
    }
    ctx.restore();
  };

  // Utility: Rounded Rectangle
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Utility: Wrap Text
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, curY);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/90 rounded-2xl shadow-2xl border border-slate-800">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full max-h-full object-contain rounded-xl select-none"
      />
    </div>
  );
};
