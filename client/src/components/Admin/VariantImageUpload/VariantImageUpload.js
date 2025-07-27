import React, { useState, useRef } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { toast } from 'react-toastify';
import './styles.css';

const VariantImageUpload = ({ 
    images = [], 
    onImagesChange, 
    maxImages = 3, 
    variantName = '',
    error = null 
}) => {
    const { t } = useI18n();
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    // Handle file selection
    const handleFileSelect = (files) => {
        const fileArray = Array.from(files);
        
        // Validate file count
        if (images.length + fileArray.length > maxImages) {
            toast.error(t('admin.products.variants.imageUpload.maxImagesError', `Maximum ${maxImages} images allowed per variant`));
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        fileArray.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(t('admin.products.variants.imageUpload.invalidType', `Invalid file type: ${file.name}`));
                return;
            }
            if (file.size > maxSize) {
                toast.error(t('admin.products.variants.imageUpload.fileTooLarge', `File too large: ${file.name}`));
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
        <div className="variant-image-upload">
            <div className="variant-image-upload-header">
                <label className="variant-image-upload-label">
                    {t('admin.products.variants.images', 'Variant Images')}
                    {variantName && <span className="variant-name-hint">({variantName})</span>}
                </label>
                <span className="image-count-info">
                    {images.length} / {maxImages}
                </span>
            </div>
            
            {error && <div className="variant-image-upload-error">{error}</div>}

            {/* Compact Upload Area */}
            <div 
                className={`variant-image-upload-dropzone ${dragOver ? 'drag-over' : ''} ${error ? 'error' : ''}`}
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
                    className="variant-image-upload-input"
                />
                
                <div className="variant-image-upload-content">
                    <div className="variant-image-upload-icon">📷</div>
                    <p className="variant-image-upload-text">
                        {t('admin.products.variants.imageUpload.dropText', 'Drop variant images or click')}
                    </p>
                    <p className="variant-image-upload-subtext">
                        {t('admin.products.variants.imageUpload.supportText', `Max ${maxImages} images, 5MB each`)}
                    </p>
                </div>
            </div>

            {/* Compact Image Preview Grid */}
            {images.length > 0 && (
                <div className="variant-image-preview-grid">
                    {images.map((image, index) => (
                        <div key={index} className="variant-image-preview-item">
                            <div className="variant-image-preview-wrapper">
                                <img 
                                    src={getImageUrl(image)} 
                                    alt={`Variant ${index + 1}`}
                                    className="variant-image-preview"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                
                                {/* Image Controls */}
                                <div className="variant-image-preview-controls">
                                    <button
                                        type="button"
                                        className="variant-image-control-btn remove"
                                        onClick={() => handleRemoveImage(index)}
                                        title={t('common.remove', 'Remove')}
                                    >
                                        ✕
                                    </button>
                                    
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            className="variant-image-control-btn move-left"
                                            onClick={() => handleMoveImage(index, index - 1)}
                                            title={t('admin.products.variants.imageUpload.moveLeft', 'Move left')}
                                        >
                                            ←
                                        </button>
                                    )}
                                    
                                    {index < images.length - 1 && (
                                        <button
                                            type="button"
                                            className="variant-image-control-btn move-right"
                                            onClick={() => handleMoveImage(index, index + 1)}
                                            title={t('admin.products.variants.imageUpload.moveRight', 'Move right')}
                                        >
                                            →
                                        </button>
                                    )}
                                </div>

                                {/* Primary Image Badge */}
                                {index === 0 && (
                                    <div className="variant-primary-image-badge">
                                        {t('admin.products.variants.imageUpload.primary', 'Primary')}
                                    </div>
                                )}
                            </div>
                            
                            {image.isNew && (
                                <div className="variant-image-new-badge">
                                    {t('admin.products.variants.imageUpload.new', 'New')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VariantImageUpload;
