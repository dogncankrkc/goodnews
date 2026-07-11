import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDB() {
  console.log("Testing Supabase Insert...");
  const { data, error } = await supabase.from('news').insert([
    {
      tr_title: "Yapay Zeka Kanseri Erken Teşhiste Devrim Yaratıyor",
      tr_content: "Bilim insanları, kanserli hücreleri henüz oluşum aşamasındayken tespit edebilen yeni bir yapay zeka algoritması geliştirdi. Bu gelişme sayesinde erken teşhis oranlarında %40'a varan bir artış bekleniyor. Uzmanlar, teknolojinin önümüzdeki beş yıl içinde tüm standart taramalara entegre edilebileceğini belirtiyor.",
      en_title: "AI Revolutionizes Early Cancer Detection",
      en_content: "Scientists have developed a new artificial intelligence algorithm capable of detecting cancerous cells in their nascent stages. With this breakthrough, early detection rates are expected to increase by up to 40%. Experts suggest the technology could be integrated into all standard screenings within the next five years.",
      image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      source_url: "https://positive.news/health",
      category: "health",
      is_breaking: true,
      author: "Haber Merkezi",
    },
    {
      tr_title: "Dünyanın En Büyük Okyanus Temizleme Projesi Başarıyla Sonuçlandı",
      tr_content: "Pasifik Okyanusu'nda yıllardır devam eden devasa temizlik operasyonu, hedeflenen plastik atık miktarının %90'ını toplamayı başardı. Yeni geliştirilen biyo-bozunur ağlar ve otonom gemiler sayesinde deniz yaşamına hiçbir zarar verilmeden gerçekleştirilen proje, diğer okyanuslar için de umut ışığı oldu.",
      en_title: "World's Largest Ocean Cleanup Project Concludes Successfully",
      en_content: "The massive cleanup operation in the Pacific Ocean has successfully collected 90% of its targeted plastic waste. Thanks to newly developed biodegradable nets and autonomous ships, the project was carried out without harming marine life, offering a beacon of hope for other oceans.",
      image_url: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80",
      source_url: "https://optimistdaily.com/environment",
      category: "environment",
      author: "Haber Merkezi",
    },
    {
      tr_title: "Güneş Enerjisi İlk Kez Fosil Yakıtları Geride Bıraktı",
      tr_content: "Küresel enerji raporuna göre, geçtiğimiz ay üretilen güneş enerjisi miktarı tarihte ilk kez kömür ve doğal gaz santrallerinin toplam üretimini aştı. Yenilenebilir enerji altyapısına yapılan büyük yatırımların meyvesini verdiğini belirten uzmanlar, temiz enerjiye geçişin beklenenden on yıl daha erken tamamlanabileceğini müjdeliyor.",
      en_title: "Solar Energy Surpasses Fossil Fuels for the First Time",
      en_content: "According to a global energy report, the amount of solar energy produced last month exceeded the combined output of coal and natural gas plants for the first time in history. Experts state that massive investments in renewable infrastructure are paying off, heralding that the transition to clean energy could be completed a decade earlier than expected.",
      image_url: "https://images.unsplash.com/photo-1509391366360-1f9509ce159a?w=800&q=80",
      source_url: "https://goodnewsnetwork.org/tech",
      category: "technology",
      author: "Haber Merkezi",
    }
  ]).select();

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Supabase Success! Inserted:", data);
  }
}

testDB();
