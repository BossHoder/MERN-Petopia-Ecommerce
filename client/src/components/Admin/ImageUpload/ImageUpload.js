import React, { useState, useRef } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { toast } from 'react-toastify';
import './styles.css';

const ImageUpload = ({ 
    images = [], 
    onImagesChange, 
    maxImages = 5, 
    label = 'Product Images',
    required = false,
    error = null 
}) => {
    const { t } = useI18n();
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Handle file selection
    const handleFileSelect = (files) => {
        const fileArray = Array.from(files);
        
        // Validate file count
        if (images.length + fileArray.length > maxImages) {
            toast.error(t('admin.products.imageUpload.maxImagesError', `Maximum ${maxImages} images allowed`));
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        fileArray.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(t('admin.products.imageUpload.invalidType', `Invalid file type: ${file.name}`));
                return;
            }
            if (file.size > maxSize) {
                toast.error(t('admin.products.imageUpload.fileTooLarge', `File too large: ${file.name}`));
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        // Create preview URLs and add to images array
        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isNew: true
        }));

        onImagesChange([...images, ...newImages]);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
        }
    };

    // Remove image
    const handleRemoveImage = (index) => {
        const newImages = [...images];
        const removedImage = newImages[index];
        
        // Revoke object URL to prevent memory leaks
        if (removedImage.preview && removedImage.isNew) {
            URL.revokeObjectURL(removedImage.preview);
        }
        
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    // Move image position
    const handleMoveImage = (fromIndex, toIndex) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        onImagesChange(newImages);
    };

    // Get image URL for display
    const getImageUrl = (image) => {
        if (image.isNew && image.preview) {
            return image.preview;
        }
        if (typeof image === 'string') {
            return image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image}`;
        }
        return image.url || image.preview || '';
    };

    return (
        <div className="image-upload-container">
            <label className="image-upload-label">
                {label} {required && <span className="required">*</span>}
            </label>
            
            {/* Upload Area */}
            <div 
                className={`image-upload-dropzone ${dragOver ? 'drag-over' : ''} ${error ? 'error' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleInputChange}
                    className="image-upload-input"
                />
                
                <div className="image-upload-content">
                    <div className="image-upload-icon">📷</div>
                    <p className="image-upload-text">
                        {t('admin.products.imageUpload.dropText', 'Drop images here or click to select')}
                    </p>
                    <p className="image-upload-subtext">
                        {t('admin.products.imageUpload.supportText', `Supports: JPG, PNG, WebP (max ${maxImages} images, 5MB each)`)}
                    </p>
                </div>
            </div>

            {error && <div className="image-upload-error">{error}</div>}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="image-preview-grid">
                    {images.map((image, index) => (
                        <div key={index} className="image-preview-item">
                            <div className="image-preview-wrapper">
                                <img 
                                    src={getImageUrl(image)} 
                                    alt={`Preview ${index + 1}`}
                                    className="image-preview"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                
                                {/* Image Controls */}
                                <div className="image-preview-controls">
                                    <button
                                        type="button"
                                        className="image-control-btn remove"
                                        onClick={() => handleRemoveImage(index)}
                                        title={t('common.remove', 'Remove')}
                                    >
                                        ✕
                                    </button>
                                    
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            className="image-control-btn move-left"
                                            onClick={() => handleMoveImage(index, index - 1)}
                                            title={t('admin.products.imageUpload.moveLeft', 'Move left')}
                                        >
                                            ←
                                        </button>
                                    )}
                                    
                                    {index < images.length - 1 && (
                                        <button
                                            type="button"
                                            className="image-control-btn move-right"
                                            onClick={() => handleMoveImage(index, index + 1)}
                                            title={t('admin.products.imageUpload.moveRight', 'Move right')}
                                        >
                                            →
                                        </button>
                                    )}
                                </div>

                                {/* Primary Image Badge */}
                                {index === 0 && (
                                    <div className="primary-image-badge">
                                        {t('admin.products.imageUpload.primary', 'Primary')}
                                    </div>
                                )}
                            </div>
                            
                            <div className="image-preview-info">
                                <span className="image-index">{index + 1}</span>
                                {image.isNew && (
                                    <span className="image-new-badge">
                                        {t('admin.products.imageUpload.new', 'New')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="image-upload-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">
                        {t('admin.products.imageUpload.uploading', 'Uploading images...')}
                    </span>
                </div>
            )}

            {/* Image Count Info */}
            <div className="image-upload-info">
                <span className="image-count">
                    {images.length} / {maxImages} {t('admin.products.imageUpload.images', 'images')}
                </span>
            </div>
        </div>
    );
};

export default ImageUpload;
