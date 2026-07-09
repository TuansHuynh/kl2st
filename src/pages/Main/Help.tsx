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
            <style>{`
                .hlp-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .hlp-header { text-align: center; max-width: 600px; margin: 0 auto 36px auto; }
                .hlp-header h1 { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 8px 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .hlp-header h1 svg { color: #f59e0b; font-size: 32px; }
                .hlp-header p { font-size: 15px; color: #6b7280; margin: 0 0 24px 0; }

                .hlp-search-box {
                    position: relative; display: flex; align-items: center; max-width: 500px; margin: 0 auto;
                }
                .hlp-search-input {
                    width: 100%; padding: 12px 16px 12px 46px; border: 1px solid #d1d5db; border-radius: 9999px;
                    font-size: 15px; outline: none; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                }
                .hlp-search-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
                .hlp-search-icon { position: absolute; left: 16px; color: #9ca3af; font-size: 22px; display: flex; }

                .hlp-main { display: grid; grid-template-columns: 1fr 320px; gap: 24px; max-width: 1200px; margin: 0 auto; }

                .hlp-content-section { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

                .hlp-cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
                .hlp-cat-btn {
                    padding: 8px 16px; border-radius: 20px; border: 1px solid #e5e7eb; background: white;
                    font-size: 13px; font-weight: 600; color: #4b5563; cursor: pointer; transition: all 0.15s;
                }
                .hlp-cat-btn:hover { background: #f9fafb; color: #111827; }
                .hlp-cat-btn.active { background: #fffbeb; border-color: #f59e0b; color: #b45309; }

                .hlp-faq-list { display: flex; flex-direction: column; gap: 12px; }
                .hlp-faq-item { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; transition: border-color 0.15s; }
                .hlp-faq-item:hover { border-color: #cbd5e1; }
                .hlp-faq-item.expanded { border-color: #f59e0b; }

                .hlp-faq-question {
                    width: 100%; display: flex; justify-content: space-between; align-items: center;
                    padding: 16px 20px; border: none; background: white; cursor: pointer;
                    font-size: 14px; font-weight: 700; color: #111827; text-align: left;
                }
                .hlp-faq-question svg { color: #9ca3af; transition: transform 0.2s; }
                .hlp-faq-item.expanded svg { transform: rotate(180deg); color: #f59e0b; }

                .hlp-faq-answer { padding: 0 20px 16px 20px; font-size: 13px; color: #4b5563; line-height: 1.6; background: white; }

                .hlp-sidebar { display: flex; flex-direction: column; gap: 20px; }

                .hlp-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .hlp-card-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px; }

                .hlp-doc-link { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; color: #4b5563; font-size: 13px; text-decoration: none; transition: background 0.15s; }
                .hlp-doc-link:hover { background: #f9fafb; color: #111827; }
                .hlp-doc-link svg { color: #9ca3af; }

                .hlp-contact-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; margin-bottom: 10px; box-sizing: border-box; }
                .hlp-contact-input:focus { border-color: #f59e0b; }
                .hlp-contact-textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; margin-bottom: 12px; min-height: 80px; box-sizing: border-box; resize: vertical; font-family: inherit; }
                .hlp-contact-textarea:focus { border-color: #f59e0b; }
                .hlp-contact-btn { width: 100%; padding: 8px 12px; border: none; border-radius: 6px; background: #f59e0b; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s; }
                .hlp-contact-btn:hover { background: #d97706; }

                .hlp-empty { padding: 32px; text-align: center; color: #9ca3af; font-size: 14px; }

                @media (max-width: 1024px) {
                    .hlp-main { grid-template-columns: 1fr; }
                }
            `}</style>

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
                        <a href="#" className="hlp-doc-link"><StarIcon fontSize="small" /> Hướng dẫn bắt đầu nhanh</a>
                        <a href="#" className="hlp-doc-link"><StarIcon fontSize="small" /> Quản lý file nâng cao</a>
                        <a href="#" className="hlp-doc-link"><StarIcon fontSize="small" /> Lịch họp & Tích hợp</a>
                        <a href="#" className="hlp-doc-link"><StarIcon fontSize="small" /> Các phím tắt trong hệ thống</a>
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
        </div>
    );
}