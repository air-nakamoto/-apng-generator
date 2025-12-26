'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidFlowchartProps {
    chart: string
    id: string
}

export function MermaidFlowchart({ chart, id }: MermaidFlowchartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')

    useEffect(() => {
        const renderChart = async () => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    themeVariables: {
                        fontSize: '14px',
                    },
                    flowchart: {
                        useMaxWidth: true,
                        htmlLabels: true,
                        curve: 'basis',
                    },
                })

                const { svg: renderedSvg } = await mermaid.render(id, chart)
                setSvg(renderedSvg)
            } catch (error) {
                console.error('Mermaid rendering error:', error)
            }
        }

        renderChart()
    }, [chart, id])

    return (
        <div
            ref={containerRef}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
