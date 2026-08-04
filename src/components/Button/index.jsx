import React from 'react';
import styles from './index.less';

const Button = (props) => {
    const { children } = props;
    return (
        <div className={styles.btnStyle}>
            {children}
        </div>
    )
}

export default Button;