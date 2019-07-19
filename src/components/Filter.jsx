import React, { Component } from 'react';


export default class Filter extends Component {
  constructor(props) {
    super(props)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  handleFilterChange(e) {
    const newState = {};
    const newValue = Array.from(e.target.selectedOptions, option => option.value)
    newState[`${e.target.name}Filter`] = newValue;
    this.props.handler(newState);
  }

  render() {
    return <section id='filter'>
      <h2>Filter data</h2>
      <form>
        <fieldset>
          <label htmlFor='region'>Region</label>
          <select name='region' multiple={ true } value={ this.props.selected.region } onChange={ this.handleFilterChange }>
            <option value="E12000001">North East</option>
            <option value="E12000002">North West</option>
            <option value="E12000003">Yorkshire and The Humber</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor='region'>Sector</label>
          <select name='sector' multiple={ true } value={ this.props.selected.sector } onChange={ this.handleFilterChange }>
            <option value="Construction, Planning and the Built Environment">Construction, Planning and the Built Environment</option>
            <option value="Engineering and Manufacturing Technologies">Engineering and Manufacturing Technologies</option>
          </select>
        </fieldset>
      </form>
    </section>;
  }
}