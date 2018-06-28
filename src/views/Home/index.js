import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { setBulkDefinitions } from 'src/store/definitions';
import { getAllDefinitions } from 'src/lib/definitions';
import { makeTypeShort, getRandomItems } from 'src/lib/destinyUtils';
import search from 'src/lib/search';

import SearchHeader from 'src/components/SearchHeader';
import DataView from 'src/components/DataView';
import Item from 'src/components/Item';

import lookup from './lookup';
import s from './styles.styl';

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
    const MAX_RESULTS = 150;
    const searchTerm = ev.target.value;

    const newState = {
      searchTerm,
      results: [],
      moreResults: false,
      noResults: false,
      totalResults: 0
    };

    if (!searchTerm || searchTerm.length === 0) {
      this.setState(newState);
      return;
    }

    const results = search(searchTerm, this.props.definitions);
    newState.results = results;
    newState.totalResults = results.length;

    if (results.length > MAX_RESULTS) {
      newState.moreResults = true;
      newState.results = results.slice(0, MAX_RESULTS);
    } else if (results.length === 0) {
      newState.noResults = true;
    }

    this.setState(newState);
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
    const {
      loading,
      views,
      searchTerm,
      results,
      moreResults,
      noResults,
      totalResults
    } = this.state;

    let items = results || [];

    if (items.length < 1 && !noResults) {
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
          {noResults && <h2>No results</h2>}

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

          {moreResults && (
            <h2>
              {totalResults - results.length} more results hidden for
              performance.
            </h2>
          )}
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
