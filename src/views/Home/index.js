import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize } from 'lodash';

import { setBulkDefinitions } from 'src/store/definitions';
import { getAllDefinitions } from 'src/lib/definitions';

import SearchHeader from 'src/components/SearchHeader';
import Item from 'src/components/Item';

import s from './styles.styl';

const values = memoize(defs => Object.values(defs));

class HomeView extends Component {
  state = { loading: true };

  componentDidMount() {
    console.log('Requesting definitions...');

    getAllDefinitions().then(defs => {
      this.setState({ loading: false });
      console.log('Got defintions, dispatching them now', defs);
      this.props.setBulkDefinitions(defs);
    });
  }

  render() {
    const { loading } = this.state;
    const items = values(
      this.props.definitions.DestinyInventoryItemDefinition || {}
    ).slice(0, 100);

    return (
      <div className={s.root}>
        <SearchHeader />

        <div className={s.body}>
          {loading && <h1>Loading...</h1>}

          <div className={s.items}>
            {items.map(item => (
              <Item key={item.hash} className={s.item} item={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    definitions: state.definitions
  };
}

const mapDispatchToActions = { setBulkDefinitions };

export default connect(mapStateToProps, mapDispatchToActions)(HomeView);
