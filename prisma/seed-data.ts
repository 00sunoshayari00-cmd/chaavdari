export const categories = [
  { slug: "chivda", nameEn: "Chivda", nameMr: "चिवडा", sortOrder: 0 },
  { slug: "chakli", nameEn: "Chakli", nameMr: "चकली", sortOrder: 1 },
  { slug: "bakery", nameEn: "Bakery", nameMr: "बेकरी", sortOrder: 2 },
  {
    slug: "sweet-treats",
    nameEn: "Sweet Treats",
    nameMr: "गोड पदार्थ",
    sortOrder: 3,
  },
  { slug: "cookies", nameEn: "Cookies", nameMr: "कुकीज", sortOrder: 4 },
];

export interface SeedProduct {
  categorySlug: string;
  slug: string;
  sku: string;
  nameEn: string;
  nameMr: string;
  summaryEn: string;
  summaryMr: string;
  descriptionEn: string;
  descriptionMr: string;
  ingredientsEn: string;
  ingredientsMr: string;
  shelfLife: string;
  price: number;
  mrp: number | null;
  weight: string;
  metaTitleEn: string;
  metaTitleMr: string;
  metaDescriptionEn: string;
  metaDescriptionMr: string;
  keywords: string[];
  isFeatured: boolean;
  sortOrder: number;
  // Only used when SEED_DEMO_NUMBERS=true, to test how ratings look
  demo: { rating: number; reviewCount: number; ordersCount: number };
}

