import React, { Component } from "react";
import { connect } from "react-redux";
import { isString } from "lodash";
import cx from "classnames";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import {
  toggleCollectMode,
  toggleFilterDrawer,
  addCollectedItem,
  removeCollectedItem,
  fetchBungieSettings
} from "store/app";
import { setBulkDefinitions } from "store/definitions";
import { setFilterString, setFilterValue } from "store/filter";
import { makeTypeShort, getRandomItems } from "lib/destinyUtils";

import Loading from "components/Loading";
import CollectDrawer from "components/Collect";
import SearchHeader from "components/SearchHeader";
import DataView from "components/DataView";
import Item from "components/Item";

import { filteredItemsSelector } from "./selectors";
import s from "./styles.module.scss";

function parsePathSegment(segment) {
  const [type, hash] = segment.split(":");
  return { type: `Destiny${type}Definition`, shortType: type, hash };
}

function parsePath(splat) {
  if (!splat) {
    return [];
  }

  return splat.split("/").map(parsePathSegment);
}

class HomeView extends Component {
  state = {
    loading: true,
    updating: false,
    views: [],
    searchTerm: "",
    results: null
  };

  componentDidMount() {
    if (this.props.routeParams.splat) {
      this.updateViews();
    }

    this.props.fetchBungieSettings();
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
    const searchTerm = isString(ev) ? ev : ev.target.value;
    this.props.setFilterString(searchTerm);
  };

  displayAllResults = () => {
    this.setState({ displayAllResults: true });
  };

  pathForItem = (type, obj) => {
    // TODO: some places in the code pass through a definition item directly rather than one of our
    // 'obj' wrappers
    let url = "";
    const shortType = makeTypeShort(type);
    const key = obj.def ? obj.key : obj.hash;

    if (this.props.routeParams.splat) {
      url = `${this.props.location.pathname}/${shortType}:${key}`;
    } else {
      url = `/i/${shortType}:${key}`;
    }

    return url;
  };

  popView = () => {
    const newViews = [...this.state.views];
    newViews.pop();

    const newPath =
      newViews.length === 0
        ? "/"
        : "/i/" +
          newViews.map(view => `${view.shortType}:${view.hash}`).join("/");

    this.props.router.push(newPath);
  };

  onItemClick = (ev, entry) => {
    if (this.props.collectModeEnabled) {
      ev.preventDefault();

      if (entry.type !== "DestinyInventoryItemDefinition") {
        return;
      }

      const entryToAdd = { ...entry, def: undefined };

      if (this.props.collectedItems[entry.dxId]) {
        this.props.removeCollectedItem(entryToAdd);
      } else {
        this.props.addCollectedItem(entryToAdd);
      }
    }
  };

  render() {
    const {
      collectModeEnabled,
      filterDrawerVisible,
      toggleCollectMode,
      toggleFilterDrawer,
      collectedItems,
      definitions,
      definitionsError,
      definitionsStatus,
      filterResults,
      searchIsReady
    } = this.props;

    const { views } = this.state;

    let items = filterResults.results || [];

    if (filterResults.allResults && this.state.displayAllResults) {
      items = filterResults.allResults;
    } else if (items.length < 1 && !filterResults.noResults) {
      items = getRandomItems(this.props.definitions);
    }

    return (
      <div className={s.root}>
        <SearchHeader
          searchIsReady={searchIsReady}
          setFilterValue={this.props.setFilterValue}
          onSearchChange={this.onSearchChange}
          toggleCollectMode={toggleCollectMode}
          collectModeEnabled={collectModeEnabled}
          filterDrawerVisible={filterDrawerVisible}
          toggleFilterDrawer={toggleFilterDrawer}
        />

        <div className={s.body}>
          <div
            className={cx(s.main, collectModeEnabled && s.collectDrawerOpen)}
          >
            {definitionsStatus && (
              <Loading children={"Downloading new data from Bungie..."} />
            )}

            {definitionsError && false && (
              <Loading noSpin children="Error loading manifest" />
            )}

            {filterResults.noResults && <h2>No results</h2>}

            <div className={s.items}>
              {items.map(obj => {
                return (
                  <Item
                    key={obj.dxId}
                    entry={obj}
                    className={s.item}
                    pathForItem={this.pathForItem}
                    onClick={this.onItemClick}
                    isCollected={collectedItems[obj.dxId]}
                  />
                );
              })}
            </div>

            {filterResults.results &&
              filterResults.allResults &&
              items !== filterResults.allResults && (
                <div className={s.moreResultsWrap}>
                  <div className={s.moreResults}>
                    {filterResults.allResults.length -
                      filterResults.results.length}{" "}
                    more results hidden for performance.{" "}
                    <button
                      onClick={this.displayAllResults}
                      className={s.moreResultsButton}
                    >
                      Display all anyway
                    </button>
                  </div>
                </div>
              )}
          </div>

          {collectModeEnabled && (
            <div className={s.side}>
              <div className={s.collectDrawer}>
                <div className={s.collectDrawerInner}>
                  <CollectDrawer
                    items={collectedItems}
                    definitions={definitions}
                    removeItem={this.props.removeCollectedItem}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <ReactCSSTransitionGroup
          transitionName="global-dataview-animation"
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          {views.map(
            ({ type, hash }, index) =>
              this.props.definitions &&
              this.props.definitions[type] && (
                <div key={index}>
                  <DataView
                    definitions={definitions}
                    depth={index + 1}
                    className={s.dataView}
                    item={this.props.definitions[type][hash]}
                    type={type}
                    onRequestClose={this.popView}
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
    filterResults: filteredItemsSelector(state),
    filter: state.filter,
    definitionsError: state.definitions.error,
    definitionsStatus: state.definitions.status,
    definitions: state.definitions.definitions,
    collectModeEnabled: state.app.collectModeEnabled,
    filterDrawerVisible: state.app.filterDrawerVisible,
    collectedItems: state.app.collectedItems,
    searchIsReady: state.app.searchIsReady
  };
}

const mapDispatchToActions = {
  setFilterString,
  setFilterValue,
  setBulkDefinitions,
  toggleCollectMode,
  toggleFilterDrawer,
  addCollectedItem,
  removeCollectedItem,
  fetchBungieSettings
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(HomeView);
