import React, { Component } from 'react';

import copy from 'src/lib/copyToClipboard';
import sortIntoSections from 'src/lib/sortIntoSections';
import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

const hasDefs = defs => defs && Object.keys(defs).length > 0;

export default class CollectDrawer extends Component {
  componentDidUpdate() {
    const { definitions, items } = this.props;
    if (!hasDefs(definitions)) {
      return;
    }

    const objToCopy = sortIntoSections(items, definitions, true);

    let jason = JSON.stringify(objToCopy, null, 2);

    (jason.match(/(\d{5,})(,?)/g) || []).forEach(match => {
      const hash = +match.match(/\d+/)[0];
      const item = definitions.DestinyInventoryItemDefinition[hash];
      const newline = match + ' // ' + item.displayProperties.name;
      jason = jason.replace(match, newline);
    });

    copy(jason);
  }

  render() {
    const { definitions, items } = this.props;

    if (!hasDefs(definitions)) {
      return null;
    }

    const sections = sortIntoSections(items, definitions);

    return (
      <div className={s.root}>
        <h3 className={s.heading}>Collected items</h3>

        {Object.keys(items).length === 0 && (
          <p className={s.info}>
            <em>Click an item to add to the collection.</em>
          </p>
        )}

        {sections.map(section => {
          return (
            <div key={section.name} className={s.section}>
              <h4 className={s.sectionTitle}>{section.name}</h4>
              <div>
                {section.items.map(entry => {
                  const def = definitions[entry.type][entry.key];

                  return (
                    <div className={s.item} key={entry.dxId}>
                      <BungieImage
                        className={s.image}
                        src={def.displayProperties.icon}
                      />
                      <span>{def.displayProperties.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className={s.info}>
          <em>
            As you add items, the collection will automatically be copied to
            your clipboard
          </em>
        </p>
      </div>
    );
  }
}
