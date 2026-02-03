import { Homepage } from './_components/Homepage'
import { Metadata } from 'next'

import data from '../../content/home/index.json'

export const metadata: Metadata = {
  title: 'Open Referral UK'
}

export default function Home() {
  return <Homepage data={data} />
}
