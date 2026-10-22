// ==================================================
// ZAIN DENTAL CLINIC — DENTAL MATERIALS MARKET (بورصة الماتريال)
// ==================================================

import { sb, getCurrentUser } from './app.js';

let _matBc = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    _matBc = new BroadcastChannel('zd_clinic_materials_bus');
  }
} catch (e) {}

export function broadcastCartUpdate(payload) {
  if (_matBc) {
    try {
      _matBc.postMessage({ ...payload, event_type: 'materials_cart_update' });
    } catch (e) {}
  }
}

export const RAW_MATERIALS = `كمبوزيت|كمبوزيت Chroma النانو هيبريد (4.5جم سرنجة)|168
كمبوزيت|كمبوزيت M dental|175
كمبوزيت|كمبوزيت اقتصادية Medental|175
كمبوزيت|كمبوزيت روبي|175
كمبوزيت|كمبوزيت كلارا|185
كمبوزيت|كمبوزيت برايم دنت|185
كمبوزيت|كمبوزيت كمبوماكس|255
كمبوزيت|كمبوزيت ميتا|275
كمبوزيت|كمبوزيت i.light|350
كمبوزيت|كمبوزيت Dia fill|360
كمبوزيت|كمبوزيت Dolgunn|375
كمبوزيت|كمبوزيت Di.fill|450
كمبوزيت|كمبوزيت Cavex|475
كمبوزيت|كمبوزيت نوڤا|465
كمبوزيت|كمبوزيت كولتين NG|465
كمبوزيت|كمبوزيت كاريزما|525
كمبوزيت|كمبوزيت كيرر Kerr|560
كمبوزيت|كمبوزيت Den fill مايكرو كوري أصلي|575
كمبوزيت|كمبوزيت Den fill نانو كوري أصلي|675
كمبوزيت|كمبوزيت أيتينا itena|740
كمبوزيت|كمبوزيت كابو يونيڤرسال|790
كمبوزيت|كمبوزيت كولتين Everglow|825
كمبوزيت|كمبوزيت شوفو Shofu|865
كمبوزيت|كمبوزيت ألفا توكوياما|895
كمبوزيت|كمبوزيت Voco NHT|1160
كمبوزيت|كمبوزيت تيترك أن سيرام|1245
كمبوزيت|كيت كمبوزيت كيرر Kerr|2825
فلوابل وبوند|فلوابل Hi.fill أو Max fill|105
فلوابل وبوند|فلوابل ماكس فيل Max fill|105
فلوابل وبوند|فلوابل Hi.fill|105
فلوابل وبوند|فلوابل Elite|110
فلوابل وبوند|فلوابل روبي|175
فلوابل وبوند|فلوابل ألفا|180
فلوابل وبوند|فلوابل Any|180
فلوابل وبوند|فلوابل Te.com|190
فلوابل وبوند|فلوابل D.fill|220
فلوابل وبوند|فلوابل Dia fill|255
فلوابل وبوند|فلوابل نوڤا|230
فلوابل وبوند|فلوابل سبايدنت Spident|265
فلوابل وبوند|فلوابل ميتا Meta|265
فلوابل وبوند|فلوابل بلك فيل Bulk fill|325
فلوابل وبوند|كبسولات فلوابل بلك فيل Dentsply Sirona|155
فلوابل وبوند|بوند كمبوماكس|225
فلوابل وبوند|بوند تركي Clara|345
فلوابل وبوند|بوند Meta 5ml كوري توتال إيتش|435
فلوابل وبوند|بوند Any 5ml كوري توتال إيتش|475
فلوابل وبوند|بوند بيسكو الصغير|450
فلوابل وبوند|بوند فليبرو Flibro|640
فلوابل وبوند|بوند كولتين 5ml OneCoat|650
فلوابل وبوند|بوند توكوياما 1مللي يونيفرسال Tokuyama|665
فلوابل وبوند|بوند Dolgunn 5ml تركي يونيفرسال|725
فلوابل وبوند|بوند ألترا Ultra 6 ml|775
فلوابل وبوند|بوند بيسكو الكبير خالص الأصلي|2130
فلوابل وبوند|أسيد إيتش Dentaleen 5gm|25
فلوابل وبوند|أسيد إيتش chem|20
فلوابل وبوند|أسيد إيتش plus|45
فلوابل وبوند|أسيد إيتش كيرر|65
فلوابل وبوند|تيبات الأسيد إيتش أو الفلوابل|1
فلوابل وبوند|فرش البوند الكبيرة|28
بنج|بنج أزرق|880
بنج|بنج أرتفارما|975
بنج|بنج أحمر|1100
بنج|بنج إيطالي|1270
بنج|بنج إسباني|1570
بنج|بنج جل أو سبراي|25
بنج|سيرنج الأنسيزيا|160
بنج|سنون بنج لونج صيني|175
بنج|سنون بنج شورت صيني|185
مستهلكات|جلفزات أبيض|167
مستهلكات|جلفزات ألوان|167
مستهلكات|جلفزات لاتيكس ماليزي درجة أولى|157
مستهلكات|كيس الأوفر جلڤز|4
مستهلكات|علبة الأوفر جلڤز|45
مستهلكات|علبة أوفر جلفز 200 فردي|45
مستهلكات|الجاونات|13
مستهلكات|كيس 1 كيلو جبس|19
مستهلكات|1 لتر كحول|45
مستهلكات|معقم يد سائل|75
مستهلكات|معقم أسطح|80
مستهلكات|مطهر sidex (كيس)|18
مستهلكات|فيس شيلد|55
مستهلكات|ماسكات مصري|35
مستهلكات|ماسكات صيني|45
مستهلكات|عمود الكبايات|22
مستهلكات|كيسة الساكشن المصري درجة أولى 100 قطعة|76
مستهلكات|الساكشن الإيطالي الأصلي|125
مستهلكات|النابكن البلاستيك|32
مستهلكات|باكيت النابكن 100|68
مستهلكات|عبوة الشاش المعقم الكبيرة (قطن + شاش)|38
مستهلكات|النابكن هولدر|25
مستهلكات|كيسة قطن المحلة الكبيرة|87
مستهلكات|كيس القطن المحلة الكبير|88
مستهلكات|باكيت القطن رول|95
مستهلكات|تيبات المية والهوا ستانلس أوتوكلافابل|18
مستهلكات|كيسة تيبات المية والهوا كبيرة (250 قطعة)|190
مستهلكات|ورق عض كربون صيني مستورد Articulating papers (12 مجموعة)|110
مستهلكات|علبة باوتشات تعقيم 5سم|80
مستهلكات|علبة باوتشات تعقيم 7سم|110
مستهلكات|علبة باوتشات تعقيم 9سم|145
مستهلكات|علبة باوتشات تعقيم 13سم|185
مستهلكات|رولات تعقيم 5سم|155
مستهلكات|رولات تعقيم 7.5سم|230
مستهلكات|رولات تعقيم 10سم|310
مستهلكات|علبة المشارط الجراحية|175
مستهلكات|علبة السوتشرز الخيوط الجراحية|210
أندو|كالسيوم هيدروكسيد لايت كيور Biner LC|255
أندو|كالسيوم هيدروكسيد ديكال إنجليزي (Caviline) 2 Tube system|325
أندو|زيكال إنجليزي TubliCem|225
أندو|حشو مؤقت Galaxy|70
أندو|حشو مؤقت أكروتيمب Acrotemp|85
أندو|حشو مؤقت T.fill|155
أندو|D.vital (pulp devitalizer)|410
أندو|علبة MTA jk (3 عبوات)|125
أندو|MTA putty one fill 1/2جم|520
أندو|سيلر D.seal (حجم الطلبة)|175
أندو|سيلر D.seal (حجم كبير)|375
أندو|بيست أو بيكس شركة plus|135
أندو|سيلر زيكال أوتوميكس Xical Automix|560
أندو|سيلر Vioseal spident|685
أندو|سيلر Anyseal|695
أندو|سيلر ميتا أديسيل Adseal|775
أندو|سيلر ديابروسيل Diaproseal|1175
أندو|ميتابكس أو ميتابيست كوري Metapaste / Metabex|525
أندو|كالسيبيكس Calcipex أو كالسيبيست Calcipaste|135
أندو|N Root SP 1/2G (بيوسيراميك)|410
أندو|Well Root 1/2G|775
أندو|Ceraseal ميتا 1/2G|975
أندو|OneFill الكوري|1775
أندو|كرتونة سرنجات إيريجيشن 100 قطعة 3سم|125
أندو|كرتونة نيدلز إيريجيشن 3سم لوك|125
أندو|علبة Side-vented needles|185
أندو|علبة side-vented needle (100)|180
أندو|قطعة side-vented needle|4.5
أندو|إيديتا جل|65
أندو|إيريجيشن (بيتادين / سلاين / هيدروجين بيروكسيد / صوديوم كلوريد / كلورهيكسيدين)|25
أندو|زينك أوكسيد jk|35
أندو|إيجينول jk|70
أندو|فورماكريزول jk|70
أندو|فايلات مانيوال صيني|45
أندو|فايلات مانيوال لونج|55
أندو|فايلات K ماني Mani مقاس 8 (أصلي)|220
أندو|فايلات K ماني Mani مقاس 10 (أصلي)|220
أندو|فايلات K ماني Mani مقاس 15 (أصلي)|185
أندو|فايلات K ماني Mani مقاسات مشكلة Assorted (15-40) ستاندرد (أصلي)|185
أندو|فايلات K ماني Mani مقاسات مشكلة Assorted لونج Long 25/31mm (أصلي)|210
أندو|فايلات H ماني Mani مقاسات مشكلة Assorted (15-40) (أصلي)|185
أندو|فايلات D فايندر ماني Mani D-Finders مقاس 8 (أصلي)|250
أندو|فايلات D فايندر ماني Mani D-Finders مقاس 10 (أصلي)|250
أندو|فايلات D فايندر ماني Mani D-Finders مقاس 15 (أصلي)|235
أندو|سبريدر مانيوال|50
أندو|بيبربوينت عادية / تيبر|70
أندو|جاتابركا عادية / تيبر|67
أندو|جاتابركا ميتا عادية|110
أندو|جاتابركا ميتا تيبر|110
أندو|كيت فايلات روتاري Aline|195
أندو|كيت فايلات روتاري M.pro|230
أندو|كيت فايلات روتاري Nic 4file|235
أندو|كيت فايلات روتاري Nic 6file|255
أندو|كيت فايلات روتاري فيديا الكبير|250
أندو|كيت فايلات روتاري E.flex جولد|255
أندو|كيت فايلات روتاري E.flex بلو|265
أندو|فايلات روتاري فانتا بلو|273
أندو|كيت فايلات بيبسي جولد|275
أندو|كيت فايلات روتاري ام برو جولد|285
أندو|كيت فايلات روتاري روجين 4file|328
أندو|كيت فايلات روتاري روجين 6file|355
جلاس ايونيمر|جلاس ايونيمر صيني|65
جلاس ايونيمر|جلاس ايونيمر إنجليزي|150
جلاس ايونيمر|جلاس ايونيمر Restore|345
جلاس ايونيمر|جلاس ايونيمر أمريكي Ceram|425
جلاس ايونيمر|جلاس ايونيمر برازيلي|440
جلاس ايونيمر|جلاس ايونيمر Micron|510
جلاس ايونيمر|كبسولات ريڤا لايت / سيلف|125
جلاس ايونيمر|كبسولات فيوجي 9 extra|135
جلاس ايونيمر|حشو مؤقت إنجليزي PSP|168
جلاس ايونيمر|تيمبريري كراون Dolgunn|440
جلاس ايونيمر|كور Dolgunn التركي|625
جلاس ايونيمر|شارم كور الكوري|715
جلاس ايونيمر|ريزن سيمنت Supercem|1075
طبعات|ألجينيت صيني نوع كويس|140
طبعات|ألجينيت IQ|158
طبعات|ألجينيت Hygedent|175
طبعات|ألجينيت Zetalgin|265
طبعات|ألجينيت Cavex|445
طبعات|إمبرشن كومباوند|125
طبعات|جرين ستيك Green stick|125
طبعات|تراي الإمبرشن الستانلس النضيفة|12
طبعات|الرابرباول + السباتيولا|25
طبعات|رابربيز سيلاكسيل كيت صغير|710
طبعات|رابربيز زيتابلس كيت صغير|780
طبعات|رابربيز سيلاكسيل كيت كبير|1870
طبعات|رابربيز زيتابلس كيت كبير|1945
طبعات|مسدس رابربيز|310
رابردام|شيت رابردام|8
رابردام|كلامب باكستاني|23
رابردام|فريم رابردام Metal|48
رابردام|فريم رابردام Plastic|85
رابردام|كلامب هولدر|270
رابردام|ليكويدام|135
رابردام|علبة شيتات Puritex / CEYFLEX|290
رابردام|علبة شيتات Flamingo|310
تلميع وماتريكس|بيرات هاي سبيد صيني درجة أولى مستوردة|5.5
تلميع وماتريكس|بيرات الهاي سبيد|5.5
تلميع وماتريكس|بير كاربيد|34
تلميع وماتريكس|اللونج شانك بير|25
تلميع وماتريكس|بيرات التلميع البيضا الهاي سبيد|18
تلميع وماتريكس|فرش التلميع الكتان|5.5
تلميع وماتريكس|فرش التلميع النايلون فردي|2.5
تلميع وماتريكس|علبة فرش التلميع النيلون 100 حبة|158
تلميع وماتريكس|رابر كب التلميع Rubber Cup|4.5
تلميع وماتريكس|معجون تلميع الأسنان|55
تلميع وماتريكس|كبسولة معجون تلميع أسنان (تكفي لحالة واحدة)|8
تلميع وماتريكس|معجون تلميع حشوات الكمبوزيت Aluminium oxide|55
تلميع وماتريكس|معجون تلميع حشوات الأملجم|45
تلميع وماتريكس|الفينيشبنج ستريبس Torvm|70
تلميع وماتريكس|الفينيشينج discs|140
تلميع وماتريكس|كيت كيندا الفينيشينج الصيني|150
تلميع وماتريكس|الويدجات الخشب|135
تلميع وماتريكس|ويدجات بلاستيك|145
تلميع وماتريكس|كيسة الباندات توفليمير المقطعة|6
تلميع وماتريكس|التوفليمير ماتريكس|80
تلميع وماتريكس|ماتريكس باند رول|55
تلميع وماتريكس|الباندات السيليلويد celliloid strips|10
تلميع وماتريكس|رينج مستورد حجم كبير|145
تلميع وماتريكس|ريزن رينج Resin Rings|135
تلميع وماتريكس|سيكشنال ماتريكس كيت|135
تلميع وماتريكس|الspoon matrix أو الTwin matrix|185
تلميع وماتريكس|الSaddle matrix refill|210
تلميع وماتريكس|سادل ماتريكس كيت|245
أدوات|تيبات الالتراسونيك الاندو بيريو E22 ومثيلاتها|275
أدوات|تيبات ألتراسونيك عادية|37
أدوات|الsilicone sleeves بتاعت الروتاري|135
أدوات|السينسور سليڤز|125
أدوات|السليڤز بتاعت الكاميرا|125
أدوات|ميرور هيد|9
أدوات|بروب عادي|26
أدوات|تويزر عادي|42
أدوات|تويزر لوك|48
أدوات|مقص|45
أدوات|يد مشرط|28
أدوات|كارفر / كوندينسر / برنشر|26
أدوات|إكسكافيتور|28
أدوات|ادوات كمبوزيت plastic|28
أدوات|كيت ادوات كمبوزيت pk tomath|185
أدوات|نيدلز هولدر|90
أدوات|Elevator|105
أدوات|Forceps|215
أدوات|سكيلر / كيوريت مانيوال|28
أدوات|هيموستوب / هيموستال|90
أدوات|ألڤيوجل|55
أدوات|جهاز سكيلر|1950
تقويم|كيت كمبوزيت ماستر دنت للتقويم بالبوند|1360
تقويم|وايرات نايطاي راوند|27
تقويم|وايرات ستانلس راوند|32
تقويم|علبة براكيت تقويم|75
تقويم|حالة براكيت على كارت|75
تقويم|كيس إيلاستيك تقويم|14
تقويم|علبة شمع تقويم|12
تقويم|شيت ستارس Ortho stars|55
تقويم|Band pusher|285
تقويم|Band remover|325
تقويم|Bracket holder|185
تقويم|كيت باندات التقويم|625
كونترا|زيت الكونترا|105
كونترا|بلي كونترا|75
كونترا|كونترا هاي سبيد future key|475
كونترا|كونترا هاي سبيد Being|750
كونترا|كونترا لوسبيد xplat form|750
كونترا|أدابتور x plat form|750
كونترا|كونترا هاي سبيد Hay|950
كونترا|كونترا هاي سبيد Trend|975
كونترا|كونترا هاي سبيد K&K|1100
كونترا|كونترا Apple|1550
كونترا|كوكسو Coxo|1650
كونترا|كوكسو مصر سينا|2150
أجهزة (زيرو)|عرض تجهيز أجهزة العيادة كاملة|136000
أجهزة (زيرو)|Unit H5|73500
أجهزة (زيرو)|Autoclave Famous|30500
أجهزة (زيرو)|Sensor xpect vision|30500
أجهزة (زيرو)|X-ray hyper light G|28000
أجهزة (زيرو)|Compressor 40L|7750
أجهزة (زيرو)|Apex locator|7000
أجهزة (زيرو)|Endo activator|5800
أجهزة (زيرو)|Scaler piezo|5500
أجهزة (زيرو)|Endo motor Y smart|4750
أجهزة (زيرو)|ماكينة لحام ستانلس|4450
أجهزة (زيرو)|Atls bleaching|3350
أجهزة (زيرو)|Light cure (cure magic)|2900
أجهزة (زيرو)|Water distiller|2650
أجهزة (زيرو)|Rta light cure|1950`;

