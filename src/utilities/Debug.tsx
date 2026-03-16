interface DebugProps {
  data: unknown
}

export const Debug = ({ data }: DebugProps) => <pre>{JSON.stringify(data, null, 2)}</pre>
