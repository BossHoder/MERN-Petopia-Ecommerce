import React, { useState } from 'react';
import Loader from './Loader';
import './LoaderDemo.css';

/**
 * Demo component to showcase all Loader variants
 * This is for development/testing purposes only
 */
const LoaderDemo = () => {
    const [selectedVariant, setSelectedVariant] = useState('paws');
    const [selectedSize, setSelectedSize] = useState('md');
    const [selectedColor, setSelectedColor] = useState('orange');
    const [showOverlay, setShowOverlay] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    const variants = [
        { value: 'paws', label: '🐾 Paw Prints', description: 'Adorable walking paws animation' },
        { value: 'heart', label: '💖 Beating Heart', description: 'Loving heartbeat animation' },
        { value: 'bone', label: '🦴 Spinning Bone', description: 'Playful bone spinning animation' },
        { value: 'dots', label: '⚫ Bouncing Dots', description: 'Classic bouncing dots' },
        { value: 'minimal', label: '⭕ Ring Spinner', description: 'Clean and elegant rings' },
    ];

    const sizes = [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
    ];

    const colors = [
        { value: 'orange', label: 'Orange (Brand)', description: 'Primary Petopia orange' },
        { value: 'brown', label: 'Brown (Warm)', description: 'Warm brown tones' },
        { value: 'cream', label: 'Cream (Subtle)', description: 'Subtle cream colors' },
    ];

    return (
        <div className="loader-demo">
            <div className="demo-header">
                <h1>🐾 Petopia Loader Showcase</h1>
                <p>Gorgeous, pet-themed loading animations for the Petopia e-commerce platform</p>
            </div>

            <div className="demo-controls">
                <div className="control-group">
                    <label>Animation Variant:</label>
                    <div className="variant-grid">
                        {variants.map((variant) => (
                            <button
                                key={variant.value}
                                className={`variant-btn ${selectedVariant === variant.value ? 'active' : ''}`}
                                onClick={() => setSelectedVariant(variant.value)}
                                title={variant.description}
                            >
                                {variant.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Size:</label>
                    <div className="size-controls">
                        {sizes.map((size) => (
                            <button
                                key={size.value}
                                className={`size-btn ${selectedSize === size.value ? 'active' : ''}`}
                                onClick={() => setSelectedSize(size.value)}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Color Theme:</label>
                    <div className="color-controls">
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                className={`color-btn ${selectedColor === color.value ? 'active' : ''} ${color.value}`}
                                onClick={() => setSelectedColor(color.value)}
                                title={color.description}
                            >
                                {color.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Custom Message:</label>
                    <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter custom loading message..."
                        className="message-input"
                    />
                </div>

                <div className="control-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showOverlay}
                            onChange={(e) => setShowOverlay(e.target.checked)}
                        />
                        Show as full-screen overlay
                    </label>
                </div>
            </div>

            <div className="demo-preview">
                <h3>Preview:</h3>
                <div className="preview-container">
                    <Loader
                        variant={selectedVariant}
                        size={selectedSize}
                        color={selectedColor}
                        message={customMessage || undefined}
                        overlay={showOverlay}
                    />
                </div>
            </div>

            <div className="demo-usage">
                <h3>Usage Example:</h3>
                <pre className="code-example">
{`<Loader 
  variant="${selectedVariant}"
  size="${selectedSize}"
  color="${selectedColor}"${customMessage ? `\n  message="${customMessage}"` : ''}${showOverlay ? '\n  overlay={true}' : ''}
/>`}
                </pre>
            </div>

            <div className="demo-variants-showcase">
                <h3>All Variants at a Glance:</h3>
                <div className="variants-grid">
                    {variants.map((variant) => (
                        <div key={variant.value} className="variant-showcase">
                            <h4>{variant.label}</h4>
                            <p>{variant.description}</p>
                            <div className="variant-preview">
                                <Loader
                                    variant={variant.value}
                                    size="md"
                                    color="orange"
                                    message={`Loading with ${variant.label.split(' ')[1]}...`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoaderDemo;
