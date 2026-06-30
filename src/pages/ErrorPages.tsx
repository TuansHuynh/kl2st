import { useNavigate } from 'react-router-dom';
interface ErrorPagesProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

export default function ErrorPages({
  statusCode = 404,
  title = "Oops! Trang không tìm thấy",
  message = "Có vẻ như đường dẫn đã bị hỏng hoặc trang này không còn tồn tại. Vui lòng kiểm tra lại URL hoặc quay về trang chủ."
}: ErrorPagesProps) {

    const navigate = useNavigate()
  
  const handleBackHome = () => {
    navigate("/")
  };

  const handleRefresh = () => {
    // 1. Kiểm tra nếu thiết bị đang offline hoàn toàn thì F5 luôn
  if (!navigator.onLine) {
    window.location.reload();
    return;
  }

  // 2. Nếu có mạng, thử reload mượt mà bằng React Router trước
  navigate(0);

  // 3. (Tùy chọn) Dự phòng nếu sau 2 giây app vẫn "đơ" do lỗi logic ngầm
  const timeout = setTimeout(() => {
    window.location.reload();
  }, 2000);

  return () => clearTimeout(timeout);
  };

  return (
    <div className="error-container">
      <div className="error-content">
        {/* Số lỗi lớn phía nền */}
        <h1 className="error-code">{statusCode}</h1>
        
        {/* Nội dung thông báo */}
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        
        {/* Các nút hành động */}
        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleBackHome}>
            Quay về Trang chủ
          </button>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            Thử tải lại trang
          </button>
        </div>
      </div>
      
      {/* Các phần tử decor dạng hình tròn mờ ảo ở nền */}
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
    </div>
  );
}