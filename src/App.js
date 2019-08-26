import React from "react";
import styles from "./App.module.scss";

import otherStylesheet from "./other.module.scss";

function App() {
  return (
    <div className="App">
      <div className={styles.header}>
        <div className={styles.logo}>My site</div>
        <input className={styles.input} />
        <button className={styles.button}>button</button>
      </div>

      <button className={otherStylesheet.bigButton}>button</button>
    </div>
  );
}

export default App;
