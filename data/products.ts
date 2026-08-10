export type Product = {
  id: string;
  sku: string;
  nameTh: string;
  image: string;
  descriptionTh: string;
};

export const products: Product[] = [
  {
    id: "hyatear",
    sku: "MM-EC-001",
    nameTh: "Hyatear หยดตาเพิ่มความชุ่มชื้น",
    image: "/images/placeholder-product-1.png",
    descriptionTh: "ผลิตภัณฑ์หยดตาเพิ่มความชุ่มชื้น บรรเทาอาการตาแห้ง ระคายเคือง",
  },
  {
    id: "i-herb-eye-drop",
    sku: "MM-EC-002",
    nameTh: "I-HERB หยดตาสมุนไพร",
    image: "/images/placeholder-product-2.png",
    descriptionTh: "หยดตาสูตรสมุนไพร ช่วยลดอาการตาแดง คันตา",
  },
  {
    id: "eye-mask",
    sku: "MM-EC-003",
    nameTh: "แผ่นปิดตาเพื่อการพักผ่อน",
    image: "/images/placeholder-product-3.png",
    descriptionTh: "แผ่นปิดตาช่วยผ่อนคลายดวงตาหลังใช้งานหนัก",
  },
  {
    id: "cysterine",
    sku: "MM-SC-001",
    nameTh: "Cysterine โลชั่นบำรุงผิว",
    image: "/images/placeholder-product-4.png",
    descriptionTh: "โลชั่นบำรุงผิวสูตรอ่อนโยน เหมาะสำหรับทุกสภาพผิว",
  },
  {
    id: "gentle-cleanser",
    sku: "MM-SC-002",
    nameTh: "เจลทำความสะอาดผิวหน้าอ่อนโยน",
    image: "/images/placeholder-product-5.png",
    descriptionTh: "เจลล้างหน้าสูตรอ่อนโยน ไม่ทำให้ผิวแห้งตึง",
  },
  {
    id: "moisture-cream",
    sku: "MM-SC-003",
    nameTh: "ครีมบำรุงผิวเข้มข้น",
    image: "/images/placeholder-product-6.png",
    descriptionTh: "ครีมบำรุงผิวเข้มข้น ฟื้นฟูผิวแห้งกร้าน",
  },
];