export const matItems = RAW_MATERIALS.split("\n").filter(Boolean).map((line, idx) => {
  const parts = line.split("|");
  const c = (parts[0] || "").trim();
  const n = (parts[1] || "").trim();
  const p = Number(parts[2]) || 0;
  const img = (parts[3] || "").trim();
  return { id: idx, c, n, p, img };
});

export const matCats = ["الكل", ...new Set(matItems.map(i => i.c))];

// Professional Category Visuals and Dental SVG Placeholders
export function getCategoryVisualConfig(category = "", itemName = "") {
  const c = (category || "").toLowerCase();
  const n = (itemName || "").toLowerCase();

  // 1. Composite (كمبوزيت)
  if (c.includes("كمبوزيت") || n.includes("كمبوزيت")) {
    let badge = "كمبوزيت";
    if (n.includes("chroma") || n.includes("شروما")) badge = "Chroma";
    else if (n.includes("kerr") || n.includes("كيرر")) badge = "Kerr";
    else if (n.includes("voco") || n.includes("فوكو")) badge = "Voco";
    else if (n.includes("den fill")) badge = "DenFill";
    return {
      gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="8" width="14" height="14" rx="2.5" fill="rgba(255,255,255,0.2)"/>
        <path d="M16 2v6M12 2h8M14 22l-4 6h-2l3-6M13 12h6M13 15h4M13 18h5"/>
        <circle cx="23" cy="7" r="2" fill="#facc15" stroke="none"/>
      </svg>`
    };
  }

  // 2. Flowable & Bond (فلوابل وبوند)
  if (c.includes("فلوابل") || c.includes("بوند") || n.includes("فلوابل") || n.includes("بوند")) {
    const isBond = n.includes("بوند");
    return {
      gradient: isBond
        ? "linear-gradient(135deg, #b45309 0%, #78350f 100%)"
        : "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
      badgeText: isBond ? "بوند لاصق" : "فلوابل",
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="7" y="11" width="11" height="15" rx="2" fill="rgba(255,255,255,0.2)"/>
        <path d="M10 11V6h5v5M11 6V4h3v2"/>
        <path d="M22 8l4 4-7 12-3-1 6-15z" fill="rgba(255,255,255,0.25)"/>
        <circle cx="25" cy="27" r="1.5" fill="#fef08a" stroke="none"/>
      </svg>`
    };
  }

  // 3. Anesthesia (بنج وتخدير)
  if (c.includes("بنج") || n.includes("بنج") || n.includes("انسيزيا") || n.includes("سنون بنج")) {
    let grad = "linear-gradient(135deg, #059669 0%, #065f46 100%)";
    let badge = "بنج وتخدير";
    if (n.includes("أزرق") || n.includes("ازرق")) {
      grad = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
      badge = "بنج أزرق";
    } else if (n.includes("أحمر") || n.includes("احمر")) {
      grad = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      badge = "بنج أحمر";
    } else if (n.includes("ارتفارما")) {
      grad = "linear-gradient(135deg, #0d9488 0%, #115e59 100%)";
      badge = "ارتفارما";
    } else if (n.includes("ايطالي") || n.includes("إيطالي")) {
      grad = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
      badge = "إيطالي";
    } else if (n.includes("اسباني") || n.includes("إسباني")) {
      grad = "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)";
      badge = "إسباني";
    } else if (n.includes("سنون") || n.includes("نيدل")) {
      grad = "linear-gradient(135deg, #475569 0%, #334155 100%)";
      badge = "سنون بنج";
    } else if (n.includes("سيرنج")) {
      grad = "linear-gradient(135deg, #64748b 0%, #334155 100%)";
      badge = "سيرنج بنج";
    } else if (n.includes("جل") || n.includes("سبراي")) {
      badge = "سبراي/جل";
    }
    return {
      gradient: grad,
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="11" y="8" width="10" height="17" rx="2" fill="rgba(255,255,255,0.25)"/>
        <line x1="16" y1="2" x2="16" y2="8"/>
        <line x1="13" y1="8" x2="19" y2="8"/>
        <line x1="11" y1="12" x2="21" y2="12" stroke="#6ee7b7"/>
        <circle cx="16" cy="20" r="2.5" fill="rgba(255,255,255,0.4)" stroke="none"/>
        <line x1="12" y1="25" x2="20" y2="25"/>
      </svg>`
    };
  }

  // 4. Endodontics (أندو وعلاج جذور)
  if (c.includes("أندو") || c.includes("اندو") || n.includes("روتاري") || n.includes("فايل") || n.includes("جاتابركا") || n.includes("بيبربوينت") || n.includes("سيلر") || n.includes("mta")) {
    let grad = "linear-gradient(135deg, #e11d48 0%, #881337 100%)";
    let badge = "أندو وجذور";
    if (n.includes("روتاري")) badge = "روتاري";
    else if (n.includes("جاتابركا")) {
      badge = "جاتابركا";
      grad = "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)";
    } else if (n.includes("بيبر")) {
      badge = "بيبر بوينت";
      grad = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
    } else if (n.includes("سيلر")) {
      badge = "سيلر";
      grad = "linear-gradient(135deg, #d97706 0%, #92400e 100%)";
    } else if (n.includes("mta") || n.includes("ام تي ايه")) {
      badge = "MTA";
      grad = "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";
    } else if (n.includes("مؤقت") || n.includes("galaxy") || n.includes("acrotemp")) {
      badge = "حشو مؤقت";
      grad = "linear-gradient(135deg, #059669 0%, #065f46 100%)";
    } else if (n.includes("كالسيوم") || n.includes("biner") || n.includes("caviline") || n.includes("ديكال")) {
      badge = "CaOH";
      grad = "linear-gradient(135deg, #0891b2 0%, #155e75 100%)";
    }
    return {
      gradient: grad,
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="13" y="3" width="6" height="7" rx="1.5" fill="#facc15" stroke="#facc15"/>
        <path d="M16 10v18M13 13l6 2M13 17l6 2M13 21l6 2M14 25l4 1.5"/>
        <circle cx="16" cy="29" r="1" fill="#fff" stroke="none"/>
      </svg>`
    };
  }

  // 5. Glass Ionomer (جلاس ايونيمر)
  if (c.includes("جلاس") || n.includes("جلاس") || n.includes("ايونيمر")) {
    return {
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)",
      badgeText: "جلاس ايونيمر",
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="7" y="10" width="11" height="16" rx="2" fill="rgba(255,255,255,0.25)"/>
        <rect x="9" y="5" width="7" height="5" rx="1"/>
        <path d="M22 8l4 14M20 22h6"/>
        <circle cx="12" cy="18" r="2" fill="#c4b5fd" stroke="none"/>
      </svg>`
    };
  }

  // 6. Impressions (طبعات)
  if (c.includes("طبعات") || n.includes("ألجنيت") || n.includes("الجنيت") || n.includes("تراي") || n.includes("إمبرشن") || n.includes("طبعة")) {
    let badge = "طبعات";
    if (n.includes("الجنيت") || n.includes("ألجنيت")) badge = "ألجنيت";
    else if (n.includes("تراي")) badge = "تراي معدن";
    else if (n.includes("باول") || n.includes("سباتيولا")) badge = "باول خلط";
    return {
      gradient: "linear-gradient(135deg, #0891b2 0%, #155e75 100%)",
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 18c0-7 5-13 11-13s11 6 11 13c0 3-2 5-5 5-3 0-4-2-6-2s-3 2-6 2c-3 0-5-2-5-5z" fill="rgba(255,255,255,0.2)"/>
        <path d="M16 23v6M13 29h6"/>
        <circle cx="11" cy="14" r="1.5" fill="#fff"/>
        <circle cx="16" cy="11" r="1.5" fill="#fff"/>
        <circle cx="21" cy="14" r="1.5" fill="#fff"/>
      </svg>`
    };
  }

  // 7. Rubber Dam (رابردام)
  if (c.includes("رابردام") || n.includes("رابردام") || n.includes("كلامب") || n.includes("بانش")) {
    return {
      gradient: "linear-gradient(135deg, #0d9488 0%, #134e4a 100%)",
      badgeText: "عزل رابردام",
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="6" width="20" height="20" rx="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="16" cy="16" r="4" fill="rgba(0,0,0,0.25)" stroke="#5eead4"/>
        <path d="M13 16h6M16 13v6"/>
      </svg>`
    };
  }

  // 8. Polishing & Matrix (تلميع وماتريكس)
  if (c.includes("تلميع") || c.includes("ماتريكس") || n.includes("تلميع") || n.includes("ماتريكس") || n.includes("ستريبس") || n.includes("رينج")) {
    let badge = "تلميع وفينيش";
    if (n.includes("ماتريكس") || n.includes("رينج") || n.includes("ويدج")) badge = "ماتريكس";
    return {
      gradient: "linear-gradient(135deg, #ec4899 0%, #9d174d 100%)",
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.25)"/>
        <circle cx="16" cy="16" r="4" fill="rgba(0,0,0,0.2)"/>
        <line x1="16" y1="16" x2="24" y2="24" stroke-width="2.2"/>
        <path d="M9 11l4-4M19 25l4-4"/>
      </svg>`
    };
  }

  // 9. Instruments (أدوات)
  if (c.includes("أدوات") || c.includes("ادوات") || n.includes("ملقط") || n.includes("ميرور") || n.includes("بروب") || n.includes("سكالبيل")) {
    return {
      gradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)",
      badgeText: "أدوات عيادة",
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="5" fill="rgba(255,255,255,0.25)"/>
        <line x1="15" y1="15" x2="27" y2="27"/>
        <path d="M21 5c2 4 4 5 7 5"/>
        <line x1="21" y1="5" x2="8" y2="26"/>
      </svg>`
    };
  }

  // 10. Orthodontics (تقويم)
  if (c.includes("تقويم") || n.includes("تقويم") || n.includes("وايرات") || n.includes("براكت")) {
    let badge = "تقويم أسنان";
    if (n.includes("وايرات") || n.includes("واير")) badge = "واير تقويم";
    return {
      gradient: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="10" width="14" height="12" rx="2" fill="rgba(255,255,255,0.25)"/>
        <line x1="3" y1="16" x2="29" y2="16" stroke="#fdba74" stroke-width="2.5"/>
        <path d="M11 7v18M21 7v18"/>
        <circle cx="16" cy="16" r="2" fill="#fff" stroke="none"/>
      </svg>`
    };
  }

  // 11. Contra & Burs (كونترا)
  if (c.includes("كونترا") || n.includes("كونترا") || n.includes("بيرات") || n.includes("توربين") || n.includes("بير")) {
    let badge = "كونترا وتوربين";
    if (n.includes("بيرات") || n.includes("بير")) badge = "بيرات ألماظ";
    return {
      gradient: "linear-gradient(135deg, #ca8a04 0%, #713f12 100%)",
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 7h8v9l-4 8h-3l-1-17z" fill="rgba(255,255,255,0.25)"/>
        <circle cx="16" cy="6" r="2" fill="#fef08a"/>
        <line x1="16" y1="24" x2="16" y2="30" stroke-width="2.2" stroke="#fff"/>
        <polygon points="14,28 16,31 18,28" fill="#fff"/>
      </svg>`
    };
  }

  // 12. Equipment & Devices (أجهزة زيرو)
  if (c.includes("أجهزة") || c.includes("اجهزة") || n.includes("لايت كيور") || n.includes("أوتوكلاف") || n.includes("يونيت")) {
    return {
      gradient: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
      badgeText: "أجهزة طبية",
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="11" y="11" width="10" height="17" rx="3" fill="rgba(255,255,255,0.25)"/>
        <path d="M16 11V4l4-2"/>
        <circle cx="16" cy="18" r="2" fill="#60a5fa" stroke="none"/>
        <path d="M21 2l3 3M19 6l3 2" stroke="#93c5fd"/>
      </svg>`
    };
  }

  // 13. Disposables / Consumables (مستهلكات)
  if (c.includes("مستهلكات") || n.includes("جلفز") || n.includes("ماسك") || n.includes("ساكشن") || n.includes("قطن") || n.includes("كحول") || n.includes("شاش") || n.includes("نابكن")) {
    let badge = "مستهلكات";
    let grad = "linear-gradient(135deg, #6366f1 0%, #3730a3 100%)";
    if (n.includes("جلفز")) badge = "جلفزات";
    else if (n.includes("ماسك")) {
      badge = "ماسكات";
      grad = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
    } else if (n.includes("ساكشن")) {
      badge = "ساكشن";
      grad = "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)";
    } else if (n.includes("قطن")) {
      badge = "قطن رول";
      grad = "linear-gradient(135deg, #64748b 0%, #475569 100%)";
    } else if (n.includes("كحول")) {
      badge = "كحول طبي";
      grad = "linear-gradient(135deg, #0d9488 0%, #115e59 100%)";
    } else if (n.includes("نابكن")) {
      badge = "نابكن";
      grad = "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)";
    }
    return {
      gradient: grad,
      badgeText: badge,
      svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 14c0-3 2-5 5-5h10c3 0 5 2 5 5v3c0 3-2 5-5 5H11c-3 0-5-2-5-5v-3z" fill="rgba(255,255,255,0.2)"/>
        <path d="M6 15c-3 0-4 1.5-4 3.5S3.5 22 6 22M26 15c3 0 4 1.5 4 3.5S28.5 22 26 22"/>
        <line x1="10" y1="14" x2="22" y2="14"/>
        <line x1="10" y1="17" x2="22" y2="17"/>
      </svg>`
    };
  }

  // 14. Default / Custom Fallback
  return {
    gradient: "linear-gradient(135deg, #0f8a7e 0%, #064e46 100%)",
    badgeText: category ? category.substring(0, 10) : "خامة طبية",
    svg: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 12c0-5 3.5-7 8-7s8 2 8 7c0 4-1 9-3 14-1.5 3.5-3 3-5 0-1-1.5-1-1.5-2 0-2 3-3.5 3.5-5 0-2-5-3-10-3-14z" fill="rgba(255,255,255,0.25)"/>
      <path d="M23 7l2-2M25 9l2-2" stroke="#fef08a"/>
    </svg>`
  };
}

