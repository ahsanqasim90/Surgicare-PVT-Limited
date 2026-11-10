export default function Brand({ dark = false }) {
  return (
    <div className={`brand ${dark ? 'brand-dark' : ''}`}>
      <span className="brand-mark"><img src="/images/brand/surgicare-logo.png" alt="" /></span>
      <span>SURGICARE</span>
    </div>
  );
}
