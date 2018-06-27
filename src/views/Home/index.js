import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize, toPairs } from 'lodash';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { setBulkDefinitions } from 'src/store/definitions';
import { getAllDefinitions } from 'src/lib/definitions';
import { makeTypeShort } from 'src/lib/destinyUtils';

import SearchHeader from 'src/components/SearchHeader';
import DataView from 'src/components/DataView';
import Item from 'src/components/Item';

import lookup from './lookup';
import s from './styles.styl';

const getComparableName = memoize(item => {
  const name = item && item.displayProperties && item.displayProperties.name;
  return name ? name.toLowerCase() : name;
});

const makeAllDefsArray = memoize(allDefs => {
  return toPairs(allDefs).reduce((acc, [type, defs]) => {
    return [
      ...acc,
      ...toPairs(defs).map(([key, def]) => ({
        type, // definition type
        key, // definition key, like hash
        def // the definition item itself
      }))
    ];
  }, []);
});

const MAX_RANDOM_ITEMS = 100;

const getRandomItems = memoize(allDefs => {
  let n = MAX_RANDOM_ITEMS;
  const arr = makeAllDefsArray(allDefs).filter(obj => {
    return (
      obj.def && obj.def.displayProperties && obj.def.displayProperties.hasIcon
    );
  });
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len) return [];
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  console.log('result:', result);
  return result;
});

function parsePathSegment(segment) {
  const [type, hash] = segment.split(':');
  return { type: `Destiny${type}Definition`, shortType: type, hash };
}

function parsePath(splat) {
  if (!splat) {
    return [];
  }

  return splat.split('/').map(parsePathSegment);
}

class HomeView extends Component {
  state = { loading: true, views: [], searchTerm: '', results: null };

  componentDidMount() {
    if (this.props.routeParams.splat) {
      this.updateViews();
    }

    getAllDefinitions().then(defs => {
      this.setState({ loading: false });
      this.props.setBulkDefinitions(defs);
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
  }

  onSearchChange = ev => {
    const searchTerm = ev.target.value;
    const comparableSearchTerm = searchTerm && searchTerm.toLowerCase();
    let results = [];

    if (searchTerm.length > 2) {
      const allDefs = makeAllDefsArray(this.props.definitions);
      results = allDefs
        .filter(obj => {
          const comparableName = getComparableName(obj.def);
          return (
            obj.key === searchTerm ||
            obj.type.toLowerCase().includes(comparableSearchTerm) ||
            (comparableName && comparableName.includes(comparableSearchTerm))
          );
        })
        .slice(0, 150);
    }

    this.setState({ searchTerm, results });
  };

  pathForItem = (type, item) => {
    let url = '';
    const shortType = makeTypeShort(type);

    if (this.props.routeParams.splat) {
      url = `${this.props.location.pathname}/${shortType}:${item.hash}`;
    } else {
      url = `/i/${shortType}:${item.hash}`;
    }

    return url;
  };

  popView = () => {
    const newViews = [...this.state.views];
    newViews.pop();

    const newPath =
      newViews.length === 0
        ? '/'
        : '/i/' +
          newViews.map(view => `${view.shortType}:${view.hash}`).join('/');

    this.props.router.push(newPath);
  };

  lookupLinkedItem = (keyPath, hash) => {
    const [fieldName, parentFieldName] = keyPath;

    const { type: definitionType, shortType } =
      lookup.find(data => data.fields.includes(fieldName)) ||
      lookup.find(data => data.fields.includes(parentFieldName)) ||
      {};

    const defs = this.props.definitions[definitionType];

    if (!defs) {
      return null;
    }

    const item = defs[hash];
    return { definitionType: shortType, item };
  };

  render() {
    const { loading, views, searchTerm, results } = this.state;
    let items = results || [];

    if (items.length < 1) {
      items = getRandomItems(this.props.definitions);
    }

    return (
      <div className={s.root}>
        <SearchHeader
          onSearchChange={this.onSearchChange}
          searchValue={searchTerm}
        />

        <div className={s.body}>
          {loading && <h1>Loading...</h1>}

          <div className={s.items}>
            {items.map(obj => (
              <Item
                key={`${obj.type}:${obj.key}`}
                className={s.item}
                item={obj.def}
                type={obj.type}
                pathForItem={this.pathForItem}
              />
            ))}
          </div>
        </div>

        <ReactCSSTransitionGroup
          transitionName="global-dataview-animation"
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          {views.map(
            ({ type, hash }, index) =>
              this.props.definitions[type] && (
                <div key={`${type}:${hash}`}>
                  <DataView
                    depth={index + 1}
                    className={s.dataView}
                    item={this.props.definitions[type][hash]}
                    type={type}
                    onRequestClose={this.popView}
                    lookupLinkedItem={this.lookupLinkedItem}
                    pathForItem={this.pathForItem}
                  />
                </div>
              )
          )}
        </ReactCSSTransitionGroup>
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
