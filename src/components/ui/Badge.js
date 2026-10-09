import styles from './Badge.module.css';

export default function Badge({ 
  children, 
  variant = 'pill',
  active = false,
  className = '',
  ...props 
}) {
  const variantClass = styles[variant] || styles.pill;
  const activeClass = active ? styles.active : '';
  
  return (
    <span className={`${variantClass} ${activeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
