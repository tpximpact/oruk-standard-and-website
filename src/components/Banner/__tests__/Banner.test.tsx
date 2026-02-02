import { render, screen } from '@testing-library/react'
import { Banner } from '../index'

describe('Banner', () => {
  it('should render banner with label', () => {
    render(<Banner label='Test Label' />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <Banner label='Title'>
        <p>Child content</p>
      </Banner>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should render without children', () => {
    render(<Banner label='Only label' />)
    expect(screen.getByText('Only label')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <Banner label='Title'>
        <span>First child</span>
        <span>Second child</span>
      </Banner>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
  })
})
