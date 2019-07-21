import React from 'react';

export default function TagCloud(props) {
  const tags = props.value.map((_, i) => (<li key={i}>{_}</li>));
  return <ul className='tag-cloud'>{tags}</ul>;
}
