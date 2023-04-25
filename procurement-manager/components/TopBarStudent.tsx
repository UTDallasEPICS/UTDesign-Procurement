import React from 'react';
import styles from './TopBarComponent.module.css';
import Link from 'next/link';

const TopBarStudent: React.FC = () => {
  return (
    <div className={styles.topBar}>
      <div className={styles.headerSection}>
        <h1>UTD Procurement Manager</h1>
        <Link href="/login">
          <span className={styles.logout}>Log Out</span>
        </Link>
      </div>
      <div className={styles.menuSection}>
        <nav className={styles.navigation}>
          <a className={styles.navigationLink} href="#orders">
            ORDERS
          </a>
          <a className={styles.navigationLink} href="#order-history">
            ORDER HISTORY
          </a>
          <a className={styles.navigationLink} href="#request-form">
            REQUEST FORM
          </a>
          <a className={styles.navigationLink} href="#reimbursement-form">
            REIMBURSEMENT FORM
          </a>
        </nav>
      </div>
    </div>
  );
};

export default TopBarStudent;