"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Upload, Info, Play, Pause, Download } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { TransitionEffectsSelector } from './components/TransitionEffectsSelector'
import { findEffectByName } from './constants/transitionEffects'

// @ts-ignore
import UPNG from 'upng-js'




const DoorOpenPreview: React.FC<{ src: string; progress: number }> = ({ src, progress }) => {
    const doorProgress = Math.min(progress * 2, 1)
    return (
        <div className="relative w-full h-full overflow-hidden">
            <div
                className="absolute top-0 left-0 w-1/2 h-full bg-cover transition-transform duration-300 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'left',
                    transform: `translateX(${-doorProgress * 100}%)`,
                }}
            />
            <div
                className="absolute top-0 right-0 w-1/2 h-full bg-cover transition-transform duration-300 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'right',
                    transform: `translateX(${doorProgress * 100}%)`,
                }}
            />
        </div>
    )
}

export default function APNGGenerator() {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [fps, setFps] = useState(20)
    const [transition, setTransition] = useState('fadeIn')
    const [effectDirection, setEffectDirection] = useState<string>('right')
    const [isLooping, setIsLooping] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [previewProgress, setPreviewProgress] = useState(0)
    const animationRef = useRef<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null)
    const [adjustToOneMB, setAdjustToOneMB] = useState(false)
    const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'completed'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const [optimizedSize, setOptimizedSize] = useState<{ width: number; height: number } | null>(null)

    const getFrameCount = () => Math.floor(fps)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        try {
            let file: File | null = null;
            if (event.type === "drop") {
                const droppedFile = (event as React.DragEvent<HTMLDivElement>).dataTransfer.files[0];
                if (droppedFile && droppedFile.type.startsWith('image/')) {
                    file = droppedFile;
                }
            } else {
                file = (event.target as HTMLInputElement).files?.[0] || null;
            }

            if (file) {
                console.log('File selected:', file.name, file.type, file.size)
                const reader = new FileReader()
                reader.onload = (e) => {
                    const img = new Image()
                    img.onload = () => {
                        setSourceImage(img)
                        setImageSize({ width: img.width, height: img.height })
                        setError(null)
                        estimateAPNGSize(img.width, img.height)
                    }
                    img.onerror = (imgError) => {
                        console.error('Image loading failed:', imgError)
                        setError('画像の読み込みに失敗しました。別の画像を試してください。')
                    }
                    img.src = e.target?.result as string
                }
                reader.onerror = (readerError) => {
                    console.error('File reading failed:', readerError)
                    setError(`ファイルの読み込みに失敗しました。別のファイルを試してください。エラー: ${readerError}`)
                }
                reader.readAsDataURL(file)
            } else {
                setError('ファイルが選択されていません。')
            }
        } catch (error) {
            console.error('File upload error:', error)
            setError(`ファイルアップロード中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const estimateAPNGSize = (width: number, height: number) => {
        try {
            const frameCount = getFrameCount()
            const estimatedBytes = width * height * 4 * frameCount // Assuming 4 bytes per pixel (RGBA)
            setEstimatedSize(estimatedBytes / (1024 * 1024)) // Convert to MB
        } catch (error) {
            console.error('Error estimating APNG size:', error)
            setError(`APNG サイズの推定中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const stopPreview = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }
        setIsPlaying(false)
        setPreviewProgress(0)
    }

    const startPreview = () => {
        if (!sourceImage) {
            setError('画像が選択されていません。画像を選択してからプレビューを開始してください。')
            return
        }

        try {
            setIsPlaying(true)
            setError(null)
            let startTime: number | null = null
            const duration = 1000 // 1秒

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp
                const elapsedTime = timestamp - startTime
                const progress = elapsedTime / duration

                if (isLooping) {
                    setPreviewProgress(progress % 1)
                    animationRef.current = requestAnimationFrame(animate)
                } else {
                    if (progress < 1) {
                        setPreviewProgress(progress)
                        animationRef.current = requestAnimationFrame(animate)
                    } else {
                        setPreviewProgress(1)
                        setIsPlaying(false)
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate)
        } catch (error) {
            console.error('プレビュー開始中にエラーが発生しました:', error)
            setError(`プレビュー開始中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
            setIsPlaying(false)
        }
    }

    const handlePreview = () => {
        if (isPlaying) {
            stopPreview()
        } else {
            startPreview()
        }
    }

    const handleTransitionChange = (newTransition: string) => {
        setTransition(newTransition)

        // 効果に応じてデフォルト方向を設定
        const effect = findEffectByName(newTransition)
        if (effect?.hasDirection && effect.directions) {
            // 4方向効果の場合はrightをデフォルトに
            if (effect.directions.includes('right')) {
                setEffectDirection('right')
            }
            // 縦横効果の場合はhorizontalをデフォルトに
            else if (effect.directions.includes('horizontal')) {
                setEffectDirection('horizontal')
            }
        }

        if (isPlaying) {
            stopPreview()
        }
        startPreview()
        if (imageSize) {
            estimateAPNGSize(imageSize.width, imageSize.height)
        }
    }

    const findOptimalScaleFactor = (
        originalWidth: number,
        originalHeight: number,
        frameCount: number,
        targetSizeInBytes: number
    ): number => {
        let low = 0
        let high = 1
        const tolerance = 0.01 // 1%の許容誤差

        while (high - low > tolerance) {
            const mid = (low + high) / 2
            const scaledWidth = Math.floor(originalWidth * mid)
            const scaledHeight = Math.floor(originalHeight * mid)
            const estimatedSize = (scaledWidth * scaledHeight * 4 * frameCount) / (1024 * 1024) // サイズをMBで推定

            if (estimatedSize < targetSizeInBytes) {
                low = mid
            } else {
                high = mid
            }
        }

        return low // 最適なスケールファクター
    }

    const generateAPNG = async () => {
        if (!sourceImage || !canvasRef.current) {
            setError('画像が選択されていません。画像を選択してからAPNGを生成してください。')
            return
        }

        setGenerationState('generating')
        setGenerationProgress(0)
        setError(null)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            setError('キャンバスのコンテキストを取得できませんでした。ブラウザをリロードして再試行してください。')
            setGenerationState('idle')
            return
        }

        try {
            let frameCount = getFrameCount()
            let frames: ArrayBuffer[] = []
            let delays: number[] = []

            let scaleFactor = 1
            if (adjustToOneMB) {
                const targetSizeInBytes = 1 // 1MB
                scaleFactor = findOptimalScaleFactor(sourceImage.width, sourceImage.height, frameCount, targetSizeInBytes)
            }

            const scaledWidth = Math.floor(sourceImage.width * scaleFactor)
            const scaledHeight = Math.floor(sourceImage.height * scaleFactor)
            setOptimizedSize({ width: scaledWidth, height: scaledHeight })

            canvas.width = scaledWidth
            canvas.height = scaledHeight

            const drawScaledImage = (x: number, y: number, width: number, height: number) => {
                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, width, height)
            }

            for (let i = 0; i < frameCount; i++) {
                const progress = i / (frameCount - 1)
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                switch (transition) {
                    case 'fadeIn':
                        ctx.globalAlpha = progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                    case 'fadeOut':
                        ctx.globalAlpha = 1 - progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                    case 'slideIn':
                        // 方向に応じてスライドイン
                        switch (effectDirection) {
                            case 'left':
                                ctx.drawImage(sourceImage, (1 - progress) * -canvas.width, 0, canvas.width, canvas.height)
                                break
                            case 'right':
                                ctx.drawImage(sourceImage, (1 - progress) * canvas.width, 0, canvas.width, canvas.height)
                                break
                            case 'up':
                                ctx.drawImage(sourceImage, 0, (1 - progress) * -canvas.height, canvas.width, canvas.height)
                                break
                            case 'down':
                            default:
                                ctx.drawImage(sourceImage, 0, (1 - progress) * canvas.height, canvas.width, canvas.height)
                                break
                        }
                        break
                    case 'slideOut':
                        // 方向に応じてスライドアウト
                        switch (effectDirection) {
                            case 'left':
                                ctx.drawImage(sourceImage, progress * -canvas.width, 0, canvas.width, canvas.height)
                                break
                            case 'right':
                                ctx.drawImage(sourceImage, progress * canvas.width, 0, canvas.width, canvas.height)
                                break
                            case 'up':
                                ctx.drawImage(sourceImage, 0, progress * -canvas.height, canvas.width, canvas.height)
                                break
                            case 'down':
                            default:
                                ctx.drawImage(sourceImage, 0, progress * canvas.height, canvas.width, canvas.height)
                                break
                        }
                        break
                    // 後方互換性のため旧名も維持
                    case 'slideRight':
                        ctx.drawImage(sourceImage,
                            Math.min(progress, 1) * canvas.width - canvas.width,
                            0,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'slideLeft':
                        ctx.drawImage(sourceImage, canvas.width - progress * canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'slideDown':
                        ctx.drawImage(sourceImage,
                            0,
                            Math.min(progress, 1) * canvas.height - canvas.height,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'slideUp':
                        ctx.drawImage(sourceImage, 0, canvas.height - progress * canvas.height, canvas.width, canvas.height)
                        break
                    case 'wipeIn':
                        ctx.save()
                        ctx.beginPath()
                        switch (effectDirection) {
                            case 'left':
                                ctx.rect(canvas.width * (1 - progress), 0, canvas.width * progress, canvas.height)
                                break
                            case 'right':
                                ctx.rect(0, 0, canvas.width * progress, canvas.height)
                                break
                            case 'up':
                                ctx.rect(0, canvas.height * (1 - progress), canvas.width, canvas.height * progress)
                                break
                            case 'down':
                            default:
                                ctx.rect(0, 0, canvas.width, canvas.height * progress)
                                break
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeOut':
                        ctx.save()
                        ctx.beginPath()
                        switch (effectDirection) {
                            case 'left':
                                ctx.rect(0, 0, canvas.width * (1 - progress), canvas.height)
                                break
                            case 'right':
                                ctx.rect(canvas.width * progress, 0, canvas.width * (1 - progress), canvas.height)
                                break
                            case 'up':
                                ctx.rect(0, 0, canvas.width, canvas.height * (1 - progress))
                                break
                            case 'down':
                            default:
                                ctx.rect(0, canvas.height * progress, canvas.width, canvas.height * (1 - progress))
                                break
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    // 後方互換性のため旧名も維持
                    case 'wipeRight':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width * progress, canvas.height)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeLeft':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(canvas.width * (1 - progress), 0, canvas.width * progress, canvas.height)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeDown':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width, canvas.height * progress)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeUp':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, canvas.height * (1 - progress), canvas.width, canvas.height * progress)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'zoomIn':
                        const scaleIn = 0.5 + progress * 0.5
                        ctx.drawImage(sourceImage,
                            canvas.width / 2 - (canvas.width / 2) * scaleIn,
                            canvas.height / 2 - (canvas.height / 2) * scaleIn,
                            canvas.width * scaleIn,
                            canvas.height * scaleIn
                        )
                        break
                    case 'zoomOut':
                        const scaleOut = 1.5 - progress * 0.5
                        ctx.drawImage(sourceImage,
                            canvas.width / 2 - (canvas.width / 2) * scaleOut,
                            canvas.height / 2 - (canvas.height / 2) * scaleOut,
                            canvas.width * scaleOut,
                            canvas.height * scaleOut
                        )
                        break
                    case 'rotate':
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate(progress * Math.PI * 2)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'blur':
                        ctx.filter = `blur(${(1 - progress) * 20}px)`
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.filter = 'none'
                        break
                    case 'tvStatic':
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            if (Math.random() < 1 - progress) {
                                const noise = Math.random() * 255
                                imageData.data[i] = (imageData.data[i] + noise) / 2
                                imageData.data[i + 1] = (imageData.data[i + 1] + noise) / 2
                                imageData.data[i + 2] = (imageData.data[i + 2] + noise) / 2
                            }
                        }
                        ctx.putImageData(imageData, 0, 0)
                        break
                    case 'enlarge':
                        const enlargeScale = 1 + progress * 4
                        ctx.drawImage(sourceImage,
                            canvas.width / 2 - (canvas.width / 2) * enlargeScale,
                            canvas.height / 2 - (canvas.height / 2) * enlargeScale,
                            canvas.width * enlargeScale,
                            canvas.height * enlargeScale
                        )
                        break
                    case 'minimize':
                        const minimizeScale = 5 - progress * 4
                        ctx.drawImage(sourceImage,
                            canvas.width / 2 - (canvas.width / 2) * minimizeScale,
                            canvas.height / 2 - (canvas.height / 2) * minimizeScale,
                            canvas.width * minimizeScale,
                            canvas.height * minimizeScale
                        )
                        break
                    case 'curtain':
                        ctx.save()
                        ctx.beginPath()
                        if (progress < 1) {
                            ctx.moveTo(0, 0)
                            ctx.lineTo(canvas.width * progress, 0)
                            ctx.lineTo(canvas.width * (progress - 0.1), canvas.height)
                            ctx.lineTo(0, canvas.height)
                        } else {
                            ctx.rect(0, 0, canvas.width, canvas.height)
                        }
                        ctx.closePath()
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'spiral':
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate(progress * Math.PI * 4)
                        ctx.scale(1 - progress * 0.5, 1 - progress * 0.5)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'fingerprint':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.fillStyle = `rgba(0, 0, 0, ${1 - progress})`
                        for (let j = 0; j < 50; j++) {
                            const x = Math.random() * canvas.width
                            const y = Math.random() * canvas.height
                            const radius = Math.random() * 20 + 5
                            ctx.beginPath()
                            ctx.arc(x, y, radius, 0, Math.PI * 2)
                            ctx.fill()
                        }
                        break
                    case 'bounce':
                        const bounceProgress = Math.sin(progress * Math.PI)
                        const bounceOffset = bounceProgress * canvas.height * 0.05
                        ctx.drawImage(sourceImage,
                            0,
                            bounceOffset,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'verticalVibration':
                        const verticalOffset = Math.sin(progress * Math.PI * 10) * canvas.height * 0.05
                        ctx.drawImage(sourceImage, 0, verticalOffset, canvas.width, canvas.height)
                        break
                    case 'horizontalVibration':
                        const horizontalOffset = Math.sin(progress * Math.PI * 10) * canvas.width * 0.05
                        ctx.drawImage(sourceImage, horizontalOffset, 0, canvas.width, canvas.height)
                        break
                    case 'glitch':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const glitchIntensity = 1 - progress
                        for (let j = 0; j < 10; j++) {
                            const y = Math.random() * canvas.height
                            const height = Math.random() * canvas.height * 0.1
                            const offset = (Math.random() - 0.5) * canvas.width * 0.1 * glitchIntensity
                            ctx.drawImage(canvas, 0, y, canvas.width, height, offset, y, canvas.width, height)
                        }
                        break
                    case 'doorOpen':
                        const doorProgress = Math.min(progress * 2, 1)
                        const halfWidth = canvas.width / 2
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width / 2, sourceImage.height,
                            -doorProgress * halfWidth, 0, halfWidth, canvas.height)
                        ctx.drawImage(sourceImage, sourceImage.width / 2, 0, sourceImage.width / 2, sourceImage.height,
                            canvas.width - halfWidth + doorProgress * halfWidth, 0, halfWidth, canvas.height)
                        break

                    // ========== V114 新規効果 ==========

                    // 振動（方向統合）
                    case 'vibration':
                        const vibAmp = Math.sin(progress * Math.PI * 8) * 10
                        if (effectDirection === 'vertical') {
                            ctx.drawImage(sourceImage, 0, (Math.random() - 0.5) * vibAmp, canvas.width, canvas.height)
                        } else {
                            ctx.drawImage(sourceImage, (Math.random() - 0.5) * vibAmp, 0, canvas.width, canvas.height)
                        }
                        break

                    // 閉扉（登場）
                    case 'doorClose':
                        const doorCloseProgress = progress
                        const halfW = canvas.width / 2
                        // 左扉
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width / 2, sourceImage.height,
                            -halfW + doorCloseProgress * halfW, 0, halfW, canvas.height)
                        // 右扉
                        ctx.drawImage(sourceImage, sourceImage.width / 2, 0, sourceImage.width / 2, sourceImage.height,
                            canvas.width - doorCloseProgress * halfW, 0, halfW, canvas.height)
                        break

                    // 砂嵐イン
                    case 'tvStaticIn':
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        const staticInData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        const staticInIntensity = 1 - progress
                        for (let p = 0; p < staticInData.data.length; p += 4) {
                            if (Math.random() < staticInIntensity) {
                                const noise = Math.random() * 255
                                staticInData.data[p] = staticInData.data[p + 1] = staticInData.data[p + 2] = noise
                            }
                        }
                        ctx.putImageData(staticInData, 0, 0)
                        break

                    // 砂嵐アウト
                    case 'tvStaticOut':
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        const staticOutData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        for (let p = 0; p < staticOutData.data.length; p += 4) {
                            if (Math.random() < progress) {
                                const noise = Math.random() * 255
                                staticOutData.data[p] = staticOutData.data[p + 1] = staticOutData.data[p + 2] = noise
                            }
                        }
                        ctx.putImageData(staticOutData, 0, 0)
                        break

                    // グリッチイン
                    case 'glitchIn':
                        const glitchInIntensity = 1 - progress
                        ctx.globalAlpha = progress
                        for (let s = 0; s < 10; s++) {
                            const sliceY = s * (canvas.height / 10)
                            const offsetX = (Math.random() - 0.5) * canvas.width * 0.3 * glitchInIntensity
                            ctx.drawImage(sourceImage, 0, sliceY, canvas.width, canvas.height / 10, offsetX, sliceY, canvas.width, canvas.height / 10)
                        }
                        ctx.globalAlpha = 1
                        break

                    // グリッチアウト
                    case 'glitchOut':
                        const glitchOutIntensity = progress
                        ctx.globalAlpha = 1 - progress
                        for (let s = 0; s < 10; s++) {
                            const sliceY = s * (canvas.height / 10)
                            const offsetX = (Math.random() - 0.5) * canvas.width * 0.3 * glitchOutIntensity
                            ctx.drawImage(sourceImage, 0, sliceY, canvas.width, canvas.height / 10, offsetX, sliceY, canvas.width, canvas.height / 10)
                        }
                        ctx.globalAlpha = 1
                        break

                    // フォーカスイン
                    case 'focusIn':
                        ctx.filter = `blur(${(1 - progress) * 20}px)`
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.filter = 'none'
                        break

                    // フォーカスアウト
                    case 'focusOut':
                        ctx.filter = `blur(${progress * 20}px)`
                        ctx.globalAlpha = 1 - progress * 0.5
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.filter = 'none'
                        ctx.globalAlpha = 1
                        break

                    // スライスイン
                    case 'sliceIn':
                        for (let s = 0; s < 5; s++) {
                            const sliceH = canvas.height / 5
                            const offsetX = (s % 2 === 0 ? -1 : 1) * (1 - progress) * canvas.width * 0.5
                            ctx.drawImage(sourceImage, 0, s * sliceH, canvas.width, sliceH, offsetX, s * sliceH, canvas.width, sliceH)
                        }
                        break

                    // スライスアウト
                    case 'sliceOut':
                        ctx.globalAlpha = 1 - progress
                        for (let s = 0; s < 5; s++) {
                            const sliceH = canvas.height / 5
                            const offsetX = (s % 2 === 0 ? -1 : 1) * progress * canvas.width * 0.5
                            ctx.drawImage(sourceImage, 0, s * sliceH, canvas.width, sliceH, offsetX, s * sliceH, canvas.width, sliceH)
                        }
                        ctx.globalAlpha = 1
                        break

                    // ライトリークイン
                    case 'lightLeakIn':
                        ctx.globalAlpha = progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'screen'
                        const lightGrad = ctx.createRadialGradient(canvas.width * 0.3, canvas.height * 0.3, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width)
                        lightGrad.addColorStop(0, `rgba(255, 200, 100, ${(1 - progress) * 0.8})`)
                        lightGrad.addColorStop(1, 'rgba(255, 200, 100, 0)')
                        ctx.fillStyle = lightGrad
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'source-over'
                        ctx.globalAlpha = 1
                        break

                    // フィルムバーン
                    case 'filmBurn':
                        ctx.globalAlpha = 1 - progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'overlay'
                        const burnGrad = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.5, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7)
                        burnGrad.addColorStop(0, `rgba(255, 100, 0, ${progress})`)
                        burnGrad.addColorStop(0.5, `rgba(255, 50, 0, ${progress * 0.7})`)
                        burnGrad.addColorStop(1, `rgba(0, 0, 0, ${progress})`)
                        ctx.fillStyle = burnGrad
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'source-over'
                        ctx.globalAlpha = 1
                        break

                    // タイルイン
                    case 'tileIn':
                        const tileCols = 4, tileRows = 4
                        const tileW = canvas.width / tileCols, tileH = canvas.height / tileRows
                        const tileTotal = tileCols * tileRows
                        const tileVisible = Math.floor(progress * tileTotal)
                        for (let t = 0; t < tileVisible; t++) {
                            const col = t % tileCols, row = Math.floor(t / tileCols)
                            ctx.drawImage(sourceImage, col * tileW, row * tileH, tileW, tileH, col * tileW, row * tileH, tileW, tileH)
                        }
                        break

                    // タイルアウト
                    case 'tileOut':
                        const tileOutCols = 4, tileOutRows = 4
                        const tileOutW = canvas.width / tileOutCols, tileOutH = canvas.height / tileOutRows
                        const tileOutTotal = tileOutCols * tileOutRows
                        const tileOutVisible = Math.floor((1 - progress) * tileOutTotal)
                        for (let t = 0; t < tileOutVisible; t++) {
                            const col = t % tileOutCols, row = Math.floor(t / tileOutCols)
                            ctx.drawImage(sourceImage, col * tileOutW, row * tileOutH, tileOutW, tileOutH, col * tileOutW, row * tileOutH, tileOutW, tileOutH)
                        }
                        break

                    // ピクセレートイン
                    case 'pixelateIn':
                        const pixelInSize = Math.max(1, Math.floor((1 - progress) * 30))
                        const tempIn = document.createElement('canvas')
                        tempIn.width = canvas.width / pixelInSize
                        tempIn.height = canvas.height / pixelInSize
                        const tempInCtx = tempIn.getContext('2d')!
                        tempInCtx.drawImage(sourceImage, 0, 0, tempIn.width, tempIn.height)
                        ctx.imageSmoothingEnabled = false
                        ctx.drawImage(tempIn, 0, 0, canvas.width, canvas.height)
                        ctx.imageSmoothingEnabled = true
                        break

                    // ピクセレートアウト
                    case 'pixelateOut':
                        const pixelOutSize = Math.max(1, Math.floor(progress * 30))
                        const tempOut = document.createElement('canvas')
                        tempOut.width = canvas.width / pixelOutSize
                        tempOut.height = canvas.height / pixelOutSize
                        const tempOutCtx = tempOut.getContext('2d')!
                        tempOutCtx.drawImage(sourceImage, 0, 0, tempOut.width, tempOut.height)
                        ctx.imageSmoothingEnabled = false
                        ctx.globalAlpha = 1 - progress * 0.3
                        ctx.drawImage(tempOut, 0, 0, canvas.width, canvas.height)
                        ctx.imageSmoothingEnabled = true
                        ctx.globalAlpha = 1
                        break

                    // アイリスイン
                    case 'irisIn':
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * progress, 0, Math.PI * 2)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // アイリスアウト
                    case 'irisOut':
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * (1 - progress), 0, Math.PI * 2)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // 本めくりイン（3D風回転 - 左端から開くように展開）
                    case 'pageFlipIn':
                        ctx.save()
                        // 左端を軸に回転するように、右側が徐々に広がる
                        const flipInScale = progress
                        const flipInOffset = canvas.width * (1 - progress) * 0.5
                        ctx.globalAlpha = 0.5 + progress * 0.5

                        // 傾斜効果を追加（本がめくれるような見た目）
                        ctx.setTransform(
                            flipInScale, 0,                    // 水平スケール
                            (1 - progress) * 0.3, 1,           // 傾斜
                            flipInOffset, 0                     // 移動
                        )
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // 本めくりアウト（3D風回転 - 右端を軸に回転して閉じる）
                    case 'pageFlipOut':
                        ctx.save()
                        const flipOutScale = 1 - progress
                        const flipOutOffset = canvas.width * progress * 0.5
                        ctx.globalAlpha = 1 - progress * 0.5

                        ctx.setTransform(
                            flipOutScale, 0,
                            progress * 0.3, 1,
                            flipOutOffset, 0
                        )
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // RGBずれ
                    case 'rgbShift':
                        const shiftAmt = Math.sin(progress * Math.PI) * 10
                        ctx.globalCompositeOperation = 'lighter'
                        ctx.globalAlpha = 0.5
                        ctx.drawImage(sourceImage, -shiftAmt, 0, canvas.width, canvas.height)
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        ctx.drawImage(sourceImage, shiftAmt, 0, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'source-over'
                        ctx.globalAlpha = 1
                        break

                    // 走査線
                    case 'scanlines':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
                        for (let y = 0; y < canvas.height; y += 4) {
                            ctx.fillRect(0, y, canvas.width, 2)
                        }
                        const scanOffset = (progress * canvas.height * 2) % canvas.height
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
                        ctx.fillRect(0, scanOffset - 10, canvas.width, 20)
                        break

                    // ビネット
                    case 'vignette':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const vigGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7)
                        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
                        vigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
                        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.3 + progress * 0.5})`)
                        ctx.fillStyle = vigGrad
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        break

                    // ジッター
                    case 'jitter':
                        const jitterInt = Math.sin(progress * Math.PI * 8)
                        const jitterX = (Math.random() - 0.5) * 10 * jitterInt
                        const jitterY = (Math.random() - 0.5) * 10 * jitterInt
                        ctx.drawImage(sourceImage, jitterX, jitterY, canvas.width, canvas.height)
                        break

                    // 色収差
                    case 'chromaticAberration':
                        const aberAmt = Math.sin(progress * Math.PI) * 5
                        ctx.globalCompositeOperation = 'screen'
                        ctx.globalAlpha = 0.8
                        ctx.drawImage(sourceImage, -aberAmt, -aberAmt, canvas.width, canvas.height)
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        ctx.drawImage(sourceImage, aberAmt, aberAmt, canvas.width, canvas.height)
                        ctx.globalCompositeOperation = 'source-over'
                        ctx.globalAlpha = 1
                        break

                    // 閃光
                    case 'flash':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const flashInt = Math.sin(progress * Math.PI)
                        ctx.fillStyle = `rgba(255, 255, 255, ${flashInt * 0.8})`
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        break

                    default:
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                }

                frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
                delays.push(1000 / fps)

                setGenerationProgress((i + 1) / frameCount * 0.8)
                await new Promise(resolve => setTimeout(resolve, 10))
            }

            if (!isLooping) {
                frames.push(frames[frames.length - 1]);
                delays.push(3600000);
            }

            setGenerationProgress(0.9)

            const apng = UPNG.encode(frames, canvas.width, canvas.height, 0, delays, { loop: isLooping ? 0 : 1 })
            const blob = new Blob([apng], { type: 'image/png' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `apng-${transition}-${isLooping ? 'loop' : 'noloop'}.png`

            setGenerationProgress(1)

            await new Promise(resolve => setTimeout(resolve, 500))

            a.click()
            URL.revokeObjectURL(url)

            setGenerationState('completed')
        } catch (error) {
            console.error('APNG生成中に詳細なエラーが発生しました:', error)
            setError(`APNG生成中に詳細なエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
            setGenerationState('idle')
        }
    }

    const getPreviewStyle = () => {
        if (!sourceImage || !previewContainerRef.current) return {}

        const containerRect = previewContainerRef.current.getBoundingClientRect()
        const containerAspectRatio = containerRect.width / containerRect.height
        const imageAspectRatio = sourceImage.width / sourceImage.height

        let width, height
        if (containerAspectRatio > imageAspectRatio) {
            height = containerRect.height
            width = height * imageAspectRatio
        } else {
            width = containerRect.width
            height = width / imageAspectRatio
        }

        const baseStyle = {
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }

        if (!isPlaying) {
            return baseStyle
        }

        switch (transition) {
            case 'fadeIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'fadeOut':
                return { ...baseStyle, opacity: 1 - previewProgress }
            case 'slideRight':
                return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * 100}%), -50%)` }
            case 'slideLeft':
                return { ...baseStyle, transform: `translate(calc(-50% - ${previewProgress * 100}%), -50%)` }
            case 'slideDown':
                return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * 100}%))` }
            case 'slideUp':
                return { ...baseStyle, transform: `translate(-50%, calc(-50% - ${previewProgress * 100}%))` }
            case 'wipeRight':
                return { ...baseStyle, clipPath: `inset(0 ${100 - previewProgress * 100}% 0 0)` }
            case 'wipeLeft':
                return { ...baseStyle, clipPath: `inset(0 0 0 ${100 - previewProgress * 100}%)` }
            case 'wipeDown':
                return { ...baseStyle, clipPath: `inset(0 0 ${100 - previewProgress * 100}% 0)` }
            case 'wipeUp':
                return { ...baseStyle, clipPath: `inset(${100 - previewProgress * 100}% 0 0 0)` }
            case 'zoomIn':
                const scaleIn = 0.5 + previewProgress * 0.5
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${scaleIn})` }
            case 'zoomOut':
                const scaleOut = 1.5 - previewProgress * 0.5
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${scaleOut})` }
            case 'rotate':
                return { ...baseStyle, transform: `translate(-50%, -50%) rotate(${previewProgress * 360}deg)` }
            case 'blur':
                return { ...baseStyle, filter: `blur(${(1 - previewProgress) * 20}px)` }
            case 'tvStatic':
                return {
                    ...baseStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${1 - previewProgress}'/%3E%3C/svg%3E")`,
                    backgroundBlendMode: 'overlay',
                }
            case 'enlarge':
                const enlargeScale = 1 + previewProgress * 4
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${enlargeScale})` }
            case 'minimize':
                const minimizeScale = 5 - previewProgress * 4
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${minimizeScale})` }
            case 'curtain':
                return {
                    ...baseStyle,
                    clipPath: previewProgress < 1
                        ? `polygon(0 0, ${previewProgress * 100}% 0, ${(previewProgress - 0.1) * 100}% 100%, 0 100%)`
                        : 'none',
                }
            case 'spiral':
                return {
                    ...baseStyle,
                    transform: `translate(-50%, -50%) rotate(${previewProgress * 720}deg) scale(${1 - previewProgress * 0.5})`,
                }
            case 'fingerprint':
                return {
                    ...baseStyle,
                    filter: `contrast(${1 + previewProgress}) brightness(${1 - previewProgress * 0.5})`,
                }
            case 'bounce':
                const bounceProgress = Math.sin(previewProgress * Math.PI)
                return {
                    ...baseStyle,
                    transform: `translate(-50%, calc(-50% - ${bounceProgress * 5}%))`,
                }
            case 'verticalVibration':
                const verticalOffset = Math.sin(previewProgress * Math.PI * 10) * 5
                return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${verticalOffset}%))` }
            case 'horizontalVibration':
                const horizontalOffset = Math.sin(previewProgress * Math.PI * 10) * 5
                return { ...baseStyle, transform: `translate(calc(-50% + ${horizontalOffset}%), -50%)` }
            case 'glitch':
                return {
                    ...baseStyle,
                    clipPath: `inset(0 0 0 ${(1 - previewProgress) * 100}%)`,
                    filter: `url(#glitch)`,
                    transform: `translate(-50%, -50%) skew(${Math.sin(previewProgress * Math.PI * 10) * 5}deg)`,
                }
            case 'doorOpen':
                const doorProgress = Math.min(previewProgress * 2, 1)
                return {
                    ...baseStyle,
                    clipPath: 'none',
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        height: '100%',
                        width: '50%',
                        backgroundImage: `url(${sourceImage?.src})`,
                        backgroundSize: 'cover',
                        transition: 'transform 0.3s ease-out',
                    },
                    '&::before': {
                        left: 0,
                        backgroundPosition: 'left',
                        transform: `translateX(${-doorProgress * 100}%)`,
                    },
                    '&::after': {
                        right: 0,
                        backgroundPosition: 'right',
                        transform: `translateX(${doorProgress * 100}%)`,
                    },
                }

            // ========== V114 新規効果プレビュー ==========

            // スライドイン（方向対応）
            case 'slideIn':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, transform: `translate(calc(-50% + ${(1 - previewProgress) * -100}%), -50%)` }
                    case 'right':
                        return { ...baseStyle, transform: `translate(calc(-50% + ${(1 - previewProgress) * 100}%), -50%)` }
                    case 'up':
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${(1 - previewProgress) * -100}%))` }
                    case 'down':
                    default:
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${(1 - previewProgress) * 100}%))` }
                }

            // スライドアウト（方向対応）
            case 'slideOut':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * -100}%), -50%)` }
                    case 'right':
                        return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * 100}%), -50%)` }
                    case 'up':
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * -100}%))` }
                    case 'down':
                    default:
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * 100}%))` }
                }

            // ワイプイン（方向対応）
            case 'wipeIn':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, clipPath: `inset(0 0 0 ${(1 - previewProgress) * 100}%)` }
                    case 'right':
                        return { ...baseStyle, clipPath: `inset(0 ${(1 - previewProgress) * 100}% 0 0)` }
                    case 'up':
                        return { ...baseStyle, clipPath: `inset(${(1 - previewProgress) * 100}% 0 0 0)` }
                    case 'down':
                    default:
                        return { ...baseStyle, clipPath: `inset(0 0 ${(1 - previewProgress) * 100}% 0)` }
                }

            // ワイプアウト（方向対応）
            case 'wipeOut':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, clipPath: `inset(0 ${previewProgress * 100}% 0 0)` }
                    case 'right':
                        return { ...baseStyle, clipPath: `inset(0 0 0 ${previewProgress * 100}%)` }
                    case 'up':
                        return { ...baseStyle, clipPath: `inset(0 0 ${previewProgress * 100}% 0)` }
                    case 'down':
                    default:
                        return { ...baseStyle, clipPath: `inset(${previewProgress * 100}% 0 0 0)` }
                }

            // 振動（方向対応）
            case 'vibration':
                const vibOffset = Math.sin(previewProgress * Math.PI * 8) * 5
                if (effectDirection === 'vertical') {
                    return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${vibOffset}%))` }
                } else {
                    return { ...baseStyle, transform: `translate(calc(-50% + ${vibOffset}%), -50%)` }
                }

            // 閉扉
            case 'doorClose':
                return { ...baseStyle, opacity: previewProgress }

            // 砂嵐イン/アウト
            case 'tvStaticIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'tvStaticOut':
                return { ...baseStyle, opacity: 1 - previewProgress }

            // グリッチイン/アウト
            case 'glitchIn':
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    transform: `translate(-50%, -50%) skew(${Math.sin(previewProgress * Math.PI * 5) * (1 - previewProgress) * 10}deg)`,
                }
            case 'glitchOut':
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    transform: `translate(-50%, -50%) skew(${Math.sin(previewProgress * Math.PI * 5) * previewProgress * 10}deg)`,
                }

            // フォーカスイン/アウト
            case 'focusIn':
                return { ...baseStyle, filter: `blur(${(1 - previewProgress) * 20}px)` }
            case 'focusOut':
                return { ...baseStyle, filter: `blur(${previewProgress * 20}px)`, opacity: 1 - previewProgress * 0.5 }

            // スライスイン/アウト
            case 'sliceIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'sliceOut':
                return { ...baseStyle, opacity: 1 - previewProgress }

            // ライトリークイン
            case 'lightLeakIn':
                return { ...baseStyle, opacity: previewProgress, filter: `brightness(${1 + (1 - previewProgress) * 0.5})` }

            // フィルムバーン
            case 'filmBurn':
                return { ...baseStyle, opacity: 1 - previewProgress, filter: `sepia(${previewProgress}) saturate(${1 + previewProgress})` }

            // タイルイン/アウト
            case 'tileIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'tileOut':
                return { ...baseStyle, opacity: 1 - previewProgress }

            // ピクセレートイン/アウト
            case 'pixelateIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'pixelateOut':
                return { ...baseStyle, opacity: 1 - previewProgress }

            // アイリスイン/アウト
            case 'irisIn':
                return { ...baseStyle, clipPath: `circle(${previewProgress * 100}% at 50% 50%)` }
            case 'irisOut':
                return { ...baseStyle, clipPath: `circle(${(1 - previewProgress) * 100}% at 50% 50%)` }

            // 本めくりイン/アウト
            case 'pageFlipIn':
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${(1 - previewProgress) * -90}deg)`,
                }
            case 'pageFlipOut':
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${previewProgress * 90}deg)`,
                }

            // RGBずれ
            case 'rgbShift':
                return { ...baseStyle, filter: `hue-rotate(${Math.sin(previewProgress * Math.PI) * 30}deg)` }

            // 走査線
            case 'scanlines':
                return { ...baseStyle }

            // ビネット
            case 'vignette':
                return { ...baseStyle, filter: `brightness(${1 - previewProgress * 0.3})` }

            // ジッター
            case 'jitter':
                const jitterAmt = Math.sin(previewProgress * Math.PI * 8) * 3
                return { ...baseStyle, transform: `translate(calc(-50% + ${jitterAmt}px), calc(-50% + ${jitterAmt}px))` }

            // 色収差
            case 'chromaticAberration':
                return { ...baseStyle }

            // 閃光
            case 'flash':
                const flashOpacity = Math.sin(previewProgress * Math.PI)
                return { ...baseStyle, filter: `brightness(${1 + flashOpacity * 0.8})` }

            default:
                return baseStyle
        }
    }

    useEffect(() => {
        return () => {
            stopPreview()
        }
    }, [])

    // 方向が変更された時にプレビューを再起動
    useEffect(() => {
        if (isPlaying && sourceImage) {
            stopPreview()
            startPreview()
        }
    }, [effectDirection])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="flex flex-col items-center mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" className="w-full max-w-lg h-auto mb-4">
                        <defs>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: "#2C3E50", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#3498DB", stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>

                        <path d="M20,40 L30,23.4 L50,23.4 L60,40 L50,56.6 L30,56.6 Z"
                            fill="none"
                            stroke="url(#gradient3)"
                            strokeWidth="3" />

                        <rect x="35" y="35" width="10" height="10" fill="#3498DB" opacity="0.3">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="40" y="30" width="10" height="10" fill="#3498DB" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="45" y="25" width="10" height="10" fill="#3498DB">
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
                        </rect>

                        <text x="80" y="50" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#2C3E50" dominantBaseline="middle">
                            <tspan style={{ letterSpacing: "1px" }}>APNG</tspan>
                            <tspan dx="5" style={{ fontSize: "32px", fontWeight: "normal" }}>Generator</tspan>
                        </text>
                    </svg>
                    <p className="text-base text-gray-600 text-center mt-2">
                        画像からトランジション効果付きのアニメーションPNG作成できるツール
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">画像選択 & プレビュー</h3>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                                            <Info className="w-4 h-4 mr-1" />
                                            使い方を表示
                                        </button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
                                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                                <li>画像を選択または枠内にドラッグ&ドロップします</li>
                                                <li>トランジション効果を選びます</li>
                                                <li>ループ画像にしたい場合は、［ループする］にチェックします</li>
                                                <li>1MB以下に調整したい場合は、［1MB以下に調整］にチェックします</li>
                                                <li>フレームレートを調整します（高いほど滑らかになります）</li>
                                                <li>プレビューで確認します</li>
                                                <li>APNG生成ボタンでファイルを生成します</li>
                                            </ol>
                                            <Popover.Arrow className="fill-white" />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            </div>

                            {/* First set of buttons - directly under the header */}
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={handlePreview}
                                    className="flex-1 bg-white hover:bg-blue-50 text-blue-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center border-2 border-blue-500"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                                    {isPlaying ? '停止' : 'プレビュー'}
                                </button>
                                <button
                                    onClick={generateAPNG}
                                    disabled={generationState !== 'idle' || !sourceImage}
                                    className="flex-1 bg-white hover:bg-green-50 text-green-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-green-500"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    APNG生成
                                </button>
                            </div>

                            {/* Image upload area */}
                            <div
                                ref={previewContainerRef}
                                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer mb-4"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileUpload(e);
                                }}
                                style={{ padding: '10% 0' }} // 上下に10%のパディングを追加
                            >
                                {sourceImage ? (
                                    <>
                                        <motion.img
                                            src={sourceImage.src}
                                            alt="プレビュー"
                                            style={getPreviewStyle()}
                                        />
                                        {transition === 'doorOpen' && (
                                            <DoorOpenPreview src={sourceImage.src} progress={previewProgress} />
                                        )}
                                    </>
                                ) : (
                                    <div className="text-gray-400 text-center p-4">
                                        <Upload className="w-12 h-12 mx-auto mb-2" />
                                        クリックまたはドラッグ&ドロップで画像を選択
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {/* Third set of buttons - outside the container */}
                        <div className="flex space-x-2">
                            <button
                                onClick={handlePreview}
                                className="flex-1 bg-white hover:bg-blue-50 text-blue-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center border-2 border-blue-500"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                                {isPlaying ? '停止' : 'プレビュー'}
                            </button>
                            <button
                                onClick={generateAPNG}
                                disabled={generationState !== 'idle' || !sourceImage}
                                className="flex-1 bg-white hover:bg-green-50 text-green-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-green-500"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                APNG生成
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">設定</h3>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isLooping}
                                        onChange={(e) => setIsLooping(e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-100 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">ループする（繰り返し再生）</span>
                                </label>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={adjustToOneMB}
                                        onChange={(e) => setAdjustToOneMB(e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-100 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">1MB以下に調整（画質を下げて容量を抑える）</span>
                                </label>
                            </div>

                            <div>
                                <label htmlFor="fps-range" className="block text-sm font-medium text-gray-700 mb-2">
                                    フレームレート: {fps} fps
                                </label>
                                <input
                                    id="fps-range"
                                    type="range"
                                    min="10"
                                    max="40"
                                    value={fps}
                                    onChange={(e) => setFps(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {imageSize && (
                                <div>
                                    <p className="text-sm text-gray-600">元の画像サイズ: {imageSize.width} x {imageSize.height} px</p>
                                    {estimatedSize !== null && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            予想APNG容量: {estimatedSize.toFixed(2)} MB
                                            {adjustToOneMB && estimatedSize > 1 && (
                                                <span className="text-yellow-600 ml-2">
                                                    (1MB以下に自動調整されます)
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    {optimizedSize && adjustToOneMB && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            最適化後の画像サイズ: {optimizedSize.width} x {optimizedSize.height} px
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <TransitionEffectsSelector
                            transition={transition}
                            setTransition={handleTransitionChange}
                            effectDirection={effectDirection}
                            setEffectDirection={setEffectDirection}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {generationState !== 'idle' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                            {generationState === 'generating' ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800">APNG生成中</h2>
                                    <div className="mb-6">
                                        <div className="h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                                                style={{ width: `${generationProgress * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Settings className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600 text-center">
                                        しばらくお待ちください。この処理には数秒かかる場合があります。
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-2 text-green-500">
                                            <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" fill="currentColor" />
                                            <path d="M14,14.5L11,12.5L9,14.5L11,16.5L14,14.5Z" fill="currentColor" />
                                        </svg>
                                        生成完了
                                    </h2>
                                    <p className="mb-6 text-gray-600 text-center">APNGの生成が完了しました。ダウンロードを確認してください。</p>
                                    <button
                                        onClick={() => setGenerationState('idle')}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        OK
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* 注意書き */}
                <div className="mt-8 text-sm text-gray-500 text-center">
                    <p>※本WEBツールは試験的に作成し、テスト公開しているものとなります。</p>
                    <p>想定外の動作や、エラーが発生する可能性があります。</p>
                    <p>不具合や改善点、ご意見ございましたら、お手数ですがフィードバックをお寄せください。今後の参考にさせていただきます。</p>
                </div>
            </div>
            {/* SVGフィルターの追加 */}
            <svg className="hidden">
                <filter id="glitch">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
                    <feComposite operator="in" in2="SourceGraphic" />
                </filter>
            </svg>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}