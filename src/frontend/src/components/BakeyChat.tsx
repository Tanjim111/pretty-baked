import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { MessageCircle, RefreshCw, Send, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProducts } from "../hooks/useBackend";
import type { Product } from "../types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  noMatch?: boolean;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hey there! 👋 I'm **Bakey** — your friendly assistant at Pretty Baked. I'm here to help with anything: our delicious baked goods, recipes, general questions, or just a chat! What's on your mind? 🧁",
};

// Category name → product category index map matches SEED_CATEGORIES ordering
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cakes: ["cake", "cakes", "torte"],
  pastries: [
    "pastry",
    "pastries",
    "croissant",
    "eclair",
    "lemon bar",
    "mille feuille",
    "napoleon",
  ],
  breads: ["bread", "breads", "sourdough", "loaf"],
  cookies: ["cookie", "cookies", "macaron", "macaroon", "brownie"],
  cheesecakes: ["cheesecake", "cheesecakes"],
  custom: ["custom", "wedding", "bespoke"],
  donuts: ["donut", "donuts", "doughnut", "doughnuts"],
  cupcakes: ["cupcake", "cupcakes"],
  savory: ["savory", "naan", "patty", "samosa", "chicken patty"],
};

/** Returns which category slug is being asked about, or null */
function detectCategory(msg: string): string | null {
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (msg.includes(kw)) return slug;
    }
  }
  return null;
}

/**
 * Match products to a user query.
 * Returns matched products and a flag indicating if the query was product-specific.
 */
function matchProducts(
  message: string,
  products: Product[],
): { matched: Product[]; wasSpecific: boolean } {
  if (products.length === 0) return { matched: [], wasSpecific: false };

  const msg = message.toLowerCase();

  // "show me everything" / "all products" broad query
  const isBroadAll =
    msg.includes("show me everything") ||
    msg.includes("all products") ||
    msg.includes("what do you have") ||
    msg.includes("what's available") ||
    msg.includes("browse") ||
    msg.includes("menu") ||
    (msg.includes("recommend") && !detectCategory(msg)) ||
    (msg.includes("popular") && !detectCategory(msg)) ||
    (msg.includes("best") && !detectCategory(msg)) ||
    (msg.includes("featured") && !detectCategory(msg));

  if (isBroadAll) {
    const featured = products.filter((p) => p.isFeatured).slice(0, 6);
    return {
      matched: featured.length > 0 ? featured : products.slice(0, 5),
      wasSpecific: false,
    };
  }

  // Try exact / partial product name match first (highest priority)
  // Split the message into meaningful tokens and try multi-word and single-word matching
  const productNameMatches = products.filter((p) => {
    const name = p.name.toLowerCase();
    return (
      msg.includes(name) ||
      name.split(" ").some((w) => w.length > 3 && msg.includes(w))
    );
  });

  if (productNameMatches.length > 0) {
    return { matched: productNameMatches.slice(0, 4), wasSpecific: true };
  }

  // Category-level match
  const categorySlug = detectCategory(msg);
  if (categorySlug) {
    // Map category slug to the actual category name used in the products array
    const slugToName: Record<string, string> = {
      cakes: "Cakes",
      pastries: "Pastries",
      breads: "Breads",
      cookies: "Cookies",
      cheesecakes: "Cheesecakes",
      custom: "Custom Orders",
      donuts: "Donuts",
      cupcakes: "Cupcakes",
      savory: "Savory Items",
    };
    const catName = slugToName[categorySlug] ?? "";
    // Match products by category name (products store category as an ID, but we can
    // also check the description/name against the category keywords)
    const catMatches = products.filter((p) => {
      // Products have a numeric categoryId — try matching from description context
      // We fall back to name+description keyword matching for category
      const haystack = `${p.name} ${p.description}`.toLowerCase();
      const catKeywords = CATEGORY_KEYWORDS[categorySlug] ?? [];
      return (
        catKeywords.some((kw) => haystack.includes(kw)) ||
        catName.toLowerCase() === ""
      );
    });

    // If we got category matches, use them; otherwise fall through
    if (catMatches.length > 0) {
      return { matched: catMatches.slice(0, 4), wasSpecific: false };
    }
  }

  // Ingredient / flavour keyword matching (chocolate, vanilla, strawberry, etc.)
  const flavorKeywords = [
    "chocolate",
    "vanilla",
    "strawberry",
    "red velvet",
    "lemon",
    "almond",
    "cheese",
    "garlic",
    "spinach",
    "chicken",
    "butter",
  ];
  const matchedFlavors = flavorKeywords.filter((f) => msg.includes(f));
  if (matchedFlavors.length > 0) {
    const flavourMatches = products.filter((p) => {
      const haystack = `${p.name} ${p.description}`.toLowerCase();
      return matchedFlavors.some((f) => haystack.includes(f));
    });
    if (flavourMatches.length > 0) {
      return { matched: flavourMatches.slice(0, 4), wasSpecific: true };
    }
  }

  return { matched: [], wasSpecific: false };
}

