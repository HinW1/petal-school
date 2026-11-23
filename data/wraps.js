// 包裝圖鑑：photo = img/wraps/<id>.jpg（冇相就用 swatch 模擬紙質）
window.WRAPS = [
  { id:"matte", zh:"霧面紙", en:"Frosted / Matte Paper", swatch:"matte", use:"韓式包裝（最常用）",
    feel:"半透明霧感、防水、有少少紋理", tip:"58×58cm 一張，中型花束用 4–6 張；2–3 色疊最靚。", pair:"粉彩花材、韓式花束" },
  { id:"korean", zh:"韓國紙", en:"Korean Wrapping Paper", swatch:"korean", use:"高級韓式、單面花束",
    feel:"啞光、唔透光、表面幼滑、挺身", tip:"比霧面紙更有「紙感」，打褶好定型；唔透光所以遮莖遮膠紙一流。", pair:"玫瑰、洋桔梗、庭院玫瑰" },
  { id:"tissue", zh:"雪梨紙", en:"Tissue Paper", swatch:"tissue", use:"內層墊底、乾花",
    feel:"好薄、軟、半透、唔防水", tip:"做內層遮莖；外層配網紗或牛皮紙。唔好掂水。", pair:"任何花束嘅內層" },
  { id:"kraft", zh:"牛皮紙", en:"Kraft Paper", swatch:"kraft", use:"自然風、乾花、市集",
    feel:"硬挺、啡色、手作感", tip:"配麻繩、棉麻帶；褶位要大，細褶會皺。", pair:"薰衣草、尤加利、向日葵" },
  { id:"cello", zh:"玻璃紙", en:"Cellophane", swatch:"cello", use:"外層防水、透明感",
    feel:"完全透明、防水、有反光", tip:"要鬆鬆地包，包太實會好廉價；可以揀印字／波點款。", pair:"甜筒花束、mornpetals 透明風" },
  { id:"mesh", zh:"網紗", en:"Mesh / Tulle", swatch:"mesh", use:"外層、夢幻感",
    feel:"網眼半透、輕、軟", tip:"剪 1m 對摺成雙層；用手指搓邊做波浪。", pair:"冰島虞美人、鬱金香、繡球" },
  { id:"organza", zh:"歐根紗", en:"Organza", swatch:"organza", use:"婚禮、高級花禮",
    feel:"有光澤嘅半透紗，比網紗挺", tip:"一大塊包住成束，收口位打大褶。", pair:"白花、新娘花球" },
  { id:"wavy", zh:"波浪紗", en:"Ruffle Mesh", swatch:"wavy", use:"甜美風、韓系",
    feel:"邊位自帶荷葉波浪", tip:"波浪邊向上擺喺花頭外圍，自帶「雲朵」感。", pair:"粉色、白色花材" },
  { id:"gingham", zh:"格仔紙", en:"Gingham Paper", swatch:"gingham", use:"甜筒花束、野餐風",
    feel:"格仔印花、休閒可愛", tip:"配一款淨色紙，避免太花。", pair:"非洲菊、小雛菊、金杖球" },
  { id:"news", zh:"報紙紋紙", en:"Newsprint Paper", swatch:"news", use:"復古、男士花束",
    feel:"報紙印刷圖案", tip:"配牛皮紙或黑色紙，型格。", pair:"深色花、乾花" },
  { id:"pearl", zh:"珠光紙", en:"Pearlescent Paper", swatch:"pearl", use:"節日、生日",
    feel:"有珠光閃粉、防水", tip:"閃光強，配淨色花材先唔會老土。", pair:"情人節、聖誕" },
  { id:"black", zh:"黑色霧面紙", en:"Black Matte Paper", swatch:"black", use:"型格、男士、畢業",
    feel:"深色啞光，突出花色", tip:"白花、亮色花擺喺黑紙前最突出（huapan 黑紙款）。", pair:"白花、紅花、橙花" }
];
window.RIBBONS = [
  { id:"satin", zh:"緞帶", en:"Satin Ribbon", d:"有光澤、高級，最常用；白色長尾 = 極簡風" },
  { id:"chiffon", zh:"雪紡絲帶", en:"Chiffon Ribbon", d:"半透、飄逸，自然風／婚禮" },
  { id:"grosgrain", zh:"坑紋帶", en:"Grosgrain Ribbon", d:"有橫紋、挺身、休閒" },
  { id:"linen", zh:"棉麻帶", en:"Linen Ribbon", d:"手作感、田園，配牛皮紙" },
  { id:"velvet", zh:"絲絨帶", en:"Velvet Ribbon", d:"秋冬、聖誕、深色花" },
  { id:"twine", zh:"麻繩", en:"Jute Twine", d:"最自然，市集、乾花", tool:true },
  { id:"curling", zh:"拉花帶", en:"Curling Ribbon", d:"平價快捷，傳統開張花籃" }
];
window.WRAP_RULES = [
  "紙色跟花嘅副色，或者白、米、灰等緩衝色（Neutral），唔好比花更搶",
  "2–3 色以內：1 主色＋1 淺色＋白",
  "後高前低：後面紙高過花頭 5–8cm，前面唔遮花",
  "內層（Inner Wrap）遮莖、外層（Outer Wrap）定造型",
  "膠紙一定要俾絲帶或紙遮住",
  "保水（Hydration Pack）：扎位包濕紙巾＋保鮮紙／保水袋"
];
window.ACCESSORIES = [
  ["保水袋／保鮮紙","Hydration Bag","包住扎位，令花喺包裝入面都有水"],
  ["透明膠紙＋雙面膠紙","Clear & Double-sided Tape","固定紙層，雙面膠紙唔會外露"],
  ["心意卡＋夾","Message Card & Clip","寫祝福字句，擺側後唔遮花"],
  ["品牌貼紙／吊牌","Brand Sticker / Tag","打造自己品牌（ref 圖 MARK 吊牌）"],
  ["抱抱桶／花盒","Bucket Box / Flower Box","大花束保水同企得穩"],
  ["花束手挽袋","Bouquet Carrier Bag","方便客人挽，送貨更穩"]
];
// 工具：香港用詞＋英文
window.TOOLS = {
  "floral-scissors":["花剪","Floral Snips"], "floral-knife":["花刀","Floral Knife"], "thorn-stripper":["去刺器","Thorn Stripper"],
  "zip-ties":["索帶","Cable Tie"], "twine":["麻繩","Jute Twine"], "floral-tape":["花藝膠帶","Floral Tape"], "clear-tape":["膠紙","Clear Tape"],
  "floral-wire":["鐵線","Floral Wire"], "wire-cutter":["鉗","Wire Cutter"], "corsage-pin":["珍珠針","Corsage Pin"], "water-tube":["保水管","Water Tube"],
  "floral-foam":["花泥","Floral Foam"], "chicken-wire":["雞籠網","Chicken Wire"], "kenzan":["劍山","Kenzan"], "flower-bucket":["水桶","Flower Bucket"],
  "spray-bottle":["噴水樽","Spray Bottle"], "flower-food":["保鮮劑","Flower Food"], "glue-gun":["熱溶膠槍","Glue Gun"],
  "wrapping-paper":["包裝紙","Wrapping Paper"], "ribbon":["絲帶","Ribbon"], "vase":["花瓶","Vase"], "flower-basket":["花籃","Flower Basket"],
  "hat-box":["花盒","Flower Box"], "flower-market":["花墟","Flower Market"]
};
