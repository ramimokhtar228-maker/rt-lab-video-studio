/**
 * Gemini Script Tuning Service for RT LAB Ad Studio
 */

export interface ScriptStyle {
  id: string;
  name: string;
  description: string;
  sampleHook: string;
}

export const SCRIPT_STYLES: ScriptStyle[] = [
  {
    id: 'exciting',
    name: 'تسويقي حماسي وتشويقي (موصى به)',
    description: 'أسلوب إعلاني مشوق يبرز المفاجأة وقوة الخصم وفرصة الحجز المسبق الفورية',
    sampleHook: 'صحتك وصحة عائلتك تستحق الأفضل.. مفاجأة كبرى قريباً من معامل RT LAB!',
  },
  {
    id: 'reassuring',
    name: 'طبي وقور ومطمئن',
    description: 'يركز على الاعتمادات الدولية، ودقة النتائج المؤتمتة، وأمان سحب العينات',
    sampleHook: 'معامل رامي مختار.. حين تجتمع أحدث تكنولوجيا التشخيص مع أقصى درجات الرعاية.',
  },
  {
    id: 'family',
    name: 'عائلي ودود ودافئ',
    description: 'يخاطب الأمهات والآباء بأسلوب رعاية دافئ لحماية صحة كل أفراد الأسرة',
    sampleHook: 'اطمئن على صحة من تحب.. 3 باقات فحص شامل صُممت لكل مرحلة عمرية في عائلتك.',
  },
  {
    id: 'reels',
    name: 'سريع وديناميكي للسوشيال ميديا (Reels & TikTok)',
    description: 'عبارات قصيرة، إيقاع سريع، دعوة قوية للحجز والاتصال الفوري',
    sampleHook: 'الفحص الشامل المخفض واصل! 3 باقات وخصومات تصل 55%.. احجز مكانك قبل الزحمة!',
  },
];

export async function generateRefinedAdScript(
  currentScript: string,
  style: string,
  sceneTitle: string
): Promise<string> {
  // If user calls Gemini, try to use API, or provide instant fallback
  try {
    const apiKey = (import.meta as unknown as { env: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت كاتب إعلانات طبية محترف لـ "معامل رامي مختار RT LAB".
المشهد: ${sceneTitle}
الأسلوب المطلوب: ${style}
النص الحالي: ${currentScript}
أعد صياغة هذا التعليق الصوتي ليكون جذاباً جداً باللغة العربية الفصحى المبسطة المشوقة، مدته بين 10 إلى 18 كلمة، مع ذكر اسم معامل رامي مختار أو RT LAB بشكل طبيعي وجذاب، وأرقام الحجز (01100874444 أو 01100046841) إذا كان المشهد متعلقاً بالحجز.
اكتب النص المعاد فقط بدون أي شروحات أو مقدمات.`,
      });
      if (response.text) {
        return response.text.trim();
      }
    }
  } catch (err) {
    console.warn('Gemini script generation fallback:', err);
  }

  // Preset smart transforms based on style
  if (style === 'reels') {
    return `قريباً في معامل رامي مختار RT LAB! الفحص الشامل المخفض بـ 3 باقات استثنائية تناسب كل الأعمار. احجز مكانك الآن ولا تفوّت الخصم!`;
  } else if (style === 'family') {
    return `صحة عائلتك في أيدٍ أمينة مع معامل رامي مختار RT LAB. 3 باقات فحص متكاملة مع سحب منزلي مجاني لكبار السن. احجز الآن على 01100874444.`;
  } else if (style === 'reassuring') {
    return `بأعلى معايير الدقة والاعتماد الدولي، معامل رامي مختار RT LAB تعلن عن قرب انطلاق الفحص الشامل المؤتمت بالكامل لجميع الفئات.`;
  }
  return currentScript;
}