/** Build a fully local, never-failing response */
/** Build a rich, creative, ChatGPT-style response for any topic */
function buildLocalResponse(
  message: string,
  products: Product[],
  history: ChatMessage[],
): { text: string; matched: Product[]; noMatch: boolean } {
  const msg = message.toLowerCase().trim();
  const lastAssistantMsg =
    [...history].reverse().find((m) => m.role === "assistant")?.content ?? "";

  // ── Greetings ───────────────────────────────────────────────────────────────
  if (
    /^(hi+|hello+|hey+|howdy|hiya|yo|good\s*(morning|afternoon|evening|day|night)|what'?s up|sup|greetings|salut|bonjour|namaste|salam)\b/.test(
      msg,
    )
  ) {
    const greets = [
      "Hey! 😊 Great to see you! I'm Bakey — ask me anything, whether it's about our freshly baked goods or just life in general. What can I do for you today?",
      "Hello! 👋 Welcome to Pretty Baked! I can help with bakery questions, recipes, general knowledge — or just have a chat. What's on your mind?",
      "Hey there! 🧁 I'm Bakey, and I'm here for *all* your questions — from cake recommendations to random curiosities. Fire away!",
      "Hi! So glad you stopped by. 😄 Whether you're here for our freshest bakes or just want to chat, I'm all ears!",
    ];
    return {
      text: greets[Math.floor(Math.random() * greets.length)],
      matched: [],
      noMatch: false,
    };
  }

  // ── Farewells ────────────────────────────────────────────────────────────────
  if (
    /^(bye|goodbye|see ya|see you|later|take care|ciao|peace out|gotta go|ttyl|gtg)/.test(
      msg,
    )
  ) {
    const byes = [
      "Bye! 👋 Hope to see you (and your appetite) back soon at Pretty Baked! 🧁",
      "Take care! 😊 Remember, fresh bakes and a friendly chat are always waiting for you here!",
      "See you later! 🎂 Don't forget — life's too short to skip dessert!",
      "Goodbye! Come back anytime — I'll be right here, ready to chat about anything! ✨",
    ];
    return {
      text: byes[Math.floor(Math.random() * byes.length)],
      matched: [],
      noMatch: false,
    };
  }

  // ── How are you ──────────────────────────────────────────────────────────────
  if (
    /how are you|how'?s it going|how do you do|you ok|you good|hows life|how have you been/.test(
      msg,
    )
  ) {
    return {
      text: "I'm doing wonderfully, thanks for asking! 😄 Running on good vibes and the smell of fresh bread. How about you — what can I help with today?",
      matched: [],
      noMatch: false,
    };
  }

  // ── What/who are you ─────────────────────────────────────────────────────────
  if (
    /who are you|what are you|tell me about yourself|introduce yourself|your name/.test(
      msg,
    )
  ) {
    return {
      text: "I'm Bakey 🧁 — the AI assistant at Pretty Baked! Think of me as a smart, friendly helper who happens to work at the best bakery in town.\n\nI can help you with:\n• 🎂 Our full bakery menu & prices\n• 📋 Ingredients & allergy info\n• 🛒 Ordering & checkout\n• 🍰 Baking tips & recipes\n• 💡 General questions on almost any topic\n• 😄 A bit of fun, jokes, or just a conversation!\n\nWhat would you like to explore?",
      matched: [],
      noMatch: false,
    };
  }

  // ── Jokes ────────────────────────────────────────────────────────────────────
  if (
    /tell me a joke|joke|make me laugh|something funny|funny|humor|humour/.test(
      msg,
    )
  ) {
    const jokes = [
      "Why did the baker go to therapy? Because he had too many 'knead's! 🍞😄",
      "What do you call a stolen pie? Pie-rated! 🏴‍☠️🥧",
      "Why did the donut go to the dentist? It wanted a filling! 🍩😂",
      "I told a joke about croissants once. It was on a roll! 🥐",
      "What's a scarecrow's favorite dessert? Straw-berry shortcake! 🍓🎃",
      "Why don't scientists trust atoms? Because they make up everything! 😄 (Sneaking in a non-bakery one!)",
      "What do you call cheese that isn't yours? Nacho cheese! 🧀😂",
      "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
    ];
    return {
      text: jokes[Math.floor(Math.random() * jokes.length)],
      matched: [],
      noMatch: false,
    };
  }

  // ── Compliments ──────────────────────────────────────────────────────────────
  if (
    /you'?re? (great|awesome|amazing|helpful|smart|cool|the best|good|nice|wonderful)|good job|well done|love you|you rock/.test(
      msg,
    )
  ) {
    const compliments = [
      "Aw, that means a lot! 😊 You just made my day brighter than a freshly glazed donut! 🍩✨",
      "You're too kind! 🥰 I try my best! Now — is there anything I can help you with?",
      "Thank you! 😄 High praise coming from someone with such great taste! (Pun absolutely intended 🎂)",
    ];
    return {
      text: compliments[Math.floor(Math.random() * compliments.length)],
      matched: [],
      noMatch: false,
    };
  }

  // ── Thank you ────────────────────────────────────────────────────────────────
  if (/^(thank|thanks|thank you|ty|thx|cheers|appreciate)/.test(msg)) {
    return {
      text: "You're very welcome! 😊 Helping you is my favorite thing (right after fresh croissants). Anything else I can do for you?",
      matched: [],
      noMatch: false,
    };
  }

  // ── Weather ──────────────────────────────────────────────────────────────────
  if (
    /weather|temperature|forecast|rain|sunny|cloudy|storm|hot outside|cold outside/.test(
      msg,
    )
  ) {
    return {
      text: "I wish I could check live weather for you — but I'm a bakery assistant without internet superpowers! 😅\n\nFor real-time weather, try weather.com, Google Weather, or your phone's weather app.\n\nBut here's a tip: whatever the weather, it's always a great time for a warm croissant ☁️🥐 or a refreshing strawberry cake! 🍓🎂 Want to see our menu?",
      matched: [],
      noMatch: false,
    };
  }

  // ── Time / date ──────────────────────────────────────────────────────────────
  if (
    /what time is it|current time|what'?s the date|today'?s date|what day is it/.test(
      msg,
    )
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      text: `It's currently ${timeStr} on ${dateStr}! ⏰\n\nOur bakery is open Mon–Sat, 8am–9pm. So if you're feeling a mid-day craving, we're ready! 🧁`,
      matched: [],
      noMatch: false,
    };
  }

  // ── Math ─────────────────────────────────────────────────────────────────────
  if (
    /what is \d+\s*[+\-*/x×÷]\s*\d+|calculate|\d+ plus \d+|\d+ minus \d+|\d+ times \d+|\d+ divided/.test(
      msg,
    )
  ) {
    try {
      const expr = msg
        .replace(/what is|calculate|please|=|×/gi, "")
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .trim();
      const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, "");

      const result = Function(
        `"use strict"; return (${sanitized})`,
      )() as number;
      if (typeof result === "number" && Number.isFinite(result)) {
        return {
          text: `The answer is ${result}! 🔢 Math was never so delicious! 😄`,
          matched: [],
          noMatch: false,
        };
      }
    } catch {
      // fall through
    }
    return {
      text: 'I can handle basic math! Try typing something like "What is 25 + 17" or "Calculate 150 / 3". For advanced calculations, Wolfram Alpha is your friend! 🔢',
      matched: [],
      noMatch: false,
    };
  }

  // ── Motivational quotes ──────────────────────────────────────────────────────
  if (
    /motivat|inspire|quote|encouragement|feeling down|i'?m sad|depressed|cheer me up|motivation/.test(
      msg,
    )
  ) {
    const quotes = [
      "'Life is what you bake of it.' 🎂 Keep going — every great cake starts with a little heat!\n\nSeriously though — you're doing amazing. One step at a time! 💪",
      "'In the middle of every difficulty lies opportunity.' — Einstein 🌟\n\nAnd between every tough moment lies a slice of cake waiting to make things better. 🍰",
      "Every master was once a beginner. Every great bakery started with one loaf of bread. You've got this! 🍞✨",
      "'Success is not final, failure is not fatal: it is the courage to continue that counts.' — Churchill 🏅\n\nAlso — a good croissant helps. Trust me. 🥐😄",
    ];
    return {
      text: quotes[Math.floor(Math.random() * quotes.length)],
      matched: [],
      noMatch: false,
    };
  }

  // ── Recipes / baking tips ────────────────────────────────────────────────────
  if (
    /recipe|how to (bake|make|cook)|baking tips?|how do i (bake|make)|ingredients for|homemade/.test(
      msg,
    )
  ) {
    if (msg.includes("cake") || msg.includes("cupcake")) {
      return {
        text: "🎂 Quick Chocolate Cake Tips:\n• Use room-temperature eggs and butter for a fluffier crumb\n• Don't overmix — stop when just combined\n• Add a tablespoon of coffee to intensify chocolate flavor\n• Let it cool completely before frosting\n\nFor a full recipe, BBC Good Food and King Arthur Baking have excellent ones!\n\nOr better yet — let us bake it for you! 😄 Check our cake selection:",
        matched: products
          .filter((p) =>
            `${p.name} ${p.description}`.toLowerCase().includes("cake"),
          )
          .slice(0, 3),
        noMatch: false,
      };
    }
    if (msg.includes("bread") || msg.includes("sourdough")) {
      return {
        text: "🍞 Bread Baking Basics:\n• Use warm (not hot!) water to activate yeast — around 38°C\n• Knead until the dough is smooth and elastic\n• Let it rise in a warm spot until doubled in size\n• Score the top before baking for a professional look\n• Bake with steam for a crispy crust\n\nSourdough takes practice — don't give up on your starter! 🌱",
        matched: [],
        noMatch: false,
      };
    }
    if (msg.includes("cookie") || msg.includes("brownie")) {
      return {
        text: "🍪 Cookie & Brownie Tips:\n• Chill your cookie dough for 30 min before baking — thicker, chewier cookies\n• Use brown sugar for chewy, white for crispy\n• For fudgy brownies: melt butter with chocolate, don't over-bake\n• Underbaked is better — they continue cooking as they cool!\n\nOf course, our freshly baked cookies are always ready if you'd rather skip the kitchen! 😄",
        matched: products
          .filter((p) =>
            /cookie|brownie|macaron/.test(
              `${p.name} ${p.description}`.toLowerCase(),
            ),
          )
          .slice(0, 3),
        noMatch: false,
      };
    }
    return {
      text: "I love baking questions! 🧁 Here are some universal tips:\n• Always use room temperature eggs and dairy\n• Measure by weight, not volume — much more accurate\n• Preheat your oven fully before putting anything in\n• Don't open the oven door too early!\n• A toothpick inserted in the center should come out clean\n\nWhat specific recipe are you working on? I can give more targeted tips!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Geography ────────────────────────────────────────────────────────────────
  if (
    /capital of|capital city of|where is|country of|largest city|population of/.test(
      msg,
    )
  ) {
    const facts: Record<string, string> = {
      bangladesh:
        "🇧🇩 The capital of Bangladesh is Dhaka — one of the most densely populated cities in the world! And home to Pretty Baked! 🎂",
      france:
        "🇫🇷 The capital of France is Paris — also the croissant capital of the world! 🥐",
      japan:
        "🇯🇵 The capital of Japan is Tokyo — home to incredible pastry culture too! 🍡",
      usa: "🇺🇸 The capital of the USA is Washington, D.C. — not New York City, which surprises some people!",
      uk: "🇬🇧 The capital of the UK is London — where afternoon tea and scones are a sacred tradition! ☕",
      india:
        "🇮🇳 The capital of India is New Delhi. With incredible sweets like gulab jamun and rasgulla! 🍮",
      australia:
        "🇦🇺 The capital of Australia is Canberra — not Sydney! Fun fact most people get wrong!",
    };
    for (const [country, fact] of Object.entries(facts)) {
      if (msg.includes(country)) {
        return { text: fact, matched: [], noMatch: false };
      }
    }
    return {
      text: "That's a geography question! 🌍 I can answer some basics, but for comprehensive info, Wikipedia or Google is your best bet. What country are you curious about?",
      matched: [],
      noMatch: false,
    };
  }

  // ── Science / general knowledge ──────────────────────────────────────────────
  if (
    /why is the sky blue|how does|speed of light|theory of|evolution|photosynthesis|black hole/.test(
      msg,
    )
  ) {
    if (msg.includes("sky blue")) {
      return {
        text: "Great question! 🌤️ The sky appears blue because of a process called Rayleigh scattering. Sunlight contains all colors, but when it enters the atmosphere, shorter blue wavelengths scatter more than longer red ones — so we see blue!\n\nAt sunset, the sun is lower, so light travels through more atmosphere — more scattering shifts the color toward oranges and reds. 🌅",
        matched: [],
        noMatch: false,
      };
    }
    if (msg.includes("speed of light")) {
      return {
        text: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 300,000 km/s)! ⚡\n\nTo put that in perspective — light from the sun reaches Earth in about 8 minutes. That's incredibly fast... though not fast enough to deliver our cakes, sadly. 🍰😄",
        matched: [],
        noMatch: false,
      };
    }
    if (msg.includes("black hole")) {
      return {
        text: "Black holes are regions of space where gravity is so strong that nothing — not even light — can escape! 🌌\n\nThey form when massive stars collapse. The boundary around them is called the event horizon. Once you cross it, there's no coming back.\n\nFun fact: the supermassive black hole at the center of our galaxy is called Sagittarius A*. It's 4 million times the mass of our Sun!",
        matched: [],
        noMatch: false,
      };
    }
    return {
      text: "Ooh, a science question! 🔬 I know a fair bit, but for deep scientific accuracy I'd recommend Khan Academy, Wikipedia, or NASA's website. What specifically are you curious about? I might be able to give you a good starting point!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Coding help ──────────────────────────────────────────────────────────────
  if (
    /how to code|learn programming|\bpython\b|\bjavascript\b|\btypescript\b|\bhtml\b|\bcss\b|\breact\b|what is (a function|a variable|an api|rest|sql)|coding|programming/.test(
      msg,
    )
  ) {
    if (msg.includes("python")) {
      return {
        text: "Python is awesome! 🐍 It's one of the best languages to start with because it reads almost like English.\n\nQuick tip: Start with python.org/docs or freeCodeCamp. Practice daily — even 30 minutes makes a huge difference!\n\nWhat do you want to build with Python?",
        matched: [],
        noMatch: false,
      };
    }
    if (msg.includes("javascript") || msg.includes("typescript")) {
      return {
        text: "JavaScript (and TypeScript) power the entire web! 🌐\n\nFor beginners: javascript.info is the best free resource out there. For TypeScript specifically, typescriptlang.org/docs is excellent.\n\nAny specific JS/TS question I can help with?",
        matched: [],
        noMatch: false,
      };
    }
    if (msg.includes("react")) {
      return {
        text: "React is a fantastic UI library! ⚛️\n\nKey concepts to master:\n• Components & Props\n• State with useState\n• Side effects with useEffect\n• React Query for server data\n\nreact.dev is the official docs and they're excellent. This very website is built with React! 😄",
        matched: [],
        noMatch: false,
      };
    }
    return {
      text: "Coding questions are welcome here! 💻 I can give pointers on web technologies, Python, and general programming concepts.\n\nFor deep learning: freeCodeCamp, The Odin Project, and MDN Web Docs are all free and excellent resources.\n\nWhat language or concept are you working on?",
      matched: [],
      noMatch: false,
    };
  }

  // ── Health / fitness ─────────────────────────────────────────────────────────
  if (
    /lose weight|diet|healthy eating|calories|fitness|exercise|workout|nutrition|healthy food/.test(
      msg,
    )
  ) {
    return {
      text: "Health is wealth! 💪 While I'm obviously biased toward baked goods 😄, balance is key.\n\nGeneral tips:\n• Stay hydrated — often hunger is actually thirst\n• Eat whole foods most of the time\n• Everything in moderation (yes, including our croissants)\n• Consistent exercise beats intense bursts\n\nFor personalized advice, always consult a nutritionist or doctor!\n\n...That said, a single slice of our Red Velvet Cake is 100% worth it. 🎂😄",
      matched: [],
      noMatch: false,
    };
  }

  // ── Media recommendations ────────────────────────────────────────────────────
  if (
    /recommend a (book|movie|show|series|song|album|game|podcast)|what should i (watch|read|listen|play)/.test(
      msg,
    )
  ) {
    if (msg.includes("book") || msg.includes("read")) {
      return {
        text: "📚 Some beloved books across genres:\n• Fiction: The Alchemist (Paulo Coelho), Atomic Habits (James Clear)\n• Thriller: Gone Girl, The Girl with the Dragon Tattoo\n• Sci-Fi: The Martian, Dune, Project Hail Mary\n• Self-help: Deep Work by Cal Newport\n\nWhat genre do you enjoy most?",
        matched: [],
        noMatch: false,
      };
    }
    if (
      msg.includes("movie") ||
      msg.includes("show") ||
      msg.includes("series") ||
      msg.includes("watch")
    ) {
      return {
        text: "🎬 Great picks across genres:\n• Drama: Breaking Bad, The Crown\n• Comedy: Ted Lasso, Schitt's Creek\n• Thriller: Mindhunter, Dark\n• Feel-good: The Great British Bake Off (obviously! 🧁)\n• Movies: Interstellar, The Shawshank Redemption, Parasite\n\nWhat mood are you in?",
        matched: [],
        noMatch: false,
      };
    }
    return {
      text: "I'd love to help with recommendations! 😊 Tell me what genre or mood you're in — whether it's books, movies, shows, music, or games — and I'll give you some great options!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Context follow-up ────────────────────────────────────────────────────────
  if (
    msg.length < 25 &&
    history.length > 2 &&
    /tell me more|more info|elaborate|go on|continue|and\?|also\?|what else|more\?|really\?/.test(
      msg,
    )
  ) {
    const bakeryContext =
      lastAssistantMsg.toLowerCase().includes("cake") ||
      lastAssistantMsg.toLowerCase().includes("bread") ||
      lastAssistantMsg.toLowerCase().includes("donut");
    if (bakeryContext) {
      const { matched: moreMatched } = matchProducts(
        lastAssistantMsg,
        products,
      );
      return {
        text: "Sure! Here are a few more options you might love based on what we were discussing:",
        matched:
          moreMatched.length > 0
            ? moreMatched
            : products.filter((p) => p.isFeatured).slice(0, 3),
        noMatch: false,
      };
    }
    return {
      text: "Happy to dive deeper! 😊 Could you give me a bit more detail about what you'd like to know more about? I want to make sure I give you the most helpful answer!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Pricing query ────────────────────────────────────────────────────────────
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much") ||
    msg.includes("cheap") ||
    msg.includes("expensive")
  ) {
    const { matched: priceMatched } = matchProducts(message, products);
    if (priceMatched.length > 0) {
      return {
        text: "Here are the products and their prices:",
        matched: priceMatched,
        noMatch: false,
      };
    }
    return {
      text: "Our pricing by category:\n• 🎂 Cakes: ৳700–৳950\n• 🧁 Cupcakes: ৳130–৳150\n• 🍩 Donuts: ৳80–৳95\n• 🥐 Pastries: ৳100–৳160\n• 🍞 Breads: ৳120–৳180\n• 🍪 Cookies & Treats: ৳130–৳350\n• 🥙 Savory Items: ৳50–৳120\n• 🍰 Cheesecake: ৳900\n• 💍 Custom Wedding Cake: from ৳3,500\n\nAsk me about any specific item for its exact price!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Ingredients / allergens ──────────────────────────────────────────────────
  if (
    msg.includes("ingredient") ||
    msg.includes("contain") ||
    msg.includes("allerg") ||
    msg.includes("what's in") ||
    msg.includes("whats in")
  ) {
    const { matched: allergenMatched } = matchProducts(message, products);
    if (allergenMatched.length > 0) {
      return {
        text: "Tap the product below to see its full ingredient list on the product page:",
        matched: allergenMatched,
        noMatch: false,
      };
    }
    return {
      text: "All our products list full ingredients on their detail pages 📋. Tap any product in the shop to see what's inside. If you have a specific allergy concern, feel free to ask me about a product by name!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Ordering / checkout ──────────────────────────────────────────────────────
  if (
    msg.includes("how to order") ||
    msg.includes("checkout") ||
    msg.includes("how do i order") ||
    msg.includes("place an order") ||
    msg.includes("how to buy")
  ) {
    return {
      text: 'Ordering is super easy! 🛒\n1. Browse our Shop and tap any product\n2. Click "Add to Cart"\n3. Go to Cart → click "Checkout"\n4. Fill in your delivery details\n5. Apply a coupon code if you have one\n6. Pay by card (Stripe) or Cash on Delivery\n\nCreate an account to track your orders and earn loyalty points! 🌟',
      matched: [],
      noMatch: false,
    };
  }

  // ── Opening hours / location ─────────────────────────────────────────────────
  if (
    msg.includes("open") ||
    msg.includes("hours") ||
    msg.includes("location") ||
    msg.includes("where are you") ||
    msg.includes("address")
  ) {
    return {
      text: "We're open Monday to Saturday, 8am to 9pm 🕐\n📍 123 Baker Street, Dhaka, Bangladesh\n\nYou can also order online 24/7 through our Shop — we'll prepare your order fresh for delivery!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Delivery ─────────────────────────────────────────────────────────────────
  if (
    msg.includes("deliver") ||
    msg.includes("shipping") ||
    msg.includes("pickup") ||
    msg.includes("pick up") ||
    msg.includes("delivery fee")
  ) {
    return {
      text: "We deliver to your doorstep! 🚗\n\nDelivery fees:\n• ৳50 — Thakurgaon, Dinajpur, Saidpur, Rangpur\n• ৳100 — Outside these areas\n\nJust add your delivery address at checkout and the correct fee will be applied automatically!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Custom / wedding ─────────────────────────────────────────────────────────
  if (
    msg.includes("wedding") ||
    msg.includes("custom cake") ||
    msg.includes("custom order") ||
    msg.includes("bespoke") ||
    msg.includes("special order")
  ) {
    const { matched: customMatched } = matchProducts(
      "custom wedding cake",
      products,
    );
    return {
      text: "We love creating custom cakes! 💍🎂\nOur Custom Wedding Cakes start at ৳3,500, crafted to your exact vision — multi-tier, fondant, or buttercream. Contact us at hello@prettybaked.com to discuss your dream cake!",
      matched: customMatched,
      noMatch: false,
    };
  }

  // ── Loyalty points ───────────────────────────────────────────────────────────
  if (/points|loyalty|reward|redeem|bonus|cashback/.test(msg)) {
    return {
      text: "🌟 Pretty Baked Loyalty Points:\n• Earn 1 point for every ৳100 spent\n• Redeem 1 point = ৳1 off your order\n• New members get 10 bonus points on signup!\n• Points never expire\n\nYour available points are shown in My Profile. Use them at checkout with the 'Use Points' button before placing your order!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Coupon / discount ────────────────────────────────────────────────────────
  if (/coupon|discount|promo|offer|deal|voucher/.test(msg)) {
    return {
      text: "🎁 Using a Coupon Code:\nAt checkout, you'll see a coupon code box right before the order summary. Enter your code and the discount will apply instantly!\n\nDiscounts can be a fixed amount off or a percentage — depends on the code.\n\nDon't have a code? Keep an eye on our promotional bar at the top of the site for current offers! 👀",
      matched: [],
      noMatch: false,
    };
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  if (/wishlist|saved items|favorite|favourite|save for later/.test(msg)) {
    return {
      text: "💖 Wishlist Feature:\nYou can save any product to your Wishlist by tapping the heart icon on product cards!\n\nYour wishlist is saved to your account, so it'll be there every time you log in. Great for planning your next order! 🛒",
      matched: [],
      noMatch: false,
    };
  }

  // ── Category listing ─────────────────────────────────────────────────────────
  if (
    msg === "categories" ||
    msg.includes("what categories") ||
    msg.includes("what do you sell") ||
    msg.includes("what do you make") ||
    msg.includes("show all") ||
    (msg.includes("category") && msg.length < 30)
  ) {
    return {
      text: "Here's what we bake at Pretty Baked:\n🎂 Cakes — Red Velvet, Chocolate, Vanilla, Black Forest\n🧁 Cupcakes — Red Velvet, Chocolate Fudge, Vanilla Rainbow\n🍩 Donuts — Glazed, Chocolate, Strawberry\n🥐 Pastries — Croissants, Éclairs, Lemon Bars\n🍞 Breads — Garlic Bread, Classic Sourdough\n🍪 Cookies & Treats — Butter Cookies, Macarons, Brownies\n🥙 Savory Items — Cheese Naan, Chicken Patty, Samosa\n🍰 Cheesecakes — New York Style\n💍 Custom Wedding Cakes\n\nAsk me about any of these!",
      matched: [],
      noMatch: false,
    };
  }

  // ── Product matching ─────────────────────────────────────────────────────────
  const { matched, wasSpecific } = matchProducts(message, products);
  if (matched.length > 0) {
    const categorySlug = detectCategory(msg);
    let text: string;
    if (wasSpecific) {
      text = "Here's what I found for you:";
    } else if (categorySlug) {
      const catLabels: Record<string, string> = {
        cakes: "🎂 Cakes",
        pastries: "🥐 Pastries",
        breads: "🍞 Breads",
        cookies: "🍪 Cookies & Treats",
        cheesecakes: "🍰 Cheesecakes",
        custom: "💍 Custom Orders",
        donuts: "🍩 Donuts",
        cupcakes: "🧁 Cupcakes",
        savory: "🥙 Savory Items",
      };
      text = `Here are our ${catLabels[categorySlug] ?? "products"}:`;
    } else {
      text = "Here are some of our popular items:";
    }
    return { text, matched, noMatch: false };
  }

  // ── Creative fallback for unknown questions ──────────────────────────────────
  const isQuestion =
    msg.includes("?") ||
    msg.startsWith("what") ||
    msg.startsWith("how") ||
    msg.startsWith("why") ||
    msg.startsWith("when") ||
    msg.startsWith("who") ||
    msg.startsWith("where") ||
    msg.startsWith("can you");
  const isShortMsg = msg.split(" ").length <= 3;

  if (isShortMsg && !isQuestion) {
    return {
      text: "Interesting! 😄 I'm not quite sure what you mean — could you give me a bit more context? I'm here to help with bakery questions, general knowledge, recipes, or just a friendly chat!",
      matched: [],
      noMatch: false,
    };
  }

  if (isQuestion || msg.split(" ").length >= 4) {
    const topProducts = products.filter((p) => p.isFeatured).slice(0, 3);
    const snippet =
      message.length > 50 ? `${message.slice(0, 50)}...` : message;
    const creativeFallbacks = [
      `That's a great question — I want to be honest that I might not have the perfect answer for "${snippet}". 🤔\n\nFor the most accurate info, I'd suggest Googling it! But if there's anything bakery-related I can help with, I'm all yours. Here are some of our most loved items in the meantime:`,
      `Hmm, that one's a bit outside my expertise! 😄 I'm best at bakery topics, recipes, general knowledge, and friendly conversation.\n\nFor "${snippet}", a quick Google search would give you a much better answer than I can!\n\nCan I help you with something else? Maybe something delicious? 🍰`,
      `I appreciate the question! I'm still learning about that particular topic. 🧠\n\nHere's what I do know: our cakes are incredible, and you deserve a treat. While you ponder your question, check out some of our favorites:`,
    ];
    return {
      text: creativeFallbacks[
        Math.floor(Math.random() * creativeFallbacks.length)
      ],
      matched: topProducts,
      noMatch: true,
    };
  }

  // ── Ultimate fallback ────────────────────────────────────────────────────────
  return {
    text: "I'm here to help! 😊 You can ask me about our bakery menu, baking tips, general knowledge, or just have a chat. What would you like to know?",
    matched: [],
    noMatch: false,
  };
}

function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/shop/$productId"
      params={{ productId: product.id }}
      data-ocid="bakey.product_card.link"
      className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background hover:bg-accent/10 hover:border-accent/40 transition-smooth hover:scale-[1.02] group shadow-warm"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {product.description}
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
      <ShoppingBag
        size={14}
        className="text-muted-foreground shrink-0 group-hover:text-primary transition-smooth"
      />
    </Link>
  );
}

function MessageBubble({
  msg,
  index,
}: {
  msg: ChatMessage;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        msg.role === "user" ? "items-end" : "items-start",
      )}
      data-ocid={`bakey.message.${index + 1}`}
    >
      <div
        className={cn(
          "flex",
          msg.role === "user" ? "justify-end" : "justify-start",
        )}
      >
        {msg.role === "assistant" && (
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs shrink-0 mr-2 mt-0.5 select-none">
            🧁
          </div>
        )}
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line break-words",
            msg.role === "user"
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border text-foreground rounded-bl-sm shadow-warm",
          )}
        >
          {msg.content}
        </div>
      </div>

      {/* Product suggestion cards */}
      {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
        <div
          className="ml-8 mt-2 flex flex-col gap-2 w-[calc(100%-2rem)]"
          data-ocid="bakey.product_suggestions"
        >
          {msg.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {!msg.noMatch && (
            <p className="text-xs text-muted-foreground ml-1 mt-0.5">
              Tap a product to view details in the shop ✨
            </p>
          )}
        </div>
      )}

      {/* Browse shop nudge when no products matched */}
      {msg.role === "assistant" &&
        msg.products !== undefined &&
        msg.products.length === 0 && (
          <div className="ml-8 mt-1.5">
            <Link
              to="/shop"
              data-ocid="bakey.shop_link"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <ShoppingBag size={12} />
              Browse all products in the shop
            </Link>
          </div>
        )}
    </div>
  );
}

export function BakeyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: allProducts = [] } = useProducts();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      60,
    );

    // Simulate a brief typing delay for a natural feel
    await new Promise((resolve) =>
      setTimeout(resolve, 600 + Math.random() * 400),
    );

    const {
      text: responseText,
      matched,
      noMatch,
    } = buildLocalResponse(text, allProducts, messages);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: responseText,
        products: matched.length > 0 ? matched : undefined,
        noMatch,
      },
    ]);
    setIsTyping(false);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      60,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function clearChat() {
    setMessages([GREETING]);
    setInput("");
    setIsTyping(false);
  }

  return (
    <div className="fixed bottom-5 right-4 sm:right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {open && (
        <div
          className={cn(
            "bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden",
            "w-[calc(100vw-2rem)] sm:w-[380px]",
            "animate-fade-in",
          )}
          style={{ maxHeight: "min(520px, calc(100dvh - 100px))" }}
          data-ocid="bakey.dialog"
        >
          {/* Header */}
          <div className="gradient-warm px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/25 flex items-center justify-center text-lg shadow-warm select-none">
                🧁
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-primary-foreground font-display font-semibold text-sm tracking-wide">
                  Bakey
                </span>
                <span className="text-primary-foreground/80 text-xs">
                  Your Smart Assistant
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat"
                data-ocid="bakey.clear_button"
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-smooth"
                title="Clear chat"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                data-ocid="bakey.close_button"
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-smooth"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-background"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => (
              <MessageBubble key={`msg-${msg.role}-${i}`} msg={msg} index={i} />
            ))}

            {isTyping && (
              <div
                className="flex justify-start"
                data-ocid="bakey.loading_state"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs shrink-0 mr-2 mt-0.5 select-none">
                  🧁
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-warm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              disabled={isTyping}
              data-ocid="bakey.input"
              className="flex-1 bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-smooth disabled:opacity-50 min-w-0"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void handleSend()}
              disabled={!input.trim() || isTyping}
              data-ocid="bakey.send_button"
              aria-label="Send message"
              className="shrink-0 w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth disabled:opacity-40"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Bakey chat" : "Open Bakey chat"}
        data-ocid="bakey.open_modal_button"
        className="w-14 h-14 rounded-full gradient-warm text-primary-foreground shadow-elevated flex items-center justify-center transition-smooth hover:scale-105 active:scale-95 relative"
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={22} />
            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" />
          </>
        )}
      </button>
    </div>
  );
}
