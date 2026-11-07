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

export const RAW_MATERIALS = `Anesthesia (بنج وتخدير)|Dental Anesthesia Blue (Articaine 4% w/ Epinephrine 1:100,000)|877.5||بنج أزرق 877.5ج
Anesthesia (بنج وتخدير)|Artipharma Dental Anesthesia (Articaine / Epinephrine)|977.5||بنج أرتفارما 977.5ج
Anesthesia (بنج وتخدير)|Dental Anesthesia Red Strip (Mepivacaine 3% Plain)|275||شريط البنج الأحمر 275ج
Anesthesia (بنج وتخدير)|Italian Dental Anesthesia (Pierrel / Orabloc)|1200||بنج إيطالي 1200ج
Anesthesia (بنج وتخدير)|Spanish Dental Anesthesia (Inibsa)|1557.5||بنج إسباني 1557.5ج
Anesthesia (بنج وتخدير)|Topical Anesthetic Gel / Spray 25g|25||بنج جل أو سبراي 25ج
Anesthesia (بنج وتخدير)|Dental Cartridge Aspirating Syringe|162||سيرنج الأنسيزيا 162ج
Anesthesia (بنج وتخدير)|Dental Injection Needles Long (Chinese 100 pcs)|175||سنون بنج لونج صيني 175ج
Anesthesia (بنج وتخدير)|Dental Injection Needles Short (Chinese 100 pcs)|185||سنون بنج شورت صيني 185ج
Composite (كمبوزيت)|Composite Chroma Nano-Hybrid Syringe 4.5g|165||كمبوزيت Chroma النانو هيبريد (4.5 جم) 165ج
Composite (كمبوزيت)|Composite M Dental Syringe 4g|175||كمبوزيت M dental بـ 175ج
Composite (كمبوزيت)|Composite Ruby Syringe 4g|175||كمبوزيت روبي 175ج
Composite (كمبوزيت)|Composite Clara Syringe 4g|185||كمبوزيت كلارا 185ج
Composite (كمبوزيت)|Composite Prime-Dent Syringe 4g|185||كمبوزيت برايم دنت 185ج
Composite (كمبوزيت)|Composite Compomax Syringe (+ Free Bond Brushes)|210||كمبوزيت كمبوماكس (+ فرش بوند هدية) 210ج
Composite (كمبوزيت)|Composite Meta Syringe 4g|275||كمبوزيت ميتا 275ج
Composite (كمبوزيت)|Composite i.light Syringe 4g|350||كمبوزيت i.light بـ 350ج
Composite (كمبوزيت)|Composite DiaFil (DiaDent) Syringe 4g|360||كمبوزيت Dia fill بـ 360ج
Composite (كمبوزيت)|Composite Dolgunn Syringe 4g|375||كمبوزيت Dolgunn بـ 375ج
Composite (كمبوزيت)|Composite Italian Di.fill Syringe 4g|450||كمبوزيت D.fill إيطالي 450ج
Composite (كمبوزيت)|Composite Nova Syringe 4g|465||كمبوزيت نوڤا 465ج
Composite (كمبوزيت)|Composite Coltene Brilliant NG Syringe 4g|465||كمبوزيت كولتين NG بـ 465ج
Composite (كمبوزيت)|Composite Es.Com Syringe 4g|480||كمبوزيت Es.Com بـ 480ج
Composite (كمبوزيت)|Composite Charisma Classic (Kulzer) Syringe 4g|525||كمبوزيت كاريزما 525ج
Composite (كمبوزيت)|Composite Kerr Herculite Précis Syringe 4g|560||كمبوزيت كيرر kerr بـ 560ج
Composite (كمبوزيت)|Composite DenFil Micro-Hybrid (Vericom Korea)|575||كمبوزيت Den fill مايكرو كوري أصلي 575ج
Composite (كمبوزيت)|Composite Cavex Syringe 4g|580||كمبوزيت Cavex بـ 580ج
Composite (كمبوزيت)|Composite DenFil Nano-Hybrid (Vericom Korea)|675||كمبوزيت Den fill نانو كوري أصلي 675ج
Composite (كمبوزيت)|Composite Composan (PROMEDICA Germany)|670||كمبوزيت كمبوزان Composan بـ 670ج
Composite (كمبوزيت)|Composite Itena Syringe 4g|740||كمبوزيت أيتينا itena بـ 740ج
Composite (كمبوزيت)|Composite KaVo Universal Syringe 4g|765||كمبوزيت كابو يونيڤرسال 765ج
Composite (كمبوزيت)|Composite Coltene EverGlow Syringe 3g|825||كمبوزيت كولتين Everglow بـ 825ج
Composite (كمبوزيت)|Composite VOCO Polofil / Grandio NHT Syringe|1160||كمبوزيت Voco NHT بـ 1160ج
Composite (كمبوزيت)|Composite Tetric N-Ceram (Ivoclar) Syringe 3.5g|1240||كمبوزيت تيترك إن سيرام 1240ج
Composite (كمبوزيت)|Composite Tokuyama Omnichroma Syringe|1375||كمبوزيت توكوياما اومنيكروما 1375ج
Composite (كمبوزيت)|Composite Tokuyama Omnichroma Blocker Syringe|1375||كمبوزيت توكوياما بلوكر 1375ج
Composite (كمبوزيت)|Master-Dent Orthodontic Light-Cure Bonding Kit|1360||كيت كمبوزيت ماستر دنت للتقويم بالبوند 1360ج
Composite (كمبوزيت)|Kerr Composite Restorative Master Kit|2825||كيت كمبوزيت كيرر kerr بـ 2825ج
Composite (كمبوزيت)|Composite Compules (Dentsply Sirona)|160||كبسولات كمبوزيت دنت سبلاي 160ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Hi.fill Syringe 2g|110||فلوابل Hi.fill بـ 110ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Max Fill Syringe 2g|115||فلوابل ماكس فيل Max fill بـ 115ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Elite Syringe 2g|125||فلوابل elite بـ 125ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Ruby Syringe 2g|175||فلوابل روبي 175ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Alpha Syringe 2g|185||فلوابل ألفا 185ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Te.com Syringe 2g|210||فلوابل Te.com بـ 210ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Di.fill Syringe 2g|215||فلوابل D.fill بـ 215ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Nova Syringe 2g|230||فلوابل نوڤا 230ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite DiaFil Flow (DiaDent)|255||فلوابل Dia fill بـ 255ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Spident EsFlow Syringe|265||فلوابل سبايدنت 265ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Meta Nexcomp Flow|280||فلوابل ميتا 280ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Any-Flow Syringe 2g|285||فلوابل Any بـ 285ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Coltene Brilliant Flow|295||فلوابل كولتين 295ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Bulk Fill Any Syringe|325||فلوابل بلك فيل any بـ 325ج
Flowable & Bond (فلوابل وبوند)|Flowable Composite Bulk Fill Syringe|335||فلوابل بلك فيل 335ج
Flowable & Bond (فلوابل وبوند)|Flowable Bulk Fill Compules (Dentsply Sirona)|155||كبسولات فلوابل بلك فيل Dentsply Sirona بـ 155ج
Flowable & Bond (فلوابل وبوند)|Compomax Dental Adhesive Bond|225||بوند كمبوماكس 225ج
Flowable & Bond (فلوابل وبوند)|Clara Dental Adhesive Bond 5ml (Turkey)|345||بوند تركي Clara بـ 345ج
Flowable & Bond (فلوابل وبوند)|Meta P&Bond Total-Etch 5ml (Korea)|435||بوند Meta 5ml الكوري التوتال إيتش 435ج
Flowable & Bond (فلوابل وبوند)|Any-Bond Total-Etch 5ml (Korea)|475||بوند Any 5ml الكوري التوتال إيتش 475ج
Flowable & Bond (فلوابل وبوند)|Bisco All-Bond Universal (Small Bottle)|450||بوند بيسكو الصغير 450ج
Flowable & Bond (فلوابل وبوند)|Flibro Universal Adhesive Bond|645||بوند فليبرو Flibro بـ 645ج
Flowable & Bond (فلوابل وبوند)|Coltene One Coat 7 Universal Bond 5ml|650||بوند كولتين 5ml OneCoat بـ 650ج
Flowable & Bond (فلوابل وبوند)|Tokuyama Universal Bond Quick 1ml|665||توكوياما 1 مللي يونيفرسال 665ج
Flowable & Bond (فلوابل وبوند)|Ultra Dental Adhesive Bond 6ml|875||بوند ألترا Ultra 6 ml بـ 875ج
Flowable & Bond (فلوابل وبوند)|Kerr OptiBond Universal Adhesive 5ml|1625||بوند كيرر 5 مللي يونيڤرسال 1625ج
Flowable & Bond (فلوابل وبوند)|Bisco All-Bond Universal Jumbo Size (Original Large)|2150||بوند بيسكو الكبير خالص الأصلي 2150ج
Flowable & Bond (فلوابل وبوند)|Z-Prime Plus Metal / Zirconia Primer (Egyptian)|275||الـ z.prime r مصري 275ج
Flowable & Bond (فلوابل وبوند)|Universal Dental Primer (Egyptian)|245||الـ primer مصري 245ج
Flowable & Bond (فلوابل وبوند)|Dentaleen Phosphoric Acid Etchant Gel 5gm|45||أسيد إيتش Dentaleen 5gm بـ 45ج
Flowable & Bond (فلوابل وبوند)|Chem Dental Etch Gel|25||أسيد إيتش chem بـ 25ج
Flowable & Bond (فلوابل وبوند)|Plus Dental Etch Gel|45||أسيد إيتش plus بـ 45ج
Flowable & Bond (فلوابل وبوند)|Kerr Gel Etchant 37.5%|65||أسيد إيتش كيرر 65ج
Flowable & Bond (فلوابل وبوند)|Meta Dental Etchant Gel|98||إيتش ميتا 98ج
Flowable & Bond (فلوابل وبوند)|Acid Etch & Flowable Applicator Dispensing Tips (Single)|1||تيبات الأسيد إيتش أو الفلوابل 1ج
Flowable & Bond (فلوابل وبوند)|Microbrush Bond Applicators (Large Pack)|28||فرش البوند 28ج
Endodontics (علاج جذور وأندو)|Biner LC Light-Cured Calcium Hydroxide Base/Liner|255||الكالسيوم هيدروكسيد لايت كيور Biner LC بـ 255ج
Endodontics (علاج جذور وأندو)|Caviline Calcium Hydroxide Paste (2-Tube System)|325||كالسيوم هيدروكسيد ديكال إنجليزي Caviline بـ 325ج
Endodontics (علاج جذور وأندو)|TubliCem Zinc Oxide Eugenol Root Canal Sealer|225||زيكال إنجليزي TubliCem بـ 225ج
Endodontics (علاج جذور وأندو)|Galaxy Temporary Cavity Filling|75||الحشو المؤقت Galaxy بـ 75ج
Endodontics (علاج جذور وأندو)|Acrotemp Temporary Cavity Filling|85||الحشو المؤقت أكروتيمب 85ج
Endodontics (علاج جذور وأندو)|T-Fill Temporary Cavity Filling|155||حشو مؤقت T.fill بـ 155ج
Endodontics (علاج جذور وأندو)|PSP English Temporary Cavity Filling|168||حشو مؤقت إنجليزي PSP بـ 168ج
Endodontics (علاج جذور وأندو)|Orafil-G Temporary Cavity Filling (India)|185||حشو مؤقت هندي orafill بـ 185ج
Endodontics (علاج جذور وأندو)|D.Vital Pulp Devitalizer (Non-Arsenic Paste)|410||الـ D.vital (pulp devitalizer) بـ 410ج
Endodontics (علاج جذور وأندو)|MTA jk Mineral Trioxide Aggregate (3 Vials Pack)|125||علبة MTA jk (3 عبوات) 125ج
Endodontics (علاج جذور وأندو)|MTA Single Dose Vial|30||عبوة MTA بـ 30ج
Endodontics (علاج جذور وأندو)|One-Fill MTA Bioceramic Putty 0.5g Syringe (Korea)|520||سرنجة MTA putty نصف جرام one fill كوري 520ج
Endodontics (علاج جذور وأندو)|D-Seal Root Canal Sealer (Student Size)|175||سيلر D.seal حجم الطلبة 175ج
Endodontics (علاج جذور وأندو)|D-Seal Root Canal Sealer (Large Size)|375||سيلر D.seal الحجم الكبير 375ج
Endodontics (علاج جذور وأندو)|Plus Paste / Apex Root Canal Filling Material|135||بيست أو بيكس شركة plus بـ 135ج
Endodontics (علاج جذور وأندو)|Han-Seal Resin Root Canal Sealer|495||سيلر Han Seal بـ 495ج
Endodontics (علاج جذور وأندو)|Xical Automix Root Canal Sealer|560||سيلر زيكال أوتوميكس 560ج
Endodontics (علاج جذور وأندو)|Vioseal Root Canal Sealer (Spident)|685||سيلر Vioseal spident بـ 685ج
Endodontics (علاج جذور وأندو)|Any-Seal Epoxy Root Canal Sealer|695||سيلر Anyseal بـ 695ج
Endodontics (علاج جذور وأندو)|Meta Adseal Resin Root Canal Sealer|795||سيلر ميتا أديسيل Adseal بـ 795ج
Endodontics (علاج جذور وأندو)|Diaproseal Root Canal Sealer (DiaDent)|1385||سيلر ديابروسيل Diaproseal بـ 1385ج
Endodontics (علاج جذور وأندو)|Metapaste / Metabex (Korea)|525||ميتابكس أو ميتابيست كوري 525ج
Endodontics (علاج جذور وأندو)|Calcipex / Calcipaste Calcium Hydroxide Paste|135||كالسيبيكس Calcipex أو كالسيبيست 135ج
Endodontics (علاج جذور وأندو)|N-Root SP Bioceramic Sealer 0.5g|435||بيوسيراميك سيلر N Root SP 0.5g بـ 435ج
Endodontics (علاج جذور وأندو)|Well-Root ST Bioceramic Sealer 0.5g|775||بيوسيراميك سيلر Well Root 0.5g بـ 775ج
Endodontics (علاج جذور وأندو)|N-Root SP Bioceramic Sealer 2g|1525||بيوسيراميك سيلر N Root SP 2g بـ 1525ج
Endodontics (علاج جذور وأندو)|One-Fill Bioceramic Sealer 2g (Korea)|1775||بيوسيراميك سيلر كوري OneFill 2g بـ 1775ج
Endodontics (علاج جذور وأندو)|Ceraseal Bioceramic Sealer 0.5g (Meta Biomed)|975||بيوسيراميك سيلر Ceraseal ميتا 0.5g بـ 975ج
Endodontics (علاج جذور وأندو)|Ceraseal Bioceramic Sealer 2g (Meta Biomed)|1825||بيوسيراميك سيلر Ceraseal ميتا 2g بـ 1825ج
Endodontics (علاج جذور وأندو)|Irrigation Syringes 3ml Lock (Carton 100 pcs)|125||كرتونة سرنجات إيريجيشن 100 قطعة 3سم 125ج
Endodontics (علاج جذور وأندو)|Irrigation Needles 3ml Luer Lock (Carton 100 pcs)|125||كرتونة نيدلز إيريجيشن 3سم لوك 125ج
Endodontics (علاج جذور وأندو)|Side-Vented Endodontic Irrigation Needles Box (100 pcs)|185||علبة side-vented needles بـ 185ج
Endodontics (علاج جذور وأندو)|Side-Vented Endodontic Irrigation Needle (Single)|4||قطعة side-vented needle بـ 4ج
Endodontics (علاج جذور وأندو)|Endodontic Irrigation Solution (Betadine / Saline / H2O2 / NaCl / CHX)|27||إيريجيشن بيتادين أو سلاين أو هيدروجين بيروكسيد 27ج
Endodontics (علاج جذور وأندو)|Saline / Sodium Hypochlorite / Chlorhexidine Irrigation|32||إيريجيشن سلاين أو صوديوم هيبوكلوريد أو كلورهيكسيدين 32ج
Endodontics (علاج جذور وأندو)|EDTA Gel 17% (Root Canal Lubricant)|75||أيديتا جل 75ج
Endodontics (علاج جذور وأندو)|EDTA Solution 17% (Root Canal Chelation)|75||أيديتا سوليوشن 75ج
Endodontics (علاج جذور وأندو)|Formocresol jk|70||فورماكريزول jk بـ 70ج
Endodontics (علاج جذور وأندو)|Zinc Oxide Powder jk|35||زينك أوكسيد jk بـ 35ج
Endodontics (علاج جذور وأندو)|Eugenol Liquid jk|70||إيجينول jk بـ 70ج
Endodontics (علاج جذور وأندو)|Calcium Oxide jk|45||كالسيوم أوكسيد jk بـ 45ج
Endodontics (علاج جذور وأندو)|Fluoride Varnish jk Bottle|75||عبوة فلورايد ڤارنش Varnish jk بـ 75ج
Endodontics (علاج جذور وأندو)|Fluoride Varnish Sticks Applicators|85||ڤارنش ستيك 85ج
Endodontics (علاج جذور وأندو)|Gutta Percha Solvent Carven (Egyptian)|65||جاتابركا سولڤنت Carven مصري 65ج
Endodontics (علاج جذور وأندو)|Endo Ice Spray (Pulp Vitality Tester)|725||إندو آيس Endo Ice بـ 725ج
Endodontics (علاج جذور وأندو)|Endo Ring / Finger Ruler (Standard / Ring)|35||مسطرة إندو Endo Ruler خاتم أو عادية 35ج
Endodontics (علاج جذور وأندو)|Bur & File Holder Box (Rootex)|125||علبة البيرات والفايل هولدر Rootex بـ 125ج
Endodontics (علاج جذور وأندو)|Citizen Magnetic Bur Holder Block|45||البيرهولدر Citizen بـ 45ج
Endodontics (علاج جذور وأندو)|Endodontic Metal Posts Key / Wrench|35||مفتاح البوست الميتال 35ج
Endodontics (علاج جذور وأندو)|Metal Post Kit with Key (Chinese 240 pcs)|925||كيت الميتال بوست الصيني بالكي (240 قطعة) 925ج
Endodontics (علاج جذور وأندو)|Crown Cutter / Transmetal Carbide Bur|75||كراون كتر Crown cutter أو Transmetal burr بـ 75ج
Endodontics (علاج جذور وأندو)|Zincenol Cavity Liner & Base (Egyptian)|125||الزينكنول المصري 125ج
Endodontics (علاج جذور وأندو)|Zincenol Powder & Liquid (Indian)|550||الزينكنول الهندي 550ج
Endodontics (علاج جذور وأندو)|Manual Endodontic Files (Chinese Standard)|45||فايلات مانيوال صيني 45ج
Endodontics (علاج جذور وأندو)|Manual Endodontic Files (Long 28/31mm)|55||فايلات مانيوال لونج 55ج
Endodontics (علاج جذور وأندو)|Manual Endodontic Spreaders|50||سبريدر مانيوال 50ج
Endodontics (علاج جذور وأندو)|NIC High Quality Manual Files|55||مانيوال NIC كوالتي عالي 55ج
Endodontics (علاج جذور وأندو)|Mani K-Files Original Japan (Standard Assorted)|168||فايلات ماني الأصلي 168ج
Endodontics (علاج جذور وأندو)|Mani K-Files Size 08 (Original Japan)|220||فايلات K ماني مقاس 8 أصلي 220ج
Endodontics (علاج جذور وأندو)|Mani K-Files Size 10 (Original Japan)|220||فايلات K ماني مقاس 10 أصلي 220ج
Endodontics (علاج جذور وأندو)|Mani K-Files Size 15 (Original Japan)|185||فايلات K ماني مقاس 15 أصلي 185ج
Endodontics (علاج جذور وأندو)|Mani K-Files Assorted 15-40 Standard 21/25mm|185||فايلات K ماني مشكل 15-40 ستاندرد أصلي 185ج
Endodontics (علاج جذور وأندو)|Mani K-Files Assorted Long 28/31mm|210||فايلات K ماني مشكل لونج أصلي 210ج
Endodontics (علاج جذور وأندو)|Mani H-Files Assorted 15-40 (Original Japan)|185||فايلات H ماني مشكل 15-40 أصلي 185ج
Endodontics (علاج جذور وأندو)|Mani D-Finders Size 08 (Original Japan)|250||فايلات D فايندر ماني مقاس 8 أصلي 250ج
Endodontics (علاج جذور وأندو)|Mani D-Finders Size 10 (Original Japan)|250||فايلات D فايندر ماني مقاس 10 أصلي 250ج
Endodontics (علاج جذور وأندو)|Mani D-Finders Size 15 (Original Japan)|235||فايلات D فايندر ماني مقاس 15 أصلي 235ج
Endodontics (علاج جذور وأندو)|Absorbent Paper Points (Standard & Tapered)|70||بيبربوينت عادية وتيبر 70ج
Endodontics (علاج جذور وأندو)|Gutta Percha Points (Standard & Tapered)|70||جاتابركا عادية وتيبر 70ج
Endodontics (علاج جذور وأندو)|Meta Gutta Percha Points (Standard)|110||جاتابركا ميتا العادية 110ج
Endodontics (علاج جذور وأندو)|Meta Gutta Percha Points (Tapered 4% / 6%)|110||جاتابركا ميتا التيبر 110ج
Endodontics (علاج جذور وأندو)|Meta Gutta Percha Points Tapered (Sizes 30/4, 35/4, 40/4)|138||جاتابركا ميتا تيبر مقاسات (30/4 - 35/4 - 40/4) 138ج
Endodontics (علاج جذور وأندو)|Aline Rotary Endodontic Files Kit|195||كيت فايلات روتاري Aline بـ 195ج
Endodontics (علاج جذور وأندو)|Flex Sani Rotary Endodontic Files Kit|195||كيت فايلات روتاري Flex sani بـ 195ج
Endodontics (علاج جذور وأندو)|M-Pro Rotary Endodontic Files Kit|235||كيت فايلات روتاري M.pro بـ 235ج
Endodontics (علاج جذور وأندو)|NIC Rotary Endodontic Files Kit (4 Files)|235||كيت فايلات روتاري Nic 4file بـ 235ج
Endodontics (علاج جذور وأندو)|NIC Rotary Endodontic Files Kit (6 Files)|255||كيت فايلات روتاري Nic 6file بـ 255ج
Endodontics (علاج جذور وأندو)|E-Flex Rotary Files Kit (Blue Heat-Treated)|265||كيت فايلات روتاري E.flex بلو 265ج
Endodontics (علاج جذور وأندو)|E-Flex Rotary Files Kit (Gold Heat-Treated)|265||كيت فايلات روتاري E.flex جولد 265ج
Endodontics (علاج جذور وأندو)|Fanta Blue Rotary Endodontic Files Kit|275||فايلات روتاري فانتا بلو 275ج
Endodontics (علاج جذور وأندو)|Vedia Large Rotary Endodontic Files Kit|275||كيت فايلات روتاري ڤيديا الكبير 275ج
Endodontics (علاج جذور وأندو)|Pepsi Gold Rotary Endodontic Files Kit|285||كيت فايلات بيبسي جولد 285ج
Endodontics (علاج جذور وأندو)|M-Pro Gold Rotary Files Kit (Assorted)|285||كيت فايلات روتاري ام برو جولد (أسورتد) 285ج
Endodontics (علاج جذور وأندو)|M-Pro Gold Rotary Files (Refill Pack)|305||فايلات روتاري ام برو جولد (ريفل) 305ج
Endodontics (علاج جذور وأندو)|Rogin Rotary Endodontic Files Kit (4 Files)|335||كيت فايلات روتاري روجين 4file بـ 335ج
Endodontics (علاج جذور وأندو)|Rogin Rotary Endodontic Files Kit (6 Files)|435||كيت فايلات روتاري روجين 6file بـ 435ج
Glass Ionomer (جلاس وسيمانت)|Chinese Glass Ionomer Cement (Exp Year-End)|70||جلاس ايونيمر صيني (إكسباير آخر السنة) 70ج
Glass Ionomer (جلاس وسيمانت)|English Glass Ionomer Cement (Exp Year-End Promo)|125||جلاس ايونيمر إنجليزي (عرض إكسباير آخر السنة) 125ج
Glass Ionomer (جلاس وسيمانت)|Restore Glass Ionomer Restorative Cement|345||جلاس ايونيمر Restore Glass بـ 345ج
Glass Ionomer (جلاس وسيمانت)|Ceram American Glass Ionomer Cement|425||جلاس ايونيمر أمريكي Ceram بـ 425ج
Glass Ionomer (جلاس وسيمانت)|Brazil Glass Ionomer Cement|440||جلاس ايونيمر برازيلي Brazil بـ 440ج
Glass Ionomer (جلاس وسيمانت)|Micron 1 / Micron 2 Glass Ionomer Cement|510||جلاس ايونيمر ميكرون Micron 1 / 2 بـ 510ج
Glass Ionomer (جلاس وسيمانت)|Adhesor Carbofin Zinc Polycarboxylate Cement (Czech)|710||زينك بولي كربوكسيليت التشيكي Adhesor Carbofin بـ 710ج
Glass Ionomer (جلاس وسيمانت)|Riva Light Cure / Self Cure Glass Ionomer Capsules|125||كبسولات ريڤا لايت / سيلف 125ج
Glass Ionomer (جلاس وسيمانت)|GC Fuji IX GP Extra Glass Ionomer Capsules|135||كبسولات فيوجي 9 إكسترا Fuji 9 extra بـ 135ج
Glass Ionomer (جلاس وسيمانت)|BMS Blue Glass Ionomer Cement (Large Pack Italy)|1550||جلاس ايونيمر BMS الأزرق الحجم الكبير 1550ج
Glass Ionomer (جلاس وسيمانت)|Kromoglass Yellow Glass Ionomer (Large Pack)|1550||جلاس ايونيمر كومروجلاس الأصفر الحجم الكبير 1550ج
Glass Ionomer (جلاس وسيمانت)|Medifil Glass Ionomer Restorative|1630||الميديفل Medifil بـ 1630ج
Glass Ionomer (جلاس وسيمانت)|Medicem Glass Ionomer Luting Cement|1775||الميديسيم Medicem بـ 1775ج
Glass Ionomer (جلاس وسيمانت)|CharmCore Dual-Cure Core Build-up (Korea)|715||شارم كور الكوري Charm Core بـ 715ج
Glass Ionomer (جلاس وسيمانت)|Dolgunn Core Build-Up Composite (Turkey)|625||Dolgunn Core التركي بـ 625ج
Glass Ionomer (جلاس وسيمانت)|Han-Core Dual-Cure Core Build-up|655||هان كور Han Core بـ 655ج
Glass Ionomer (جلاس وسيمانت)|Any-Core Core Build-Up Material (Korea)|605||Any-Core الكوري بـ 605ج
Glass Ionomer (جلاس وسيمانت)|NexoCore Dual-Cure Core Build-up (Meta Korea)|710||Nexocore بتاع ميتا الكوري بـ 710ج
Glass Ionomer (جلاس وسيمانت)|Dolgunn Temporary Crown & Bridge Material|440||تيمبريري كراون Dolgunn بـ 440ج
Glass Ionomer (جلاس وسيمانت)|Dolgunn Temporary Crown & Bridge Material (Large Cartridge)|1175||تمبري كراون دولجان كبير 1175ج
Glass Ionomer (جلاس وسيمانت)|Cavex Non-Eugenol Temporary Cement|700||تيمبريري سيمنت كافكس Cavex بـ 700ج
Glass Ionomer (جلاس وسيمانت)|SuperCem Dual-Cure Resin Cement|1075||ريزن سيمنت Supercem بـ 1075ج
Glass Ionomer (جلاس وسيمانت)|Amalgam Alloy Spill 2 (Capsules)|2625||أملجم سبيل 2 بـ 2625ج
Impression (طبعات ومقاسات)|Chinese Dental Alginate High Grade (Large Pack)|135||ألجنيت صيني أنضف نوع وأكبر حجم 135ج
Impression (طبعات ومقاسات)|Chinese Quality Dental Alginate Pack|140||كيس ألجنيت صيني نوع كويس 140ج
Impression (طبعات ومقاسات)|IQ Dental Alginate Powder|162||ألجنيت IQ بـ 162ج
Impression (طبعات ومقاسات)|Hygedent Chromatic Alginate|175||ألجنيت Hygedent بـ 175ج
Impression (طبعات ومقاسات)|BMS Italian Dental Alginate|175||ألجنيت BMS إيطالي 175ج
Impression (طبعات ومقاسات)|Zhermack Zetalgin Alginate Powder|265||ألجنيت Zetalgin بـ 265ج
Impression (طبعات ومقاسات)|Alginplus Extra Fast Setting Alginate|265||ألجنيت alginplus extra fast بـ 265ج
Impression (طبعات ومقاسات)|Biokalgin Dental Alginate Powder|365||ألجنيت Biokalgin بـ 365ج
Impression (طبعات ومقاسات)|Zhermack Tropicalgin Chromatic Alginate|425||ألجنيت تروبيكالجين Tropicalgin بـ 425ج
Impression (طبعات ومقاسات)|Cavex CA37 Dental Alginate|445||ألجنيت Cavex بـ 445ج
Impression (طبعات ومقاسات)|Stainless Steel Impression Trays (Standard Clean)|12||تراي إمبرشن ستانلس النضيفة ستاندرد 12ج
Impression (طبعات ومقاسات)|Colored Plastic Impression Trays (Standard)|15||تراي بلاستيك ألوان ستاندرد 15ج
Impression (طبعات ومقاسات)|Rubber Mixing Bowl + Alginate Spatula Set|25||الرابرباول + السباتيولا للألجنيت 25ج
Impression (طبعات ومقاسات)|C-Silicone Ceylaxil Small Kit (Putty + Light + Catalyst)|710||كيت رابربيز سيلاكسيل صغيرة 710ج
Impression (طبعات ومقاسات)|Zhermack ZetaPlus C-Silicone Small Kit|780||كيت رابربيز زيتابلس صغيرة 780ج
Impression (طبعات ومقاسات)|Ceylaxil Putty Tub (890g)|890||بطي رابربيز سيلاكسيل 890ج
Impression (طبعات ومقاسات)|ZetaPlus Putty Tub (910g)|910||بطي رابربيز زيتابلس 910ج
Impression (طبعات ومقاسات)|ZetaPlus Indurent Gel Catalyst (Large Tube)|500||كاتاليست زيتابلس كبيرة 500ج
Impression (طبعات ومقاسات)|ZetaPlus Oranwash Light Body (Large Tube)|550||لايت زيتابلس كبيرة 550ج
Impression (طبعات ومقاسات)|Addition Mac A-Silicone Large Kit|1250||كيت رابربيز Addition Mac كبيرة 1250ج
Impression (طبعات ومقاسات)|Impression Material Dispenser Gun (1:1 / 2:1)|310||مسدس رابربيز 310ج
Impression (طبعات ومقاسات)|Ceylaxil C-Silicone Large Impression Kit|1870||كيت رابربيز سيلاكسيل كبيرة 1870ج
Impression (طبعات ومقاسات)|ZetaPlus C-Silicone Large Impression Kit|1945||كيت رابربيز زيتابلس كبيرة 1945ج
Impression (طبعات ومقاسات)|Red Dental Impression Compound Cakes|125||إمبرشن كومباوند 125ج
Impression (طبعات ومقاسات)|Kerr Green Stick Impression Compound Tracing Sticks|125||جرين ستيك Green stick بـ 125ج
Impression (طبعات ومقاسات)|Pink Baseplate Modeling Wax (Large Box)|190||علبة pink Wax كبيرة 190ج
Impression (طبعات ومقاسات)|Dental Gas Blowtorch + Free Butane Gas Canister|135||التورش + الغاز هدية 135ج
Rubber Dam (عزل ورابردام)|Rubber Dam Sheet (Single Sheet)|8||شيت رابردام فردي 8ج
Rubber Dam (عزل ورابردام)|Imported Pakistani Rubber Dam Clamp|23||كلامب باكستاني مستورد 23ج
Rubber Dam (عزل ورابردام)|Citizen Dental Cheek / Lip Retractor|25||ريتراكتور Citizen بـ 25ج
Rubber Dam (عزل ورابردام)|Rubber Dam Paper Template|8||رابردام تمبلت ورق 8ج
Rubber Dam (عزل ورابردام)|Rubber Dam Metal Template|48||رابردام تمبلت معدن 48ج
Rubber Dam (عزل ورابردام)|Metal Rubber Dam Frame|48||فريم رابردام Metal بـ 48ج
Rubber Dam (عزل ورابردام)|Plastic Radiolucent Rubber Dam Frame|85||فريم رابردام Plastic بـ 85ج
Rubber Dam (عزل ورابردام)|Dental Floss (Waxed)|30||دنتال فلوس 30ج
Rubber Dam (عزل ورابردام)|Gingival Retraction Cord (000/00/0/1/2)|95||ريتراكشن كورد 95ج
Rubber Dam (عزل ورابردام)|Retraction Cord Applicator Instrument|28||كورد أبليكيتور Cord applicator بـ 28ج
Rubber Dam (عزل ورابردام)|Liquid Dam Light-Cured Gingival Barrier Syringe|148||ليكويدام Liquid Dam بـ 148ج
Rubber Dam (عزل ورابردام)|Rubber Dam Clamp Forceps (Holder)|270||كلامب هولدر Clamp holder بـ 270ج
Rubber Dam (عزل ورابردام)|Ivory Rubber Dam Hole Puncher|370||رابردام بانشر Puncher بـ 370ج
Rubber Dam (عزل ورابردام)|Puritex / Ceyflex Rubber Dam Sheets Box|290||علبة شيتات رابردام Puritex أو CEYFLEX بـ 290ج
Rubber Dam (عزل ورابردام)|Flamingo Rubber Dam Sheets Box (36 pcs)|310||علبة شيتات رابردام Flamingo بـ 310ج
Rubber Dam (عزل ورابردام)|Sanctuary Rubber Dam Sheets Box|335||علبة شيتات رابردام Sanctuary بـ 335ج
Rubber Dam (عزل ورابردام)|Sanctuary Silk Blue Powder-Free Rubber Dam Sheets|460||علبة شيتات رابردام Sanctuary Silk Blue بـ 460ج
Finishing & Matrix (تلميع وماتريكس)|High-Speed Diamond Burs (Imported Chinese 1st Grade)|5.5||بيرات هاي سبيد صيني درجة أولى 5.5ج
Finishing & Matrix (تلميع وماتريكس)|High-Speed Carbide Burs|35||بيرات كاربيد 35ج
Finishing & Matrix (تلميع وماتريكس)|Endo-Z Tungsten Carbide Bur|38||بيرات إندو Z بـ 38ج
Finishing & Matrix (تلميع وماتريكس)|Surgical Carbide Burs (Heavy Duty Extra Strong)|38||بيرات سيرجيكال متينة 38ج
Finishing & Matrix (تلميع وماتريكس)|Long Shank Surgical Burs|25||لونج شانك بير 25ج
Finishing & Matrix (تلميع وماتريكس)|Short Shank Carbide Burs|25||شورت شانك بير 25ج
Finishing & Matrix (تلميع وماتريكس)|White Arkansas Polishing Stones (High Speed)|18||بيرات تلميع بيضا هاي سبيد 18ج
Finishing & Matrix (تلميع وماتريكس)|Linen Felt Polishing Wheels / Brushes|5.5||فرش تلميع كتان 5.5ج
Finishing & Matrix (تلميع وماتريكس)|Nylon Polishing Brushes (Single)|2.5||فرش تلميع نايلون فردي 2.5ج
Finishing & Matrix (تلميع وماتريكس)|Nylon Prophy Polishing Brushes Box (100 pcs)|165||علبة فرش تلميع نايلون 100 حبة 165ج
Finishing & Matrix (تلميع وماتريكس)|Prophylaxis Rubber Polishing Cups|4.5||رابر كب تلميع Rubber Cup بـ 4.5ج
Finishing & Matrix (تلميع وماتريكس)|Dental Prophylaxis Polishing Paste Tube|75||معجون تلميع أسنان 75ج
Finishing & Matrix (تلميع وماتريكس)|Prophy Polishing Paste Single Capsule|8||كبسولة معجون تلميع أسنان 8ج
Finishing & Matrix (تلميع وماتريكس)|Composite Polishing Paste (Aluminium Oxide)|55||معجون تلميع حشوات الكمبوزيت 55ج
Finishing & Matrix (تلميع وماتريكس)|TOR VM Composite Finishing Strips|70||فينيشينج ستريبس Torvm بـ 70ج
Finishing & Matrix (تلميع وماتريكس)|Flexible Finishing & Polishing Discs (Tor VM / Shofu style)|145||فينيشينج discs بـ 145ج
Finishing & Matrix (تلميع وماتريكس)|Kenda Chinese Silicone Polishing Kit|155||كيت كيندا فينيشينج صيني 155ج
Finishing & Matrix (تلميع وماتريكس)|Wooden Interdental Wedges Box|135||ويدجات خشب 135ج
Finishing & Matrix (تلميع وماتريكس)|Russian Wooden Interdental Wedges Box|145||ويدجات خشب روسي 145ج
Finishing & Matrix (تلميع وماتريكس)|Diamond Plastic Interdental Wedges Box|145||ويدجات بلاستيك دايموند 145ج
Finishing & Matrix (تلميع وماتريكس)|Pre-Cut Tofflemire Matrix Bands Pack|6||كيسة باندات توفليمير مقطعة 6ج
Finishing & Matrix (تلميع وماتريكس)|Tofflemire Matrix Retainer (Stainless Steel)|80||توفليمير ماتريكس 80ج
Finishing & Matrix (تلميع وماتريكس)|Stainless Steel Matrix Band Roll (50m)|55||ماتريكس باند رول 55ج
Finishing & Matrix (تلميع وماتريكس)|Celluloid Transparent Mylar Strips Pack|10||باندات سيليلويد celliloid strips بـ 10ج
Finishing & Matrix (تلميع وماتريكس)|Sectional Matrix System Starter Kit|155||سيكشنال ماتريكس كيت 155ج
Finishing & Matrix (تلميع وماتريكس)|Saddle Contoured Metal Matrix Kit|265||سادل ماتريكس كيت 265ج
Finishing & Matrix (تلميع وماتريكس)|Chinese Resin Matrix Clamping Rings (Pair)|135||ريزن رينج Resin Rings صيني 135ج
Finishing & Matrix (تلميع وماتريكس)|Dr. Ring Sectional Matrix Clamping Ring|375||رينج Dr Ringe بـ 375ج
Finishing & Matrix (تلميع وماتريكس)|Spoon Matrix / Twin Matrix System Kit|185||سبون ماتريكس Spoon matrix أو Twin matrix بـ 185ج
Finishing & Matrix (تلميع وماتريكس)|Saddle Matrix Bands Refill Pack|210||ريفيل سادل ماتريكس Saddle matrix refill بـ 210ج
Finishing & Matrix (تلميع وماتريكس)|Large Imported Matrix Separator Ring|145||رينج مستورد حجم كبير 145ج
Finishing & Matrix (تلميع وماتريكس)|Articulating Carbon Papers (Imported Box 12 booklets)|110||ورق عض كربون صيني Articulating papers بـ 110ج
Instruments (أدوات وجراحة)|Plastic Composite Placement Instrument|28||أدوات كمبوزيت بلاستيك 28ج
Instruments (أدوات وجراحة)|Dream Titanium Composite Instrument|32||أدوات كمبوزيت نوع Dream بـ 32ج
Instruments (أدوات وجراحة)|PK Thomas Composite Sculpting Instrument Kit|185||كيت أدوات كمبوزيت PK Thomas بـ 185ج
Instruments (أدوات وجراحة)|Dental Spoon Excavator|28||إكسكافيتور Excavator بـ 28ج
Instruments (أدوات وجراحة)|Composite Applicator / Spatula Instrument|28||كمبوزيت أبليكيتور 28ج
Instruments (أدوات وجراحة)|Dental Cement Spatula + Glass Slab Set|35||سيمنت سباتيولا + Glass slab بـ 35ج
Instruments (أدوات وجراحة)|Mouth Mirror Head (Rhodium / Plane)|9||هيد ميرور 9ج
Instruments (أدوات وجراحة)|Mouth Mirror Stainless Steel Handle|22||ميرور هاندل 22ج
Instruments (أدوات وجراحة)|Mega Mouth Mirror Head|90||ميرور ميجا Mega بـ 90ج
Instruments (أدوات وجراحة)|Relax Rhodium Front Surface Mirror|120||ميرور ريلاكس Relax بـ 120ج
Instruments (أدوات وجراحة)|Autoclavable Plastic Mirror Handle|18||يد ميرور بلاستيك أوتوكلافابل 18ج
Instruments (أدوات وجراحة)|Autoclavable Stainless Steel Mirror Handle|27||يد ميرور ميتال أوتوكلافابل 27ج
Instruments (أدوات وجراحة)|Intraoral Photography Contrast Mirrors Set (3 pcs)|185||مجموعة مرايات تصوير حشوات وتقويم 3 قطع 185ج
Instruments (أدوات وجراحة)|Standard Dental Diagnostic Probe|26||بروب عادي 26ج
Instruments (أدوات وجراحة)|Endodontic Explorer Probe|30||بروب إندو 30ج
Instruments (أدوات وجراحة)|Graduated Periodontal Probe (WHO / Williams)|35||بروب بيريو graduated بـ 35ج
Instruments (أدوات وجراحة)|Dental Carver / Condenser / Burnisher|26||كارفر أو كوندينسر أو بيرنشر 26ج
Instruments (أدوات وجراحة)|College Diagnostic Tweezers|42||تويزر عادي 42ج
Instruments (أدوات وجراحة)|Locking College Tweezers|48||تويزر لوك 48ج
Instruments (أدوات وجراحة)|Surgical Scissors (Curved / Straight)|45||مقص جراحي 45ج
Instruments (أدوات وجراحة)|Scalpel Handle No. 3 / No. 4|28||يد مشرط 28ج
Instruments (أدوات وجراحة)|Surgical Bone File|95||بون فايل Bone file بـ 95ج
Instruments (أدوات وجراحة)|Surgical Bone Curette (Lucas)|95||بون كيوريت Bone Curette بـ 95ج
Instruments (أدوات وجراحة)|Needle Holder / Mosquito Hemostatic Forceps|90||نيدلز هولدر أو موسكيتو 90ج
Instruments (أدوات وجراحة)|Dental Root Elevator|110||إليفيتور Elevator بـ 110ج
Instruments (أدوات وجراحة)|Dental Extraction Forceps|225||فورسيبس Forceps بـ 225ج
Instruments (أدوات وجراحة)|Manual Periodontal Scaler / Universal Curette|28||سكيلر أو كيوريت مانيوال للبيريو 28ج
Instruments (أدوات وجراحة)|EZ.Cure Local Periodontal Treatment Solution|135||EZ.Cure علاج لثة موضعي 135ج
Instruments (أدوات وجراحة)|Ultrasonic Scaler Tips (Standard)|38||تيبات ألتراسونيك 38ج
Instruments (أدوات وجراحة)|Ultrasonic Endo-Perio Tips (E22 & similar)|275||تيبات ألتراسونيك إندو بيريو E22 بـ 275ج
Instruments (أدوات وجراحة)|Ultrasonic Scaler Tip Torque Wrench|135||مفتاح سكيلر 135ج
Instruments (أدوات وجراحة)|Surgical Hemostatic Gelatin Sponge (Gelfoam)|110||جيل فوم Gelfoam بـ 110ج
Instruments (أدوات وجراحة)|Large Sterile Gelfoam Sheet (Sponge)|100||جيل فوم القطعة الكبيرة 100ج
Instruments (أدوات وجراحة)|Alveogyl Dry Socket Alveolar Dressing Paste|55||ألڤيوجل Alveogyl للـ Dry socket بـ 55ج
Instruments (أدوات وجراحة)|Hemostop / Hemostal Topical Hemostatic Liquid|90||هيموستوب أو هيموستال 90ج
Instruments (أدوات وجراحة)|Rotary Handpiece Silicone Protective Sleeves|135||سيليكون سليڤز روتاري 135ج
Instruments (أدوات وجراحة)|Digital X-Ray Sensor Protective Sleeves (100 pcs)|125||سينسور سليڤز 125ج
Instruments (أدوات وجراحة)|Intraoral Camera Protective Sleeves (100 pcs)|125||كاميرا سليڤز 125ج
Orthodontics (تقويم أسنان)|Orthodontic Molar Bands Kit|625||كيت باندات التقويم 625ج
Orthodontics (تقويم أسنان)|Orthodontic Cleaning Brushes|50||فرش التقويم 50ج
Orthodontics (تقويم أسنان)|Orthodontic Band Remover Pliers|325||باند ريموفر Band remover بـ 325ج
Orthodontics (تقويم أسنان)|Orthodontic Band Pusher Instrument|285||باند بوشر Band pusher بـ 285ج
Orthodontics (تقويم أسنان)|Orthodontic Band Seater / Setter|265||باند سيتر Band setter بـ 265ج
Orthodontics (تقويم أسنان)|Orthodontic Bracket Tweezers / Holder|185||براكت هولدر Bracket holder بـ 185ج
Orthodontics (تقويم أسنان)|Orthodontic Bracket Positioner / Gauge|335||براكت بوزيشن ريموفال 335ج
Orthodontics (تقويم أسنان)|Mathieu Needle Holder Pliers for Orthodontics|375||ماثيو تقويم Mathio بـ 375ج
Orthodontics (تقويم أسنان)|Nickel-Titanium (NiTi) Round Archwires|32||وايرات نايطاي راوند 32ج
Orthodontics (تقويم أسنان)|Stainless Steel Round Archwires|32||وايرات ستانلس راوند 32ج
Orthodontics (تقويم أسنان)|Rectangular / Square Orthodontic Archwires|35||وايرات مضلعة 35ج
Orthodontics (تقويم أسنان)|First Molar Buccal Tubes (Bondable / Weldable)|25||بكال تيوب Buccal tube 6 بـ 25ج
Orthodontics (تقويم أسنان)|Orthodontic Relief Wax Pack|12||علبة شمع التقويم 12ج
Orthodontics (تقويم أسنان)|Ortho Stars Elastic Ligatures Ties Sheet|55||شيت سترس Ortho stars بـ 55ج
Orthodontics (تقويم أسنان)|Orthodontic Intermaxillary Elastics Pack|14||كيس إيلاستيك تقويم 14ج
Orthodontics (تقويم أسنان)|Orthodontic Open Coil Spring (NiTi)|35||أوبن كويل سبرنج 35ج
Orthodontics (تقويم أسنان)|Orthodontic Elastomeric Power Chain (Spool)|85||باور تشين تقويم Power chain بـ 85ج
Orthodontics (تقويم أسنان)|Orthodontic Ligature O-Ties (Small Ring 40 sticks)|45||كيس أوطاي تقويم حلقة صغيرة (40 قطعة) 45ج
Orthodontics (تقويم أسنان)|Orthodontic Ligature O-Ties (Wide Ring 40 sticks)|125||كيس أوطاي تقويم حلقة واسعة (40 قطعة) 125ج
Orthodontics (تقويم أسنان)|Orthodontic Brackets Set on Typodont Card|75||حالة براكيت تقويم على كارت 75ج
Orthodontics (تقويم أسنان)|OrthoClassic First-Grade Orthodontic Brackets Box|85||علبة براكيت تقويم أورثوكلاسيك 85ج
Handpieces (كونترات وصيانة)|Future Key High-Speed Dental Handpiece|475||كونترا هاي سبيد فيوتشر Future key بـ 475ج
Handpieces (كونترات وصيانة)|Trend High-Speed Dental Handpiece|975||كونترا هاي سبيد Trend بـ 975ج
Handpieces (كونترات وصيانة)|Being Push Button High-Speed Handpiece|1300||كونترا هاي سبيد Being push button بـ 1300ج
Handpieces (كونترات وصيانة)|Apple High-Speed Dental Handpiece (LED)|1550||كونترا Apple ليد بـ 1550ج
Handpieces (كونترات وصيانة)|Coxo Pro High-Speed Dental Handpiece|2150||كونترا كوكسو Coxo pro بـ 2150ج
Handpieces (كونترات وصيانة)|Coxo Egypt Sinai High-Speed Handpiece|2750||كونترا كوكسو مصر سينا بـ 2750ج
Handpieces (كونترات وصيانة)|Dental Handpiece Ball Bearings|75||بلي كونترا 75ج
Handpieces (كونترات وصيانة)|Dental Handpiece Spindle Shaft|185||عمود كونترا 185ج
Handpieces (كونترات وصيانة)|Dental Handpiece Turbine Cartridge|240||كارتلدج كونترا 240ج
Handpieces (كونترات وصيانة)|X-Platform Low-Speed Air Motor Handpiece|750||كونترا لوسبيد xplat form بـ 750ج
Handpieces (كونترات وصيانة)|Being Low-Speed Contra Angle Handpiece|750||كونترا لوسبيد Being بـ 750ج
Handpieces (كونترات وصيانة)|X-Platform Handpiece Quick Coupler Adapter|750||أدابتور x plat form بـ 750ج
Handpieces (كونترات وصيانة)|Apple Handpiece Coupler Adapter|1285||أدابتور أبل Apple بـ 1285ج
Handpieces (كونترات وصيانة)|Coxo Handpiece Coupler Adapter|1450||أدابتور كوكسو Coxo بـ 1450ج
Handpieces (كونترات وصيانة)|Digital Sensor Silicone Protective Cover|135||كفر سينسور 135ج
Handpieces (كونترات وصيانة)|Dental Handpiece Lubricant Spray Oil 410 (UK)|410||زيت كونترا إنجليزي Oil 410 بـ 410ج
Handpieces (كونترات وصيانة)|Dental Handpiece Lubricant Spray Oil|135||زيت كونترا 135ج
Clinic Equipment (أجهزة عيادات)|Dental Clinic Full Equipment Package (Zero)|136000||عرض تجهيز أجهزة العيادة كاملة زيرو 136000ج
Clinic Equipment (أجهزة عيادات)|Dental Unit H5 Full Chair System|73500||يونيت H5 زيرو 73500ج
Clinic Equipment (أجهزة عيادات)|Autoclave Famous Class B Vacuum Sterilizer|30500||أوتوكلاف Famous كلاس B بـ 30500ج
Clinic Equipment (أجهزة عيادات)|Digital X-Ray Sensor (Xpect Vision CMOS)|30500||سينسور أشعة Xpect vision بـ 30500ج
Clinic Equipment (أجهزة عيادات)|Portable Handheld X-Ray Unit (HyperLight G)|28000||جهاز أشعة محمول HyperLight G بـ 28000ج
Clinic Equipment (أجهزة عيادات)|Dental Oil-Free Air Compressor 40L|7750||كمبروسر 40 لتر بدون زيت 7750ج
Clinic Equipment (أجهزة عيادات)|Intraoral Camera System with LCD Screen & Arm|7250||كاميرا فموية بالشاشة والحامل 7250ج
Clinic Equipment (أجهزة عيادات)|Apex Locator High Precision Root Canal Finder|7000||جهاز أبيكس لوكيتور Apex بـ 7000ج
Clinic Equipment (أجهزة عيادات)|Eighteeth Endo Activator Ultrasonic Handpiece|5800||جهاز إندو أكتيفيتور Eighteeth بـ 5800ج
Clinic Equipment (أجهزة عيادات)|Piezoelectric Ultrasonic Scaler Unit|5500||جهاز سكيلر بيزو Scaler piezo بـ 5500ج
Clinic Equipment (أجهزة عيادات)|Wireless Endo Motor (Y-Smart Reciprocating)|4750||إندو موتور Y-Smart لاسلكي 4750ج
Clinic Equipment (أجهزة عيادات)|Stainless Steel Pouch Sealing Machine|4450||ماكينة لحام ستانلس باوتشات 4450ج
Clinic Equipment (أجهزة عيادات)|Dental Amalgamator (iMax Digital Capsule Mixer)|4100||أملجميتور i.max بـ 4100ج
Clinic Equipment (أجهزة عيادات)|Atlas LED Dental Teeth Whitening Bleaching Unit|3350||جهاز تبييض أسنان أطلس Atlas بـ 3350ج
Clinic Equipment (أجهزة عيادات)|LED Light Curing Unit (Cure Magic 1-Sec)|2900||جهاز لايت كيور Cure magic ثانية واحدة 2900ج
Clinic Equipment (أجهزة عيادات)|Stainless Steel Water Distiller Machine|2650||جهاز تقطير مياه ستانلس 2650ج
Clinic Equipment (أجهزة عيادات)|RTA High Power LED Curing Light|1950||جهاز لايت كيور RTA بـ 1950ج
Disposables (مستهلكات وتعقيم)|Medical Latex Examination Gloves - White (Box 100 pcs)|187||جلفزات فحص لاتكس أبيض (علبة 100) 187ج
Disposables (مستهلكات وتعقيم)|Medical Examination Gloves - Colors (Box 100 pcs)|182||جلفزات فحص ألوان نايتريل/لاتكس (علبة 100) 182ج
Disposables (مستهلكات وتعقيم)|Malaysian First-Grade Latex Examination Gloves|157||جلفزات لاتكس ماليزي درجة أولى 157ج
Disposables (مستهلكات وتعقيم)|Overshoes Box (Shoe Covers 100 pcs)|45||علبة أوفر جلفز (100 فردي) 45ج
Disposables (مستهلكات وتعقيم)|Overshoes Bag - Light Weight|5.5||كيس أوفر جلفز خفيف 5.5ج
Disposables (مستهلكات وتعقيم)|Overshoes Bag - Medium Weight|8.5||كيس أوفر جلفز وسط 8.5ج
Disposables (مستهلكات وتعقيم)|Overshoes Bag - Heavy Duty|15.5||كيس أوفر جلفز تقيل 15.5ج
Disposables (مستهلكات وتعقيم)|Surgical Isolation Gowns|13||جاونات عزل جراحية 13ج
Disposables (مستهلكات وتعقيم)|Dental Plaster / Stone Bag 1kg|20||كيس 1 كيلو جبس 20ج
Disposables (مستهلكات وتعقيم)|Ethyl Alcohol 70% (1 Liter)|45||1 لتر كحول 70% بـ 45ج
Disposables (مستهلكات وتعقيم)|Liquid Hand Sanitizer / Disinfectant (1L)|75||معقم يد سائل 1 لتر 75ج
Disposables (مستهلكات وتعقيم)|Surface Disinfectant Spray|80||معقم أسطح 80ج
Disposables (مستهلكات وتعقيم)|Sidex / Lesoformin Disinfectant Sachet (Makes 5L)|18||مطهر Sidex / Lesoformin (كيس 5 لتر) 18ج
Disposables (مستهلكات وتعقيم)|Surgical Face Masks Egyptian (Box 50 pcs)|33||ماسكات مصري علبة 33ج
Disposables (مستهلكات وتعقيم)|Surgical Face Masks Chinese (Box 50 pcs)|45||ماسكات صيني علبة 45ج
Disposables (مستهلكات وتعقيم)|Protective Medical Face Shield Visor|55||فيس شيلد طبي واقي 55ج
Disposables (مستهلكات وتعقيم)|Dental Plastic Cups Column (50 pcs)|25||عمود كبايات بلاستيك 25ج
Disposables (مستهلكات وتعقيم)|Plastic Suction Tips Egyptian (Grade 1 - 100 pcs)|78||كيسة ساكشن مصري درجة أولى 100 قطعة 78ج
Disposables (مستهلكات وتعقيم)|Surgical Suction Tips Italian (Original 100 pcs)|125||ساكشن إيطالي أصلي 100 قطعة 125ج
Disposables (مستهلكات وتعقيم)|Dental Plastic Bibs / Napkins|32||نابكن بلاستيك 32ج
Disposables (مستهلكات وتعقيم)|Dental Napkins Pack (100 pcs)|68||باكيت نابكن 100 قطعة 68ج
Disposables (مستهلكات وتعقيم)|Sterile Gauze & Cotton Large Pack|38||عبوة شاش معقم كبيرة (قطن + شاش) 38ج
Disposables (مستهلكات وتعقيم)|Dental Napkin Holder Clip Chain|25||نابكن هولدر 25ج
Disposables (مستهلكات وتعقيم)|Dental Cotton Rolls Pack (95 pcs)|95||باكيت قطن رول 95ج
Disposables (مستهلكات وتعقيم)|El-Mahalla Medical Cotton Large Bag|90||كيسة قطن المحلة الكبيرة 90ج
Disposables (مستهلكات وتعقيم)|Autoclavable Air-Water Syringe Tips (Stainless Steel)|22||تيبات مية وهوا ستانلس أوتوكلافابل 22ج
Disposables (مستهلكات وتعقيم)|Air-Water Syringe Tips Large Pack (250 pcs)|185||كيسة تيبات مية وهوا كبيرة (250 قطعة) 185ج
Disposables (مستهلكات وتعقيم)|Large Imported Barrier Wrap Film|155||رابنج فيلم مستورد حجم كبير 155ج
Disposables (مستهلكات وتعقيم)|Egyptian Medical Barrier Wrap Grade 1|135||رابنج فيلم مصري درجة أولى 135ج
Disposables (مستهلكات وتعقيم)|Sterilization Pouches 5cm Box|80||علبة باوتشات تعقيم 5 سم 80ج
Disposables (مستهلكات وتعقيم)|Sterilization Pouches 7cm Box|125||علبة باوتشات تعقيم 7 سم 125ج
Disposables (مستهلكات وتعقيم)|Sterilization Pouches 9cm Box|145||علبة باوتشات تعقيم 9 سم 145ج
Disposables (مستهلكات وتعقيم)|Sterilization Pouches 13cm Box|185||علبة باوتشات تعقيم 13 سم 185ج
Disposables (مستهلكات وتعقيم)|Sterilization Reel Roll 5cm|170||رول تعقيم 5 سم 170ج
Disposables (مستهلكات وتعقيم)|Sterilization Reel Roll 7.5cm|248||رول تعقيم 7.5 سم 248ج
Disposables (مستهلكات وتعقيم)|Sterilization Reel Roll 10cm|330||رول تعقيم 10 سم 330ج
Disposables (مستهلكات وتعقيم)|Surgical Scalpel Blades Box (100 pcs)|175||علبة مشارط جراحية (100 مشرط) 175ج
Disposables (مستهلكات وتعقيم)|Surgical Sutures Box (12 pcs)|210||علبة سوتشرز خيوط جراحية 210ج
Disposables (مستهلكات وتعقيم)|Stainless Steel Cotton Holder Jar|375||علبة قطن ستانلس 375ج
Disposables (مستهلكات وتعقيم)|Large Stainless Steel Instrument Sterilization Tray|375||صينية تعقيم أدوات ميتال كبيرة 375ج`;

