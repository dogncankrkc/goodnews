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
  const prompt = `Sen profesyonel bir haber editörüsün. Aşağıdaki haberi analiz et.

KURALLAR:
1. Eğer haber negatif, trajik, şiddet içeren veya ağırlıklı olarak felaket, suç veya acı ile ilgiliyse, sadece şu yanıtı ver: null
2. Eğer haber pozitif, umut verici, ilham verici veya ilerleme ve güzel gelişmeler hakkındaysa, bu haberi sanki deneyimli bir haber editörüymüşsün gibi doğal ve umut verici bir dille yeniden yaz.
3. Hem Türkçe hem de İngilizce versiyonunu oluştur.
4. İçeriği olgusal tut ancak pozitif yönleri vurgula.
5. Her dil için çekici bir başlık ve tam bir makale (3-5 paragraf) oluştur.
6. Haberin içeriğini analiz ettikten sonra, kategorisini belirlerken SADECE şu anahtarlardan birini seçmek zorundasın: [general, technology, digital_security, science, health, nature, humanity, education, sports_action, culture_arts, good_business]. Asla kendi inisiyatifinle yeni bir kategori ismi üretme.
7. Eğer çok büyük, dünyayı veya kitleleri etkileyecek çapta önemli bir pozitif gelişmeyse is_breaking değerini true, sıradan tatlı bir haberse false yap.
8. Habere uygun, telif hakkı ihlali yaratmayacak, fotogerçekçi bir görsel oluşturmak için İngilizce bir image_prompt üret.

ORIJINAL BAŞLIK: ${originalTitle}
ORIJINAL İÇERİK: ${originalContent}

SADECE geçerli JSON ile yanıt ver (markdown yok, kod bloku yok):
{
  "tr_title": "Türkçe başlık",
  "tr_content": "Türkçe tam makale içeriği",
  "en_title": "English title",
  "en_content": "English full article content",
  "category": "kategori_adı",
  "is_breaking": boolean,
  "image_prompt": "English prompt for image generation"
}

Veya sadece şu yanıtı ver: null`;

  try {
    const response = await getClient().models.generateContent({
      model: "gemini-2.0-flash",
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
      is_breaking: !!parsed.is_breaking,
      image_prompt: parsed.image_prompt || "",
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
