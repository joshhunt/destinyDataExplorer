import React, { Component } from 'react';
import { connect } from 'react-redux';
import { format } from 'date-fns';

import { get } from 'src/lib/destiny';

import { makeTypeShort } from 'src/lib/destinyUtils';

import Item from 'src/components/Item';

import s from './styles.styl';

const DATE_FORMAT = 'ddd do MMM, YYYY - h:mm a';
const LATEST = '$LATEST';

class DefinitionDiff extends Component {
  state = { version: LATEST, versions: [], diffs: {} };

  componentDidMount() {
    get('https://destiny.plumbing/history.json').then(data => {
      this.setState({
        versions: data.sort(
          (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
        )
      });
    });

    this.getAllDiffs(this.state.version);
  }

  onVersionChange = ev => {
    this.setState({ version: ev.target.value, currentTable: null }, () => {
      this.getAllDiffs(this.state.version);
    });
  };

  getDiffForTable(table, version = LATEST) {
    const versionKey = version === LATEST ? '' : `versions/${version}/`;
    const url = `https://destiny.plumbing/${versionKey}en/diff/${table}/friendly.json`;

    get(url)
      .then(data => {
        this.setState(state => {
          const newDiffs = { ...state.diffs };
          if (!newDiffs[version]) {
            newDiffs[version] = {};
          }

          newDiffs[version][table] = data;

          return { diffs: newDiffs };
        });
      })
      .catch(err =>
        this.setState({
          error: err.message || (err.toString && err.toString())
        })
      );
  }

  getAllDiffs(version = LATEST) {
    DEFINITION_TABLES.forEach(table => {
      this.getDiffForTable(table, version);
    });
  }

  setCurrentTable = table => {
    this.setState({ currentTable: table });
  };

  pathForItem = (type, obj) => {
    // TODO: some places in the code pass through a definition item directly rather than one of our
    // 'obj' wrappers
    let url = '';
    const shortType = makeTypeShort(type);
    const key = obj.def ? obj.key : obj.hash;

    url = `/i/${shortType}:${key}`;

    return url;
  };

  render() {
    const { definitions } = this.props;
    const { versions, diffs, version, currentTable } = this.state;
    const diffsForVersion = diffs[version] || {};
    const currentTableDefs = definitions[currentTable] || {};

    return (
      <div className={s.root}>
        <div className={s.top}>
          <h1 className={s.title}>Diffs</h1>
          <select className={s.versionSelect} onChange={this.onVersionChange}>
            <option value={LATEST}>Current</option>
            {versions.map(v => (
              <option key={v.id} value={v.id}>
                {format(v.lastUpdated, DATE_FORMAT)}
              </option>
            ))}
          </select>

          <h3>Version: {version}</h3>
        </div>

        <div className={s.split}>
          <div className={s.definitionTables}>
            <table>
              <thead>
                <tr>
                  <td>Table</td>
                  <td>New</td>
                  <td>Unclassified</td>
                </tr>
              </thead>

              <tbody>
                {Object.entries(diffsForVersion)
                  .sort((a, b) => {
                    const countA = a[1].new.length + a[1].unclassified.length;
                    const countB = b[1].new.length + b[1].unclassified.length;
                    return countB - countA;
                  })
                  .map(([tableName, diff]) => (
                    <tr
                      key={tableName}
                      style={{
                        opacity:
                          diff.new.length + diff.unclassified.length === 0
                            ? 0.5
                            : 1
                      }}
                    >
                      <td>
                        <span
                          className={s.clickable}
                          onClick={() => this.setCurrentTable(tableName)}
                          style={{
                            textDecoration:
                              tableName === currentTable && 'underline',
                            color: tableName === currentTable && '#f1c40f'
                          }}
                        >
                          {tableName}
                        </span>
                      </td>
                      <td>
                        <span className={s.new}>{diff.new.length}</span>
                      </td>
                      <td>
                        <span className={s.unclassified}>
                          {diff.unclassified.length}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {currentTable && (
            <div className={s.currentTable}>
              <h3>New</h3>
              <div className={s.items}>
                {diffsForVersion[currentTable].new.map(hash => (
                  <Item
                    className={s.item}
                    pathForItem={this.pathForItem}
                    key={hash}
                    entry={{
                      def: currentTableDefs[hash],
                      type: currentTable,
                      key: hash,
                      dxId: `${currentTable}:${hash}`
                    }}
                  />
                ))}
              </div>

              <h3>Unclassified</h3>
              <div className={s.items}>
                {diffsForVersion[currentTable].unclassified.map(hash => (
                  <Item
                    className={s.item}
                    pathForItem={this.pathForItem}
                    key={hash}
                    entry={{
                      def: currentTableDefs[hash],
                      type: currentTable,
                      key: hash,
                      dxId: `${currentTable}:${hash}`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
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

export default connect(mapStateToProps)(DefinitionDiff);

const DEFINITION_TABLES = [
  'DestinyEnemyRaceDefinition',
  'DestinyPlaceDefinition',
  'DestinyActivityDefinition',
  'DestinyActivityTypeDefinition',
  'DestinyClassDefinition',
  'DestinyGenderDefinition',
  'DestinyInventoryBucketDefinition',
  'DestinyRaceDefinition',
  'DestinyTalentGridDefinition',
  'DestinyUnlockDefinition',
  'DestinyMaterialRequirementSetDefinition',
  'DestinySandboxPerkDefinition',
  'DestinyStatGroupDefinition',
  'DestinyFactionDefinition',
  'DestinyVendorGroupDefinition',
  'DestinyItemCategoryDefinition',
  'DestinyDamageTypeDefinition',
  'DestinyActivityModeDefinition',
  'DestinyMedalTierDefinition',
  'DestinyAchievementDefinition',
  'DestinyActivityGraphDefinition',
  'DestinyCollectibleDefinition',
  'DestinyStatDefinition',
  'DestinyItemTierTypeDefinition',
  'DestinyPresentationNodeDefinition',
  'DestinyRecordDefinition',
  'DestinyBondDefinition',
  'DestinyDestinationDefinition',
  'DestinyEquipmentSlotDefinition',
  'DestinyInventoryItemDefinition',
  'DestinyLocationDefinition',
  'DestinyLoreDefinition',
  'DestinyObjectiveDefinition',
  'DestinyProgressionDefinition',
  'DestinyProgressionLevelRequirementDefinition',
  'DestinySackRewardItemListDefinition',
  'DestinySandboxPatternDefinition',
  'DestinySocketCategoryDefinition',
  'DestinySocketTypeDefinition',
  'DestinyVendorDefinition',
  'DestinyMilestoneDefinition',
  'DestinyActivityModifierDefinition',
  'DestinyReportReasonCategoryDefinition',
  'DestinyPlugSetDefinition',
  'DestinyChecklistDefinition',
  'DestinyHistoricalStatsDefinition'
];
