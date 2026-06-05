import QRCode from "qrcode";
import type { ComputedRef } from "vue";

export const useConfirmationQR = (
  pdfUrl: ComputedRef<string | null>,
  isCanvasMounted?: ComputedRef<boolean>,
) => {
  const qrCanvas = ref<HTMLCanvasElement | null>(null);

  watchPostEffect(() => {
    const url = pdfUrl.value;
    const canvas = qrCanvas.value;
    const mounted = isCanvasMounted?.value ?? true;

    if (!url || !canvas || !mounted) return;

    void QRCode.toCanvas(canvas, url, {
      width: 140,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).catch((error) => {
      console.error("Ошибка при генерации QR-кода:", error);
    });
  });

  return { qrCanvas };
};
