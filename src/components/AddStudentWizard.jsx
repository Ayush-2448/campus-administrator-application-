// src/components/AddStudentWizard.jsx
import React, { useMemo, useState, useEffect } from 'react';
import api from '../api/axios';
import s from './css/AddStudentWizard.module.css';

const emptyState = {
  // Step 1 - Personal
  name: '',
  email: '',
  rollNo: '',
  contactNumber: '',
  // Step 2 - Address
  residentialAddress: {
    line1: '', line2: '', district: '', state: '', pincode: '', country: ''
  },
  permanentAddress: {
    line1: '', line2: '', district: '', state: '', pincode: '', country: ''
  },
  // Step 3 - Guardian
  guardianName: '',
  guardianContact: '',
  guardianRelation: '',
  guardianEmail: '',
  // Step 4 - Documents + allocation
  department: '',
  hostel: '',
  roomNumber: '',
  // Step 5 - Meals & other
  mealsOptIn: 'yes',
  stayDuration: '',
};

export default function AddStudentWizard({
  onClose,
  onSaved,
  mode = 'create', // 'create' | 'edit'
  initialData = null // used for edit prefill
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(emptyState);
  const [files, setFiles] = useState({
    aadharFront: null,
    aadharBack: null,
    photo: null,
    additional: null
  });
  const [sameAddress, setSameAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [justSavedStudent, setJustSavedStudent] = useState(null);

  // steps metadata
  const steps = useMemo(() => ([
    { key: 'personal', title: 'Personal' },
    { key: 'address', title: 'Address' },
    { key: 'guardian', title: "Guardian" },
    { key: 'docs', title: 'Docs & Allocation' },
    { key: 'meals', title: 'Meals' },
  ]), []);

  // If initialData provided (edit mode), prefill form
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Map initialData into our form shape as best-effort
      const mapped = { ...emptyState, ...initialData };

      // If backend returns nested address as string, try parse
      if (initialData.residentialAddress && typeof initialData.residentialAddress === 'string') {
        try {
          mapped.residentialAddress = JSON.parse(initialData.residentialAddress);
        } catch (e) {
          // ignore
        }
      }
      if (initialData.permanentAddress && typeof initialData.permanentAddress === 'string') {
        try {
          mapped.permanentAddress = JSON.parse(initialData.permanentAddress);
        } catch (e) {
          // ignore
        }
      }

      setData(prev => ({ ...mapped }));
      // if permanent equals residential, enable sameAddress
      try {
        const res = mapped.residentialAddress || {};
        const perm = mapped.permanentAddress || {};
        const equal = JSON.stringify(res) === JSON.stringify(perm);
        setSameAddress(equal);
      } catch {
        setSameAddress(false);
      }
    }
  }, [mode, initialData]);

  // navigation helpers
  const next = () => setStep((sIdx) => Math.min(sIdx + 1, steps.length - 1));
  const back = () => setStep((sIdx) => Math.max(sIdx - 1, 0));

  function handleChange(e) {
    const { name, value } = e.target;
    if (!name) return;
    if (name.includes('.')) {
      const [parent, key] = name.split('.');
      setData(prev => {
        const updated = { ...prev, [parent]: { ...prev[parent], [key]: value } };
        if (sameAddress && parent === 'residentialAddress') {
          updated.permanentAddress = { ...updated.residentialAddress };
        }
        return updated;
      });
    } else {
      setData(prev => ({ ...prev, [name]: value }));
    }
  }

  function toggleSameAddress(e) {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) {
      setData(prev => ({ ...prev, permanentAddress: { ...prev.residentialAddress } }));
    }
  }

  function handleFile(e) {
    const { name, files: f } = e.target;
    setFiles(prev => ({ ...prev, [name]: f && f[0] ? f[0] : null }));
  }

  // Attempt to notify student via backend endpoint (best-effort fire-and-forget)
  async function tryNotifyStudent(email, savedStudent) {
    if (!email) return;
    const payload = {
      email,
      title: 'Your student profile has been added/updated',
      body: `Hello ${savedStudent.name || ''}, your student record (roll ${savedStudent.rollNo || ''}) was added/updated by staff.`,
      meta: { studentId: savedStudent._id || null, action: mode === 'edit' ? 'student_record_updated' : 'student_record_created' }
    };
    try {
      await api.post('/api/notifications', payload).catch(() => {});
    } catch (err) {
      // ignore
    }
  }

  // prepare FormData from data/files, skipping empty objects
  const makeFormData = () => {
    const fd = new FormData();
    const payload = { ...data };

    const isEmptyObject = (obj) => {
      if (!obj || typeof obj !== 'object') return true;
      const keys = Object.keys(obj);
      if (keys.length === 0) return true;
      return keys.every(k => {
        const v = obj[k];
        if (v === undefined || v === null) return true;
        if (typeof v === 'string' && v.trim() === '') return true;
        if (typeof v === 'object') return isEmptyObject(v);
        return false;
      });
    };

    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (typeof v === 'object') {
        if (isEmptyObject(v)) return;
        try {
          fd.append(k, JSON.stringify(v));
        } catch (err) {
          console.warn(`Skipping ${k} - could not stringify`, err);
        }
        return;
      }
      fd.append(k, v);
    });

    Object.entries(files).forEach(([k, f]) => {
      if (!f) return;
      fd.append(k, f);
    });

    return fd;
  };

  // Submit handler supports both create and edit
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setJustSavedStudent(null);

    // basic validation
    if (!data.name || !data.email || !data.rollNo) {
      setError('Please fill required fields (Name, Email, Roll Number).');
      return;
    }

    setLoading(true);
    try {
      const fd = makeFormData();

      let saved;
      if (mode === 'edit' && initialData && initialData._id) {
        // PUT multipart to update student
        const res = await api.put(`/api/students/${initialData._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        saved = res.data;
      } else {
        // create
        const res = await api.post('/api/students', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        saved = res.data;
      }

      setJustSavedStudent(saved || null);
      setSuccessMessage(mode === 'edit' ? 'Student updated successfully.' : 'Student submitted successfully.');

      // Attempt notification
      tryNotifyStudent(saved.email, saved).catch(() => {});

      // call parent
      setTimeout(() => {
        try { onSaved && onSaved(saved); } catch (err) { console.warn('onSaved failed', err); }
        // If mode === 'create' we keep the modal open; parent controls closing. For edit it's reasonable to close by default
        if (mode === 'edit') {
          try { onClose && onClose(); } catch (err) { console.warn('onClose failed', err); }
        }
      }, 500);

    } catch (err) {
      console.error('Save error', err);
      setError(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / steps.length) * 100;

  // ---------- Step fragments (same as before) ----------
  const StepPersonal = (
    <div className={s.grid}>
      <Input label="Name" required name="name" value={data.name} onChange={handleChange} />
      <Input label="Email" required type="email" name="email" value={data.email} onChange={handleChange} />
      <Input label="Roll Number" required name="rollNo" value={data.rollNo} onChange={handleChange} />
      <Input label="Contact Number" name="contactNumber" value={data.contactNumber} onChange={handleChange} />
    </div>
  );

  const StepAddress = (
    <>
      <SectionTitle title="Residential Address" />
      <div className={s.grid}>
        <Input name="residentialAddress.line1" label="Address line 1" value={data.residentialAddress.line1} onChange={handleChange} />
        <Input name="residentialAddress.line2" label="Address line 2" value={data.residentialAddress.line2} onChange={handleChange} />
        <Input name="residentialAddress.district" label="District" value={data.residentialAddress.district} onChange={handleChange} />
        <Input name="residentialAddress.state" label="State" value={data.residentialAddress.state} onChange={handleChange} />
        <Input name="residentialAddress.pincode" label="Pincode" value={data.residentialAddress.pincode} onChange={handleChange} pattern="\d{6}" hint="6 digit pincode" />
        <Input name="residentialAddress.country" label="Country" value={data.residentialAddress.country} onChange={handleChange} />
      </div>

      <div className={s.inline}>
        <input id="sameAddress" type="checkbox" checked={sameAddress} onChange={toggleSameAddress} />
        <label htmlFor="sameAddress">Permanent address same as residential</label>
      </div>

      <SectionTitle title="Permanent Address" />
      <div className={s.grid}>
        <Input name="permanentAddress.line1" label="Address line 1" value={data.permanentAddress.line1} onChange={handleChange} disabled={sameAddress} />
        <Input name="permanentAddress.line2" label="Address line 2" value={data.permanentAddress.line2} onChange={handleChange} disabled={sameAddress} />
        <Input name="permanentAddress.district" label="District" value={data.permanentAddress.district} onChange={handleChange} disabled={sameAddress} />
        <Input name="permanentAddress.state" label="State" value={data.permanentAddress.state} onChange={handleChange} disabled={sameAddress} />
        <Input name="permanentAddress.pincode" label="Pincode" value={data.permanentAddress.pincode} onChange={handleChange} pattern="\d{6}" hint="6 digit pincode" disabled={sameAddress} />
        <Input name="permanentAddress.country" label="Country" value={data.permanentAddress.country} onChange={handleChange} disabled={sameAddress} />
      </div>
    </>
  );

  const StepGuardian = (
    <>
      <SectionTitle title="Guardian's Details" />
      <div className={s.grid}>
        <Input label="Guardian Name" name="guardianName" value={data.guardianName} onChange={handleChange} />
        <Input label="Relationship" name="guardianRelation" value={data.guardianRelation} onChange={handleChange} />
        <Input label="Contact Number" name="guardianContact" value={data.guardianContact} onChange={handleChange} />
        <Input label="Guardian Email" name="guardianEmail" type="email" value={data.guardianEmail} onChange={handleChange} />
      </div>
    </>
  );

  const StepDocuments = (
    <>
      <SectionTitle title="Allocation" />
      <div className={s.grid}>
        <Input label="Department" name="department" value={data.department} onChange={handleChange} />
        <Input label="Hostel" name="hostel" value={data.hostel} onChange={handleChange} />
        <Input label="Room Number" name="roomNumber" value={data.roomNumber} onChange={handleChange} />
      </div>

      <SectionTitle title="Documents" />
      <div className={s.files}>
        <FileInput label="Aadhaar Front" name="aadharFront" file={files.aadharFront} onChange={handleFile} />
        <FileInput label="Aadhaar Back" name="aadharBack" file={files.aadharBack} onChange={handleFile} />
        <FileInput label="Photo" name="photo" file={files.photo} onChange={handleFile} />
        <FileInput label="Additional Docs" name="additional" file={files.additional} onChange={handleFile} />
      </div>
    </>
  );

  const StepMeals = (
    <>
      <SectionTitle title="Meals & Stay" />
      <div className={s.grid}>
        <Select
          label="Meals Opt-In"
          name="mealsOptIn"
          value={data.mealsOptIn}
          onChange={handleChange}
          options={[{value:'yes', label:'Yes'}, {value:'no', label:'No'}]}
        />
        <Input
          label="Expected Stay Duration (months)"
          name="stayDuration"
          value={data.stayDuration}
          onChange={handleChange}
          placeholder="e.g., 24"
        />
      </div>
    </>
  );

  const stepContent = [StepPersonal, StepAddress, StepGuardian, StepDocuments, StepMeals][step];

  return (
    <div className={s.overlay} role="dialog" aria-modal="true">
      <div className={s.modal}>
        {/* Success banner */}
        {successMessage && justSavedStudent && (
          <div style={{
            background: mode === 'edit' ? '#fff8f8' : '#e6f9ed',
            border: mode === 'edit' ? '1px solid rgba(211,47,47,0.12)' : '1px solid #c7efd1',
            color: mode === 'edit' ? '#3b1d1d' : '#064e2a',
            padding: '12px 14px',
            borderRadius: 8,
            margin: '12px',
            textAlign: 'left',
            fontWeight: 600,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, color: mode === 'edit' ? '#b71c1c' : '#064e2a' }}>{successMessage}</div>
                <div style={{ fontWeight: 500, marginTop: 6, fontSize: 13, color: '#222' }}>
                  Student: {justSavedStudent.name || '—'} — {justSavedStudent.email || '—'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a
                  href={`/staff/students/${justSavedStudent._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.btnOutline}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  View (Staff)
                </a>

                <a
                  href={`/student/profile/${justSavedStudent._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.btnPrimary}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Student Link
                </a>

                <button
                  aria-label="Dismiss success"
                  onClick={() => setSuccessMessage('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: 6,
                    color: mode === 'edit' ? '#b71c1c' : '#064e2a'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={s.header}>
          <div>
            <h2 className={s.title}>{mode === 'edit' ? 'Edit Student' : 'Add Student'}</h2>
            <div className={s.subtitle}>Step {step + 1} of {steps.length} — {steps[step].title}</div>
          </div>
          <button className={s.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Stepper */}
        <div className={s.stepper}>
          {steps.map((st, i) => (
            <div key={st.key} className={`${s.step} ${i <= step ? s.stepActive : ''}`}>
              <span className={s.stepDot}>{i+1}</span>
              <span className={s.stepLabel}>{st.title}</span>
            </div>
          ))}
        </div>
        <div className={s.progress}>
          <div className={s.progressBar} style={{ width: `${progress}%` }} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={s.body}>
          {stepContent}
          {error && <div className={s.error}>{error}</div>}

          {/* Footer */}
          <div className={s.footer}>
            <div>
              {step > 0 && (
                <button type="button" className={s.btnGhost} onClick={back}>Back</button>
              )}
            </div>
            <div className={s.actions}>
              {step < steps.length - 1 && (
                <button type="button" className={s.btnPrimary} onClick={next}>Proceed</button>
              )}
              {step === steps.length - 1 && (
                <button type="submit" className={s.btnPrimary} disabled={loading}>
                  {loading ? 'Saving…' : (mode === 'edit' ? 'Save Changes' : 'Save & Finish')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Small presentational helpers (scoped) ---------- */
function SectionTitle({ title }) {
  return <h3 className={s.section}>{title}</h3>;
}

function Input({ label, hint, required, ...rest }) {
  const id = rest.name;
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}{required && <span className={s.req}>*</span>}
      </label>
      <input id={id} className={s.input} required={required} {...rest} />
      {hint && <div className={s.hint}>{hint}</div>}
    </div>
  );
}

function Select({ label, options, ...rest }) {
  const id = rest.name;
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}</label>
      <select id={id} className={s.input} {...rest}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function FileInput({ label, name, file, onChange }) {
  return (
    <div className={s.fileWrap}>
      <label className={s.fileLabel}>{label}</label>
      <input className={s.fileInput} type="file" name={name} onChange={onChange} />
      {file && (
        <div className={s.fileChip} title={file.name}>
          <span className={s.fileName}>{file.name}</span>
          <span className={s.fileSize}>
            {(file.size / 1024).toFixed(0)} KB
          </span>
        </div>
      )}
    </div>
  );
}
