import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export function EditableText({
  fieldName,
  value,
  inputClassName,
  inputLabel,
  buttonClassName,
  buttonLabel,
  onChange,
  editState,
}: {
  fieldName: string
  value: string
  inputClassName?: string
  inputLabel: string
  buttonClassName?: string
  buttonLabel: string
  onChange: (value: string) => void
  editState?: [boolean, (value: boolean) => void]
}) {
  const localEditState = useState(false)
  const [edit, setEdit] = editState || localEditState
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return edit ? (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault()
        const newValue = inputRef.current?.value || ''
        if (newValue !== value && newValue.trim() !== '') {
          onChange(newValue)
        }
        flushSync(() => {
          setEdit(false)
        })
        buttonRef.current?.focus()
      }}
    >
      <Input
        required
        ref={inputRef}
        type="text"
        aria-label={inputLabel}
        name={fieldName}
        defaultValue={value}
        className={cn("h-8 px-2 focus-visible:ring-indigo-500 bg-slate-900 border-white/10 text-white", inputClassName)}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            flushSync(() => {
              setEdit(false)
            })
            buttonRef.current?.focus()
          }
        }}
        onBlur={(event) => {
          const newValue = inputRef.current?.value || ''
          if (newValue !== value && newValue.trim() !== '') {
            onChange(newValue)
          }
          setEdit(false)
        }}
      />
    </form>
  ) : (
    <button
      aria-label={buttonLabel}
      type="button"
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true)
        })
        inputRef.current?.select()
      }}
      className={cn(
        "text-left transition-colors hover:bg-white/5 rounded px-2 py-1 -ml-2",
        buttonClassName
      )}
    >
      {value || <span className="text-slate-500 italic">Add {fieldName}...</span>}
    </button>
  )
}
