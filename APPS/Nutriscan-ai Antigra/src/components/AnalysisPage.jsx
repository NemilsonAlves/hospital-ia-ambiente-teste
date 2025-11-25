import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { analyzeImageWithGemini } from '../services/aiService';
import './AnalysisPage.css';

function AnalysisPage({ onBack }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const takePicture = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                setImagePreview(image.dataUrl);
                // Convert DataURL to Blob for potential API upload later
                const response = await fetch(image.dataUrl);
                const blob = await response.blob();
                setSelectedImage(blob);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await analyzeImageWithGemini(selectedImage);

            if (result.error) {
                alert(result.error);
            } else {
                setAnalysisResult(result);
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "Ocorreu um erro ao analisar a imagem. Tente novamente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setAnalysisResult(null);
        setIsAnalyzing(false);
    };

    return (
        <div className="analysis-page">
            <div className="container">
                <div className="analysis-header">
                    <button onClick={onBack} className="btn-back">
                        ← Voltar para Home
                    </button>
                    <h1 className="analysis-title">
                        <span className="gradient-text">Análise Nutricional</span> Instantânea
                    </h1>
                    <p className="analysis-subtitle">
                        Tire uma foto da sua refeição e descubra todos os nutrientes em segundos
                    </p>
                </div>

                {!imagePreview ? (
                    <div
                        className="upload-zone"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="upload-icon">📸</div>
                        <h3>Arraste uma imagem ou clique para selecionar</h3>

                        <div className="upload-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                            <button onClick={takePicture} className="btn btn-primary">
                                📷 Tirar Foto
                            </button>
                            <label htmlFor="file-upload" className="btn btn-secondary">
                                📁 Galeria
                            </label>
                        </div>

                        <p>Suporta: JPG, PNG, WEBP (máx. 10MB)</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                            id="file-upload"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="analysis-container">
                        <div className="image-preview-section">
                            <img src={imagePreview} alt="Preview" className="preview-image" />
                            <button onClick={resetAnalysis} className="btn btn-secondary btn-reset">
                                🔄 Nova Análise
                            </button>
                        </div>

                        {!analysisResult && !isAnalyzing && (
                            <div className="action-section">
                                <button onClick={analyzeImage} className="btn btn-primary btn-large">
                                    🤖 Analisar com IA
                                </button>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="analyzing-state">
                                <div className="loader"></div>
                                <p>Analisando sua refeição...</p>
                                <p className="analyzing-detail">Identificando alimentos e calculando nutrientes</p>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="results-section">
                                <div className="result-header">
                                    <h2>{analysisResult.foodName}</h2>
                                    <div className="health-score">
                                        <div className="score-circle">
                                            <span className="score-value">{analysisResult.healthScore}</span>
                                            <span className="score-label">/100</span>
                                        </div>
                                        <span>Score de Saúde</span>
                                    </div>
                                </div>

                                <div className="tags-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                    {analysisResult.tags && analysisResult.tags.map((tag, index) => (
                                        <span key={index} className="badge" style={{
                                            background: 'var(--color-surface)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="nutrition-grid">
                                    <div className="nutrition-card calories-card">
                                        <div className="card-icon">🔥</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.calories}</h3>
                                            <p>Calorias</p>
                                        </div>
                                    </div>

                                    <div className="nutrition-card">
                                        <div className="card-icon">💪</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.macros.proteins}g</h3>
                                            <p>Proteínas</p>
                                        </div>
                                    </div>

                                    <div className="nutrition-card">
                                        <div className="card-icon">🌾</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.macros.carbs}g</h3>
                                            <p>Carboidratos</p>
                                        </div>
                                    </div>

                                    <div className="nutrition-card">
                                        <div className="card-icon">🥑</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.macros.fats}g</h3>
                                            <p>Gorduras</p>
                                        </div>
                                    </div>

                                    <div className="nutrition-card">
                                        <div className="card-icon">🥬</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.macros.fiber || 0}g</h3>
                                            <p>Fibras</p>
                                        </div>
                                    </div>

                                    <div className="nutrition-card">
                                        <div className="card-icon">🍬</div>
                                        <div className="card-content">
                                            <h3>{analysisResult.macros.sugar || 0}g</h3>
                                            <p>Açúcar</p>
                                        </div>
                                    </div>
                                </div>

                                {analysisResult.glycemicIndex && (
                                    <div className="glycemic-section" style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginTop: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Índice Glicêmico</h4>
                                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {analysisResult.glycemicIndex.level} ({analysisResult.glycemicIndex.value})
                                            </p>
                                        </div>
                                        <div style={{ fontSize: '2rem' }}>
                                            {analysisResult.glycemicIndex.level === 'Baixo' ? '🟢' :
                                                analysisResult.glycemicIndex.level === 'Médio' ? '🟡' : '🔴'}
                                        </div>
                                    </div>
                                )}

                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h3>📋 Ingredientes Detectados</h3>
                                        <ul className="ingredients-list">
                                            {analysisResult.ingredients.map((ingredient, index) => (
                                                <li key={index}>
                                                    <span className="ingredient-name">{ingredient.name}</span>
                                                    <span className="ingredient-amount">{ingredient.amount}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="detail-section">
                                        <h3>💊 Micronutrientes</h3>
                                        <div className="micronutrients">
                                            {Object.entries(analysisResult.micronutrients).map(([key, value]) => (
                                                <div key={key} className="nutrient-bar">
                                                    <div className="nutrient-label">
                                                        {key === 'vitaminA' && 'Vitamina A'}
                                                        {key === 'vitaminC' && 'Vitamina C'}
                                                        {key === 'iron' && 'Ferro'}
                                                        {key === 'calcium' && 'Cálcio'}
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: `${value}%` }}></div>
                                                    </div>
                                                    <span className="nutrient-value">{value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="recommendations-section">
                                    <h3>✨ Recomendações</h3>
                                    <ul className="recommendations-list">
                                        {analysisResult.recommendations.map((rec, index) => (
                                            <li key={index}>✓ {rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalysisPage;
