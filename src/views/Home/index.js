import React, { Component } from 'react';

import SearchHeader from 'src/components/SearchHeader';
import { getAllDefinitions } from 'src/lib/definitions';

export default class HomeView extends Component {
  componentDidMount() {
    console.log('Requesting definitions...');
    getAllDefinitions().then(defs => console.log(defs));
  }
  render() {
    return (
      <div>
        <SearchHeader />
        <h1>This is new</h1>
      </div>
    );
  }
}
