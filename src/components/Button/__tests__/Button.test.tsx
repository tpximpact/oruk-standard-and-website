import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../index'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should pass through additional props', () => {
    render(
      <Button disabled data-testid='test-button'>
        Disabled
      </Button>
    )
    const button = screen.getByTestId('test-button')

    expect(button).toBeDisabled()
  })

  it('should render with type attribute', () => {
    render(<Button type='submit'>Submit</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('type', 'submit')
  })
})
