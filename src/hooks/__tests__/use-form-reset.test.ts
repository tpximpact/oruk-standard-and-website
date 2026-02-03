import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormReset } from '../use-form-reset'

describe('useFormReset', () => {
  it('should return a ref object', () => {
    const formState = { status: 'UNSET', timestamp: Date.now() }
    const { result } = renderHook(() => useFormReset(formState))

    expect(result.current).toBeDefined()
    expect(result.current.current).toBeNull()
  })

  it('should reset form when status is SUCCESS and timestamp changes', () => {
    const formElement = document.createElement('form')
    const input = document.createElement('input')
    input.type = 'text'
    input.value = 'test value'
    formElement.appendChild(input)
    document.body.appendChild(formElement)

    const initialTimestamp = Date.now()
    const { result, rerender } = renderHook((formState: any) => useFormReset(formState), {
      initialProps: { status: 'UNSET', timestamp: initialTimestamp }
    })

    act(() => {
      result.current.current = formElement
    })

    const resetSpy = vi.spyOn(formElement, 'reset')

    act(() => {
      rerender({ status: 'SUCCESS', timestamp: initialTimestamp + 1000 })
    })

    expect(resetSpy).toHaveBeenCalled()
    resetSpy.mockRestore()
    document.body.removeChild(formElement)
  })

  it('should not reset form if status is not SUCCESS', () => {
    const formElement = document.createElement('form')
    const input = document.createElement('input')
    input.type = 'text'
    input.value = 'test value'
    formElement.appendChild(input)
    document.body.appendChild(formElement)

    const timestamp = Date.now()
    const { result, rerender } = renderHook((formState: any) => useFormReset(formState), {
      initialProps: { status: 'ERROR', timestamp }
    })

    act(() => {
      result.current.current = formElement
    })

    const resetSpy = vi.spyOn(formElement, 'reset')

    act(() => {
      rerender({ status: 'ERROR', timestamp: timestamp + 1000 })
    })

    expect(resetSpy).not.toHaveBeenCalled()
    resetSpy.mockRestore()
    document.body.removeChild(formElement)
  })

  it('should not reset form if timestamp does not change', () => {
    const formElement = document.createElement('form')
    const timestamp = Date.now()
    document.body.appendChild(formElement)

    const { result, rerender } = renderHook((formState: any) => useFormReset(formState), {
      initialProps: { status: 'UNSET', timestamp }
    })

    act(() => {
      result.current.current = formElement
    })

    const resetSpy = vi.spyOn(formElement, 'reset')

    act(() => {
      rerender({ status: 'SUCCESS', timestamp })
    })

    expect(resetSpy).not.toHaveBeenCalled()
    resetSpy.mockRestore()
    document.body.removeChild(formElement)
  })

  it('should handle null ref gracefully', () => {
    const timestamp = Date.now()
    const { rerender } = renderHook((formState: any) => useFormReset(formState), {
      initialProps: { status: 'UNSET', timestamp }
    })

    // No error should be thrown when ref is null
    expect(() => {
      act(() => {
        rerender({ status: 'SUCCESS', timestamp: timestamp + 1000 })
      })
    }).not.toThrow()
  })

  it('should track timestamp changes correctly', () => {
    const initialTimestamp = Date.now()
    const { result, rerender } = renderHook((formState: any) => useFormReset(formState), {
      initialProps: { status: 'SUCCESS', timestamp: initialTimestamp }
    })

    const formElement = document.createElement('form')
    document.body.appendChild(formElement)
    act(() => {
      result.current.current = formElement
    })

    const resetSpy = vi.spyOn(formElement, 'reset')

    // First rerender - should reset
    const newTimestamp = initialTimestamp + 1000
    act(() => {
      rerender({ status: 'SUCCESS', timestamp: newTimestamp })
    })
    expect(resetSpy).toHaveBeenCalledTimes(1)

    // Second rerender with same timestamp - should not reset again
    act(() => {
      rerender({ status: 'SUCCESS', timestamp: newTimestamp })
    })
    expect(resetSpy).toHaveBeenCalledTimes(1)

    resetSpy.mockRestore()
    document.body.removeChild(formElement)
  })
})
