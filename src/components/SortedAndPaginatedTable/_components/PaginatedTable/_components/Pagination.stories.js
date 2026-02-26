import { Pagination } from './Pagination'

const dummyPageChange = (baseUrl, targetPage) => {
  // eslint-disable-next-line no-undef
  alert('would request page ' + baseUrl + targetPage)
}
export default {
  title: 'Hub/Pagination',
  component: Pagination
}

const defaultArgs = {
  baseUrl: 'http://example.com/page?number=',
  pageChangeFunction: dummyPageChange
}

export const PageOneOfFour = () => <Pagination {...defaultArgs} numPages={4} currentPage={1} />

export const PageTwoOfFour = () => <Pagination {...defaultArgs} numPages={4} currentPage={2} />

export const PageThreeOfFour = () => <Pagination {...defaultArgs} numPages={4} currentPage={3} />

export const PageFourOfFour = () => <Pagination {...defaultArgs} numPages={4} currentPage={4} />

export const PageTwoOfOneHundred = () => (
  <>
    <p>
      NB: This is a stress test, not supported functionality. Anticipated number of pages is
      currently low so for now just dont break. Better future behaviour woukd be a window of, eg 2
      pages either side of current page...
    </p>
    <Pagination {...defaultArgs} numPages={100} currentPage={2} />
  </>
)
