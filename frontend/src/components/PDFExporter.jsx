import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, HeartPulse, FileText, CheckCircle2 } from 'lucide-react';

export const PDFExporter = ({ type, data, title = "Print Document" }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div className="inline-block">
      <button
        onClick={handlePrint}
        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
      >
        <Printer className="w-4 h-4" />
        <span>{title}</span>
      </button>

      {/* Render printable template into document.body only when printing */}
      {isPrinting && createPortal(
        <div className="hidden print:block">
          <div id="printable-section" className="p-8 max-w-2xl mx-auto bg-white text-slate-900 font-sans leading-relaxed">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center font-bold">M</div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">MediCare Lanka (Pvt) Ltd</h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">No. 45, Galle Road, Colombo 03, Sri Lanka</p>
              <p className="text-xs text-slate-600">Hotline: +94 11 700 8000 | Web: www.medicare.lk</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                {type === 'prescription' ? 'OFFICIAL PRESCRIPTION' : 'TAX INVOICE & RECEIPT'}
              </span>
              <p className="text-xs font-mono mt-2 text-slate-700">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {type === 'prescription' && data && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Patient Details</p>
                  <p className="font-bold text-slate-900">{data.patient_name || 'Kamal Perera'}</p>
                  <p className="text-xs text-slate-600">NIC/ID: {data.nic_passport || '199234567890'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Prescribing Specialist</p>
                  <p className="font-bold text-slate-900">{data.doctor_name || 'Dr. Nimal Perera'}</p>
                  <p className="text-xs text-slate-600">{data.specialization || 'General Physician'} ({data.slmc_reg_no || 'SLMC-45892'})</p>
                </div>
              </div>

              {/* Diagnosis */}
              {data.diagnosis && (
                <div className="border-l-4 border-teal-600 pl-4 py-1">
                  <p className="text-xs text-slate-500 uppercase font-bold">Diagnosis / Clinical Impression</p>
                  <p className="font-semibold text-slate-900 text-sm">{data.diagnosis}</p>
                </div>
              )}

              {/* Rx Medicines Table */}
              <div>
                <h3 className="font-bold text-base mb-3 border-b pb-1 text-slate-900 flex items-center gap-2">
                  <span>Rx - Prescribed Medicines</span>
                </h3>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="py-2 px-3 font-bold">Medicine Name</th>
                      <th className="py-2 px-3 font-bold">Dosage</th>
                      <th className="py-2 px-3 font-bold">Frequency</th>
                      <th className="py-2 px-3 font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items && data.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-2 px-3 font-bold text-slate-900">{item.medicine_name}</td>
                        <td className="py-2 px-3 text-slate-700">{item.dosage}</td>
                        <td className="py-2 px-3 text-slate-700">{item.frequency}</td>
                        <td className="py-2 px-3 text-slate-700">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Instructions */}
              {data.instructions && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900">
                  <strong>Instructions:</strong> {data.instructions}
                </div>
              )}

              {/* Signature Footer */}
              <div className="pt-12 flex justify-between items-end border-t border-slate-300">
                <div className="text-xs text-slate-500">
                  <p>Computer-generated prescription slip.</p>
                  <p>Valid with SLMC registered doctor stamp.</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-900 mb-1 font-signature">{data.doctor_name || 'Dr. Nimal Perera'}</div>
                  <p className="text-xs font-bold text-slate-900">Doctor Signature / Stamp</p>
                </div>
              </div>
            </div>
          )}

          {type === 'invoice' && data && (
            <div className="space-y-6">
              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Invoice No.</p>
                  <p className="font-mono font-bold text-teal-700 text-base">{data.invoice_no}</p>
                  <p className="text-xs text-slate-600">Appt Token: {data.appointment_no}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Billed To</p>
                  <p className="font-bold text-slate-900">{data.patient_name}</p>
                  <p className="text-xs text-slate-600">Contact: {data.patient_phone || '+94 77 444 5566'}</p>
                </div>
              </div>

              {/* Fee Breakdown */}
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100">
                    <th className="py-2 px-3 font-bold">Description</th>
                    <th className="py-2 px-3 font-bold text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3">Specialist Doctor Consultation Fee ({data.doctor_name})</td>
                    <td className="py-2 px-3 text-right font-mono">Rs. {(data.consultation_fee || 2500).toLocaleString()}</td>
                  </tr>
                  {data.lab_fee > 0 && (
                    <tr>
                      <td className="py-2 px-3">Laboratory Investigation Charges</td>
                      <td className="py-2 px-3 text-right font-mono">Rs. {data.lab_fee.toLocaleString()}</td>
                    </tr>
                  )}
                  {data.medicine_fee > 0 && (
                    <tr>
                      <td className="py-2 px-3">Pharmacy Medicine Charges</td>
                      <td className="py-2 px-3 text-right font-mono">Rs. {data.medicine_fee.toLocaleString()}</td>
                    </tr>
                  )}
                  {data.discount > 0 && (
                    <tr className="text-emerald-700 font-medium">
                      <td className="py-2 px-3">Special Discount applied</td>
                      <td className="py-2 px-3 text-right font-mono">- Rs. {data.discount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="font-black text-base bg-slate-100">
                    <td className="py-3 px-3">TOTAL PAID AMOUNT</td>
                    <td className="py-3 px-3 text-right font-mono text-teal-700">Rs. {data.total_amount ? data.total_amount.toLocaleString() : '2,500'}</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded flex justify-between items-center text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: PAID ({data.payment_method?.toUpperCase() || 'CASH'})
                </span>
                <span className="font-mono">Ref: {data.transaction_ref || 'TXN-MCL-8839201'}</span>
              </div>
            </div>
          )}

        </div>
      </div>,
      document.body
      )}
    </div>
  );
};
