import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const LoginChoice = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-teal-600 dark:bg-teal-500 text-white p-3 rounded-lg">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-white">Rehab System</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Chọn Loại Tài Khoản</h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Bạn là bệnh nhân hay bác sĩ?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Login */}
          <Link
            to="/login/patient"
            className="group bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <div className="bg-teal-100 dark:bg-teal-900/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50 transition">
                <svg className="w-20 h-20 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Bệnh Nhân</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Đăng nhập để tập luyện phục hồi chức năng với AI
              </p>
              <div className="bg-teal-600 group-hover:bg-teal-700 dark:bg-teal-500 dark:group-hover:bg-teal-600 text-white px-8 py-4 rounded-lg font-bold text-xl inline-block transition">
                Đăng Nhập →
              </div>
            </div>
          </Link>

          {/* Doctor Login */}
          <Link
            to="/login/doctor"
            className="group bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition">
                <svg className="w-20 h-20 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Bác Sĩ</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Quản lý và theo dõi tiến độ của bệnh nhân
              </p>
              <div className="bg-green-600 group-hover:bg-green-700 dark:bg-green-500 dark:group-hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-xl inline-block transition">
                Đăng Nhập →
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-xl text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};
