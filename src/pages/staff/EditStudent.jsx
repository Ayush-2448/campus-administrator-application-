// src/pages/staff/EditStudent.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import AddStudentWizard from '../../components/AddStudentWizard';

export default function EditStudentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(location.state?.student || null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // If we already have initialData from nav state, use it.
    if (initialData) return;

    // otherwise fetch student by id
    let mounted = true;
    async function fetchStudent() {
      setLoading(true);
      try {
        const res = await api.get(`/api/students/${id}`);
        if (!mounted) return;
        setInitialData(res.data);
      } catch (err) {
        console.error('Failed to load student for editing', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
    return () => { mounted = false; };
  }, [id, initialData]);

  function handleSaved(updated) {
    // after save, go back to students list and optionally show a toast
    try {
      navigate('/staff/students', { replace: true });
    } catch (err) {
      console.warn(err);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading student…</div>;
  if (notFound) return <div style={{ padding: 20 }}>Student not found.</div>;
  if (!initialData) return <div style={{ padding: 20 }}>Preparing editor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit student</h2>
      <p>Edit the student's details below. After saving you'll return to the students list.</p>

      <AddStudentWizard
        mode="edit"
        initialData={initialData}
        onSaved={handleSaved}
        onClose={() => navigate('/staff/students')}
      />
    </div>
  );
}
