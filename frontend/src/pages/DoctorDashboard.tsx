import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI } from '../utils/api';
import { PatientCard } from '../components/PatientCard';
import type { Patient } from '../types';

export const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await doctorAPI.getPatients();
      setPatients(data.patients);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Bác Sĩ</h1>
            <p className="text-xl mt-1">Xin chào, {user?.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
          >
            Đăng Xuất
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Tổng bệnh nhân</p>
            <p className="text-5xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Tập hôm nay</p>
            <p className="text-5xl font-bold text-green-600">
              {patients.filter((p) => {
                if (!p.last_session) return false;
                const sessionDate = new Date(p.last_session.date);
                const today = new Date();
                return sessionDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-2">Độ chính xác TB</p>
            <p className="text-5xl font-bold text-purple-600">
              {patients.filter((p) => p.last_session).length > 0
                ? (
                    patients
                      .filter((p) => p.last_session)
                      .reduce((sum, p) => sum + (p.last_session?.accuracy || 0), 0) /
                    patients.filter((p) => p.last_session).length
                  ).toFixed(1)
                : '0'}
              %
            </p>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh Sách Bệnh Nhân</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Đang tải...</p>
            </div>
          ) : patients.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">Chưa có bệnh nhân nào</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
