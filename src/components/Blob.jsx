function BlobTitle(props) {
  if ( !props.title ) return null;
  return <h2>{ props.title }</h2>;
}
export default function Blob(props) {
  return <>
    <article className='blob'>
      <BlobTitle { ...props }/>
      <div className='value'>{ props.value }</div>
    </article>
  </>;
}