//import dynamic from 'next/dynamic';
/*import {
	jsonSchemaToDot
} from '@/utilities/jsonSchemaToDot' */
//const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

/*
export const RenderAPI = ({data}) => {
	const dot = jsonSchemaToDot(data)
return (<div>
<Graphviz dot={dot}
options ={{
	height: 9000,
width: 1028,
zoom: false
 }} />

	<code><pre>{JSON.stringify(data.components.schemas, undefined, 2)}</pre></code>
</div>)

}

*/

// import styles from "./RenderAPI.module.css"

export const RenderDB = ({ data }: { data: unknown }) => (
  <div>
    RenderDB:
    {JSON.stringify(data)}
  </div>
)
