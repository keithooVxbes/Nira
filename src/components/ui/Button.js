import styles from './Button.module.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  icon = false,
  className = '',
  ...props 
}) {
  const baseClass = icon ? styles.iconBtn : styles.btn;
  const variantClass = styles[variant] || styles.primary;
  
  return (
    <button 
      type={props.type || "button"}
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
