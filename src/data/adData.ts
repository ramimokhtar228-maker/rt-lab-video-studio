export interface AdScene {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  alt: string;
  duration: number; // in seconds
  voiceoverScript: string;
  highlightText: string;
  badge?: string;
  animationStyle: 'kenburns-1' | 'kenburns-2' | 'kenburns-3';
  accentColor: string;
}

export interface MedicalPackage {
  id: string;
  name: string;
  arabicName: string;
  targetAudience: string;
  badge: string;
  description: string;
  popularFor: string;
  discountPercentage: number;
  testsCount: string;
  keyTests: string[];
  recommendedAge: string;
  color: string;
}

export function getAsset(path: string): string {
  if (path.startsWith('/')) {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    return `${cleanBase}${path.slice(1)}`;
  }
  return path;
}

export const PHONE_NUMBERS = [
  { raw: '01100874444', formatted: '01100874444', waLink: 'https://wa.me/201100874444', telLink: 'tel:01100874444', label: 'الخط الساخن والحجز' },
  { raw: '01100046841', formatted: '01100046841', waLink: 'https://wa.me/201100046841', telLink: 'tel:01100046841', label: 'الاستفسارات وخدمة العملاء' },
];

export const GALLERY_IMAGES = [
  { path: getAsset('/assets/aistudio/file_00000000bc8c8210b6e1eb3de10c994e_c7f67e6f.png'), label: 'بوستر الفحص الشامل المخفض قريباً' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095029_582_eec715fc.jpg'), label: 'فريق الأطباء والكوادر الطبية المعتمدة' },
  { path: getAsset('/assets/aistudio/image_2a889329.jpg'), label: 'صالة الاستقبال الفندقية الراقية' },
  { path: getAsset('/assets/aistudio/grok_1793018169554_d31fcd7f.jpg'), label: 'مختبرات التحاليل الرقمية المؤتمتة' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095029_246_b7abdac4.jpg'), label: 'استقبال المرضى وخدمة العملاء المتميزة' },
  { path: getAsset('/assets/aistudio/grok_1793018164558_22095317.jpg'), label: 'كراسي سحب العينات الطبية المريحة' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095022_746_25e09e09.jpg'), label: 'جناح سحب العينات VIP الحديث' },
  { path: getAsset('/assets/aistudio/IMG_20261024_094906_069_9b5d947e.jpg'), label: 'أجهزة الفحص المجهري المتطورة' },
  { path: getAsset('/assets/aistudio/grok_1793018156544_47c48cad.jpg'), label: 'بهو الاستقبال وشاشات العرض الذكية' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095017_483_49fa1ed7.jpg'), label: 'مدخل المعمل ومواعيد العمل المرنة' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095022_628_e68e000a.jpg'), label: 'محطة الفحص الآمن والتعقيم الفائق' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095029_576_cbc318b7.jpg'), label: 'الاستراحة الملكية لمعامل RT LAB' },
  { path: getAsset('/assets/aistudio/IMG_20261024_095022_303_91099514.jpg'), label: 'مكتب الاستقبال الرئيسي لمعامل رامي مختار' },
];

export const INITIAL_AD_SCENES: AdScene[] = [
  {
    id: 1,
    title: 'قريباً... الحدث الطبي الأقوى لعامك!',
    subtitle: 'معامل رامي مختار RT LAB تقدم مفاجأتها الكبرى لكل العائلة',
    tagline: 'صحتك وصحة أحبابك تستحق الرعاية الأفضل',
    image: getAsset('/assets/aistudio/file_00000000bc8c8210b6e1eb3de10c994e_c7f67e6f.png'),
    alt: 'قريبا الفحص الشامل المخفض من معامل RT',
    duration: 7,
    voiceoverScript: 'أهلاً ومرحباً بكم عملاءنا الكرام في معامل رامي مختار RT LAB. لصحتكم التي لا تقدر بثمن، انتظروا معنا قريباً أضخم عروض الفحص الشامل المخفض، لدقة لا تضاهى ورعاية تفوق التوقعات.',
    highlightText: 'الفحص الشامل المخفض.. قريباً جداً!',
    badge: 'ترقبوا الإطلاق الرسمي',
    animationStyle: 'kenburns-1',
    accentColor: 'from-red-600 to-rose-700',
  },
  {
    id: 2,
    title: 'نخبة من الاستشاريين وأعلى درجات الرعاية',
    subtitle: 'فريق طبي متكامل بخبرات واسعة وأعلى معايير الجودة والاعتماد',
    tagline: 'دقة • ثقة • رعاية مستمرة',
    image: getAsset('/assets/aistudio/IMG_20261024_095029_582_eec715fc.jpg'),
    alt: 'فريق أطباء وكوادر معامل رامي مختار',
    duration: 8,
    voiceoverScript: 'يسعدنا أن نطمئنكم بأن الفحص الشامل سينطلق قريباً بإشراف نخبة من كبار الأطباء والاستشاريين المتخصصين، مع استشارة طبية مجانية وشرح مفصل لنتائجك وفحوصاتك.',
    highlightText: 'بإشراف كبار استشاريي التحاليل الطبية',
    badge: 'كادر طبي معتمد',
    animationStyle: 'kenburns-2',
    accentColor: 'from-blue-600 to-indigo-800',
  },
  {
    id: 3,
    title: '3 أنواع من الفحص الشامل تناسب جميع الفئات',
    subtitle: 'باقات مصممة خصيصاً لكل مرحلة عمرية لتلبية احتياج كل فرد',
    tagline: 'الأساسية • المتقدمة للشباب • الذهبية لكبار السن والعائلة',
    image: getAsset('/assets/aistudio/image_2a889329.jpg'),
    alt: 'استقبال معامل رامي مختار RT LAB',
    duration: 9,
    voiceoverScript: 'ولأن احتياج كل فرد في عائلتك مختلف، وفرنا لكم 3 باقات متخصصة: الباقة الأساسية للاطمئنان السريع، الباقة الشاملة المتقدمة للشباب والرياضيين، والباقة الذهبية الشاملة لكبار السن والأسرة.. بخصومات استثنائية تناسب الجميع.',
    highlightText: '3 باقات ذكية تناسب كل الأعمار والميزانيات',
    badge: '3 مستويات متكاملة',
    animationStyle: 'kenburns-3',
    accentColor: 'from-amber-600 to-red-600',
  },
  {
    id: 4,
    title: 'أحدث تكنولوجيا ألمانية وأمريكية مؤتمتة 100%',
    subtitle: 'أجهزة تحليل مناعية وكيميائية رقمية متطورة لضمان دقة صفر أخطاء',
    tagline: 'نتائج دقيقة وسريعة تصلك إلكترونياً على هاتفك',
    image: getAsset('/assets/aistudio/grok_1793018169554_d31fcd7f.jpg'),
    alt: 'مختبرات تحاليل آلية مؤتمتة RT LAB',
    duration: 8,
    voiceoverScript: 'نعتمد في معامل رامي مختار على أحدث منظومات التحليل الآلي المؤتمتة عالمياً، لنتائج موثوقة تماماً وسريعة تصل إلى هاتفك فور صدورها مع تأكيد باركود معتمد.',
    highlightText: 'تكنولوجيا متطورة ونتائج سريعة على هاتفك',
    badge: 'دقة معتمدة عالمياً',
    animationStyle: 'kenburns-1',
    accentColor: 'from-emerald-600 to-teal-800',
  },
  {
    id: 5,
    title: 'أقصى درجات الراحة وسحب منزلي مجاني',
    subtitle: 'غرف سحب فندقية فاخرة وخدمة زيارات منزلية أينما كنت',
    tagline: 'سحب بدون ألم بأيدي أخصائيين محترفين وخدمة على مدار الساعة',
    image: getAsset('/assets/aistudio/IMG_20261024_095022_746_25e09e09.jpg'),
    alt: 'جناح سحب العينات الفندقي الفاخر',
    duration: 8,
    voiceoverScript: 'تمتع بأقصى درجات الراحة والتعقيم في غرف سحب فندقية مصممة لراحتك، أو اطلب خدمة السحب المنزلي السريع ليصلك فريقنا الطبي المتخصص أينما كنت بقمة الأمان.',
    highlightText: 'غرف سحب فندقية + خدمة زيارات منزلية معقمة',
    badge: 'راحة تامة وسحب بلا ألم',
    animationStyle: 'kenburns-2',
    accentColor: 'from-rose-600 to-purple-800',
  },
  {
    id: 6,
    title: 'احجز مكانك في قائمة الانتظار المسبق الآن!',
    subtitle: 'الأولوية لأسبقية الحجز للحصول على أعلى نسبة خصم فور الانطلاق',
    tagline: 'تواصل معنا الآن عبر الاتصال المباشر أو الواتساب',
    image: getAsset('/assets/aistudio/IMG_20261024_095029_576_cbc318b7.jpg'),
    alt: 'حجز واستفسار معامل رامي مختار',
    duration: 9,
    voiceoverScript: 'لا تفوّت الفرصة! احجز مكانك الآن واستفد من الخصم الاستثنائي فور انطلاقه. للاستفسار والحجز تواصلوا معنا مباشرة على: صفر مائة وعشرة، صفر ثمانية، سبعة وأربعون، أربعة وأربعون. أو صفر مائة وعشرة، صفر صفر، ستة وأربعون، ثمانمائة وواحد وأربعون. معامل رامي مختار.. دقتنا ضمان صحتك!',
    highlightText: 'اتصل أو احجز واتساب: 01100874444 - 01100046841',
    badge: 'احجز مكانك الآن',
    animationStyle: 'kenburns-3',
    accentColor: 'from-red-600 to-red-900',
  },
];

export const MEDICAL_PACKAGES: MedicalPackage[] = [
  {
    id: 'basic',
    name: 'Basic Health Checkup',
    arabicName: 'باقة الفحص الأساسي الدوري',
    targetAudience: 'للشباب والموظفين والفحص السنوي السريع',
    badge: 'الأكثر طلباً للاطمئنان الدوري',
    description: 'باقة فحص ذكية ومدروسة تشمل المؤشرات الحيوية الأساسية للاطمئنان العام على الدم والسكر ووظائف الأعضاء الحيوية بأعلى سرعة ودقة.',
    popularFor: 'الكشف السريع عن الأنيميا، توازن السكر، ووظائف الكبد والكلى الأولية',
    discountPercentage: 45,
    testsCount: '14 تحليل رئيسي',
    recommendedAge: 'من سن 18 إلى 35 سنة',
    color: 'from-blue-600 to-cyan-600',
    keyTests: [
      'صورة دم كاملة CBC مع المؤشرات الـ 24',
      'سكر صائم ومستوى الجلوكوز بالدم (FBS)',
      'وظائف كبد أولية (SGPT - ALT)',
      'وظائف كلى ونسبة الكرياتينين (Creatinine)',
      'نسبة حمض اليوريك بالدم (Uric Acid)',
      'تحليل الدهون والكوليسترول الكلي (Total Cholesterol)',
      'تحليل بول كامل مجهري (Complete Urine Analysis)',
    ],
  },
  {
    id: 'advanced',
    name: 'Comprehensive Advanced Checkup',
    arabicName: 'باقة الفحص الشامل المتقدم',
    targetAudience: 'للرياضيين، أصحاب الأعمال، ومن يبحث عن وقاية متقدمة',
    badge: 'الباقة المتقدمة الشاملة',
    description: 'مسح حيوي متكامل يغطي أدق وظائف الأعضاء، الغدة الدرقية، الفيتامينات، دهون الدم الثلاثية، ومستوى السكر التراكمي لثلاثة أشهر.',
    popularFor: 'تقييم شامل للطاقة والمناعة، وصحة القلب والتمثيل الغذائي',
    discountPercentage: 50,
    testsCount: '28 تحليل دقيق',
    recommendedAge: 'من سن 25 إلى 50 سنة',
    color: 'from-rose-600 to-red-700',
    keyTests: [
      'كل فحوصات الباقة الأساسية بالكامل',
      'السكر التراكمي لآخر 3 شهور (HbA1c)',
      'فيتامين د (Vitamin D 25-OH) للمناعة والعظام',
      'تحليل هرمون الغدة الدرقية المنشط (TSH)',
      'ملف دهون الدم الكامل (Lipid Profile: HDL, LDL, Triglycerides)',
      'وظائف كبد موسعة (SGOT/AST + Bilirubin)',
      'وظائف كلى متقدمة (Blood Urea Nitrogen)',
      'مخزون الحديد في الجسم (Serum Ferritin)',
      'سرعة ترسيب الدم (ESR) للكشف عن الالتهابات',
    ],
  },
  {
    id: 'golden',
    name: 'Golden Senior & Family Checkup',
    arabicName: 'باقة الفحص الذهبي لكبار السن والعائلة',
    targetAudience: 'لكبار السن والوالدين والأمراض المزمنة والرعاية الوقائية المتكاملة',
    badge: 'الرعاية الملكية الشاملة',
    description: 'الباقة الأكثر شمولاً وعمقاً من معامل RT LAB، تشمل فحصاً تفصيلياً شاملاً للأعضاء الحيوية، المناعة، الأملاح، الفيتامينات، وعوامل تجلط الدم، مع استشارة طبية خاصة وسحب منزلي مجاني.',
    popularFor: 'متابعة كبار السن، مرضى الضغط والسكر، والاطمئنان الكامل على الوالدين',
    discountPercentage: 55,
    testsCount: '42 تحليل فائق الدقة',
    recommendedAge: 'فوق 45 سنة ولكافة أفراد الأسرة',
    color: 'from-amber-600 to-orange-700',
    keyTests: [
      'جميع فحوصات الباقتين الأساسية والمتقدمة',
      'فيتامين B12 للأعصاب وصحة الذاكرة',
      'أملاح ومعادن الدم (الصوديوم والبوتاسيوم والكالسيوم Na, K, Ca)',
      'دلالات الالتهاب الحادة عالية الدقة (hs-CRP)',
      'مؤشرات صحة البروستاتا للرجال / مؤشرات متخصصة للسيدات',
      'تحليل وظائف التجلط والسيولة (PT / INR / PTT)',
      'فحص براز شامل وكشف الدم الخفي (Occult Blood in Stool)',
      'سحب منزلي مجاني وتوصيل النتائج مطبوعة واستشارة هاتفية مع استشاري',
    ],
  },
];
