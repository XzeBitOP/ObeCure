import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { DailyPlan, UserProfile } from '../types';

// The jsPDF instance has autoTable as a method after importing jspdf-autotable
// We need to extend the type to make TypeScript happy.
// FIX: Changed interface extension to a type intersection to correctly combine types.
type jsPDFWithAutoTable = jsPDF & {
    autoTable: (options: any) => jsPDFWithAutoTable;
    lastAutoTable: { finalY: number };
};

export const generatePlanPDF = async (plan: DailyPlan, user: UserProfile): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    }) as jsPDFWithAutoTable;
    
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    let y = margin;

    // --- HELPER FUNCTIONS ---
    const addText = (text: string, x: number, yPos: number, options: any = {}) => {
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.setFontSize(options.size || 10);
        doc.setTextColor(options.color || '#374151');
        doc.text(text, x, yPos, { align: options.align || 'left' });
    };

    // --- HEADER ---
    addText('ObeCure', margin, y, { size: 24, font: 'helvetica', style: 'bold', color: '#f97316' });
    addText('BioAdaptive Metabolic Plan — OFFLINE', margin, y + 8, { size: 10, color: '#6b7280' });
    y += 20;
    doc.setDrawColor('#e5e7eb');
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // --- PATIENT INFO ---
    const bmi = user.baseline.weight_kg / ((user.height_cm / 100) ** 2);
    addText('Patient Details', margin, y, { style: 'bold', size: 12 });
    y += 6;
    addText(`Name: ${user.name || 'N/A'}`, margin, y);
    addText(`Date: ${new Date(plan.date + 'T00:00:00').toLocaleDateString('en-GB')}`, pageW / 2, y);
    y += 6;
    addText(`Age / Sex: ${user.age} / ${user.sex}`, margin, y);
    addText(`Weight / BMI: ${user.baseline.weight_kg} kg / ${bmi.toFixed(1)}`, pageW / 2, y);
    y += 10;
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // --- SCORES & PHENOTYPE ---
    addText('Metabolic Scores (0-100)', margin, y, { style: 'bold', size: 12 });
    y += 8;
    const scores = [
        { label: 'Gut Load (GLS)', value: plan.scores.GLS },
        { label: 'Appetite (ACS)', value: plan.scores.ACS },
        { label: 'Stress (SCS)', value: plan.scores.SCS },
        { label: 'Energy (EDS)', value: plan.scores.EDS },
        { label: 'Metabolism (MSS)', value: plan.scores.MSS },
    ];
    scores.forEach((score, i) => {
        const xPos = margin + (i % 3) * 60;
        const yPos = y + Math.floor(i / 3) * 15;
        addText(`${score.label}:`, xPos, yPos);
        const color = score.value >= 70 ? '#ef4444' : score.value >= 50 ? '#f59e0b' : '#22c55e';
        addText(String(Math.round(score.value)), xPos + 35, yPos, { style: 'bold', color });
    });
    y += 35;
    addText('Today\'s Phenotype:', margin, y);
    addText(`${plan.phenotype.primary}${plan.phenotype.secondary ? ` / ${plan.phenotype.secondary}` : ''}`, margin + 40, y, { style: 'bold', color: '#ea580c' });
    y += 10;
    doc.line(margin, y, pageW - margin, y);
    y += 10;
    
    // --- PRESCRIPTION TABLE ---
    addText('Personalized Prescription', margin, y, { style: 'bold', size: 12 });
    y += 8;
    const tableHeaders = [['SKU', 'Dose', 'Timing', 'Rationale']];
    const tableBody = plan.plan.map(item => [item.sku, item.dose, item.time, item.reason]);
    doc.autoTable({
        startY: y,
        head: tableHeaders,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: '#f97316', textColor: '#ffffff' },
        styles: { cellPadding: 2.5, fontSize: 9 },
        margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- NOTES ---
    if(plan.notes.length > 0) {
        addText('Doctor\'s Notes & Cautions', margin, y, { style: 'bold', size: 12 });
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor('#4b5563');
        plan.notes.forEach(note => {
             const splitText = doc.splitTextToSize(`• ${note}`, pageW - margin * 2);
             doc.text(splitText, margin, y);
             y += (splitText.length * 4);
        });
        y += 5;
    }
    
    // --- FOOTER & QR ---
    const qrUrl = `${window.location.origin}${window.location.pathname}?view=ayurveda&date=${plan.date}`;
    const qrImgData = await QRCode.toDataURL(qrUrl, {
        width: 90,
        margin: 1,
        errorCorrectionLevel: 'H'
    });
    
    doc.addImage(qrImgData, 'PNG', pageW - margin - 30, pageH - margin - 30, 30, 30);
    
    doc.setDrawColor('#e5e7eb');
    doc.line(margin, pageH - 45, pageW - margin, pageH - 45);
    addText('Formulated by Dr. Kenil Shah (MD, Internal Medicine)', margin, pageH - 40, { size: 9, color: '#6b7280' });
    addText('FSSAI-compliant nutraceutical guidance. Not for medicinal use.', margin, pageH - 36, { size: 8, color: '#9ca3af' });
    
    return doc.output('blob');
};
