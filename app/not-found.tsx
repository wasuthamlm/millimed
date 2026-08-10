import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">ไม่พบหน้าที่คุณค้นหา</h1>
      <p className="text-slate-500">หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง</p>
      <Button href="/">กลับหน้าแรก</Button>
    </Container>
  );
}