export const matItems = RAW_MATERIALS.split("\n").filter(Boolean).map((line, idx) => {
  const parts = line.split("|");
  const c = (parts[0] || "").trim();
  const n = (parts[1] || "").trim();
  const p = Number(parts[2]) || 0;
  const img = (parts[3] || "").trim();
  const ar = (parts[4] || "").trim();
  return { id: idx, c, n, p, img, ar };
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
let itemNotes = {};
let lastUpdatedBy = "";
let lastUpdatedAt = "";
let customerDetails = {};
let _saveDebounceTimer = null;
let _isFetching = false;

// 1. Initial immediate local cache
try {
  cart = JSON.parse(localStorage.getItem("zd_mat_cart") || localStorage.getItem("cart") || "{}");
  customItems = JSON.parse(localStorage.getItem("zd_mat_custom_items") || "{}");
  itemNotes = JSON.parse(localStorage.getItem("zd_mat_item_notes") || "{}");
  customerDetails = JSON.parse(localStorage.getItem("zd_mat_customer") || "{}");
} catch (e) {
  cart = {};
  customItems = {};
  itemNotes = {};
  customerDetails = {};
}

function saveCartLocal() {
  try {
    localStorage.setItem("zd_mat_cart", JSON.stringify(cart));
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {}
}

function saveItemNotesLocal() {
  try {
    localStorage.setItem("zd_mat_item_notes", JSON.stringify(itemNotes));
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
        if (parsed.item_notes && typeof parsed.item_notes === 'object') {
          itemNotes = parsed.item_notes;
          saveItemNotesLocal();
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
        saveItemNotesLocal();
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
      item_notes: itemNotes || {},
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
  saveItemNotesLocal();
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
      item_notes: itemNotes,
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
        item_notes: itemNotes,
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
    if (payload.item_notes && typeof payload.item_notes === 'object') {
      itemNotes = payload.item_notes;
      saveItemNotesLocal();
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
    saveItemNotesLocal();
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
      (i.ar && i.ar.toLowerCase().includes(s)) ||
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
            <span style="font-size:14.5px;font-weight:700;line-height:1.45">${i.n}</span>
            ${isCustom ? `<span class="mat-custom-badge">⭐ طلب خاص</span>` : ""}
          </div>
          ${i.ar ? `<div class="mat-item-ar-sub" style="font-size:12px;color:var(--mat-mut);margin-top:2px">${i.ar}</div>` : ""}
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
    const effectiveNote = (itemNotes[id] !== undefined && itemNotes[id] !== null)
      ? itemNotes[id]
      : (item.note || "");
    return {
      ...item,
      note: effectiveNote,
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
    const hasNote = !!line.note;
    const priceText = hasPrice
      ? `${fmt(line.p * line.q)} ج <span style="font-size:12px;color:var(--mat-mut);font-weight:normal">(${fmt(line.p)} ج × ${line.q})</span>`
      : `<span style="color:#d97706;font-size:12.5px;font-weight:700">السعر عند التوريد / حسب الفاتورة</span>`;

    return `
      <div class="mat-it mat-cart-it ${isCustom ? "mat-it-custom" : ""}">
        <div class="mat-it-main">
          ${renderMatThumb(line, 'sm')}
          <div class="mat-n">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font-size:15px;font-weight:700;line-height:1.5">${line.n}</span>
              ${isCustom ? `<span class="mat-custom-badge">⭐ طلب خاص</span>` : ""}
            </div>
            ${line.ar ? `<div class="mat-item-ar-sub" style="font-size:12px;color:var(--mat-mut);margin-top:2px">${line.ar}</div>` : ""}
            <div class="mat-p">${priceText}</div>
            ${hasNote ? `
              <div class="mat-item-note-pill" onclick="window.openMatNoteModal('${line.id}')" title="انقر لتعديل الملاحظة">
                <span>📝</span>
                <span>${line.note}</span>
                <span style="font-size:10.5px;opacity:0.75;margin-right:4px">(تعديل)</span>
              </div>
            ` : ""}
            ${isCustom && line.added_by ? `<div style="font-size:11px;color:var(--mat-mut);margin-top:2px">بواسطة: ${line.added_by}</div>` : ""}
          </div>
        </div>
        <div class="mat-it-actions">
          <button type="button" class="mat-note-btn ${hasNote ? "has-note" : ""}" onclick="window.openMatNoteModal('${line.id}')" title="${hasNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة على الصنف تظهر في الفاتورة'}">
            <span>${hasNote ? "📝 تعديل الملاحظة" : "➕ إضافة ملاحظة"}</span>
          </button>
          <div class="mat-it-actions-right">
            <div class="mat-q">
              <button type="button" onclick="window.matCh('${line.id}', -1)">−</button>
              <b>${line.q}</b>
              <button type="button" onclick="window.matCh('${line.id}', 1)">+</button>
            </div>
            <button type="button" class="mat-del-btn" onclick="window.matRemoveItem('${line.id}')" title="حذف الصنف من السلة">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (ctotEl) ctotEl.textContent = fmt(matTotal());
}

// --------------------------------------------------
// Cart Item Note Handlers
// --------------------------------------------------
export function openMatNoteModal(id) {
  const modal = $("mat-note-modal");
  if (!modal) return;

  const idInput = $("mat-note-item-id");
  const textInput = $("mat-note-text");
  const itemNameEl = $("mat-note-modal-item-name");
  const delBtn = $("mat-note-del-btn");

  let item = customItems[id];
  if (!item) {
    item = matItems.find(i => String(i.id) === String(id)) || matItems[Number(id)];
  }

  const currentNote = (itemNotes[id] !== undefined && itemNotes[id] !== null)
    ? itemNotes[id]
    : (item?.note || "");

  if (idInput) idInput.value = String(id);
  if (textInput) textInput.value = currentNote;
  if (itemNameEl) {
    itemNameEl.textContent = item?.n ? `الصنف: ${item.n}` : "إضافة ملاحظة أو مواصفات خاصة للصنف في الفاتورة";
  }
  if (delBtn) {
    delBtn.style.display = currentNote ? "inline-flex" : "none";
  }

  modal.style.display = "flex";
  setTimeout(() => {
    if (textInput) {
      textInput.focus();
      textInput.select();
    }
  }, 80);
}

export function closeMatNoteModal() {
  const modal = $("mat-note-modal");
  if (modal) modal.style.display = "none";
}

export function saveMatItemNote(event) {
  if (event && event.preventDefault) event.preventDefault();

  const idInput = $("mat-note-item-id");
  const textInput = $("mat-note-text");
  if (!idInput) return;

  const id = idInput.value;
  const note = (textInput?.value || "").trim();

  if (note) {
    itemNotes[id] = note;
    if (customItems[id]) {
      customItems[id].note = note;
    }
  } else {
    delete itemNotes[id];
    if (customItems[id]) {
      customItems[id].note = "";
    }
  }

  pushSharedCart(true);
  matRenderCart();
  closeMatNoteModal();

  if (window.toast) {
    window.toast(note ? "تم حفظ الملاحظة بنجاح وستظهر في الفاتورة 📝✓" : "تمت إزالة الملاحظة");
  }
}

export function deleteMatItemNote() {
  const idInput = $("mat-note-item-id");
  if (!idInput) return;

  const id = idInput.value;
  delete itemNotes[id];
  if (customItems[id]) {
    customItems[id].note = "";
  }

  pushSharedCart(true);
  matRenderCart();
  closeMatNoteModal();

  if (window.toast) {
    window.toast("تمت إزالة ملاحظة الصنف");
  }
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
                ${line.note ? `<div style="font-size:12.5px;color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:3px 8px;margin-top:4px;display:inline-block;font-weight:600">📝 ملاحظة: ${line.note}</div>` : ""}
              </td>
              <td style="text-align:center"><b>${line.q}</b></td>
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
