// src/utils/printUtils.js

/**
 * Opens a printable version of a student record using your styled red/white layout.
 * @param {Object} student - The student data to print.
 */
export function printStudentProfile(student) {
  if (!student) {
    alert("No student data to print.");
    return;
  }

  const escape = (v) => {
    if (v === null || v === undefined) return "";
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const name = escape(student.name || "");
  const email = escape(student.email || "");
  const roll = escape(student.rollNo || "");
  const dept = escape(student.department || "");
  const hostel = escape(student.hostel || "");
  const contact = escape(student.contactNumber || "");
  const address = escape(
    (student.residentialAddress && (
      `${student.residentialAddress.line1 || ""} ${student.residentialAddress.line2 || ""}, ${student.residentialAddress.district || ""}, ${student.residentialAddress.state || ""} - ${student.residentialAddress.pincode || ""}`
    )) || ""
  );

  const photoUrl = student.photoUrl || student.photo || "";
  const accent = "#d32f2f";
  const accentDark = "#b71c1c";

  const css = `
    :root { --accent: ${accent}; --accent-dark: ${accentDark}; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
      font-family: Inter, system-ui, Arial, Helvetica, sans-serif;
    }
    .print-wrap {
      max-width: 840px;
      margin: 24px auto;
      padding: 28px;
      border: 8px solid var(--accent);
      border-radius: 8px;
      background: #fff;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 6px solid var(--accent);
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand {
      width: 84px;
      height: 84px;
      border-radius: 8px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    }
    .title { flex: 1; }
    .title h1 {
      margin: 0;
      font-size: 20px;
      color: var(--accent-dark);
    }
    .title p {
      margin: 4px 0 0 0;
      color: #6b6b6b;
      font-size: 13px;
    }
    .photo {
      width: 84px;
      height: 84px;
      border-radius: 6px;
      overflow: hidden;
      background: #f5f5f5;
      border: 1px solid #eee;
      object-fit: cover;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 6px 18px rgba(16,24,40,0.03);
    }
    .card h3 {
      margin: 0 0 8px 0;
      color: var(--accent);
      font-size: 14px;
    }
    .field {
      font-size: 13px;
      color: #222;
      margin: 6px 0;
    }
    .field .label {
      display: block;
      color: #7a7a7a;
      font-size: 12px;
    }
    .footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .qr-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      border: 2px dashed #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #bbb;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    table td {
      padding: 8px 6px;
      border-top: 1px solid #f0f0f0;
      font-size: 13px;
    }
    .muted { color: #777; font-size: 12px; }

    @media print {
      body { background: #fff; }
      .print-wrap { border: 6px solid var(--accent); margin: 8mm; }
      .header { page-break-after: auto; }
      .footer { page-break-inside: avoid; }
    }
  `;

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Print - ${name}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>${css}</style>
    </head>
    <body>
      <div class="print-wrap">
        <div class="header">
          <div class="brand">HOSTEL</div>
          <div class="title">
            <h1>Student Profile</h1>
            <p class="muted">Official student record — print copy</p>
          </div>
          ${photoUrl
            ? `<img src="${escape(photoUrl)}" alt="photo" class="photo" />`
            : `<div class="photo" aria-hidden="true"></div>`}
        </div>

        <div class="grid">
          <div class="card">
            <h3>Personal Details</h3>
            <div class="field"><span class="label">Name</span>${name}</div>
            <div class="field"><span class="label">Email</span>${email}</div>
            <div class="field"><span class="label">Contact</span>${contact}</div>
            <div class="field"><span class="label">Address</span>${address}</div>
          </div>

          <div class="card">
            <h3>Academic & Hostel</h3>
            <div class="field"><span class="label">Roll Number</span>${roll}</div>
            <div class="field"><span class="label">Department</span>${dept}</div>
            <div class="field"><span class="label">Hostel</span>${hostel}</div>
            <div class="field"><span class="label">Generated</span>${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div style="margin-top:14px" class="card">
          <h3>Notes</h3>
          <div class="field muted">
            This document is a system generated printable student record. Verify details in the main system for updates.
          </div>

          <table>
            <tbody>
              <tr><td style="width:30%"><strong>Field</strong></td><td><strong>Value</strong></td></tr>
              <tr><td class="muted">Name</td><td>${name}</td></tr>
              <tr><td class="muted">Email</td><td>${email}</td></tr>
              <tr><td class="muted">Roll</td><td>${roll}</td></tr>
              <tr><td class="muted">Department</td><td>${dept}</td></tr>
              <tr><td class="muted">Hostel</td><td>${hostel}</td></tr>
              <tr><td class="muted">Contact</td><td>${contact}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="muted">Powered by AuthApp • ${new Date().getFullYear()}</div>
          <div class="qr-placeholder">QR / Seal</div>
        </div>
      </div>
    </body>
  </html>`;

  const printWindow = window.open("", "_blank", "toolbar=0,location=0,menubar=0");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site to print.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    try {
      printWindow.print();
    } catch (e) {
      console.warn("Print failed", e);
    }
  }, 400);
}