// Render modern thumbnail with image or crisp category placeholder
export function renderMatThumb(item, size = "md") {
  const config = getCategoryVisualConfig(item.c, item.n);
  const hasImg = item.img && (typeof item.img === 'string') && item.img.trim().startsWith('http');
  const safeName = (item.n || '').replace(/"/g, '&quot;');
  const safeId = String(item.id);

  if (hasImg) {
    const safeImg = item.img.replace(/"/g, '&quot;');
    return `
      <div class="mat-thumb-wrap ${size === 'sm' ? 'mat-thumb-cart' : ''}" onclick="window.previewMatItem('${safeId}', event)" title="معاينة وتكبير: ${safeName}">
        <img src="${safeImg}" alt="${safeName}" class="mat-thumb-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
        <div class="mat-cat-placeholder" style="background:${config.gradient};display:none">
          ${config.svg}
          ${size !== 'sm' ? `<span class="mat-cat-tag">${config.badgeText}</span>` : ''}
        </div>
      </div>
    `;
  }

  return `
    <div class="mat-thumb-wrap ${size === 'sm' ? 'mat-thumb-cart' : ''}" onclick="window.previewMatItem('${safeId}', event)" title="معاينة وتكبير: ${safeName}">
      <div class="mat-cat-placeholder" style="background:${config.gradient}">
        ${config.svg}
        ${size !== 'sm' ? `<span class="mat-cat-tag">${config.badgeText}</span>` : ''}
      </div>
    </div>
  `;
}

const CLIENT_ID = 'mat_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

let currentCat = "الكل";
let cart = {};
let customItems = {};
let lastUpdatedBy = "";
let lastUpdatedAt = "";
let customerDetails = {};
let _saveDebounceTimer = null;
let _isFetching = false;

// 1. Initial immediate local cache
try {
  cart = JSON.parse(localStorage.getItem("zd_mat_cart") || localStorage.getItem("cart") || "{}");
  customItems = JSON.parse(localStorage.getItem("zd_mat_custom_items") || "{}");
  customerDetails = JSON.parse(localStorage.getItem("zd_mat_customer") || "{}");
} catch (e) {
  cart = {};
  customItems = {};
  customerDetails = {};
}

function saveCartLocal() {
  try {
    localStorage.setItem("zd_mat_cart", JSON.stringify(cart));
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {}
}

function saveCustomItemsLocal() {
  try {
    localStorage.setItem("zd_mat_custom_items", JSON.stringify(customItems));
  } catch (e) {}
}

function getCurrentUserName() {
  const u = getCurrentUser();
  return u?.full_name || (u?.username ? `@${u.username}` : "عضو بالعيادة");
}

export function updateSyncStatus(customText) {
  const el = $("mat-sync-text");
  const cartInfoEl = $("mat-cart-last-mod");
  const cnt = Object.keys(cart).length;

  let text = customText;
  if (!text) {
    if (lastUpdatedBy) {
      let timeStr = "";
      try {
        if (lastUpdatedAt) {
          timeStr = new Date(lastUpdatedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
        }
      } catch (e) {}
      text = `سلة موحدة ومشتركة للعيادة 🤝 (آخر تعديل: ${lastUpdatedBy} ${timeStr ? '· ' + timeStr : ''})`;
    } else {
      text = "سلة موحدة ومشتركة للعيادة 🤝 (تحديث ومزامنة لحظية للجميع)";
    }
  }

  if (el) el.textContent = text;
  if (cartInfoEl) {
    cartInfoEl.textContent = lastUpdatedBy
      ? `آخر تعديل بواسطة: ${lastUpdatedBy} · (${cnt} أصناف بالسلة)`
      : `سلة موحدة يراها ويعدلها جميع أطباء وموظفي العيادة (${cnt} صنف)`;
  }
}

// 2. Fetch shared cart from Supabase
export async function fetchSharedCart(notifyUser = false) {
  if (_isFetching) return;
  _isFetching = true;
  updateSyncStatus("جاري مزامنة السلة المشتركة... 🔄");

  try {
    const { data, error } = await sb.from("procedures_catalog")
      .select("id, name, default_cost")
      .eq("category", "__zd_shared_cart__")
      .limit(1);

    if (error) {
      console.warn("Error fetching shared cart from Supabase:", error);
      updateSyncStatus();
      return;
    }

    if (data && data.length > 0 && data[0].name) {
      try {
        const parsed = JSON.parse(data[0].name);
        cart = (parsed.cart && typeof parsed.cart === 'object') ? parsed.cart : {};
        if (parsed.custom_items && typeof parsed.custom_items === 'object') {
          customItems = parsed.custom_items;
          saveCustomItemsLocal();
        }
        lastUpdatedBy = parsed.updated_by || "";
        lastUpdatedAt = parsed.updated_at || "";

        if (parsed.customer && typeof parsed.customer === 'object') {
          customerDetails = { ...customerDetails, ...parsed.customer };
          try {
            localStorage.setItem("zd_mat_customer", JSON.stringify(customerDetails));
          } catch (e) {}
        }

        saveCartLocal();
        matTabs();
        matRender();
        matTot();
        matRenderCart();
        updateSyncStatus();

        if (notifyUser && window.toast) {
          window.toast("تم تحديث ومزامنة السلة المشتركة للعيادة بنجاح 🔄");
        }
      } catch (parseErr) {
        console.warn("Could not parse shared cart json:", parseErr);
        updateSyncStatus();
      }
    } else {
      // First time initialization in DB
      await initSharedRecord();
    }
  } catch (e) {
    console.warn("Failed to fetch shared cart:", e);
    updateSyncStatus();
  } finally {
    _isFetching = false;
  }
}

async function initSharedRecord() {
  try {
    const payload = {
      cart: cart || {},
      custom_items: customItems || {},
      customer: customerDetails || {},
      updated_by: getCurrentUserName(),
      updated_at: new Date().toISOString()
    };
    await sb.from("procedures_catalog").insert({
      name: JSON.stringify(payload),
      default_cost: Object.keys(cart || {}).length,
      category: "__zd_shared_cart__"
    });
    updateSyncStatus();
  } catch (e) {
    console.warn("Failed to create initial shared cart row:", e);
  }
}

// 3. Push cart update to Supabase + Realtime broadcast
export function pushSharedCart(triggerBroadcast = true) {
  saveCartLocal();
  saveCustomItemsLocal();
  matTot();

  const userName = getCurrentUserName();
  const timestamp = new Date().toISOString();
  lastUpdatedBy = userName;
  lastUpdatedAt = timestamp;
  updateSyncStatus("جاري حفظ التعديل ومزامنته للجميع... ⏳");

  // A. Broadcast to other open tabs and devices instantly
  if (triggerBroadcast && typeof broadcastCartUpdate === 'function') {
    broadcastCartUpdate({
      client_id: CLIENT_ID,
      cart,
      custom_items: customItems,
      customer: customerDetails,
      updated_by: userName,
      updated_at: timestamp
    });
  }

  // B. Save to Supabase (debounced 400ms for rapid clicks)
  clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(async () => {
    try {
      const payload = {
        cart,
        custom_items: customItems,
        customer: customerDetails,
        updated_by: userName,
        updated_at: timestamp
      };

      const { error } = await sb.from("procedures_catalog")
        .update({
          name: JSON.stringify(payload),
          default_cost: Object.keys(cart).length
        })
        .eq("category", "__zd_shared_cart__");

      if (error) {
        console.warn("Supabase shared cart update error:", error);
      }
      updateSyncStatus();
    } catch (e) {
      console.warn("Failed to save shared cart to Supabase:", e);
      updateSyncStatus("تم الحفظ محلياً ⚠️");
    }
  }, 400);
}

// 4. Handle incoming updates from other users
export function handleIncomingCartUpdate(payload) {
  if (!payload || payload.client_id === CLIENT_ID) return;

  if (payload.cart && typeof payload.cart === 'object') {
    cart = payload.cart;
    if (payload.custom_items && typeof payload.custom_items === 'object') {
      customItems = payload.custom_items;
      saveCustomItemsLocal();
    }
    lastUpdatedBy = payload.updated_by || "عضو بالفريق";
    lastUpdatedAt = payload.updated_at || new Date().toISOString();

    if (payload.customer && typeof payload.customer === 'object') {
      customerDetails = { ...customerDetails, ...payload.customer };
      try {
        localStorage.setItem("zd_mat_customer", JSON.stringify(customerDetails));
      } catch (e) {}
    }

    saveCartLocal();
    matTabs();
    matRender();
    matTot();
    matRenderCart();
    updateSyncStatus();

    const sheet = $("sh-materials");
    if (sheet && sheet.classList.contains("open")) {
      if (window.toast) {
        window.toast(`🛒 قام ${lastUpdatedBy} بتحديث سلة الماتريال المشتركة`);
      }
    }
  }
}

// 5. Clear shared cart
export function matClearCart() {
  const count = Object.keys(cart).length;
  if (!count) {
    if (window.toast) window.toast("السلة فارغة بالفعل 🛒");
    return;
  }

  const confirmed = confirm("هل أنت متأكد من رغبتك في إفراغ السلة المشتركة للعيادة بالكامل؟\nسيتم حذف الأصناف لدى جميع مستخدمي النظام.");
  if (!confirmed) return;

  cart = {};
  pushSharedCart(true);
  matRender();
  matTot();
  matRenderCart();

  if (window.toast) {
    window.toast("تم إفراغ السلة المشتركة للعيادة بنجاح 🗑️");
  }
}

export function matClearAfterOrder() {
  const count = Object.keys(cart).length;
  if (count > 0) {
    const confirmed = confirm("تم تجهيز الطلب! هل تريد إفراغ السلة المشتركة الآن للبدء في طلب جديد للعيادة؟");
    if (confirmed) {
      cart = {};
      pushSharedCart(true);
      matRender();
      matTot();
    }
  }
  matShow("shop");
}

const $ = id => document.getElementById(id);
const fmt = n => (typeof n === 'number' ? n.toLocaleString("ar-EG") : n);

export function matShow(viewId) {
  const views = ["shop", "cart", "co", "inv"];
  views.forEach(v => {
    const el = $("mat-" + v);
    if (el) {
      if (v === "shop") {
        el.style.display = viewId === "shop" ? "block" : "none";
      } else {
        el.classList.toggle("on", viewId === v);
      }
    }
  });

  const bar = $("mat-bar");
  if (bar) {
    bar.style.display = viewId === "shop" ? "flex" : "none";
  }

  if (viewId === "cart") {
    matRenderCart();
  }

  if (viewId === "co") {
    // Populate saved delivery data if available
    try {
      const saved = customerDetails.nm ? customerDetails : JSON.parse(localStorage.getItem("zd_mat_customer") || "{}");
      const nmEl = $("mat-nm");
      const p1El = $("mat-p1");
      const p2El = $("mat-p2");
      const adEl = $("mat-ad");
      if (nmEl && !nmEl.value && saved.nm) nmEl.value = saved.nm;
      if (p1El && !p1El.value && saved.p1) p1El.value = saved.p1;
      if (p2El && !p2El.value && saved.p2) p2El.value = saved.p2;
      if (adEl && !adEl.value && saved.ad) adEl.value = saved.ad;
    } catch (e) {}
  }

  const body = $("sh-materials-body");
  if (body) body.scrollTop = 0;
  const sheet = $("sh-materials");
  if (sheet) sheet.scrollTop = 0;
}

export function getMatCategories() {
  const cats = new Set(matItems.map(i => i.c));
  Object.values(customItems || {}).forEach(ci => {
    if (ci.c) cats.add(ci.c);
  });
  return ["الكل", ...cats];
}

export function matTabs() {
  const tabsContainer = $("mat-tabs");
  if (!tabsContainer) return;
  const cats = getMatCategories();
  tabsContainer.innerHTML = cats.map(c => `
    <button type="button" class="${c === currentCat ? "on" : ""}" onclick="window.setMatCategory('${c}')">
      ${c}
    </button>
  `).join("");
}

export function setMatCategory(c) {
  currentCat = c;
  matTabs();
  matRender();
}

export function matRender() {
  const listEl = $("mat-list");
  if (!listEl) return;

  const qEl = $("mat-q");
  const s = (qEl?.value || "").trim().toLowerCase();

  // Combine standard catalog items + any user-added custom items
  const customs = Object.values(customItems || {});
  const allItems = [...matItems, ...customs];

  const filtered = allItems.filter(i => {
    const matchCat = currentCat === "الكل" || i.c === currentCat;
    const matchSearch = !s ||
      (i.n && i.n.toLowerCase().includes(s)) ||
      (i.c && i.c.toLowerCase().includes(s)) ||
      (i.note && i.note.toLowerCase().includes(s));
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    const escapedSearch = s.replace(/'/g, "\\'");
    listEl.innerHTML = `
      <div class="mat-empty-search-card">
        <div style="font-size:32px;margin-bottom:8px">🔍</div>
        <div style="font-size:16px;font-weight:700;color:var(--mat-tx)">
          ${s ? `لم يتم العثور على "${s}" في القائمة` : "لا توجد أصناف في هذا القسم حالياً"}
        </div>
        <div style="font-size:13px;color:var(--mat-mut);margin:6px 0 16px">
          ${s ? "هل تحتاج هذه الخامة للعيادة؟ يمكنك إضافتها مباشرة إلى السلة المشتركة فوراً!" : "يمكنك إضافة صنف خاص غير مدرج بالقائمة بنقرة واحدة."}
        </div>
        <button type="button" class="mat-btn" onclick="window.openAddCustomMatModal('${escapedSearch}')">
          ➕ إضافة ${s ? `"${s}"` : "صنف جديد"} للسلة المشتركة
        </button>
      </div>
    `;
    matTot();
    return;
  }

  listEl.innerHTML = filtered.map(i => {
    const q = cart[i.id] || 0;
    const isCustom = !!i.is_custom;
    const priceDisplay = (i.p && i.p > 0)
      ? `${fmt(i.p)} ج`
      : `<span style="color:#d97706;font-size:12px;font-weight:700">حسب الفاتورة</span>`;

    return `
      <div class="mat-it ${isCustom ? "mat-it-custom" : ""}">
        ${renderMatThumb(i, 'md')}
        <div class="mat-n">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span>${i.n}</span>
            ${isCustom ? `<span class="mat-custom-badge">⭐ طلب خاص</span>` : ""}
          </div>
          <div class="mat-p">
            ${priceDisplay}
            <span style="font-size:12px;color:var(--mat-mut);font-weight:normal">(${i.c || "عام"})</span>
          </div>
          ${i.note ? `<div style="font-size:12px;color:var(--mat-mut);margin-top:2px">📝 ${i.note}</div>` : ""}
        </div>
        ${q ? `
          <div class="mat-q">
            <button type="button" onclick="window.matCh('${i.id}', -1)">−</button>
            <b>${q}</b>
            <button type="button" onclick="window.matCh('${i.id}', 1)">+</button>
          </div>
        ` : `
          <button type="button" class="mat-add" onclick="window.matCh('${i.id}', 1)">أضف</button>
        `}
      </div>
    `;
  }).join("");

  matTot();
}

export function matCh(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) {
    delete cart[id];
  }
  pushSharedCart(true);
  matRender();

  const cartEl = $("mat-cart");
  if (cartEl && cartEl.classList.contains("on")) {
    matRenderCart();
  }
}

export function matRemoveItem(id) {
  if (cart[id] !== undefined) {
    delete cart[id];
    pushSharedCart(true);
    matRender();
    matTot();
    matRenderCart();
    if (window.toast) {
      window.toast("تمت إزالة الصنف من السلة المشتركة 🗑️");
    }
  }
}

export function matLines() {
  return Object.keys(cart).map(id => {
    let item = customItems[id];
    if (!item) {
      item = matItems.find(i => String(i.id) === String(id)) || matItems[Number(id)];
    }
    if (!item) return null;
    return {
      ...item,
      q: cart[id]
    };
  }).filter(Boolean);
}

export function matTotal() {
  return matLines().reduce((acc, line) => acc + ((Number(line.p) || 0) * (Number(line.q) || 0)), 0);
}

export function matTot() {
  const cntEl = $("mat-cnt");
  const sumEl = $("mat-sum");
  const badgeEl = $("mat-hdr-badge");
  const totalCount = Object.keys(cart).length;
  const totalPrice = matTotal();

  if (cntEl) cntEl.textContent = fmt(totalCount);
  if (sumEl) sumEl.textContent = fmt(totalPrice);

  if (badgeEl) {
    if (totalCount > 0) {
      badgeEl.textContent = fmt(totalCount);
      badgeEl.style.display = "inline-flex";
    } else {
      badgeEl.style.display = "none";
    }
  }
}

export function matRenderCart() {
  const cartBody = $("mat-cartbody");
  const ctotEl = $("mat-ctot");
  if (!cartBody) return;

  const lines = matLines();
  if (!lines.length) {
    cartBody.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--mat-mut)">
        <div style="font-size:36px;margin-bottom:8px">🛒</div>
        <div style="font-size:16px;font-weight:700">السلة فارغة حالياً</div>
        <div style="font-size:13px;margin-top:6px;margin-bottom:14px">قم بإضافة مستلزمات العيادة من قائمة الأصناف أو أضف صنفاً غير موجود</div>
        <button type="button" class="mat-btn" onclick="window.openAddCustomMatModal()">➕ إضافة صنف غير موجود للسلة</button>
      </div>
    `;
    if (ctotEl) ctotEl.textContent = "0";
    return;
  }

  cartBody.innerHTML = lines.map(line => {
    const isCustom = !!line.is_custom;
    const hasPrice = Number(line.p) > 0;
    const priceText = hasPrice
      ? `${fmt(line.p * line.q)} ج <span style="font-size:12px;color:var(--mat-mut);font-weight:normal">(${fmt(line.p)} ج × ${line.q})</span>`
      : `<span style="color:#d97706;font-size:12.5px;font-weight:700">السعر عند التوريد / حسب الفاتورة</span>`;

    return `
      <div class="mat-it ${isCustom ? "mat-it-custom" : ""}">
        ${renderMatThumb(line, 'sm')}
        <div class="mat-n">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span>${line.n}</span>
            ${isCustom ? `<span class="mat-custom-badge">⭐ طلب خاص</span>` : ""}
          </div>
          <div class="mat-p">${priceText}</div>
          ${line.note ? `<div style="font-size:12px;color:var(--mat-mut);margin-top:2px">📝 ${line.note}</div>` : ""}
          ${isCustom && line.added_by ? `<div style="font-size:11px;color:var(--mat-mut);margin-top:1px">بواسطة: ${line.added_by}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="mat-q">
            <button type="button" onclick="window.matCh('${line.id}', -1)">−</button>
            <b>${line.q}</b>
            <button type="button" onclick="window.matCh('${line.id}', 1)">+</button>
          </div>
          <button type="button" class="mat-del-btn" onclick="window.matRemoveItem('${line.id}')" title="حذف الصنف من السلة">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  if (ctotEl) ctotEl.textContent = fmt(matTotal());
}

// --------------------------------------------------
// Custom Unlisted Material Modal Handlers
// --------------------------------------------------
export function openAddCustomMatModal(prefillName = "") {
  const modal = $("mat-custom-modal");
  if (!modal) return;

  const nameInput = $("mat-ci-name");
  const priceInput = $("mat-ci-price");
  const qtyInput = $("mat-ci-qty");
  const noteInput = $("mat-ci-note");
  const catInput = $("mat-ci-cat");
  const imgInput = $("mat-ci-img");

  if (nameInput) nameInput.value = prefillName || "";
  if (priceInput) priceInput.value = "";
  if (qtyInput) qtyInput.value = "1";
  if (noteInput) noteInput.value = "";
  if (imgInput) imgInput.value = "";
  if (catInput && currentCat !== "الكل") {
    catInput.value = currentCat;
  }

  modal.style.display = "flex";
  setTimeout(() => {
    if (nameInput) {
      nameInput.focus();
      if (prefillName) nameInput.select();
    }
  }, 80);
}

export function closeAddCustomMatModal() {
  const modal = $("mat-custom-modal");
  if (modal) modal.style.display = "none";
}

// Material Item Quick Preview Modal
export function previewMatItem(id, event) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }

  let item = customItems[id];
  if (!item) {
    item = matItems.find(i => String(i.id) === String(id)) || matItems[Number(id)];
  }
  if (!item) return;

  const config = getCategoryVisualConfig(item.c, item.n);
  const q = cart[item.id] || 0;
  const isCustom = !!item.is_custom;
  const hasPrice = Number(item.p) > 0;
  const hasImg = item.img && (typeof item.img === 'string') && item.img.trim().startsWith('http');
  const safeName = (item.n || '').replace(/"/g, '&quot;');
  const safeId = String(item.id);

  const modal = $("mat-preview-modal");
  const card = $("mat-preview-card");
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="mat-modal-hdr" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:12px;background:${config.gradient};color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.15)">
          ${item.c || "عام"}
        </span>
        ${isCustom ? `<span class="mat-custom-badge">⭐ طلب خاص</span>` : ""}
      </div>
      <button type="button" class="mat-modal-close" onclick="window.closeMatPreviewModal()" title="إغلاق">✕</button>
    </div>

    <div class="mat-preview-modal-body">
      <div class="mat-preview-hero-thumb" style="background:${config.gradient}">
        ${hasImg
          ? `<img src="${item.img.replace(/"/g, '&quot;')}" alt="${safeName}" onerror="this.parentElement.innerHTML = '${config.svg.replace(/'/g, "\\'")}';" />`
          : config.svg
        }
      </div>

      <h3 style="font-size:17px;font-weight:700;margin:0 0 6px;color:var(--mat-tx);line-height:1.4">
        ${item.n}
      </h3>

      <div style="font-size:19px;font-weight:800;color:var(--mat-pr);margin-bottom:12px">
        ${hasPrice ? `${fmt(item.p)} ج.م` : `<span style="color:#d97706;font-size:14px">السعر عند التوريد / حسب الفاتورة</span>`}
      </div>

      ${item.note ? `<div style="background:var(--mat-bg);border:1px solid var(--mat-bd);border-radius:10px;padding:8px 12px;font-size:13px;color:var(--mat-mut);margin-bottom:14px;width:100%">📝 ${item.note}</div>` : ""}
      ${isCustom && item.added_by ? `<div style="font-size:12px;color:var(--mat-mut);margin-bottom:12px">أضيف بواسطة: <b>${item.added_by}</b></div>` : ""}

      <div style="display:flex;align-items:center;justify-content:center;gap:12px;width:100%;margin-top:10px">
        <div class="mat-q" style="padding:6px;border-radius:10px">
          <button type="button" onclick="window.matCh('${safeId}', -1); window.previewMatItem('${safeId}')" style="min-width:38px;height:38px;font-size:20px">−</button>
          <b style="min-width:36px;font-size:16px">${q}</b>
          <button type="button" onclick="window.matCh('${safeId}', 1); window.previewMatItem('${safeId}')" style="min-width:38px;height:38px;font-size:20px">+</button>
        </div>
        ${q === 0 ? `
          <button type="button" class="mat-btn" onclick="window.matCh('${safeId}', 1); window.previewMatItem('${safeId}')" style="flex:1">
            🛒 أضف للسلة
          </button>
        ` : `
          <button type="button" class="mat-btn" onclick="window.closeMatPreviewModal(); window.matShow('cart')" style="flex:1">
            عرض السلة (${q}) ←
          </button>
        `}
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

export function closeMatPreviewModal() {
  const modal = $("mat-preview-modal");
  if (modal) modal.style.display = "none";
}

export function changeCustomMatModalQty(delta) {
  const input = $("mat-ci-qty");
  if (!input) return;
  let val = parseInt(input.value || "1", 10) + delta;
  if (isNaN(val) || val < 1) val = 1;
  input.value = val;
}

export function handleCustomMatSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = ($("mat-ci-name")?.value || "").trim();
  if (!name) {
    if (window.toast) window.toast("يرجى إدخال اسم الصنف أو الخامة المطلوبة ⚠️");
    else alert("اكتب اسم الصنف");
    return;
  }

  const rawPrice = $("mat-ci-price")?.value;
  const price = (rawPrice !== "" && !isNaN(Number(rawPrice)) && Number(rawPrice) >= 0)
    ? Number(rawPrice)
    : 0;

  const rawQty = $("mat-ci-qty")?.value;
  const qty = (!isNaN(parseInt(rawQty, 10)) && parseInt(rawQty, 10) > 0)
    ? parseInt(rawQty, 10)
    : 1;

  const cat = ($("mat-ci-cat")?.value || "طلب خاص / غير مدرج").trim();
  const note = ($("mat-ci-note")?.value || "").trim();
  const img = ($("mat-ci-img")?.value || "").trim();

  // Create unique id for the custom material
  const customId = "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const customItem = {
    id: customId,
    n: name,
    p: price,
    c: cat,
    note: note,
    img: img,
    is_custom: true,
    added_by: getCurrentUserName(),
    created_at: new Date().toISOString()
  };

  customItems[customId] = customItem;
  cart[customId] = (cart[customId] || 0) + qty;

  saveCustomItemsLocal();
  saveCartLocal();
  pushSharedCart(true);

  closeAddCustomMatModal();
  matTabs();
  matRender();
  matTot();
  matRenderCart();

  if (window.toast) {
    window.toast(`🛒 تمت إضافة "${name}" (${qty}x) إلى السلة المشتركة`);
  }
}

