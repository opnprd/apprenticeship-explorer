import React, { Component } from 'react';

const regions = [
  { name: 'North East', value: 'E12000001' },
  { name: 'North West', value: 'E12000002' },
  { name: 'Yorkshire and The Humber', value: 'E12000003' }
]

const sectors = [
  { name: 'Construction, Planning and the Built Environment', value: 'Construction, Planning and the Built Environment' },
  { name: 'Engineering and Manufacturing Technologies', value: 'Engineering and Manufacturing Technologies' }
]

function FilterTag (props) {
  return <li>{ props.name }</li>
}

function FilterBlock (props) {
  const options = props.options.map((_, i) => (<option key={ i } value={ _.value }>{ _.name }</option>));
  const tags = props.value.map((_, i) => (<FilterTag key={ i } name={_} />))
  return <fieldset id={ props.name } className='filter-block'>
    <label htmlFor={ props.name }>{ props.title }</label>
    <select name={ props.name } multiple={ true } value={ props.value } onChange={ props.handler }>
      { options }
    </select>
    <ul className='tag-cloud'>{ tags }</ul>
  </fieldset>;
}

export default class Filter extends Component {
  constructor(props) {
    super(props)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  handleFilterChange (reference) {
    return (e) => {
      const newState = {};
      const newValue = Array.from(e.target.selectedOptions, option => option.value);
      newState[reference] = newValue;
      this.props.handler(newState);
    }
  }

  render() {
    return <section id='filter'>
      <h2>Filter data</h2>
      <form>
        <FilterBlock
          title='Region'
          name='region'
          options={ regions }
          value={ this.props.selected.region }
          handler={ this.handleFilterChange('regionFilter') } />
        <FilterBlock
          title='Sector'
          name='sector'
          options={ sectors }
          value={ this.props.selected.sector }
          handler={ this.handleFilterChange('sectorFilter') } />
      </form>
    </section>;
  }
}