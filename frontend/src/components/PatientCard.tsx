import { Link } from 'react-router-dom';
import type { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Link
      to={`/doctor/patient/${patient.id}`}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{patient.full_name}</h3>
          <p className="text-gray-600">
            {patient.age} tuổi • {patient.gender}
          </p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {patient.username}
        </div>
      </div>

      {patient.last_session ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Buổi tập gần nhất:</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{patient.last_session.exercise}</p>
              <p className="text-sm text-gray-600">{formatDate(patient.last_session.date)}</p>
            </div>
            <div
              className={`text-2xl font-bold ${
                patient.last_session.accuracy >= 80
                  ? 'text-green-600'
                  : patient.last_session.accuracy >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {patient.last_session.accuracy.toFixed(1)}%
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600">Chưa có buổi tập nào</p>
        </div>
      )}
    </Link>
  );
};
