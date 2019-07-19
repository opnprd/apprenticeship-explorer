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

function FilterBlock (props) {
  const options = props.options.map((_, i) => (<option key={ i } value={ _.value }>{ _.name }</option>));

  return <fieldset>
    <label htmlFor={ props.name }>{ props.name }</label>
    <select name={ props.name } multiple={ true } value={ props.value } onChange={ props.handler }>
      { options }
    </select>
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
          name='region'
          options={ regions }
          value={ this.props.selected.region }
          handler={ this.handleFilterChange('regionFilter') } />
        <FilterBlock
          name='sector'
          options={ sectors }
          value={ this.props.selected.sector }
          handler={ this.handleFilterChange('sectorFilter') } />
      </form>
    </section>;
  }
}