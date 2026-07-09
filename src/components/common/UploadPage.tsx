import { storageConfig, type StorageType } from "../storage-config";


interface Props {
    type: StorageType;
}

export default function UploadPage({ type }: Props) {
    const config = storageConfig[type];

    return (
        <div className="upload-page">
            <header className="page-header">
                <h1>{config.title} Upload</h1>
                <p>Upload your {config.title.toLowerCase()} files.</p>
            </header>

            <section className="upload-container">
                {/* Drag & Drop */}
            </section>
        </div>
    );
}