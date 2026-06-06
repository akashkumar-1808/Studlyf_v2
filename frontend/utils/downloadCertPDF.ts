/**
 * downloadCertPDF
 * Fetches the certificate HTML from the backend, renders it onto a canvas
 * (via html2canvas) and then exports it as a PDF (via jsPDF) — triggering
 * a real browser download with no print-dialog.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '../apiConfig';

export async function downloadCertPDF(
    userId: string,
    certId: string,
    courseTitle: string = 'Certificate'
): Promise<void> {
    try {
        // 1. Fetch the HTML from the backend
        const res = await fetch(
            `${API_BASE_URL}/api/certificates/${userId}/${certId}/html`
        );
        if (!res.ok) throw new Error('Could not fetch certificate HTML');
        const html = await res.text();

        // 2. Render the HTML into a hidden off-screen iframe so styles apply
        const iframe = document.createElement('iframe');
        iframe.style.cssText =
            'position:fixed;top:-10000px;left:-10000px;width:1050px;height:740px;border:none;';
        document.body.appendChild(iframe);

        iframe.contentDocument!.open();
        iframe.contentDocument!.write(html);
        iframe.contentDocument!.close();

        // 3. Wait for fonts / images to load
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));

        // 4. Capture the iframe body as a canvas
        const canvas = await html2canvas(
            iframe.contentDocument!.body,
            {
                scale: 2,           // 2× for crisp output
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 1050,
                height: 740,
                windowWidth: 1050,
                windowHeight: 740,
            }
        );

        // 5. Clean up iframe
        document.body.removeChild(iframe);

        // 6. Build PDF (landscape A4 ≈ 297 × 210 mm)
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);

        // 7. Download
        const safeName = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${safeName}_certificate.pdf`);
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Could not generate PDF. Please try again.');
    }
}
