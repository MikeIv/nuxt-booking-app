import QRCode from "qrcode";
import type { ComputedRef } from "vue";

export const useConfirmationQR = (pdfUrl: ComputedRef<string | null>) => {
  const qrCanvas = ref<HTMLCanvasElement | null>(null);

  const generateQRCode = async () => {
    if (!qrCanvas.value || !pdfUrl.value) return;
    try {
      await QRCode.toCanvas(qrCanvas.value, pdfUrl.value, {
        width: 140,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    } catch (error) {
      console.error("Ошибка при генерации QR-кода:", error);
    }
  };

  watch(
    pdfUrl,
    (url) => {
      if (url) nextTick(() => generateQRCode());
    },
    { immediate: true },
  );

  return { qrCanvas };
};
