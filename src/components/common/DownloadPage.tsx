import { storageConfig, type StorageType } from "../storage-config";


interface Props {
    type: StorageType;
}

export default function DownloadPage({ type }: Props) {
    const config = storageConfig[type];

    return (
        <div className="download-page">
            <header className="page-header">
                <h1>{config.title} Download</h1>
                <p>Download your {config.title.toLowerCase()} files.</p>
            </header>

            <section className="download-container">
                {/* Danh sách file */}
            </section>
        </div>
    );
}