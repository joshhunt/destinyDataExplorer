import React, { Component, Suspense } from "react";
import { connect } from "react-redux";
import { isString } from "lodash";
import cx from "classnames";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import {
  toggleCollectMode,
  toggleFilterDrawer,
  addCollectedItem,
  removeCollectedItem,
  fetchBungieSettings,
} from "store/app";
import { setBulkDefinitions } from "store/definitions";
import { setFilterString, setFilterValue } from "store/filter";
import { makeTypeShort, getRandomItems } from "lib/destinyUtils";

import DataViewsOverlay from "components/DataViewsOverlay";
import Loading from "components/Loading";
import CollectDrawer from "components/Collect";
import SearchHeader from "components/SearchHeader";
import Item from "components/Item";

import { filteredItemsSelector } from "./selectors";
import s from "./styles.module.scss";
import { Provider as PathForDefinitionProvider } from "lib/pathForDefinitionContext";
import ComponentLoading from "components/ComponentLoading";

const OldDataView = React.lazy(() => import("components/OldDataView"));

function getSplat(params) {
  return params[0];
}

function parsePathSegment(segment) {
  const [type, hash] = segment.split(":");
  return { type: `Destiny${type}Definition`, shortType: type, hash };
}

function parseSplatParam(params) {
  const splat = getSplat(params);

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
    results: null,
  };

  componentDidMount() {
    if (getSplat(this.props.match.params)) {
      this.updateViews();
    }

    this.props.fetchBungieSettings();
  }

  componentDidUpdate(prevProps) {
    if (
      getSplat(this.props.match.params) !== getSplat(prevProps.match.params)
    ) {
      this.updateViews();
    }
  }

  updateViews() {
    const segments = parseSplatParam(this.props.match.params);
    this.setState({ views: segments });
  }

  onSearchChange = (ev) => {
    const searchTerm = isString(ev) ? ev : ev.target.value;
    this.props.setFilterString(searchTerm);
  };

  displayAllResults = () => {
    this.setState({ displayAllResults: true });
  };

  pathForItem = (type, definition) => {
    // TODO: some places in the code pass through a definition item directly rather than one of our
    // 'obj' wrappers
    let url = "";
    const shortType = makeTypeShort(type);
    const key = definition.hash ?? definition.statId; // TODO: check medals

    if (getSplat(this.props.match.params)) {
      url = `${this.props.location.pathname}/${shortType}:${key}`;
    } else {
      url = `/i/${shortType}:${key}`;
    }

    return url + (this.props.location.search ?? "");
  };

  popView = () => {
    const newViews = [...this.state.views];
    newViews.pop();

    const newPath =
      newViews.length === 0
        ? "/"
        : "/i/" +
          newViews.map((view) => `${view.shortType}:${view.hash}`).join("/");

    const newUrl = newPath + (this.props.location.search ?? "");

    this.props.history.push(newUrl);
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
      searchIsReady,
    } = this.props;

    const { views } = this.state;
    const useOldDataView = this.props.location.search.includes("old");

    let items = filterResults.results || [];

    if (filterResults.allResults && this.state.displayAllResults) {
      items = filterResults.allResults;
    } else if (items.length < 1 && !filterResults.noResults) {
      items = getRandomItems(this.props.definitions);
    }

    return (
      <PathForDefinitionProvider value={this.pathForItem}>
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
                {items.map((obj) => {
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

          {!useOldDataView ? (
            <DataViewsOverlay
              items={views}
              linkedDefinitionUrl={(item) =>
                this.pathForItem(item.type, { hash: item.hash })
              }
              requestPopOverlay={this.popView}
            />
          ) : (
            <TransitionGroup>
              {views.map(
                ({ type, hash }, index) =>
                  this.props.definitions &&
                  this.props.definitions[type] && (
                    <CSSTransition
                      key={index}
                      classNames="global-dataview-animation"
                      timeout={{ enter: 200, exit: 200 }}
                    >
                      <Suspense fallback={<ComponentLoading />}>
                        <OldDataView
                          definitions={definitions}
                          depth={index + 1}
                          className={s.dataView}
                          item={this.props.definitions[type][hash]}
                          type={type}
                          onRequestClose={this.popView}
                          pathForItem={this.pathForItem}
                        />
                      </Suspense>
                    </CSSTransition>
                  )
              )}
            </TransitionGroup>
          )}
        </div>
      </PathForDefinitionProvider>
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
    searchIsReady: state.app.searchIsReady,
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
  fetchBungieSettings,
};

export default connect(mapStateToProps, mapDispatchToActions)(HomeView);