export function matMakeInv() {
  const lines = matLines();
  if (!lines.length) {
    if (window.toast) window.toast("السلة فارغة، يرجى إضافة أصناف أولاً 🛒");
    else alert("السلة فاضية");
    return;
  }

  const nm = ($("mat-nm")?.value || "").trim();
  const p1 = ($("mat-p1")?.value || "").trim();
  const p2 = ($("mat-p2")?.value || "").trim();
  const ad = ($("mat-ad")?.value || "").trim();

  if (!nm || !p1 || !ad) {
    if (window.toast) window.toast("يرجى كتابة الاسم ورقم الموبايل والعنوان بالتفصيل ⚠️");
    else alert("اكتب الاسم ورقم موبايل والعنوان");
    return;
  }

  // Save details for future orders locally and in shared clinic record
  customerDetails = { nm, p1, p2, ad };
  try {
    localStorage.setItem("zd_mat_customer", JSON.stringify(customerDetails));
  } catch (e) {}
  pushSharedCart(true);

  const invInfoEl = $("mat-invinfo");
  if (invInfoEl) {
    const todayStr = new Date().toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric"
    });
    invInfoEl.innerHTML = `
      <div style="background:var(--mat-card);border:1px solid var(--mat-bd);border-radius:10px;padding:12px 14px;margin-bottom:14px;line-height:1.7;font-size:14px">
        <div><b>التاريخ:</b> ${todayStr}</div>
        <div><b>اسم الطبيب / العيادة:</b> ${nm}</div>
        <div><b>رقم الموبايل:</b> ${p1}${p2 ? " — " + p2 : ""}</div>
        <div><b>عنوان التوصيل:</b> ${ad}</div>
      </div>
    `;
  }

  const invtEl = $("mat-invt");
  if (invtEl) {
    invtEl.innerHTML = `
      <thead>
        <tr>
          <th>الصنف</th>
          <th style="width:50px;text-align:center">العدد</th>
          <th style="width:85px">السعر</th>
          <th style="width:95px">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map(line => {
          const hasPrice = Number(line.p) > 0;
          return `
            <tr>
              <td>
                <b>${line.n}</b>
                ${line.is_custom ? `<span style="display:inline-block;margin-right:6px;font-size:11px;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:4px;font-weight:700">طلب خاص</span>` : ""}
                ${line.note ? `<div style="font-size:12px;color:var(--mat-mut);margin-top:2px">📝 ${line.note}</div>` : ""}
              </td>
              <td style="text-align:center">${line.q}</td>
              <td>${hasPrice ? `${fmt(line.p)} ج` : "حسب الفاتورة"}</td>
              <td><b>${hasPrice ? `${fmt(line.p * line.q)} ج` : "—"}</b></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    `;
  }

  const invTotEl = $("mat-invtot");
  if (invTotEl) {
    invTotEl.innerHTML = `الإجمالي: <span>${fmt(matTotal())} ج</span> <span style="font-size:13px;font-weight:normal;color:var(--mat-mut)">(بدون مصاريف الشحن)</span>`;
  }

  matShow("inv");
}

export function matWa() {
  const lines = matLines();
  if (!lines.length) {
    if (window.toast) window.toast("السلة فارغة");
    return;
  }

  const nm = ($("mat-nm")?.value || "").trim();
  const p1 = ($("mat-p1")?.value || "").trim();
  const p2 = ($("mat-p2")?.value || "").trim();
  const ad = ($("mat-ad")?.value || "").trim();

  let t = "🦷 *أوردر ماتريال العيادة*\n";
  t += "━━━━━━━━━━━━━━━━━━━━\n";
  lines.forEach(line => {
    const customTag = line.is_custom ? " [طلب خاص]" : "";
    const noteStr = line.note ? ` (ملاحظة: ${line.note})` : "";
    const priceStr = (Number(line.p) > 0)
      ? `${fmt(line.p * line.q)} ج`
      : "(السعر عند التوريد)";
    t += `• ${line.n}${customTag}${noteStr} × ${line.q} = ${priceStr}\n`;
  });
  t += "━━━━━━━━━━━━━━━━━━━━\n";
  t += `💰 *الإجمالي:* ${fmt(matTotal())} ج (بدون الشحن)\n\n`;
  t += `👤 *الاسم / العيادة:* ${nm || "—"}\n`;
  t += `📱 *الموبايل:* ${p1}${p2 ? " / " + p2 : ""}\n`;
  t += `📍 *العنوان:* ${ad || "—"}\n`;
  t += `📅 *التاريخ:* ${new Date().toLocaleDateString("ar-EG")}\n`;

  const waUrl = "https://wa.me/?text=" + encodeURIComponent(t);
  window.open(waUrl, "_blank");
}

export function matPrint() {
  document.body.classList.add("printing-mat-invoice");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing-mat-invoice");
  }, 1000);
}

export function initMaterialsMarket() {
  matTabs();
  matRender();
  matShow("shop");
  fetchSharedCart();
}

// Auto init on import and fetch shared cart in background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchSharedCart();
  }, 100);
}