export const products: SeedProduct[] = [
  /* ---------------- Sweet Treats ---------------- */
  {
    categorySlug: "sweet-treats",
    slug: "jaggery-ladoo",
    sku: "CHV-SW-001",
    nameEn: "Jaggery Ladoo",
    nameMr: "गुळाचे लाडू",
    summaryEn: "Soft homemade ladoo sweetened only with jaggery.",
    summaryMr: "फक्त गुळाने गोड केलेले मऊ घरगुती लाडू.",
    descriptionEn: `<p>Our Jaggery Ladoo is made the way it is made in a Konkan kitchen: slowly, in small batches, with nothing but good ingredients. Rava and fresh coconut are roasted in pure ghee, then bound with melted jaggery, cashew pieces and a pinch of cardamom.</p>
<h2>Why you will love it</h2>
<ul><li>Sweetened only with jaggery, no white sugar</li><li>Soft, melt-in-the-mouth texture with crunchy cashew bits</li><li>Made fresh in small batches and packed to order</li></ul>
<p>Enjoy it as an evening sweet, a festival treat or a gift for family. Each box is packed by hand, so it reaches you fresh. Looking for something richer? Try our <a href="/en/products/moong-ladoo">Moong Ladoo</a> too.</p>
<p>Store in an airtight container, away from moisture.</p>`,
    descriptionMr: `<p>आमचे गुळाचे लाडू कोकणातल्या घरगुती पद्धतीनेच बनवले जातात: हळूहळू, छोट्या बॅचमध्ये आणि फक्त उत्तम साहित्य वापरून. रवा आणि ओले खोबरे शुद्ध तुपात खमंग भाजले जातात आणि मग वितळलेला गूळ, काजूचे तुकडे व चिमूटभर वेलची घालून लाडू वळले जातात.</p>
<h2>हे लाडू तुम्हाला का आवडतील</h2>
<ul><li>फक्त गुळाने गोड केलेले, पांढरी साखर नाही</li><li>तोंडात विरघळणारा मऊ पोत आणि काजूचे कुरकुरीत तुकडे</li><li>छोट्या बॅचमध्ये ताजे बनवून ऑर्डरनुसार पॅक केलेले</li></ul>
<p>संध्याकाळचे गोड, सणासुदीचा खाऊ किंवा कुटुंबासाठी भेट म्हणून याचा आनंद घ्या. प्रत्येक बॉक्स हाताने पॅक केला जातो, त्यामुळे तो तुमच्यापर्यंत ताजा पोहोचतो. आणखी समृद्ध काही हवे असल्यास आमचे <a href="/mr/products/moong-ladoo">मूग लाडू</a> पण चाखून पाहा.</p>
<p>ओलाव्यापासून दूर, हवाबंद डब्यात साठवा.</p>`,
    ingredientsEn:
      "Rava (semolina), jaggery, fresh grated coconut, ghee, cashews, cardamom.",
    ingredientsMr: "रवा, गूळ, ओले किसलेले खोबरे, तूप, काजू, वेलची.",
    shelfLife: "1 month from packing",
    price: 200,
    mrp: 220,
    weight: "250gm",
    metaTitleEn: "Jaggery Ladoo | Homemade Konkan Sweet | Chaavdari",
    metaTitleMr: "गुळाचे लाडू | घरगुती कोकणी मिठाई | चवदारी",
    metaDescriptionEn:
      "Order soft homemade Jaggery Ladoo made with rava, coconut, ghee and jaggery. Fresh Konkan sweets from Chaavdari, delivered to your door.",
    metaDescriptionMr:
      "रवा, खोबरे, तूप आणि गुळापासून बनवलेले मऊ घरगुती गुळाचे लाडू ऑर्डर करा. चवदारीची ताजी कोकणी मिठाई तुमच्या दारी.",
    keywords: [
      "jaggery ladoo",
      "gul ladoo",
      "konkan sweets",
      "homemade ladoo",
      "traditional sweets",
      "ratnagiri sweets",
    ],
    isFeatured: true,
    sortOrder: 0,
    demo: { rating: 4.8, reviewCount: 12, ordersCount: 40 },
  },
  {
    categorySlug: "sweet-treats",
    slug: "moong-ladoo",
    sku: "CHV-SW-002",
    nameEn: "Moong Ladoo",
    nameMr: "मूग लाडू",
    summaryEn: "Melt-in-the-mouth ladoo made from roasted moong dal and ghee.",
    summaryMr: "भाजलेली मूग डाळ आणि तुपापासून बनवलेले तोंडात विरघळणारे लाडू.",
    descriptionEn: `<p>Moong Ladoo is a festival favourite, and ours is made the slow way. Moong dal is roasted until it smells nutty, then mixed with pure ghee, cardamom and cashews and rolled by hand while still warm.</p>
<h2>What makes it special</h2>
<ul><li>Roasted in small batches for a deep, nutty flavour</li><li>Rich with ghee but never heavy</li><li>Soft, crumbly and melt-in-the-mouth</li></ul>
<p>A box of these makes a lovely gift for Diwali, weddings or any family celebration. If you prefer a jaggery-sweetened treat, see our <a href="/en/products/jaggery-ladoo">Jaggery Ladoo</a>. Store in an airtight container and enjoy within three weeks.</p>`,
    descriptionMr: `<p>मूग लाडू हा सणासुदीचा आवडता गोड पदार्थ आणि आम्ही तो अगदी सावकाश, पारंपरिक पद्धतीने बनवतो. मूग डाळ खमंग वास येईपर्यंत भाजली जाते, मग त्यात शुद्ध तूप, वेलची आणि काजू घालून कोमट असतानाच हाताने लाडू वळले जातात.</p>
<h2>हे खास का आहेत</h2>
<ul><li>छोट्या बॅचमध्ये भाजल्यामुळे गडद, खमंग चव</li><li>तुपाने समृद्ध पण जड न वाटणारे</li><li>मऊ, भुसभुशीत आणि तोंडात विरघळणारे</li></ul>
<p>दिवाळी, लग्न किंवा कोणत्याही कौटुंबिक समारंभासाठी या लाडवांचा बॉक्स छान भेट ठरतो. गुळाने गोड केलेले काही हवे असल्यास आमचे <a href="/mr/products/jaggery-ladoo">गुळाचे लाडू</a> पाहा. हवाबंद डब्यात साठवा आणि तीन आठवड्यांच्या आत खा.</p>`,
    ingredientsEn: "Moong dal flour, ghee, sugar, cardamom, cashews.",
    ingredientsMr: "मूग डाळीचे पीठ, तूप, साखर, वेलची, काजू.",
    shelfLife: "3 weeks from packing",
    price: 240,
    mrp: null,
    weight: "250gm",
    metaTitleEn: "Moong Ladoo | Pure Ghee Homemade Sweet | Chaavdari",
    metaTitleMr: "मूग लाडू | शुद्ध तुपातील घरगुती मिठाई | चवदारी",
    metaDescriptionEn:
      "Buy homemade Moong Ladoo made with roasted moong dal and pure ghee. Soft, melt-in-the-mouth Konkan sweets from Chaavdari.",
    metaDescriptionMr:
      "भाजलेली मूग डाळ आणि शुद्ध तुपापासून बनवलेले घरगुती मूग लाडू ऑर्डर करा. तोंडात विरघळणारी कोकणी मिठाई चवदारीकडून.",
    keywords: [
      "moong ladoo",
      "moong dal ladoo",
      "ghee ladoo",
      "diwali sweets",
      "homemade sweets",
    ],
    isFeatured: false,
    sortOrder: 1,
    demo: { rating: 4.9, reviewCount: 8, ordersCount: 25 },
  },

  /* ---------------- Chivda ---------------- */
  {
    categorySlug: "chivda",
    slug: "fire-mix-chivda",
    sku: "CHV-CH-001",
    nameEn: "Fire Mix Chivda",
    nameMr: "फायर मिक्स चिवडा",
    summaryEn: "A fiery mix of poha, peanuts and spices with a crunchy bite.",
    summaryMr: "पोहे, शेंगदाणे आणि मसाल्यांचा झणझणीत, कुरकुरीत मिक्स.",
    descriptionEn: `<p>For people who like their snacks with a kick. Fire Mix Chivda brings together crisp poha, crunchy peanuts, roasted chana dal and dry coconut slices, tossed with curry leaves and a bold blend of red chilli and spices.</p>
<h2>Perfect for</h2>
<ul><li>Evening tea and chai-time cravings</li><li>Travel snacks and office lunch boxes</li><li>Sharing with friends and family</li></ul>
<p>Every batch is fried and mixed by hand in small quantities, so each pack stays fresh and crunchy. Keep it in an airtight container after opening. Prefer something milder? Try our <a href="/en/products/bhajani-chakli">Bhajani Chakli</a>.</p>`,
    descriptionMr: `<p>ज्यांना स्नॅक्समध्ये थोडा झणझणीतपणा आवडतो त्यांच्यासाठी. फायर मिक्स चिवड्यात कुरकुरीत पोहे, शेंगदाणे, भाजलेली चणा डाळ आणि सुक्या खोबऱ्याचे काप असतात, त्यावर कढीपत्ता आणि लाल तिखट व मसाल्यांचे खास मिश्रण घातले जाते.</p>
<h2>यासाठी उत्तम</h2>
<ul><li>संध्याकाळच्या चहासोबत</li><li>प्रवासात आणि ऑफिसच्या डब्यात</li><li>मित्रमैत्रिणी आणि कुटुंबासोबत वाटून खायला</li></ul>
<p>प्रत्येक बॅच छोट्या प्रमाणात हाताने तळून आणि मिसळून तयार होतो, त्यामुळे प्रत्येक पॅक ताजा आणि कुरकुरीत राहतो. उघडल्यानंतर हवाबंद डब्यात ठेवा. थोडे सौम्य काही हवे असल्यास आमची <a href="/mr/products/bhajani-chakli">भाजणी चकली</a> चाखून पाहा.</p>`,
    ingredientsEn:
      "Thin poha, peanuts, roasted chana dal, dry coconut slices, curry leaves, red chilli powder, turmeric, sugar, salt, oil.",
    ingredientsMr:
      "पातळ पोहे, शेंगदाणे, भाजलेली चणा डाळ, सुक्या खोबऱ्याचे काप, कढीपत्ता, लाल तिखट, हळद, साखर, मीठ, तेल.",
    shelfLife: "2 months from packing",
    price: 180,
    mrp: 200,
    weight: "250gm",
    metaTitleEn: "Fire Mix Chivda | Spicy Konkan Snack | Chaavdari",
    metaTitleMr: "फायर मिक्स चिवडा | झणझणीत कोकणी स्नॅक | चवदारी",
    metaDescriptionEn:
      "Order spicy Fire Mix Chivda with poha, peanuts, chana dal and curry leaves. Crunchy homemade Konkan snack from Chaavdari.",
    metaDescriptionMr:
      "पोहे, शेंगदाणे, चणा डाळ आणि कढीपत्त्यासह झणझणीत फायर मिक्स चिवडा ऑर्डर करा. चवदारीचा कुरकुरीत घरगुती कोकणी खाऊ.",
    keywords: [
      "fire mix chivda",
      "spicy chivda",
      "poha chivda",
      "konkan snacks",
      "homemade namkeen",
    ],
    isFeatured: true,
    sortOrder: 0,
    demo: { rating: 4.7, reviewCount: 15, ordersCount: 60 },
  },

  /* ---------------- Chakli ---------------- */
  {
    categorySlug: "chakli",
    slug: "bhajani-chakli",
    sku: "CHV-CK-001",
    nameEn: "Bhajani Chakli",
    nameMr: "भाजणी चकली",
    summaryEn:
      "Crisp spiral chakli made from traditional multigrain bhajani flour.",
    summaryMr: "पारंपरिक भाजणी पिठापासून बनवलेली कुरकुरीत चकली.",
    descriptionEn: `<p>Bhajani Chakli is a classic Maharashtrian snack, and the secret is in the flour. We roast rice, chana dal, urad dal, jowar and whole spices, grind them into fresh bhajani, and press the dough into crisp spirals.</p>
<h2>What you get</h2>
<ul><li>Traditional multigrain bhajani, roasted and ground fresh</li><li>Light, crisp texture with a gentle spice</li><li>Sesame and ajwain for a warm, savoury aroma</li></ul>
<p>Serve it with tea, take it on a trip or keep it ready for guests. It tastes best when stored in a dry, airtight container.</p>`,
    descriptionMr: `<p>भाजणी चकली हा महाराष्ट्राचा पारंपरिक खाऊ आणि त्याचे खरे गुपित पिठात आहे. आम्ही तांदूळ, चणा डाळ, उडीद डाळ, ज्वारी आणि अख्खे मसाले भाजून ताजी भाजणी दळतो आणि त्यापासून कुरकुरीत चकल्या पाडतो.</p>
<h2>काय मिळते</h2>
<ul><li>भाजून ताजी दळलेली पारंपरिक बहुधान्य भाजणी</li><li>हलकी, कुरकुरीत आणि सौम्य तिखट चव</li><li>तीळ आणि ओव्याचा खमंग, उबदार सुगंध</li></ul>
<p>चहासोबत खा, प्रवासात न्या किंवा पाहुण्यांसाठी तयार ठेवा. कोरड्या, हवाबंद डब्यात ठेवल्यास सर्वात चांगली लागते.</p>`,
    ingredientsEn:
      "Bhajani flour (rice, chana dal, urad dal, jowar, coriander seeds, cumin seeds), sesame seeds, ajwain, red chilli powder, turmeric, salt, oil.",
    ingredientsMr:
      "भाजणी पीठ (तांदूळ, चणा डाळ, उडीद डाळ, ज्वारी, धणे, जिरे), तीळ, ओवा, लाल तिखट, हळद, मीठ, तेल.",
    shelfLife: "1 month from packing",
    price: 190,
    mrp: null,
    weight: "250gm",
    metaTitleEn: "Bhajani Chakli | Crispy Maharashtrian Snack | Chaavdari",
    metaTitleMr: "भाजणी चकली | कुरकुरीत महाराष्ट्रीय स्नॅक | चवदारी",
    metaDescriptionEn:
      "Crispy Bhajani Chakli made from roasted multigrain flour, sesame and ajwain. Traditional homemade snack from Chaavdari.",
    metaDescriptionMr:
      "भाजलेल्या भाजणी पिठात तीळ आणि ओवा घालून बनवलेली कुरकुरीत भाजणी चकली. चवदारीचा पारंपरिक घरगुती खाऊ ऑर्डर करा.",
    keywords: [
      "bhajani chakli",
      "chakli",
      "maharashtrian snacks",
      "diwali faral",
      "homemade chakli",
    ],
    isFeatured: true,
    sortOrder: 0,
    demo: { rating: 4.6, reviewCount: 10, ordersCount: 35 },
  },

  /* ---------------- Bakery ---------------- */
  {
    categorySlug: "bakery",
    slug: "nankhatai",
    sku: "CHV-BK-001",
    nameEn: "Nankhatai",
    nameMr: "नानकटाई",
    summaryEn: "Buttery, crumbly nankhatai baked fresh in small batches.",
    summaryMr: "छोट्या बॅचमध्ये ताजी बेक केलेली, बटरी आणि भुसभुशीत नानकटाई.",
    descriptionEn: `<p>Our Nankhatai is baked in small batches until golden at the edges and soft in the centre. Butter, cardamom and a little gram flour give it a rich aroma and a crumbly bite that melts with your tea.</p>
<h2>Good to know</h2>
<ul><li>Baked fresh and packed to order</li><li>Buttery, crumbly texture with a hint of cardamom</li><li>A thoughtful gift for festivals and birthdays</li></ul>
<p>Our chef Mandar has been baking cookies and pastries for clients for years, and this recipe is one of his favourites. Keep the box closed and in a cool place to stay crisp.</p>`,
    descriptionMr: `<p>आमची नानकटाई छोट्या बॅचमध्ये कडेला सोनेरी आणि आतून मऊ होईपर्यंत बेक केली जाते. बटर, वेलची आणि थोडे बेसन यामुळे तिला समृद्ध सुगंध आणि चहात विरघळणारा भुसभुशीत पोत मिळतो.</p>
<h2>जाणून घ्या</h2>
<ul><li>ताजी बेक करून ऑर्डरनुसार पॅक केलेली</li><li>बटरी, भुसभुशीत आणि वेलचीचा हलका स्वाद</li><li>सण आणि वाढदिवसासाठी छान भेट</li></ul>
<p>आमचे शेफ मंदार अनेक वर्षांपासून ग्राहकांसाठी कुकीज आणि पेस्ट्री बनवत आहेत आणि ही त्यांची आवडती रेसिपी आहे. कुरकुरीत राहण्यासाठी बॉक्स बंद करून थंड जागी ठेवा.</p>`,
    ingredientsEn:
      "Refined wheat flour (maida), gram flour, butter, sugar, cardamom, baking powder.",
    ingredientsMr: "मैदा, बेसन, बटर, साखर, वेलची, बेकिंग पावडर.",
    shelfLife: "3 weeks from packing",
    price: 220,
    mrp: null,
    weight: "200gm",
    metaTitleEn: "Nankhatai | Buttery Homemade Bakery Biscuit | Chaavdari",
    metaTitleMr: "नानकटाई | बटरी घरगुती बेकरी बिस्किट | चवदारी",
    metaDescriptionEn:
      "Fresh homemade Nankhatai baked with butter and cardamom. Crumbly, golden bakery biscuits from Chaavdari, perfect with tea.",
    metaDescriptionMr:
      "बटर आणि वेलचीने ताजी बेक केलेली घरगुती नानकटाई ऑर्डर करा. चवदारीची भुसभुशीत, सोनेरी बेकरी बिस्किटे चहासोबत छान लागतात.",
    keywords: [
      "nankhatai",
      "homemade biscuits",
      "bakery biscuits",
      "butter biscuits",
      "tea time snacks",
    ],
    isFeatured: true,
    sortOrder: 0,
    demo: { rating: 4.8, reviewCount: 9, ordersCount: 30 },
  },

  /* ---------------- Cookies ---------------- */
  {
    categorySlug: "cookies",
    slug: "cashew-cookies",
    sku: "CHV-CO-001",
    nameEn: "Cashew Cookies",
    nameMr: "काजू कुकीज",
    summaryEn: "Crunchy cookies loaded with Konkan cashews and butter.",
    summaryMr: "कोकणी काजू आणि बटरने भरलेल्या कुरकुरीत कुकीज.",
    descriptionEn: `<p>Konkan is famous for its cashews, so we put them in a cookie. Each Cashew Cookie is baked golden with butter and generous cashew pieces, giving a crisp edge and a rich, nutty centre.</p>
<h2>Highlights</h2>
<ul><li>Loaded with real cashew pieces</li><li>Crunchy outside, soft and nutty inside</li><li>Baked in small batches for freshness</li></ul>
<p><strong>Allergen note:</strong> contains cashew nuts, wheat, milk and butter. Store in an airtight container and enjoy within three weeks of packing.</p>`,
    descriptionMr: `<p>कोकण काजूसाठी प्रसिद्ध आहे, म्हणून आम्ही ते कुकीमध्ये घातले. प्रत्येक काजू कुकी बटर आणि भरपूर काजूच्या तुकड्यांसह सोनेरी रंगात बेक केली जाते, त्यामुळे कडा कुरकुरीत आणि आतून खमंग, काजूचा स्वाद लागतो.</p>
<h2>वैशिष्ट्ये</h2>
<ul><li>खऱ्या काजूच्या तुकड्यांनी भरलेली</li><li>बाहेरून कुरकुरीत, आतून मऊ आणि खमंग</li><li>ताजेपणासाठी छोट्या बॅचमध्ये बेक केलेली</li></ul>
<p><strong>अ‍ॅलर्जीबाबत सूचना:</strong> यात काजू, गहू, दूध आणि बटर आहे. हवाबंद डब्यात साठवा आणि पॅक केल्यापासून तीन आठवड्यांच्या आत खा.</p>`,
    ingredientsEn:
      "Refined wheat flour (maida), butter, cashews, sugar, milk, baking powder, vanilla.",
    ingredientsMr: "मैदा, बटर, काजू, साखर, दूध, बेकिंग पावडर, व्हॅनिला.",
    shelfLife: "3 weeks from packing",
    price: 260,
    mrp: null,
    weight: "200gm",
    metaTitleEn: "Cashew Cookies | Konkan Cashew Butter Cookies | Chaavdari",
    metaTitleMr: "काजू कुकीज | कोकणी काजू बटर कुकीज | चवदारी",
    metaDescriptionEn:
      "Crunchy Cashew Cookies baked with butter and real Konkan cashews. Freshly baked homemade cookies from Chaavdari.",
    metaDescriptionMr:
      "बटर आणि खऱ्या कोकणी काजूंनी बनवलेल्या कुरकुरीत काजू कुकीज ऑर्डर करा. चवदारीच्या ताज्या घरगुती कुकीज.",
    keywords: [
      "cashew cookies",
      "butter cookies",
      "konkan cashew",
      "homemade cookies",
      "gift cookies",
    ],
    isFeatured: false,
    sortOrder: 0,
    demo: { rating: 4.7, reviewCount: 6, ordersCount: 18 },
  },
];
