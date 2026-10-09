import styles from './Card.module.css';

export default function Card({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const variantClass = styles[variant] || styles.default;
  
  return (
    <div className={`${styles.card} ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
