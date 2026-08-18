import React from 'react'
import MonacoEditor from '@monaco-editor/react'

type Props = {
  value: string
  language?: string
  onChange: (v: string) => void
}

export default function Editor({ value, language = 'python', onChange }: Props) {
  return (
    <div style={{ border: '1px solid #ddd' }}>
      <MonacoEditor height="360px" defaultLanguage={language} value={value} onChange={(v) => onChange(v || '')} />
    </div>
  )
}
