import styles from './Header.module.css';

export default function Header({ 
  title, 
  subtitle, 
  actions,
  titleClassName,
  className
}) {
  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.titleSection}>
        <h1 className={`${styles.title} ${titleClassName || ''}`}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {actions && (
        <div className={styles.actionsSection}>
          {actions}
        </div>
      )}
    </header>
  );
}
