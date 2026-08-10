export type NewsItem = {
  slug: string;
  title: string;
  image: string;
  excerpt: string;
  publishedAt: string;
  bodyTh: string;
};

export const newsItems: NewsItem[] = [
  {
    slug: "millimed-shares-love-2026",
    title: "Millimed Shares Love ส่งต่อความสุขสู่ชุมชน",
    image: "/images/placeholder-news-1.png",
    excerpt: "กิจกรรมเพื่อสังคมประจำปี มอบเวชภัณฑ์และทุนการศึกษาแก่ชุมชนโดยรอบโรงงาน",
    publishedAt: "2026-06-15",
    bodyTh:
      "บริษัท มิลลิเมด จำกัด จัดกิจกรรม Millimed Shares Love มอบเวชภัณฑ์และทุนการศึกษาให้แก่โรงเรียนและชุมชนโดยรอบโรงงาน เพื่อส่งต่อความสุขและสุขภาพที่ดีตามแนวคิด Pass on Happiness",
  },
  {
    slug: "new-factory-certification",
    title: "โรงงานมิลลิเมดผ่านมาตรฐาน GMP PIC/S",
    image: "/images/placeholder-news-2.png",
    excerpt: "ตอกย้ำคุณภาพการผลิตระดับสากลด้วยมาตรฐาน GMP PIC/S",
    publishedAt: "2026-05-02",
    bodyTh:
      "โรงงานผลิตของมิลลิเมดได้รับการรับรองมาตรฐาน GMP PIC/S อย่างเป็นทางการ สะท้อนถึงความมุ่งมั่นในการผลิตผลิตภัณฑ์เวชภัณฑ์คุณภาพสูงที่ได้มาตรฐานสากล",
  },
  {
    slug: "education-scholarship-2026",
    title: "Millimed for Education มอบทุนการศึกษาแก่นักศึกษาเภสัชศาสตร์",
    image: "/images/placeholder-news-3.png",
    excerpt: "โครงการมอบทุนการศึกษาต่อเนื่องสำหรับนักศึกษาสาขาเภสัชศาสตร์",
    publishedAt: "2026-03-20",
    bodyTh:
      "มิลลิเมดยังคงเดินหน้าโครงการ Millimed for Education มอบทุนการศึกษาให้แก่นักศึกษาสาขาเภสัชศาสตร์อย่างต่อเนื่อง เพื่อสนับสนุนบุคลากรทางการแพทย์รุ่นใหม่",
  },
  {
    slug: "kick-off-outing-2026",
    title: "กิจกรรม Kick off & Outing ประจำปี 2569",
    image: "/images/placeholder-news-4.png",
    excerpt: "กิจกรรมสร้างความสัมพันธ์และขวัญกำลังใจให้แก่พนักงานทุกฝ่าย",
    publishedAt: "2026-01-18",
    bodyTh:
      "บริษัทจัดกิจกรรม Kick off & Outing ประจำปี เพื่อสร้างความสัมพันธ์อันดีระหว่างพนักงาน พร้อมทั้งมอบนโยบายและเป้าหมายการทำงานสำหรับปีใหม่",
  },
];
