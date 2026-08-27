import { useTitle } from "../../hooks/useTitle";
import { useState, useMemo } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ForumIcon from '@mui/icons-material/Forum';
import StarIcon from '@mui/icons-material/Star';
import { PreviewModal } from '../../components';


interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'storage' | 'account' | 'meeting' | 'general';
}

export default function Help() {
    useTitle("Trợ giúp & Hướng dẫn");

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMsg, setContactMsg] = useState('');
    const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; name: string; blobType: string } | null>(null);

    const handleOpenGuide = (e: React.MouseEvent, title: string) => {
        e.preventDefault();
        const content = `HƯỚNG DẪN SỬ DỤNG: ${title.toUpperCase()}\n\n1. Giới thiệu chung\nChào mừng bạn đến với tài liệu hướng dẫn sử dụng của hệ thống KL2StU.\n\n2. Các tính năng chính\n- Tải lên, tải xuống, quản lý tệp tin trực tuyến.\n- Tìm kiếm và xem trước (Preview) tất cả các định dạng PDF, Word, Excel, Hình ảnh...\n\n3. Hỗ trợ kỹ thuật\nVui lòng liên hệ support@company.vn hoặc Hotline 1900 1234 khi cần giải đáp.`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setPreviewDoc({ url, type: 'note', name: `${title}.txt`, blobType: 'text/plain' });
    };

    const faqs: FAQItem[] = [
        {
            id: '1',
            question: 'Làm thế nào để tải lên một tài liệu mới?',
            answer: 'Bạn có thể tải lên tài liệu bằng cách bấm vào nút "Tải lên tài liệu" (hoặc biểu tượng dấu cộng) ở trang chủ hoặc trang chi tiết của định dạng đó. Hệ thống chấp nhận các định dạng phổ biến như PDF, Word, Excel, Media, ZIP.',
            category: 'storage'
        },
        {
            id: '2',
            question: 'Giới hạn dung lượng lưu trữ cho mỗi tài khoản là bao nhiêu?',
            answer: 'Hiện tại, mỗi tài khoản được cung cấp tối đa 250 MB bộ nhớ lưu trữ trên hệ thống. Bạn có thể theo dõi thanh dung lượng đã dùng ở trang chủ hoặc phần Cài đặt lưu trữ.',
            category: 'storage'
        },
        {
            id: '3',
            question: 'Làm cách nào để thêm một thành viên mới vào nhóm làm việc?',
            answer: 'Chỉ Quản trị viên (Admin) hoặc Quản lý (Manager) của nhóm mới có quyền thêm thành viên. Bạn vào trang "Quản lý tài khoản" hoặc tab "Nhóm làm việc", chọn nhóm tương ứng và chọn chức năng thêm thành viên.',
            category: 'account'
        },
        {
            id: '4',
            question: 'Tôi có thể đổi múi giờ hoặc ngôn ngữ hiển thị ở đâu?',
            answer: 'Hãy đi tới trang "Cài đặt" từ menu bên trái, sau đó chọn tab "Khu vực" để thay đổi ngôn ngữ hiển thị (Tiếng Việt/English) và múi giờ tương ứng.',
            category: 'general'
        },
        {
            id: '5',
            question: 'Lên lịch cuộc họp mới như thế nào?',
            answer: 'Vào trang "Cuộc họp" -> Bấm nút "Tạo cuộc họp" -> Nhập các thông tin như tiêu đề, mô tả, ngày giờ cuộc họp rồi chọn lưu lại. Hệ thống sẽ tự động hiển thị trong danh sách cuộc họp sắp diễn ra.',
            category: 'meeting'
        },
        {
            id: '6',
            question: 'Làm thế nào để ghim một ghi chú quan trọng?',
            answer: 'Tại trang "Ghi chú", hãy di chuột qua thẻ ghi chú bạn muốn lưu ý và bấm vào biểu tượng chiếc ghim (PushPin). Ghi chú được ghim sẽ luôn hiển thị ở đầu danh sách để dễ theo dõi.',
            category: 'storage'
        }
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const handleSendContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;
        alert(`Cảm ơn ${contactName}. Ý kiến của bạn đã được gửi tới đội ngũ hỗ trợ!`);
        setContactName(''); setContactEmail(''); setContactMsg('');
    };

    const categories = [
        { id: 'all', label: 'Tất cả chủ đề' },
        { id: 'storage', label: 'Lưu trữ & Tệp tin' },
        { id: 'account', label: 'Tài khoản & Nhóm' },
        { id: 'meeting', label: 'Cuộc họp & Lịch' },
        { id: 'general', label: 'Chung' },
    ];

    return (
        <div className="hlp-container">
            

            <div className="hlp-header">
                <h1><HelpIcon /> Trung tâm Trợ giúp</h1>
                <p>Tìm kiếm các giải pháp, xem hướng dẫn chi tiết hoặc gửi liên hệ hỗ trợ trực tiếp tới chúng tôi</p>
                <div className="hlp-search-box">
                    <span className="hlp-search-icon"><SearchIcon /></span>
                    <input type="text" className="hlp-search-input" placeholder="Nhập câu hỏi, từ khóa cần trợ giúp..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            <div className="hlp-main">
                <div className="hlp-content-section">
                    <div className="hlp-cat-tabs">
                        {categories.map(cat => (
                            <button key={cat.id} className={`hlp-cat-btn ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="hlp-faq-list">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map(faq => (
                                <div key={faq.id} className={`hlp-faq-item ${expandedFAQ === faq.id ? 'expanded' : ''}`}>
                                    <button className="hlp-faq-question" onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                                        <span>{faq.question}</span>
                                        <ExpandMoreIcon />
                                    </button>
                                    {expandedFAQ === faq.id && (
                                        <div className="hlp-faq-answer">{faq.answer}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="hlp-empty">Không tìm thấy câu hỏi phù hợp</div>
                        )}
                    </div>
                </div>

                <div className="hlp-sidebar">
                    <div className="hlp-card">
                        <h3 className="hlp-card-title"><DescriptionIcon /> Tài liệu hướng dẫn</h3>
                        <a href="#" className="hlp-doc-link" onClick={(e) => handleOpenGuide(e, "Hướng dẫn bắt đầu nhanh")}><StarIcon fontSize="small" /> Hướng dẫn bắt đầu nhanh</a>
                        <a href="#" className="hlp-doc-link" onClick={(e) => handleOpenGuide(e, "Quản lý file nâng cao")}><StarIcon fontSize="small" /> Quản lý file nâng cao</a>
                        <a href="#" className="hlp-doc-link" onClick={(e) => handleOpenGuide(e, "Lịch họp & Tích hợp")}><StarIcon fontSize="small" /> Lịch họp & Tích hợp</a>
                        <a href="#" className="hlp-doc-link" onClick={(e) => handleOpenGuide(e, "Các phím tắt trong hệ thống")}><StarIcon fontSize="small" /> Các phím tắt trong hệ thống</a>
                    </div>

                    <div className="hlp-card">
                        <h3 className="hlp-card-title"><ForumIcon /> Gửi phản hồi / Liên hệ</h3>
                        <form onSubmit={handleSendContact}>
                            <input className="hlp-contact-input" placeholder="Họ và tên..." value={contactName} onChange={e => setContactName(e.target.value)} required />
                            <input className="hlp-contact-input" type="email" placeholder="Email..." value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                            <textarea className="hlp-contact-textarea" placeholder="Nhập nội dung cần hỗ trợ..." value={contactMsg} onChange={e => setContactMsg(e.target.value)} required />
                            <button type="submit" className="hlp-contact-btn">Gửi liên hệ</button>
                        </form>
                    </div>

                    <div className="hlp-card">
                        <h3 className="hlp-card-title"><PhoneIcon /> Liên hệ khẩn cấp</h3>
                        <div className="hlp-doc-link"><PhoneIcon fontSize="small" /> Hotline: 1900 1234</div>
                        <div className="hlp-doc-link"><EmailIcon fontSize="small" /> support@company.vn</div>
                    </div>
                </div>
            </div>

            <PreviewModal 
                isOpen={!!previewDoc} 
                onClose={() => {
                    if (previewDoc) URL.revokeObjectURL(previewDoc.url);
                    setPreviewDoc(null);
                }} 
                previewDoc={previewDoc} 
            />
        </div>
    );
}