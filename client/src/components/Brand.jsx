import { Cross } from 'lucide-react';

export default function Brand({ dark = false }) {
  return (
    <div className={`brand ${dark ? 'brand-dark' : ''}`}>
      <span className="brand-mark"><Cross size={16} strokeWidth={3} /></span>
      <span>SURGICARE</span>
    </div>
  );
}
