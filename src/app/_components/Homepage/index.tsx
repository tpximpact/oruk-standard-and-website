import styles from './Homepage.module.css'
import Link from 'next/link'
import Columns from '@/components/Columns'
import { PageMargin } from '@/components/PageMargin'
import { parseMarkdown } from '@/utilities/parseMarkdown'

interface LinkData {
  href: string
  text: string
}

interface BoxData {
  headline: string
  content_md: string
  link: LinkData
}

interface HeroData {
  headline: string
  content_md: string
}

interface ConclusionData {
  headline: string
  content_md: string
  left_col_md: string
  right_col_md: string
}

interface HomepageData {
  hero: HeroData
  boxes: BoxData[]
  conclusion: ConclusionData
}

interface HomepageProps {
  data: HomepageData
}

export const Homepage = ({ data }: HomepageProps) => (
  <PageMargin>
    <div className={styles.homepage}>
      <Hero {...data.hero} />
      <Boxes data={data.boxes} />
      <Conclusion {...data.conclusion} />
    </div>
  </PageMargin>
)

interface HeadlineProps {
  text: string
}

const Headline = ({ text }: HeadlineProps) => (
  <h2>
    <strong>{text}</strong>
  </h2>
)

interface BodycopyProps {
  md: string
  pad?: boolean
}

const Bodycopy = ({ md, pad }: BodycopyProps) => {
  const parsed = parseMarkdown(md)
  const html = parsed?.content || ''
  return (
    <div
      style={{ padding: pad ? '2rem' : 0, fontWeight: '500' }}
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

interface HyperlinkProps {
  href: string
  text: string
}

const Hyperlink = ({ href, text }: HyperlinkProps) => (
  <div className={styles.link}>
    <Link href={href}>{text}</Link>
  </div>
)

const Hero = ({ headline, content_md }: HeroData) => (
  <section className={styles.hero}>
    <div>
      <Columns layout='11'>
        <div className={styles.paddedmultiline}>
          <h1>
            <strong>{headline}</strong>
          </h1>
        </div>
      </Columns>
    </div>
    <div>
      <Columns layout='11'>
        <div></div>
        <div style={{ marginRight: '2rem' }}>
          <Bodycopy pad={true} md={content_md} />
        </div>
      </Columns>
    </div>
  </section>
)

/**/

interface BoxesProps {
  data: BoxData[]
}

const Boxes = ({ data }: BoxesProps) => (
  <section className={styles.boxes}>
    {data.map((box, i) => (
      <Box key={i} {...box} />
    ))}
  </section>
)

const Box = ({ headline, content_md, link }: BoxData) => (
  <div className={styles.box}>
    <Headline text={headline} />
    <Bodycopy md={content_md} />
    <Hyperlink {...link} />
  </div>
)

const Conclusion = ({ headline, content_md, left_col_md, right_col_md }: ConclusionData) => (
  <section className={styles.conclusion}>
    <Headline text={headline} />
    <Bodycopy md={content_md} />
    <Columns layout='11'>
      <Bodycopy md={left_col_md} />
      <Bodycopy md={right_col_md} />
    </Columns>
  </section>
)
