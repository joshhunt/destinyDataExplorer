import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize } from 'lodash';

import { setBulkDefinitions } from 'src/store/definitions';
import { getAllDefinitions } from 'src/lib/definitions';

import SearchHeader from 'src/components/SearchHeader';
import DataView from 'src/components/DataView';
import Item from 'src/components/Item';

import s from './styles.styl';

const values = memoize(defs => Object.values(defs));

function parsePathSegment(segment) {
  const [type, hash] = segment.split(':');
  return { type: `Destiny${type}Definition`, hash };
}

function parsePath(splat) {
  return splat.split('/').map(parsePathSegment);
}

class HomeView extends Component {
  state = { loading: true, views: [] };

  componentDidMount() {
    // let _resolve;
    // this.defsPromise = new Promise(resolve => {
    //   _resolve = resolve;
    // });

    // this.defsPromise.resolve = _resolve;

    if (this.props.routeParams.splat) {
      this.updateViews();
    }

    getAllDefinitions().then(defs => {
      this.setState({ loading: false });
      console.log('Got defintions, dispatching them now', defs);
      this.props.setBulkDefinitions(defs);
      // this.defsPromise.resolve();
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.routeParams.splat !== prevProps.routeParams.splat) {
      this.updateViews();
    }
  }

  updateViews() {
    const segments = parsePath(this.props.routeParams.splat);
    this.setState({ views: segments });

    // this.defsPromise.then(() => {
    //   this.setState({ views: segments });
    // });
  }

  pathForItem = (type, item) => {
    let url = '';

    if (this.props.routeParams.splat) {
      url = `${this.props.location.pathname}/${type}:${item.hash}`;
    } else {
      url = `/i/${type}:${item.hash}`;
    }

    return url;
  };

  render() {
    const { loading, views } = this.state;
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
              <Item
                key={item.hash}
                className={s.item}
                item={item}
                pathForItem={this.pathForItem}
              />
            ))}
          </div>
        </div>

        {views.length > 0 &&
          views.map(
            ({ type, hash }, index) =>
              this.props.definitions[type] && (
                <DataView
                  depth={index + 1}
                  className={s.dataView}
                  key={`${type}:${hash}`}
                  item={this.props.definitions[type][hash]}
                  type={type}
                />
              )
          )}
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
