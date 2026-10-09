import styles from './Input.module.css';

export default function Input({ 
  className = '',
  type = 'text',
  ...props 
}) {
  return (
    <input 
      type={type}
      className={`${styles.input} ${className}`} 
      {...props}
    />
  );
}
