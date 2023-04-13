// TopBarComponent.tsx
import React from 'react';
import styles from './TopBarComponent.module.css';

const TopBarComponent: React.FC = () => {
  return (
    <div className={styles.topBar}>
      <div className={styles.headerSection}>
        <h1>UTD Procurement Manager</h1>
      </div>
      <div className={styles.menuSection}>
        <nav className={styles.navigation}>
          <a className={styles.navigationLink} href="#orders">
            ORDERS
          </a>
          <a className={styles.navigationLink} href="#order-history">
            ORDER HISTORY
          </a>
          <a className={styles.navigationLink} href="#project-updates">
            PROJECT UPDATES
          </a>
        </nav>
      </div>
    </div>
  );
};

export default TopBarComponent;
