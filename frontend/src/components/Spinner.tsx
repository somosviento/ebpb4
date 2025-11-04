export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid #999',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        verticalAlign: 'middle'
      }}
    />
  )
}

// Nota: la animación keyframes puede inyectarse global con un pequeño style en main o inline cuando se usa.