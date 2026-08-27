import React, { useEffect, useState } from 'react'
import { getShopItems, purchaseItem, getInventory } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

type ShopItem = { id: number; name: string; description: string; icon: string; cost_xp: number; effect_type: string; category: string }
type InventoryItem = { id: number; item_id: number; name: string; icon: string; quantity: number; description: string; effect_type: string }

const CATEGORIES = ['All', 'hints', 'utility', 'boosts', 'cosmetics']
const CAT_LABELS: Record<string, string> = { All: 'All Items', hints: 'Hints & Intel', utility: 'Utilities', boosts: 'XP Boosts', cosmetics: 'Cosmetics' }

export default function Shop() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState<ShopItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null)

  const xp = user?.xp ?? 0

  useEffect(() => {
    Promise.all([getShopItems(), getInventory()])
      .then(([i, inv]) => { setItems(i); setInventory(inv) })
      .finally(() => setLoading(false))
  }, [])

  async function handlePurchase(item: ShopItem) {
    setConfirmItem(null)
    setPurchasing(item.id)
    try {
      const res = await purchaseItem(item.id)
      showToast(res.message || ('Purchased ' + item.name + '!'), 'success')
      await refreshUser()
      const inv = await getInventory()
      setInventory(inv)
    } catch (e: any) {
      showToast(e.message || 'Purchase failed', 'error')
    } finally {
      setPurchasing(null)
    }
  }

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory)

  const ownedQuantity = (itemId: number) => {
    const inv = inventory.find(i => i.item_id === itemId)
    return inv?.quantity ?? 0
  }

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div className="skeleton" style={{ height: 40, width: 220, marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Confirm modal */}
      {confirmItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }} onClick={() => setConfirmItem(null)}>
          <div style={{
            background: 'var(--c-abyss)', border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-lg)', padding: '2rem', maxWidth: 380, width: '100%',
            textAlign: 'center', animation: 'scaleIn 250ms ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{confirmItem.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem' }}>
              {confirmItem.name}
            </h3>
            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {confirmItem.description}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 1rem', background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--r-full)',
              fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-amber)',
              marginBottom: '1.5rem',
            }}>
              ⚡ {confirmItem.cost_xp} XP
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => handlePurchase(confirmItem)} className="btn btn-primary">
                Confirm Purchase
              </button>
              <button onClick={() => setConfirmItem(null)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--c-amber)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏪</span> Detective Supply Shop
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
            Spend Your XP
          </h2>
          <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginTop: '0.3rem' }}>
            Use XP earned from solving cases to unlock tools, hints, and cosmetics.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 'var(--r-md)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--c-amber)' }}>
              {xp.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', color: 'var(--c-text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              XP Balance
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '0.35rem 0.9rem',
            background: activeCategory === cat ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (activeCategory === cat ? 'rgba(251,191,36,0.3)' : 'var(--c-border)'),
            borderRadius: 'var(--r-full)',
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
            color: activeCategory === cat ? 'var(--c-amber)' : 'var(--c-text-muted)',
            cursor: 'pointer', transition: 'all 200ms ease',
          }}>
            {CAT_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {filtered.map((item, i) => {
          const owned = ownedQuantity(item.id)
          const canAfford = xp >= item.cost_xp
          const isBuying = purchasing === item.id
          return (
            <div key={item.id} style={{
              background: 'var(--c-shadow)', border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-lg)', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              transition: 'all 200ms ease',
              opacity: 0, animation: 'slideInUp 350ms ease ' + (i * 50) + 'ms forwards',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              {owned > 0 && (
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 'var(--r-sm)', padding: '0.15rem 0.4rem',
                  fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700,
                  color: 'var(--c-success)',
                }}>×{owned} owned</div>
              )}
              <div style={{ fontSize: '2.25rem', lineHeight: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', marginBottom: '0.3rem' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
                  {item.description}
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                  color: canAfford ? 'var(--c-amber)' : 'var(--c-error)',
                }}>
                  ⚡ {item.cost_xp} XP
                </span>
                <button
                  onClick={() => setConfirmItem(item)}
                  disabled={!canAfford || isBuying}
                  className={'btn btn-sm ' + (canAfford ? 'btn-primary' : 'btn-ghost')}
                  style={{ opacity: canAfford ? 1 : 0.5 }}
                >
                  {isBuying ? '...' : 'Buy'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inventory */}
      {inventory.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-amber)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎒</span> My Inventory
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {inventory.map(inv => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 0.9rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
              }}>
                <span style={{ fontSize: '1.25rem' }}>{inv.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text)' }}>{inv.name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', color: 'var(--c-success)' }}>×{inv.quantity} available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
