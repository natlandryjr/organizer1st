import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL (base64 PNG) for embedding in HTML emails.
 */
export async function generateQrDataUrl(text: string, size = 200): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
