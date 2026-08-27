import React, { useEffect, useState, useRef } from 'react';
import { Close } from '@mui/icons-material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { recentService } from '../../service/recentService';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewDoc: { url: string, type: string, name: string, blobType: string } | null;
}

export default function PreviewModal({ isOpen, onClose, previewDoc }: PreviewModalProps) {
    const [officeHtml, setOfficeHtml] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        if (isOpen && previewDoc) {
            const ext = previewDoc.name.split('.').pop()?.toLowerCase();
            let fileType: any = 'other';
            if (ext === 'pdf') fileType = 'pdf';
            else if (['doc', 'docx'].includes(ext || '')) fileType = 'word';
            else if (['xls', 'xlsx', 'csv'].includes(ext || '')) fileType = 'excel';
            else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'mp3'].includes(ext || '')) fileType = 'media';
            else if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) fileType = 'zip';
            else if (previewDoc.type === 'image') fileType = 'media';

            recentService.addRecentItem({
                title: previewDoc.name,
                type: fileType,
                url: previewDoc.url
            });
        }
    }, [isOpen, previewDoc]);

    useEffect(() => {
        if (!isOpen || !previewDoc) {
            setOfficeHtml(null);
            setErrorMsg(null);
            return;
        }

        const loadOfficeDoc = async () => {
            const ext = previewDoc.name.split('.').pop()?.toLowerCase();
            const isExcel = ['xls', 'xlsx'].includes(ext || '');
            const isWord = ['doc', 'docx'].includes(ext || '');

            if (!isExcel && !isWord) {
                setOfficeHtml(null);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(previewDoc.url);
                
                if (previewDoc.blobType === 'text/plain') {
                    const text = await response.text();
                    setOfficeHtml(`<div style="padding: 20px; font-family: monospace; white-space: pre-wrap;"><i>Tệp mô phỏng (Không có kết nối Backend)</i><br/><br/>${text}</div>`);
                    setIsLoading(false);
                    return;
                }

                const arrayBuffer = await response.arrayBuffer();

                if (isExcel) {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    setOfficeHtml(`<div class="excel-preview" style="padding: 16px; width: 100%; overflow: auto; background: white;">${html}</div>`);
                } else if (isWord) {
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setOfficeHtml(`<div class="word-preview" style="padding: 24px; max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.6;">${result.value}</div>`);
                }
            } catch (error) {
                console.error("Error parsing document:", error);
                setErrorMsg("Không thể xem trước tệp tin này do định dạng không hợp lệ hoặc bị hỏng.");
            } finally {
                setIsLoading(false);
            }
        };

        loadOfficeDoc();
    }, [isOpen, previewDoc]);

    if (!isOpen || !previewDoc) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div ref={containerRef} style={{
                width: '100%', maxWidth: '1000px', height: isFullscreen ? '100vh' : '90vh',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: isFullscreen ? '0' : '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: isFullscreen ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-primary)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {previewDoc.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <a 
                            href={previewDoc.url} 
                            download={previewDoc.name}
                            style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                color: '#3b82f6',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Tải xuống
                        </a>
                        <Close 
                            onClick={onClose}
                            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '16px' }}>
                    {previewDoc.type === 'zip' || ['zip', 'rar', '7z', 'tar'].includes(previewDoc.name.split('.').pop()?.toLowerCase() || '') ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Tệp nén không được hỗ trợ xem trước</p>
                            <p style={{ fontSize: '14px' }}>Vui lòng nhấn "Tải xuống" để xem nội dung.</p>
                        </div>
                    ) : isLoading ? (
                        <div style={{ color: 'var(--text-muted)' }}>Đang tải và xử lý tài liệu...</div>
                    ) : errorMsg ? (
                        <div style={{ color: '#ef4444' }}>{errorMsg}</div>
                    ) : officeHtml ? (
                        <div style={{ width: '100%', height: '100%', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: officeHtml }} />
                    ) : previewDoc.type === 'image' || previewDoc.blobType.startsWith('image/') ? (
                        <img src={previewDoc.url} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    ) : previewDoc.blobType.startsWith('video/') ? (
                        <video src={previewDoc.url} controls style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
                    ) : previewDoc.blobType.startsWith('audio/') ? (
                        <audio src={previewDoc.url} controls style={{ width: '100%' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                            <DocViewer 
                                documents={[{ uri: previewDoc.url, fileName: previewDoc.name }]} 
                                pluginRenderers={DocViewerRenderers} 
                                style={{ height: '100%', width: '100%' }} 
                                config={{ header: { disableHeader: true } }}
                            />
                        </div>
                    )}
                </div>

                {/* Floating Toolbar */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '24px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 10
                }}>
                    <button 
                        onClick={toggleFullscreen}
                        title="Phóng to toàn màn hình"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#3b82f6'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </button>
                    <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-color)' }}></div>
                    <button 
                        title="Đánh dấu tài liệu (Đang phát triển)"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#3b82f6'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onClick={() => alert("Tính năng đánh dấu sẽ sớm ra mắt!")}
                    >
                        <BookmarkBorderIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}
