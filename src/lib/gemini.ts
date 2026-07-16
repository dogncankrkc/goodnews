import { GoogleGenAI } from "@google/genai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface AnalyzedNews {
  tr_title: string;
  tr_content: string;
  en_title: string;
  en_content: string;
  category: string;
  is_breaking: boolean;
  image_prompt: string;
  audience_type: string;
}

/**
 * Rates a news article from 1 to 10 based on positivity, social benefit, inspiration, and hope.
 * Returns the score as a number. Returns 0 if it fails or if the news is completely negative.
 */
export async function rateNewsPositivity(
  originalTitle: string,
  originalContent: string
): Promise<number> {
  const prompt = `Sen uzman bir haber editörüsün. Gelen bu ham haberin pozitiflik, toplumsal fayda, ilham ve umut vericilik puanı 1 ile 10 arasında kaçtır? 
Yanıt olarak SADECE geçerli bir JSON döndür. Örnek: {"score": 8}

ORIJINAL BAŞLIK: ${originalTitle}
ORIJINAL İÇERİK: ${originalContent}`;

  const fallbackModels = [
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ];

  for (const model of fallbackModels) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text?.trim() || "";
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      if (typeof parsed.score === "number") {
        return parsed.score;
      }
    } catch (error) {
      // Ignore and fallback
    }
  }
  
  return 0; // Failed to score or all models exhausted
}

/**
 * Analyzes a news article using Gemini Flash.
 * - If the news is negative/tragic → returns null
 * - If positive → rewrites in both Turkish AND English, returns structured JSON
 *
 * Single fetch, dual output strategy: one API call produces both languages.
 */
export async function analyzeAndRewriteNews(
  originalTitle: string,
  originalContent: string
): Promise<AnalyzedNews | null> {
  const prompt = `Sen profesyonel, deneyimli ve ödüllü bir haber editörüsün. Aşağıdaki haberi analiz et.

KURALLAR:
1. KESİN RED NEDENLERİ: Eğer haber siyaset, politika, seçim, dini konular, mezhep, cemaat veya siyasi partilerle ilgiliyse VEYA negatif, trajik, şiddet içeren, suç, felaket veya acı odaklıysa, SADECE şu yanıtı ver: null
2. Haberi tam olarak 3 paragrafta özetle. Minimum 150, maksimum 250 kelime kullan. Kesinlikle lafı uzatma ve gereksiz detaylara girme.
3. Hem Türkçe hem de İngilizce versiyonunu oluştur. Her iki dilde de aynı derinlikte ve zenginlikte yaz.
4. İçeriği olgusal tut ancak pozitif yönleri vurgula. Konunun neden önemli olduğunu, hangi sorunlara çözüm getirdiğini veya topluma nasıl ilham verdiğini açıkla.
5. Her dil için çekici, ilgi çekici ve SEO dostu bir başlık oluştur.
6. Haberin içeriğini analiz ettikten sonra, kategorisini belirlerken SADECE şu anahtarlardan birini seçmek zorundasın: [general, technology, digital_security, science, health, nature, humanity, education, sports_action, culture_arts, good_business]. Asla kendi inisiyatifinle yeni bir kategori ismi üretme.
7. Bu haber sadece Türkiye kamuoyunu ilgilendiren yerel bir başarı/gelişme ise "TR_LOCAL", dünyanın neresinde olursa olsun herkesin içini ısıtacak evrensel bir gelişme ise "UNIVERSAL" etiketini ver. JSON çıktısına "audience_type" olarak ekle.
8. Eğer çok büyük, dünyayı veya kitleleri etkileyecek çapta önemli bir pozitif gelişmeyse is_breaking değerini true, sıradan tatlı bir haberse false yap.
9. Habere uygun, telif hakkı ihlali yaratmayacak, fotogerçekçi bir görsel oluşturmak için İngilizce bir image_prompt üret.

ORIJINAL BAŞLIK: ${originalTitle}
ORIJINAL İÇERİK: ${originalContent}

SADECE geçerli JSON ile yanıt ver (markdown yok, kod bloku yok):
{
  "tr_title": "Türkçe başlık",
  "tr_content": "Türkçe tam makale içeriği (tam 3 paragraf, 150-250 kelime)",
  "en_title": "English title",
  "en_content": "English full article content (exactly 3 paragraphs, 150-250 words)",
  "category": "kategori_adı",
  "audience_type": "TR_LOCAL veya UNIVERSAL",
  "is_breaking": boolean,
  "image_prompt": "English prompt for image generation"
}

Veya sadece şu yanıtı ver: null`;

  // ── Model Fallback (Şelale) Mimarisi ─────────────────────
  const fallbackModels = [
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3-flash",
    "gemini-3.5-flash",
  ];

  for (const model of fallbackModels) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text?.trim() || "";

      if (text === "null" || text === "") {
        return null;
      }

      // Try to parse JSON from the response, handling potential markdown wrapping
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr) as AnalyzedNews;

      // Validate required fields
      if (
        !parsed.tr_title ||
        !parsed.tr_content ||
        !parsed.en_title ||
        !parsed.en_content
      ) {
        console.error("Gemini response missing required fields:", parsed);
        return null;
      }

      return {
        tr_title: parsed.tr_title,
        tr_content: parsed.tr_content,
        en_title: parsed.en_title,
        en_content: parsed.en_content,
        category: parsed.category || "general",
        audience_type: parsed.audience_type || "UNIVERSAL",
        is_breaking: !!parsed.is_breaking,
        image_prompt: parsed.image_prompt || "",
      };
    } catch (error) {
      console.warn(`Model [${model}] başarısız oldu, sıradakine geçiliyor...`, error);
      // Sonraki modele geçmeden önce 2 saniye bekle (rate-limit koruması)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Tüm modeller tükendi
  console.error("Gemini analysis failed: all fallback models exhausted.");
  throw new Error("ALL_MODELS_EXHAUSTED");
}
